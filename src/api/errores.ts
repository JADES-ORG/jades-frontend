import axios from 'axios';
import type { ErrorApiResponse } from '../types/errores';

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError<ErrorApiResponse | string>(error)) {
    const status = error.response?.status;
    if (status !== undefined && status >= 500) return 'No pudimos completar la operación en este momento. Inténtalo nuevamente más tarde.';
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim() && !/^\s*</.test(data) && !/\b(?:Exception|stack trace|SQLException|SQLSTATE)\b/i.test(data)) return data;
    if (data && typeof data === 'object' && typeof data.mensaje === 'string') return data.mensaje;
    if (error.response?.status === 401) return 'La sesión no es válida. Inicia sesión nuevamente.';
    if (error.response?.status === 403) return 'No tienes permiso para realizar esta operación.';
    if (!error.response) return 'No pudimos conectarnos. Comprueba tu conexión a internet e inténtalo nuevamente.';
  }
  return 'No se pudo completar la operación.';
}
