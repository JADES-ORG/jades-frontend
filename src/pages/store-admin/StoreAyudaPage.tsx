import React from 'react';
import type { StoreTab } from '../../layouts/StoreAdminLayout';

interface StoreAyudaPageProps {
  onNavigateTab: (tab: StoreTab) => void;
}

export const StoreAyudaPage: React.FC<StoreAyudaPageProps> = ({ onNavigateTab }) => {
  const steps = [
    {
      paso: 'PASO 1',
      titulo: 'Clientes',
      tab: 'clientes' as StoreTab,
      descripcion:
        'Registra o edita al cliente y define tasa, moneda, límite, plazo máximo, corte, día de pago y tasa moratoria.',
    },
    {
      paso: 'PASO 2',
      titulo: 'Productos y servicios',
      tab: 'productos' as StoreTab,
      descripcion:
        'Crea o activa conceptos de venta, define precios de contado/crédito y las modalidades permitidas.',
    },
    {
      paso: 'PASO 3',
      titulo: 'Nueva venta',
      tab: 'nueva_venta' as StoreTab,
      descripcion:
        'Selecciona cliente, agrega conceptos, elige pago único o en meses y revisa la gracia calculada y la primera fecha de pago antes de confirmar.',
    },
    {
      paso: 'PASO 4',
      titulo: 'Pagos',
      tab: 'pagos' as StoreTab,
      descripcion:
        'Registra el pago total exigible. Si existe atraso, JADES calcula la mora y muestra la composición del pago.',
    },
    {
      paso: 'PASO 5',
      titulo: 'Cortes y cobranzas',
      tab: 'cortes' as StoreTab,
      descripcion:
        'Consulta obligaciones por ciclo y fecha, revisa clientes por vencer o en mora, abre el detalle de cada corte y descarga el informe del período.',
    },
    {
      paso: 'PASO 6',
      titulo: 'Configuración',
      tab: 'configuracion' as StoreTab,
      descripcion:
        'Actualiza los datos visibles del negocio y las preferencias generales utilizadas por el sistema.',
    },
  ];

  return (
    <div className="space-y-[18px]">
      {/* Subtítulo */}
      <p className="text-xs text-jades-muted font-normal">
        Guía rápida para gestionar clientes, ventas, pagos y cobranzas en JADES.
      </p>

      {/* Banner Verde Suave */}
      <div className="bg-jades-soft border border-jades-line rounded-2xl p-5 text-left">
        <h3 className="text-xs font-bold text-jades-ink">
          Empieza por el módulo que necesitas
        </h3>
        <p className="text-xs text-jades-muted mt-1 leading-relaxed">
          Cada apartado del menú corresponde a una tarea. Sigue los pasos en orden y revisa los mensajes de validación antes de confirmar una operación.
        </p>
      </div>

      {/* Sección: Cómo usar cada módulo */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-bold text-jades-ink">
          Cómo usar cada módulo
        </h3>

        {/* Grid 6 Tarjetas (2 filas x 3 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateTab(item.tab)}
              className="bg-white rounded-[13px] border border-jades-line p-5 hover:border-jades-primary hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-jades-primary tracking-wider uppercase">
                  {item.paso}
                </span>
                <h4 className="text-sm font-bold text-jades-ink mt-1 group-hover:text-jades-primary transition">
                  {item.titulo}
                </h4>
                <p className="text-xs text-jades-muted mt-2 leading-relaxed font-normal">
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjeta: Reglas importantes */}
      <div className="bg-white rounded-[13px] border border-jades-line p-6 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-jades-ink">
          Reglas importantes
        </h4>
        <ul className="space-y-2 text-xs text-jades-muted">
          <li className="flex items-start">
            <span className="text-jades-muted mr-2">•</span>
            <span>El sistema trabaja con año comercial de 360 días y meses de 30 días.</span>
          </li>
          <li className="flex items-start">
            <span className="text-jades-muted mr-2">•</span>
            <span>Los planes mensuales usan método francés vencido simple ordinario.</span>
          </li>
          <li className="flex items-start">
            <span className="text-jades-muted mr-2">•</span>
            <span>No se confirma una venta si supera el crédito disponible o el plazo máximo pactado.</span>
          </li>
          <li className="flex items-start">
            <span className="text-jades-muted mr-2">•</span>
            <span>Puedes cobrar un pago único antes del vencimiento con el interés que calcule JADES, anticipar la cuota del mes sin reducir su interés pactado o liquidar el crédito completo desde el mes de la primera cuota. Los pagos parciales están restringidos.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
