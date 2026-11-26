import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface ClientCompraRow {
  id: number;
  codigo: string;
  nombre: string;
  fecha: string;
  modalidad: string;
  capital: number;
  interesTotal: number;
  deudaPendiente: number;
  estado: 'Pendiente' | 'En gracia' | 'Pagado';
}

const comprasMockData: ClientCompraRow[] = [
  {
    id: 1,
    codigo: 'CR-001284',
    nombre: 'Canasta familiar',
    fecha: '05 abr 2025',
    modalidad: '3 meses',
    capital: 600.0,
    interesTotal: 35.46,
    deudaPendiente: 408.26,
    estado: 'Pendiente',
  },
  {
    id: 2,
    codigo: 'CR-001285',
    nombre: 'Canasta y cuidado personal',
    fecha: '15 jun 2025',
    modalidad: '3 meses',
    capital: 345.0,
    interesTotal: 26.46,
    deudaPendiente: 353.63,
    estado: 'En gracia',
  },
];

interface ClientComprasPageProps {
  onVerPlan: (codigo: string) => void;
}

export const ClientComprasPage: React.FC<ClientComprasPageProps> = ({ onVerPlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');

  const filteredCompras = comprasMockData.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterEstado === 'todas' ||
      (filterEstado === 'pendiente' && item.estado === 'Pendiente') ||
      (filterEstado === 'gracia' && item.estado === 'En gracia') ||
      (filterEstado === 'pagado' && item.estado === 'Pagado');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mis compras
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Detalle de tus compras realizadas a crédito.
        </p>
      </div>

      {/* Contenedor principal con filtros y tabla */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Barra superior de filtros */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input de búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar compra"
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] transition"
            />
          </div>

          {/* Selector de estado */}
          <div className="relative">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              aria-label="Filtrar compras por estado de obligación"
              className="appearance-none bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 pl-4 pr-9 py-2 cursor-pointer focus:outline-none focus:border-[#139a6c]"
            >
              <option value="todas">Todas las obligaciones</option>
              <option value="pendiente">Pendientes</option>
              <option value="gracia">En gracia</option>
              <option value="pagado">Pagadas</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tabla de compras */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">COMPRA</th>
                <th className="py-3.5 px-4">FECHA</th>
                <th className="py-3.5 px-4">MODALIDAD</th>
                <th className="py-3.5 px-4">CAPITAL</th>
                <th className="py-3.5 px-4">INTERÉS TOTAL</th>
                <th className="py-3.5 px-4">DEUDA PENDIENTE</th>
                <th className="py-3.5 px-4">ESTADO</th>
                <th className="py-3.5 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCompras.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron compras con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCompras.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 group-hover:text-[#139a6c] transition">
                        {item.nombre}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {item.codigo}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap">
                      {item.fecha}
                    </td>
                    <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap">
                      {item.modalidad}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      S/ {item.capital.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      S/ {item.interesTotal.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      S/ {item.deudaPendiente.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.estado === 'Pendiente' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]">
                          • Pendiente
                        </span>
                      )}
                      {item.estado === 'En gracia' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          • En gracia
                        </span>
                      )}
                      {item.estado === 'Pagado' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          • Pagado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => onVerPlan(item.codigo)}
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-xs cursor-pointer active:scale-98"
                      >
                        Ver plan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
