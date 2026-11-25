import { api } from './client';
import type { LoginResponse } from '../types/finanzas';

export interface IniciarSesionRequest {
  correo: string;
  contrasena: string;
}

export function cerrarSesion(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export async function iniciarSesion(solicitud: IniciarSesionRequest): Promise<LoginResponse> {
  cerrarSesion();
  const { data } = await api.post<LoginResponse>('/autenticacion/iniciar-sesion', solicitud);
  if (!data?.tokenAcceso || !Number.isInteger(data.id) || !data.correo ||
      !['ADMIN_SISTEMA', 'ADMIN_NEGOCIO', 'CLIENTE'].includes(data.rol)) {
    throw new Error('La respuesta de autenticación no es válida.');
  }
  localStorage.setItem('token', data.tokenAcceso);
  localStorage.setItem('usuario', JSON.stringify(data));
  return data;
}
