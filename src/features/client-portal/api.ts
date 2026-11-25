import axios from "axios";
import { api } from "../../api/client";
import type { CronogramaResponse } from "../../types/finanzas";
import type { CuentaCliente, PagoUnico } from "./types";

export const consultarCuenta = (signal: AbortSignal) =>
  api
    .get<CuentaCliente>("/portal/mi-cuenta", { signal, timeout: 20000 })
    .then((r) => r.data);
export const consultarCronograma = (idVenta: number, signal: AbortSignal) =>
  api
    .get<CronogramaResponse>(`/cronogramas/ventas/${idVenta}`, {
      signal,
      timeout: 20000,
    })
    .then((r) => r.data);
export const consultarPagoUnico = (idVenta: number, signal: AbortSignal) =>
  api
    .get<PagoUnico>(`/deudas/pago-unico/ventas/${idVenta}`, {
      signal,
      timeout: 20000,
    })
    .then((r) => r.data);
export function mensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401)
      return "Tu sesión venció. Vuelve a iniciar sesión.";
    if (error.response?.status === 403)
      return "Tu cuenta no tiene permiso para acceder a esta información.";
    if (typeof error.response?.data?.mensaje === "string")
      return error.response.data.mensaje;
    if (typeof error.response?.data?.message === "string")
      return error.response.data.message;
    if (error.response?.status === 404)
      return "No se encontró la información solicitada. Consulta con tu negocio.";
    if (!error.response)
      return "No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo nuevamente.";
  }
  return "No pudimos cargar la información. Inténtalo nuevamente.";
}
