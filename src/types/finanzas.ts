export type Moneda = 'PEN' | 'USD';
export type TipoTasa = 'NOMINAL' | 'EFECTIVA';

export interface CuotaCronograma {
  numeroCuota: number;
  fechaVencimiento: string;
  saldoInicial: number;
  interes: number;
  amortizacion: number;
  cuota: number;
  saldoFinal: number;
  estado: string;
}

export interface CronogramaResponse {
  idCredito: number | null;
  codigoCredito: string | null;
  idVenta: number | null;
  moneda: string;
  fechaVenta: string;
  fechaCorte: string;
  fechaFinGracia: string | null;
  diasGracia: number | null;
  tasaEfectivaMensual: number | null;
  tasaEfectivaDiaria: number | null;
  capitalVenta: number;
  interesGracia: number;
  capitalCapitalizado: number;
  numeroCuotas: number;
  cuotaBase: number;
  ajusteUltimaCuota: number;
  interesesTotales: number;
  totalFinanciamiento: number;
  cuotas: CuotaCronograma[];
}

export interface SimularCronogramaRequest {
  monto: number;
  tipoTasa: TipoTasa;
  valorTasa: number;
  periodoTasa: string;
  capitalizacionTasa?: string | null;
  numeroCuotas: number;
  fechaVenta: string;
  horaVenta?: string;
  horaCorte?: string;
  diaCorte: number;
  diaPago: number;
  graciaAdicional?: number;
  moneda: 'PEN' | 'USD';
}

export interface LoginResponse {
  tokenAcceso: string;
  id: number;
  correo: string;
  rol: 'ADMIN_SISTEMA' | 'ADMIN_NEGOCIO' | 'CLIENTE';
  nombre?: string;
}

/** Contrato de demostración legado; no usar para respuestas HTTP. */
export interface MoraResponse {
  idCuota: number;
  numeroCuota: number;
  diasAtraso: number;
  tasaMoratoriaDiaria: number;
  montoCuotaExigible: number;
  interesMoratorio: number;
  totalAPagar: number;
}

/** Contrato de demostración legado; no usar para respuestas HTTP. */
export interface ListadoCorteResponse {
  idCliente: number;
  nombreCliente: string;
  dniCliente: string;
  diaCorte: number;
  diaPago: number;
  fechaCorteCiclo: string;
  totalComprasCiclo: number;
  totalCuotasVigentes: number;
  totalInteresMora: number;
  totalExigible: number;
}

/** HU-11: obligación de pago único ya registrada. */
export interface PagoUnicoResponse {
  idVenta: number;
  idCredito: number;
  idCuota: number;
  codigoCredito: string;
  moneda: Moneda;
  fechaVenta: string;
  fechaCorteAsignada: string;
  fechaPago: string;
  diasFinanciamiento: number;
  capital: number;
  tasaEfectivaDiaria: number;
  tasaEfectivaPeriodo: number;
  interesCompensatorio: number;
  totalSinMora: number;
  estadoCuota: string;
}

export interface CompraCuentaCorriente {
  idVenta: number;
  fechaCompra: string;
  modalidadPago: string;
  numeroCuotas: number;
  total: number;
  moneda: Moneda;
  estado: string;
  idCredito: number | null;
  codigoCredito: string | null;
}

export interface ObligacionCuentaCorriente {
  idCuota: number;
  idCredito: number;
  idVenta: number;
  numeroCuota: number;
  fechaVencimiento: string;
  estado: string;
  vencida: boolean;
  capital: number;
  interesCompensatorio: number;
  importeCuota: number;
  importePendiente: number;
  moraPendiente: number;
  moneda: Moneda;
}

export interface PagoCuentaCorriente {
  idPago: number;
  idCuota: number;
  fechaPago: string;
  fechaCancelacion: string | null;
  medioPago: string;
  diasAtraso: number;
  capitalPagado: number;
  interesPagado: number;
  moraPagada: number;
  totalExigible: number;
  estado: string;
}

export interface CuentaCorrienteResponse {
  idCliente: number;
  nombreCliente: string;
  documentoCliente: string;
  idTienda: number;
  comercio: string;
  compras: CompraCuentaCorriente[];
  obligaciones: ObligacionCuentaCorriente[];
  pagos: PagoCuentaCorriente[];
  resumen: {
    totalCompras: number;
    capitalPendiente: number;
    interesPendiente: number;
    moraPagada: number;
    totalPendienteRegistrado: number;
    cuotasPendientes: number;
    cuotasVencidas: number;
  };
}

export interface CalculoMoraResponse {
  idCuota: number;
  numeroCuota: number;
  idCredito: number;
  codigoCredito: string;
  idVenta: number;
  fechaVencimiento: string;
  fechaEvaluacion: string;
  diasAtraso: number;
  enMora: boolean;
  pagada: boolean;
  baseMora: number;
  tasaMoraDiaria: number;
  interesMoratorio: number;
  totalExigible: number;
  estadoCuota: string;
  moneda: Moneda;
}

export interface MoraClienteResponse {
  idCliente: number;
  nombreCliente: string;
  documentoCliente: string;
  idTienda: number;
  fechaEvaluacion: string;
  cantidadCuotasEnMora: number;
  totalCuotasVencidas: number;
  totalMoraAcumulada: number;
  totalDeudaExigible: number;
  moneda: Moneda;
  cuotasEnMora: CalculoMoraResponse[];
}

export interface RegistrarPagoRequest {
  monto: number;
  fechaPagoEfectivo: string;
  medioPago: string;
}

export interface PagoResponse {
  idPago: number;
  idCuota: number;
  idCredito: number;
  idVenta: number;
  codigoCredito: string;
  moneda: Moneda;
  fechaVencimiento: string;
  fechaPagoEfectivo: string;
  diasAtraso: number;
  medioPago: string;
  moraPagada: number;
  interesPagado: number;
  capitalPagado: number;
  totalExigible: number;
  saldoCredito: number;
  estadoCuota: string;
  estadoCredito: string;
}

export interface CorteResponse {
  idCliente: number;
  nombreCliente: string;
  documentoCliente: string;
  idTienda: number;
  nombreTienda: string;
  ciclo: string;
  fechaCorteAnterior: string;
  fechaCorteActual: string;
  horaCorte: string;
  fechaLimitePago: string;
  moneda: Moneda;
  resumen: {
    totalComprasCiclo: number;
    totalCapitalExigible: number;
    totalInteresesPeriodo: number;
    totalMoraAcumulada: number;
    totalExigible: number;
    cantidadCompras: number;
    cantidadObligaciones: number;
    cantidadCuotasEnMora: number;
  };
  compras: {
    idVenta: number;
    fechaVenta: string;
    horaVenta: string;
    modalidadPago: string;
    numeroCuotas: number;
    totalVenta: number;
    idCredito: number | null;
    codigoCredito: string | null;
    interesEstimado: number;
  }[];
  obligaciones: {
    idCuota: number;
    idCredito: number;
    codigoCredito: string;
    idVenta: number;
    numeroCuota: number;
    fechaVencimiento: string;
    amortizacion: number;
    interes: number;
    importeCuota: number;
    diasAtraso: number;
    moraCalculada: number;
    totalPagar: number;
    estadoCuota: string;
    enMora: boolean;
  }[];
}
