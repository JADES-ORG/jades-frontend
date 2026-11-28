import React, { useEffect, useId } from 'react';
import { Info, X } from 'lucide-react';

interface ModalShellProps {
    titulo: string;
    descripcion: string;
    onClose: () => void;
    /** Mientras se guarda no se permite cerrar el modal. */
    bloqueado?: boolean;
    children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
                                                          titulo,
                                                          descripcion,
                                                          onClose,
                                                          bloqueado = false,
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            {/* Si el modal es más alto que la pantalla, se desplaza todo el fondo, no una caja interna. */}
            <div className="min-h-full flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={idTitulo}
                    className="bg-white rounded-3xl shadow-2xl max-w-[55rem] w-full border border-slate-100 my-8"
                >
                    <div className="px-6 sm:px-10 pt-8 sm:pt-10 flex items-start justify-between gap-4">
                        <div>
                            <h3 id={idTitulo} className="text-2xl font-bold text-slate-900 tracking-tight">
                                {titulo}
                            </h3>
                            <p className="text-sm text-slate-600 mt-3">{descripcion}</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Cerrar"
                            onClick={onClose}
                            disabled={bloqueado}
                            className="text-slate-500 hover:text-slate-700 p-1 -mt-2 -mr-2 rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

/** Clases del cuerpo de los formularios dentro del modal. */
export const cuerpoModal = 'px-6 sm:px-10 pt-5 pb-8 sm:pb-10 space-y-6';

export const AvisoError: React.FC<{ mensaje: string | null }> = ({ mensaje }) =>
    mensaje ? (
        <p role="alert" className="text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 p-3">
            {mensaje}
        </p>
    ) : null;

/** Nota verde con el ícono de información, al pie de los formularios. */
export const NotaInfo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="flex items-center gap-3 text-xs text-slate-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5">
        <Info className="w-4 h-4 shrink-0 text-[#139a6c]" />
        <span>{children}</span>
    </p>
);

const botonBase = 'px-6 py-3 text-sm font-semibold rounded-xl transition cursor-pointer';
export const botonSecundarioModal = `${botonBase} border border-slate-200 text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-50`;
export const botonPrincipalModal = `${botonBase} bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white shadow-xs disabled:opacity-60 disabled:cursor-wait`;

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
    <div className="pt-2 flex items-center justify-end gap-3">
        <button type="button" onClick={onCancelar} disabled={guardando} className={botonSecundarioModal}>
            {textoCancelar}
        </button>
        <button type="submit" disabled={guardando} className={botonPrincipalModal}>
            {guardando ? textoGuardando : textoGuardar}
        </button>
    </div>
);