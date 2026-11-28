import type { TiendaClienteResponse } from "../../types/finanzas";
import { etiquetaPeriodo, etiquetaTipoTasa, horaCorta, porcentajeTasa } from "../../features/clientes/model";
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
  tiendas: TiendaClienteResponse[];
  idTienda: number;
  onSelectTienda: (id: number) => void;
}
export function ClientDashboardPage({
  onVerPlan,
  onVerMisCompras,
  busqueda = "",
  tiendas,
  idTienda,
  onSelectTienda,
}: Props) {
  const { cuenta } = useCuentaCliente();
  if (!cuenta) return null;
  const condicion = cuenta.condicionCrediticia;
  const siguiente = pendientes(cuenta)[0];
  const capitales = capitalPorMoneda(cuenta);
  return (
    <div className="client-sections">
      <div className="client-heading">
        <h2>Hola, {cuenta.nombreCliente.trim().split(/\s+/)[0]}</h2>
        <p>Aquí puedes revisar tus compras y próximos pagos.</p>
      </div>
      <section className="client-panel">
        <div className="client-panel-heading"><h3>Mis establecimientos</h3></div>
        <div className="client-table-scroll"><table className="client-table">
          <thead><tr><th>Establecimiento</th><th>Estado</th><th>Pendientes</th><th>Moneda</th><th>Importe pendiente</th><th>Cuenta</th></tr></thead>
          <tbody>{tiendas.map(tienda => {
            const actual = tienda.idTienda === idTienda;
            return <tr key={tienda.idTienda}>
              <td><strong>{tienda.nombreTienda}</strong></td>
              <td><Estado>{tienda.estadoTienda === 'ACTIVO' ? 'Activa' : 'Inactiva'}</Estado></td>
              <td>{actual ? cuenta.resumen.cuotasPendientes : tienda.cuotasPendientes}</td>
              <td>{tienda.monedaCredito ?? '—'}</td>
              <td>{tienda.monedaCredito ? dinero(actual ? cuenta.resumen.totalPendienteRegistrado : tienda.totalPendiente, tienda.monedaCredito) : '—'}</td>
              <td>{actual ? <span aria-current="true">Cuenta abierta</span> : <button type="button" className="client-button" aria-label={`Ver cuenta de ${tienda.nombreTienda}`} onClick={() => onSelectTienda(tienda.idTienda)}>Ver cuenta</button>}</td>
            </tr>;
          })}</tbody>
        </table></div>
      </section>
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
          {condicion && <small>Crédito disponible: {dinero(condicion.creditoDisponible, condicion.monedaCredito)}</small>}
          {cuenta.compras.some(
            (c) =>
              !cuenta.obligaciones.some((o) => o.idVenta === c.idVenta) &&
              c.estado === "VIGENTE",
          ) && (
            <small>
              Algunas compras todavía no tienen un plan de pagos. Consulta con tu negocio para confirmar el saldo.
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
      {condicion && <section className="client-panel client-detail">
        <h3>Condiciones vigentes</h3>
        <dl>
          {[
            ['Límite', dinero(condicion.limiteCredito, condicion.monedaCredito)],
            ['Crédito utilizado', dinero(condicion.creditoUtilizado, condicion.monedaCredito)],
            ['Crédito disponible', dinero(condicion.creditoDisponible, condicion.monedaCredito)],
            ['Plazo máximo', `${condicion.plazoMaximo} meses`],
            ['Corte mensual', `Día ${condicion.diaCorte} · ${horaCorta(condicion.horaCorte)}`],
            ['Pago mensual', `Día ${condicion.diaPago}`],
            ['Interés compensatorio', `${porcentajeTasa(condicion.tasaInteres)} · ${etiquetaTipoTasa(condicion.tipoTasa)} ${etiquetaPeriodo(condicion.periodoTasa)}`],
            ['Capitalización compensatoria', condicion.capitalizacionTasa ? etiquetaPeriodo(condicion.capitalizacionTasa) : 'No aplica'],
            ['Interés moratorio', `${porcentajeTasa(condicion.tasaMoratoria)} · ${etiquetaTipoTasa(condicion.tipoTasaMora)} ${etiquetaPeriodo(condicion.periodoTasaMora)}`],
            ['Capitalización moratoria', condicion.capitalizacionMora ? etiquetaPeriodo(condicion.capitalizacionMora) : 'No aplica'],
          ].map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor}</dd></div>)}
        </dl>
      </section>}
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
