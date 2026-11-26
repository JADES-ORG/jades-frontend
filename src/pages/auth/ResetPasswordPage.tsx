import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';

interface ResetPasswordPageProps {
  onPasswordSaved?: (newPassword: string) => void;
  onBackToLogin?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onPasswordSaved,
  onBackToLogin,
}) => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (nuevaContrasena.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onPasswordSaved) {
        onPasswordSaved(nuevaContrasena);
      }
    }, 400);
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-8 sm:p-10 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Crea una nueva contraseña
        </h2>

        <p className="text-sm text-slate-500 mt-2 font-normal">
          Define una contraseña para volver a ingresar.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nueva-contrasena"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Nueva contraseña
            </label>
            <input
              id="nueva-contrasena"
              type="password"
              required
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-normal">
              Usa al menos 8 caracteres.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmar-contrasena"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmar-contrasena"
              type="password"
              required
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-normal">
              Debe coincidir con la nueva contraseña.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !nuevaContrasena || !confirmarContrasena}
            className="w-full !mt-6 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] disabled:opacity-50 text-white text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#139a6c]/25 transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Guardando contraseña...' : 'Guardar contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
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
