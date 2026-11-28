import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { iniciarSesion } from '../../api/autenticacion';
import { obtenerMensajeError } from '../../api/errores';
import type { LoginResponse } from '../../types/finanzas';

interface LoginPageProps {
  onLoginSuccess?: (data: LoginResponse) => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onForgotPassword,
}) => {
  const [usuarioOCorreo, setUsuarioOCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await iniciarSesion({
        correo: usuarioOCorreo.trim(),
        contrasena,
      });
      onLoginSuccess?.(data);
    } catch (error) {
      setErrorMsg(obtenerMensajeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-[18px] p-6 sm:p-10 border border-jades-line">
        <h1 className="text-2xl font-bold text-jades-ink tracking-tight">
          Inicia sesión
        </h1>

        <p className="text-sm text-jades-muted mt-2 font-normal">
          Consulta y administra tus créditos con JADES.
        </p>

        {errorMsg && (
          <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="usuario-correo"
              className="block text-[13px] font-semibold text-jades-ink mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="usuario-correo"
              type="email"
              autoComplete="username"
              required
              value={usuarioOCorreo}
              onChange={(e) => setUsuarioOCorreo(e.target.value)}
              placeholder="luis@ejemplo.com"
              className="w-full px-4 py-3 text-sm text-jades-ink bg-white border border-jades-line rounded-[10px] focus:border-jades-primary focus:ring-2 focus:ring-jades-primary/20 outline-none transition"
            />
            <p className="text-xs text-jades-muted mt-1.5 font-normal">
              Ingresa el correo registrado por el administrador.
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-semibold text-jades-ink mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm text-jades-ink bg-white border border-jades-line rounded-[10px] focus:border-jades-primary focus:ring-2 focus:ring-jades-primary/20 outline-none transition"
            />

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full !mt-6 bg-jades-primary hover:bg-jades-hover active:bg-jades-active disabled:opacity-50 text-white text-sm font-semibold py-3.5 px-4 rounded-xl  transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-xs font-semibold text-jades-primary hover:underline cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <p className="mt-8 pt-4 border-t border-jades-line text-xs text-jades-muted text-center leading-relaxed font-normal">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
    </AuthLayout>
  );
};
