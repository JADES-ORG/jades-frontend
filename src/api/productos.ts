import { api } from './client';
import type { ProductoRequest, ProductoResponse } from '../types/productos';

export async function listarProductos(idTienda: number, soloActivos = true, signal?: AbortSignal): Promise<ProductoResponse[]> {
  const { data } = await api.get<ProductoResponse[]>(`/tiendas/${idTienda}/productos`, { params: { soloActivos }, signal });
  return data;
}

export async function consultarProducto(idTienda: number, idProducto: number, signal?: AbortSignal): Promise<ProductoResponse> {
  const { data } = await api.get<ProductoResponse>(`/tiendas/${idTienda}/productos/${idProducto}`, { signal });
  return data;
}

function formularioProducto(producto: ProductoRequest, archivo: File): FormData {
  const form = new FormData();
  form.append('producto', new Blob([JSON.stringify(producto)], { type: 'application/json' }));
  form.append('archivo', archivo);
  return form;
}

export async function registrarProducto(idTienda: number, producto: ProductoRequest, archivo: File): Promise<ProductoResponse> {
  const { data } = await api.post<ProductoResponse>(`/tiendas/${idTienda}/productos`, formularioProducto(producto, archivo), {
    headers: { 'Content-Type': undefined },
  });
  return data;
}

export async function actualizarProducto(idTienda: number, idProducto: number, producto: ProductoRequest, archivo?: File): Promise<ProductoResponse> {
  const ruta = `/tiendas/${idTienda}/productos/${idProducto}`;
  const { data } = archivo
    ? await api.put<ProductoResponse>(ruta, formularioProducto(producto, archivo), { headers: { 'Content-Type': undefined } })
    : await api.put<ProductoResponse>(ruta, producto);
  return data;
}

export async function desactivarProducto(idTienda: number, idProducto: number): Promise<ProductoResponse> {
  const { data } = await api.patch<ProductoResponse>(`/tiendas/${idTienda}/productos/${idProducto}/desactivar`);
  return data;
}

export async function consultarImagenProducto(idTienda: number, idProducto: number, imagen: string, signal?: AbortSignal): Promise<Blob> {
  const url = new URL(imagen);
  const prefijo = `/api/v1/tiendas/${idTienda}/productos/${idProducto}/imagenes/`;
  const nombre = url.pathname.split('/').pop() ?? '';
  if (!['http:', 'https:'].includes(url.protocol) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/.test(nombre)
      || !url.pathname.endsWith(prefijo + nombre)) {
    throw new Error('La imagen no corresponde al producto.');
  }
  const { data } = await api.get<Blob>(`/tiendas/${idTienda}/productos/${idProducto}/imagenes/${nombre}`, { responseType: 'blob', signal });
  if (data.type !== 'image/png') throw new Error('La imagen recibida no es válida.');
  return data;
}
