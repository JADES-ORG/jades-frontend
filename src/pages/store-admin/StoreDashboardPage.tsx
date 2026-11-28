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

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inicio</h2>
        <p className="text-sm text-slate-600">{fecha(hoy)}</p>
      </div>
      {!soloConsulta && <button type="button" onClick={onGoToSales} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#137b57] px-4 text-sm font-semibold text-white hover:bg-[#0f6648]">
        <Plus aria-hidden="true" className="size-4" /> Registrar venta
      </button>}
    </div>
    {cargando && <p role="status" className="text-sm text-slate-600">Cargando indicadores…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error} <button className="font-semibold underline" onClick={recargar}>Reintentar</button></p>}
    {!cargando && !error && <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicadores.map(({ titulo, icono: Icono, filas }) => <div key={titulo} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="rounded-lg bg-emerald-50 p-3 text-[#137b57]"><Icono aria-hidden="true" className="size-5" /></div>
          <div>
            <p className="text-sm font-medium text-slate-600">{titulo}</p>
            {(['PEN', 'USD'] as const).map(moneda => <p key={moneda} className="mt-1 font-bold text-slate-900">
              {dinero(filas.filter(fila => fila.moneda === moneda).reduce((total, fila) => total + fila.monto, 0), moneda)}
            </p>)}
          </div>
        </div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Próximos cobros</h3>
            <button type="button" onClick={onGoToPayments} className="flex items-center gap-1 text-sm font-semibold text-[#137b57]">Ver pagos <ChevronRight className="size-4" aria-hidden="true" /></button>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {proximos.slice(0, 6).map(o => <li className="flex justify-between gap-3 py-3 text-sm" key={o.idCuota}>
              <span><strong className="block">{o.cliente}</strong>{o.obligacion}</span>
              <span className="text-right"><strong className="block">{dinero(o.importePendiente, o.moneda)}</strong>{fecha(o.fechaVencimiento)}</span>
            </li>)}
          </ul>
          {!proximos.length && <p className="py-4 text-sm text-slate-600">No hay vencimientos próximos.</p>}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Actividad reciente</h3>
            <button type="button" onClick={onGoToClients} className="flex items-center gap-1 text-sm font-semibold text-[#137b57]">Ver clientes <ChevronRight className="size-4" aria-hidden="true" /></button>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {actividad.map(item => <li className="flex justify-between gap-3 py-3 text-sm" key={item.id}>
              <span><strong className="block">{item.etiqueta}</strong>{item.cliente}</span>
              <span className="text-right"><strong className="block">{item.monto}</strong>{fecha(item.dia)}</span>
            </li>)}
          </ul>
          {!actividad.length && <p className="py-4 text-sm text-slate-600">No hay movimientos registrados.</p>}
        </section>
      </div>
    </>}
  </div>;
}
