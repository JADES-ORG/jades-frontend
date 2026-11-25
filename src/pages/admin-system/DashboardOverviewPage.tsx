import React from 'react';
import {
  Store,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface DashboardOverviewPageProps {
  onGoToRegister: () => void;
  onGoToStores: () => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({
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
            Actividad y estado de las tiendas registradas.
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
            <p className="text-xs text-slate-500 font-medium">Tiendas registradas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">126</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">118 activas</p>
          </div>
        </div>

        {/* Card 2: Nuevas este mes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#139a6c] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Nuevas este mes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">8</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">+3 frente al mes anterior</p>
          </div>
        </div>

        {/* Card 3: Clientes gestionados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Clientes gestionados</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">4,820</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">En toda la plataforma</p>
          </div>
        </div>

        {/* Card 4: Tiendas inactivas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tiendas inactivas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">8</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Requieren revisión</p>
          </div>
        </div>
      </div>

      {/* Tabla: Tiendas recientes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Tiendas recientes</h3>
          <p className="text-xs text-slate-400 mt-0.5">Últimos negocios incorporados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">TIENDA</th>
                <th className="py-3 px-6">TIPO</th>
                <th className="py-3 px-6">ADMINISTRADOR</th>
                <th className="py-3 px-6">REGISTRO</th>
                <th className="py-3 px-6">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-4 px-6 font-semibold text-slate-900">Bodega San Blas</td>
                <td className="py-4 px-6 text-slate-600">Bodega</td>
                <td className="py-4 px-6 text-slate-600">Luis Alvarez</td>
                <td className="py-4 px-6 text-slate-500">12 jun 2025</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    Activo
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-4 px-6 font-semibold text-slate-900">Dulce Trigo</td>
                <td className="py-4 px-6 text-slate-600">Panadería</td>
                <td className="py-4 px-6 text-slate-600">Elena Ramos</td>
                <td className="py-4 px-6 text-slate-500">10 jun 2025</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    Activo
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-4 px-6 font-semibold text-slate-900">Carnes Don Pepe</td>
                <td className="py-4 px-6 text-slate-600">Carnicería</td>
                <td className="py-4 px-6 text-slate-600">José Medina</td>
                <td className="py-4 px-6 text-slate-500">08 jun 2025</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    Activo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onGoToStores}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Ver todas
          </button>
        </div>
      </div>
    </div>
  );
};
