import React from 'react';

export type TonoEstado = 'verde' | 'ambar' | 'rojo' | 'gris';

const ESTILOS: Record<TonoEstado, { badge: string; punto: string }> = {
    verde: { badge: 'bg-jades-soft text-jades-primary border-jades-line', punto: 'bg-emerald-500' },
    ambar: { badge: 'bg-jades-warning-bg text-jades-warning border-amber-200/60', punto: 'bg-amber-500' },
    rojo: { badge: 'bg-jades-danger-bg text-jades-danger border-rose-200/60', punto: 'bg-rose-500' },
    gris: { badge: 'bg-slate-50 text-slate-700 border-slate-200/60', punto: 'bg-slate-400' },
};

/** Tono según el texto del estado (deuda, crédito o cliente). */
function tonoDe(estado: string): TonoEstado {
    if (['Al día', 'Activo', 'Pagado'].includes(estado)) return 'verde';
    if (['Por vencer', 'Pendiente'].includes(estado)) return 'ambar';
    if (['En mora', 'Anulada'].includes(estado)) return 'rojo';
    return 'gris';
}

export const EstadoBadge: React.FC<{ estado: string; tono?: TonoEstado }> = ({ estado, tono }) => {
    const estilo = ESTILOS[tono ?? tonoDe(estado)];
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border whitespace-nowrap ${estilo.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${estilo.punto}`} />
            {estado}
    </span>
    );
};