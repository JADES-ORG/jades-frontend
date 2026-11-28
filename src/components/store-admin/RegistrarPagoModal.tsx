import { AyudaCampo } from '../shared/AyudaCampo';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { consultarImporteCuota, consultarLiquidacion, liquidarCredito, registrarPago } from '../../api/finanzas';
import { obtenerMensajeError } from '../../api/errores';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import type { ObligacionCobro } from '../../features/cobranzas/cuentas';
import type { LiquidacionResponse, PagoResponse } from '../../types/finanzas';
import { AvisoError, botonPrincipalModal, botonSecundarioModal, cuerpoModal, ModalShell } from './ModalShell';

interface Props {
  obligacion: ObligacionCobro;
  onClose: () => void;
  onRegistrado: (resultado: LiquidacionResponse | PagoResponse, medio: string) => void;
}

const campo = 'block w-full min-h-11 mt-1 rounded-lg border border-slate-200 bg-white px-3 text-sm';

export function RegistrarPagoModal({ obligacion, onClose, onRegistrado }: Props) {
  const hoy = hoyLima();
  const [dia, setDia] = useState(hoy);
  const [hora, setHora] = useState(() => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(new Date()));
  const [medio, setMedio] = useState('EFECTIVO');
  const [liquidacion, setLiquidacion] = useState(obligacion.mensual && obligacion.fechaVencimiento.slice(0, 7) > hoy.slice(0, 7));
  const [cotizacion, setCotizacion] = useState<{ clave: string; datos: LiquidacionResponse } | null>(null);
  const [error, setError] = useState<{ clave: string; mensaje: string } | null>(null);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);
  const cuotaFutura = obligacion.mensual && obligacion.fechaVencimiento.slice(0, 7) > dia.slice(0, 7);
  const cotizarLiquidacion = liquidacion || cuotaFutura;
  const clave = `${dia}|${hora}|${cotizarLiquidacion}|${intento}`;
  const importe = cotizacion?.clave === clave ? cotizacion.datos : null;
  const errorCotizacion = error?.clave === clave ? error.mensaje : null;
  const fechaHabilitada = !obligacion.mensual || dia.slice(0, 7) >= obligacion.inicioCobro;
  const valido = !!dia && dia <= hoy && !!hora && fechaHabilitada;

  useEffect(() => {
    if (!valido) return;
    const controller = new AbortController();
    const filtros = { fechaPagoEfectivo: dia, horaPagoEfectivo: hora };
    const timer = window.setTimeout(() => {
      const solicitud = cotizarLiquidacion
        ? consultarLiquidacion(obligacion.idCredito, filtros, controller.signal)
        : consultarImporteCuota(obligacion.idCuota, filtros, controller.signal);
      solicitud.then(datos => {
        if (!controller.signal.aborted) setCotizacion({ clave, datos });
      }).catch((causa: unknown) => {
        if (!controller.signal.aborted) setError({ clave, mensaje: obtenerMensajeError(causa) });
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [valido, dia, hora, cotizarLiquidacion, obligacion.idCredito, obligacion.idCuota, clave]);

  async function confirmar(event: FormEvent) {
    event.preventDefault();
    if (!importe || importe.totalPagar <= 0 || !valido || enviando.current) return;
    enviando.current = true;
    setGuardando(true);
    setErrorRegistro(null);
    try {
      const solicitud = { monto: importe.totalPagar, fechaPagoEfectivo: dia, horaPagoEfectivo: hora, medioPago: medio };
      const resultado = cotizarLiquidacion
        ? await liquidarCredito(obligacion.idCredito, solicitud)
        : await registrarPago(obligacion.idCuota, solicitud);
      onRegistrado(resultado, medio);
    } catch (causa) {
      setErrorRegistro(obtenerMensajeError(causa));
      setIntento(n => n + 1);
    } finally {
      enviando.current = false;
      setGuardando(false);
    }
  }

  return <ModalShell titulo="Gestionar pago" descripcion={`${obligacion.cliente} · ${obligacion.obligacion}`} onClose={onClose} bloqueado={guardando}>
    <form className={cuerpoModal} onSubmit={confirmar}>
      <div className="flex items-baseline gap-2 text-sm text-slate-600">
        <span>Vencimiento pactado {fecha(obligacion.fechaVencimiento)}</span>
        <AyudaCampo etiqueta="la fecha y hora de pago" texto="Ingresa la fecha y hora efectivas en Lima. JADES valida el corte histórico y cotiza el importe completo." />
      </div>
      {obligacion.mensual && <fieldset disabled={guardando} className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-slate-900">¿Qué deseas pagar?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm has-checked:border-emerald-700 has-checked:bg-emerald-50 has-disabled:cursor-not-allowed has-disabled:opacity-60"><input className="accent-emerald-700" type="radio" name="operacion" checked={!cotizarLiquidacion} disabled={cuotaFutura} onChange={() => { setLiquidacion(false); setErrorRegistro(null); setIntento(n => n + 1); }} /> Pagar cuota {obligacion.numeroCuota}</label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm has-checked:border-emerald-700 has-checked:bg-emerald-50 has-disabled:cursor-not-allowed has-disabled:opacity-60"><input className="accent-emerald-700" type="radio" name="operacion" checked={cotizarLiquidacion} onChange={() => { setLiquidacion(true); setErrorRegistro(null); setIntento(n => n + 1); }} /> Liquidar crédito</label>
          {cuotaFutura && <p className="text-sm text-slate-600 sm:col-span-2">La cuota individual se habilita en su mes de vencimiento.</p>}
        </div>
      </fieldset>}
      <div className={`grid items-start gap-4 ${importe && cotizarLiquidacion ? 'lg:grid-cols-[3fr_2fr]' : ''}`}>
      {importe && cotizarLiquidacion && <section className="overflow-hidden rounded-lg border border-slate-200">
        <div className="p-3"><h4 className="font-semibold">Cuotas a cancelar</h4></div>
        <div className="overflow-auto"><table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>{['Cuota', 'Vencimiento', 'Capital', 'Interés compensatorio', 'Mora', 'Total'].map(titulo => <th className="px-3 py-2" scope="col" key={titulo}>{titulo}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{importe.obligaciones.map(cuota => (
            <tr key={cuota.idCuota}>
              <td className="px-3 py-2">{cuota.numeroCuota}</td><td className="px-3 py-2">{fecha(cuota.fechaVencimiento)}</td>
              {[cuota.capital, cuota.interesCompensatorio, cuota.mora, cuota.totalPagar].map((valor, columna) => <td className="whitespace-nowrap px-3 py-2" key={columna}>{dinero(valor, importe.moneda)}</td>)}
            </tr>
          ))}</tbody>
          <tfoot className="bg-emerald-50 font-semibold"><tr><th scope="row" colSpan={2} className="px-3 py-2">Total</th>
            {[importe.capital, importe.interesCompensatorio, importe.mora, importe.totalPagar].map((valor, columna) => <td className="whitespace-nowrap px-3 py-2" key={columna}>{dinero(valor, importe.moneda)}</td>)}
          </tr></tfoot>
        </table></div>
        <p className="border-t border-slate-200 p-3 text-sm">Saldo del crédito después del pago <strong>{dinero(importe.saldoCapitalRestante, importe.moneda)}</strong></p>
      </section>}
        <div className="space-y-4">
      {importe && <dl className="overflow-hidden rounded-lg border border-slate-200">
        {([
          ['Intereses por mora', importe.mora], ['Interés compensatorio', importe.interesCompensatorio],
          ['Capital', importe.capital], ['Total a recibir', importe.totalPagar],
        ] as const).map(([etiqueta, valor]) => <div key={etiqueta} className={`flex justify-between gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-0 ${etiqueta === 'Total a recibir' ? 'bg-emerald-950 text-white' : 'text-slate-700'}`}>
          <dt>{etiqueta}</dt>
          <dd className="whitespace-nowrap font-bold">{dinero(valor, importe.moneda)}</dd>
        </div>)}
      </dl>}
      <fieldset disabled={guardando}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Fecha de pago<input type="date" required min={obligacion.mensual ? obligacion.inicioCobro + "-01" : undefined} max={hoy} className={campo} value={dia} onChange={e => { setDia(e.target.value); setErrorRegistro(null); setIntento(n => n + 1); }} /></label>
          <label className="text-sm font-semibold">Hora de pago<input type="time" required step={1} className={campo} value={hora} onChange={e => { setHora(e.target.value); setErrorRegistro(null); setIntento(n => n + 1); }} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Medio de pago<select className={campo} value={medio} onChange={e => setMedio(e.target.value)}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TARJETA">Tarjeta</option>
          </select></label>
        </div>
      </fieldset>
      {dia && !fechaHabilitada && <p role="alert" className="text-sm text-red-700">El cobro se habilita en el mes de la primera cuota.</p>}
      {valido && !importe && !errorCotizacion && <p role="status" className="text-sm text-slate-600">Cotizando importe…</p>}
      <AvisoError mensaje={errorCotizacion} />
      {errorCotizacion && <button type="button" className={botonSecundarioModal} onClick={() => setIntento(n => n + 1)}>Volver a cotizar</button>}
      <AvisoError mensaje={errorRegistro} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className={botonSecundarioModal} onClick={onClose} disabled={guardando}>Cancelar</button>
        <button type="submit" className={botonPrincipalModal} disabled={guardando || !importe || importe.totalPagar <= 0}>{guardando ? 'Registrando…' : cotizarLiquidacion ? 'Confirmar liquidación' : 'Confirmar pago'}</button>
      </div>
    </form>
  </ModalShell>;
}
