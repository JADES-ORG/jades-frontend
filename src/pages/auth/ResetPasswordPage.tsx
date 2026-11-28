import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { restablecerContrasena } from '../../api/autenticacion';
import { obtenerMensajeError } from '../../api/errores';

interface ResetPasswordPageProps {
  correo: string;
  tokenRecuperacion: string;
  onPasswordSaved: () => void;
  onBackToLogin: () => void;
  onRestart: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  correo,
  tokenRecuperacion,
  onPasswordSaved,
  onBackToLogin,
  onRestart,
}) => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg(null);
    if (nuevaContrasena.length < 12 || !nuevaContrasena.trim() || new TextEncoder().encode(nuevaContrasena).length > 72) {
      setErrorMsg('La contraseña debe tener al menos 12 caracteres y máximo 72 bytes.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    try {
      await restablecerContrasena(correo, tokenRecuperacion, nuevaContrasena);
      setNuevaContrasena('');
      setConfirmarContrasena('');
      onPasswordSaved();
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
          Crea una nueva contraseña
        </h1>

        <p className="text-sm text-jades-muted mt-2 font-normal">
          Define una contraseña para volver a ingresar.
        </p>

        {errorMsg && (
          <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nueva-contrasena"
              className="block text-[13px] font-semibold text-jades-ink mb-1.5"
            >
              Nueva contraseña
            </label>
            <input
              id="nueva-contrasena"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              disabled={isLoading}
              required
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm text-jades-ink bg-white border border-jades-line rounded-[10px] focus:border-jades-primary focus:ring-2 focus:ring-jades-primary/20 outline-none transition"
            />
            <p className="text-xs text-jades-muted mt-1.5 font-normal">
              Usa al menos 12 caracteres y un máximo de 72 bytes.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmar-contrasena"
              className="block text-[13px] font-semibold text-jades-ink mb-1.5"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmar-contrasena"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              disabled={isLoading}
              required
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm text-jades-ink bg-white border border-jades-line rounded-[10px] focus:border-jades-primary focus:ring-2 focus:ring-jades-primary/20 outline-none transition"
            />
            <p className="text-xs text-jades-muted mt-1.5 font-normal">
              Debe coincidir con la nueva contraseña.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !nuevaContrasena || !confirmarContrasena}
            className="w-full !mt-6 bg-jades-primary hover:bg-jades-hover active:bg-jades-active disabled:opacity-50 text-white text-sm font-semibold py-3.5 px-4 rounded-xl  transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Guardando contraseña...' : 'Guardar contraseña'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button type="button" disabled={isLoading} onClick={onRestart} className="block w-full text-sm font-semibold text-jades-primary hover:underline">Solicitar otro código</button>
          <button
            type="button"
            onClick={onBackToLogin}
            disabled={isLoading}
            className="text-sm font-semibold text-jades-primary hover:text-jades-hover hover:underline cursor-pointer transition"
          >
            Volver al inicio de sesión
          </button>
        </div>

        <p className="mt-8 pt-4 border-t border-jades-line text-xs text-jades-muted text-center leading-relaxed font-normal">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
    </AuthLayout>
  );
};
