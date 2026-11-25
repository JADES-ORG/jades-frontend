import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface StoreDashboardPageProps {
  onGoToClients: () => void;
  onGoToSales: () => void;
}

export const StoreDashboardPage: React.FC<StoreDashboardPageProps> = ({
  onGoToClients,
  onGoToSales,
}) => {
  return (
    <div className="space-y-6">
      {/* Título de bienvenida y botón Registrar venta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Buenos días, Luis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Este es el estado de tus ventas a crédito hoy.
          </p>
        </div>

        <button
          onClick={onGoToSales}
          className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar venta</span>
        </button>
      </div>

      {/* Grid de 4 Métricas de Bodega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total por cobrar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#139a6c] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total por cobrar</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 2,873.34</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Obligaciones pendientes</p>
          </div>
        </div>

        {/* Total cobrado */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total cobrado</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 153.12</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Junio 2025 · 1 pago registrado</p>
          </div>
        </div>

        {/* Pagos por vencer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pagos por vencer</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 1,793.75</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Vence el 16 de junio</p>
          </div>
        </div>

        {/* Deuda en mora */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Deuda en mora</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ 284.49</h3>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Rosa · incluye S/ 0.91</p>
          </div>
        </div>
      </div>

      {/* Gráfico y Próximos cobros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico: Cobros de los últimos 6 meses (2 columnas de ancho) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cobros de los últimos 6 meses</h3>
              <p className="text-xs text-slate-400">Pagos recibidos vs. pagos esperados</p>
            </div>
            <span className="text-xs font-medium text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg">
              Últimos 6 meses
            </span>
          </div>

          {/* Gráfico de barras visual */}
          <div className="py-6 flex items-end justify-between h-48 px-4 border-b border-slate-100">
            {[
              { mes: 'Ene', esp: 40, rec: 35 },
              { mes: 'Feb', esp: 60, rec: 55 },
              { mes: 'Mar', esp: 50, rec: 48 },
              { mes: 'Abr', esp: 70, rec: 65 },
              { mes: 'May', esp: 80, rec: 75 },
              { mes: 'Jun', esp: 95, rec: 85 },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="flex items-end space-x-1.5 h-36">
                  {/* Esperado (claro) */}
                  <div
                    style={{ height: `${bar.esp}%` }}
                    className="w-3 bg-emerald-200/70 rounded-t-sm"
                    title={`Esperado: ${bar.esp}%`}
                  ></div>
                  {/* Recibido (oscuro) */}
                  <div
                    style={{ height: `${bar.rec}%` }}
                    className="w-3 bg-[#0e3b2e] rounded-t-sm"
                    title={`Recibido: ${bar.rec}%`}
                  ></div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{bar.mes}</span>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="pt-3 flex items-center justify-center space-x-6 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-200/70 rounded-xs"></span>
              <span>Esperado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-[#0e3b2e] rounded-xs"></span>
              <span>Recibido</span>
            </div>
          </div>
        </div>

        {/* Próximos cobros (1 columna de ancho) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Próximos cobros</h3>
                <p className="text-[11px] text-slate-400">Pagos de los siguientes 7 días</p>
              </div>
              <button
                onClick={onGoToClients}
                className="text-xs font-semibold text-[#139a6c] hover:underline flex items-center cursor-pointer"
              >
                Ver todos <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {/* Cliente 1 */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                    MQ
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">María Quispe</p>
                    <p className="text-[10px] text-slate-400">Obligación del ciclo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">S/ 211.82</p>
                  <p className="text-[10px] font-semibold text-rose-500">• Hoy</p>
                </div>
              </div>

              {/* Cliente 2 */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                    CM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Carlos Mendoza</p>
                    <p className="text-[10px] text-slate-400">Obligación del ciclo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">S/ 1,793.75</p>
                  <p className="text-[10px] font-semibold text-amber-500">• Mañana</p>
                </div>
              </div>

              {/* Cliente 3 */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                    AP
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Ana Paredes</p>
                    <p className="text-[10px] text-slate-400">Obligación del ciclo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">S/ 190.00</p>
                  <p className="text-[10px] text-slate-400">• 18 Jun</p>
                </div>
              </div>

              {/* Cliente 4 */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                    JR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">José Rojas</p>
                    <p className="text-[10px] text-slate-400">Obligación del ciclo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">S/ 420.00</p>
                  <p className="text-[10px] text-slate-400">• 20 Jun</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Actividad reciente</h3>
            <p className="text-[11px] text-slate-400">Últimos movimientos de créditos y pagos</p>
          </div>
          <button className="text-xs font-semibold text-[#139a6c] hover:underline flex items-center cursor-pointer">
            Ver actividad <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Pago recibido</p>
              <p className="text-[11px] text-slate-500">Jorge Flores canceló su obligación</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                <span className="text-[10px] text-slate-400">10 jun 2025</span>
                <span className="text-xs font-bold text-slate-900">S/ 153.12</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Nueva venta a crédito</p>
              <p className="text-[11px] text-slate-500">Venta registrada para María Quispe</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                <span className="text-[10px] text-slate-400">Hoy, 10:42</span>
                <span className="text-xs font-bold text-slate-900">S/ 345.00</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Pago vencido</p>
              <p className="text-[11px] text-slate-500">La obligación de Rosa está en mora</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                <span className="text-[10px] text-slate-400">07 jun 2025</span>
                <span className="text-xs font-bold text-rose-600">S/ 283.58</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
