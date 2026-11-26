import { api } from './client';
import type { RegistrarVentaRequest, VentaResponse, SimulacionVentaResponse } from '../types/ventas';

/** Crear una clave por operación y reutilizarla si se reintenta la misma venta. */
export function crearClaveIdempotencia(): string {
  return crypto.randomUUID();
}

export async function registrarVenta(idTienda: number, solicitud: RegistrarVentaRequest, claveIdempotencia: string): Promise<VentaResponse> {
  const { data } = await api.post<VentaResponse>(`/tiendas/${idTienda}/ventas`, solicitud, {
    headers: { 'Idempotency-Key': claveIdempotencia },
  });
  return data;
}

export async function listarVentas(idTienda: number, idCliente?: number, signal?: AbortSignal): Promise<VentaResponse[]> {
  const { data } = await api.get<VentaResponse[]>(`/tiendas/${idTienda}/ventas`, { params: { cliente: idCliente }, signal });
  return data;
}

export async function consultarVenta(idTienda: number, idVenta: number, signal?: AbortSignal): Promise<VentaResponse> {
  const { data } = await api.get<VentaResponse>(`/tiendas/${idTienda}/ventas/${idVenta}`, { signal });
  return data;
}

export async function simularVenta(idTienda: number, solicitud: RegistrarVentaRequest, signal?: AbortSignal): Promise<SimulacionVentaResponse> {
  const { data } = await api.post<SimulacionVentaResponse>(`/tiendas/${idTienda}/ventas/simular`, solicitud, { signal });
  return data;
}
