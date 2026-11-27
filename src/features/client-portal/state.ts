import { createContext, useContext } from "react";
import type { CuentaCorrienteResponse } from "../../types/finanzas";
interface CuentaState {
  cuenta: CuentaCorrienteResponse | null;
  loading: boolean;
  error: string | null;
  recargar: () => void;
}
export const CuentaClienteContext = createContext<CuentaState | null>(null);
export function useCuentaCliente() {
  const value = useContext(CuentaClienteContext);
  if (!value) throw new Error("Falta CuentaClienteProvider");
  return value;
}
