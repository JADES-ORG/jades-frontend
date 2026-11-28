import { Paginacion } from '../../components/shared/Paginacion';
import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  ChevronDown,
} from 'lucide-react';
import { consultarCreditoDisponible } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import { DetalleCorteModal, type CorteItemData } from '../../components/store-admin/DetalleCorteModal';
import { EstadoBadge } from '../../components/store-admin/EstadoBadge';
import { ModalShell, cuerpoModal } from '../../components/store-admin/ModalShell';
import type { LiquidacionResponse, Moneda, PagoResponse } from '../../types/finanzas';
import type { CreditoDisponibleResponse } from '../../types/clientes';
import { RegistrarPagoModal } from '../../components/store-admin/RegistrarPagoModal';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import { historialDeCuenta, obligacionesPendientes, proximosSieteDias, useCuentasTienda, type ObligacionCobro } from '../../features/cobranzas/cuentas';

interface StorePagosPageProps {
  idTienda: number;
  revision: number;
  onPagoRegistrado: () => void;
}

export const StorePagosPage: React.FC<StorePagosPageProps> = ({
  idTienda,
  revision,
  onPagoRegistrado,
}) => {
  const { cuentas, cargando, error, recargar } = useCuentasTienda(idTienda, revision);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [seleccionada, setSeleccionada] = useState<ObligacionCobro | null>(null);
  const [moneda, setMoneda] = useState<Moneda>('PEN');
  const [vista, setVista] = useState<'pendientes' | 'programadas' | 'historial'>('pendientes');
  const [detalle, setDetalle] = useState<CorteItemData | null>(null);
  const [confirmacion, setConfirmacion] = useState<{ operacion: PagoResponse | LiquidacionResponse; medio: string; idCliente: number; referencia: string } | null>(null);
  const [credito, setCredito] = useState<CreditoDisponibleResponse | null>(null);
  const [errorCredito, setErrorCredito] = useState('');
  async function consultarSaldo(idCliente: number) {
    setErrorCredito('');
    try {
      setCredito(await consultarCreditoDisponible(idTienda, idCliente));
    } catch (causa) {
      setErrorCredito(obtenerMensajeError(causa));
    }
  }
  const [pagina, setPagina] = useState(1);
  const pagos = cargando || error ? [] : obligacionesPendientes(cuentas).filter(pago => pago.moneda === moneda);
  const hoy = hoyLima();
  const indicadores = [
    { titulo: 'Exigible hoy', icono: Clock, filas: pagos.filter(p => p.estado === 'Pendiente' && p.fechaVencimiento === hoy) },
    { titulo: 'En mora', icono: AlertTriangle, filas: pagos.filter(p => p.estado === 'En mora') },
    { titulo: 'Próximos 7 días', icono: Calendar, filas: pagos.filter(p => p.estado === 'Por vencer' && proximosSieteDias(p.fechaVencimiento, hoy)) },
  ];

  const filteredPagos = pagos.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch =
      item.cliente.toLowerCase().includes(term) ||
      item.obligacion.toLowerCase().includes(term);

    const pertenece = vista === 'programadas' ? item.programada : !item.programada;
    return pertenece && matchSearch && (estadoFilter === 'TODOS' || item.estado === estadoFilter);
  });

  const historial = cuentas.flatMap(historialDeCuenta)
    .filter(pago => pago.moneda === moneda && `${pago.cliente} ${pago.obligacion}`.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => b.fechaPagoEfectivo.localeCompare(a.fechaPagoEfectivo));
  const esHistorial = vista === 'historial';
  const total = esHistorial ? historial.length : filteredPagos.length;
  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(total / 10)));
  const visibles = filteredPagos.slice((paginaActual - 1) * 10, paginaActual * 10);

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pagos
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Obligaciones exigibles y próximas de tus clientes.
        </p>
      </div>


      {cargando && <p role="status" className="text-sm text-slate-600">Cargando obligaciones…</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error} <button onClick={recargar} className="font-semibold underline">Reintentar</button></p>}
      {!cargando && !error && <div className="grid gap-4 md:grid-cols-3">
        {indicadores.map(({ titulo, icono: Icono, filas }) => (
          <div key={titulo} className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{titulo}</p>
              <p className="text-2xl font-bold text-slate-900">{dinero(filas.reduce((suma, fila) => suma + fila.importePendiente, 0), moneda)}</p>
              <p className="text-sm text-slate-600">{filas.length} obligaciones</p>
            </div>
            <Icono aria-hidden="true" className="size-5 text-[#139a6c]" />
          </div>
        ))}
      </div>}

      {/* Contenedor de Tabla con Buscador y Filtro */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-wrap gap-2" aria-label="Vista de pagos">
            {([['pendientes', 'Obligaciones pendientes'], ['programadas', 'Obligaciones programadas'], ['historial', 'Historial de pagos']] as const).map(([valor, etiqueta]) => (
              <button key={valor} type="button" aria-pressed={vista === valor} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm aria-pressed:border-emerald-700 aria-pressed:bg-emerald-50" onClick={() => { setVista(valor); setEstadoFilter('TODOS'); setPagina(1); }}>{etiqueta}</button>
            ))}
          </div>
          <select aria-label="Moneda" value={moneda} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm" onChange={e => { setMoneda(e.target.value as Moneda); setPagina(1); }}>
            <option value="PEN">Soles (PEN)</option><option value="USD">Dólares (USD)</option>
          </select>
        </div>
        {/* Buscador y Dropdown */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente u obligación"
              value={searchTerm}
              aria-label="Buscar cliente u obligación"
              onChange={(e) => { setSearchTerm(e.target.value); setPagina(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl min-h-11 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
            />
          </div>

          {!esHistorial && <div className="relative w-full sm:w-auto">
            <select
              value={estadoFilter}
              aria-label="Estado de la obligación"
              onChange={(e) => { setEstadoFilter(e.target.value); setPagina(1); }}
              className="w-full sm:w-48 appearance-none px-3.5 py-2 pr-9 bg-white border border-slate-200 rounded-xl min-h-11 text-sm text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En mora">En mora</option>
              <option value="Por vencer">Por vencer</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-6">CLIENTE / OBLIGACIÓN</th>
                <th className="py-3 px-4">{esHistorial ? 'PAGO EFECTIVO' : 'VENCE'}</th>
                <th className="py-3 px-4">CAPITAL</th>
                <th className="py-3 px-4">INTERÉS COMPENSATORIO</th>
                <th className="py-3 px-4">MORA</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {esHistorial && historial.slice((paginaActual - 1) * 10, paginaActual * 10).map(pago => (
                <tr key={pago.id}>
                  <td className="px-6 py-4"><strong className="block">{pago.cliente}</strong>{pago.obligacion}</td>
                  <td className="px-4 py-4">{fecha(pago.fechaPagoEfectivo)} {pago.fechaPagoEfectivo.split('T')[1]}<span className="block text-slate-600">Pactado {fecha(pago.fechaPago)} · {pago.medioPago} · Mora {pago.diasAtraso} d</span></td>
                  {[pago.capital, pago.interesCompensatorio, pago.mora, pago.totalPagar].map((importe, indice) => <td className="px-4 py-4" key={indice}>{dinero(importe, pago.moneda)}</td>)}
                  <td className="px-4 py-4"><EstadoBadge estado="Pagado" /></td>
                  <td className="px-6 py-4 text-right"><button type="button" className="min-h-11 rounded-lg border border-slate-200 px-3" onClick={() => setDetalle(pago)}>Ver detalle</button></td>
                </tr>
              ))}
              {!esHistorial && visibles.map((item) => (
                <tr key={item.idCuota} className="hover:bg-slate-50/60 transition">
                  {/* Cliente y Obligación */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{item.cliente}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.obligacion}</p>
                  </td>

                  {/* Vence */}
                  <td className="py-4 px-4 text-slate-600 font-normal">
                    {fecha(item.fechaVencimiento)}
                  </td>

                  {/* Capital */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {dinero(item.capital, item.moneda)}
                  </td>

                  {/* Interés Compensatorio */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {dinero(item.interesCompensatorio, item.moneda)}
                  </td>

                  {/* Mora */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {dinero(item.moraPendiente, item.moneda)}
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {dinero(item.importePendiente, item.moneda)}
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4">
                    <EstadoBadge estado={item.estado} />
                  </td>

                  {/* Botón Registrar */}
                  <td className="py-4 px-6 text-right">
                    {item.gestionable ? <button
                      type="button"
                      onClick={() => { setSeleccionada(item); }}
                      className="min-h-11 whitespace-nowrap px-4 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
                    >
                      Gestionar pago
                    </button> : <span className="text-slate-600">{item.inicioCobro > hoy.slice(0, 7) ? 'Disponible desde ' + item.inicioCobro : 'Cancela primero la cuota pendiente más antigua'}</span>}
                  </td>
                </tr>
              ))}

              {!cargando && !error && total === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    {esHistorial ? 'No se encontraron pagos registrados.' : 'No se encontraron obligaciones.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Paginacion total={total} pagina={paginaActual} onCambiar={setPagina} etiqueta={esHistorial ? 'pagos' : 'obligaciones'} />
      </div>
      {seleccionada && <RegistrarPagoModal obligacion={seleccionada} onClose={() => setSeleccionada(null)} onRegistrado={(operacion, medio) => {
        setSeleccionada(null);
        setConfirmacion({ operacion, medio, idCliente: seleccionada.idCliente, referencia: 'totalPagar' in operacion ? seleccionada.codigo : seleccionada.obligacion });
        setCredito(null);
        void consultarSaldo(seleccionada.idCliente);
        onPagoRegistrado();
      }} />}
      {detalle && <DetalleCorteModal titulo="Detalle del pago" corte={detalle} onClose={() => setDetalle(null)} />}
      {confirmacion && <ModalShell titulo={'totalPagar' in confirmacion.operacion ? 'Liquidación registrada' : 'Pago registrado'} descripcion={confirmacion.referencia} onClose={() => setConfirmacion(null)}>
        <div className={cuerpoModal}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {(() => {
              const pago = confirmacion.operacion;
              const liquidado = 'totalPagar' in pago;
              return [
                ['Pago efectivo', `${fecha(pago.fechaPagoEfectivo)} · ${pago.horaPagoEfectivo ?? '—'}`],
                ['Medio', liquidado ? confirmacion.medio : pago.medioPago],
                ['Capital', dinero(liquidado ? pago.capital : pago.capitalPagado, pago.moneda)],
                ['Interés compensatorio', dinero(liquidado ? pago.interesCompensatorio : pago.interesPagado, pago.moneda)],
                ['Mora', dinero(liquidado ? pago.mora : pago.moraPagada, pago.moneda)],
                ['Total cobrado', dinero(liquidado ? pago.totalPagar : pago.totalExigible, pago.moneda)],
                ['Saldo del crédito', dinero(liquidado ? pago.saldoCapitalRestante : pago.saldoCredito, pago.moneda)],
              ].map(([titulo, valor]) => <div key={titulo}><dt className="text-slate-600">{titulo}</dt><dd className="font-semibold">{valor}</dd></div>);
            })()}
          </dl>
          {credito && <p className="rounded-lg bg-emerald-50 p-3 text-sm">Disponible <strong>{dinero(credito.creditoDisponible, credito.monedaCredito)}</strong> · Utilizado <strong>{dinero(credito.creditoUtilizado, credito.monedaCredito)}</strong></p>}
          {!credito && !errorCredito && <p role="status" className="text-sm">Consultando crédito actualizado…</p>}
          {errorCredito && <p role="alert" className="text-sm text-red-700">{errorCredito} <button className="font-semibold underline" onClick={() => void consultarSaldo(confirmacion.idCliente)}>Consultar saldo</button></p>}
        </div>
      </ModalShell>}
    </div>
  );
};
