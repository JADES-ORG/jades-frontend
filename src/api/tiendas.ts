import { api } from './client';
import type { TiendaResumenResponse } from '../types/tiendas';

export async function listarMisTiendas(signal?: AbortSignal): Promise<TiendaResumenResponse[]> {
  const { data } = await api.get<TiendaResumenResponse[]>('/tiendas/mis-tiendas', { signal });
  return data;
}
