import { identificarObligacion } from '../../features/cobranzas/cuentas';
import { Paginacion } from '../../components/shared/Paginacion';
import { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { consultarCorteTienda } from '../../api/finanzas';
import { listarVentas } from '../../api/ventas';
import type { VentaResponse } from '../../types/ventas';
import { obtenerMensajeError } from '../../api/errores';
import { DetalleCorteModal, type CorteItemData } from '../../components/store-admin/DetalleCorteModal';
import { EstadoBadge } from '../../components/store-admin/EstadoBadge';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import type { CorteResponse } from '../../types/finanzas';

function filasDelCorte(cortes: CorteResponse[], dia: string, ventas: VentaResponse[]): CorteItemData[] {
  const fechas = new Map(ventas.map(venta => [venta.id, venta]));
  return cortes.flatMap(corte => {
    const cliente = corte.nombreCliente;
    const compras = new Map(corte.compras.map(compra => [compra.idVenta, compra]));
    return [
      ...corte.obligaciones.map(obligacion => ({
        idVenta: obligacion.idVenta,
        id: `cuota-${obligacion.idCuota}`,
        cliente,
        obligacion: identificarObligacion(compras.get(obligacion.idVenta)?.modalidadPago ?? fechas.get(obligacion.idVenta)?.modalidadPago, obligacion.numeroCuota, obligacion.codigoCredito),
        fechaCorte: obligacion.fechaCorteObligacion,
        fechaPago: obligacion.fechaVencimiento,
        fechaCompra: compras.get(obligacion.idVenta)?.fechaVenta ?? fechas.get(obligacion.idVenta)?.fechaVenta,
        diasAtraso: obligacion.diasAtraso,
        capital: obligacion.amortizacion,
        interesCompensatorio: obligacion.interes,
        mora: obligacion.moraCalculada,
        totalPagar: obligacion.totalPagar,
        moneda: corte.moneda,
        estado: obligacion.enMora ? 'En mora' : obligacion.fechaVencimiento > dia ? 'Por vencer' : 'Pendiente',
        detalles: obligacion.detalles,
      })),
      ...corte.pagosRegistrados.map(pago => ({
        idVenta: pago.idVenta,
        id: `pago-${pago.idPago}`,
        cliente,
        obligacion: identificarObligacion(pago.modalidadPago, pago.numeroCuota, pago.codigoCredito),
        fechaCorte: pago.fechaCorteObligacion,
        fechaPago: pago.fechaPagoPactada,
        fechaCompra: pago.fechaCompra,
        fechaPagoEfectivo: pago.horaPagoEfectivo ? `${pago.fechaPagoEfectivo}T${pago.horaPagoEfectivo}` : pago.fechaPagoEfectivo,
        medioPago: pago.medioPago,
        diasAtraso: pago.diasAtraso,
        capital: pago.capitalPagado,
        interesCompensatorio: pago.interesPagado,
        mora: pago.moraPagada,
        totalPagar: pago.totalPagado,
        moneda: pago.moneda,
        estado: 'Pagado',
        detalles: pago.detalles,
      })),
    ];
  });
}

function comprasOrdenadas(corte: CorteResponse) {
  return [...corte.compras].sort((a, b) => (a.fechaVenta + a.horaVenta).localeCompare(b.fechaVenta + b.horaVenta) || a.idVenta - b.idVenta);
}

function descargarInforme(ciclo: string, cortes: CorteResponse[], filas: CorteItemData[]) {
  const celdas = [
    ['Tipo', 'Cliente', 'Referencia', 'Modalidad de la compra', 'Compra', 'Corte', 'Pago pactado', 'Pago efectivo', 'Medio', 'Días de mora', 'Moneda', 'Capital de la compra', 'Interés total estimado de la compra', 'Capital de la obligación', 'Interés compensatorio de la obligación', 'Mora', 'Total', 'Estado', 'Productos'],
    ...cortes.flatMap(corte => comprasOrdenadas(corte).map(compra => [
      'Compra', corte.nombreCliente, compra.codigoCredito ?? compra.idVenta, compra.modalidadPago === 'UNICO' ? 'Pago único' : 'Mensual', [compra.fechaVenta, compra.horaVenta].filter(Boolean).join(' '), compra.fechaCorteAsignada,
      compra.fechaPagoAsignada, '', '', '', corte.moneda, compra.totalVenta, compra.interesEstimado, '', '', '', '', '',
      compra.detalles.map(detalle => `${detalle.cantidad} × ${detalle.nombreProducto}`).join(' / '),
    ])),
    ...filas.map(fila => [
      fila.estado === 'Pagado' ? 'Pago registrado' : 'Obligación pendiente', fila.cliente, fila.obligacion, '', fila.fechaCompra, fila.fechaCorte, fila.fechaPago,
      fila.fechaPagoEfectivo, fila.medioPago, fila.diasAtraso, fila.moneda, '', '', fila.capital, fila.interesCompensatorio, fila.mora,
      fila.totalPagar, fila.estado, fila.detalles.map(detalle => `${detalle.cantidad} × ${detalle.nombreProducto}`).join(' / '),
    ]),
  ];
  const csv = celdas.map(fila => fila.map(valor => {
    const texto = String(valor ?? '');
    return '"' + (/^[\s]*[=+@-]|^[\t\r\n]/.test(texto) ? "'" + texto : texto).replaceAll('"', '""') + '"';
  }).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `corte-${ciclo}.csv`;
  enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const control = 'min-h-11 rounded-lg border border-jades-line bg-white px-3 text-sm';

export function StoreCortesPage({ idTienda }: { idTienda: number }) {
  const hoy = hoyLima();
  const [ciclo, setCiclo] = useState(hoy.slice(0, 7));
  const [dia, setDia] = useState(hoy);
  const [intento, setIntento] = useState(0);
  const [consulta, setConsulta] = useState<{ clave: string; datos: CorteResponse[]; error: string; ventas?: VentaResponse[]; errorVentas?: string }>();
  const [seleccionado, setSeleccionado] = useState<CorteItemData | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [moneda, setMoneda] = useState('');
  const [vista, setVista] = useState<'obligaciones' | 'compras'>('obligaciones');
  const [pagina, setPagina] = useState(1);
  const clave = `${idTienda}|${ciclo}|${dia}|${intento}`;
  const resultado = consulta?.clave === clave ? consulta : null;

  useEffect(() => {
    if (!ciclo || !dia || dia > hoy) return;
    const controller = new AbortController();
    consultarCorteTienda(idTienda, { ciclo, fechaEvaluacion: dia }, controller.signal)
      .then(async datos => {
        const requiereVentas = datos.some(corte => {
          const incluidas = new Set(corte.compras.map(compra => compra.idVenta));
          return corte.obligaciones.some(obligacion => !incluidas.has(obligacion.idVenta));
        });
        if (!requiereVentas) {
          if (!controller.signal.aborted) setConsulta({ clave, datos, error: '' });
          return;
        }
        try {
          const ventas = await listarVentas(idTienda, undefined, controller.signal);
          if (!controller.signal.aborted) setConsulta({ clave, datos, ventas, error: '' });
        } catch (causa) {
          if (!controller.signal.aborted) setConsulta({ clave, datos, error: '', errorVentas: obtenerMensajeError(causa) });
        }
      })
      .catch((error: unknown) => { if (!controller.signal.aborted) setConsulta({ clave, datos: [], error: obtenerMensajeError(error) }); });
    return () => controller.abort();
  }, [idTienda, ciclo, dia, hoy, clave]);

  const cortes = (resultado?.datos ?? []).filter(corte => !moneda || corte.moneda === moneda);
  const filas = filasDelCorte(cortes, dia, resultado?.ventas ?? []);
  const coincide = (texto: string) => texto.toLocaleLowerCase('es-PE').includes(busqueda.trim().toLocaleLowerCase('es-PE'));
  const filtradas = filas.filter(fila => (!estado || estado === fila.estado) && coincide(`${fila.cliente} ${fila.obligacion}`));
  const compras = cortes.flatMap(corte => comprasOrdenadas(corte)
    .filter(compra => coincide(`${corte.nombreCliente} ${compra.codigoCredito ?? compra.idVenta} ${compra.detalles.map(detalle => detalle.nombreProducto).join(' ')}`))
    .map(compra => ({ corte, compra })));
  const total = vista === 'compras' ? compras.length : filtradas.length;
  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(total / 10)));
  const monedas = moneda ? [moneda] : ['PEN', 'USD'];
  const metricas = [
    ['Capital pendiente', 'totalCapitalExigible'], ['Interés compensatorio pendiente', 'totalInteresesPeriodo'],
    ['Interés moratorio', 'totalMoraAcumulada'], ['Total pendiente', 'totalExigible'],
  ] as const;

  return <div className="space-y-[18px]">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-xl font-bold text-jades-ink">Cortes y cobranzas</h2><p className="text-sm text-jades-muted">Compras y obligaciones por ciclo.</p></div>
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs font-semibold">Mes del corte<input className={control} type="month" value={ciclo} onChange={e => { setCiclo(e.target.value); setPagina(1); }} /></label>
        <label className="grid gap-1 text-xs font-semibold">Fecha de evaluación<input className={control} type="date" value={dia} max={hoy} onChange={e => { setDia(e.target.value); setPagina(1); }} /></label>
      </div>
    </header>
    {(!ciclo || !dia || dia > hoy) && <p role="alert" className="text-sm text-red-700">Selecciona un mes y una fecha de evaluación válida.</p>}
    {ciclo && dia && dia <= hoy && !resultado && <p role="status" className="text-sm text-jades-muted">Consultando el corte…</p>}
    {resultado?.error && <p role="alert" className="text-sm text-red-700">{resultado.error} <button className="font-semibold underline" onClick={() => setIntento(n => n + 1)}>Reintentar</button></p>}
    {resultado && !resultado.error && <>
      <div className="grid gap-[14px] sm:grid-cols-2 2xl:grid-cols-5">
        <div className="jades-dashboard-metric min-w-0 rounded-xl border border-jades-line bg-white p-4"><p className="text-sm text-jades-muted">Clientes incluidos</p><p className="text-xl font-bold">{new Set(cortes.filter(corte => corte.compras.length || corte.obligaciones.length || corte.pagosRegistrados.length).map(corte => corte.idCliente)).size}</p></div>
        {metricas.map(([titulo, campo]) => <div key={campo} className="jades-dashboard-metric min-w-0 rounded-xl border border-jades-line bg-white p-4">
          <p className="text-sm text-jades-muted">{titulo}</p>
          {monedas.map(m => <p key={m} className="break-words font-bold tabular-nums text-jades-ink">{dinero(cortes.filter(corte => corte.moneda === m).reduce((suma, corte) => suma + corte.resumen[campo], 0), m)}</p>)}
        </div>)}
      </div>
      <p className="text-sm text-slate-700">Cobrado en el listado {monedas.map(m => dinero(cortes.filter(corte => corte.moneda === m).reduce((suma, corte) => suma + corte.resumen.totalPagadoListado, 0), m)).join(' · ')}</p>
      {resultado.errorVentas && <p role="alert" className="text-sm text-red-700">No se pudieron consultar algunas fechas de compra. {resultado.errorVentas} <button className="font-semibold underline" onClick={() => setIntento(n => n + 1)}>Reintentar</button></p>}
      <div className="overflow-hidden rounded-xl border border-jades-line bg-white">
        <div className="flex flex-wrap gap-3 border-b border-jades-line p-4">
          <input aria-label="Buscar cliente u obligación" placeholder="Buscar cliente u obligación" className={control} value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          <select aria-label="Contenido del corte" className={control} value={vista} onChange={e => { setVista(e.target.value as typeof vista); setPagina(1); }}>
            <option value="obligaciones">Obligaciones y pagos</option><option value="compras">Compras por cliente</option>
          </select>
          <select aria-label="Moneda" className={control} value={moneda} onChange={e => { setMoneda(e.target.value); setPagina(1); }}>
            <option value="">Todas las monedas</option><option value="PEN">Soles (PEN)</option><option value="USD">Dólares (USD)</option>
          </select>
          {vista === 'obligaciones' && <select aria-label="Estado" className={control} value={estado} onChange={e => { setEstado(e.target.value); setPagina(1); }}>
            <option value="">Todos los estados</option>
            {['Pendiente', 'Por vencer', 'En mora', 'Pagado'].map(valor => <option key={valor}>{valor}</option>)}
          </select>}
          <button type="button" className={control + ' ml-auto inline-flex items-center gap-2 font-semibold disabled:opacity-50'} disabled={!filas.length && !cortes.some(corte => corte.compras.length)} onClick={() => descargarInforme(ciclo, cortes, filas)}>
            <Download aria-hidden="true" className="size-4" /> Descargar informe CSV
          </button>
        </div>
        {vista === 'compras' ? <div className="divide-y divide-jades-line">
          {compras.slice((paginaActual - 1) * 10, paginaActual * 10).map(({ corte, compra }) => (
            <details key={compra.idVenta} className="p-4 text-sm">
              <summary className="cursor-pointer font-semibold">{corte.nombreCliente} · {fecha(compra.fechaVenta)} {compra.horaVenta} · {compra.codigoCredito ?? `Venta #${compra.idVenta}`} · {dinero(compra.totalVenta, corte.moneda)}</summary>
              <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                <div><dt>Corte histórico</dt><dd>{compra.fechaCorteAsignada?.replace('T', ' ') ?? '—'}</dd></div>
                <div><dt>Modalidad</dt><dd>{compra.modalidadPago === 'UNICO' ? 'Pago único' : `Mensual · ${compra.numeroCuotas} cuotas`}</dd></div>
                <div><dt>Primer pago pactado</dt><dd>{fecha(compra.fechaPagoAsignada)}</dd></div>
                <div><dt>Interés total estimado del financiamiento</dt><dd>{dinero(compra.interesEstimado, corte.moneda)}</dd></div>
              </dl>
              <ul className="my-3">{compra.detalles.map(item => <li key={item.idProducto}>{item.cantidad} × {item.nombreProducto} · {dinero(item.subtotal, corte.moneda)}</li>)}</ul>
              <div className="flex flex-wrap gap-2">
                {filas.filter(item => item.idVenta === compra.idVenta).map(item => <button key={item.id} type="button" className={control} onClick={() => setSeleccionado(item)}>{item.obligacion} · {item.estado} · {dinero(item.totalPagar, item.moneda)}</button>)}
              </div>
            </details>
          ))}
          {!compras.length && <p className="p-8 text-center text-sm text-jades-muted">No hay compras para esta consulta.</p>}
        </div> : <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-jades-subtle text-jades-muted">
              <tr>{['Cliente / obligación', 'Corte', 'Pago pactado', 'Capital', 'Interés', 'Mora', 'Total', 'Estado', 'Detalle'].map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-jades-line">
              {filtradas.slice((paginaActual - 1) * 10, paginaActual * 10).map(fila => <tr key={fila.id}>
                <td className="px-4 py-3"><strong className="block">{fila.cliente}</strong>{fila.obligacion}</td>
                <td className="whitespace-nowrap px-4 py-3">{fecha(fila.fechaCorte)} {fila.fechaCorte?.split('T')[1]?.slice(0, 5)}</td>
                <td className="whitespace-nowrap px-4 py-3">{fecha(fila.fechaPago)}</td>
                {[fila.capital, fila.interesCompensatorio, fila.mora, fila.totalPagar].map((valor, i) => <td key={i} className="whitespace-nowrap px-4 py-3">{dinero(valor, fila.moneda)}</td>)}
                <td className="whitespace-nowrap px-4 py-3"><EstadoBadge estado={fila.estado} /></td>
                <td className="px-4 py-3"><button type="button" aria-label={`Ver detalle de ${fila.cliente}, ${fila.obligacion}`} className="grid size-11 place-items-center rounded-lg hover:bg-slate-100" onClick={() => setSeleccionado(fila)}><Eye aria-hidden="true" className="size-4" /></button></td>
              </tr>)}
              {!filtradas.length && <tr><td colSpan={9} className="p-8 text-center text-jades-muted">No hay obligaciones para esta consulta.</td></tr>}
            </tbody>
          </table>
        </div>}
        <Paginacion total={total} pagina={paginaActual} onCambiar={setPagina} etiqueta={vista === 'compras' ? 'compras' : 'obligaciones'} />
      </div>
    </>}
    {seleccionado && <DetalleCorteModal corte={seleccionado} onClose={() => setSeleccionado(null)} />}
  </div>;
}
