import { api } from './client';
import type { ActualizarTiendaRequest, AdministradorTiendaResponse, BajaTiendaResponse, ConfiguracionTiendaRequest, RegistrarTiendaRequest, TiendaDetalleResponse, TiendaRegistradaResponse, TiendaResumenResponse } from '../types/tiendas';

export async function listarMisTiendas(signal?: AbortSignal): Promise<TiendaResumenResponse[]> {
  const { data } = await api.get<TiendaResumenResponse[]>('/tiendas/mis-tiendas', { signal });
  return data;
}

export async function registrarTienda(solicitud: RegistrarTiendaRequest): Promise<TiendaRegistradaResponse> {
  const { data } = await api.post<TiendaRegistradaResponse>('/tiendas', solicitud);
  return data;
}

export async function listarAdministradoresNegocio(signal?: AbortSignal): Promise<AdministradorTiendaResponse[]> {
  const { data } = await api.get<AdministradorTiendaResponse[]>('/tiendas/administradores', { signal });
  return data;
}

export async function consultarTienda(idTienda: number, signal?: AbortSignal): Promise<TiendaDetalleResponse> {
  const { data } = await api.get<TiendaDetalleResponse>(`/tiendas/${idTienda}`, { signal });
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

export async function listarTiendas(signal?: AbortSignal): Promise<TiendaDetalleResponse[]> {
  const { data } = await api.get<TiendaDetalleResponse[]>('/tiendas', { signal });
  return data;
}

export async function actualizarTienda(idTienda: number, solicitud: ActualizarTiendaRequest): Promise<TiendaDetalleResponse> {
  const { data } = await api.put<TiendaDetalleResponse>(`/tiendas/${idTienda}`, solicitud);
  return data;
}

export async function consultarConfiguracionTienda(idTienda: number, signal?: AbortSignal): Promise<TiendaDetalleResponse> {
  const { data } = await api.get<TiendaDetalleResponse>(`/tiendas/${idTienda}/configuracion`, { signal });
  return data;
}

export async function actualizarConfiguracionTienda(idTienda: number, solicitud: ConfiguracionTiendaRequest): Promise<TiendaDetalleResponse> {
  const { data } = await api.put<TiendaDetalleResponse>(`/tiendas/${idTienda}/configuracion`, solicitud);
  return data;
}
