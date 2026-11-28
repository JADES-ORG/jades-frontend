import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { solicitarRecuperacion, type CodigoRecuperacionResponse } from '../../api/autenticacion';
import { obtenerMensajeError } from '../../api/errores';

interface ForgotPasswordPageProps {
  onCodeSent: (email: string, respuesta: CodigoRecuperacionResponse) => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onCodeSent,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !email.trim()) return;
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const correo = email.trim();
      const respuesta = await solicitarRecuperacion(correo);
      onCodeSent(correo, respuesta);
    } catch (error) {
      setErrorMsg(obtenerMensajeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-8 sm:p-10 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Recuperar contraseña
        </h1>

        <p className="text-sm text-slate-500 mt-2 font-normal">
          Generaremos un código para recuperar tu cuenta en el modo demostración.
        </p>

        {errorMsg && <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="mt-8">
          <div>
            <label
              htmlFor="recovery-email"
              className="block text-xs font-bold text-slate-700 mb-2"
            >
              Correo de acceso
            </label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              maxLength={150}
              disabled={isLoading}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="luis@ejemplo.com"
              className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition"
            />

          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full mt-6 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] disabled:opacity-50 text-white text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#139a6c]/25 transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Enviando código...' : 'Enviar código'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            disabled={isLoading}
            className="text-sm font-semibold text-[#139a6c] hover:text-[#0f825b] hover:underline cursor-pointer transition"
          >
            Volver al inicio de sesión
          </button>
        </div>

        <p className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed font-normal">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
    </AuthLayout>
  );
};
