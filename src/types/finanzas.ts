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
  fechaFinGracia: string;
  diasGracia: number;
  tasaEfectivaMensual: number;
  tasaEfectivaDiaria: number;
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
  tipoTasa: 'NOMINAL' | 'EFECTIVA';
  valorTasa: number;
  periodoTasa: string;
  capitalizacionTasa?: string;
  numeroCuotas: number;
  fechaVenta: string;
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

export interface MoraResponse {
  idCuota: number;
  numeroCuota: number;
  diasAtraso: number;
  tasaMoratoriaDiaria: number;
  montoCuotaExigible: number;
  interesMoratorio: number;
  totalAPagar: number;
}

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
