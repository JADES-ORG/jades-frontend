import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';

interface VerifyCodePageProps {
  emailMasked?: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
  onBackToLogin?: () => void;
}

export const VerifyCodePage: React.FC<VerifyCodePageProps> = ({
  emailMasked = 'l***@ejemplo.com',
  onVerify,
  onResend,
  onBackToLogin,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    setIsLoading(true);
    if (onVerify) {
      onVerify(code);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-8 sm:p-10 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verifica tu correo
        </h2>

        <p className="text-sm text-slate-500 mt-2 font-normal">
          Enviamos un código a <span className="font-medium text-slate-700">{emailMasked}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div>
            <label
              htmlFor="verification-code"
              className="block text-xs font-bold text-slate-700 mb-2"
            >
              Código de verificación
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={handleChange}
              placeholder="4 8 2 6 1 9"
              className="w-full px-4 py-3 text-lg font-medium tracking-[0.4em] text-center text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition duration-150"
              maxLength={6}
            />
            <p className="text-xs text-slate-400 mt-2">
              Ingresa los seis dígitos del correo recibido.
            </p>
          </div>

          <button
            type="submit"
            disabled={code.length < 6 || isLoading}
            className="w-full mt-6 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#139a6c]/25 transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button
            type="button"
            onClick={onResend}
            className="text-sm font-semibold text-[#139a6c] hover:text-[#0f825b] hover:underline cursor-pointer block w-full transition"
          >
            Reenviar código
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm font-semibold text-[#139a6c] hover:text-[#0f825b] hover:underline cursor-pointer block w-full transition"
          >
            Volver al inicio de sesión
          </button>
        </div>

        <p className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
    </AuthLayout>
  );
};
