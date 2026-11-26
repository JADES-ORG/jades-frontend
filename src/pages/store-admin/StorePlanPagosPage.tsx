import React from 'react';
import {
  ReceiptText,
  Info,
  CreditCard,
  Percent,
} from 'lucide-react';

interface StorePlanPagosPageProps {
  codigoCredito?: string;
  onBackToClient: () => void;
  backButtonLabel?: string;
}

export const StorePlanPagosPage: React.FC<StorePlanPagosPageProps> = ({
  codigoCredito = 'CR-001284',
  onBackToClient,
  backButtonLabel = 'Volver al cliente',
}) => {
  return (
    <div className="space-y-6">
      {/* Título de la sección */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Plan de pagos
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {codigoCredito} · María Quispe · Gracia hasta 15 abr
        </p>
      </div>

      {/* Grid de 3 Métricas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monto financiado */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#139a6c] flex items-center justify-center shrink-0">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Monto financiado</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 604.96</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Capital 600.00 + gracia 4.96</p>
          </div>
        </div>

        {/* Card 2: Intereses totales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Intereses totales</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 35.46</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Incluye intereses de gracia</p>
          </div>
        </div>

        {/* Card 3: Total de cuotas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de cuotas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 635.46</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">3 cuotas · TEM 2.500000%</p>
          </div>
        </div>
      </div>

      {/* Tabla: Cronograma de Cuotas (HU-12) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Cronograma de cuotas</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Método francés · Importes en PEN · Meses de 30 días
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">CUOTA</th>
                <th className="py-3 px-6">VENCIMIENTO</th>
                <th className="py-3 px-6">SALDO INICIAL</th>
                <th className="py-3 px-6">INTERÉS</th>
                <th className="py-3 px-6">AMORTIZACIÓN</th>
                <th className="py-3 px-6">CUOTA</th>
                <th className="py-3 px-6">SALDO FINAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-4 px-6 font-bold text-slate-900">01</td>
                <td className="py-4 px-6 text-slate-600">15 may 2025</td>
                <td className="py-4 px-6 text-slate-600">S/ 604.96</td>
                <td className="py-4 px-6 text-slate-600">S/ 15.12</td>
                <td className="py-4 px-6 text-slate-600">S/ 196.70</td>
                <td className="py-4 px-6 font-bold text-slate-900">S/ 211.82</td>
                <td className="py-4 px-6 text-slate-600">S/ 408.26</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-4 px-6 font-bold text-slate-900">02</td>
                <td className="py-4 px-6 text-slate-600">15 jun 2025</td>
                <td className="py-4 px-6 text-slate-600">S/ 408.26</td>
                <td className="py-4 px-6 text-slate-600">S/ 10.21</td>
                <td className="py-4 px-6 text-slate-600">S/ 201.61</td>
                <td className="py-4 px-6 font-bold text-slate-900">S/ 211.82</td>
                <td className="py-4 px-6 text-slate-600">S/ 206.65</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-4 px-6 font-bold text-slate-900">03</td>
                <td className="py-4 px-6 text-slate-600">15 jul 2025</td>
                <td className="py-4 px-6 text-slate-600">S/ 206.65</td>
                <td className="py-4 px-6 text-slate-600">S/ 5.17</td>
                <td className="py-4 px-6 text-slate-600">S/ 206.65</td>
                <td className="py-4 px-6 font-bold text-slate-900">S/ 211.82</td>
                <td className="py-4 px-6 font-bold text-emerald-600">S/ 0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Banners Informativos al pie del Cronograma */}
        <div className="p-6 space-y-3 bg-white border-t border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center space-x-2.5 text-emerald-800 text-xs">
            <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
            <p className="font-medium">
              Compra 05 abr → corte 10 abr → fin de gracia 15 abr (10 días) → primera cuota 15 may.
            </p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center space-x-2.5 text-emerald-800 text-xs">
            <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
            <p className="font-medium">
              La última cuota ajusta cualquier diferencia de redondeo para que el saldo final del crédito quede en S/ 0.00.
            </p>
          </div>
        </div>
      </div>

      {/* Botón de acción Volver al cliente */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onBackToClient}
          className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          {backButtonLabel}
        </button>
      </div>
    </div>
  );
};
