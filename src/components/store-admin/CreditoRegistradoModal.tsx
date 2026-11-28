import React from 'react';
import { X, Check, Info } from 'lucide-react';

interface CreditoRegistradoModalProps {
  isOpen: boolean;
  operacionCodigo?: string;
  clienteNombre?: string;
  onClose: () => void;
  onGoToClientDetail: () => void;
  onGoToHome: () => void;
}

export const CreditoRegistradoModal: React.FC<CreditoRegistradoModalProps> = ({
  isOpen,
  operacionCodigo = 'CR-001285',
  clienteNombre = 'María Quispe',
  onClose,
  onGoToClientDetail,
  onGoToHome,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="jades-dialog bg-white max-w-[420px] w-full border border-jades-line p-7 text-center relative animate-in fade-in zoom-in-95 duration-150">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-jades-muted hover:text-jades-muted p-1 rounded-lg hover:bg-jades-subtle transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título y subtítulo */}
        <div className="mt-2 mb-6 text-left sm:text-center">
          <h3 className="text-xl font-bold text-jades-ink tracking-tight">
            Crédito registrado
          </h3>
          <p className="text-xs text-jades-muted mt-1.5">
            La venta para {clienteNombre} se registró correctamente.
          </p>
        </div>

        {/* Check Icon verde */}
        <div className="flex justify-center my-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-jades-primary stroke-[3]" />
          </div>
        </div>

        {/* Cuadro de Operación y Estado */}
        <div className="jades-finance-grid grid grid-cols-2 border border-jades-line rounded-xl p-4 text-left mb-5">
          <div className="pr-3 border-r border-jades-line">
            <p className="text-[11px] text-jades-muted font-medium">Operación</p>
            <p className="text-base font-bold text-jades-ink mt-0.5">{operacionCodigo}</p>
          </div>
          <div className="pl-4">
            <p className="text-[11px] text-jades-muted font-medium">Estado</p>
            <p className="text-base font-bold text-jades-ink mt-0.5">Registrado</p>
          </div>
        </div>

        {/* Banner Informativo */}
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3.5 mb-6 text-left flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
            La obligación y su plan de pago ya están disponibles en el detalle del cliente.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2.5">
          <button
            onClick={onGoToClientDetail}
            className="w-full min-h-11 py-3 bg-jades-primary hover:bg-jades-hover active:bg-jades-active text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            Ver detalle del cliente
          </button>
          <button
            onClick={onGoToHome}
            className="w-full py-3 bg-white border border-jades-line hover:bg-jades-subtle text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
