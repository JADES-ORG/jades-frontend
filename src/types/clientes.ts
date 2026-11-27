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

export type PeriodoTasa =
    | 'DIARIA'
    | 'QUINCENAL'
    | 'MENSUAL'
    | 'BIMESTRAL'
    | 'TRIMESTRAL'
    | 'CUATRIMESTRAL'
    | 'SEMESTRAL'
    | 'ANUAL';

/** POST /tiendas/{tienda}/clientes: crea el cliente y su cuenta de acceso al portal. */
export interface RegistrarClienteRequest {
  nombreCliente: string;
  dniCliente: string;
  telefonoCliente: string | null;
  correoCliente: string;
  contrasenaTemporal: string;
}

/** PUT /tiendas/{tienda}/clientes/{id}: datos generales del cliente. */
export interface ActualizarClienteRequest {
  nombreCliente: string;
  dniCliente: string;
  telefonoCliente: string | null;
  correoCliente: string | null;
}

/** POST y PUT de /condicion-crediticia. Las tasas se envían como fracción (2.5 % = 0.025). */
export interface CondicionCrediticiaRequest {
  monedaCredito: 'PEN' | 'USD';
  limiteCredito: number;
  plazoMaximo: number;
  diaCorte: number;
  diaPago: number;
  horaCorte: string;
  tipoTasa: TipoTasa;
  tasaInteres: number;
  periodoTasa: PeriodoTasa;
  capitalizacionTasa: PeriodoTasa | null;
  tipoTasaMora: TipoTasa;
  tasaMoratoria: number;
  periodoTasaMora: PeriodoTasa;
  capitalizacionMora: PeriodoTasa | null;
}