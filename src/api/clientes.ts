import { api } from './client';
import type {
  ActualizarClienteRequest,
  ClienteResponse,
  CondicionCrediticiaRequest,
  CondicionCrediticiaResponse,
  CreditoDisponibleResponse,
  RegistrarClienteRequest,
} from '../types/clientes';
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

export async function consultarCreditoDisponible(idTienda: number, idCliente: number, signal?: AbortSignal): Promise<CreditoDisponibleResponse> {
  const { data } = await api.get<CreditoDisponibleResponse>(`/tiendas/${idTienda}/clientes/${idCliente}/condicion-crediticia/credito-disponible`, { signal });
  return data;
}

/** Cuenta del cliente autenticado; el servidor obtiene su identidad desde el JWT. */
export async function consultarMiCuenta(signal?: AbortSignal): Promise<CuentaCorrienteResponse> {
  const { data } = await api.get<CuentaCorrienteResponse>('/portal/mi-cuenta', { signal, timeout: 20000 });
  return data;
}

export async function registrarCliente(idTienda: number, solicitud: RegistrarClienteRequest): Promise<ClienteResponse> {
  const { data } = await api.post<ClienteResponse>(`/tiendas/${idTienda}/clientes`, solicitud);
  return data;
}

export async function actualizarCliente(idTienda: number, idCliente: number, solicitud: ActualizarClienteRequest): Promise<ClienteResponse> {
  const { data } = await api.put<ClienteResponse>(`/tiendas/${idTienda}/clientes/${idCliente}`, solicitud);
  return data;
}

export async function desactivarCliente(idTienda: number, idCliente: number): Promise<ClienteResponse> {
  const { data } = await api.patch<ClienteResponse>(`/tiendas/${idTienda}/clientes/${idCliente}/desactivar`);
  return data;
}

export async function reactivarCliente(idTienda: number, idCliente: number): Promise<ClienteResponse> {
  const { data } = await api.patch<ClienteResponse>(`/tiendas/${idTienda}/clientes/${idCliente}/reactivar`);
  return data;
}

export async function registrarCondicionCrediticia(idTienda: number, idCliente: number, solicitud: CondicionCrediticiaRequest): Promise<CondicionCrediticiaResponse> {
  const { data } = await api.post<CondicionCrediticiaResponse>(`/tiendas/${idTienda}/clientes/${idCliente}/condicion-crediticia`, solicitud);
  return data;
}

export async function actualizarCondicionCrediticia(idTienda: number, idCliente: number, solicitud: CondicionCrediticiaRequest): Promise<CondicionCrediticiaResponse> {
  const { data } = await api.put<CondicionCrediticiaResponse>(`/tiendas/${idTienda}/clientes/${idCliente}/condicion-crediticia`, solicitud);
  return data;
}