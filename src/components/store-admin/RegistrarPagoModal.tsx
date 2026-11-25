import React, { useState } from 'react';
import { X, Info, ChevronDown } from 'lucide-react';

export interface PagoItemData {
  id: number;
  cliente: string;
  obligacion: string;
  vence: string;
  capital: number;
  interesCompensatorio: number;
  mora: number;
  total: number;
  estado: 'Pendiente' | 'En mora' | 'Por vencer';
  diasAtraso?: number;
  tasaMoraInfo?: string;
  // Datos para post-pago
  capitalPendientePost?: number;
  creditoDisponiblePost?: number;
  capitalLiberado?: number;
  detallePost?: string;
}

interface RegistrarPagoModalProps {
  isOpen: boolean;
  pagoItem: PagoItemData | null;
  onClose: () => void;
  onConfirmPago: (pagoConfirmado: PagoItemData, medioPago: string) => void;
}

export const RegistrarPagoModal: React.FC<RegistrarPagoModalProps> = ({
  isOpen,
  pagoItem,
  onClose,
  onConfirmPago,
}) => {
  const [fechaEfectiva, setFechaEfectiva] = useState('15/06/2025');
  const [medioPago, setMedioPago] = useState('Efectivo');

  if (!isOpen || !pagoItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPago(pagoItem, medioPago);
  };

  const isEnMora = pagoItem.mora > 0 || pagoItem.estado === 'En mora';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Registrar pago total
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {pagoItem.cliente} · {pagoItem.obligacion}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Tarjeta: COMPOSICIÓN E IMPUTACIÓN */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="bg-white p-4 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                COMPOSICIÓN E IMPUTACIÓN
              </h4>

              {/* 1 Intereses por mora */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-slate-700">Intereses por mora</span>
                </div>
                <span className="font-semibold text-slate-900">
                  S/ {pagoItem.mora.toFixed(2)}
                </span>
              </div>

              {/* 2 Interés compensatorio */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-slate-700">Interés compensatorio</span>
                </div>
                <span className="font-semibold text-slate-900">
                  S/ {pagoItem.interesCompensatorio.toFixed(2)}
                </span>
              </div>

              {/* 3 Capital */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-slate-700">Capital</span>
                </div>
                <span className="font-semibold text-slate-900">
                  S/ {pagoItem.capital.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fila oscura Total exigible */}
            <div className="bg-[#0e3b2e] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">Total exigible</span>
              <span className="text-base font-bold text-white">
                S/ {pagoItem.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Alerta de Atraso o Puntualidad */}
          {isEnMora ? (
            <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-3 text-left flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Vencimiento: {pagoItem.vence === '07 jun' ? '07/06/2025' : pagoItem.vence} · 8 días de atraso · TNM 1.200000% con capitalización diaria.
              </p>
            </div>
          ) : (
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3 text-left flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                Vencimiento: 15/06/2025 · Pago puntual · 0 dias de atraso.
              </p>
            </div>
          )}

          {/* Alerta informativa de pago total obligatorio */}
          <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-3 text-left flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              Esta obligación debe pagarse por el total exigible. No se admiten abonos menores.
            </p>
          </div>

          {/* Campo: Monto a recibir (calculado) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monto a recibir (calculado)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                S/
              </span>
              <input
                type="text"
                disabled
                value={pagoItem.total.toFixed(2)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Importe calculado por el sistema; no es editable.
            </p>
          </div>

          {/* Campo: Fecha efectiva de pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fecha efectiva de pago
            </label>
            <input
              type="text"
              value={fechaEfectiva}
              onChange={(e) => setFechaEfectiva(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#139a6c]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Registra la fecha real en que el negocio recibe el pago.
            </p>
          </div>

          {/* Campo: Medio de pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medio de pago
            </label>
            <div className="relative">
              <select
                value={medioPago}
                onChange={(e) => setMedioPago(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#139a6c] cursor-pointer"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia / Yape / Plin">Transferencia / Yape / Plin</option>
                <option value="Tarjeta de débito">Tarjeta de débito</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Selecciona el medio por el que se recibió el pago.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Confirmar pago total
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
