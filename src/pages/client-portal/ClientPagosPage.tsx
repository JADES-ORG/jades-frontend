import { useState } from "react";
import { Paginacion } from "../../components/shared/Paginacion";
import { useCuentaCliente } from "../../features/client-portal/state";
import {
  codigo,
  dinero,
  estadoObligacion,
  fecha,
  pendientes,
} from "../../features/client-portal/model";
import {
  Aviso,
  Empty,
  Estado,
  FigmaIcon,
} from "../../features/client-portal/ui";

export function ClientPagosPage() {
  const { cuenta } = useCuentaCliente();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [paginaPagos, setPaginaPagos] = useState(1);
  if (!cuenta) return null;
  const referencia = (idVenta: number) => {
    const c = cuenta.compras.find((c) => c.idVenta === idVenta);
    return c ? codigo(c) : `Venta #${idVenta}`;
  };
  const coincide = (idVenta: number) => referencia(idVenta).toLowerCase().includes(busqueda.trim().toLowerCase());
  const faltantes = pendientes(cuenta).filter(o => coincide(o.idVenta) && (estado === 'todos' || estadoObligacion(o) === estado));
  const pagos = cuenta.pagos.filter(p => coincide(p.idVenta))
    .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago) || b.idPago - a.idPago);
  const paginaActiva = Math.min(paginaPendientes, Math.max(1, Math.ceil(faltantes.length / 10)));
  const paginaHistorial = Math.min(paginaPagos, Math.max(1, Math.ceil(pagos.length / 10)));
  return (
    <div className="client-sections">
      <div className="client-heading">
        <h2>Mis pagos</h2>
        <p>
          Consulta tus próximos pagos y el historial de obligaciones canceladas.
        </p>
      </div>
      <div className="client-filters client-panel">
        <label className="client-search"><input aria-label="Buscar obligación" placeholder="Buscar por crédito o venta" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaPendientes(1); setPaginaPagos(1); }} /></label>
        <label className="client-select"><select aria-label="Estado de la obligación" value={estado} onChange={e => { setEstado(e.target.value); setPaginaPendientes(1); }}>
          <option value="todos">Todas las obligaciones</option>
          {['En mora', 'Vence hoy', 'Programada', 'Próxima'].map(valor => <option key={valor}>{valor}</option>)}
        </select></label>
      </div>
      <Aviso pagos>
        Esta es una vista de consulta. Para registrar un pago, comunícate con el
        negocio.
      </Aviso>
      <section className="client-panel client-payments">
        <div className="client-panel-heading with-icon">
          <span className="client-stat-icon">
            <FigmaIcon frame="14-601" name="imgFrame" />
          </span>
          <div>
            <h3>Próximos pagos</h3>
            <p>Importes pendientes registrados; el cobro efectivo puede variar si pagas antes del vencimiento.</p>
          </div>
        </div>
        {!faltantes.length ? (
          <Empty>No tienes pagos pendientes registrados.</Empty>
        ) : (
          <div className="client-table-scroll">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Obligación</th>
                  <th>Fecha de pago</th>
                  <th>Amortización</th>
                  <th>Interés compensatorio</th>
                  <th>Mora</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {faltantes.slice((paginaActiva - 1) * 10, paginaActiva * 10).map((o) => (
                  <tr key={o.idCuota}>
                    <td>
                      Cuota {String(o.numeroCuota).padStart(2, "0")} ·{" "}
                      {referencia(o.idVenta)}
                    </td>
                    <td>{fecha(o.fechaVencimiento)}</td>
                    <td>{dinero(o.capital, o.moneda)}</td>
                    <td>{dinero(o.interesCompensatorio, o.moneda)}</td>
                    <td>{dinero(o.moraPendiente, o.moneda)}</td>
                    <td><strong>{dinero(o.importePendiente, o.moneda)}</strong></td>
                    <td>
                      <Estado pagos>{estadoObligacion(o)}</Estado>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Paginacion total={faltantes.length} pagina={paginaActiva} onCambiar={setPaginaPendientes} etiqueta="obligaciones" />
      </section>
      <section className="client-panel client-payments">
        <div className="client-panel-heading with-icon">
          <span className="client-stat-icon">
            <FigmaIcon frame="14-601" name="imgFrame1" />
          </span>
          <div>
            <h3>Historial de pagos</h3>
            <p>Obligaciones pagadas anteriormente.</p>
          </div>
        </div>
        {!pagos.length ? (
          <Empty>Todavía no hay pagos registrados en tu historial.</Empty>
        ) : (
          <div className="client-table-scroll">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Obligación</th>
                  <th>Fecha real</th>
                  <th>Amortización</th>
                  <th>Interés compensatorio</th>
                  <th>Mora</th>
                  <th>Total</th>
                  <th>Medio de pago</th>
                </tr>
              </thead>
              <tbody>
                {pagos.slice((paginaHistorial - 1) * 10, paginaHistorial * 10).map((p) => {
                    const o = cuenta.obligaciones.find(
                      (o) => o.idCuota === p.idCuota,
                    );
                    return (
                      <tr key={p.idPago}>
                        <td>
                          {o
                            ? `Cuota ${String(o.numeroCuota).padStart(2, "0")} · ${referencia(o.idVenta)}`
                            : `Pago #${p.idPago}`}
                          <small>{p.estado}</small>
                        </td>
                        <td>{fecha(p.fechaPago)}{p.horaPagoEfectivo && <small>{p.horaPagoEfectivo}</small>}</td>
                        <td>{dinero(p.capitalPagado, p.moneda ?? o?.moneda)}</td>
                        <td>{dinero(p.interesPagado, p.moneda ?? o?.moneda)}</td>
                        <td>{dinero(p.moraPagada, p.moneda ?? o?.moneda)}</td>
                        <td><strong>{dinero(p.totalExigible, p.moneda ?? o?.moneda)}</strong></td>
                        <td>
                          {p.medioPago}
                          {p.detalles?.length > 0 && <details className="mt-2 text-xs">
                            <summary className="cursor-pointer font-semibold">Ver productos y servicios</summary>
                            <ul className="mt-1">
                              {p.detalles.map(item => <li key={item.idProducto}>{item.cantidad} × {item.nombreProducto} · {dinero(item.subtotal, p.moneda)}</li>)}
                            </ul>
                          </details>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        <Paginacion total={pagos.length} pagina={paginaHistorial} onCambiar={setPaginaPagos} etiqueta="pagos" />
      </section>
    </div>
  );
}
