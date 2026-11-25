import { api } from './client';
import type { ProductoResponse } from '../types/productos';

export async function listarProductos(idTienda: number, soloActivos = true, signal?: AbortSignal): Promise<ProductoResponse[]> {
  const { data } = await api.get<ProductoResponse[]>(`/tiendas/${idTienda}/productos`, { params: { soloActivos }, signal });
  return data;
}

export async function consultarProducto(idTienda: number, idProducto: number, signal?: AbortSignal): Promise<ProductoResponse> {
  const { data } = await api.get<ProductoResponse>(`/tiendas/${idTienda}/productos/${idProducto}`, { signal });
  return data;
}
