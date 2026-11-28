import { ConfirmarEstado } from '../../components/shared/ConfirmarEstado';
import { CronogramaCredito } from '../../components/store-admin/CronogramaCredito';
import { consultarCronograma } from '../../api/finanzas';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Check, ChevronDown, ChevronRight, Info, Plus } from 'lucide-react';
import {
  consultarCliente,
  consultarCondicionCrediticia,
  consultarCuentaCorriente,
  desactivarCliente,
  reactivarCliente,
} from '../../api/clientes';
import { listarVentas } from '../../api/ventas';
import { obtenerMensajeError } from '../../api/errores';
import { EstadoBadge } from '../../components/store-admin/EstadoBadge';
import { anulada, cuotasDe, estadoCompra, estadoObligacion } from '../../features/client-portal/model';
import type { ClienteResponse, CondicionCrediticiaResponse } from '../../types/clientes';
import type { CompraCuentaCorriente, CuentaCorrienteResponse, CronogramaResponse } from '../../types/finanzas';
import type { VentaResponse } from '../../types/ventas';
import {
  dinero,
  etiquetaMoneda,
  etiquetaPeriodo,
  etiquetaTipoTasa,
  fecha,
  horaCorta,
  iniciales,
  porcentajeTasa,
  resumenTasaCompensatoria,
  resumenTasaMoratoria,
  resumirDeuda,
} from '../../features/clientes/model';

type Pestana = 'creditos' | 'pagos' | 'condiciones';

interface StoreClienteDetailPageProps {
  idTienda: number;
  idCliente: number;
  soloConsulta?: boolean;
  onBack: () => void;
  onEditClient: (cliente: ClienteResponse) => void;
  onEditConditions: (condicion: CondicionCrediticiaResponse | null) => void;
  onNewSale: () => void;
  /** Avisa el nombre del cliente para el encabezado de la página. */
  onClienteCargado?: (cliente: ClienteResponse) => void;
}

interface Datos {
  cliente: ClienteResponse;
  condicion: CondicionCrediticiaResponse | null;
  errorCondicion: string | null;
  cuenta: CuentaCorrienteResponse | null;
  errorCuenta: string | null;
  ventas: VentaResponse[];
}

const Dato: React.FC<{ etiqueta: string; children: React.ReactNode }> = ({ etiqueta, children }) => (
    <div className="bg-white px-4 py-3">
      <p className="text-[11px] text-slate-400">{etiqueta}</p>
      <div className="font-semibold text-slate-800 text-xs mt-0.5">{children}</div>
    </div>
);

const Tarjeta: React.FC<{ titulo: string; subtitulo: string; accion?: React.ReactNode; children: React.ReactNode }> = ({
                                                                                                                         titulo,
                                                                                                                         subtitulo,
                                                                                                                         accion,
                                                                                                                         children,
                                                                                                                       }) => (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{titulo}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitulo}</p>
        </div>
        {accion}
      </div>
      {children}
    </section>
);

const botonSecundario =
    'px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white';

const esNoEncontrado = (e: unknown) => axios.isAxiosError(e) && e.response?.status === 404;

/** "Pendiente", "En gracia" (aún sin cuotas pagadas), "En mora", "Pagado"... */
function estadoCredito(cuenta: CuentaCorrienteResponse, compra: CompraCuentaCorriente): string {
  const estado = estadoCompra(cuenta, compra);
  if (estado !== 'Pendiente') return estado;
  const pagadas = cuotasDe(cuenta, compra.idVenta).filter((o) => o.importePendiente <= 0).length;
  return pagadas === 0 ? 'En gracia' : 'Pendiente';
}

export const StoreClienteDetailPage: React.FC<StoreClienteDetailPageProps> = ({
                                                                                idTienda,
                                                                                idCliente,
                                                                                soloConsulta = false,
                                                                                onBack,
                                                                                onEditClient,
                                                                                onEditConditions,
                                                                                onNewSale,
                                                                                onClienteCargado,
                                                                              }) => {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const [pestana, setPestana] = useState<Pestana>('creditos');
  const [abierto, setAbierto] = useState<CompraCuentaCorriente | null>(null);
  const [plan, setPlan] = useState<CronogramaResponse | null>(null);
  const [errorPlan, setErrorPlan] = useState('');
  const [intentoPlan, setIntentoPlan] = useState(0);

  useEffect(() => {
    if (abierto?.modalidadPago !== 'MENSUAL') return;
    const controller = new AbortController();
    consultarCronograma(abierto.idVenta, controller.signal)
      .then(resultado => { if (!controller.signal.aborted) setPlan(resultado); })
      .catch((causa: unknown) => { if (!controller.signal.aborted) setErrorPlan(obtenerMensajeError(causa)); });
    return () => controller.abort();
  }, [abierto, intentoPlan]);
  const [confirmarEstado, setConfirmarEstado] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  // Referencia estable al callback: avisar el nombre no debe volver a disparar la carga.
  const avisarClienteCargado = useRef(onClienteCargado);
  useEffect(() => {
    avisarClienteCargado.current = onClienteCargado;
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void (async () => {
      try {
        const [cliente, condicion, cuenta, ventas] = await Promise.allSettled([
          consultarCliente(idTienda, idCliente, signal),
          consultarCondicionCrediticia(idTienda, idCliente, signal),
          consultarCuentaCorriente(idCliente, signal),
          listarVentas(idTienda, idCliente, signal),
        ]);
        if (signal.aborted) return;
        if (cliente.status === 'rejected') throw cliente.reason;
        setDatos({
          cliente: cliente.value,
          condicion: condicion.status === 'fulfilled' ? condicion.value : null,
          errorCondicion:
              condicion.status === 'rejected' && !esNoEncontrado(condicion.reason) ? obtenerMensajeError(condicion.reason) : null,
          cuenta: cuenta.status === 'fulfilled' ? cuenta.value : null,
          errorCuenta: cuenta.status === 'rejected' ? obtenerMensajeError(cuenta.reason) : null,
          // Las ventas solo aportan los nombres de los productos; si fallan, la página sigue funcionando.
          ventas: ventas.status === 'fulfilled' ? ventas.value : [],
        });
        avisarClienteCargado.current?.(cliente.value);
      } catch (err) {
        if (!signal.aborted) setError(obtenerMensajeError(err));
      }
    })();
    return () => controller.abort();
  }, [idTienda, idCliente, recarga]);

  const volver = (
      <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Volver a clientes
      </button>
  );

  if (error) {
    return (
        <div className="space-y-6">
          {volver}
          <div role="alert" className="p-5 bg-white rounded-2xl border border-red-200 text-sm text-red-700 space-y-3">
            <p>{error}</p>
            <button
                type="button"
                className="font-semibold text-[#139a6c] cursor-pointer"
                onClick={() => {
                  setError(null);
                  setRecarga((n) => n + 1);
                }}
            >
              Reintentar
            </button>
          </div>
        </div>
    );
  }

  if (!datos) {
    return (
        <div className="space-y-6">
          {volver}
          <p role="status" className="p-5 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
            Cargando cliente...
          </p>
        </div>
    );
  }

  const { cliente, condicion, cuenta, ventas } = datos;
  const activo = cliente.estadoCliente === 'ACTIVO';
  const deuda = cuenta ? resumirDeuda(cuenta) : null;
  const moneda = condicion?.monedaCredito ?? deuda?.moneda ?? 'PEN';
  const usoPct = condicion && condicion.limiteCredito > 0 ? (condicion.creditoUtilizado / condicion.limiteCredito) * 100 : 0;

  const compras = cuenta ? cuenta.compras.filter((c) => !anulada(c)) : [];
  const conSaldo = (c: CompraCuentaCorriente) => estadoCredito(cuenta!, c) !== 'Pagado';
  const comprasActivas = compras.filter(conSaldo).sort((a, b) => b.fechaCompra.localeCompare(a.fechaCompra));
  const comprasCanceladas = compras.filter((c) => !conSaldo(c)).sort((a, b) => b.fechaCompra.localeCompare(a.fechaCompra));
  const productos = (idVenta: number) =>
      ventas.find((v) => v.id === idVenta)?.detalles.map((d) => d.nombreProducto).join(', ') ?? '';
  const codigo = (c: CompraCuentaCorriente) => c.codigoCredito || `Venta #${c.idVenta}`;
  const referenciaCuota = (idVenta: number) => {
    const compra = cuenta?.compras.find((c) => c.idVenta === idVenta);
    return compra ? codigo(compra) : `Venta #${idVenta}`;
  };

  const cambiarEstado = async () => {
    if (soloConsulta || cambiandoEstado) return;
    setCambiandoEstado(true);
    setErrorEstado(null);
    try {
      const actualizado = activo ? await desactivarCliente(idTienda, cliente.id) : await reactivarCliente(idTienda, cliente.id);
      setDatos({ ...datos, cliente: actualizado });
      setConfirmarEstado(false);
    } catch (err) {
      setErrorEstado(obtenerMensajeError(err));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const tablaCreditos = (lista: CompraCuentaCorriente[]) => (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-y border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-5">Operación</th>
            <th className="py-3 px-5">Fecha</th>
            <th className="py-3 px-5">Modalidad</th>
            <th className="py-3 px-5">Progreso</th>
            <th className="py-3 px-5">Saldo pendiente</th>
            <th className="py-3 px-5">Estado</th>
            <th className="py-3 px-5">
              <span className="sr-only">Ver cuotas</span>
            </th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
          {lista.map((compra) => {
            const cuotas = cuotasDe(cuenta!, compra.idVenta).sort((a, b) => a.numeroCuota - b.numeroCuota);
            const pagadas = cuotas.filter((o) => o.importePendiente <= 0).length;
            const saldo = cuotas.filter((o) => o.importePendiente > 0).reduce((s, o) => s + o.importePendiente, 0);
            const expandido = abierto?.idVenta === compra.idVenta;
            return (
                <React.Fragment key={compra.idVenta}>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-900">{codigo(compra)}</p>
                      {productos(compra.idVenta) && <p className="text-[11px] text-slate-400 mt-0.5">{productos(compra.idVenta)}</p>}
                    </td>
                    <td className="py-4 px-5">{fecha(compra.fechaCompra)}</td>
                    <td className="py-4 px-5">
                      {compra.modalidadPago === 'UNICO' ? 'Pago único' : `${compra.numeroCuotas} cuotas`}
                    </td>
                    <td className="py-4 px-5">{cuotas.length ? `${pagadas} de ${cuotas.length} pagadas` : 'Sin cronograma'}</td>
                    <td className="py-4 px-5 font-semibold text-slate-900">{cuotas.length ? dinero(saldo, compra.moneda) : '—'}</td>
                    <td className="py-4 px-5">
                      <EstadoBadge estado={estadoCredito(cuenta!, compra)} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      {cuotas.length > 0 && (
                          <button
                              type="button"
                              aria-expanded={expandido}
                              aria-label={`${expandido ? 'Ocultar' : 'Ver'} cuotas de ${codigo(compra)}`}
                              onClick={() => { setPlan(null); setErrorPlan(''); setAbierto(expandido ? null : compra); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            {expandido ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                      )}
                    </td>
                  </tr>
                  {expandido && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="mb-4">
                            <p className="text-sm font-semibold">Productos y servicios · {dinero(compra.total, compra.moneda)}</p>
                            <ul className="mt-2 text-sm">{ventas.find(venta => venta.id === compra.idVenta)?.detalles.map(d => <li key={d.idProducto}>
                              {d.cantidad} × {d.nombreProducto} · {dinero(d.subtotal, compra.moneda)}
                            </li>)}</ul>
                          </div>
                          {compra.modalidadPago === 'MENSUAL' && <div className="mb-4">
                            {plan?.idVenta === compra.idVenta ? <CronogramaCredito plan={plan} definitivo /> : errorPlan
                              ? <p role="alert" className="text-sm text-red-700">{errorPlan} <button className="underline" onClick={() => { setErrorPlan(''); setIntentoPlan(n => n + 1); }}>Reintentar</button></p>
                              : <p role="status" className="text-sm">Consultando cronograma…</p>}
                          </div>}
                          <table className="w-full text-[11px]">
                            <thead className="text-slate-400 text-left">
                            <tr>
                              <th className="py-1.5 pr-4 font-semibold">Cuota</th>
                              <th className="py-1.5 pr-4 font-semibold">Vencimiento</th>
                              <th className="py-1.5 pr-4 font-semibold">Capital</th>
                              <th className="py-1.5 pr-4 font-semibold">Interés</th>
                              <th className="py-1.5 pr-4 font-semibold">Importe</th>
                              <th className="py-1.5 pr-4 font-semibold">Pendiente</th>
                              <th className="py-1.5 font-semibold">Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cuotas.map((o) => (
                                <tr key={o.idCuota} className="border-t border-slate-100">
                                  <td className="py-1.5 pr-4">{String(o.numeroCuota).padStart(2, '0')}</td>
                                  <td className="py-1.5 pr-4">{fecha(o.fechaVencimiento)}</td>
                                  <td className="py-1.5 pr-4">{dinero(o.capital, o.moneda)}</td>
                                  <td className="py-1.5 pr-4">{dinero(o.interesCompensatorio, o.moneda)}</td>
                                  <td className="py-1.5 pr-4">{dinero(o.importeCuota, o.moneda)}</td>
                                  <td className="py-1.5 pr-4 font-semibold">{dinero(o.importePendiente, o.moneda)}</td>
                                  <td className="py-1.5">{estadoObligacion(o)}</td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                  )}
                </React.Fragment>
            );
          })}
          </tbody>
        </table>
      </div>
  );

  return (
      <div className="space-y-6">
        {volver}

        {/* Encabezado del cliente */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-sm text-slate-700 shrink-0">
              {iniciales(cliente.nombreCliente)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{cliente.nombreCliente}</h2>
                <EstadoBadge estado={activo ? 'Activo' : 'Inactivo'} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                DNI {cliente.dniCliente}
                {cliente.correoCliente && ` · ${cliente.correoCliente}`}
                {cliente.telefonoCliente && ` · ${cliente.telefonoCliente}`}
              </p>
            </div>
          </div>
          {!soloConsulta && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={() => { setErrorEstado(null); setConfirmarEstado(true); }} disabled={cambiandoEstado} className={botonSecundario}>
                  {cambiandoEstado ? 'Guardando...' : activo ? 'Desactivar' : 'Reactivar'}
                </button>
                <button type="button" onClick={() => onEditClient(cliente)} className={botonSecundario}>
                  Editar cliente
                </button>
                <button
                    type="button"
                    onClick={onNewSale}
                    disabled={!activo || !condicion}
                    title={!activo ? 'El cliente está inactivo.' : !condicion ? 'Registra primero sus condiciones de crédito.' : undefined}
                    className="inline-flex items-center space-x-1.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Nueva venta a crédito</span>
                </button>
              </div>
          )}
        </div>
        {confirmarEstado && <ConfirmarEstado titulo={activo ? 'Desactivar cliente' : 'Reactivar cliente'}
          descripcion={activo ? `${cliente.nombreCliente} conservará sus deudas y pagos. No podrá recibir nuevas ventas.` : `${cliente.nombreCliente} volverá a estar disponible para nuevas ventas.`}
          accion={activo ? 'Desactivar' : 'Reactivar'} guardando={cambiandoEstado} error={errorEstado}
          onCancelar={() => setConfirmarEstado(false)} onConfirmar={() => void cambiarEstado()} />}

        {/* Resumen financiero */}
        <div className="bg-[#0e3b2e] rounded-2xl p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-white/10 shadow-xs">
          <div>
            <p className="text-xs text-emerald-100/70 font-medium">Deuda actual</p>
            <p className="text-2xl font-bold mt-1">{deuda ? dinero(deuda.deudaActual, moneda) : '—'}</p>
            <p className="text-[11px] text-emerald-100/60 mt-1">
              {deuda ? `Capital pendiente: ${dinero(deuda.capitalPendiente, moneda)}` : datos.errorCuenta ?? 'Sin información de deuda'}
            </p>
          </div>
          <div className="md:px-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-emerald-100/70 font-medium">Crédito utilizado</span>
              <span className="font-bold">{condicion ? `${usoPct.toFixed(4)}%` : '—'}</span>
            </div>
            <div
                role="progressbar"
                aria-label="Crédito utilizado"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(Math.min(100, usoPct))}
                className="w-full bg-white/90 rounded-full h-1.5 overflow-hidden"
            >
              <div className="bg-[#139a6c] h-1.5 rounded-full" style={{ width: `${Math.min(100, usoPct)}%` }} />
            </div>
            <p className="text-[11px] text-emerald-50 mt-2.5 flex items-center font-medium">
              {condicion ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Tienes {dinero(condicion.creditoDisponible, condicion.monedaCredito)} disponibles
                  </>
              ) : (
                  'Sin condiciones de crédito registradas'
              )}
            </p>
          </div>
          <div className="md:pl-6">
            <p className="text-xs text-emerald-100/70 font-medium">Próximo pago</p>
            <p className="text-2xl font-bold mt-1">
              {deuda?.proximoPago ? dinero(deuda.proximoPago.importePendiente, deuda.proximoPago.moneda) : dinero(0, moneda)}
            </p>
            <p className="text-[11px] text-emerald-100/60 mt-1">
              {deuda?.proximoPago ? fecha(deuda.proximoPago.fechaVencimiento) : 'Sin pagos pendientes'}
            </p>
          </div>
        </div>

        {/* Condiciones pactadas */}
        <Tarjeta
            titulo="Condiciones de crédito pactadas"
            subtitulo={
              condicion
                  ? 'Las ventas anteriores conservan las condiciones pactadas al registrarse.'
                  : 'Este cliente aún no tiene condiciones de crédito.'
            }
            accion={
                !soloConsulta &&
                !datos.errorCondicion && (
                    <button
                        type="button"
                        onClick={() => onEditConditions(condicion)}
                        disabled={!activo}
                        title={!activo ? 'Reactiva al cliente para modificar sus condiciones.' : undefined}
                        className={botonSecundario}
                    >
                      {condicion ? 'Editar condiciones' : 'Registrar condiciones'}
                    </button>
                )
            }
        >
          {datos.errorCondicion ? (
              <p role="alert" className="mx-5 mb-5 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 p-3">
                {datos.errorCondicion}
              </p>
          ) : condicion ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border-t border-slate-100">
                <Dato etiqueta="Tipo y valor de tasa">{resumenTasaCompensatoria(condicion)}</Dato>
                <Dato etiqueta="Moneda">{etiquetaMoneda(condicion.monedaCredito)}</Dato>
                <Dato etiqueta="Límite máximo">{dinero(condicion.limiteCredito, condicion.monedaCredito)}</Dato>
                      <Dato etiqueta="Crédito utilizado">{dinero(condicion.creditoUtilizado, condicion.monedaCredito)}</Dato>
                      <Dato etiqueta="Crédito disponible">{dinero(condicion.creditoDisponible, condicion.monedaCredito)}</Dato>
                <Dato etiqueta="Plazo máximo">{condicion.plazoMaximo} meses</Dato>
                <Dato etiqueta="Corte mensual">
                  Día {condicion.diaCorte} · {horaCorta(condicion.horaCorte)}
                </Dato>
                <Dato etiqueta="Día de pago">Día {condicion.diaPago}</Dato>
                <Dato etiqueta="Tasa moratoria">{resumenTasaMoratoria(condicion)}</Dato>
                <Dato etiqueta="Estado">
                  <EstadoBadge estado={activo ? 'Activo' : 'Inactivo'} />
                </Dato>
              </div>
          ) : (
              <p className="mx-5 mb-5 text-xs text-slate-500 bg-slate-50 rounded-xl p-4">
                Registra sus condiciones (tasa, límite, plazo y fechas) para poder venderle a crédito.
              </p>
          )}
        </Tarjeta>

        {/* Pestañas */}
        <div role="tablist" aria-label="Información del cliente" className="flex space-x-8 border-b border-slate-200 text-xs font-medium">
          {(
              [
                ['creditos', 'Créditos y compras'],
                ['pagos', 'Historial de pagos'],
                ['condiciones', 'Condiciones de crédito'],
              ] as const
          ).map(([id, texto]) => (
              <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={pestana === id}
                  onClick={() => setPestana(id)}
                  className={`pb-3 -mb-px transition cursor-pointer border-b-2 ${
                      pestana === id ? 'border-[#139a6c] text-[#139a6c] font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                {texto}
              </button>
          ))}
        </div>

        {pestana === 'creditos' &&
            (!cuenta ? (
                <p role="alert" className="p-5 bg-white rounded-2xl border border-red-200 text-xs text-red-700">
                  {datos.errorCuenta}
                </p>
            ) : (
                <div className="space-y-6">
                  <Tarjeta titulo="Créditos activos" subtitulo="Compras pendientes de pago">
                    {comprasActivas.length ? (
                        tablaCreditos(comprasActivas)
                    ) : (
                        <p className="px-5 pb-6 text-xs text-slate-400">El cliente no tiene compras pendientes de pago.</p>
                    )}
                  </Tarjeta>
                  {comprasCanceladas.length > 0 && (
                      <Tarjeta titulo="Compras canceladas" subtitulo="Créditos pagados en su totalidad">
                        {tablaCreditos(comprasCanceladas)}
                      </Tarjeta>
                  )}
                </div>
            ))}

        {pestana === 'pagos' &&
            (!cuenta ? (
                <p role="alert" className="p-5 bg-white rounded-2xl border border-red-200 text-xs text-red-700">
                  {datos.errorCuenta}
                </p>
            ) : (
                <Tarjeta titulo="Historial de pagos" subtitulo="Pagos registrados y composición de cada cancelación.">
                  {cuenta.pagos.length ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/70 border-y border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <tr>
                              <th className="py-3 px-5">Obligación</th>
                              <th className="py-3 px-5">Fecha</th>
                              <th className="py-3 px-5">Capital</th>
                              <th className="py-3 px-5">Interés</th>
                              <th className="py-3 px-5">Mora</th>
                              <th className="py-3 px-5">Total</th>
                              <th className="py-3 px-5">Medio</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                            {[...cuenta.pagos]
                                .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago) || b.idPago - a.idPago)
                                .map((p) => (
                                    <tr key={p.idPago}>
                                      <td className="py-4 px-5 font-semibold text-slate-900">
                                        Cuota {String(p.numeroCuota).padStart(2, '0')} · {referenciaCuota(p.idVenta)}
                                      </td>
                                      <td className="py-4 px-5">
                                        {fecha(p.fechaPago)}
                                        {p.horaPagoEfectivo && ` · ${horaCorta(p.horaPagoEfectivo)}`}
                                      </td>
                                      <td className="py-4 px-5 font-semibold">{dinero(p.capitalPagado, p.moneda)}</td>
                                      <td className="py-4 px-5">{dinero(p.interesPagado, p.moneda)}</td>
                                      <td className="py-4 px-5">{dinero(p.moraPagada, p.moneda)}</td>
                                      <td className="py-4 px-5 font-semibold">
                                        {dinero(p.totalExigible, p.moneda)}
                                      </td>
                                      <td className="py-4 px-5 capitalize">{p.medioPago ? p.medioPago.toLowerCase() : '—'}
                                        {!!p.detalles.length && <details className="mt-1"><summary className="cursor-pointer font-semibold">Productos y servicios</summary>
                                          <ul>{p.detalles.map(d => <li key={d.idProducto}>{d.cantidad} × {d.nombreProducto} · {dinero(d.subtotal, p.moneda)}</li>)}</ul>
                                        </details>}
                                      </td>
                                    </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="px-5 py-4 border-t border-slate-100 text-[11px] text-slate-500">
                          {cuenta.pagos.some((p) => p.moraPagada > 0)
                              ? 'Algunos pagos incluyeron interés moratorio por atraso.'
                              : 'Los pagos fueron imputados a interés compensatorio y capital. No hubo mora.'}
                        </p>
                      </>
                  ) : (
                      <p className="px-5 pb-6 text-xs text-slate-400">Aún no hay pagos registrados.</p>
                  )}
                </Tarjeta>
            ))}

        {pestana === 'condiciones' && (
            <Tarjeta
                titulo="Detalle de condiciones de crédito"
                subtitulo="Parámetros completos que se aplican a las nuevas ventas a crédito del cliente."
            >
              {condicion ? (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border-y border-slate-100">
                      <Dato etiqueta="Tipo de tasa">{etiquetaTipoTasa(condicion.tipoTasa)}</Dato>
                      <Dato etiqueta="Valor de la tasa">{porcentajeTasa(condicion.tasaInteres)}</Dato>
                      <Dato etiqueta="Periodo de referencia">{etiquetaPeriodo(condicion.periodoTasa)}</Dato>
                      <Dato etiqueta="Capitalización nominal">
                        {condicion.tipoTasa === 'NOMINAL' ? etiquetaPeriodo(condicion.capitalizacionTasa) : 'No aplica'}
                      </Dato>
                      <Dato etiqueta="Moneda">{etiquetaMoneda(condicion.monedaCredito)}</Dato>
                      <Dato etiqueta="Límite máximo">{dinero(condicion.limiteCredito, condicion.monedaCredito)}</Dato>
                      <Dato etiqueta="Plazo máximo">{condicion.plazoMaximo} meses</Dato>
                      <Dato etiqueta="Corte">
                        Día {condicion.diaCorte} · {horaCorta(condicion.horaCorte)}
                      </Dato>
                      <Dato etiqueta="Día de pago">Día {condicion.diaPago}</Dato>
                      <Dato etiqueta="Tipo de tasa moratoria">
                        {etiquetaTipoTasa(condicion.tipoTasaMora)} {etiquetaPeriodo(condicion.periodoTasaMora).toLowerCase()}
                      </Dato>
                      <Dato etiqueta="Valor moratorio">{porcentajeTasa(condicion.tasaMoratoria)}</Dato>
                      <Dato etiqueta="Capitalización moratoria">
                        {condicion.tipoTasaMora === 'NOMINAL' ? etiquetaPeriodo(condicion.capitalizacionMora) : 'No aplica'}
                      </Dato>
                    </div>
                    <p className="m-5 inline-flex items-center text-[11px] text-emerald-800 bg-emerald-50 rounded-xl px-4 py-3">
                      <Info className="w-3.5 h-3.5 mr-2 shrink-0" />
                      Base financiera 360/30. Las tasas se conservan con al menos 7 decimales para los cálculos.
                    </p>
                  </>
              ) : (
                  <p className="px-5 pb-6 text-xs text-slate-400">
                    {datos.errorCondicion ?? 'Este cliente aún no tiene condiciones de crédito registradas.'}
                  </p>
              )}
            </Tarjeta>
        )}
      </div>
  );
};