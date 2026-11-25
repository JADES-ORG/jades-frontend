import { createContext, useContext } from "react";
import type { CuentaCliente } from "./types";
interface CuentaState {
  cuenta: CuentaCliente | null;
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
