import { useEffect, useState } from "react";
import { ClientPortalLayout } from "../../layouts/ClientPortalLayout";
import type { ClientTab } from "../../layouts/ClientPortalLayout";
import { ClientDashboardPage } from "../../pages/client-portal/ClientDashboardPage";
import { ClientComprasPage } from "../../pages/client-portal/ClientComprasPage";
import { ClientPagosPage } from "../../pages/client-portal/ClientPagosPage";
import { ClientPlanPagosPage } from "../../pages/client-portal/ClientPlanPagosPage";
import { ClientAyudaPage } from "../../pages/client-portal/ClientAyudaPage";
import { CuentaClienteProvider } from "./context";
import { listarTiendasCliente } from "../../api/clientes";
import { obtenerMensajeError } from "../../api/errores";
import type { TiendaClienteResponse } from "../../types/finanzas";
import { CuentaBoundary } from "./ui";

export function ClientPortal({ onLogout }: { onLogout: () => void }) {
  const [resultado, setResultado] = useState<{ tiendas: TiendaClienteResponse[]; error: string } | null>(null);
  const [idTienda, setIdTienda] = useState<number | null>(null);
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    listarTiendasCliente(controller.signal).then(tiendas => {
      if (controller.signal.aborted) return;
      setResultado({ tiendas, error: "" });
      setIdTienda((tiendas.find(tienda => tienda.cuotasPendientes > 0) ?? tiendas[0])?.idTienda ?? null);
    }).catch((causa: unknown) => {
      if (!controller.signal.aborted) setResultado({ tiendas: [], error: obtenerMensajeError(causa) });
    });
    return () => controller.abort();
  }, [intento]);

  if (idTienda == null || !resultado) return <div className="min-h-screen bg-slate-50 p-6">
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold text-slate-900">Portal cliente</h1>
      {!resultado ? <p role="status">Cargando establecimientos…</p> : resultado.error
        ? <p role="alert" className="text-red-700">{resultado.error} <button className="font-semibold underline" onClick={() => {
          setResultado(null);
          setIntento(n => n + 1);
        }}>Reintentar</button></p>
        : <p>Todavía no tienes establecimientos vinculados.</p>}
      <button className="text-sm font-semibold text-[#137b57]" onClick={onLogout}>Cerrar sesión</button>
    </div>
  </div>;

  return <CuentaClienteProvider key={idTienda} idTienda={idTienda}>
    <PortalTienda tiendas={resultado.tiendas} idTienda={idTienda} onSelectTienda={setIdTienda} onLogout={onLogout} />
  </CuentaClienteProvider>;
}

interface PortalTiendaProps {
  tiendas: TiendaClienteResponse[];
  idTienda: number;
  onSelectTienda: (id: number) => void;
  onLogout: () => void;
}

function PortalTienda({ tiendas, idTienda, onSelectTienda, onLogout }: PortalTiendaProps) {
  const [tab, setTab] = useState<ClientTab>("resumen");
  const [idVenta, setIdVenta] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = (next: ClientTab) => {
    setTab(next);
    setIdVenta(null);
  };
  const verPlan = (id: number) => {
    setIdVenta(id);
    setTab("compras");
  };
  return (
    <ClientPortalLayout
        tiendas={tiendas}
        idTienda={idTienda}
        onSelectTienda={onSelectTienda}
        currentTab={tab}
        onSelectTab={navigate}
        onLogout={onLogout}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        planAbierto={idVenta != null}
      >
        <CuentaBoundary>
          {idVenta != null ? (
            <ClientPlanPagosPage
              key={idVenta}
              idVenta={idVenta}
              onBackToCompras={() => navigate("compras")}
            />
          ) : tab === "resumen" ? (
            <ClientDashboardPage
              onVerPlan={verPlan}
              tiendas={tiendas}
              idTienda={idTienda}
              onSelectTienda={onSelectTienda}
              onVerMisCompras={() => navigate("compras")}
              busqueda={busqueda}
            />
          ) : tab === "compras" ? (
            <ClientComprasPage onVerPlan={verPlan} busqueda={busqueda} />
          ) : tab === "pagos" ? (
            <ClientPagosPage />
          ) : (
            <ClientAyudaPage onNavigate={navigate} />
          )}
        </CuentaBoundary>
    </ClientPortalLayout>
  );
}
