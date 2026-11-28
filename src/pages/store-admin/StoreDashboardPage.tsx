import { useState } from 'react';
import { AyudaCampo } from '../../components/shared/AyudaCampo';
import type { Moneda } from '../../types/finanzas';
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, CreditCard, Plus } from 'lucide-react';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import { obligacionesPendientes, proximosSieteDias, useCuentasTienda } from '../../features/cobranzas/cuentas';

interface Props {
  idTienda: number;
  revision: number;
  soloConsulta: boolean;
  onGoToClients: () => void;
  onGoToPayments: () => void;
  onGoToSales: () => void;
}

export function StoreDashboardPage({ idTienda, revision, soloConsulta, onGoToClients, onGoToPayments, onGoToSales }: Props) {
  const { cuentas, cargando, error, recargar } = useCuentasTienda(idTienda, revision);
  const hoy = hoyLima();
  const [monedaGrafico, setMonedaGrafico] = useState<Moneda>('PEN');
  const obligaciones = obligacionesPendientes(cuentas);
  const proximos = obligaciones.filter(o => o.fechaVencimiento === hoy || proximosSieteDias(o.fechaVencimiento, hoy));
  const pagos = cuentas.flatMap(cuenta => cuenta.pagos.map(pago => ({ ...pago, cliente: cuenta.nombreCliente })));
  const indicadores = [
    { titulo: 'Total por cobrar', icono: CreditCard, filas: obligaciones.map(o => ({ monto: o.importePendiente, moneda: o.moneda })) },
    { titulo: 'Cobrado este mes', icono: CheckCircle2, filas: pagos.filter(pago => pago.fechaPago.slice(0, 7) === hoy.slice(0, 7)).map(pago => ({ monto: pago.totalExigible, moneda: pago.moneda })) },
    { titulo: 'Vence en los próximos 7 días', icono: Clock, filas: proximos.map(o => ({ monto: o.importePendiente, moneda: o.moneda })) },
    { titulo: 'Deuda en mora', icono: AlertTriangle, filas: obligaciones.filter(o => o.estado === 'En mora').map(o => ({ monto: o.importePendiente, moneda: o.moneda })) },
  ];
  const actividad = [
    ...pagos.map(pago => ({ id: `pago-${pago.idPago}`, etiqueta: 'Pago recibido', dia: pago.fechaPago, cliente: pago.cliente, monto: dinero(pago.totalExigible, pago.moneda) })),
    ...cuentas.flatMap(cuenta => cuenta.compras.map(compra => ({
      id: `venta-${compra.idVenta}`, etiqueta: 'Venta registrada', dia: compra.fechaCompra,
      cliente: cuenta.nombreCliente, monto: dinero(compra.total, compra.moneda),
    }))),
  ].sort((a, b) => b.dia.localeCompare(a.dia)).slice(0, 6);

  const meses = Array.from({ length: 6 }, (_, indice) => {
    const fechaMes = new Date(hoy.slice(0, 7) + '-01T00:00:00Z');
    fechaMes.setUTCMonth(fechaMes.getUTCMonth() - 5 + indice);
    const periodo = fechaMes.toISOString().slice(0, 7);
    const etiqueta = new Intl.DateTimeFormat('es-PE', { month: 'short', timeZone: 'UTC' }).format(fechaMes);
    const esperado = cuentas.reduce((suma, cuenta) => {
      const anuladas = new Set(cuenta.compras.filter(compra => compra.estado === 'ANULADA').map(compra => compra.idVenta));
      return suma + cuenta.obligaciones.filter(cuota => cuota.moneda === monedaGrafico
        && cuota.fechaVencimiento.startsWith(periodo) && !anuladas.has(cuota.idVenta))
        .reduce((total, cuota) => total + cuota.importeCuota, 0);
    }, 0);
    const recibido = pagos.filter(pago => pago.moneda === monedaGrafico && pago.fechaPago.startsWith(periodo))
      .reduce((suma, pago) => suma + pago.totalExigible, 0);
    return { periodo, etiqueta, esperado, recibido };
  });
  const escala = Math.max(1, ...meses.flatMap(mes => [mes.esperado, mes.recibido]));

  return <div className="space-y-[18px]">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-jades-ink">Inicio</h2>
        <p className="text-sm text-jades-muted">{fecha(hoy)}</p>
      </div>
      {!soloConsulta && <button type="button" onClick={onGoToSales} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-jades-primary px-4 text-sm font-semibold text-white hover:bg-jades-hover">
        <Plus aria-hidden="true" className="size-4" /> Registrar venta
      </button>}
    </div>
    {cargando && <p role="status" className="text-sm text-jades-muted">Cargando indicadores…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error} <button className="font-semibold underline" onClick={recargar}>Reintentar</button></p>}
    {!cargando && !error && <>
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
        {indicadores.map(({ titulo, icono: Icono, filas }) => <div key={titulo} className="jades-dashboard-metric flex min-w-0 items-start gap-3 rounded-xl border border-jades-line bg-white p-5">
          <div className="rounded-lg bg-emerald-50 p-3 text-jades-primary"><Icono aria-hidden="true" className="size-5" /></div>
          <div>
            <p className="text-sm font-medium text-jades-muted">{titulo}</p>
            {(['PEN', 'USD'] as const).map(moneda => <p key={moneda} className="mt-1 break-words text-lg font-bold tabular-nums text-jades-ink">
              {dinero(filas.filter(fila => fila.moneda === moneda).reduce((total, fila) => total + fila.monto, 0), moneda)}
            </p>)}
          </div>
        </div>)}
      </div>
      <div className="grid gap-[18px] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-[13px] border border-jades-line bg-white p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div><h3 className="text-[15px] font-bold">Cobros de los últimos seis meses</h3><p className="text-sm text-jades-muted">Pagos recibidos y esperados</p></div>
            <select aria-label="Moneda de cobros" value={monedaGrafico} onChange={e => setMonedaGrafico(e.target.value as Moneda)} className="min-h-11 rounded-lg border border-jades-line bg-white px-3 text-sm">
              <option value="PEN">Soles (PEN)</option><option value="USD">Dólares (USD)</option>
            </select>
          </div>
          <ol className="mt-4 grid grid-cols-6 gap-2 border-b border-jades-line text-center text-xs">
            {meses.map(mes => <li key={mes.periodo}>
              <div className="flex h-40 items-end justify-center gap-1.5" role="img" aria-label={`${mes.etiqueta}, esperado ${dinero(mes.esperado, monedaGrafico)}, recibido ${dinero(mes.recibido, monedaGrafico)}`}>
                <span aria-hidden="true" title={`Esperado ${dinero(mes.esperado, monedaGrafico)}`} className="w-3 rounded-t bg-[#c9eadd] sm:w-5" style={{ height: `${mes.esperado / escala * 100}%` }} />
                <span aria-hidden="true" title={`Recibido ${dinero(mes.recibido, monedaGrafico)}`} className="w-3 rounded-t bg-jades-primary sm:w-5" style={{ height: `${mes.recibido / escala * 100}%` }} />
              </div>
              <p className="py-2 capitalize">{mes.etiqueta}</p>
            </li>)}
          </ol>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><span aria-hidden="true" className="size-3 rounded-sm bg-[#c9eadd]" /> Esperado</span>
            <span className="flex items-center gap-1"><span aria-hidden="true" className="size-3 rounded-sm bg-jades-primary" /> Recibido</span>
            <AyudaCampo etiqueta="el resumen de cobros" texto="Esperado agrupa las cuotas por vencimiento. Recibido agrupa los pagos registrados por fecha efectiva." />
          </div>
        </section>
        <section className="rounded-xl border border-jades-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-bold">Próximos cobros</h3>
            <button type="button" onClick={onGoToPayments} className="flex items-center gap-1 text-sm font-semibold text-jades-primary">Ver pagos <ChevronRight className="size-4" aria-hidden="true" /></button>
          </div>
          <ul className="mt-2 divide-y divide-jades-line">
            {proximos.slice(0, 6).map(o => <li className="flex justify-between gap-3 py-3 text-sm" key={o.idCuota}>
              <span><strong className="block">{o.cliente}</strong>{o.obligacion}</span>
              <span className="text-right"><strong className="block">{dinero(o.importePendiente, o.moneda)}</strong>{fecha(o.fechaVencimiento)}</span>
            </li>)}
          </ul>
          {!proximos.length && <p className="py-4 text-sm text-jades-muted">No hay vencimientos próximos.</p>}
        </section>
        <section className="rounded-xl border border-jades-line bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-bold">Actividad reciente</h3>
            <button type="button" onClick={onGoToClients} className="flex items-center gap-1 text-sm font-semibold text-jades-primary">Ver clientes <ChevronRight className="size-4" aria-hidden="true" /></button>
          </div>
          <ul className="mt-2 divide-y divide-jades-line">
            {actividad.map(item => <li className="flex justify-between gap-3 py-3 text-sm" key={item.id}>
              <span><strong className="block">{item.etiqueta}</strong>{item.cliente}</span>
              <span className="text-right"><strong className="block">{item.monto}</strong>{fecha(item.dia)}</span>
            </li>)}
          </ul>
          {!actividad.length && <p className="py-4 text-sm text-jades-muted">No hay movimientos registrados.</p>}
        </section>
      </div>
    </>}
  </div>;
}
