export interface ErrorApiResponse {
  fecha: string;
  estado: number;
  mensaje: string;
  errores: Record<string, string> | null;
}
