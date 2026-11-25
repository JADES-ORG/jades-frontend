import React from 'react';

export const ClientAyudaPage: React.FC = () => {
  return (
    <div className="space-y-8 w-full">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ayuda
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Guía para consultar tus compras, cronogramas y pagos.
        </p>
      </div>

      {/* Banner Verde Superior */}
      <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-3xl p-6 sm:p-7 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Tu cuenta reúne todo lo relacionado con tus créditos
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
          Desde aquí puedes revisar cuánto debes, cuándo vence tu próximo pago y el detalle de cada compra sin modificar las condiciones pactadas. Los pagos los registra el negocio desde la fecha pactada; el alcance actual no contempla pagos anticipados.
        </p>
      </div>

      {/* Sección 1: Dónde encontrar cada información */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Dónde encontrar cada información
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Opción 1 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#139a6c]">
              OPCIÓN 1
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">
              Mi resumen
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Consulta capital pendiente, crédito disponible, próximo pago y estado general de tu cuenta.
            </p>
          </div>

          {/* Opción 2 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#139a6c]">
              OPCIÓN 2
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">
              Mis compras
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Revisa tus compras a crédito. Desde cada operación puedes abrir el plan de pagos o el detalle del pago único.
            </p>
          </div>

          {/* Opción 3 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#139a6c]">
              OPCIÓN 3
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">
              Mis pagos
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Consulta obligaciones pendientes, pagos realizados, vencimientos y posibles intereses por mora.
            </p>
          </div>
        </div>
      </div>

      {/* Sección 2: Cómo leer tu crédito */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Cómo leer tu crédito
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              Capital pendiente
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Parte del dinero financiado que todavía falta amortizar.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              Crédito disponible
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Monto que aún puedes utilizar según tu límite autorizado.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              Fecha de vencimiento
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Día pactado para cancelar la obligación completa.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              Mora
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Interés adicional que puede generarse cuando el pago se realiza después del vencimiento.
            </p>
          </div>
        </div>
      </div>

      {/* Sección 3: Preguntas frecuentes */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Preguntas frecuentes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              ¿Puedo pagar solo una parte?
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              No. JADES registra el pago por el total exigible de la obligación.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              ¿Qué ocurre si pago tarde?
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              El sistema calcula los días de atraso y, cuando corresponde, agrega intereses por mora.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              ¿Dónde veo mi cronograma?
            </h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Ingresa a Mis compras y abre el plan de la operación financiada en meses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
