import React, { useEffect, useRef, useState } from 'react';
import { ModalShell, botonPrincipalModal, cuerpoModal } from "../../components/store-admin/ModalShell";
import { AuthLayout } from '../../layouts/AuthLayout';
import { solicitarRecuperacion, verificarCodigoRecuperacion, type CodigoRecuperacionResponse } from '../../api/autenticacion';
import { obtenerMensajeError } from '../../api/errores';

interface VerifyCodePageProps {
  correo: string;
  emailMasked: string;
  codigoInicial: CodigoRecuperacionResponse;
  onVerify: (token: string) => void;
  onBackToLogin: () => void;
}

export const VerifyCodePage: React.FC<VerifyCodePageProps> = ({
  correo, emailMasked, codigoInicial, onVerify, onBackToLogin,
}) => {
  const [code, setCode] = useState('');
  const campoCodigo = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState(codigoInicial);
  const [mostrarCorreo, setMostrarCorreo] = useState(true);
  const [generadoEn, setGeneradoEn] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const restantes = Math.max(0, Math.ceil((generadoEn + respuesta.expiraEnSegundos * 1000 - ahora) / 1000));
  const esperaReenvio = Math.max(0, Math.ceil((generadoEn + 60000 - ahora) / 1000));
  const ocupado = isLoading || reenviando;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ocupado || mostrarCorreo || restantes === 0 || !/^[0-9]{5}$/.test(code)) return;
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const resultado = await verificarCodigoRecuperacion(correo, code);
      onVerify(resultado.tokenRecuperacion);
    } catch (error) {
      setErrorMsg(obtenerMensajeError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (ocupado || esperaReenvio > 0) return;
    setErrorMsg(null);
    setReenviando(true);
    try {
      const nuevo = await solicitarRecuperacion(correo);
      const instante = Date.now();
      setRespuesta(nuevo);
      setGeneradoEn(instante);
      setAhora(instante);
      setCode('');
      setMostrarCorreo(true);
    } catch (error) {
      setErrorMsg(obtenerMensajeError(error));
    } finally {
      setReenviando(false);
    }
  };

  const cerrarCorreo = () => {
    setMostrarCorreo(false);
    requestAnimationFrame(() => campoCodigo.current?.focus());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, '').slice(0, 5));
  };

  return (
    <AuthLayout>
      <div inert={mostrarCorreo} className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-8 sm:p-10 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verifica tu correo
        </h1>

        <p className="text-sm text-slate-500 mt-2 font-normal">
          Código de recuperación simulado para <span className="font-medium text-slate-700">{emailMasked}</span>.
        </p>

        {errorMsg && <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{errorMsg}</p>}

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
              ref={campoCodigo}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={handleChange}
              placeholder="0 0 0 0 0"
              required
              disabled={ocupado || mostrarCorreo || restantes === 0}
              className="w-full px-4 py-3 text-lg font-medium tracking-[0.4em] text-center text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-2 focus:ring-[#139a6c]/20 outline-none transition duration-150"
              maxLength={5}
            />
            <p className="text-xs text-slate-400 mt-2">
              {restantes > 0 ? `Ingresa los cinco dígitos del código. Vence en ${Math.floor(restantes / 60)}:${String(restantes % 60).padStart(2, "0")}.` : "El código venció. Solicita uno nuevo."}
            </p>
          </div>

          <button
            type="submit"
            disabled={code.length !== 5 || ocupado || mostrarCorreo || restantes === 0}
            className="w-full mt-6 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#139a6c]/25 transition duration-150 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? 'Verificando...' : 'Verificar código'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={ocupado || esperaReenvio > 0 || mostrarCorreo}
            className="text-sm font-semibold text-[#139a6c] hover:text-[#0f825b] hover:underline cursor-pointer block w-full transition"
          >
            {reenviando ? "Generando código..." : esperaReenvio > 0 ? `Reenviar código (${esperaReenvio}s)` : "Reenviar código"}
          </button>

          {restantes > 0 && <button type="button" disabled={ocupado || mostrarCorreo} onClick={() => setMostrarCorreo(true)}
            className="text-sm font-semibold text-[#139a6c] hover:underline block w-full disabled:opacity-50">Ver correo simulado</button>}

          <button
            type="button"
            onClick={onBackToLogin}
            disabled={ocupado || mostrarCorreo}
            className="text-sm font-semibold text-[#139a6c] hover:text-[#0f825b] hover:underline cursor-pointer block w-full transition"
          >
            Volver al inicio de sesión
          </button>
        </div>

        <p className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
      {mostrarCorreo && (
        <ModalShell titulo="Correo simulado" descripcion={correo} onClose={cerrarCorreo}>
          <div className={cuerpoModal}>
            <p className="text-sm text-slate-700">{restantes > 0 ? 'Código de verificación' : 'El código ha vencido. Solicita otro.'}</p>
            {restantes > 0 && <div className="rounded-lg bg-emerald-50 px-4 py-5 text-center text-3xl font-bold tracking-[0.25em] text-emerald-800">{respuesta.codigo}</div>}
            <div className="flex justify-end"><button type="button" className={botonPrincipalModal} onClick={cerrarCorreo}>Aceptar</button></div>
          </div>
        </ModalShell>
      )}
    </AuthLayout>
  );
};
