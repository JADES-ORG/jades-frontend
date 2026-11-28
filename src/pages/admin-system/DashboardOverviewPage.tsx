import React from 'react';
import type { TiendaDetalleResponse } from '../../types/tiendas';
import {
  Store,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface DashboardOverviewPageProps {
  tiendas: TiendaDetalleResponse[];
  cargando: boolean;
  error: string | null;
  onRecargar: () => void;
  onGoToRegister: () => void;
  onGoToStores: () => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  tiendas,
  cargando,
  error,
  onRecargar,
  onGoToRegister,
  onGoToStores,
}) => {
  return (
    <div className="space-y-[18px]">
      {/* Título de la sección y botón Registrar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-jades-ink tracking-tight">
            Resumen de la plataforma
          </h2>
          <p className="text-xs text-jades-muted mt-1">
            Actividad y estado de las tiendas registradas.
          </p>
        </div>

        <button
          onClick={onGoToRegister}
          className="inline-flex items-center justify-center space-x-2 bg-jades-primary hover:bg-jades-hover active:bg-jades-active text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar tienda</span>
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error} <button type="button" onClick={onRecargar} className="underline font-semibold">Reintentar</button></p>}
      {cargando && <p role="status" className="text-xs text-jades-muted">Cargando tiendas...</p>}
      {/* Grid de 4 Métricas */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Tiendas registradas */}
        <div className="jades-dashboard-metric flex min-w-0 items-start gap-3 rounded-xl border border-jades-line bg-white p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-jades-primary flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] text-jades-muted font-medium">Tiendas registradas</p>
            <h3 className="text-2xl font-bold text-jades-ink mt-1">{tiendas.length}</h3>
            <p className="text-[11px] text-jades-muted mt-0.5">{tiendas.filter(t => t.estadoTienda === 'ACTIVO').length} activas</p>
          </div>
        </div>

        {/* Card 2: Nuevas este mes */}
        <div className="jades-dashboard-metric flex min-w-0 items-start gap-3 rounded-xl border border-jades-line bg-white p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-jades-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] text-jades-muted font-medium">Giros distintos</p>
            <h3 className="text-2xl font-bold text-jades-ink mt-1">{new Set(tiendas.map(t => t.giroDeNegocio)).size}</h3>
            <p className="text-[11px] text-jades-muted mt-0.5">Tipos de negocio registrados</p>
          </div>
        </div>

        {/* Card 3: Clientes gestionados */}
        <div className="jades-dashboard-metric flex min-w-0 items-start gap-3 rounded-xl border border-jades-line bg-white p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] text-jades-muted font-medium">Administradores asignados</p>
            <h3 className="text-2xl font-bold text-jades-ink mt-1">{new Set(tiendas.flatMap(t => t.administradores.map(a => a.idUsuario))).size}</h3>
            <p className="text-[11px] text-jades-muted mt-0.5">Usuarios vinculados a tiendas</p>
          </div>
        </div>

        {/* Card 4: Tiendas inactivas */}
        <div className="jades-dashboard-metric flex min-w-0 items-start gap-3 rounded-xl border border-jades-line bg-white p-5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] text-jades-muted font-medium">Tiendas inactivas</p>
            <h3 className="text-2xl font-bold text-jades-ink mt-1">{tiendas.filter(t => t.estadoTienda === 'INACTIVO').length}</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">No disponibles para nuevas ventas</p>
          </div>
        </div>
      </div>

      {/* Tabla: Tiendas recientes */}
      <div className="bg-white rounded-[13px] border border-jades-line overflow-hidden">
        <div className="p-5 border-b border-jades-line">
          <h3 className="text-[15px] font-bold text-jades-ink">Tiendas registradas</h3>
          <p className="text-xs text-jades-muted mt-0.5">Resultados verificados con el backend</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-jades-subtle border-b border-jades-line text-[10px] font-bold text-jades-muted uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">TIENDA</th>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">DOCUMENTO</th>
                <th className="py-3 px-6">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jades-line text-slate-700">
              {[...tiendas].sort((a, b) => b.idTienda - a.idTienda).slice(0, 5).map(t => (
                <tr key={t.idTienda} className="hover:bg-jades-subtle transition">
                  <td className="py-4 px-6 font-semibold text-jades-ink">{t.nombreTienda}</td>
                  <td className="py-4 px-6">{t.idTienda}</td>
                  <td className="py-4 px-6">{t.documentoTienda}</td>
                  <td className="py-4 px-6">{t.estadoTienda === 'ACTIVO' ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
              {!tiendas.length && <tr><td colSpan={4} className="py-8 text-center text-jades-muted">{cargando ? 'Cargando tiendas...' : error ? 'No se pudo cargar el listado.' : 'No hay tiendas registradas.'}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-jades-line flex justify-end">
          <button
            onClick={onGoToStores}
            className="px-4 py-2 border border-jades-line text-slate-700 hover:bg-jades-subtle text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Gestionar tiendas
          </button>
        </div>
      </div>
    </div>
  );
};
