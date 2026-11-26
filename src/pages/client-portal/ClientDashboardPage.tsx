import React from 'react';
import { Info, ArrowUpRight } from 'lucide-react';

export interface ClientCompraItem {
  id: number;
  codigo: string;
  nombre: string;
  fecha: string;
  modalidad: string;
  capitalVenta: number;
  interesTotal: number;
  saldoCapital: number;
  estado: 'Pendiente' | 'En gracia' | 'Pagado';
}

const clientComprasData: ClientCompraItem[] = [
  {
    id: 1,
    codigo: 'CR-001284',
    nombre: 'Canasta familiar',
    fecha: '05 abr 2025',
    modalidad: '3 meses',
    capitalVenta: 600.00,
    interesTotal: 35.46,
    saldoCapital: 408.26,
    estado: 'Pendiente',
  },
  {
    id: 2,
    codigo: 'CR-001285',
    nombre: 'Canasta y cuidado personal',
    fecha: '15 jun 2025',
    modalidad: '3 meses',
    capitalVenta: 345.00,
    interesTotal: 26.46,
    saldoCapital: 353.63,
    estado: 'En gracia',
  },
];

interface ClientDashboardPageProps {
  onVerPlan: (codigo: string) => void;
  onVerMisCompras?: () => void;
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({
  onVerPlan,
  onVerMisCompras,
}) => {
  return (
    <div className="space-y-8 w-full">
      {/* Encabezado con mejor escala y presencia */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hola, María
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 font-normal">
          Aquí puedes revisar tus compras y próximos pagos.
        </p>
      </div>

      {/* Hero Card Verde Oscuro (#0e3b2e) ocupando todo el ancho con diseño espacioso */}
      <div className="bg-[#0e3b2e] rounded-3xl p-7 sm:p-10 text-white shadow-xl shadow-emerald-950/20 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-emerald-900/40">
        {/* Columna 1: Capital pendiente */}
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wider text-emerald-200/80 font-bold">
            Capital pendiente
          </p>
          <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            S/ 761.89
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200/70 font-medium">
            Disponible: <span className="text-white font-bold">S/ 1,238.11</span> de S/ 2,000.00
          </p>
        </div>

        {/* Columna 2: Próximo pago */}
        <div className="space-y-2 lg:border-l lg:border-white/10 lg:pl-10">
          <p className="text-xs uppercase tracking-wider text-emerald-200/80 font-bold">
            Próximo pago · 15/06/2025
          </p>
          <div className="flex items-baseline space-x-3">
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              S/ 211.82
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] shadow-xs">
              • Vence hoy
            </span>
          </div>
        </div>

        {/* Columna 3: Botón Ver mis compras */}
        <div className="lg:text-right">
          <button
            onClick={onVerMisCompras}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-md cursor-pointer"
          >
            <span>Ver mis compras</span>
            <ArrowUpRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Tarjeta: Mis compras a crédito con tabla espaciosa y legible */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Encabezado de la tarjeta */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Mis compras a crédito
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Operaciones activas y pagadas
            </p>
          </div>
        </div>

        {/* Tabla a todo el ancho */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-4 px-6 sm:px-8">COMPRA</th>
                <th className="py-4 px-4 sm:px-6">FECHA</th>
                <th className="py-4 px-4 sm:px-6">MODALIDAD</th>
                <th className="py-4 px-4 sm:px-6">CAPITAL VENTA</th>
                <th className="py-4 px-4 sm:px-6">INTERÉS TOTAL</th>
                <th className="py-4 px-4 sm:px-6">SALDO CAPITAL</th>
                <th className="py-4 px-4 sm:px-6">ESTADO</th>
                <th className="py-4 px-6 sm:px-8 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clientComprasData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  {/* Compra */}
                  <td className="py-5 px-6 sm:px-8">
                    <p className="font-bold text-slate-900 text-sm">{item.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-normal">{item.codigo}</p>
                  </td>

                  {/* Fecha */}
                  <td className="py-5 px-4 sm:px-6 text-slate-600 font-normal">
                    {item.fecha}
                  </td>

                  {/* Modalidad */}
                  <td className="py-5 px-4 sm:px-6 text-slate-600 font-normal">
                    {item.modalidad}
                  </td>

                  {/* Capital Venta */}
                  <td className="py-5 px-4 sm:px-6 text-slate-800 font-semibold">
                    S/ {item.capitalVenta.toFixed(2)}
                  </td>

                  {/* Interés Total */}
                  <td className="py-5 px-4 sm:px-6 text-slate-800 font-semibold">
                    S/ {item.interesTotal.toFixed(2)}
                  </td>

                  {/* Saldo Capital */}
                  <td className="py-5 px-4 sm:px-6 text-slate-800 font-semibold">
                    S/ {item.saldoCapital.toFixed(2)}
                  </td>

                  {/* Estado */}
                  <td className="py-5 px-4 sm:px-6">
                    {item.estado === 'Pendiente' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        • Pendiente
                      </span>
                    )}
                    {item.estado === 'En gracia' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        • En gracia
                      </span>
                    )}
                    {item.estado === 'Pagado' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        • Pagado
                      </span>
                    )}
                  </td>

                  {/* Botón Ver plan */}
                  <td className="py-5 px-6 sm:px-8 text-right">
                    <button
                      onClick={() => onVerPlan(item.codigo)}
                      className="px-5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      Ver plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banner Informativo Inferior a todo el ancho */}
      <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 sm:p-5 px-6 flex items-center space-x-3 text-xs sm:text-sm text-slate-700 shadow-2xs">
        <Info className="w-5 h-5 text-[#139a6c] shrink-0" />
        <p className="font-normal leading-relaxed">
          Vista de consulta. Los pagos se registran únicamente desde el negocio.
        </p>
      </div>
    </div>
  );
};
