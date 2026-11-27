import React from 'react';
import type { TiendaResumenResponse } from '../../types/tiendas';
import {
  Store,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface DashboardOverviewPageProps {
  tiendas: TiendaResumenResponse[];
  onGoToRegister: () => void;
  onGoToStores: () => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
  tiendas,
  onGoToRegister,
  onGoToStores,
}) => {
  return (
    <div className="space-y-6">
      {/* Título de la sección y botón Registrar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Resumen de la plataforma
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Resumen de las tiendas consultadas o registradas durante esta sesión.
          </p>
        </div>

        <button
          onClick={onGoToRegister}
          className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar tienda</span>
        </button>
      </div>

      {/* Grid de 4 Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tiendas registradas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#139a6c] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tiendas consultadas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{tiendas.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{tiendas.filter(t => t.estadoTienda === 'ACTIVO').length} activas consultadas</p>
          </div>
        </div>

        {/* Card 2: Nuevas este mes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#139a6c] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Nuevas este mes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">—</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Dato no disponible</p>
          </div>
        </div>

        {/* Card 3: Clientes gestionados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Clientes gestionados</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">—</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Dato no disponible</p>
          </div>
        </div>

        {/* Card 4: Tiendas inactivas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tiendas inactivas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{tiendas.filter(t => t.estadoTienda === 'INACTIVO').length}</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Inactivas consultadas</p>
          </div>
        </div>
      </div>

      {/* Tabla: Tiendas recientes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Tiendas consultadas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Resultados verificados con el backend</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">TIENDA</th>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">DOCUMENTO</th>
                <th className="py-3 px-6">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tiendas.slice(0, 5).map(t => (
                <tr key={t.idTienda} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-semibold text-slate-900">{t.nombreTienda}</td>
                  <td className="py-4 px-6">{t.idTienda}</td>
                  <td className="py-4 px-6">{t.documentoTienda}</td>
                  <td className="py-4 px-6">{t.estadoTienda === 'ACTIVO' ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
              {!tiendas.length && <tr><td colSpan={4} className="py-8 text-center text-slate-500">Consulta una tienda o registra una nueva.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onGoToStores}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Gestionar tiendas
          </button>
        </div>
      </div>
    </div>
  );
};
