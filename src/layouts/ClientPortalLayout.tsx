import type { TiendaClienteResponse } from "../types/finanzas";
import { useState } from "react";
import type { ReactNode } from "react";
import { useCuentaCliente } from "../features/client-portal/state";
import {
  codigo,
  dinero,
  fecha,
  pendientes,
} from "../features/client-portal/model";
import { FigmaIcon } from "../features/client-portal/ui";
import "../features/client-portal/client-portal.css";

export type ClientTab = "resumen" | "compras" | "pagos" | "ayuda";
interface Props {
  currentTab: ClientTab;
  tiendas: TiendaClienteResponse[];
  idTienda: number;
  onSelectTienda: (id: number) => void;
  onSelectTab: (tab: ClientTab) => void;
  onLogout: () => void;
  children: ReactNode;
  busqueda: string;
  onBuscar: (value: string) => void;
  planAbierto?: boolean;
}
export function ClientPortalLayout({
  currentTab,
  tiendas,
  idTienda,
  onSelectTienda,
  onSelectTab,
  onLogout,
  children,
  busqueda,
  onBuscar,
  planAbierto,
}: Props) {
  const { cuenta, loading, recargar } = useCuentaCliente();
  const [notices, setNotices] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nombre = cuenta?.nombreCliente || "Mi cuenta";
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const frame = planAbierto
    ? "14-277"
    : currentTab === "compras"
      ? "14-146"
      : currentTab === "pagos"
        ? "14-601"
        : currentTab === "ayuda"
          ? "82-114"
          : "14-2";
  const avisos = cuenta ? pendientes(cuenta).slice(0, 5) : [];
  const nav: { tab: ClientTab; label: string; icon: string }[] = [
    { tab: "resumen", label: "Mi resumen", icon: "imgIconoHome" },
    {
      tab: "compras",
      label: "Mis compras",
      icon: ["14-146", "14-277"].includes(frame)
        ? "imgIconoReceipt"
        : "imgIconoReceipt1",
    },
    { tab: "pagos", label: "Mis pagos", icon: "imgIconoWallet" },
    { tab: "ayuda", label: "Ayuda", icon: "imgIconoAyuda" },
  ];
  return (
    <div className="client-portal">
      <aside className={`client-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="client-brand">
          <span className="client-logo">
            <FigmaIcon frame={frame} name="imgIconoReceipt" />
          </span>
          <div>
            <h1>JADES</h1>
            <p>Créditos simples</p>
          </div>
        </div>
        <div className="client-identity">
          <span className="client-avatar">{iniciales}</span>
          <div>
            <strong>Portal cliente</strong>
            <small>{nombre}</small>
          </div>
        </div>
        <label className="mx-4 my-3 grid gap-1 text-xs font-semibold text-white">
          Establecimiento
          <select className="min-h-11 w-full rounded-lg border border-white/20 bg-[#124435] px-2 text-sm text-white" value={idTienda} onChange={e => onSelectTienda(Number(e.target.value))}>
            {tiendas.map(tienda => <option key={tienda.idTienda} value={tienda.idTienda}>
              {tienda.nombreTienda}{tienda.cuotasPendientes > 0 ? ` · ${tienda.cuotasPendientes} pendientes` : ''}{tienda.estadoTienda === 'INACTIVO' ? ' · Inactiva' : ''}
            </option>)}
          </select>
        </label>
        <p className="client-menu-label">MENÚ PRINCIPAL</p>
        <nav aria-label="Menú del cliente">
          {nav.map((item) => (
            <button
              key={item.tab}
              className={currentTab === item.tab ? "active" : ""}
              aria-current={currentTab === item.tab ? "page" : undefined}
              onClick={() => {
                onSelectTab(item.tab);
                setMobileOpen(false);
                setNotices(false);
              }}
            >
              <FigmaIcon frame={frame} name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="client-profile">
          <span className="client-avatar">{iniciales}</span>
          <div>
            <strong>{nombre}</strong>
            <button onClick={onLogout}>Cerrar sesión</button>
          </div>
        </div>
      </aside>
      <div className="client-main">
        <header className="client-topbar">
          <button
            className="client-mobile-menu client-button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            Menú
          </button>
          <div className="client-topbar-spacer" />
          <label className="client-search client-global-search">
            <FigmaIcon frame={frame} name="imgIconoSearch" />
            <input
              aria-label="Buscar en mis compras"
              placeholder="Buscar compras..."
              value={busqueda}
              onChange={(e) => {
                onBuscar(e.target.value);
                if (currentTab !== "compras" || planAbierto)
                  onSelectTab("compras");
              }}
            />
          </label>
          <div className="client-notifications">
            <button
              className="client-icon-button"
              aria-label="Ver próximos vencimientos"
              aria-expanded={notices}
              onClick={() => setNotices((v) => !v)}
            >
              <FigmaIcon frame={frame} name="imgIconoBell" />
            </button>
            {notices && (
              <div className="client-notifications-panel">
                <div>
                  <strong>Próximos vencimientos</strong>
                  <button
                    aria-label="Cerrar vencimientos"
                    onClick={() => setNotices(false)}
                  >
                    ×
                  </button>
                </div>
                {avisos.length ? (
                  avisos.map((o) => {
                    const c = cuenta!.compras.find(
                      (c) => c.idVenta === o.idVenta,
                    );
                    return (
                      <button
                        key={o.idCuota}
                        onClick={() => {
                          onSelectTab("pagos");
                          setNotices(false);
                        }}
                      >
                        {c ? codigo(c) : `Venta #${o.idVenta}`} ·{" "}
                        {fecha(o.fechaVencimiento)}
                        <small>{dinero(o.importePendiente, o.moneda)}</small>
                      </button>
                    );
                  })
                ) : (
                  <p>No hay vencimientos pendientes registrados.</p>
                )}
              </div>
            )}
          </div>
          <span className="client-avatar" title={nombre}>
            {iniciales}
          </span>
        </header>
        <main className="client-content" id="contenido-cliente">
          <div className="client-refresh">
            <span>{cuenta?.comercio}</span>
            <button
              className="client-text-button"
              disabled={loading}
              onClick={recargar}
            >
              Actualizar cuenta
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
