import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { listarAdministradoresNegocio, registrarTienda } from '../../api/tiendas';
import { obtenerMensajeError } from '../../api/errores';
import type { AdministradorTiendaResponse, TiendaRegistradaResponse } from '../../types/tiendas';

interface RegistrarTiendaPageProps {
  onCancel: () => void;
  onRegisterSuccess: (nuevaTienda: TiendaRegistradaResponse) => void;
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
  const [documento, setDocumento] = useState('');

  const [adminNombre, setAdminNombre] = useState('');
  const [adminCorreo, setAdminCorreo] = useState('');
  const [adminContrasena, setAdminContrasena] = useState('');
  const [adminTelefono, setAdminTelefono] = useState('');
  const [existente, setExistente] = useState(false);
  const [idAdministrador, setIdAdministrador] = useState('');
  const [lista, setLista] = useState<{ datos: AdministradorTiendaResponse[]; error: string } | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!existente) return;
    const controller = new AbortController();
    listarAdministradoresNegocio(controller.signal)
      .then(datos => { if (!controller.signal.aborted) setLista({ datos, error: '' }); })
      .catch((causa: unknown) => {
        if (!controller.signal.aborted) setLista({ datos: [], error: obtenerMensajeError(causa) });
      });
    return () => controller.abort();
  }, [existente, intento]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    if (!nombreComercial.trim() || !razonSocial.trim() || !direccion.trim() || !/^\d{11}$/.test(documento.trim())) {
      setError('Completa los datos obligatorios de la tienda y su documento de 11 dígitos.');
      return;
    }
    if (existente ? !lista?.datos.some(admin => admin.idUsuario === Number(idAdministrador))
      : !adminNombre.trim() || adminContrasena.length < 12 || new TextEncoder().encode(adminContrasena).length > 72) {
      setError(existente ? 'Selecciona un administrador existente.' : 'Completa los datos del administrador. La contraseña requiere 12 caracteres y un máximo de 72 bytes.');
      return;
    }
    setIsLoading(true);
    try {
      const nueva = await registrarTienda({
        nombreTienda: nombreComercial.trim(),
        razonSocial: razonSocial.trim(),
        documentoTienda: documento.trim(),
        giroDeNegocio: giro,
        direccion: direccion.trim(),
        telefonoTienda: telefono.trim() || null,
        correoTienda: correo.trim() || null,
        ...(existente ? { idAdministradorExistente: Number(idAdministrador) } : { administrador: {
          nombreUsuario: adminNombre.trim(),
          correoUsuario: adminCorreo.trim(),
          telefonoUsuario: adminTelefono.trim() || null,
          contrasena: adminContrasena,
        } }),
      });
      setAdminContrasena('');
      onRegisterSuccess(nueva);
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setIsLoading(false);
    }
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
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          <fieldset disabled={isLoading} className="space-y-8">
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
                  maxLength={120}
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
                  maxLength={150}
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
                  maxLength={15}
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
                  required maxLength={200}
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
                  maxLength={150}
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
                <input type="text" value="Activo" readOnly className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
                <p className="text-[10px] text-slate-400 mt-1.5">Las tiendas nuevas se registran activas.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Documento del negocio
                </label>
                <input
                  type="text"
                  required maxLength={11} minLength={11} inputMode="numeric" pattern="[0-9]{11}"
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

            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              <label><input type="radio" name="tipoAdmin" checked={!existente} onChange={() => setExistente(false)} /> Crear administrador</label>
              <label><input type="radio" name="tipoAdmin" checked={existente} onChange={() => { setLista(null); setExistente(true); }} /> Usar administrador existente</label>
            </div>
            {existente ? (
              <label className="grid max-w-md gap-2 text-sm font-medium">
                Administrador de negocio
                <select required disabled={!lista || !!lista.error} value={idAdministrador} onChange={e => setIdAdministrador(e.target.value)} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3">
                  <option value="">{lista ? 'Selecciona un administrador' : 'Cargando administradores…'}</option>
                  {lista?.datos.map(admin => <option value={admin.idUsuario} key={admin.idUsuario}>{admin.nombreUsuario} · {admin.correoUsuario}</option>)}
                </select>
                {lista?.error && <span role="alert" className="text-red-700">{lista.error} <button type="button" className="font-semibold underline" onClick={() => { setLista(null); setIntento(n => n + 1); }}>Reintentar</button></span>}
                {lista && !lista.error && !lista.datos.length && <span>No hay administradores activos disponibles.</span>}
              </label>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
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
                  maxLength={150}
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
                  minLength={12} maxLength={72} autoComplete="new-password"
                  value={adminContrasena}
                  onChange={(e) => setAdminContrasena(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Mínimo 12 caracteres; máximo 72 bytes.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teléfono del administrador
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={adminTelefono}
                  onChange={(e) => setAdminTelefono(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full px-4 py-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Contacto del responsable de la cuenta.</p>
              </div>
            </div>
            )}
          </div>

          {/* Banner de Info */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800">
            <Info className="w-5 h-5 text-[#139a6c] shrink-0" />
            <p className="text-xs font-medium">
              Las credenciales iniciales se entregan únicamente al administrador asignado.
            </p>
          </div>

          </fieldset>
          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
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
