import { useState } from "react";
import { ClientPortalLayout } from "../../layouts/ClientPortalLayout";
import type { ClientTab } from "../../layouts/ClientPortalLayout";
import { ClientDashboardPage } from "../../pages/client-portal/ClientDashboardPage";
import { ClientComprasPage } from "../../pages/client-portal/ClientComprasPage";
import { ClientPagosPage } from "../../pages/client-portal/ClientPagosPage";
import { ClientPlanPagosPage } from "../../pages/client-portal/ClientPlanPagosPage";
import { ClientAyudaPage } from "../../pages/client-portal/ClientAyudaPage";
import { CuentaClienteProvider } from "./context";
import { CuentaBoundary } from "./ui";

export function ClientPortal({ onLogout }: { onLogout: () => void }) {
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
    <CuentaClienteProvider>
      <ClientPortalLayout
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
    </CuentaClienteProvider>
  );
}
