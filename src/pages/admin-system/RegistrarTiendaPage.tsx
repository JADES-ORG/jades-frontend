import { AyudaCampo } from '../../components/shared/AyudaCampo';
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
    <div className="space-y-[18px]">
      <div>
        <h2 className="text-xl font-bold text-jades-ink tracking-tight">
          Registrar nueva tienda
        </h2>
        <p className="text-xs text-jades-muted mt-1">
          Crea un espacio independiente y asigna a su Administrador del negocio.
        </p>
      </div>

      <div className="bg-white rounded-[13px] border border-jades-line p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          <fieldset disabled={isLoading} className="space-y-8">
          {/* SECCIÓN 1: DATOS DE LA TIENDA */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-jades-muted mb-4">
              DATOS DE LA TIENDA
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-nombre-comercial">Nombre comercial</label><AyudaCampo etiqueta="Nombre comercial" texto="Nombre con el que se identifica el negocio." /></div>
                <input id="rt-nombre-comercial"
                  type="text"
                  required
                  maxLength={120}
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  placeholder="Bodega San Blas"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-razon-social-o-responsable">Razón social o responsable</label><AyudaCampo etiqueta="Razón social o responsable" texto="Responsable legal o razón social." /></div>
                <input id="rt-razon-social-o-responsable"
                  type="text"
                  required
                  maxLength={150}
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Luis Alvarez"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-tipo-giro-del-negocio">Tipo / giro del negocio</label><AyudaCampo etiqueta="Tipo / giro del negocio" texto="Selecciona el giro principal del establecimiento." /></div>
                <select id="rt-tipo-giro-del-negocio"
                  value={giro}
                  onChange={(e) => setGiro(e.target.value)}
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none cursor-pointer"
                >
                  <option value="Bodega">Bodega</option>
                  <option value="Panadería">Panadería</option>
                  <option value="Carnicería">Carnicería</option>
                  <option value="Peluquería">Peluquería</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Minimarket">Minimarket</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-telefono">Teléfono</label><AyudaCampo etiqueta="Teléfono" texto="Número de contacto de la tienda." /></div>
                <input id="rt-telefono"
                  type="text"
                  maxLength={15}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-direccion">Dirección</label><AyudaCampo etiqueta="Dirección" texto="Ubicación del establecimiento." /></div>
                <input id="rt-direccion"
                  type="text"
                  required maxLength={200}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Cusco, Perú"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-correo">Correo</label><AyudaCampo etiqueta="Correo" texto="Correo de contacto del negocio." /></div>
                <input id="rt-correo"
                  type="email"
                  maxLength={150}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="contacto@ejemplo.com"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-estado">Estado</label><AyudaCampo etiqueta="Estado" texto="Las tiendas nuevas se registran activas." /></div>
                <input id="rt-estado" type="text" value="Activo" readOnly className="w-full px-4 py-3 text-xs bg-jades-subtle border border-jades-line rounded-xl" />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-documento-del-negocio">Documento del negocio</label><AyudaCampo etiqueta="Documento del negocio" texto="Número tributario o identificación del establecimiento." /></div>
                <input id="rt-documento-del-negocio"
                  type="text"
                  required maxLength={11} minLength={11} inputMode="numeric" pattern="[0-9]{11}"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ingresa el documento"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ADMINISTRADOR DEL NEGOCIO */}
          <div className="pt-6 border-t border-jades-line">
            <p className="text-[11px] font-bold uppercase tracking-wider text-jades-muted mb-4">
              ADMINISTRADOR DEL NEGOCIO
            </p>

            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              <label><input type="radio" name="tipoAdmin" checked={!existente} onChange={() => setExistente(false)} /> Crear administrador</label>
              <label><input type="radio" name="tipoAdmin" checked={existente} onChange={() => { setLista(null); setExistente(true); }} /> Usar administrador existente</label>
            </div>
            {existente ? (
              <div className="grid max-w-md gap-2 text-sm font-medium">
                <div className="flex items-baseline gap-1"><label htmlFor="rt-admin-existente">Administrador de negocio</label><AyudaCampo etiqueta="Administrador de negocio" texto="Selecciona un administrador activo que ya tenga una cuenta en JADES." /></div>
                <select id="rt-admin-existente" required disabled={!lista || !!lista.error} value={idAdministrador} onChange={e => setIdAdministrador(e.target.value)} className="min-h-11 rounded-lg border border-jades-line bg-white px-3">
                  <option value="">{lista ? 'Selecciona un administrador' : 'Cargando administradores…'}</option>
                  {lista?.datos.map(admin => <option value={admin.idUsuario} key={admin.idUsuario}>{admin.nombreUsuario} · {admin.correoUsuario}</option>)}
                </select>
                {lista?.error && <span role="alert" className="text-red-700">{lista.error} <button type="button" className="font-semibold underline" onClick={() => { setLista(null); setIntento(n => n + 1); }}>Reintentar</button></span>}
                {lista && !lista.error && !lista.datos.length && <span>No hay administradores activos disponibles.</span>}
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-nombre-completo">Nombre completo</label><AyudaCampo etiqueta="Nombre completo" texto="Persona que administrará esta tienda." /></div>
                <input id="rt-nombre-completo"
                  type="text"
                  required
                  maxLength={200}
                  value={adminNombre}
                  onChange={(e) => setAdminNombre(e.target.value)}
                  placeholder="Luis Alvarez"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-correo-de-acceso">Correo de acceso</label><AyudaCampo etiqueta="Correo de acceso" texto="Usuario asignado a esta tienda." /></div>
                <input id="rt-correo-de-acceso"
                  type="email"
                  required
                  maxLength={150}
                  value={adminCorreo}
                  onChange={(e) => setAdminCorreo(e.target.value)}
                  placeholder="luis@ejemplo.com"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-contrasena-inicial">Contraseña inicial</label><AyudaCampo etiqueta="Contraseña inicial" texto="Mínimo 12 caracteres; máximo 72 bytes." /></div>
                <input id="rt-contrasena-inicial"
                  type="password"
                  required
                  minLength={12} maxLength={72} autoComplete="new-password"
                  value={adminContrasena}
                  onChange={(e) => setAdminContrasena(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 text-sm text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="rt-telefono-del-administrador">Teléfono del administrador</label><AyudaCampo etiqueta="Teléfono del administrador" texto="Contacto del responsable de la cuenta." /></div>
                <input id="rt-telefono-del-administrador"
                  type="text"
                  maxLength={15}
                  value={adminTelefono}
                  onChange={(e) => setAdminTelefono(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full px-4 py-3 text-xs text-jades-ink bg-white border border-jades-line rounded-xl focus:border-jades-primary focus:ring-1 focus:ring-jades-primary outline-none"
                />
              </div>
            </div>
            )}
          </div>

          {/* Banner de Info */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 flex items-center space-x-3 text-emerald-800">
            <Info className="w-5 h-5 text-jades-primary shrink-0" />
            <p className="text-xs font-medium">
              Las credenciales iniciales se entregan únicamente al administrador asignado.
            </p>
          </div>

          </fieldset>
          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-jades-line flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2.5 border border-jades-line text-slate-700 hover:bg-jades-subtle text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-jades-primary hover:bg-jades-hover active:bg-jades-active disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              {isLoading ? 'Registrando...' : 'Registrar tienda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
