import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { consultarCuenta, mensajeError } from "./api";
import type { CuentaCliente } from "./types";

import { CuentaClienteContext as Context } from "./state";

export function CuentaClienteProvider({ children }: { children: ReactNode }) {
  const [cuenta, setCuenta] = useState<CuentaCliente | null>(null);
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
    consultarCuenta(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCuenta(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCuenta(null);
          setError(mensajeError(error));
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
