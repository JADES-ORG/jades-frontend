import React from 'react';
import { Calendar, RotateCcw, Info } from 'lucide-react';

interface ProximoPagoRow {
  obligacion: string;
  fechaPago: string;
  amortizacion: string;
  interesCompensatorio: string;
  mora: string;
  total: string;
  estado: 'Vence hoy' | 'Próxima' | 'Programada';
}

interface HistorialPagoRow {
  obligacion: string;
  fechaReal: string;
  amortizacion: string;
  interesCompensatorio: string;
  mora: string;
  total: string;
}

const proximosPagosData: ProximoPagoRow[] = [
  {
    obligacion: 'Cuota 02 · CR-001284',
    fechaPago: '15 jun 2025',
    amortizacion: 'S/ 201.61',
    interesCompensatorio: 'S/ 10.21',
    mora: 'S/ 0.00',
    total: 'S/ 211.82',
    estado: 'Vence hoy',
  },
  {
    obligacion: 'Cuota 03 · CR-001284',
    fechaPago: '15 jul 2025',
    amortizacion: 'S/ 206.65',
    interesCompensatorio: 'S/ 5.17',
    mora: 'S/ 0.00',
    total: 'S/ 211.82',
    estado: 'Próxima',
  },
  {
    obligacion: 'Cuota 01 · CR-001285',
    fechaPago: '15 ago 2025',
    amortizacion: 'S/ 114.98',
    interesCompensatorio: 'S/ 8.84',
    mora: 'S/ 0.00',
    total: 'S/ 123.82',
    estado: 'Programada',
  },
];

const historialPagosData: HistorialPagoRow[] = [
  {
    obligacion: 'Cuota 01 · CR-001284',
    fechaReal: '15 may 2025',
    amortizacion: 'S/ 196.70',
    interesCompensatorio: 'S/ 15.12',
    mora: 'S/ 0.00',
    total: 'S/ 211.82',
  },
];

export const ClientPagosPage: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mis pagos
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Consulta tus próximos pagos y el historial de obligaciones canceladas.
        </p>
      </div>

      {/* Banner Informativo */}
      <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 flex items-center space-x-3 text-xs text-[#065f46]">
        <Info className="w-4 h-4 text-[#059669] shrink-0" />
        <span className="font-normal">
          Esta es una vista de consulta. Para registrar un pago, comunícate con el negocio.
        </span>
      </div>

      {/* Card 1: Próximos pagos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#139a6c] shrink-0">
            <Calendar className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Próximos pagos</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              Importes totales exigibles por obligación.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">OBLIGACIÓN</th>
                <th className="py-3 px-4">FECHA DE PAGO</th>
                <th className="py-3 px-4">AMORTIZACIÓN</th>
                <th className="py-3 px-4">INTERÉS COMPENSATORIO</th>
                <th className="py-3 px-4">MORA</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-6">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {proximosPagosData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.obligacion}
                  </td>
                  <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap">
                    {row.fechaPago}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {row.amortizacion}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {row.interesCompensatorio}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {row.mora}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {row.total}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {row.estado === 'Vence hoy' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]">
                        • Vence hoy
                      </span>
                    )}
                    {row.estado === 'Próxima' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        • Próxima
                      </span>
                    )}
                    {row.estado === 'Programada' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5f3ff] text-[#6d28d9] border border-[#ede9fe]">
                        • Programada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card 2: Historial de pagos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#139a6c] shrink-0">
            <RotateCcw className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Historial de pagos</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              Obligaciones pagadas anteriormente.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">OBLIGACIÓN</th>
                <th className="py-3 px-4">FECHA REAL</th>
                <th className="py-3 px-4">AMORTIZACIÓN</th>
                <th className="py-3 px-4">INTERÉS COMPENSATORIO</th>
                <th className="py-3 px-4">MORA</th>
                <th className="py-3 px-6">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {historialPagosData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.obligacion}
                  </td>
                  <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap">
                    {row.fechaReal}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {row.amortizacion}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {row.interesCompensatorio}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {row.mora}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
