import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { consultarMiCuenta } from "../../api/clientes";
import { obtenerMensajeError } from "../../api/errores";
import type { CuentaCorrienteResponse } from "../../types/finanzas";

import { CuentaClienteContext as Context } from "./state";

export function CuentaClienteProvider({ children }: { children: ReactNode }) {
  const [cuenta, setCuenta] = useState<CuentaCorrienteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const recargar = useCallback(() => {
    setLoading(true);
    setError(null);
    setRevision((n) => n + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    consultarMiCuenta(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCuenta(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCuenta(null);
          setError(obtenerMensajeError(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  return (
    <Context.Provider value={{ cuenta, loading, error, recargar }}>
      {children}
    </Context.Provider>
  );
}
