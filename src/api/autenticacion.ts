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

/** Restaura una sesión local vigente. La autenticidad del JWT la valida el backend. */
export function recuperarSesion(rolRequerido?: LoginResponse['rol']): LoginResponse | null {
  try {
    const raw = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    if (!raw || !token) return null;
    const usuario = JSON.parse(raw) as LoginResponse;
    if (!usuario || token !== usuario.tokenAcceso || !Number.isInteger(usuario.id) ||
        !usuario.correo || !['ADMIN_SISTEMA', 'ADMIN_NEGOCIO', 'CLIENTE'].includes(usuario.rol)) return null;
    if (rolRequerido && usuario.rol !== rolRequerido) return null;
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) return null;
    return usuario;
  } catch {
    return null;
  }
}

export interface CodigoRecuperacionResponse {
  codigo: string;
  expiraEnSegundos: number;
  simulacion: boolean;
}

export interface VerificacionRecuperacionResponse {
  tokenRecuperacion: string;
  expiraEnSegundos: number;
}

export async function solicitarRecuperacion(correo: string): Promise<CodigoRecuperacionResponse> {
  const { data } = await api.post<CodigoRecuperacionResponse>('/autenticacion/recuperar-contrasena', { correo });
  if (!data || data.simulacion !== true || typeof data.codigo !== 'string' ||
      !/^[0-9]{5}$/.test(data.codigo) || !Number.isFinite(data.expiraEnSegundos) || data.expiraEnSegundos <= 0) {
    throw new Error('La respuesta de recuperación no es válida.');
  }
  return data;
}

export async function verificarCodigoRecuperacion(correo: string, codigo: string): Promise<VerificacionRecuperacionResponse> {
  const { data } = await api.post<VerificacionRecuperacionResponse>('/autenticacion/verificar-codigo', { correo, codigo });
  if (!data || typeof data.tokenRecuperacion !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(data.tokenRecuperacion) ||
      !Number.isFinite(data.expiraEnSegundos) || data.expiraEnSegundos <= 0) {
    throw new Error('La autorización de recuperación no es válida.');
  }
  return data;
}

export async function restablecerContrasena(correo: string, tokenRecuperacion: string, nuevaContrasena: string): Promise<void> {
  await api.post('/autenticacion/restablecer-contrasena', { correo, tokenRecuperacion, nuevaContrasena });
}
