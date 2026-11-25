import type { Moneda } from './finanzas';

export type ModalidadPago = 'UNICO' | 'MENSUAL';

export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
}

export interface RegistrarVentaRequest {
  idCliente: number;
  modalidadPago: ModalidadPago;
  numeroCuotas: number;
  graciaAdicional?: number;
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
