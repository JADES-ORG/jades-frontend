/** Contratos de lectura del backend JADES (develop). Importes en unidades monetarias. */
export interface Compra {
  idVenta: number;
  fechaCompra: string;
  modalidadPago: string;
  numeroCuotas: number;
  total: number;
  moneda: string;
  estado: string;
  idCredito: number | null;
  codigoCredito: string | null;
}
export interface Obligacion {
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
  moraPendiente: number | null;
  moneda: string;
}
export interface Pago {
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
export interface CuentaCliente {
  idCliente: number;
  nombreCliente: string;
  documentoCliente: string;
  idTienda: number;
  comercio: string;
  compras: Compra[];
  obligaciones: Obligacion[];
  pagos: Pago[];
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
export interface PagoUnico {
  idVenta: number;
  idCredito: number;
  idCuota: number;
  codigoCredito: string;
  moneda: string;
  fechaVenta: string;
  fechaCorteAsignada: string;
  fechaPago: string;
  diasFinanciamiento: number;
  capital: number;
  tasaEfectivaDiaria: number | null;
  tasaEfectivaPeriodo: number | null;
  interesCompensatorio: number;
  totalSinMora: number;
  estadoCuota: string;
}
