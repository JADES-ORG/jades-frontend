import React, { useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import type { TiendaData } from '../../components/admin-system/EditarTiendaModal';

interface TiendasListPageProps {
  tiendas: TiendaData[];
  onGoToRegister: () => void;
  onEditTienda: (tienda: TiendaData) => void;
}

export const TiendasListPage: React.FC<TiendasListPageProps> = ({
  tiendas,
  onGoToRegister,
  onEditTienda,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | 'Activo' | 'Inactivo'>('TODOS');

  // Filtrado reactivo en tiempo real
  const tiendasFiltradas = tiendas.filter((t) => {
    const matchesSearch =
      t.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.adminNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === 'TODOS' || t.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Título de la sección y botón Registrar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tiendas registradas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Negocios que operan de forma independiente en la plataforma.
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

      {/* Resumen Métrico Compacto (Fila de 4 números) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Total tiendas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">126</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Activas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">118</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Inactivas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Giros distintos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">4</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro de Estados */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tienda, responsable o ciudad"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
          />
        </div>

        <div className="relative sm:w-48">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as any)}
            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] pr-8 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tabla Completa de Tiendas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">TIENDA</th>
                <th className="py-3 px-6">GIRO</th>
                <th className="py-3 px-6">ADMINISTRADOR</th>
                <th className="py-3 px-6">UBICACIÓN</th>
                <th className="py-3 px-6">TELÉFONO</th>
                <th className="py-3 px-6">ESTADO</th>
                <th className="py-3 px-6 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tiendasFiltradas.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-semibold text-slate-900">{t.nombreComercial}</td>
                  <td className="py-4 px-6 text-slate-600">{t.giro}</td>
                  <td className="py-4 px-6 text-slate-600">{t.adminNombre}</td>
                  <td className="py-4 px-6 text-slate-500">{t.direccion}</td>
                  <td className="py-4 px-6 text-slate-500">{t.telefono}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        t.estado === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border-rose-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          t.estado === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {t.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onEditTienda(t)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:border-[#139a6c] hover:text-[#139a6c] hover:bg-slate-50 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {tiendasFiltradas.length} de {tiendas.length} tiendas</span>
        </div>
      </div>
    </div>
  );
};
