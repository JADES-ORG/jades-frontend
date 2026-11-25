import type { ReactNode } from "react";
import { useState } from "react";
import { useCuentaCliente } from "./state";
import {
  capitalCompra,
  codigo,
  cuotasDe,
  dinero,
  estadoCompra,
  fecha,
} from "./model";
import type { Compra, CuentaCliente } from "./types";

export function FigmaIcon({
  frame = "14-2",
  name,
  className = "",
}: {
  frame?: string;
  name: string;
  className?: string;
}) {
  return (
    <img
      src={`/client-icons/${frame}-${name}.svg`}
      alt=""
      className={`client-icon ${className}`}
    />
  );
}
export function Aviso({
  children,
  pagos = false,
}: {
  children: ReactNode;
  pagos?: boolean;
}) {
  return (
    <div className="client-notice">
      {pagos ? (
        <span className="client-info-symbol">
          <FigmaIcon frame="14-601" name="imgEllipse" />
          <span>i</span>
        </span>
      ) : (
        <FigmaIcon name="imgIconoInfo" />
      )}
      <span>{children}</span>
    </div>
  );
}
export function Estado({
  children,
  pagos = false,
}: {
  children: string;
  pagos?: boolean;
}) {
  const tone =
    children === "Pagado"
      ? "success"
      : children === "En mora"
        ? "danger"
        : ["Pendiente", "Vence hoy"].includes(children)
          ? "warning"
          : children === "Próxima"
            ? "blue"
            : children === "Programada"
              ? "purple"
              : "neutral";
  return (
    <span className={`client-status ${tone}`}>
      {pagos && ["Vence hoy", "Próxima", "Programada"].includes(children) ? (
        <FigmaIcon
          frame="14-601"
          name={
            children === "Vence hoy"
              ? "imgEllipse1"
              : children === "Próxima"
                ? "imgEllipse2"
                : "imgEllipse3"
          }
        />
      ) : (
        <span aria-hidden="true">•</span>
      )}{" "}
      {children}
    </span>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="client-empty">{children}</div>;
}
export function CuentaBoundary({ children }: { children: ReactNode }) {
  const { loading, error, recargar } = useCuentaCliente();
  if (loading)
    return (
      <div className="client-panel client-empty" role="status">
        <span className="client-spinner" />
        Cargando tu cuenta…
      </div>
    );
  if (error)
    return (
      <div className="client-panel client-empty" role="alert">
        <h2>No pudimos cargar tu cuenta</h2>
        <p>{error}</p>
        <button className="client-button primary" onClick={recargar}>
          Volver a intentar
        </button>
      </div>
    );
  return children;
}
export function ComprasTable({
  cuenta,
  compras,
  onVerPlan,
  resumen = false,
}: {
  cuenta: CuentaCliente;
  compras: Compra[];
  onVerPlan: (id: number) => void;
  resumen?: boolean;
}) {
  const [page, setPage] = useState(1);
  const size = 8;
  const totalPages = Math.max(1, Math.ceil(compras.length / size));
  const current = Math.min(page, totalPages);
  return (
    <>
      {!compras.length ? (
        <Empty>No hay compras que coincidan con esta consulta.</Empty>
      ) : (
        <div className="client-table-scroll">
          <table className="client-table">
            <thead>
              <tr>
                <th>Compra</th>
                <th>Fecha</th>
                <th>Modalidad</th>
                <th>{resumen ? "Capital venta" : "Capital"}</th>
                <th>Interés de cuotas</th>
                <th>Saldo capital</th>
                <th>Estado</th>
                <th>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {compras.slice((current - 1) * size, current * size).map((c) => {
                const cuotas = cuotasDe(cuenta, c.idVenta);
                return (
                  <tr key={c.idVenta}>
                    <td>
                      <strong>Compra #{c.idVenta}</strong>
                      <small>{codigo(c)}</small>
                    </td>
                    <td>{fecha(c.fechaCompra)}</td>
                    <td>
                      {c.modalidadPago === "MENSUAL"
                        ? `${c.numeroCuotas} ${c.numeroCuotas === 1 ? "mes" : "meses"}`
                        : c.modalidadPago === "UNICO"
                          ? "Pago único"
                          : c.modalidadPago}
                    </td>
                    <td>{dinero(c.total, c.moneda)}</td>
                    <td>
                      {cuotas.length
                        ? dinero(
                            cuotas.reduce(
                              (s, o) => s + o.interesCompensatorio,
                              0,
                            ),
                            c.moneda,
                          )
                        : "—"}
                    </td>
                    <td>{dinero(capitalCompra(cuenta, c), c.moneda)}</td>
                    <td>
                      <Estado>{estadoCompra(cuenta, c)}</Estado>
                    </td>
                    <td>
                      <button
                        className="client-button"
                        onClick={() => onVerPlan(c.idVenta)}
                        aria-label={`Ver ${c.modalidadPago === "UNICO" ? "detalle" : "plan"} de ${codigo(c)}`}
                      >
                        {c.modalidadPago === "UNICO"
                          ? "Ver detalle"
                          : "Ver plan"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="client-pagination">
          <span>
            {compras.length} compras · Página {current} de {totalPages}
          </span>
          <button
            className="client-button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Anterior
          </button>
          <button
            className="client-button"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  );
}
