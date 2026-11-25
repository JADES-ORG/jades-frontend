import type { Moneda, TipoTasa } from './finanzas';

export interface ClienteResponse {
  id: number;
  nombreCliente: string;
  dniCliente: string;
  telefonoCliente: string | null;
  correoCliente: string | null;
  estadoCliente: string;
}

export interface CondicionCrediticiaResponse {
  id: number;
  idCliente: number;
  nombreCliente: string;
  monedaCredito: Moneda;
  limiteCredito: number;
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
