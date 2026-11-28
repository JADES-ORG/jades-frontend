import { dinero, fecha, porcentaje } from '../../features/client-portal/model';
import type { CronogramaResponse } from '../../types/finanzas';

export function CronogramaCredito({ plan, definitivo = false }: { plan: CronogramaResponse; definitivo?: boolean }) {
  const m = (v: number) => dinero(v, plan.moneda);
  return <section className="space-y-4">
    <h4 className="text-sm font-bold text-slate-900">{definitivo ? 'Cronograma registrado' : 'Cronograma preliminar — método francés'}</h4>
    <dl className="grid gap-3 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">{([
      ['Fecha de venta', plan.fechaVenta], ['Fecha de corte', plan.fechaCorte],
      ['Fin de gracia', plan.fechaFinGracia ?? '—'], ['Días de gracia', plan.diasGracia ?? '—'],
      ['Capital inicial', m(plan.capitalVenta)], ['Interés de gracia', m(plan.interesGracia)],
      ['Capital capitalizado', m(plan.capitalCapitalizado)], ['Cuota base', m(plan.cuotaBase)],
      ['TEM', porcentaje(plan.tasaEfectivaMensual)], ['Número de cuotas', plan.numeroCuotas], ['Primera cuota', fecha(plan.cuotas[0]?.fechaVencimiento)],
      ['Intereses de cuotas', m(plan.interesesTotales)],
      ['Total a pagar', m(plan.totalFinanciamiento)],
    ] as const).map(([titulo, valor]) => <div key={titulo}><dt className="text-slate-600">{titulo}</dt><dd className="font-semibold">{valor}</dd></div>)}</dl>
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-500"><tr>{['N.°','Vencimiento','Saldo inicial','Interés','Amortización','Cuota','Saldo final'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{plan.cuotas.map(c => <tr key={c.numeroCuota}>
          <td className="p-3">{c.numeroCuota}</td><td className="p-3">{c.fechaVencimiento}</td>
          <td className="p-3">{m(c.saldoInicial)}</td><td className="p-3">{m(c.interes)}</td>
          <td className="p-3">{m(c.amortizacion)}</td><td className="p-3 font-semibold">{m(c.cuota)}</td><td className="p-3">{m(c.saldoFinal)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="text-xs text-slate-500">Ajuste última cuota: {m(plan.ajusteUltimaCuota)}.</p>
  </section>;
}
