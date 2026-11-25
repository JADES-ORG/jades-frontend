import { useCuentaCliente } from "../../features/client-portal/state";
import {
  capitalPorMoneda,
  coincide,
  dinero,
  estadoObligacion,
  fecha,
  pendientes,
} from "../../features/client-portal/model";
import {
  Aviso,
  ComprasTable,
  Empty,
  Estado,
} from "../../features/client-portal/ui";

interface Props {
  onVerPlan: (idVenta: number) => void;
  onVerMisCompras: () => void;
  busqueda?: string;
}
export function ClientDashboardPage({
  onVerPlan,
  onVerMisCompras,
  busqueda = "",
}: Props) {
  const { cuenta } = useCuentaCliente();
  if (!cuenta) return null;
  const siguiente = pendientes(cuenta)[0];
  const capitales = capitalPorMoneda(cuenta);
  return (
    <div className="client-sections">
      <div className="client-heading">
        <h2>Hola, {cuenta.nombreCliente.trim().split(/\s+/)[0]}</h2>
        <p>Aquí puedes revisar tus compras y próximos pagos.</p>
      </div>
      <section className="client-hero" aria-label="Resumen de tu cuenta">
        <div>
          <p>Capital pendiente</p>
          {capitales.length ? (
            capitales.map(([moneda, monto]) => (
              <h3 key={moneda}>
                {monto == null
                  ? `Saldo por confirmar (${moneda})`
                  : dinero(monto, moneda)}
              </h3>
            ))
          ) : (
            <h3>Sin deuda registrada</h3>
          )}
          <small title="El endpoint del portal no devuelve el límite autorizado.">
            Crédito disponible: no informado por el negocio
          </small>
          {cuenta.compras.some(
            (c) =>
              !cuenta.obligaciones.some((o) => o.idVenta === c.idVenta) &&
              c.estado === "VIGENTE",
          ) && (
            <small>
              Hay compras sin obligaciones generadas; su saldo está por
              confirmar.
            </small>
          )}
        </div>
        <div>
          <p>
            Próximo pago
            {siguiente ? ` · ${fecha(siguiente.fechaVencimiento)}` : ""}
          </p>
          <h3>
            {siguiente
              ? dinero(siguiente.importePendiente, siguiente.moneda)
              : "Sin pagos pendientes"}
          </h3>
          {siguiente && <Estado>{estadoObligacion(siguiente)}</Estado>}
        </div>
        <button className="client-button" onClick={onVerMisCompras}>
          Ver mis compras
        </button>
      </section>
      <section className="client-panel">
        <div className="client-panel-heading">
          <h3>Mis compras a crédito</h3>
          <p>Operaciones activas y pagadas · {cuenta.comercio}</p>
        </div>
        {cuenta.compras.length ? (
          <ComprasTable
            cuenta={cuenta}
            compras={cuenta.compras.filter((c) => coincide(c, busqueda))}
            onVerPlan={onVerPlan}
            resumen
          />
        ) : (
          <Empty>Aún no tienes compras registradas en {cuenta.comercio}.</Empty>
        )}
      </section>
      <Aviso>
        Vista de consulta. Los pagos se registran únicamente desde el negocio.
      </Aviso>
    </div>
  );
}
