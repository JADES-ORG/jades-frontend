import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  ChevronRight,
  Info,
} from 'lucide-react';

interface StoreClienteDetailPageProps {
  onBack: () => void;
  onViewPlanPagos: (codigoCredito: string) => void;
  onEditClient?: () => void;
  onEditConditions?: () => void;
  onNewSale?: () => void;
}

export const StoreClienteDetailPage: React.FC<StoreClienteDetailPageProps> = ({
  onBack,
  onViewPlanPagos,
  onEditClient,
  onEditConditions,
  onNewSale,
}) => {
  const [activeTab, setActiveTab] = useState<'creditos' | 'pagos' | 'condiciones'>('creditos');

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Volver a clientes
      </button>

      {/* Encabezado del Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-sm text-slate-700">
            MQ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                María Quispe
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                • Activo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              DNI 45892136 · Cliente desde febrero 2024
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onEditClient}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Editar cliente
          </button>
          <button
            onClick={onNewSale}
            className="inline-flex items-center space-x-1.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nueva venta a crédito</span>
          </button>
        </div>
      </div>

      {/* Banner Verde Oscuro Resumen Financiero */}
      <div className="bg-[#0e3b2e] rounded-2xl p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-xs">
        {/* Deuda actual */}
        <div>
          <p className="text-xs text-emerald-200/70 font-medium">Deuda actual</p>
          <h3 className="text-2xl font-bold text-white mt-1">S/ 795.10</h3>
          <p className="text-[11px] text-emerald-200/50 mt-0.5">Capital pendiente: S/ 761.89</p>
        </div>

        {/* Crédito utilizado + Barra de progreso */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-emerald-200/70 font-medium">Crédito utilizado</span>
            <span className="font-bold text-white">38.0945%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '38.0945%' }}></div>
          </div>
          <p className="text-[11px] text-emerald-200/60 mt-1.5 flex items-center">
            ✓ Tienes S/ 1,238.11 disponibles
          </p>
        </div>

        {/* Próximo pago */}
        <div className="md:text-right">
          <p className="text-xs text-emerald-200/70 font-medium">Próximo pago</p>
          <h3 className="text-2xl font-bold text-white mt-1">S/ 211.82</h3>
          <p className="text-[11px] text-emerald-200/60 mt-0.5">15 jun 2025</p>
        </div>
      </div>

      {/* Tarjeta: Condiciones de crédito pactadas */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Condiciones de crédito pactadas</h3>
            <p className="text-[11px] text-slate-400">Estas condiciones se aplican al registrar una nueva venta.</p>
          </div>
          <button
            onClick={onEditConditions}
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Editar condiciones
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs">
          <div>
            <p className="text-slate-400 text-[11px]">Tipo y valor de tasa</p>
            <p className="font-semibold text-slate-800 mt-0.5">Efectiva · 2.500000% mensual</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Moneda</p>
            <p className="font-semibold text-slate-800 mt-0.5">Soles (PEN)</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Límite máximo</p>
            <p className="font-semibold text-slate-800 mt-0.5">S/ 2,000.00</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Plazo máximo</p>
            <p className="font-semibold text-slate-800 mt-0.5">6 meses</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Corte mensual</p>
            <p className="font-semibold text-slate-800 mt-0.5">Día 10 · 18:00 h</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Día de pago</p>
            <p className="font-semibold text-slate-800 mt-0.5">Día 15</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Tasa moratoria</p>
            <p className="font-semibold text-slate-800 mt-0.5">TNM 1.200000% · cap. diaria</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Estado</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
              • Activo
            </span>
          </div>
        </div>
      </div>

      {/* Pestañas Inferiores */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('creditos')}
          className={`pb-3 transition cursor-pointer border-b-2 ${
            activeTab === 'creditos'
              ? 'border-[#139a6c] text-[#139a6c]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Créditos y compras
        </button>
        <button
          onClick={() => setActiveTab('pagos')}
          className={`pb-3 transition cursor-pointer border-b-2 ${
            activeTab === 'pagos'
              ? 'border-[#139a6c] text-[#139a6c]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Historial de pagos
        </button>
        <button
          onClick={() => setActiveTab('condiciones')}
          className={`pb-3 transition cursor-pointer border-b-2 ${
            activeTab === 'condiciones'
              ? 'border-[#139a6c] text-[#139a6c]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Condiciones de crédito
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      {/* 1. CRÉDITOS Y COMPRAS (Imagen 6) */}
      {activeTab === 'creditos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Créditos activos</h3>
            <p className="text-[11px] text-slate-400">Compras pendientes de pago</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">OPERACIÓN</th>
                  <th className="py-3 px-6">FECHA</th>
                  <th className="py-3 px-6">MODALIDAD</th>
                  <th className="py-3 px-6">PROGRESO</th>
                  <th className="py-3 px-6">SALDO PENDIENTE</th>
                  <th className="py-3 px-6">ESTADO</th>
                  <th className="py-3 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr
                  onClick={() => onViewPlanPagos('CR-001284')}
                  className="hover:bg-slate-50/60 transition cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">CR-001284</p>
                    <p className="text-[10px] text-slate-400">Canasta familiar</p>
                  </td>
                  <td className="py-4 px-6 text-slate-600">05 abr 2025</td>
                  <td className="py-4 px-6 text-slate-600">3 cuotas</td>
                  <td className="py-4 px-6 text-slate-600">1 de 3 pagadas</td>
                  <td className="py-4 px-6 font-bold text-slate-900">S/ 408.26</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                      • Pendiente
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition cursor-pointer">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">CR-001285</p>
                    <p className="text-[10px] text-slate-400">Canasta y cuidado personal</p>
                  </td>
                  <td className="py-4 px-6 text-slate-600">15 jun 2025</td>
                  <td className="py-4 px-6 text-slate-600">3 cuotas</td>
                  <td className="py-4 px-6 text-slate-600">0 de 3 pagadas</td>
                  <td className="py-4 px-6 font-bold text-slate-900">S/ 353.63</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      • En gracia
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. HISTORIAL DE PAGOS (Imagen 3) */}
      {activeTab === 'pagos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Historial de pagos</h3>
            <p className="text-[11px] text-slate-400">Pagos registrados y composición de cada cancelación.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">OBLIGACIÓN</th>
                  <th className="py-3 px-6">FECHA</th>
                  <th className="py-3 px-6">CAPITAL</th>
                  <th className="py-3 px-6">INTERÉS</th>
                  <th className="py-3 px-6">MORA</th>
                  <th className="py-3 px-6">TOTAL</th>
                  <th className="py-3 px-6">MEDIO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">Cuota 01 · CR-001284</td>
                  <td className="py-4 px-6 text-slate-600">15 may 2025</td>
                  <td className="py-4 px-6 text-slate-600">S/ 196.70</td>
                  <td className="py-4 px-6 text-slate-600">S/ 15.12</td>
                  <td className="py-4 px-6 text-slate-600">S/ 0.00</td>
                  <td className="py-4 px-6 font-bold text-slate-900">S/ 211.82</td>
                  <td className="py-4 px-6 text-slate-600">Efectivo</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500">
            El pago fue imputado a interés compensatorio y capital. No hubo mora.
          </div>
        </div>
      )}

      {/* 3. CONDICIONES DE CRÉDITO (Imagen 4) */}
      {activeTab === 'condiciones' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Detalle de condiciones de crédito</h3>
            <p className="text-[11px] text-slate-400">Parámetros completos que se aplican a las nuevas ventas a crédito del cliente.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs border-y border-slate-100 py-5">
            <div>
              <p className="text-slate-400 text-[11px]">Tipo de tasa</p>
              <p className="font-semibold text-slate-800 mt-0.5">Efectiva</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Valor de la tasa</p>
              <p className="font-semibold text-slate-800 mt-0.5">2.500000%</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Período de referencia</p>
              <p className="font-semibold text-slate-800 mt-0.5">Mensual</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Capitalización nominal</p>
              <p className="font-semibold text-slate-800 mt-0.5">No aplica</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Moneda</p>
              <p className="font-semibold text-slate-800 mt-0.5">Soles (PEN)</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Límite máximo</p>
              <p className="font-semibold text-slate-800 mt-0.5">S/ 2,000.00</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Plazo máximo</p>
              <p className="font-semibold text-slate-800 mt-0.5">6 meses</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Corte</p>
              <p className="font-semibold text-slate-800 mt-0.5">Día 10 · 18:00 h</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Día de pago</p>
              <p className="font-semibold text-slate-800 mt-0.5">Día 15</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Tipo de tasa moratoria</p>
              <p className="font-semibold text-slate-800 mt-0.5">Nominal mensual</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Valor moratorio</p>
              <p className="font-semibold text-slate-800 mt-0.5">1.200000%</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">Capitalización moratoria</p>
              <p className="font-semibold text-slate-800 mt-0.5">Diaria</p>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center space-x-2 text-emerald-800 text-xs">
            <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
            <p className="font-medium">
              Base financiera 360/30. Las tasas se conservan con al menos 7 decimales para los cálculos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
