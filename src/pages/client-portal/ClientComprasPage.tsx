import { useState } from "react";
import { useCuentaCliente } from "../../features/client-portal/state";
import { coincide, estadoCompra } from "../../features/client-portal/model";
import { ComprasTable, FigmaIcon } from "../../features/client-portal/ui";

interface Props {
  onVerPlan: (idVenta: number) => void;
  busqueda?: string;
}
export function ClientComprasPage({ onVerPlan, busqueda = "" }: Props) {
  const { cuenta } = useCuentaCliente();
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("Todas");
  if (!cuenta) return null;
  const compras = cuenta.compras.filter(
    (c) =>
      coincide(c, query) &&
      coincide(c, busqueda) &&
      (estado === "Todas" || estadoCompra(cuenta, c) === estado),
  );
  return (
    <div className="client-sections">
      <div className="client-heading">
        <h2>Mis compras</h2>
        <p>Detalle de tus compras realizadas a crédito.</p>
      </div>
      <section className="client-panel">
        <div className="client-filters">
          <label className="client-search">
            <FigmaIcon frame="14-146" name="imgIconoSearch" />
            <input
              aria-label="Buscar compra"
              placeholder="Buscar compra"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="client-select">
            <span className="sr-only">Filtrar compras por estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="Todas">Todas las obligaciones</option>
              {["Pendiente", "En mora", "Pagado", "Sin plan", "Anulada"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
            <FigmaIcon frame="14-146" name="imgIconoChevronDown" />
          </label>
        </div>
        <ComprasTable
          key={`${query}:${busqueda}:${estado}`}
          cuenta={cuenta}
          compras={compras}
          onVerPlan={onVerPlan}
        />
      </section>
    </div>
  );
}
