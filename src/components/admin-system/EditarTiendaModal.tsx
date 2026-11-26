import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

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
  tienda: TiendaData | null;
  onClose: () => void;
  onSave: (tiendaActualizada: TiendaData) => void;
}

export const EditarTiendaModal: React.FC<EditarTiendaModalProps> = ({
  isOpen,
  tienda,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<TiendaData | null>(null);
  const [nuevaContrasena, setNuevaContrasena] = useState('');

  useEffect(() => {
    if (tienda) {
      setFormData({ ...tienda });
      setNuevaContrasena('');
    }
  }, [tienda]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Editar tienda
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Actualiza los datos generales y del administrador asignado.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECCIÓN 1: DATOS DE LA TIENDA */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              DATOS DE LA TIENDA
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre comercial
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombreComercial}
                  onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                  placeholder="Bodega San Blas"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Nombre con el que se identifica el negocio.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razón social o responsable
                </label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  placeholder="Luis Alvarez"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Responsable legal o razón social.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo / giro del negocio
                </label>
                <select
                  value={formData.giro}
                  onChange={(e) => setFormData({ ...formData, giro: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Bodega">Bodega</option>
                  <option value="Panadería">Panadería</option>
                  <option value="Carnicería">Carnicería</option>
                  <option value="Peluquería">Peluquería</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Minimarket">Minimarket</option>
                  <option value="Otro">Otro</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Selecciona el giro principal del establecimiento.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="987 654 321"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Número de contacto de la tienda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Cusco, Perú"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Ubicación del establecimiento.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  placeholder="contacto@ejemplo.com"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Correo de contacto del negocio.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Activo' | 'Inactivo' })}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Inactivo impide nuevas operaciones; conserva el historial.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Documento del negocio
                </label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="Ingresa el documento"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Número tributario o identificación del establecimiento.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ADMINISTRADOR DEL NEGOCIO */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              ADMINISTRADOR DEL NEGOCIO
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.adminNombre}
                  onChange={(e) => setFormData({ ...formData, adminNombre: e.target.value })}
                  placeholder="Luis Alvarez"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Persona que administrará esta tienda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo de acceso
                </label>
                <input
                  type="email"
                  required
                  value={formData.adminCorreo}
                  onChange={(e) => setFormData({ ...formData, adminCorreo: e.target.value })}
                  placeholder="luis@ejemplo.com"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Usuario asignado a esta tienda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva contraseña (opcional)
                </label>
                <input
                  type="password"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Déjalo vacío para mantener la contraseña actual.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono del administrador
                </label>
                <input
                  type="text"
                  value={formData.adminTelefono}
                  onChange={(e) => setFormData({ ...formData, adminTelefono: e.target.value })}
                  placeholder="987 654 321"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Contacto del responsable de la cuenta.</p>
              </div>
            </div>
          </div>

          {/* Banner de Info */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3.5 flex items-center space-x-3 text-emerald-800">
            <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
            <p className="text-xs font-medium">
              Las credenciales iniciales se entregan únicamente al administrador asignado.
            </p>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
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
              Guardar tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
