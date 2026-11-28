import { useState } from 'react';
import './store-dashboard.css';
import { AyudaCampo } from '../../components/shared/AyudaCampo';
import type { Moneda } from '../../types/finanzas';
import { AlertTriangle, Check, ChevronRight, Clock, CreditCard, Plus, ShoppingCart, Wallet, CalendarClock } from 'lucide-react';
import { dinero, fecha, hoyLima } from '../../features/client-portal/model';
import { obligacionesPendientes, proximosSieteDias, useCuentasTienda } from '../../features/cobranzas/cuentas';

interface Props {
  idTienda: number;
  nombreUsuario?: string;
  revision: number;
  soloConsulta: boolean;
  onGoToClients: () => void;
  onGoToPayments: () => void;
  onGoToSales: () => void;
}

export function StoreDashboardPage({ idTienda, nombreUsuario, revision, soloConsulta, onGoToClients, onGoToPayments, onGoToSales }: Props) {
  const { cuentas, cargando, error, recargar } = useCuentasTienda(idTienda, revision);
  const hoy = hoyLima();
  const [monedaGrafico, setMonedaGrafico] = useState<Moneda>('PEN');
  const obligaciones = obligacionesPendientes(cuentas);
  const proximos = obligaciones.filter(o => o.fechaVencimiento === hoy || proximosSieteDias(o.fechaVencimiento, hoy));
  const pagos = cuentas.flatMap(cuenta => cuenta.pagos.map(pago => ({ ...pago, cliente: cuenta.nombreCliente })));
  const indicadores = [
    { titulo: 'Total por cobrar', icono: Wallet, tono: 'verde', descripcion: 'Obligaciones pendientes', filas: obligaciones.map(o => ({ monto: o.importePendiente, moneda: o.moneda })) },
    { titulo: 'Cobrado este mes', icono: CreditCard, tono: 'verde', descripcion: 'Pagos registrados este mes', filas: pagos.filter(pago => pago.fechaPago.slice(0, 7) === hoy.slice(0, 7)).map(pago => ({ monto: pago.totalExigible, moneda: pago.moneda })) },
    { titulo: 'Pagos por vencer', icono: Clock, tono: 'ambar', descripcion: 'Próximos 7 días', filas: proximos.map(o => ({ monto: o.importePendiente, moneda: o.moneda })) },
    { titulo: 'Deuda en mora', icono: AlertTriangle, tono: 'rojo', descripcion: 'Obligaciones vencidas', filas: obligaciones.filter(o => o.estado === 'En mora').map(o => ({ monto: o.importePendiente, moneda: o.moneda })) },
  ];
  const actividad = [
    ...pagos.map(pago => ({ id: `pago-${pago.idPago}`, etiqueta: 'Pago recibido', dia: pago.fechaPago, cliente: pago.cliente, monto: dinero(pago.totalExigible, pago.moneda) })),
    ...cuentas.flatMap(cuenta => cuenta.compras.map(compra => ({
      id: `venta-${compra.idVenta}`, etiqueta: 'Venta registrada', dia: compra.fechaCompra,
      cliente: cuenta.nombreCliente, monto: dinero(compra.total, compra.moneda),
    }))),
  ].sort((a, b) => b.dia.localeCompare(a.dia)).slice(0, 3);

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
  const maximo = Math.max(1, ...meses.flatMap(mes => [mes.esperado, mes.recibido]));
  const potencia = 10 ** Math.floor(Math.log10(maximo / 4));
  const paso = Math.ceil(maximo / (4 * potencia)) * potencia;
  const escala = paso * 4;
  const niveles = Array.from({ length: 5 }, (_, indice) => escala - paso * indice);
  const nombre = nombreUsuario?.trim().split(/\s+/)[0];
  const hora = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'America/Lima' }).format(new Date()));
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const iniciales = (nombreCliente: string) => nombreCliente.trim().split(/\s+/).slice(0, 2).map(palabra => palabra[0]?.toUpperCase()).join('');
  const manana = new Date(hoy + 'T00:00:00Z');
  manana.setUTCDate(manana.getUTCDate() + 1);
  const fechaManana = manana.toISOString().slice(0, 10);
  const eje = (valor: number) => `${monedaGrafico === 'PEN' ? 'S/' : 'US

} ${new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 1 }).format(valor)}`;

  return <div className="store-dashboard">
    <header className="store-dashboard-welcome">
      <div>
        <h2>{nombre ? `${saludo}, ${nombre}` : saludo}</h2>
        <p>Este es el estado de tus ventas a crédito hoy.</p>
      </div>
      {!soloConsulta && <button type="button" onClick={onGoToSales} className="store-dashboard-create">
        <Plus aria-hidden="true" size={17} /> Registrar venta
      </button>}
    </header>
    {cargando && <p role="status" className="store-dashboard-panel store-dashboard-message">Cargando indicadores…</p>}
    {error && <p role="alert" className="store-dashboard-panel store-dashboard-message text-jades-danger">{error} <button className="font-semibold underline" onClick={recargar}>Reintentar</button></p>}
    {!cargando && !error && <>
      <section className="store-dashboard-metrics" aria-label="Indicadores del negocio">
        {indicadores.map(({ titulo, icono: Icono, tono, descripcion, filas }) => <div key={titulo} className="store-dashboard-panel store-dashboard-metric">
          <span className={`store-dashboard-icon ${tono}`}><Icono aria-hidden="true" size={20} strokeWidth={1.8} /></span>
          <div className="store-dashboard-metric-copy">
            <p>{titulo}</p>
            <div className="store-dashboard-amounts">
              {(['PEN', 'USD'] as const).map((moneda, indice) => <span key={moneda} className={indice === 0 ? 'principal' : 'secundario'}>
                {dinero(filas.filter(fila => fila.moneda === moneda).reduce((total, fila) => total + fila.monto, 0), moneda)}
              </span>)}
            </div>
            <p>{descripcion}</p>
          </div>
        </div>)}
      </section>
      <div className="store-dashboard-overview">
        <section className="store-dashboard-panel store-dashboard-chart">
          <header className="store-dashboard-panel-header">
            <div><h3>Cobros de los últimos 6 meses</h3><p>Pagos recibidos vs. pagos esperados</p></div>
            <select aria-label="Moneda de cobros" value={monedaGrafico} onChange={e => setMonedaGrafico(e.target.value as Moneda)} className="store-dashboard-currency">
              <option value="PEN">Soles (PEN)</option><option value="USD">Dólares (USD)</option>
            </select>
          </header>
          <div className="store-dashboard-plot">
            <div className="store-dashboard-axis" aria-hidden="true">
              {niveles.map(valor => <span key={valor}>{eje(valor)}</span>)}
            </div>
            <div className="store-dashboard-chart-area">
              <div className="store-dashboard-gridlines" aria-hidden="true">{niveles.map(valor => <span key={valor} />)}</div>
              <ol className="store-dashboard-bars">
                {meses.map(mes => <li key={mes.periodo}>
                  <div className="store-dashboard-bar-pair" role="img" aria-label={`${mes.etiqueta}, esperado ${dinero(mes.esperado, monedaGrafico)}, recibido ${dinero(mes.recibido, monedaGrafico)}`}>
                    <span aria-hidden="true" title={`Esperado ${dinero(mes.esperado, monedaGrafico)}`} className="esperado" style={{ height: `${mes.esperado / escala * 100}%` }} />
                    <span aria-hidden="true" title={`Recibido ${dinero(mes.recibido, monedaGrafico)}`} className="recibido" style={{ height: `${mes.recibido / escala * 100}%` }} />
                  </div>
                  <span className="store-dashboard-month">{mes.etiqueta}</span>
                </li>)}
              </ol>
            </div>
          </div>
          <div className="store-dashboard-legend">
            <span><i className="esperado" aria-hidden="true" /> Esperado</span>
            <span><i className="recibido" aria-hidden="true" /> Recibido</span>
            <AyudaCampo etiqueta="el resumen de cobros" texto="Esperado agrupa las cuotas por vencimiento. Recibido agrupa los pagos registrados por fecha efectiva." />
          </div>
        </section>
        <section className="store-dashboard-panel store-dashboard-upcoming">
          <header className="store-dashboard-panel-header">
            <div><h3>Próximos cobros</h3><p>Pagos de los siguientes 7 días</p></div>
            <button type="button" onClick={onGoToPayments} className="store-dashboard-link">Ver todos <ChevronRight size={13} aria-hidden="true" /></button>
          </header>
          {proximos.length > 0 ? <ul className="store-dashboard-upcoming-list">
            {proximos.slice(0, 4).map(o => <li key={o.idCuota}>
              <span className="store-dashboard-avatar" aria-hidden="true">{iniciales(o.cliente)}</span>
              <div className="store-dashboard-person"><strong title={o.cliente}>{o.cliente}</strong><span title={o.obligacion}>{o.obligacion}</span></div>
              <div className="store-dashboard-due">
                <strong>{dinero(o.importePendiente, o.moneda)}</strong>
                <span className={`store-dashboard-due-badge ${o.fechaVencimiento === hoy ? 'hoy' : o.fechaVencimiento === fechaManana ? 'manana' : 'fecha'}`}><i aria-hidden="true" />{o.fechaVencimiento === hoy ? 'Hoy' : o.fechaVencimiento === fechaManana ? 'Mañana' : fecha(o.fechaVencimiento)}</span>
              </div>
            </li>)}
          </ul> : <div className="store-dashboard-empty">
            <span className="store-dashboard-icon verde"><CalendarClock size={22} aria-hidden="true" /></span>
            <strong>No hay vencimientos próximos</strong>
            <p>No tienes cobros programados para los siguientes 7 días.</p>
          </div>}
        </section>
      </div>
      <section className="store-dashboard-panel store-dashboard-activity">
        <header className="store-dashboard-panel-header">
          <div><h3>Actividad reciente</h3><p>Últimos movimientos de créditos y pagos</p></div>
          <button type="button" onClick={onGoToClients} className="store-dashboard-link">Ver clientes <ChevronRight size={13} aria-hidden="true" /></button>
        </header>
        {actividad.length ? <ul className="store-dashboard-activity-list">
          {actividad.map(item => {
            const Icono = item.id.startsWith('pago-') ? Check : ShoppingCart;
            return <li key={item.id}>
              <span className="store-dashboard-icon verde"><Icono size={18} aria-hidden="true" /></span>
              <div className="store-dashboard-activity-copy">
                <strong>{item.etiqueta}</strong>
                <p>{item.cliente}</p>
                <div><span>{fecha(item.dia)}</span><strong>{item.monto}</strong></div>
              </div>
            </li>;
          })}
        </ul> : <p className="store-dashboard-message">No hay movimientos registrados.</p>}
      </section>
    </>}
  </div>;
}
