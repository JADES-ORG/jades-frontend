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
