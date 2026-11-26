import React from 'react';
import { X, Check, Info } from 'lucide-react';
import type { PagoItemData } from './RegistrarPagoModal';

interface PagoRegistradoModalProps {
  isOpen: boolean;
  pagoItem: PagoItemData | null;
  onClose: () => void;
}

export const PagoRegistradoModal: React.FC<PagoRegistradoModalProps> = ({
  isOpen,
  pagoItem,
  onClose,
}) => {
  if (!isOpen || !pagoItem) return null;

  // Determinar valores según cliente o datos del pago
  const isRosa = pagoItem.cliente.includes('Rosa');
  const subtitle = isRosa
    ? 'Rosa Huamán · Obligación de junio cancelada'
    : `${pagoItem.cliente} · Cuota 02 cancelada`;

  const totalRecibido = pagoItem.total;
  const capitalLiberado = pagoItem.capitalLiberado ?? pagoItem.capital;
  const capitalPendiente = pagoItem.capitalPendientePost ?? (isRosa ? 0.00 : 560.28);
  const creditoDisponible = pagoItem.creditoDisponiblePost ?? (isRosa ? 2000.00 : 1439.72);

  const infoText = isRosa
    ? 'Pago registrado el 15/06/2025. Incluye S/ 0.91 de mora; solo el capital pagado libera límite de crédito.'
    : 'Estado posterior al pago del 15/06/2025. Los intereses pagados no aumentan el límite de crédito.';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-7 text-center relative animate-in fade-in zoom-in-95 duration-150">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título y subtítulo */}
        <div className="mt-2 mb-4 text-left sm:text-center">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Pago registrado
          </h3>
          <p className="text-xs text-slate-500 mt-1.5">
            {subtitle}
          </p>
        </div>

        {/* Checkmark Verde */}
        <div className="flex justify-center my-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-[#139a6c] stroke-[3]" />
          </div>
        </div>

        {/* Cuadro de Métricas 2x2 */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-left mb-5">
          <div className="grid grid-cols-2 divide-x divide-slate-100 p-4">
            <div className="pr-2">
              <p className="text-[11px] text-slate-400 font-medium">Total recibido</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                S/ {totalRecibido.toFixed(2)}
              </p>
            </div>
            <div className="pl-4">
              <p className="text-[11px] text-slate-400 font-medium">Capital liberado</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                S/ {capitalLiberado.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 p-4">
            <div className="pr-2">
              <p className="text-[11px] text-slate-400 font-medium">Capital pendiente</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                S/ {capitalPendiente.toFixed(2)}
              </p>
            </div>
            <div className="pl-4">
              <p className="text-[11px] text-slate-400 font-medium">Crédito disponible</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                S/ {creditoDisponible.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Banner Informativo */}
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3.5 mb-6 text-left flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
            {infoText}
          </p>
        </div>

        {/* Botón Volver a pagos */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          Volver a pagos
        </button>
      </div>
    </div>
  );
};
