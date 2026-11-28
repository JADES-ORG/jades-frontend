import { porcentaje } from '../../features/client-portal/model';
import React, { useEffect, useRef, useState } from 'react';
import { Search, Trash2, Info, CheckCircle } from 'lucide-react';
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

const principal = 'px-5 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';
const secundario = 'px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl disabled:opacity-50';
const campo = 'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#139a6c]';
const panel = 'bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5';

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
  return <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-slate-200 rounded-2xl p-4 text-xs">
    {datos.map(([label, valor]) => <div key={label}><dt className="text-slate-500 mb-1">{label}</dt><dd className="font-semibold text-slate-900 break-words">{valor}</dd></div>)}
  </dl>;
}

function Cronograma({ plan, definitivo = false }: { plan: CronogramaResponse; definitivo?: boolean }) {
  const m = (v: number) => dinero(v, plan.moneda);
  return <section className="space-y-4">
    <h4 className="text-sm font-bold text-slate-900">{definitivo ? 'Cronograma registrado' : 'Cronograma preliminar — método francés'}</h4>
    <Datos datos={[
      ['Fecha de venta', plan.fechaVenta], ['Fecha de corte', plan.fechaCorte],
      ['Fin de gracia', plan.fechaFinGracia ?? '—'], ['Días de gracia', plan.diasGracia ?? '—'],
      ['Capital inicial', m(plan.capitalVenta)], ['Interés de gracia', m(plan.interesGracia)],
      ['Capital capitalizado', m(plan.capitalCapitalizado)], ['Cuota base', m(plan.cuotaBase)],
      ['TEM', porcentaje(plan.tasaEfectivaMensual)],
      ['Intereses de cuotas', m(plan.interesesTotales)], ['Interés total (incluye gracia)', m(plan.totalFinanciamiento - plan.capitalVenta)],
      ['Total a pagar', m(plan.totalFinanciamiento)],
    ]}/>
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
    {s.cronograma && <Cronograma plan={s.cronograma}/>}
    {u && <><h4 className="font-bold text-sm">Simulación de pago único</h4><Datos datos={[
      ['Capital', m(u.capital)], ['Días de financiamiento', u.diasFinanciamiento],
      ['TED', porcentaje(u.tasaEfectivaDiaria)],
      ['Tasa efectiva del periodo', porcentaje(u.tasaEfectivaPeriodo)],
      ['Interés compensatorio', m(u.interesCompensatorio)], ['Total sin mora', m(u.totalSinMora)],
    ]}/></>}
    <div className="text-xs text-slate-600 divide-y divide-slate-100">{s.detalles.map(d => <div key={d.idProducto} className="flex justify-between p-2"><span>{d.cantidad} × {d.nombreProducto} · {m(d.precioUnitario)}</span><strong>{m(d.subtotal)}</strong></div>)}</div>
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
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [condicion, setCondicion] = useState<CondicionCrediticiaResponse | null>(null);
  const [cargaCondicion, setCargaCondicion] = useState(false);
  const [errorCondicion, setErrorCondicion] = useState('');
  const [recargaCondicion, setRecargaCondicion] = useState(0);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [items, setItems] = useState<VentaItem[]>([]);
  const [modalidad, setModalidad] = useState<ModalidadPago>('MENSUAL');
  const [cuotas, setCuotas] = useState(3);
  const [simulacion, setSimulacion] = useState<SimulacionVentaResponse | null>(null);
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
  const invalidaSimulacion = () => { setSimulacion(null); setError(''); };

  function seleccionarCliente(c: ClienteResponse) {
    if (cliente?.id === c.id) return;
    setCliente(c); setCondicion(null); setCargaCondicion(true); setErrorCondicion('');
    setItems([]); setBusquedaProducto(''); setErrorSaldo(''); invalidaSimulacion();
  }

  function agregarProducto(p: ProductoResponse) {
    setItems(prev => prev.some(i => i.producto.id === p.id) || prev.length >= 50 ? prev : [...prev, { producto: p, cantidad: '1' }]);
    invalidaSimulacion();
  }

  function construirSolicitud(): RegistrarVentaRequest | null {
    if (!cliente) return null;
    return {
      idCliente: cliente.id, modalidadPago: modalidad, numeroCuotas: modalidad === 'UNICO' ? 1 : cuotas,
      graciaAdicional: 0,
      detalles: items.map(i => ({ idProducto: i.producto.id, cantidad: Number(i.cantidad) })).sort((a, b) => a.idProducto - b.idProducto),
    };
  }

  async function simular() {
    const solicitud = construirSolicitud();
    if (!solicitud || !puedeAvanzar || !modalidadValida || simulando) return;
    setSimulando(true); setSimulacion(null); setError('');
    try {
      const resultado = await simularVenta(idTienda, solicitud);
      setSimulacion(resultado);
      setCondicion(anterior => anterior?.idCliente === resultado.idCliente ? {
        ...anterior, limiteCredito: resultado.limiteCredito,
        creditoUtilizado: resultado.creditoUtilizado, creditoDisponible: resultado.creditoDisponible,
      } : anterior);
    } catch (e) { setError(obtenerMensajeError(e)); }
    finally { setSimulando(false); }
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
    if (!cliente || !listo || envioEnCurso.current || venta) return;
    envioEnCurso.current = true; setRegistrando(true); setError('');
    const solicitud = construirSolicitud();
    if (!solicitud) { envioEnCurso.current = false; setRegistrando(false); return; }
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
    <div className="flex gap-3 items-center"><CheckCircle className="w-8 h-8 text-[#139a6c]"/><div><h2 className="text-lg font-bold">Venta registrada</h2><p className="text-xs text-slate-500">Venta N.° {venta.id} · {venta.nombreCliente}</p></div></div>
    <Datos datos={[
      ['Capital registrado', dinero(venta.totalVenta, venta.monedaVenta)], ['Modalidad', venta.modalidadPago],
      ['Fecha de venta', venta.fechaVenta], ['Corte asignado', venta.fechaCorteAsignada],
      ['Pago asignado', venta.fechaPagoAsignada], ['Código de crédito', planFinal?.codigoCredito ?? unicoFinal?.codigoCredito ?? (cargaFinal ? 'Consultando…' : 'No disponible por ahora')],
      ['Crédito utilizado actual', saldoFinal ? dinero(saldoFinal.creditoUtilizado, saldoFinal.monedaCredito) : '—'],
      ['Crédito disponible actual', saldoFinal ? dinero(saldoFinal.creditoDisponible, saldoFinal.monedaCredito) : '—'],
    ]}/>
    {errorSaldoFinal && <div role="alert" className="text-xs text-red-700"><p>No se pudo consultar el saldo actualizado: {errorSaldoFinal}</p><button className={secundario} onClick={() => { setErrorSaldoFinal(''); setRecargaSaldoFinal(n => n + 1); }}>Reconsultar saldo</button></div>}
    {cargaFinal && <p role="status" className="text-xs text-slate-500">Consultando obligaciones registradas...</p>}
    {errorFinal && <div role="alert" className="text-sm text-red-700 space-y-2"><p>La venta ya fue registrada. No vuelvas a enviarla. {errorFinal}</p><button className={secundario} onClick={() => { setErrorFinal(''); setCargaFinal(true); setRecargaFinal(n => n + 1); }}>Consultar nuevamente</button></div>}
    {planFinal && <Cronograma plan={planFinal} definitivo/>}
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

  return <div className="space-y-6">
    <div><h2 className="text-xl font-bold text-slate-900">Nueva venta a crédito</h2><p className="text-xs text-slate-500 mt-1">Selecciona un cliente, agrega productos y confirma el financiamiento.</p></div>
    <div className="flex flex-wrap gap-4 text-xs font-semibold">{['Cliente','Productos / servicios','Modalidad de pago','Confirmación'].map((t,i) => <div key={t} className={`flex gap-2 items-center ${paso === i+1 ? 'text-[#139a6c]' : 'text-slate-500'}`}><span className={`w-6 h-6 rounded-full flex items-center justify-center ${paso === i+1 ? 'bg-[#139a6c] text-white' : 'bg-slate-100'}`}>{i+1}</span>{t}</div>)}</div>
    {carga ? <p role="status" className={panel}>Cargando clientes y catálogo...</p> : errorCarga ? <div role="alert" className={panel}><p className="text-red-700">{errorCarga}</p><button className={secundario} onClick={() => { setErrorCarga(''); setCarga(true); setRecarga(n => n+1); }}>Reintentar</button></div> : <>
    {paso === 1 && <section className={panel}>
      <h3 className="font-bold">1. Selecciona el cliente</h3>
      <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input className={campo + ' pl-10'} aria-label="Buscar cliente por nombre o DNI" placeholder="Buscar por nombre o DNI" value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)}/></div>
      <div className="max-h-52 overflow-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
        {encontrados.map(c => <button key={c.id} type="button" onClick={() => seleccionarCliente(c)} className={`block w-full p-3 text-left text-xs ${cliente?.id === c.id ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50'}`}><strong>{c.nombreCliente}</strong><span className="ml-3">DNI {c.dniCliente}</span></button>)}
        {!encontrados.length && <p className="p-4 text-xs text-slate-500">No se encontraron clientes activos.</p>}
      </div>
      {cliente && <p className="font-semibold text-sm text-[#139a6c]">{cliente.nombreCliente} · DNI {cliente.dniCliente}</p>}
      {cargaCondicion && <p role="status" className="text-xs">Consultando condiciones crediticias...</p>}
      {errorCondicion && <div role="alert" className="text-xs text-red-700 space-y-2"><p>{errorCondicion}</p><button className={secundario} onClick={() => { setErrorCondicion(''); setCargaCondicion(true); setRecargaCondicion(n => n+1); }}>Reintentar</button></div>}
      {condicion && <><Datos datos={[
        ['Límite pactado', m(condicion.limiteCredito)], ['Crédito utilizado', saldoVigente ? m(condicion.creditoUtilizado) : '—'], ['Crédito disponible', saldoVigente ? m(condicion.creditoDisponible) : '—'],
        ['Tasa de interés', `${condicion.tipoTasa} · ${porcentaje(condicion.tasaInteres)} ${condicion.periodoTasa}`],
        ['Capitalización', condicion.capitalizacionTasa ?? 'No aplica'],
        ['Plazo máximo', `${condicion.plazoMaximo} cuotas`], ['Corte', `Día ${condicion.diaCorte} · ${condicion.horaCorte}`], ['Pago', `Día ${condicion.diaPago}`],
        ['Mora', `${condicion.tipoTasaMora} · ${porcentaje(condicion.tasaMoratoria)} ${condicion.periodoTasaMora}`],
        ['Capitalización mora', condicion.capitalizacionMora ?? 'No aplica'], ['Moneda', moneda],
      ]}/>
        {!saldoVigente && <div role="alert" className="space-y-2">
          {aviso('No pudimos consultar el crédito disponible. Vuelve a intentarlo para continuar.')}
          <button type="button" className={secundario} disabled={cargaCondicion} onClick={() => { setErrorCondicion(''); setCargaCondicion(true); setRecargaCondicion(n => n + 1); }}>Volver a consultar</button>
        </div>}
      </>}
      <div className="flex justify-end gap-3"><button className={secundario} onClick={onCancel}>Cancelar</button><button className={principal} disabled={!condicion || !saldoVigente || cargaCondicion} onClick={() => setPaso(2)}>Continuar</button></div>
    </section>}
    {paso === 2 && <section className={panel}>
      <h3 className="font-bold">2. Agrega productos o servicios</h3>
      <input className={campo} aria-label="Buscar productos" placeholder="Buscar producto o servicio" value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)}/>
      <div className="max-h-52 overflow-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
        {catalogo.map(p => <button type="button" key={p.id} disabled={items.some(i => i.producto.id === p.id) || items.length >= 50} onClick={() => agregarProducto(p)} className="w-full text-left flex justify-between gap-2 p-3 text-xs hover:bg-slate-50 disabled:opacity-50"><span><strong>{p.nombreProducto}</strong> · {p.unidadMedida} · {p.modalidad}</span><strong>{m(precioCredito(p)!)}</strong></button>)}
        {!catalogo.length && <p className="p-4 text-xs text-slate-500">{productos.length ? 'No se encontraron productos disponibles en la moneda del crédito.' : 'No hay productos disponibles en esta tienda. Registra o activa un producto en el catálogo para continuar.'}</p>}
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-xl"><table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500"><tr>{['Producto','Precio crédito','Cantidad','Subtotal',''].map((h,i) => <th key={i} className="p-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{items.map(i => <tr key={i.producto.id}><td className="p-3 font-semibold">{i.producto.nombreProducto}</td><td className="p-3">{m(precioCredito(i.producto)!)}</td><td className="p-3"><input aria-label={'Cantidad de '+i.producto.nombreProducto} className="w-24 border border-slate-200 rounded-lg p-2" type="number" min={admiteCantidadDecimal(i.producto.unidadMedida) ? .001 : 1} max={999999999} step={admiteCantidadDecimal(i.producto.unidadMedida) ? .001 : 1} value={i.cantidad} onChange={e => { const cantidad = e.target.value; setItems(prev => prev.map(it => it.producto.id === i.producto.id ? {...it, cantidad} : it)); invalidaSimulacion(); }}/>{!cantidadValida(i) && <p className="text-red-700 mt-1">Cantidad inválida</p>}</td><td className="p-3">{cantidadValida(i) ? m(subtotalCentavos(i, precioCredito(i.producto) ?? 0)/100) : '—'}</td><td className="p-3"><button aria-label={'Quitar '+i.producto.nombreProducto} onClick={() => { setItems(prev => prev.filter(it => it.producto.id !== i.producto.id)); invalidaSimulacion(); }}><Trash2 className="w-4 h-4 text-red-600"/></button></td></tr>)}</tbody>
      </table></div>
      <p className="text-sm font-bold">Capital estimado: {validas ? m(capital) : '—'}</p>
      {items.length > 0 && !unicoPermitido && !mensualPermitido && aviso('Los productos no comparten una modalidad de pago. Retira los incompatibles.')}
      {condicion && saldoVigente && capital > condicion.creditoDisponible && aviso('Crédito insuficiente: el capital supera el crédito disponible.')} 
      {condicion && <Datos datos={[[ 'Crédito disponible', m(condicion.creditoDisponible)], ['Disponible tras capital inicial (estimado)', m(Math.max(0, condicion.creditoDisponible - capital))]]}/>}
      <div className="flex justify-end gap-3"><button className={secundario} onClick={() => setPaso(1)}>Atrás</button><button className={principal} disabled={!puedeAvanzar} onClick={() => { setModalidad(mensualPermitido ? 'MENSUAL' : 'UNICO'); invalidaSimulacion(); setPaso(3); }}>Continuar</button></div>
    </section>}
    {paso === 3 && <section className={panel}>
      <h3 className="font-bold">3. Modalidad de pago</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {([['UNICO','Pago único del ciclo',unicoPermitido],['MENSUAL','Pago en meses · método francés',mensualPermitido]] as const).map(([v,label,permitido]) => <button key={v} disabled={!permitido || simulando} onClick={() => { setModalidad(v); invalidaSimulacion(); }} className={`p-4 border-2 rounded-2xl text-sm font-semibold text-left disabled:opacity-40 ${modalidad===v ? 'border-[#139a6c] bg-emerald-50' : 'border-slate-200'}`}>{label}</button>)}
      </div>
      {modalidad === 'MENSUAL' && condicion && <>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs font-semibold">Número de cuotas<select className={campo} disabled={simulando} value={cuotas} onChange={e => { setCuotas(Number(e.target.value)); invalidaSimulacion(); }}>{Array.from({length:Math.min(condicion.plazoMaximo,120)},(_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
          <div className="text-xs text-slate-600">El periodo de gracia se calcula automáticamente según las fechas pactadas con el cliente.</div>
        </div>
      </>}
      {modalidad === 'UNICO' && <p className="text-xs text-slate-600">El cliente realizará un solo pago en la fecha de vencimiento.</p>}
      <button className={secundario} disabled={simulando || !modalidadValida || !puedeAvanzar} onClick={simular}>{simulando ? 'Calculando...' : 'Simular venta'}</button>
      {simulacion && <ResumenSimulacion simulacion={simulacion}/>}
      {superaLimite && aviso('El capital a reservar supera el crédito disponible del cliente.')}
      {simulacion && <p className="text-xs text-slate-500">La simulación es referencial. El importe y el saldo se actualizarán al confirmar la venta.</p>}
      {condicion && <Datos datos={[[ 'Crédito disponible', m(condicion.creditoDisponible)], ['Capital a reservar', reserva === undefined ? 'Simula primero' : m(reserva)], ['Disponible posterior estimado', restante === null ? '—' : m(restante)]]}/>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <div className="flex justify-end gap-3"><button className={secundario} disabled={simulando} onClick={() => { invalidaSimulacion(); setPaso(2); }}>Atrás</button><button className={principal} disabled={!listo || simulando} onClick={() => setPaso(4)}>Continuar</button></div>
    </section>}
    {paso === 4 && <section className={panel}>
      <h3 className="font-bold">4. Revisa y confirma la venta</h3>
      <Datos datos={[[ 'Cliente', cliente?.nombreCliente], ['DNI', cliente?.dniCliente], ['Modalidad', modalidad], ['Cuotas', modalidad === 'UNICO' ? 1 : cuotas], ['Capital cotizado', simulacion ? dinero(simulacion.capitalVenta, simulacion.moneda) : '—'], ['Total preliminar', simulacion ? dinero(simulacion.totalPagar, simulacion.moneda) : '—'], ['Crédito disponible', condicion ? m(condicion.creditoDisponible) : '—'], ['Capital a reservar', reserva === undefined ? '—' : m(reserva)], ['Disponible posterior estimado', restante === null ? '—' : m(restante)]]}/>
      <div className="divide-y divide-slate-100 text-xs">{simulacion?.detalles.map(i => <div key={i.idProducto} className="flex justify-between p-2"><span>{i.cantidad} × {i.nombreProducto}</span><strong>{dinero(i.subtotal, simulacion.moneda)}</strong></div>)}</div>
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
