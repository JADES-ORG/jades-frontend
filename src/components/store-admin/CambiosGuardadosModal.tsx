import React from 'react';
import { X, Check } from 'lucide-react';

interface CambiosGuardadosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CambiosGuardadosModal: React.FC<CambiosGuardadosModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 p-7 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 mb-5 mt-1">
          <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-emerald-100 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-[#139a6c] stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cambios guardados
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              La configuración del negocio se actualizó correctamente.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
