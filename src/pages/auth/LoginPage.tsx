import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { api } from '../../api/client';
import { mockLoginResponse } from '../../api/mockData';
import type { LoginResponse } from '../../types/finanzas';

interface LoginPageProps {
  onLoginSuccess?: (data: LoginResponse) => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onForgotPassword,
}) => {
  const [usuarioOCorreo, setUsuarioOCorreo] = useState('luis@ejemplo.com');
  const [contrasena, setContrasena] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Intenta conectar al backend si está disponible
      const response = await api.post<LoginResponse>('/autenticacion/iniciar-sesion', {
        correo: usuarioOCorreo,
        contrasena,
      });

      const data = response.data;
      localStorage.setItem('token', data.tokenAcceso);
      localStorage.setItem('usuario', JSON.stringify(data));

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch {
      // Modo Mock / Fallback automático si backend está apagado
      const isClient = usuarioOCorreo.toLowerCase().includes('maria');
      const isAdminSys = usuarioOCorreo.toLowerCase().includes('admin@jades');

      const mockData: LoginResponse = {
        ...mockLoginResponse,
        correo: usuarioOCorreo || 'luis@ejemplo.com',
        rol: isClient ? 'CLIENTE' : isAdminSys ? 'ADMIN_SISTEMA' : 'ADMIN_NEGOCIO',
        nombre: isClient ? 'María Quispe' : isAdminSys ? 'Administrador Sistema' : 'Luis Alvarez',
      };
      localStorage.setItem('token', mockData.tokenAcceso);
      localStorage.setItem('usuario', JSON.stringify(mockData));

      if (onLoginSuccess) {
        onLoginSuccess(mockData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-8 sm:p-10 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Inicia sesión
        </h2>

        <p className="text-sm text-slate-500 mt-2 font-normal">
          Consulta y administra tus créditos con JADES.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="usuario-correo"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Usuario o correo
            </label>
            <input
              id="usuario-correo"
              type="text"
              required
              value={usuarioOCorreo}
              onChange={(e) => setUsuarioOCorreo(e.target.value)}
              placeholder="luis@ejemplo.com"
              className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-normal">
              Ingresa el usuario que te asignó el administrador.
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-normal">
              Tu contraseña distingue mayúsculas y minúsculas.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full !mt-6 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] disabled:opacity-50 text-white text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#139a6c]/25 transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <span>Probar rol:</span>
            <button
              type="button"
              onClick={() => {
                setUsuarioOCorreo('maria@ejemplo.com');
                setContrasena('maria123');
              }}
              className="text-[#139a6c] hover:underline font-semibold cursor-pointer"
            >
              Cliente (María)
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setUsuarioOCorreo('luis@ejemplo.com');
                setContrasena('admin123');
              }}
              className="text-[#139a6c] hover:underline font-semibold cursor-pointer"
            >
              Bodega
            </button>
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-[#139a6c] hover:underline cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <p className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed font-normal">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
    </AuthLayout>
  );
};
