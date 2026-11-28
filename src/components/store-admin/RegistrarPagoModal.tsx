import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { consultarImporteCuota, consultarLiquidacion, liquidarCredito, registrarPago } from '../../api/finanzas';
import { obtenerMensajeError } from '../../api/errores';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import type { ObligacionCobro } from '../../features/cobranzas/cuentas';
import type { LiquidacionResponse } from '../../types/finanzas';
import { AvisoError, botonPrincipalModal, botonSecundarioModal, cuerpoModal, ModalShell } from './ModalShell';

interface Props {
  obligacion: ObligacionCobro;
  onClose: () => void;
  onRegistrado: (mensaje: string) => void;
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
  const valido = !!dia && dia <= hoy && !!hora;

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
      const total = 'totalPagar' in resultado ? resultado.totalPagar : resultado.totalExigible;
      onRegistrado(`Pago registrado por ${dinero(total, resultado.moneda)}.`);
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
      <p className="text-sm text-slate-600">Vencimiento pactado {fecha(obligacion.fechaVencimiento)}</p>
      <fieldset disabled={guardando} className="space-y-4">
        {obligacion.mensual && <div className="flex flex-wrap gap-4 text-sm">
          <label><input type="radio" name="operacion" checked={!cotizarLiquidacion} disabled={cuotaFutura} onChange={() => { setLiquidacion(false); setErrorRegistro(null); setIntento(n => n + 1); }} /> Pagar cuota {obligacion.numeroCuota}</label>
          <label><input type="radio" name="operacion" checked={cotizarLiquidacion} onChange={() => { setLiquidacion(true); setErrorRegistro(null); setIntento(n => n + 1); }} /> Liquidar crédito</label>
          {cuotaFutura && <p className="w-full text-slate-600">La cuota individual se habilita en su mes de vencimiento.</p>}
        </div>}
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold">Fecha de pago<input type="date" required max={hoy} className={campo} value={dia} onChange={e => { setDia(e.target.value); setErrorRegistro(null); setIntento(n => n + 1); }} /></label>
          <label className="text-sm font-semibold">Hora de pago<input type="time" required step={1} className={campo} value={hora} onChange={e => { setHora(e.target.value); setErrorRegistro(null); setIntento(n => n + 1); }} /></label>
          <label className="text-sm font-semibold">Medio de pago<select className={campo} value={medio} onChange={e => setMedio(e.target.value)}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TARJETA">Tarjeta</option>
          </select></label>
        </div>
      </fieldset>
      {valido && !importe && !errorCotizacion && <p role="status" className="text-sm text-slate-600">Cotizando importe…</p>}
      <AvisoError mensaje={errorCotizacion} />
      <AvisoError mensaje={errorRegistro} />
      {importe && <dl className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
        {([
          ['Capital', importe.capital], ['Interés compensatorio', importe.interesCompensatorio],
          ['Mora', importe.mora], ['Total', importe.totalPagar],
        ] as const).map(([etiqueta, valor]) => <div key={etiqueta}>
          <dt className="text-xs text-slate-600">{etiqueta}</dt>
          <dd className="font-bold text-slate-900">{dinero(valor, importe.moneda)}</dd>
        </div>)}
      </dl>}
      <div className="flex justify-end gap-3">
        <button type="button" className={botonSecundarioModal} onClick={onClose} disabled={guardando}>Cancelar</button>
        <button type="submit" className={botonPrincipalModal} disabled={guardando || !importe || importe.totalPagar <= 0}>{guardando ? 'Registrando…' : 'Confirmar pago'}</button>
      </div>
    </form>
  </ModalShell>;
}
