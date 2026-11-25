import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';

export interface ClienteStoreItem {
  id: number;
  nombre: string;
  avatar: string;
  dni: string;
  deudaActual: number;
  creditoDisponible: number;
  estado: 'Al día' | 'Por vencer' | 'En mora' | 'Sin deuda';
}

const clientesData: ClienteStoreItem[] = [
  {
    id: 1,
    nombre: 'María Quispe',
    avatar: 'MQ',
    dni: '45892136',
    deudaActual: 795.10,
    creditoDisponible: 1238.11,
    estado: 'Al día',
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    avatar: 'CM',
    dni: '70124895',
    deudaActual: 1793.75,
    creditoDisponible: 250.00,
    estado: 'Por vencer',
  },
  {
    id: 3,
    nombre: 'Rosa Huamán',
    avatar: 'RH',
    dni: '42365891',
    deudaActual: 284.49,
    creditoDisponible: 1720.00,
    estado: 'En mora',
  },
  {
    id: 4,
    nombre: 'Jorge Flores',
    avatar: 'JF',
    dni: '68321457',
    deudaActual: 0.00,
    creditoDisponible: 1500.00,
    estado: 'Sin deuda',
  },
];

interface StoreClientesListPageProps {
  onSelectCliente: (cliente: ClienteStoreItem) => void;
  onNewClient?: () => void;
}

export const StoreClientesListPage: React.FC<StoreClientesListPageProps> = ({
  onSelectCliente,
  onNewClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('TODOS');

  const filteredClientes = clientesData.filter((c) => {
    const matchSearch =
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni.includes(searchTerm);
    const matchEstado = estadoFilter === 'TODOS' || c.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header y botón Nuevo cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Clientes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona límites, condiciones y deudas de tus clientes.
          </p>
        </div>

        <button
          onClick={onNewClient}
          className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo cliente</span>
        </button>
      </div>

      {/* Resumen métrico */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Clientes activos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">48</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Con crédito activo</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Sin deuda</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">34</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">En mora</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">2</p>
        </div>
      </div>

      {/* Buscador y filtro */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o DNI"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
          />
        </div>

        <div className="relative sm:w-48">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] pr-8 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Al día">Al día</option>
            <option value="Por vencer">Por vencer</option>
            <option value="En mora">En mora</option>
            <option value="Sin deuda">Sin deuda</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">CLIENTE</th>
                <th className="py-3 px-6">DNI</th>
                <th className="py-3 px-6">DEUDA ACTUAL</th>
                <th className="py-3 px-6">CRÉDITO DISPONIBLE</th>
                <th className="py-3 px-6">ESTADO</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClientes.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCliente(c)}
                  className="hover:bg-slate-50/60 transition cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {c.avatar}
                      </div>
                      <span className="font-semibold text-slate-900">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{c.dni}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    S/ {c.deudaActual.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    S/ {c.creditoDisponible.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        c.estado === 'Al día'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : c.estado === 'Por vencer'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                          : c.estado === 'En mora'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                          : 'bg-slate-50 text-slate-700 border-slate-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          c.estado === 'Al día'
                            ? 'bg-emerald-500'
                            : c.estado === 'Por vencer'
                            ? 'bg-amber-500'
                            : c.estado === 'En mora'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      {c.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando 1–{filteredClientes.length} de 48 clientes</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
              Anterior
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
