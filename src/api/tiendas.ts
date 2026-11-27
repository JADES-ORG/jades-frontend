import { api } from './client';
import type { BajaTiendaResponse, RegistrarTiendaRequest, TiendaRegistradaResponse, TiendaResumenResponse } from '../types/tiendas';

export async function listarMisTiendas(signal?: AbortSignal): Promise<TiendaResumenResponse[]> {
  const { data } = await api.get<TiendaResumenResponse[]>('/tiendas/mis-tiendas', { signal });
  return data;
}

export async function registrarTienda(solicitud: RegistrarTiendaRequest): Promise<TiendaRegistradaResponse> {
  const { data } = await api.post<TiendaRegistradaResponse>('/tiendas', solicitud);
  return data;
}

export async function consultarTienda(idTienda: number, signal?: AbortSignal): Promise<TiendaResumenResponse> {
  const { data } = await api.get<TiendaResumenResponse>(`/tiendas/${idTienda}`, { signal });
  return data;
}

export async function desactivarTienda(idTienda: number): Promise<BajaTiendaResponse> {
  const { data } = await api.patch<BajaTiendaResponse>(`/tiendas/${idTienda}/desactivar`);
  return data;
}

export async function reactivarTienda(idTienda: number): Promise<TiendaResumenResponse> {
  const { data } = await api.patch<TiendaResumenResponse>(`/tiendas/${idTienda}/reactivar`);
  return data;
}
