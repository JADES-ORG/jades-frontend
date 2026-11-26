import type { Moneda, TipoTasa } from './finanzas';

export interface ClienteResponse {
  id: number;
  nombreCliente: string;
  dniCliente: string;
  telefonoCliente: string | null;
  correoCliente: string | null;
  estadoCliente: string;
}

export interface CreditoDisponibleResponse {
  idCliente: number;
  monedaCredito: Moneda;
  limiteCredito: number;
  creditoUtilizado: number;
  creditoDisponible: number;
}

export interface CondicionCrediticiaResponse extends CreditoDisponibleResponse {
  id: number;
  nombreCliente: string;
  plazoMaximo: number;
  diaCorte: number;
  diaPago: number;
  horaCorte: string;
  tipoTasa: TipoTasa;
  tasaInteres: number;
  periodoTasa: string;
  capitalizacionTasa: string | null;
  tipoTasaMora: TipoTasa;
  tasaMoratoria: number;
  periodoTasaMora: string;
  capitalizacionMora: string | null;
}
