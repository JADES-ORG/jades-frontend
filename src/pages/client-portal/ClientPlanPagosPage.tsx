import React from 'react';
import { FileText, CreditCard, Calendar, Info } from 'lucide-react';

interface CuotaCronograma {
  numero: string;
  vencimiento: string;
  saldoInicial: string;
  interes: string;
  amortizacion: string;
  cuota: string;
  saldoFinal: string;
}

interface PlanPagosData {
  codigo: string;
  nombre: string;
  montoFinanciado: string;
  montoFinanciadoSub: string;
  totalCuotas: string;
  totalCuotasSub: string;
  saldoCapital: string;
  saldoCapitalSub: string;
  tasaInfo: string;
  cuotas: CuotaCronograma[];
}

const planesMock: Record<string, PlanPagosData> = {
  'CR-001284': {
    codigo: 'CR-001284',
    nombre: 'Canasta familiar',
    montoFinanciado: 'S/ 604.96',
    montoFinanciadoSub: 'Gracia capitalizada S/ 4.96',
    totalCuotas: 'S/ 635.46',
    totalCuotasSub: '3 cuotas · método francés',
    saldoCapital: 'S/ 408.26',
    saldoCapitalSub: '1 de 3 cuotas pagadas',
    tasaInfo: 'Importes en PEN · TEM 2.500000%',
    cuotas: [
      {
        numero: '01',
        vencimiento: '15 may 2025',
        saldoInicial: 'S/ 604.96',
        interes: 'S/ 15.12',
        amortizacion: 'S/ 196.70',
        cuota: 'S/ 211.82',
        saldoFinal: 'S/ 408.26',
      },
      {
        numero: '02',
        vencimiento: '15 jun 2025',
        saldoInicial: 'S/ 408.26',
        interes: 'S/ 10.21',
        amortizacion: 'S/ 201.61',
        cuota: 'S/ 211.82',
        saldoFinal: 'S/ 206.65',
      },
      {
        numero: '03',
        vencimiento: '15 jul 2025',
        saldoInicial: 'S/ 206.65',
        interes: 'S/ 5.17',
        amortizacion: 'S/ 206.65',
        cuota: 'S/ 211.82',
        saldoFinal: 'S/ 0.00',
      },
    ],
  },
  'CR-001285': {
    codigo: 'CR-001285',
    nombre: 'Canasta y cuidado personal',
    montoFinanciado: 'S/ 353.63',
    montoFinanciadoSub: 'Gracia capitalizada S/ 8.63',
    totalCuotas: 'S/ 371.46',
    totalCuotasSub: '3 cuotas · método francés',
    saldoCapital: 'S/ 353.63',
    saldoCapitalSub: 'En gracia hasta 15 jul',
    tasaInfo: 'Importes en PEN · TEM 2.500000%',
    cuotas: [
      {
        numero: '01',
        vencimiento: '15 ago 2025',
        saldoInicial: 'S/ 353.63',
        interes: 'S/ 8.84',
        amortizacion: 'S/ 114.98',
        cuota: 'S/ 123.82',
        saldoFinal: 'S/ 238.65',
      },
      {
        numero: '02',
        vencimiento: '15 sep 2025',
        saldoInicial: 'S/ 238.65',
        interes: 'S/ 5.97',
        amortizacion: 'S/ 117.85',
        cuota: 'S/ 123.82',
        saldoFinal: 'S/ 120.80',
      },
      {
        numero: '03',
        vencimiento: '15 oct 2025',
        saldoInicial: 'S/ 120.80',
        interes: 'S/ 3.02',
        amortizacion: 'S/ 120.80',
        cuota: 'S/ 123.82',
        saldoFinal: 'S/ 0.00',
      },
    ],
  },
};

interface ClientPlanPagosPageProps {
  codigoCredito?: string;
  onBackToCompras: () => void;
}

export const ClientPlanPagosPage: React.FC<ClientPlanPagosPageProps> = ({
  codigoCredito = 'CR-001284',
  onBackToCompras,
}) => {
  const plan = planesMock[codigoCredito] || planesMock['CR-001284'];

  return (
    <div className="space-y-6 w-full">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Plan de pagos
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          {plan.nombre} · {plan.codigo}
        </p>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Monto financiado */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#139a6c] shrink-0">
            <FileText className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Monto financiado</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {plan.montoFinanciado}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              {plan.montoFinanciadoSub}
            </p>
          </div>
        </div>

        {/* Card 2: Total de cuotas */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#139a6c] shrink-0">
            <CreditCard className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de cuotas</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {plan.totalCuotas}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              {plan.totalCuotasSub}
            </p>
          </div>
        </div>

        {/* Card 3: Saldo de capital */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#139a6c] shrink-0">
            <Calendar className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Saldo de capital</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {plan.saldoCapital}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              {plan.saldoCapitalSub}
            </p>
          </div>
        </div>
      </div>

      {/* Card Cronograma */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-900">Cronograma</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            {plan.tasaInfo}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">N.°</th>
                <th className="py-3 px-4">VENCIMIENTO</th>
                <th className="py-3 px-4">SALDO INICIAL</th>
                <th className="py-3 px-4">INTERÉS</th>
                <th className="py-3 px-4">AMORTIZACIÓN</th>
                <th className="py-3 px-4">CUOTA</th>
                <th className="py-3 px-6">SALDO FINAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {plan.cuotas.map((c) => (
                <tr key={c.numero} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {c.numero}
                  </td>
                  <td className="py-4 px-4 font-normal text-slate-600 whitespace-nowrap">
                    {c.vencimiento}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {c.saldoInicial}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {c.interes}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {c.amortizacion}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {c.cuota}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                    {c.saldoFinal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 flex items-center space-x-3 text-xs text-[#065f46]">
        <Info className="w-4 h-4 text-[#059669] shrink-0" />
        <span className="font-normal">
          Solo consulta. Para efectuar un pago, comunicate con Bodega San Blas. No se aceptan pagos parciales.
        </span>
      </div>

      {/* Botón de acción Volver a mis compras */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onBackToCompras}
          className="bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition cursor-pointer active:scale-98"
        >
          Volver a mis compras
        </button>
      </div>
    </div>
  );
};
