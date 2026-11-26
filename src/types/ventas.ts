import type { Moneda, CronogramaResponse } from './finanzas';

export type ModalidadPago = 'UNICO' | 'MENSUAL';

export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
}

export interface RegistrarVentaRequest {
  idCliente: number;
  modalidadPago: ModalidadPago;
  numeroCuotas: number;
  graciaAdicional?: 0;
  detalles: DetalleVentaRequest[];
}

export interface DetalleVentaResponse extends DetalleVentaRequest {
  id: number;
  nombreProducto: string;
  unidadMedida: string;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  idCliente: number;
  nombreCliente: string;
  fechaVenta: string;
  horaVenta: string;
  fechaCorteAsignada: string;
  fechaPagoAsignada: string;
  modalidadPago: ModalidadPago;
  numeroCuotas: number;
  graciaAdicional: number;
  monedaVenta: Moneda;
  totalVenta: number;
  estadoVenta: string;
  idUsuarioRegistro: number;
  detalles: DetalleVentaResponse[];
}

export interface SimulacionPagoUnico {
  capital: number;
  diasFinanciamiento: number;
  tasaEfectivaDiaria: number;
  tasaEfectivaPeriodo: number;
  interesCompensatorio: number;
  totalSinMora: number;
}

export interface SimulacionVentaResponse {
  idCliente: number;
  nombreCliente: string;
  modalidadPago: ModalidadPago;
  numeroCuotas: number;
  moneda: Moneda;
  fechaVenta: string;
  horaVenta: string;
  fechaCorteAsignada: string;
  fechaPagoAsignada: string;
  capitalVenta: number;
  capitalReservado: number;
  totalPagar: number;
  limiteCredito: number;
  creditoUtilizado: number;
  creditoDisponible: number;
  creditoDisponiblePosterior: number;
  detalles: (Omit<DetalleVentaResponse, 'id'> & { id: null })[];
  cronograma: CronogramaResponse | null;
  pagoUnico: SimulacionPagoUnico | null;
}
