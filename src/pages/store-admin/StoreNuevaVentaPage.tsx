import { AyudaCampo } from '../../components/shared/AyudaCampo';
import { CronogramaCredito } from '../../components/store-admin/CronogramaCredito';
import { porcentaje } from '../../features/client-portal/model';
import { etiquetaMoneda, etiquetaPeriodo, horaCorta, iniciales, resumenTasaCompensatoria, resumenTasaMoratoria } from '../../features/clientes/model';
import React, { useEffect, useRef, useState } from 'react';
import { Search, Trash2, Info, CheckCircle, ChevronRight, ArrowLeft, ChevronDown, Plus, Minus } from 'lucide-react';
import { listarClientes, consultarCondicionCrediticia, consultarCreditoDisponible } from '../../api/clientes';
import { listarProductos } from '../../api/productos';
import { admiteCantidadDecimal } from '../../types/productos';
import { consultarCronograma, consultarPagoUnico } from '../../api/finanzas';
import { registrarVenta, crearClaveIdempotencia, simularVenta } from '../../api/ventas';
import { obtenerMensajeError } from '../../api/errores';
import type { ClienteResponse, CondicionCrediticiaResponse, CreditoDisponibleResponse } from '../../types/clientes';
import type { ProductoResponse } from '../../types/productos';
import type { CronogramaResponse, PagoUnicoResponse, Moneda } from '../../types/finanzas';
import type { ModalidadPago, RegistrarVentaRequest, VentaResponse, SimulacionVentaResponse } from '../../types/ventas';

export interface VentaItem {
  producto: ProductoResponse;
  cantidad: string;
}

interface StoreNuevaVentaPageProps {
  idTienda: number;
  idClienteInicial?: number | null;
  onCancel: () => void;
}

const principal = 'min-h-11 px-5 py-2.5 bg-jades-primary hover:bg-jades-hover text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
const secundario = 'min-h-11 px-5 py-2.5 border border-jades-line text-jades-ink hover:bg-jades-subtle text-sm font-semibold rounded-lg disabled:opacity-50';
const campo = 'w-full min-h-11 px-3 py-2 bg-white border border-jades-line rounded-xl text-sm text-jades-ink focus:outline-none focus:border-jades-primary';
const panel = 'jades-sale-panel bg-white rounded-[13px] border border-jades-line p-5 sm:p-6 space-y-5';

function dinero(valor: number, moneda: Moneda | string) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda }).format(valor);
}

function cantidadValida(item: VentaItem) {
  const patron = admiteCantidadDecimal(item.producto.unidadMedida)
    ? /^\d{1,9}(\.\d{1,3})?$/ : /^\d{1,9}$/;
  return patron.test(item.cantidad) && Number(item.cantidad) > 0;
}

// Precio (dos decimales) por cantidad (hasta tres decimales), redondeado por línea.
function subtotalCentavos(item: VentaItem, precioCredito: number): number {
  const precio = Math.round(precioCredito * 100);
  const cantidad = Math.round(Number(item.cantidad) * 1000);
  return Math.round(precio * cantidad / 1000);
}

function Datos({ datos }: { datos: [string, React.ReactNode][] }) {
  return <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-jades-line rounded-2xl p-4 text-xs">
    {datos.map(([label, valor]) => <div key={label}><dt className="text-jades-muted mb-1">{label}</dt><dd className="font-semibold text-jades-ink break-words">{valor}</dd></div>)}
  </dl>;
}

function ResumenSimulacion({ simulacion: s }: { simulacion: SimulacionVentaResponse }) {
  const m = (v: number) => dinero(v, s.moneda);
  const u = s.pagoUnico;
  return <section className="space-y-4">
    <Datos datos={[
      ['Fecha y hora cotizada', s.fechaVenta + ' ' + s.horaVenta],
      ['Corte aplicable', s.fechaCorteAsignada], ['Fecha de pago', s.fechaPagoAsignada],
      ['Capital cotizado', m(s.capitalVenta)], ['Capital a reservar', m(s.capitalReservado)],
      ['Total a pagar', m(s.totalPagar)], ['Disponible al cotizar', m(s.creditoDisponible)],
      ['Disponible posterior estimado', m(s.creditoDisponiblePosterior)],
    ]}/>
    {s.cronograma && <CronogramaCredito plan={s.cronograma}/>}
    {u && <><h4 className="font-bold text-sm">Simulación de pago único</h4><Datos datos={[
      ['Capital', m(u.capital)], ['Días de financiamiento', u.diasFinanciamiento],
      ['TED', porcentaje(u.tasaEfectivaDiaria)],
      ['Tasa efectiva del periodo', porcentaje(u.tasaEfectivaPeriodo)],
      ['Interés compensatorio', m(u.interesCompensatorio)], ['Total sin mora', m(u.totalSinMora)],
    ]}/></>}
    <div className="text-xs text-jades-muted divide-y divide-jades-line">{s.detalles.map(d => <div key={d.idProducto} className="flex justify-between p-2"><span>{d.cantidad} × {d.nombreProducto} · {m(d.precioUnitario)}</span><strong>{m(d.subtotal)}</strong></div>)}</div>
  </section>;
}

export const StoreNuevaVentaPage: React.FC<StoreNuevaVentaPageProps> = ({ idTienda, idClienteInicial, onCancel }) => {
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [carga, setCarga] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrandoClientes, setMostrandoClientes] = useState(true);
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [condicion, setCondicion] = useState<CondicionCrediticiaResponse | null>(null);
  const [cargaCondicion, setCargaCondicion] = useState(false);
  const [errorCondicion, setErrorCondicion] = useState('');
  const [recargaCondicion, setRecargaCondicion] = useState(0);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [mostrandoProductos, setMostrandoProductos] = useState(true);
  const [items, setItems] = useState<VentaItem[]>([]);
  const [modalidad, setModalidad] = useState<ModalidadPago>('MENSUAL');
  const [cuotas, setCuotas] = useState(3);
  const [cotizacion, setCotizacion] = useState<{ clave: string; datos: SimulacionVentaResponse } | null>(null);
  const versionSimulacion = useRef(0);
  const [simulando, setSimulando] = useState(false);
  const [error, setError] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [venta, setVenta] = useState<VentaResponse | null>(null);
  const [planFinal, setPlanFinal] = useState<CronogramaResponse | null>(null);
  const [unicoFinal, setUnicoFinal] = useState<PagoUnicoResponse | null>(null);
  const [cargaFinal, setCargaFinal] = useState(false);
  const [errorFinal, setErrorFinal] = useState('');
  const [recargaFinal, setRecargaFinal] = useState(0);
  const envioEnCurso = useRef(false);
  const [saldoFinal, setSaldoFinal] = useState<CreditoDisponibleResponse | null>(null);
  const [errorSaldoFinal, setErrorSaldoFinal] = useState('');
  const [recargaSaldoFinal, setRecargaSaldoFinal] = useState(0);
  const [actualizandoSaldo, setActualizandoSaldo] = useState(false);
  const [errorSaldo, setErrorSaldo] = useState('');
  const saldoVigente = condicion !== null && Number.isFinite(condicion.creditoDisponible) && condicion.creditoDisponible >= 0;


  useEffect(() => {
    const controller = new AbortController();
    Promise.all([listarClientes(idTienda, true, controller.signal), listarProductos(idTienda, true, controller.signal)])
      .then(([cs, ps]) => {
        if (controller.signal.aborted) return;
        setClientes(cs);
        setProductos(ps);
        const inicial = cs.find(c => c.id === idClienteInicial);
        if (inicial) {
          setCliente(inicial);
          setMostrandoClientes(false);
          setCargaCondicion(true);
        }
        setCarga(false);
      })
      .catch((e: unknown) => { if (!controller.signal.aborted) { setErrorCarga(obtenerMensajeError(e)); setCarga(false); } });
    return () => controller.abort();
  }, [idTienda, idClienteInicial, recarga]);

  useEffect(() => {
    if (!cliente) return;
    const controller = new AbortController();
    consultarCondicionCrediticia(idTienda, cliente.id, controller.signal)
      .then(c => {
        if (controller.signal.aborted) return;
        setCondicion(c);
        setCuotas(Math.min(3, c.plazoMaximo, 120));
        setCargaCondicion(false);
      }).catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setErrorCondicion(obtenerMensajeError(e));
        setCargaCondicion(false);
      });
    return () => controller.abort();
  }, [idTienda, cliente, recargaCondicion]);

  useEffect(() => {
    if (!venta) return;
    const controller = new AbortController();
    const consulta = venta.modalidadPago === 'MENSUAL'
      ? consultarCronograma(venta.id, controller.signal).then(p => { if (!controller.signal.aborted) setPlanFinal(p); })
      : consultarPagoUnico(venta.id, controller.signal).then(p => { if (!controller.signal.aborted) setUnicoFinal(p); });
    consulta.then(() => { if (!controller.signal.aborted) setCargaFinal(false); })
      .catch((e: unknown) => { if (!controller.signal.aborted) { setErrorFinal(obtenerMensajeError(e)); setCargaFinal(false); } });
    return () => controller.abort();
  }, [venta, recargaFinal]);

  useEffect(() => {
    if (!venta) return;
    const controller = new AbortController();
    consultarCreditoDisponible(idTienda, venta.idCliente, controller.signal)
      .then(s => { if (!controller.signal.aborted) setSaldoFinal(s); })
      .catch((e: unknown) => { if (!controller.signal.aborted) setErrorSaldoFinal(obtenerMensajeError(e)); });
    return () => controller.abort();
  }, [idTienda, venta, recargaSaldoFinal]);

  const moneda = condicion?.monedaCredito ?? 'PEN';
  const m = (v: number) => dinero(v, moneda);
  const precioCredito = (producto: ProductoResponse) => moneda === 'USD' ? producto.precioCreditoUsd : producto.precioCredito;
  const validas = items.length > 0 && items.every(item => {
    const precio = precioCredito(item.producto);
    return precio != null && cantidadValida(item) && Number.isSafeInteger(Math.round(precio * 100) * Math.round(Number(item.cantidad) * 1000));
  });
  const centavos = validas ? items.reduce((s, i) => s + subtotalCentavos(i, precioCredito(i.producto) ?? 0), 0) : 0;
  const capital = centavos / 100;
  const unicoPermitido = items.length > 0 && items.every(i => ['AMBAS', 'UNICO'].includes(i.producto.modalidad));
  const mensualPermitido = items.length > 0 && items.every(i => ['AMBAS', 'MENSUAL'].includes(i.producto.modalidad));
  const puedeAvanzar = validas && Number.isSafeInteger(centavos) && capital > 0 && !!condicion && saldoVigente && capital <= condicion.creditoDisponible && (unicoPermitido || mensualPermitido);
  const modalidadValida = modalidad === 'MENSUAL' ? mensualPermitido && !!condicion && Number.isInteger(cuotas) && cuotas >= 1 && cuotas <= Math.min(condicion.plazoMaximo, 120) : unicoPermitido;
  const invalidaSimulacion = () => {
    versionSimulacion.current += 1;
    setCotizacion(null); setSimulando(false); setError('');
  };

  function seleccionarCliente(c: ClienteResponse) {
    setMostrandoClientes(false);
    setBusquedaCliente('');
    if (cliente?.id === c.id) return;
    setCliente(c); setCondicion(null); setCargaCondicion(true); setErrorCondicion('');
    setItems([]); setBusquedaProducto(''); setMostrandoProductos(true); setErrorSaldo(''); invalidaSimulacion();
  }

  function agregarProducto(p: ProductoResponse) {
    setItems(prev => prev.some(i => i.producto.id === p.id) || prev.length >= 50 ? prev : [...prev, { producto: p, cantidad: '1' }]);
    setBusquedaProducto('');
    setMostrandoProductos(false);
    invalidaSimulacion();
  }

  function cambiarCantidad(idProducto: number, cantidad: string) {
    setItems(prev => prev.map(item => item.producto.id === idProducto ? { ...item, cantidad } : item));
    invalidaSimulacion();
  }

  function ajustarCantidad(item: VentaItem, direccion: -1 | 1) {
    if (!cantidadValida(item)) return;
    const pasoCantidad = admiteCantidadDecimal(item.producto.unidadMedida) ? 1 : 1000;
    const actual = Math.round(Number(item.cantidad) * 1000);
    const siguiente = actual + direccion * pasoCantidad;
    if (siguiente < pasoCantidad || siguiente > 999999999000) return;
    cambiarCantidad(item.producto.id, String(siguiente / 1000));
  }

  function construirSolicitud(): RegistrarVentaRequest | null {
    if (!cliente) return null;
    return {
      idCliente: cliente.id, modalidadPago: modalidad, numeroCuotas: modalidad === 'UNICO' ? 1 : cuotas,
      graciaAdicional: 0,
      detalles: items.map(i => ({ idProducto: i.producto.id, cantidad: Number(i.cantidad) })).sort((a, b) => a.idProducto - b.idProducto),
    };
  }

  const solicitud = construirSolicitud();
  const claveSolicitud = solicitud ? `${idTienda}:${JSON.stringify(solicitud)}` : null;
  const simulacion = cotizacion?.clave === claveSolicitud ? cotizacion.datos : null;

  async function simular() {
    if (!solicitud || !claveSolicitud || !puedeAvanzar || !modalidadValida || simulando) return;
    const version = ++versionSimulacion.current;
    setSimulando(true); setCotizacion(null); setError('');
    try {
      const resultado = await simularVenta(idTienda, solicitud);
      if (version !== versionSimulacion.current) return;
      setCotizacion({ clave: claveSolicitud, datos: resultado });
      setCondicion(anterior => anterior?.idCliente === resultado.idCliente ? {
        ...anterior, limiteCredito: resultado.limiteCredito,
        creditoUtilizado: resultado.creditoUtilizado, creditoDisponible: resultado.creditoDisponible,
      } : anterior);
    } catch (e) { if (version === versionSimulacion.current) setError(obtenerMensajeError(e)); }
    finally { if (version === versionSimulacion.current) setSimulando(false); }
  }

  const superaLimite = simulacion !== null && !!condicion && simulacion.capitalReservado > condicion.creditoDisponible;
  const reserva = simulacion?.capitalReservado;
  const restante = saldoVigente && condicion && reserva !== undefined ? Math.max(0, condicion.creditoDisponible - reserva) : null;

  async function actualizarSaldo() {
    if (!cliente || !condicion || actualizandoSaldo) return;
    setActualizandoSaldo(true);
    setErrorSaldo('');
    try {
      const saldo = await consultarCreditoDisponible(idTienda, cliente.id);
      setCondicion(anterior => anterior?.idCliente === saldo.idCliente ? { ...anterior, ...saldo } : anterior);
    } catch (e) {
      setErrorSaldo(obtenerMensajeError(e));
    } finally {
      setActualizandoSaldo(false);
    }
  }

  const listo = !actualizandoSaldo && modalidadValida && !!simulacion && !superaLimite && (modalidad === 'MENSUAL' ? !!simulacion.cronograma : !!simulacion.pagoUnico);
  async function confirmar() {
    if (!solicitud || !listo || envioEnCurso.current || venta) return;
    envioEnCurso.current = true; setRegistrando(true); setError('');
    try {
      // Reusar la clave si se perdió la respuesta, incluso al volver a abrir el wizard en esta pestaña.
      const claveStorage = 'jades:venta-pendiente:' + idTienda + ':' + JSON.stringify(solicitud);
      let clave = sessionStorage.getItem(claveStorage);
      if (!clave) { clave = crearClaveIdempotencia(); sessionStorage.setItem(claveStorage, clave); }
      const resultado = await registrarVenta(idTienda, solicitud, clave);
      setVenta(resultado); setCargaFinal(true);
      sessionStorage.removeItem(claveStorage);
    } catch (e) { setError(obtenerMensajeError(e) + ' Si no recibiste confirmación, reintenta la misma operación sin modificar sus datos; no generes otra venta hasta verificar el registro.'); }
    finally { envioEnCurso.current = false; setRegistrando(false); }
  }

  if (venta) return <div className={panel}>
    <div className="flex gap-3 items-center"><CheckCircle className="w-8 h-8 text-jades-primary"/><div><h2 className="text-lg font-bold">Venta registrada</h2><p className="text-xs text-jades-muted">Venta N.° {venta.id} · {venta.nombreCliente}</p></div></div>
    <Datos datos={[
      ['Capital registrado', dinero(venta.totalVenta, venta.monedaVenta)], ['Modalidad', venta.modalidadPago],
      ['Fecha de venta', venta.fechaVenta], ['Corte asignado', venta.fechaCorteAsignada],
      ['Pago asignado', venta.fechaPagoAsignada], ['Código de crédito', planFinal?.codigoCredito ?? unicoFinal?.codigoCredito ?? (cargaFinal ? 'Consultando…' : 'No disponible por ahora')],
      ['Crédito utilizado actual', saldoFinal ? dinero(saldoFinal.creditoUtilizado, saldoFinal.monedaCredito) : '—'],
      ['Crédito disponible actual', saldoFinal ? dinero(saldoFinal.creditoDisponible, saldoFinal.monedaCredito) : '—'],
    ]}/>
    {errorSaldoFinal && <div role="alert" className="text-xs text-red-700"><p>No se pudo consultar el saldo actualizado: {errorSaldoFinal}</p><button className={secundario} onClick={() => { setErrorSaldoFinal(''); setRecargaSaldoFinal(n => n + 1); }}>Reconsultar saldo</button></div>}
    {cargaFinal && <p role="status" className="text-xs text-jades-muted">Consultando obligaciones registradas...</p>}
    {errorFinal && <div role="alert" className="text-sm text-red-700 space-y-2"><p>La venta ya fue registrada. No vuelvas a enviarla. {errorFinal}</p><button className={secundario} onClick={() => { setErrorFinal(''); setCargaFinal(true); setRecargaFinal(n => n + 1); }}>Consultar nuevamente</button></div>}
    {planFinal && <CronogramaCredito plan={planFinal} definitivo/>}
    {unicoFinal && <><h3 className="font-bold text-sm">Obligación de pago único registrada</h3><Datos datos={[
      ['Capital', dinero(unicoFinal.capital, unicoFinal.moneda)], ['Fecha de pago', unicoFinal.fechaPago],
      ['Días de financiamiento', unicoFinal.diasFinanciamiento], ['Interés compensatorio', dinero(unicoFinal.interesCompensatorio, unicoFinal.moneda)],
      ['Tasa efectiva del periodo', porcentaje(unicoFinal.tasaEfectivaPeriodo)],
      ['Total sin mora', dinero(unicoFinal.totalSinMora, unicoFinal.moneda)], ['Estado', unicoFinal.estadoCuota],
      ['Fecha de pago efectivo', unicoFinal.fechaPagoEfectivo ?? '—'], ['Total pagado', unicoFinal.totalPagado == null ? '—' : dinero(unicoFinal.totalPagado, unicoFinal.moneda)],
    ]}/></>}
    <button className={principal} onClick={onCancel}>Volver a clientes</button>
  </div>;

  const q = busquedaCliente.trim().toLocaleLowerCase('es-PE');
  const encontrados = clientes.filter(c => c.dniCliente.includes(q) || c.nombreCliente.toLocaleLowerCase('es-PE').includes(q));
  const qp = busquedaProducto.trim().toLocaleLowerCase('es-PE');
  const catalogo = productos.filter(p => (moneda !== 'USD' || p.precioContadoUsd != null) && precioCredito(p) != null && p.nombreProducto.toLocaleLowerCase('es-PE').includes(qp));
  const aviso = (mensaje: string) => <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800"><Info className="w-4 h-4 shrink-0"/><span>{mensaje}</span></div>;

  return <div className="space-y-[18px]">
    <div><h2 className="text-xl font-bold text-jades-ink">Nueva venta a crédito</h2><p className="text-xs text-jades-muted mt-1">Completa los datos para registrar el crédito.</p></div>
    <div className="grid grid-cols-2 gap-3 py-1 text-[13px] font-medium lg:grid-cols-4">{['Cliente','Productos / servicios','Modalidad de pago','Confirmación'].map((t,i) => <div key={t} className={`flex gap-2 items-center ${paso === i+1 ? 'text-jades-primary' : paso > i+1 ? 'text-jades-ink' : 'text-jades-muted'}`}><span className={`size-[26px] shrink-0 rounded-full flex items-center justify-center border ${paso >= i+1 ? 'border-jades-primary bg-jades-primary text-white' : 'border-jades-line bg-white'}`}>{i+1}</span>{t}</div>)}</div>
    {carga ? <p role="status" className={panel}>Cargando clientes y catálogo...</p> : errorCarga ? <div role="alert" className={panel}><p className="text-red-700">{errorCarga}</p><button className={secundario} onClick={() => { setErrorCarga(''); setCarga(true); setRecarga(n => n+1); }}>Reintentar</button></div> : <>
    {paso === 1 && <>
      <section className={panel}>
        <div>
          <h3 className="font-bold">1. Selecciona el cliente</h3>
          <p className="mt-1 text-[13px] text-jades-muted">Busca al cliente para consultar sus condiciones de crédito.</p>
        </div>
        {mostrandoClientes ? <>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-jades-muted"/>
            <input className={campo + ' pl-10'} aria-label="Buscar cliente por nombre o DNI" placeholder="Buscar por nombre o DNI" value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)}/>
          </div>
          <div className="max-h-64 overflow-auto rounded-lg border border-jades-line divide-y divide-jades-line">
            {encontrados.map(c => <button key={c.id} type="button" onClick={() => seleccionarCliente(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-jades-soft focus-visible:bg-jades-soft">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf1f6] text-xs font-bold text-jades-navy">{iniciales(c.nombreCliente)}</span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-jades-ink">{c.nombreCliente}</strong>
                <span className="block text-xs text-jades-muted">DNI {c.dniCliente}</span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-jades-muted"/>
            </button>)}
            {!encontrados.length && <p className="p-4 text-xs text-jades-muted">No se encontraron clientes activos.</p>}
          </div>
        </> : cliente && <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-jades-line bg-jades-soft px-4 py-4 sm:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf1f6] text-xs font-bold text-jades-navy">{iniciales(cliente.nombreCliente)}</span>
              <div className="min-w-0">
                <p className="break-words text-sm font-bold text-jades-ink">{cliente.nombreCliente}</p>
                <p className="mt-0.5 text-xs text-jades-muted">DNI {cliente.dniCliente} · Cliente activo</p>
              </div>
            </div>
            <div className="min-w-0 sm:flex-1">
              <p className="text-xs text-jades-muted">Crédito disponible antes de esta venta</p>
              <p className="mt-0.5 break-words text-lg font-bold tabular-nums text-jades-primary">{cargaCondicion ? 'Consultando…' : condicion && saldoVigente ? m(condicion.creditoDisponible) : '—'}</p>
            </div>
            <button type="button" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-jades-line bg-white px-3 text-xs font-semibold text-jades-primary hover:bg-jades-subtle" onClick={() => { setBusquedaCliente(''); setMostrandoClientes(true); }}>
              <ArrowLeft aria-hidden="true" className="size-4"/> Cambiar cliente
            </button>
          </div>
          {cargaCondicion && <p role="status" className="text-sm text-jades-muted">Consultando condiciones crediticias...</p>}
          {errorCondicion && <div role="alert" className="space-y-2 rounded-lg border border-jades-line p-4 text-sm text-red-700"><p>{errorCondicion}</p><button type="button" className={secundario} onClick={() => { setErrorCondicion(''); setCargaCondicion(true); setRecargaCondicion(n => n+1); }}>Reintentar</button></div>}
          {condicion && <>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-jades-line bg-jades-line lg:grid-cols-4">
              {([
                ['Tasa de interés', resumenTasaCompensatoria(condicion), condicion.capitalizacionTasa ? 'Capitalización: ' + etiquetaPeriodo(condicion.capitalizacionTasa) : 'Capitalización: No aplica'],
                ['Límite de crédito', m(condicion.limiteCredito), 'Utilizado: ' + (saldoVigente ? m(condicion.creditoUtilizado) : '—')],
                ['Plazo máximo', condicion.plazoMaximo + ' cuotas', ''],
                ['Corte / pago', 'Día ' + condicion.diaCorte + ' · ' + horaCorta(condicion.horaCorte) + ' / Día ' + condicion.diaPago, ''],
                ['Tasa moratoria', resumenTasaMoratoria(condicion), condicion.capitalizacionMora ? 'Capitalización: ' + etiquetaPeriodo(condicion.capitalizacionMora) : 'Capitalización: No aplica'],
                ['Convenciones', '360 días / meses de 30 días', ''],
                ['Moneda', etiquetaMoneda(moneda), ''],
                ['Estado', cliente.estadoCliente === 'ACTIVO' ? 'Activo' : 'Inactivo', ''],
              ] as const).map(([label, valor, detalle]) => <div key={label} className="min-w-0 bg-white px-4 py-3">
                <dt className="text-xs text-jades-muted">{label}</dt>
                <dd className="mt-1 break-words text-[13px] font-semibold text-jades-ink">{valor}</dd>
                {detalle && <dd className="mt-1 break-words text-[11px] text-jades-muted">{detalle}</dd>}
              </div>)}
            </dl>
            <div className="flex items-start gap-2 rounded-lg bg-jades-soft px-4 py-3 text-xs leading-relaxed text-jades-navy">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-jades-primary"/>
              <p>Las condiciones mostradas son las pactadas con el cliente y se aplicarán al cálculo de esta venta.</p>
            </div>
            {!saldoVigente && <div role="alert" className="space-y-2">
              {aviso('No pudimos consultar el crédito disponible. Vuelve a intentarlo para continuar.')}
              <button type="button" className={secundario} disabled={cargaCondicion} onClick={() => { setErrorCondicion(''); setCargaCondicion(true); setRecargaCondicion(n => n + 1); }}>Volver a consultar</button>
            </div>}
          </>}
        </>}
      </section>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className={secundario + ' bg-white'} onClick={onCancel}>Cancelar</button>
        <button type="button" className={principal} disabled={mostrandoClientes || !cliente || !condicion || !saldoVigente || cargaCondicion} onClick={() => setPaso(2)}>Continuar</button>
      </div>
    </>}
    {paso === 2 && <>
      <section className={panel}>
        <div>
          <h3 className="font-bold">2. Agrega productos o servicios</h3>
          <p className="mt-1 text-[13px] text-jades-muted">Se aplicará el precio de crédito y solo estarán disponibles las modalidades permitidas por los conceptos seleccionados.</p>
        </div>
        <div className="space-y-2" onKeyDown={e => { if (e.key === 'Escape') setMostrandoProductos(false); }}>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-jades-muted"/>
            <input className={campo + ' pl-10 pr-12'} aria-label="Buscar producto o servicio" aria-controls={mostrandoProductos ? 'venta-catalogo' : undefined} placeholder="Buscar producto o servicio" value={busquedaProducto}
              onFocus={() => setMostrandoProductos(true)} onClick={() => setMostrandoProductos(true)} onChange={e => { setBusquedaProducto(e.target.value); setMostrandoProductos(true); }}/>
            <button type="button" aria-label={mostrandoProductos ? 'Ocultar catálogo' : 'Mostrar catálogo'} aria-expanded={mostrandoProductos} onClick={() => setMostrandoProductos(v => !v)} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-jades-muted hover:bg-jades-soft">
              <ChevronDown aria-hidden="true" className={'size-4 transition-transform ' + (mostrandoProductos ? 'rotate-180' : '')}/>
            </button>
          </div>
          {mostrandoProductos && <div id="venta-catalogo" className="max-h-56 overflow-auto rounded-lg border border-jades-line divide-y divide-jades-line">
            {catalogo.filter(p => !items.some(i => i.producto.id === p.id)).map(p => <button type="button" key={p.id} disabled={items.length >= 50} onClick={() => agregarProducto(p)} className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-jades-soft disabled:opacity-50">
              <span className="min-w-0"><strong className="block font-semibold text-jades-ink">{p.nombreProducto}</strong><span className="text-xs text-jades-muted">{p.unidadMedida} · {p.modalidad}</span></span>
              <span className="flex shrink-0 items-center gap-3 font-semibold tabular-nums text-jades-primary">{m(precioCredito(p)!)}<Plus aria-hidden="true" className="size-4"/></span>
            </button>)}
            {!catalogo.some(p => !items.some(i => i.producto.id === p.id)) && <p className="p-4 text-xs text-jades-muted">{productos.length ? 'No se encontraron otros productos disponibles en la moneda del crédito.' : 'No hay productos disponibles en esta tienda. Registra o activa un producto en el catálogo para continuar.'}</p>}
          </div>}
        </div>
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-jades-muted">Detalle de la venta</h4>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] table-fixed text-left text-[13px]">
              <thead className="bg-jades-subtle text-jades-muted">
                <tr>
                  <th scope="col" className="w-[40%] px-3 py-3">Producto</th>
                  <th scope="col" className="w-[18%] px-3 py-3">Precio unitario</th>
                  <th scope="col" className="w-[21%] px-3 py-3">Cantidad</th>
                  <th scope="col" className="px-3 py-3">Subtotal</th>
                  <th scope="col" className="w-12"><span className="sr-only">Quitar</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jades-line border-b border-jades-line">
                {items.map(i => {
                  const decimal = admiteCantidadDecimal(i.producto.unidadMedida);
                  const minimo = decimal ? .001 : 1;
                  const cantidadCorrecta = cantidadValida(i);
                  return <tr key={i.producto.id}>
                    <td className="px-3 py-4 font-semibold break-words">{i.producto.nombreProducto}</td>
                    <td className="px-3 py-4 tabular-nums">{m(precioCredito(i.producto)!)}</td>
                    <td className="px-3 py-4">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" aria-label={'Disminuir cantidad de ' + i.producto.nombreProducto} disabled={!cantidadCorrecta || Number(i.cantidad) <= minimo} onClick={() => ajustarCantidad(i, -1)} className="grid size-8 shrink-0 place-items-center rounded-md text-jades-primary hover:bg-jades-soft disabled:opacity-30">
                          <Minus aria-hidden="true" className="size-4"/>
                        </button>
                        <input aria-label={'Cantidad de ' + i.producto.nombreProducto} className="w-[72px] min-w-0 border border-jades-line bg-white px-1 py-1 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" type="number" min={minimo} max={999999999} step={minimo} value={i.cantidad} onChange={e => cambiarCantidad(i.producto.id, e.target.value)}/>
                        <button type="button" aria-label={'Aumentar cantidad de ' + i.producto.nombreProducto} disabled={!cantidadCorrecta || Number(i.cantidad) >= 999999999} onClick={() => ajustarCantidad(i, 1)} className="grid size-8 shrink-0 place-items-center rounded-md text-jades-primary hover:bg-jades-soft disabled:opacity-30">
                          <Plus aria-hidden="true" className="size-4"/>
                        </button>
                      </div>
                      {!cantidadCorrecta && <p className="mt-1 text-xs text-red-700">Cantidad inválida</p>}
                    </td>
                    <td className="px-3 py-4 tabular-nums">{cantidadCorrecta ? m(subtotalCentavos(i, precioCredito(i.producto) ?? 0)/100) : '—'}</td>
                    <td className="px-1 py-4 text-center">
                      <button type="button" aria-label={'Quitar ' + i.producto.nombreProducto} onClick={() => { setItems(prev => prev.filter(it => it.producto.id !== i.producto.id)); invalidaSimulacion(); }} className="inline-grid size-9 place-items-center rounded-md hover:bg-red-50">
                        <Trash2 aria-hidden="true" className="size-4 text-red-600"/>
                      </button>
                    </td>
                  </tr>;
                })}
                {!items.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-jades-muted">Busca y selecciona un producto o servicio para agregarlo a la venta.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-jades-line bg-jades-line sm:grid-cols-2">
          <div className="min-w-0 bg-white px-4 py-3">
            <dt className="text-xs text-jades-muted">Capital total estimado</dt>
            <dd className="mt-1 break-words text-sm font-bold tabular-nums text-jades-ink">{validas ? m(capital) : items.length ? '—' : m(0)}</dd>
          </div>
          <div className="min-w-0 bg-white px-4 py-3">
            <dt className="text-xs text-jades-muted">Crédito disponible</dt>
            <dd className="mt-1 break-words text-sm font-bold tabular-nums text-jades-ink">{condicion && saldoVigente ? m(condicion.creditoDisponible) : '—'}</dd>
            <dd className="mt-1 text-[11px] text-jades-muted">Disponible tras capital inicial (estimado): {condicion && saldoVigente && validas ? m(Math.max(0, condicion.creditoDisponible - capital)) : '—'}</dd>
          </div>
        </dl>
        {items.length > 0 && !unicoPermitido && !mensualPermitido && aviso('Los productos no comparten una modalidad de pago. Retira los incompatibles.')}
        {condicion && saldoVigente && capital > condicion.creditoDisponible && aviso('Crédito insuficiente: el capital supera el crédito disponible.')}
      </section>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className={secundario + ' bg-white'} onClick={() => setPaso(1)}>Atrás</button>
        <button type="button" className={principal} disabled={!puedeAvanzar} onClick={() => { setModalidad(mensualPermitido ? 'MENSUAL' : 'UNICO'); invalidaSimulacion(); setPaso(3); }}>Continuar</button>
      </div>
    </>}
    {paso === 3 && <section className={panel}>
      <div className="flex items-baseline gap-1"><h3 className="font-bold">3. Modalidad de pago</h3><AyudaCampo etiqueta="la modalidad y el número de cuotas" texto="Elige una modalidad común a todos los artículos. Para un crédito mensual, el número de cuotas debe respetar el plazo pactado con el cliente." /></div>
      <div className="grid sm:grid-cols-2 gap-3">
        {([['UNICO','Pago único del ciclo',unicoPermitido],['MENSUAL','Pago en meses · método francés',mensualPermitido]] as const).map(([v,label,permitido]) => <button key={v} disabled={!permitido} onClick={() => { setModalidad(v); invalidaSimulacion(); }} className={`p-4 border-2 rounded-2xl text-sm font-semibold text-left disabled:opacity-40 ${modalidad===v ? 'border-jades-primary bg-emerald-50' : 'border-jades-line'}`}>{label}</button>)}
      </div>
      {modalidad === 'MENSUAL' && condicion && <>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs font-semibold">Número de cuotas<select className={campo} value={cuotas} onChange={e => { setCuotas(Number(e.target.value)); invalidaSimulacion(); }}>{Array.from({length:Math.min(condicion.plazoMaximo,120)},(_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
          <div className="text-xs text-jades-muted">El periodo de gracia se calcula automáticamente según las fechas pactadas con el cliente.</div>
        </div>
      </>}
      {modalidad === 'UNICO' && <p className="text-xs text-jades-muted">El cliente realizará un solo pago en la fecha de vencimiento.</p>}
      <button className={secundario} disabled={simulando || !modalidadValida || !puedeAvanzar} onClick={simular}>{simulando ? 'Calculando...' : 'Simular venta'}</button>
      {simulacion && <ResumenSimulacion simulacion={simulacion}/>}
      {superaLimite && aviso('El capital a reservar supera el crédito disponible del cliente.')}
      {simulacion && <p className="text-xs text-jades-muted">La simulación es referencial. El importe y el saldo se actualizarán al confirmar la venta.</p>}
      {condicion && <Datos datos={[[ 'Crédito disponible', m(condicion.creditoDisponible)], ['Capital a reservar', reserva === undefined ? 'Simula primero' : m(reserva)], ['Disponible posterior estimado', restante === null ? '—' : m(restante)]]}/>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <div className="flex justify-end gap-3"><button className={secundario} onClick={() => { invalidaSimulacion(); setPaso(2); }}>Atrás</button><button className={principal} disabled={!listo || simulando} onClick={() => setPaso(4)}>Continuar</button></div>
    </section>}
    {paso === 4 && <section className={panel}>
      <h3 className="font-bold">4. Revisa y confirma la venta</h3>
      <Datos datos={[[ 'Cliente', cliente?.nombreCliente], ['DNI', cliente?.dniCliente], ['Modalidad', modalidad], ['Cuotas', modalidad === 'UNICO' ? 1 : cuotas], ['Capital cotizado', simulacion ? dinero(simulacion.capitalVenta, simulacion.moneda) : '—'], ['Total preliminar', simulacion ? dinero(simulacion.totalPagar, simulacion.moneda) : '—'], ['Crédito disponible', condicion ? m(condicion.creditoDisponible) : '—'], ['Capital a reservar', reserva === undefined ? '—' : m(reserva)], ['Disponible posterior estimado', restante === null ? '—' : m(restante)]]}/>
      <div className="divide-y divide-jades-line text-xs">{simulacion?.detalles.map(i => <div key={i.idProducto} className="flex justify-between p-2"><span>{i.cantidad} × {i.nombreProducto}</span><strong>{dinero(i.subtotal, simulacion.moneda)}</strong></div>)}</div>
      {simulacion && <ResumenSimulacion simulacion={simulacion}/>}
      <button className={secundario} disabled={actualizandoSaldo || registrando} onClick={actualizarSaldo}>{actualizandoSaldo ? 'Consultando saldo...' : 'Actualizar crédito disponible'}</button>
      {errorSaldo && <p role="alert" className="text-xs text-red-700">{errorSaldo}</p>}
      {!listo && !actualizandoSaldo && aviso('Revisa la disponibilidad de crédito y los datos de la venta antes de confirmar.')}
      {aviso('Al confirmar, se registrará la venta y se descontará el capital correspondiente del crédito disponible del cliente.')}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <div className="flex justify-end gap-3"><button className={secundario} disabled={registrando || actualizandoSaldo} onClick={() => { invalidaSimulacion(); setPaso(3); }}>Atrás</button><button className={principal} disabled={!listo || registrando} onClick={confirmar}>{registrando ? 'Registrando...' : 'Confirmar crédito'}</button></div>
    </section>}
    </>}
  </div>;
};
