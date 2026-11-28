import { useEffect, useState } from "react";
import type { CronogramaResponse, PagoUnicoResponse } from "../../types/finanzas";
import { consultarCronograma, consultarMiCorte, consultarPagoUnico } from "../../api/finanzas";
import { obtenerMensajeError } from "../../api/errores";
import { useCuentaCliente } from "../../features/client-portal/state";
import {
  capitalCompra,
  codigo,
  dinero,
  fecha,
  porcentaje,
} from "../../features/client-portal/model";
import type { DetalleVentaResponse } from "../../types/ventas";
import { Aviso, Empty, FigmaIcon } from "../../features/client-portal/ui";

interface Props {
  idVenta: number;
  onBackToCompras: () => void;
}
export function ClientPlanPagosPage({ idVenta, onBackToCompras }: Props) {
  const { cuenta } = useCuentaCliente();
  const compra = cuenta?.compras.find((c) => c.idVenta === idVenta);
  const unico = compra?.modalidadPago === "UNICO";
  const [plan, setPlan] = useState<CronogramaResponse | null>(null);
  const [pagoUnico, setPagoUnico] = useState<PagoUnicoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [detalle, setDetalle] = useState<{ clave: string; productos: DetalleVentaResponse[]; error?: string } | null>(null);
  const fechaCorte = unico ? pagoUnico?.fechaCorteAsignada : plan?.fechaCorte;
  const ciclo = fechaCorte?.slice(0, 7);
  const idTienda = cuenta?.idTienda;
  const productosPagados = cuenta?.pagos.find(pago => pago.idVenta === idVenta && pago.detalles?.length)?.detalles;
  const claveDetalle = `${idTienda}|${idVenta}|${ciclo}`;
  const detalleActual = detalle?.clave === claveDetalle ? detalle : null;
  const productos = productosPagados ?? detalleActual?.productos;

  useEffect(() => {
    if (!ciclo || !idTienda || productosPagados) return;
    const controller = new AbortController();
    consultarMiCorte(idTienda, ciclo, controller.signal).then(corte => {
      if (controller.signal.aborted) return;
      if (corte.idTienda !== idTienda) throw new Error('El corte recibido no corresponde al establecimiento seleccionado.');
      const compra = corte.compras.find(compraCorte => compraCorte.idVenta === idVenta);
      setDetalle({ clave: claveDetalle, productos: compra?.detalles ?? [] });
    }).catch((causa: unknown) => {
      if (!controller.signal.aborted) setDetalle({ clave: claveDetalle, productos: [], error: obtenerMensajeError(causa) });
    });
    return () => controller.abort();
  }, [idTienda, idVenta, ciclo, claveDetalle, productosPagados]);

  useEffect(() => {
    const controller = new AbortController();
    if (!compra) return () => controller.abort();
    const request = unico
      ? consultarPagoUnico(idVenta, controller.signal).then((data) => {
          if (!controller.signal.aborted) setPagoUnico(data);
        })
      : consultarCronograma(idVenta, controller.signal).then((data) => {
          if (!controller.signal.aborted) setPlan(data);
        });
    request
      .catch((e) => {
        if (!controller.signal.aborted) setError(obtenerMensajeError(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [idVenta, unico, compra, revision]);
  if (!compra || !cuenta)
    return (
      <Empty>
        Esta compra no pertenece a tu cuenta.
        <button className="client-button" onClick={onBackToCompras}>
          Volver a mis compras
        </button>
      </Empty>
    );
  return (
    <div className="client-sections">
      <div className="client-heading">
        <h2>{unico ? "Detalle de pago único" : "Plan de pagos"}</h2>
        <p>
          Compra #{compra.idVenta} · {codigo(compra)} · {cuenta.comercio}
        </p>
      </div>
      {loading ? (
        <div className="client-panel client-empty" role="status">
          <span className="client-spinner" />
          Cargando el detalle de tu compra…
        </div>
      ) : error ? (
        <div className="client-panel client-empty" role="alert">
          <p>{error}</p>
          <button
            className="client-button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setRevision((n) => n + 1);
            }}
          >
            Volver a intentar
          </button>
        </div>
      ) : plan ? (
        <>
          <div className="client-stat-grid">
            <div className="client-stat">
              <span className="client-stat-icon">
                <FigmaIcon frame="14-277" name="imgIconoReceipt1" />
              </span>
              <div>
                <p>Monto financiado</p>
                <h3>{dinero(plan.capitalCapitalizado, plan.moneda)}</h3>
                <small>
                  Gracia capitalizada {dinero(plan.interesGracia, plan.moneda)}
                </small>
              </div>
            </div>
            <div className="client-stat">
              <span className="client-stat-icon">
                <FigmaIcon frame="14-277" name="imgIconoWallet1" />
              </span>
              <div>
                <p>Total de cuotas</p>
                <h3>{dinero(plan.totalFinanciamiento, plan.moneda)}</h3>
                <small>{plan.numeroCuotas} cuotas · método francés</small>
              </div>
            </div>
            <div className="client-stat">
              <span className="client-stat-icon">
                <FigmaIcon frame="14-277" name="imgIconoCalendar" />
              </span>
              <div>
                <p>Saldo de capital</p>
                <h3>{dinero(capitalCompra(cuenta, compra), compra.moneda)}</h3>
                <small>
                  {plan.fechaFinGracia
                    ? `Fin de gracia: ${fecha(plan.fechaFinGracia)}`
                    : "Según obligaciones registradas"}
                </small>
              </div>
            </div>
          </div>
          <section className="client-panel">
            <div className="client-panel-heading">
              <h3>Cronograma</h3>
              <p>
                Importes en {plan.moneda} · TEM{" "}
                {porcentaje(plan.tasaEfectivaMensual)}
              </p>
            </div>
            {plan.cuotas.length ? (
              <div className="client-table-scroll">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>N.º</th>
                      <th>Vencimiento</th>
                      <th>Saldo inicial</th>
                      <th>Interés</th>
                      <th>Amortización</th>
                      <th>Cuota</th>
                      <th>Saldo final</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.cuotas.map((c) => (
                      <tr key={c.numeroCuota}>
                        <td>{String(c.numeroCuota).padStart(2, "0")}</td>
                        <td>{fecha(c.fechaVencimiento)}</td>
                        <td>{dinero(c.saldoInicial, plan.moneda)}</td>
                        <td>{dinero(c.interes, plan.moneda)}</td>
                        <td>{dinero(c.amortizacion, plan.moneda)}</td>
                        <td>{dinero(c.cuota, plan.moneda)}</td>
                        <td>{dinero(c.saldoFinal, plan.moneda)}</td>
                        <td>{c.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>El cronograma todavía no tiene cuotas registradas.</Empty>
            )}
          </section>
        </>
      ) : pagoUnico ? (
        <>
          <div className="client-stat-grid">
            {[
              ["Capital", dinero(pagoUnico.capital, pagoUnico.moneda)],
              [
                "Interés compensatorio",
                dinero(pagoUnico.interesCompensatorio, pagoUnico.moneda),
              ],
              [
                "Total sin mora",
                dinero(pagoUnico.totalSinMora, pagoUnico.moneda),
              ],
            ].map(([label, value]) => (
              <div className="client-stat" key={label}>
                <div>
                  <p>{label}</p>
                  <h3>{value}</h3>
                </div>
              </div>
            ))}
          </div>
          <section className="client-panel client-detail">
            <h3>Condiciones de la obligación</h3>
            <dl>
              <div>
                <dt>Fecha de compra</dt>
                <dd>{fecha(pagoUnico.fechaVenta)}</dd>
              </div>
              <div>
                <dt>Fecha de corte</dt>
                <dd>{fecha(pagoUnico.fechaCorteAsignada)}</dd>
              </div>
              <div>
                <dt>Fecha de pago</dt>
                <dd>{fecha(pagoUnico.fechaPago)}</dd>
              </div>
              <div>
                <dt>Días de financiamiento</dt>
                <dd>{pagoUnico.diasFinanciamiento}</dd>
              </div>
              <div>
                <dt>Tasa efectiva diaria</dt>
                <dd>{porcentaje(pagoUnico.tasaEfectivaDiaria)}</dd>
              </div>
              <div>
                <dt>Tasa efectiva del período</dt>
                <dd>{porcentaje(pagoUnico.tasaEfectivaPeriodo)}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{pagoUnico.estadoCuota}</dd>
              </div>
            </dl>
            <p>
              Si existe atraso, consulta el importe actualizado en Mis pagos.
            </p>
          </section>
        </>
      ) : null}
      {!loading && !error && <section className="client-panel client-detail">
        <h3>Productos y servicios adquiridos</h3>
        {detalleActual?.error && !productosPagados ? <p role="alert">{detalleActual.error}</p>
          : productos?.length ? <ul className="divide-y divide-jades-line">
            {productos.map(producto => <li className="flex flex-wrap justify-between gap-3 py-3 text-sm tabular-nums" key={producto.idProducto}>
              <span>{producto.cantidad} × {producto.nombreProducto}</span><strong>{dinero(producto.subtotal, compra.moneda)}</strong>
            </li>)}
          </ul> : <p>{ciclo && !detalleActual ? 'Consultando detalle…' : 'Esta compra no tiene un detalle disponible en el corte.'}</p>}
      </section>}
      <Aviso>
        Solo consulta. Para efectuar un pago, comunícate con {cuenta.comercio}.
        No se aceptan pagos parciales.
      </Aviso>
      <div className="client-actions">
        <button className="client-button" onClick={onBackToCompras}>
          Volver a mis compras
        </button>
      </div>
    </div>
  );
}
