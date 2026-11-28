import { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { consultarCorteTienda } from '../../api/finanzas';
import { obtenerMensajeError } from '../../api/errores';
import { DetalleCorteModal, type CorteItemData } from '../../components/store-admin/DetalleCorteModal';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import type { CorteResponse } from '../../types/finanzas';

function filasDelCorte(cortes: CorteResponse[], dia: string): CorteItemData[] {
  return cortes.flatMap(corte => {
    const cliente = corte.nombreCliente;
    const compras = new Map(corte.compras.map(compra => [compra.idVenta, compra]));
    return [
      ...corte.obligaciones.map(obligacion => ({
        id: `cuota-${obligacion.idCuota}`,
        cliente,
        obligacion: `${obligacion.codigoCredito} · Cuota ${obligacion.numeroCuota}`,
        fechaCorte: obligacion.fechaCorteObligacion,
        fechaPago: obligacion.fechaVencimiento,
        fechaCompra: compras.get(obligacion.idVenta)?.fechaVenta,
        capital: obligacion.amortizacion,
        interesCompensatorio: obligacion.interes,
        mora: obligacion.moraCalculada,
        totalPagar: obligacion.totalPagar,
        moneda: corte.moneda,
        estado: obligacion.enMora ? 'En mora' : obligacion.fechaVencimiento > dia ? 'Por vencer' : 'Pendiente',
        detalles: obligacion.detalles,
      })),
      ...corte.pagosRegistrados.map(pago => ({
        id: `pago-${pago.idPago}`,
        cliente,
        obligacion: `${pago.codigoCredito} · Cuota ${pago.numeroCuota}`,
        fechaCorte: pago.fechaCorteObligacion,
        fechaPago: pago.fechaPagoPactada,
        fechaCompra: pago.fechaCompra,
        fechaPagoEfectivo: pago.horaPagoEfectivo ? `${pago.fechaPagoEfectivo}T${pago.horaPagoEfectivo}` : pago.fechaPagoEfectivo,
        medioPago: pago.medioPago,
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

function descargarInforme(ciclo: string, cortes: CorteResponse[], filas: CorteItemData[]) {
  const celdas = [
    ['Tipo', 'Cliente', 'Referencia', 'Compra', 'Corte', 'Pago pactado', 'Pago efectivo', 'Medio', 'Moneda', 'Capital', 'Interés', 'Mora', 'Total', 'Estado', 'Productos'],
    ...cortes.flatMap(corte => corte.compras.map(compra => [
      'Compra', corte.nombreCliente, compra.codigoCredito ?? compra.idVenta, compra.fechaVenta, compra.fechaCorteAsignada,
      compra.fechaPagoAsignada, '', '', corte.moneda, '', compra.interesEstimado, '', compra.totalVenta, '',
      compra.detalles.map(detalle => `${detalle.cantidad} × ${detalle.nombreProducto}`).join(' / '),
    ])),
    ...filas.map(fila => [
      'Obligación', fila.cliente, fila.obligacion, fila.fechaCompra, fila.fechaCorte, fila.fechaPago,
      fila.fechaPagoEfectivo, fila.medioPago, fila.moneda, fila.capital, fila.interesCompensatorio, fila.mora,
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

const control = 'min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm';

export function StoreCortesPage({ idTienda }: { idTienda: number }) {
  const hoy = hoyLima();
  const [ciclo, setCiclo] = useState(hoy.slice(0, 7));
  const [dia, setDia] = useState(hoy);
  const [intento, setIntento] = useState(0);
  const [consulta, setConsulta] = useState<{ clave: string; datos: CorteResponse[]; error: string }>();
  const [seleccionado, setSeleccionado] = useState<CorteItemData | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const clave = `${ciclo}|${dia}|${intento}`;
  const resultado = consulta?.clave === clave ? consulta : null;

  useEffect(() => {
    if (!ciclo || !dia || dia > hoy) return;
    const controller = new AbortController();
    consultarCorteTienda(idTienda, { ciclo, fechaEvaluacion: dia }, controller.signal)
      .then(datos => { if (!controller.signal.aborted) setConsulta({ clave, datos, error: '' }); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setConsulta({ clave, datos: [], error: obtenerMensajeError(error) }); });
    return () => controller.abort();
  }, [idTienda, ciclo, dia, hoy, clave]);

  const cortes = resultado?.datos ?? [];
  const filas = filasDelCorte(cortes, dia);
  const filtradas = filas.filter(fila => (!estado || estado === fila.estado)
    && `${fila.cliente} ${fila.obligacion}`.toLocaleLowerCase('es-PE').includes(busqueda.trim().toLocaleLowerCase('es-PE')));
  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(filtradas.length / 10)));

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-xl font-bold text-slate-900">Cortes y cobranzas</h2><p className="text-sm text-slate-600">Compras y obligaciones por ciclo.</p></div>
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs font-semibold">Mes del corte<input className={control} type="month" value={ciclo} onChange={e => { setCiclo(e.target.value); setPagina(1); }} /></label>
        <label className="grid gap-1 text-xs font-semibold">Fecha de evaluación<input className={control} type="date" value={dia} max={hoy} onChange={e => { setDia(e.target.value); setPagina(1); }} /></label>
      </div>
    </header>
    {(!ciclo || !dia || dia > hoy) && <p role="alert" className="text-sm text-red-700">Selecciona un mes y una fecha de evaluación válida.</p>}
    {ciclo && dia && dia <= hoy && !resultado && <p role="status" className="text-sm text-slate-600">Consultando el corte…</p>}
    {resultado?.error && <p role="alert" className="text-sm text-red-700">{resultado.error} <button className="font-semibold underline" onClick={() => setIntento(n => n + 1)}>Reintentar</button></p>}
    {resultado && !resultado.error && <>
      <div className="grid gap-4 sm:grid-cols-3">
        {([['Compras del ciclo', 'totalComprasCiclo'], ['Total exigible', 'totalExigible'], ['Total pagado', 'totalPagadoListado']] as const).map(([titulo, campo]) => (
          <div key={campo} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">{titulo}</p>
            {(['PEN', 'USD'] as const).map(moneda => <p key={moneda} className="text-lg font-bold text-slate-900">
              {dinero(cortes.filter(corte => corte.moneda === moneda).reduce((suma, corte) => suma + corte.resumen[campo], 0), moneda)}
            </p>)}
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <input aria-label="Buscar cliente u obligación" placeholder="Buscar cliente u obligación" className={control} value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
          <select aria-label="Estado" className={control} value={estado} onChange={e => { setEstado(e.target.value); setPagina(1); }}>
            <option value="">Todos los estados</option>
            {['Pendiente', 'Por vencer', 'En mora', 'Pagado'].map(valor => <option key={valor}>{valor}</option>)}
          </select>
          <button type="button" className={control + ' ml-auto inline-flex items-center gap-2 font-semibold disabled:opacity-50'} disabled={!filas.length && !cortes.some(corte => corte.compras.length)} onClick={() => descargarInforme(ciclo, cortes, filas)}>
            <Download aria-hidden="true" className="size-4" /> Descargar informe CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>{['Cliente / obligación', 'Corte', 'Pago pactado', 'Capital', 'Interés', 'Mora', 'Total', 'Estado', 'Detalle'].map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.slice((paginaActual - 1) * 10, paginaActual * 10).map(fila => <tr key={fila.id}>
                <td className="px-4 py-3"><strong className="block">{fila.cliente}</strong>{fila.obligacion}</td>
                <td className="whitespace-nowrap px-4 py-3">{fecha(fila.fechaCorte)} {fila.fechaCorte?.split('T')[1]?.slice(0, 5)}</td>
                <td className="whitespace-nowrap px-4 py-3">{fecha(fila.fechaPago)}</td>
                {[fila.capital, fila.interesCompensatorio, fila.mora, fila.totalPagar].map((valor, i) => <td key={i} className="whitespace-nowrap px-4 py-3">{dinero(valor, fila.moneda)}</td>)}
                <td className="whitespace-nowrap px-4 py-3">{fila.estado}</td>
                <td className="px-4 py-3"><button type="button" aria-label={`Ver detalle de ${fila.cliente}, ${fila.obligacion}`} className="grid size-11 place-items-center rounded-lg hover:bg-slate-100" onClick={() => setSeleccionado(fila)}><Eye aria-hidden="true" className="size-4" /></button></td>
              </tr>)}
              {!filtradas.length && <tr><td colSpan={9} className="p-8 text-center text-slate-600">No hay obligaciones para esta consulta.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 text-sm">
          <span>{filtradas.length} obligaciones</span>
          {filtradas.length > 10 && <div className="flex gap-3 items-center">
            <button className="min-h-11 disabled:opacity-40" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
            <span>{paginaActual} de {Math.ceil(filtradas.length / 10)}</span>
            <button className="min-h-11 disabled:opacity-40" disabled={paginaActual * 10 >= filtradas.length} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
          </div>}
        </div>
      </div>
    </>}
    {seleccionado && <DetalleCorteModal corte={seleccionado} onClose={() => setSeleccionado(null)} />}
  </div>;
}
