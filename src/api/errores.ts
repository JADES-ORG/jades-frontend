import axios from 'axios';
import type { ErrorApiResponse } from '../types/errores';

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError<ErrorApiResponse | string>(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object' && typeof data.mensaje === 'string') return data.mensaje;
    if (error.response?.status === 401) return 'La sesión no es válida. Inicia sesión nuevamente.';
    if (error.response?.status === 403) return 'No tienes permiso para realizar esta operación.';
    if (!error.response) return 'No se pudo conectar con el servidor.';
  }
  return 'No se pudo completar la operación.';
}
