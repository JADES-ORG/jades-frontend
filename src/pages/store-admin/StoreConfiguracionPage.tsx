import React from 'react';
import type { TiendaResumenResponse } from '../../types/tiendas';

interface StoreConfiguracionPageProps {
  tienda: TiendaResumenResponse;
  correoUsuario: string;
  actualizando: boolean;
  onActualizar: () => void;
}

export const StoreConfiguracionPage: React.FC<StoreConfiguracionPageProps> = ({ tienda, correoUsuario, actualizando, onActualizar }) => (
  <div className="space-y-6">
    <p className="text-xs text-slate-500 font-normal">Datos disponibles de la cuenta y del negocio seleccionado.</p>
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          ['Nombre comercial', tienda.nombreTienda],
          ['Documento del negocio', tienda.documentoTienda],
          ['Estado de la tienda', tienda.estadoTienda === 'ACTIVO' ? 'Activo' : 'Inactivo'],
          ['Correo de acceso del administrador', correoUsuario],
        ].map(([label, value]) => (
          <label key={label} className="block text-xs font-semibold text-slate-700">{label}
            <input readOnly value={value} className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800" />
          </label>
        ))}
      </div>
      {tienda.estadoTienda !== 'ACTIVO' && <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">Tienda inactiva: se permiten consultas y cobranzas. Solo el administrador del sistema puede reactivarla.</p>}
      <p className="text-xs text-slate-500">La API actual no devuelve el giro, teléfono ni correo del negocio y no permite guardar cambios de configuración. Los datos disponibles son de solo lectura.</p>
      <div className="pt-4 flex items-center justify-end">
        <button type="button" disabled={actualizando} onClick={onActualizar} className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50">{actualizando ? 'Actualizando...' : 'Actualizar datos'}</button>
      </div>
    </div>
  </div>
);
