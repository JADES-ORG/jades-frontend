import { AyudaCampo } from '../../components/shared/AyudaCampo';
import React, { useEffect, useState } from 'react';
import { actualizarConfiguracionTienda, consultarConfiguracionTienda } from '../../api/tiendas';
import { obtenerMensajeError } from '../../api/errores';
import type { ConfiguracionTiendaRequest, TiendaDetalleResponse, TiendaResumenResponse } from '../../types/tiendas';

interface StoreConfiguracionPageProps {
  tienda: TiendaResumenResponse;
  correoUsuario: string;
  onActualizar: (tienda: TiendaDetalleResponse) => void;
}

function datosFormulario(t: TiendaDetalleResponse): ConfiguracionTiendaRequest {
  return { nombreTienda: t.nombreTienda, giroDeNegocio: t.giroDeNegocio,
    telefonoTienda: t.telefonoTienda, correoTienda: t.correoTienda };
}

export const StoreConfiguracionPage: React.FC<StoreConfiguracionPageProps> = ({ tienda, correoUsuario, onActualizar }) => {
  const [detalle, setDetalle] = useState<TiendaDetalleResponse | null>(null);
  const [formulario, setFormulario] = useState<ConfiguracionTiendaRequest | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError(null);
    setAviso(null);
    setDetalle(null);
    setFormulario(null);
    consultarConfiguracionTienda(tienda.idTienda, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setDetalle(data);
      setFormulario(datosFormulario(data));
      onActualizar(data);
    }).catch(e => {
      if (!controller.signal.aborted) setError(obtenerMensajeError(e));
    }).finally(() => {
      if (!controller.signal.aborted) setCargando(false);
    });
    return () => controller.abort();
  }, [tienda.idTienda, recarga, onActualizar]);

  const activa = detalle?.estadoTienda === 'ACTIVO' && tienda.estadoTienda === 'ACTIVO';
  const cambiar = (campo: keyof ConfiguracionTiendaRequest, valor: string) => setFormulario(prev => prev && ({ ...prev, [campo]: valor }));
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activa || !formulario || cargando || guardando) return;
    setError(null);
    setAviso(null);
    if (!formulario.nombreTienda.trim() || !formulario.giroDeNegocio.trim()) {
      setError('Ingresa el nombre comercial y el giro del negocio.');
      return;
    }
    setGuardando(true);
    try {
      const data = await actualizarConfiguracionTienda(tienda.idTienda, {
        nombreTienda: formulario.nombreTienda.trim(), giroDeNegocio: formulario.giroDeNegocio.trim(),
        telefonoTienda: formulario.telefonoTienda?.trim() || null, correoTienda: formulario.correoTienda?.trim() || null,
      });
      setDetalle(data);
      setFormulario(datosFormulario(data));
      onActualizar(data);
      setAviso('Cambios guardados correctamente.');
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Configuración del negocio</h2>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {cargando && <p role="status" className="text-xs text-slate-500">Cargando configuración...</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {aviso && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">{aviso}</p>}
        {!activa && detalle && <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">Tienda inactiva: los datos son de solo lectura. Solo el administrador del sistema puede reactivarla.</p>}
        {detalle && formulario && <form onSubmit={guardar} className="space-y-6">
          <fieldset disabled={!activa || guardando} className="grid grid-cols-1 sm:grid-cols-2 gap-5 disabled:opacity-70">
            <div>
              <div className="flex items-baseline gap-1"><label htmlFor="config-nombre" className="text-sm font-semibold">Nombre comercial</label><AyudaCampo etiqueta="Nombre comercial" texto="Nombre que identifica tu tienda en JADES." /></div>
              <input id="config-nombre" required maxLength={120} value={formulario.nombreTienda} onChange={e => cambiar('nombreTienda', e.target.value)} className="mt-1 w-full px-3.5 min-h-11 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <div className="flex items-baseline gap-1"><label htmlFor="config-giro" className="text-sm font-semibold">Tipo de negocio</label><AyudaCampo etiqueta="Tipo de negocio" texto="Actividad principal del establecimiento." /></div>
              <input id="config-giro" required maxLength={50} value={formulario.giroDeNegocio} onChange={e => cambiar('giroDeNegocio', e.target.value)} className="mt-1 w-full px-3.5 min-h-11 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <div className="flex items-baseline gap-1"><label htmlFor="config-telefono" className="text-sm font-semibold">Teléfono del negocio</label><AyudaCampo etiqueta="Teléfono del negocio" texto="Número que los clientes pueden usar para contactar al negocio." /></div>
              <input id="config-telefono" type="tel" maxLength={15} value={formulario.telefonoTienda ?? ''} onChange={e => cambiar('telefonoTienda', e.target.value)} className="mt-1 w-full px-3.5 min-h-11 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <div className="flex items-baseline gap-1"><label htmlFor="config-correo" className="text-sm font-semibold">Correo del negocio</label><AyudaCampo etiqueta="Correo del negocio" texto="Correo de contacto público de la tienda. El correo de acceso se gestiona por separado." /></div>
              <input id="config-correo" type="email" maxLength={150} value={formulario.correoTienda ?? ''} onChange={e => cambiar('correoTienda', e.target.value)} className="mt-1 w-full px-3.5 min-h-11 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
            </div>
          </fieldset>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 pt-4">
            {[
              ['Documento del negocio', detalle.documentoTienda], ['Razón social', detalle.razonSocial],
              ['Dirección', detalle.direccion], ['Correo de acceso del administrador', correoUsuario],
              ['Estado', detalle.estadoTienda === 'ACTIVO' ? 'Activo' : 'Inactivo'],
            ].map(([label, value]) => <label key={label} className="block text-xs font-semibold text-slate-700">{label}
              <input readOnly value={value} className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </label>)}
          </div>
          <AyudaCampo etiqueta="los datos de solo lectura" texto="El administrador del sistema actualiza los datos legales del establecimiento y gestiona las cuentas de acceso." />
          {activa && <div className="pt-4 flex justify-end">
            <button type="submit" disabled={guardando} className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold rounded-xl disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>}
        </form>}
        <button type="button" disabled={cargando || guardando} onClick={() => setRecarga(n => n + 1)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50">Actualizar datos</button>
      </div>
    </div>
  );
};
