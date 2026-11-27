export interface ProductoResponse {
  id: number;
  nombreProducto: string;
  descripcion: string | null;
  precioContado: number;
  precioCredito: number;
  tipoProducto: string;
  proveedor: string | null;
  marca: string | null;
  unidadMedida: string;
  imagenProducto: string | null;
  modalidad: 'UNICO' | 'MENSUAL' | 'AMBAS';
  estadoProducto: string;
}

export interface ProductoRequest {
  nombreProducto: string;
  descripcion: string | null;
  precioContado: number;
  precioCredito: number;
  tipoProducto: 'PRODUCTO' | 'SERVICIO';
  proveedor: string | null;
  marca: string | null;
  unidadMedida: string;
  modalidad: 'UNICO' | 'MENSUAL' | 'AMBAS';
}

export const UNIDADES_PRODUCTO = {
  UNIDAD: 'Unidad',
  PAQUETE: 'Paquete',
  SERVICIO: 'Servicio',
  SESION: 'Sesión',
  CAJA: 'Caja',
  DOCENA: 'Docena',
  PAR: 'Par',
  KILOGRAMO: 'Kilo (kg)',
  GRAMO: 'Gramo',
  LITRO: 'Litro (L)',
  MILILITRO: 'Mililitro',
  METRO: 'Metro',
  CENTIMETRO: 'Centímetro',
  METRO_CUADRADO: 'Metro cuadrado',
  HORA: 'Hora',
} as const;

export function admiteCantidadDecimal(unidad: string): boolean {
  return ['KILOGRAMO', 'GRAMO', 'LITRO', 'MILILITRO', 'METRO', 'CENTIMETRO', 'METRO_CUADRADO', 'HORA'].includes(unidad);
}
