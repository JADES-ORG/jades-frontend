import React from 'react';
import { X, Info } from 'lucide-react';

export interface ConceptoCorte {
  fecha: string;
  concepto: string;
  dias: string;
  capitalBase: string;
  interes: string;
  isMoraRow?: boolean;
}

export interface CorteItemData {
  id: number;
  cliente: string;
  fechaCorte: string;
  fechaPago: string;
  obligacion: string;
  capital: number;
  interesCompensatorio: number;
  mora: number;
  totalPagar: number;
  estado: 'Pendiente' | 'En mora' | 'Por vencer' | 'Pagado';
  subtituloModal: string;
  conceptos: ConceptoCorte[];
  totalExigible: string;
  estadoModal: string;
  infoBanner: string;
  allowRegisterPago?: boolean;
}

interface DetalleCorteModalProps {
  isOpen: boolean;
  corte: CorteItemData | null;
  onClose: () => void;
  onRegistrarPago?: (corte: CorteItemData) => void;
}

export const DetalleCorteModal: React.FC<DetalleCorteModalProps> = ({
  isOpen,
  corte,
  onClose,
  onRegistrarPago,
}) => {
  if (!isOpen || !corte) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Detalle del corte · {corte.cliente}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {corte.subtituloModal}
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
        <div className="p-6 sm:p-7 space-y-6">
          {/* Tabla de Conceptos */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-5">FECHA</th>
                  <th className="py-3 px-4">COMPRA / CONCEPTO</th>
                  <th className="py-3 px-4">DÍAS</th>
                  <th className="py-3 px-4">CAPITAL / BASE</th>
                  <th className="py-3 px-5 text-right">INTERÉS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {corte.conceptos.map((item, idx) => (
                  <tr
                    key={idx}
                    className={
                      item.isMoraRow
                        ? 'bg-rose-50/50 hover:bg-rose-50/80 font-medium'
                        : 'hover:bg-slate-50/50'
                    }
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {item.fecha}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.concepto}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.dias}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.capitalBase}
                    </td>
                    <td className="py-3.5 px-5 text-right font-medium text-slate-900">
                      {item.interes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cuadro Resumen 2 Columnas: Total exigible y Estado */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-2 divide-x divide-slate-100 text-xs p-4">
            <div className="pr-2">
              <p className="text-[11px] text-slate-400 font-medium">Total exigible</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {corte.totalExigible}
              </p>
            </div>
            <div className="pl-4">
              <p className="text-[11px] text-slate-400 font-medium">Estado</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {corte.estadoModal}
              </p>
            </div>
          </div>

          {/* Banner Informativo Verde */}
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3.5 text-left flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {corte.infoBanner}
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cerrar detalle
            </button>

            {corte.allowRegisterPago ? (
              <button
                onClick={() => {
                  onClose();
                  if (onRegistrarPago) onRegistrarPago(corte);
                }}
                className="px-5 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Registrar pago
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 border border-slate-200 text-slate-300 text-xs font-semibold rounded-xl cursor-not-allowed"
              >
                Registrar pago
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
