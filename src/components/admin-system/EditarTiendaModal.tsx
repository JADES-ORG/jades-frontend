import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { desactivarTienda, reactivarTienda } from '../../api/tiendas';
import { obtenerMensajeError } from '../../api/errores';
import type { TiendaResumenResponse } from '../../types/tiendas';

export interface TiendaData {
  id: number;
  nombreComercial: string;
  razonSocial: string;
  giro: string;
  telefono: string;
  direccion: string;
  correo: string;
  estado: 'Activo' | 'Inactivo';
  documento: string;
  adminNombre: string;
  adminCorreo: string;
  adminTelefono: string;
}

interface EditarTiendaModalProps {
  isOpen: boolean;
  tienda: TiendaResumenResponse | null;
  onClose: () => void;
  onSave: (tiendaActualizada: TiendaResumenResponse) => void;
}

export const EditarTiendaModal: React.FC<EditarTiendaModalProps> = ({ isOpen, tienda, onClose, onSave }) => {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isOpen || !tienda) return null;
  const activa = tienda.estadoTienda === 'ACTIVO';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setError(null);
    setGuardando(true);
    try {
      const actualizada = activa
        ? { ...tienda, estadoTienda: (await desactivarTienda(tienda.idTienda)).estadoTienda }
        : await reactivarTienda(tienda.idTienda);
      onSave(actualizada);
      onClose();
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Gestionar tienda</h3>
            <p className="text-xs text-slate-500 mt-1">Consulta los datos disponibles y administra su estado.</p>
          </div>
          <button type="button" aria-label="Cerrar" disabled={guardando} onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Nombre comercial', tienda.nombreTienda],
              ['ID de tienda', String(tienda.idTienda)],
              ['Documento del negocio', tienda.documentoTienda],
              ['Estado actual', activa ? 'Activo' : 'Inactivo'],
            ].map(([label, value]) => (
              <label key={label} className="block text-xs font-bold text-slate-700">{label}
                <input readOnly value={value} className="mt-1 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500">La edición de los datos generales y del administrador no está disponible en la API actual.</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-emerald-800">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-xs">{activa ? 'Al desactivar, se impiden nuevas ventas y modificaciones, pero se conservan las consultas, créditos y cobranzas.' : 'Al reactivar, el negocio puede volver a operar. Los clientes y productos inactivos mantienen su propio estado.'}</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" disabled={guardando} onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold">Cancelar</button>
            <button type="submit" disabled={guardando} className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold disabled:opacity-50 ${activa ? 'bg-red-600 hover:bg-red-700' : 'bg-[#139a6c] hover:bg-[#0f825b]'}`}>{guardando ? 'Procesando...' : activa ? 'Desactivar tienda' : 'Reactivar tienda'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
