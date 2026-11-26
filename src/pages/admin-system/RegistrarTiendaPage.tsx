import React, { useState } from 'react';
import { Info } from 'lucide-react';
import type { TiendaData } from '../../components/admin-system/EditarTiendaModal';

interface RegistrarTiendaPageProps {
  onCancel: () => void;
  onRegisterSuccess: (nuevaTienda: TiendaData) => void;
}

export const RegistrarTiendaPage: React.FC<RegistrarTiendaPageProps> = ({
  onCancel,
  onRegisterSuccess,
}) => {
  const [nombreComercial, setNombreComercial] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [giro, setGiro] = useState('Bodega');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [documento, setDocumento] = useState('');

  const [adminNombre, setAdminNombre] = useState('');
  const [adminCorreo, setAdminCorreo] = useState('');
  const [adminContrasena, setAdminContrasena] = useState('');
  const [adminTelefono, setAdminTelefono] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const nueva: TiendaData = {
      id: Date.now(),
      nombreComercial: nombreComercial.trim() || 'Nueva Tienda',
      razonSocial: razonSocial.trim() || 'Empresa S.A.C.',
      giro,
      telefono: telefono.trim() || '987 654 321',
      direccion: direccion.trim() || 'Lima, Perú',
      correo: correo.trim() || 'tienda@ejemplo.com',
      estado,
      documento: documento.trim() || '20601234567',
      adminNombre: adminNombre.trim() || 'Admin Asignado',
      adminCorreo: adminCorreo.trim() || 'admin@tienda.com',
      adminTelefono: adminTelefono.trim() || '987 654 321',
    };

    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess(nueva);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Registrar nueva tienda
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Crea un espacio independiente y asigna a su Administrador del negocio.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN 1: DATOS DE LA TIENDA */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              DATOS DE LA TIENDA
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre comercial
                </label>
                <input
                  type="text"
                  required
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  placeholder="Bodega San Blas"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Nombre con el que se identifica el negocio.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Razón social o responsable
                </label>
                <input
                  type="text"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Luis Alvarez"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Responsable legal o razón social.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo / giro del negocio
                </label>
                <select
                  value={giro}
                  onChange={(e) => setGiro(e.target.value)}
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Bodega">Bodega</option>
                  <option value="Panadería">Panadería</option>
                  <option value="Carnicería">Carnicería</option>
                  <option value="Peluquería">Peluquería</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Minimarket">Minimarket</option>
                  <option value="Otro">Otro</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5">Selecciona el giro principal del establecimiento.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Número de contacto de la tienda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Cusco, Perú"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Ubicación del establecimiento.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="contacto@ejemplo.com"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Correo de contacto del negocio.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5">Inactivo impide nuevas operaciones; conserva el historial.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Documento del negocio
                </label>
                <input
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ingresa el documento"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Número tributario o identificación del establecimiento.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ADMINISTRADOR DEL NEGOCIO */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              ADMINISTRADOR DEL NEGOCIO
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={adminNombre}
                  onChange={(e) => setAdminNombre(e.target.value)}
                  placeholder="Luis Alvarez"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Persona que administrará esta tienda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo de acceso
                </label>
                <input
                  type="email"
                  required
                  value={adminCorreo}
                  onChange={(e) => setAdminCorreo(e.target.value)}
                  placeholder="luis@ejemplo.com"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Usuario asignado a esta tienda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contraseña inicial
                </label>
                <input
                  type="password"
                  required
                  value={adminContrasena}
                  onChange={(e) => setAdminContrasena(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Credencial de acceso asignada al administrador.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teléfono del administrador
                </label>
                <input
                  type="text"
                  value={adminTelefono}
                  onChange={(e) => setAdminTelefono(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Contacto del responsable de la cuenta.</p>
              </div>
            </div>
          </div>

          {/* Banner de Info */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800">
            <Info className="w-5 h-5 text-[#139a6c] shrink-0" />
            <p className="text-xs font-medium">
              Las credenciales iniciales se entregan únicamente al administrador asignado.
            </p>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              {isLoading ? 'Registrando...' : 'Registrar tienda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
