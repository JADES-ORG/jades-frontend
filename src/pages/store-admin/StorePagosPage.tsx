import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  ChevronDown,
  Info,
} from 'lucide-react';
import type { PagoItemData } from '../../components/store-admin/RegistrarPagoModal';

export const initialPagos: PagoItemData[] = [
  {
    id: 1,
    cliente: 'María Quispe',
    obligacion: 'Cuota 02 · CR-001284',
    vence: '15 jun',
    capital: 201.61,
    interesCompensatorio: 10.21,
    mora: 0.00,
    total: 211.82,
    estado: 'Pendiente',
    diasAtraso: 0,
    capitalPendientePost: 560.28,
    creditoDisponiblePost: 1439.72,
    capitalLiberado: 201.61,
  },
  {
    id: 2,
    cliente: 'Rosa Huamán',
    obligacion: 'Ciclo junio · pago único',
    vence: '07 jun',
    capital: 280.00,
    interesCompensatorio: 3.58,
    mora: 0.91,
    total: 284.49,
    estado: 'En mora',
    diasAtraso: 8,
    tasaMoraInfo: 'TNM 1.200000% con capitalización diaria',
    capitalPendientePost: 0.00,
    creditoDisponiblePost: 2000.00,
    capitalLiberado: 280.00,
  },
  {
    id: 3,
    cliente: 'Carlos Mendoza',
    obligacion: 'Pago único · CR-001240',
    vence: '16 jun',
    capital: 1750.00,
    interesCompensatorio: 43.75,
    mora: 0.00,
    total: 1793.75,
    estado: 'Por vencer',
    diasAtraso: 0,
    capitalPendientePost: 0.00,
    creditoDisponiblePost: 2000.00,
    capitalLiberado: 1750.00,
  },
];

interface StorePagosPageProps {
  pagos: PagoItemData[];
  onOpenRegistrarPago: (pago: PagoItemData) => void;
}

export const StorePagosPage: React.FC<StorePagosPageProps> = ({
  pagos,
  onOpenRegistrarPago,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Estados pendientes');

  const filteredPagos = pagos.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      item.cliente.toLowerCase().includes(term) ||
      item.obligacion.toLowerCase().includes(term);

    if (estadoFilter === 'Estados pendientes') {
      return matchSearch;
    }
    return matchSearch && (estadoFilter === 'TODOS' || item.estado === estadoFilter);
  });

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

      {/* 3 Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Exigible hoy */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Exigible hoy</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 211.82</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">1 obligación pendiente</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100/60">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: En mora */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">En mora</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 284.49</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Incluye S/ 0.91 de mora</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Próximos 7 días */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Próximos 7 días</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 1,793.75</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">1 obligación por vencer</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full sm:w-48 appearance-none px-3.5 py-2 pr-9 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] cursor-pointer"
            >
              <option value="Estados pendientes">Estados pendientes</option>
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
              {filteredPagos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  {/* Cliente y Obligación */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{item.cliente}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.obligacion}</p>
                  </td>

                  {/* Vence */}
                  <td className="py-4 px-4 text-slate-600 font-normal">
                    {item.vence}
                  </td>

                  {/* Capital */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.capital.toFixed(2)}
                  </td>

                  {/* Interés Compensatorio */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.interesCompensatorio.toFixed(2)}
                  </td>

                  {/* Mora */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.mora.toFixed(2)}
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    S/ {item.total.toFixed(2)}
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
                    <button
                      onClick={() => onOpenRegistrarPago(item)}
                      className={`px-4 py-1.5 border rounded-xl text-xs font-semibold transition cursor-pointer ${
                        item.estado === 'Por vencer'
                          ? 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Registrar
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPagos.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No hay obligaciones pendientes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Banner Informativo al pie de la tabla */}
        <div className="bg-[#f0fdf4] border-t border-slate-100 p-4 px-6 flex items-center space-x-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
          <p>
            Importes en PEN. Solo se admiten pagos por el total exigible. Fecha de consulta: 15/06/2025.
          </p>
        </div>
      </div>
    </div>
  );
};
