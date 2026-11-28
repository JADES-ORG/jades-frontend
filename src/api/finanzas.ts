import { api } from './client';
import type {
  SimularCronogramaRequest, CronogramaResponse, PagoUnicoResponse,
  CalculoMoraResponse, MoraClienteResponse, CorteResponse, RegistrarPagoRequest, PagoResponse, LiquidacionResponse, FiltrosPago,
} from '../types/finanzas';

export async function simularCronograma(solicitud: SimularCronogramaRequest, signal?: AbortSignal): Promise<CronogramaResponse> {
  const { data } = await api.post<CronogramaResponse>('/cronogramas/simular', solicitud, { signal });
  return data;
}

export async function consultarCronograma(idVenta: number, signal?: AbortSignal): Promise<CronogramaResponse> {
  const { data } = await api.get<CronogramaResponse>(`/cronogramas/ventas/${idVenta}`, { signal });
  return data;
}

export async function consultarPagoUnico(idVenta: number, signal?: AbortSignal): Promise<PagoUnicoResponse> {
  const { data } = await api.get<PagoUnicoResponse>(`/deudas/pago-unico/ventas/${idVenta}`, { signal });
  return data;
}

export async function consultarMoraCuota(idCuota: number, fechaEvaluacion?: string, signal?: AbortSignal): Promise<CalculoMoraResponse> {
  const { data } = await api.get<CalculoMoraResponse>(`/mora/cuotas/${idCuota}`, { params: { fechaEvaluacion }, signal });
  return data;
}

export async function consultarMoraCliente(idCliente: number, fechaEvaluacion?: string, signal?: AbortSignal): Promise<MoraClienteResponse> {
  const { data } = await api.get<MoraClienteResponse>(`/mora/clientes/${idCliente}`, { params: { fechaEvaluacion }, signal });
  return data;
}

export interface FiltrosCorte {
  ciclo?: string;
  fechaEvaluacion?: string;
}

export async function consultarCorteCliente(idCliente: number, filtros: FiltrosCorte = {}, signal?: AbortSignal): Promise<CorteResponse> {
  const { data } = await api.get<CorteResponse>(`/corte/clientes/${idCliente}`, { params: filtros, signal });
  return data;
}

export async function consultarCorteTienda(idTienda: number, filtros: FiltrosCorte = {}, signal?: AbortSignal): Promise<CorteResponse[]> {
  const { data } = await api.get<CorteResponse[]>(`/corte/tiendas/${idTienda}`, { params: filtros, signal });
  return data;
}

export async function consultarMiCorte(idTienda: number, ciclo: string, signal?: AbortSignal): Promise<CorteResponse> {
  const { data } = await api.get<CorteResponse>('/corte/mi-cuenta', { params: { idTienda, ciclo }, signal });
  return data;
}

export async function registrarPago(idCuota: number, solicitud: RegistrarPagoRequest): Promise<PagoResponse> {
  const { data } = await api.post<PagoResponse>(`/pagos/cuotas/${idCuota}`, solicitud);
  return data;
}

export async function consultarImporteCuota(idCuota: number, filtros: FiltrosPago = {}, signal?: AbortSignal): Promise<LiquidacionResponse> {
  const { data } = await api.get<LiquidacionResponse>(`/pagos/cuotas/${idCuota}/importe`, { params: filtros, signal });
  return data;
}

export async function consultarLiquidacion(idCredito: number, filtros: FiltrosPago = {}, signal?: AbortSignal): Promise<LiquidacionResponse> {
  const { data } = await api.get<LiquidacionResponse>(`/pagos/creditos/${idCredito}/liquidacion`, { params: filtros, signal });
  return data;
}

export async function liquidarCredito(idCredito: number, solicitud: RegistrarPagoRequest): Promise<LiquidacionResponse> {
  const { data } = await api.post<LiquidacionResponse>(`/pagos/creditos/${idCredito}/liquidacion`, solicitud);
  return data;
}
