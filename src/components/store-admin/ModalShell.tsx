import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
    titulo: string;
    descripcion: string;
    onClose: () => void;
    /** Mientras se guarda no se permite cerrar el modal. */
    bloqueado?: boolean;
    ancho?: 'xl' | '2xl';
    children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
                                                          titulo,
                                                          descripcion,
                                                          onClose,
                                                          bloqueado = false,
                                                          ancho = '2xl',
                                                          children,
                                                      }) => {
    const idTitulo = useId();

    useEffect(() => {
        const alPresionar = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !bloqueado) onClose();
        };
        window.addEventListener('keydown', alPresionar);
        return () => window.removeEventListener('keydown', alPresionar);
    }, [onClose, bloqueado]);

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                className={`bg-white rounded-3xl shadow-2xl ${ancho === 'xl' ? 'max-w-xl' : 'max-w-2xl'} w-full border border-slate-100 my-8 overflow-hidden`}
            >
                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between">
                    <div>
                        <h3 id={idTitulo} className="text-xl font-bold text-slate-900 tracking-tight">
                            {titulo}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{descripcion}</p>
                    </div>
                    <button
                        type="button"
                        aria-label="Cerrar"
                        onClick={onClose}
                        disabled={bloqueado}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const AvisoError: React.FC<{ mensaje: string | null }> = ({ mensaje }) =>
    mensaje ? (
        <p role="alert" className="text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 p-3">
            {mensaje}
        </p>
    ) : null;

interface BotonesProps {
    onCancelar: () => void;
    textoCancelar?: string;
    textoGuardar: string;
    textoGuardando: string;
    guardando: boolean;
}

export const BotonesModal: React.FC<BotonesProps> = ({
                                                         onCancelar,
                                                         textoCancelar = 'Cancelar',
                                                         textoGuardar,
                                                         textoGuardando,
                                                         guardando,
                                                     }) => (
    <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
        <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
        >
            {textoCancelar}
        </button>
        <button
            type="submit"
            disabled={guardando}
            className="px-5 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
            {guardando ? textoGuardando : textoGuardar}
        </button>
    </div>
);