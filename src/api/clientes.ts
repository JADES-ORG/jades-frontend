import { api } from './client';
import type { ClienteResponse, CondicionCrediticiaResponse } from '../types/clientes';
import type { CuentaCorrienteResponse } from '../types/finanzas';

export async function listarClientes(idTienda: number, soloActivos = true, signal?: AbortSignal): Promise<ClienteResponse[]> {
  const { data } = await api.get<ClienteResponse[]>(`/tiendas/${idTienda}/clientes`, { params: { soloActivos }, signal });
  return data;
}

export async function consultarCliente(idTienda: number, idCliente: number, signal?: AbortSignal): Promise<ClienteResponse> {
  const { data } = await api.get<ClienteResponse>(`/tiendas/${idTienda}/clientes/${idCliente}`, { signal });
  return data;
}

export async function consultarCondicionCrediticia(idTienda: number, idCliente: number, signal?: AbortSignal): Promise<CondicionCrediticiaResponse> {
  const { data } = await api.get<CondicionCrediticiaResponse>(`/tiendas/${idTienda}/clientes/${idCliente}/condicion-crediticia`, { signal });
  return data;
}

export async function consultarCuentaCorriente(idCliente: number, signal?: AbortSignal): Promise<CuentaCorrienteResponse> {
  const { data } = await api.get<CuentaCorrienteResponse>(`/portal/clientes/${idCliente}/cuenta-corriente`, { signal });
  return data;
}
