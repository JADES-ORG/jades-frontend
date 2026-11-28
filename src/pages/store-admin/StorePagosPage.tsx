import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  ChevronDown,
} from 'lucide-react';
import { RegistrarPagoModal } from '../../components/store-admin/RegistrarPagoModal';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import { obligacionesPendientes, proximosSieteDias, useCuentasTienda, type ObligacionCobro } from '../../features/cobranzas/cuentas';

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
  const [aviso, setAviso] = useState('');
  const [pagina, setPagina] = useState(1);
  const pagos = cargando || error ? [] : obligacionesPendientes(cuentas);
  const hoy = hoyLima();
  const indicadores = [
    { titulo: 'Vence hoy', icono: Clock, filas: pagos.filter(p => p.fechaVencimiento === hoy) },
    { titulo: 'En mora', icono: AlertTriangle, filas: pagos.filter(p => p.estado === 'En mora') },
    { titulo: 'Próximos 7 días', icono: Calendar, filas: pagos.filter(p => proximosSieteDias(p.fechaVencimiento, hoy)) },
  ];

  const filteredPagos = pagos.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      item.cliente.toLowerCase().includes(term) ||
      item.obligacion.toLowerCase().includes(term);

    return matchSearch && (estadoFilter === 'TODOS' || item.estado === estadoFilter);
  });

  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(filteredPagos.length / 10)));
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

      {aviso && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{aviso}</p>}
      {cargando && <p role="status" className="text-sm text-slate-600">Cargando obligaciones…</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error} <button onClick={recargar} className="font-semibold underline">Reintentar</button></p>}
      {!cargando && !error && <div className="grid gap-4 md:grid-cols-3">
        {indicadores.map(({ titulo, icono: Icono, filas }) => (
          <div key={titulo} className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{titulo}</p>
              <p className="text-2xl font-bold text-slate-900">{filas.length}</p>
            </div>
            <Icono aria-hidden="true" className="size-5 text-[#139a6c]" />
          </div>
        ))}
      </div>}

      {/* Contenedor de Tabla con Buscador y Filtro */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={estadoFilter}
              aria-label="Estado de la obligación"
              onChange={(e) => { setEstadoFilter(e.target.value); setPagina(1); }}
              className="w-full sm:w-48 appearance-none px-3.5 py-2 pr-9 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En mora">En mora</option>
              <option value="Por vencer">Por vencer</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-6">CLIENTE / OBLIGACIÓN</th>
                <th className="py-3 px-4">VENCE</th>
                <th className="py-3 px-4">CAPITAL</th>
                <th className="py-3 px-4">INTERÉS COMPENSATORIO</th>
                <th className="py-3 px-4">MORA</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visibles.map((item) => (
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
                    {item.estado === 'Pendiente' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        • Pendiente
                      </span>
                    )}
                    {item.estado === 'En mora' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        • En mora
                      </span>
                    )}
                    {item.estado === 'Por vencer' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        • Por vencer
                      </span>
                    )}
                  </td>

                  {/* Botón Registrar */}
                  <td className="py-4 px-6 text-right">
                    {item.gestionable && <button
                      type="button"
                      onClick={() => { setAviso(''); setSeleccionada(item); }}
                      className="min-h-11 px-4 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"
                    >
                      Gestionar pago
                    </button>}
                  </td>
                </tr>
              ))}

              {!cargando && !error && filteredPagos.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No hay obligaciones pendientes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredPagos.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-sm">
          <span>{filteredPagos.length} obligaciones</span>
          <div className="flex items-center gap-3">
            <button type="button" disabled={paginaActual <= 1} onClick={() => setPagina(paginaActual - 1)} className="min-h-11 px-3 disabled:opacity-40">Anterior</button>
            <span>{paginaActual} de {Math.ceil(filteredPagos.length / 10)}</span>
            <button type="button" disabled={paginaActual * 10 >= filteredPagos.length} onClick={() => setPagina(paginaActual + 1)} className="min-h-11 px-3 disabled:opacity-40">Siguiente</button>
          </div>
        </div>}
      </div>
      {seleccionada && <RegistrarPagoModal obligacion={seleccionada} onClose={() => setSeleccionada(null)} onRegistrado={mensaje => {
        setSeleccionada(null);
        setAviso(mensaje);
        onPagoRegistrado();
      }} />}
    </div>
  );
};
