import { ModalShell, cuerpoModal } from '../store-admin/ModalShell';
import { AyudaCampo } from '../shared/AyudaCampo';
import { ConfirmarEstado } from '../shared/ConfirmarEstado';
import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { actualizarTienda, consultarTienda, desactivarTienda, reactivarTienda } from '../../api/tiendas';
import { obtenerMensajeError } from '../../api/errores';
import type { ActualizarTiendaRequest, TiendaDetalleResponse } from '../../types/tiendas';

interface EditarTiendaModalProps {
  isOpen: boolean;
  tienda: TiendaDetalleResponse;
  onClose: () => void;
  onSave: (tiendaActualizada: TiendaDetalleResponse, mensaje: string) => void;
}

function datosFormulario(t: TiendaDetalleResponse): ActualizarTiendaRequest {
  return {
    nombreTienda: t.nombreTienda, razonSocial: t.razonSocial, documentoTienda: t.documentoTienda,
    giroDeNegocio: t.giroDeNegocio, direccion: t.direccion, telefonoTienda: t.telefonoTienda, correoTienda: t.correoTienda,
  };
}

export const EditarTiendaModal: React.FC<EditarTiendaModalProps> = ({ isOpen, tienda, onClose, onSave }) => {
  const [detalle, setDetalle] = useState(tienda);
  const [formulario, setFormulario] = useState(() => datosFormulario(tienda));
  const [cargando, setCargando] = useState(true);
  const [confirmar, setConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const [consultado, setConsultado] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setConsultado(false);
    setError(null);
    consultarTienda(tienda.idTienda, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setDetalle(data);
      setFormulario(datosFormulario(data));
      setConsultado(true);
    }).catch(e => {
      if (!controller.signal.aborted) setError(obtenerMensajeError(e));
    }).finally(() => {
      if (!controller.signal.aborted) setCargando(false);
    });
    return () => controller.abort();
  }, [tienda.idTienda, recarga]);

  if (!isOpen) return null;
  const activa = detalle.estadoTienda === 'ACTIVO';
  const bloqueado = guardando || cargando || !consultado;
  const cambiar = (campo: keyof ActualizarTiendaRequest, valor: string) => setFormulario(prev => ({ ...prev, [campo]: valor }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado || !activa) return;
    setError(null);
    if (!formulario.nombreTienda.trim() || !formulario.razonSocial.trim() || !formulario.giroDeNegocio.trim() ||
        !formulario.direccion.trim() || !/^\d{11}$/.test(formulario.documentoTienda.trim())) {
      setError('Completa los datos obligatorios y el documento de 11 dígitos.');
      return;
    }
    setGuardando(true);
    try {
      const actualizada = await actualizarTienda(detalle.idTienda, {
        nombreTienda: formulario.nombreTienda.trim(), razonSocial: formulario.razonSocial.trim(),
        documentoTienda: formulario.documentoTienda.trim(), giroDeNegocio: formulario.giroDeNegocio.trim(),
        direccion: formulario.direccion.trim(), telefonoTienda: formulario.telefonoTienda?.trim() || null,
        correoTienda: formulario.correoTienda?.trim() || null,
      });
      onSave(actualizada, 'Datos de la tienda actualizados correctamente.');
      onClose();
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async () => {
    if (bloqueado) return;
    setError(null);
    setGuardando(true);
    try {
      const resultado = activa ? await desactivarTienda(detalle.idTienda) : await reactivarTienda(detalle.idTienda);
      onSave({ ...detalle, estadoTienda: resultado.estadoTienda }, activa ? 'Tienda desactivada correctamente.' : 'Tienda reactivada correctamente.');
      onClose();
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const campos: { campo: keyof ActualizarTiendaRequest; etiqueta: string; ayuda: string; max: number; required?: boolean; tipo?: string }[] = [
    { campo: 'nombreTienda', etiqueta: 'Nombre comercial', ayuda: 'Nombre con el que se identifica el negocio.', max: 120, required: true },
    { campo: 'razonSocial', etiqueta: 'Razón social o responsable', ayuda: 'Nombre legal del negocio o de su responsable.', max: 150, required: true },
    { campo: 'giroDeNegocio', etiqueta: 'Tipo / giro del negocio', ayuda: 'Actividad principal del establecimiento.', max: 50, required: true },
    { campo: 'telefonoTienda', etiqueta: 'Teléfono', ayuda: 'Número de contacto de la tienda.', max: 15 },
    { campo: 'direccion', etiqueta: 'Dirección', ayuda: 'Ubicación del establecimiento.', max: 200, required: true },
    { campo: 'correoTienda', etiqueta: 'Correo del negocio', ayuda: 'Correo de contacto del establecimiento.', max: 150, tipo: 'email' },
    { campo: 'documentoTienda', etiqueta: 'Documento del negocio', ayuda: 'Ingresa los 11 dígitos del RUC del establecimiento.', max: 11, required: true },
  ];

  if (confirmar) return <ConfirmarEstado titulo={activa ? 'Desactivar tienda' : 'Reactivar tienda'}
    descripcion={activa ? `${detalle.nombreTienda} seguirá disponible para consultas y cobros pendientes.` : `${detalle.nombreTienda} volverá a permitir nuevas ventas y modificaciones.`}
    accion={activa ? 'Desactivar' : 'Reactivar'} guardando={guardando} error={error}
    onCancelar={() => { setError(null); setConfirmar(false); }} onConfirmar={() => void cambiarEstado()} />;

  return (
    <ModalShell titulo="Editar tienda" descripcion="Datos generales, administradores asignados y estado." onClose={onClose} bloqueado={guardando} ancho="normal">
      <form onSubmit={handleSubmit} className={cuerpoModal}>
          {cargando && <p role="status" className="text-xs text-slate-500">Consultando tienda...</p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error} {!consultado && <button type="button" onClick={() => setRecarga(n => n + 1)} className="underline font-semibold">Reintentar</button>}</p>}
          <fieldset disabled={bloqueado || !activa} className="grid grid-cols-1 sm:grid-cols-2 gap-4 disabled:opacity-70">
            {campos.map(({ campo, etiqueta, ayuda, max, required, tipo }) => (
              <div key={campo}>
                <div className="flex items-baseline gap-1"><label htmlFor={campo} className="text-sm font-semibold">{etiqueta}</label><AyudaCampo etiqueta={etiqueta} texto={ayuda} /></div>
                <input id={campo} type={tipo || 'text'} required={required} maxLength={max} pattern={campo === 'documentoTienda' ? '[0-9]{11}' : undefined} inputMode={campo === 'documentoTienda' ? 'numeric' : undefined}
                  value={formulario[campo] ?? ''} onChange={e => cambiar(campo, e.target.value)} className="mt-1 w-full px-3.5 min-h-11 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] outline-none" />
              </div>
            ))}
            <label className="block text-xs font-bold text-slate-700">Estado actual
              <input readOnly value={activa ? 'Activo' : 'Inactivo'} className="mt-1 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" />
            </label>
          </fieldset>
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase text-slate-400">Administradores asignados</h4>
            {detalle.administradores.length ? detalle.administradores.map(a => (
              <div key={a.idUsuario} className="rounded-xl border border-slate-200 p-3 text-xs">
                <p className="font-semibold text-slate-800">{a.nombreUsuario} · {a.activo ? 'Activo' : 'Inactivo'}</p>
                <p className="text-slate-600">{a.correoUsuario} · {a.telefonoUsuario || 'Sin teléfono'}</p>
              </div>
            )) : <p className="text-xs text-slate-500">No hay administradores vinculados.</p>}
            <p className="text-xs text-slate-500">Las credenciales y los datos de los administradores no se modifican desde este formulario.</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-emerald-800">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-xs">{activa ? 'Al desactivar se impiden nuevas ventas y modificaciones, pero se conservan las consultas y cobranzas.' : 'Los administradores asignados pueden consultar y cobrar deudas existentes. Reactiva la tienda para editar sus datos.'}</p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-3">
            <button type="button" disabled={bloqueado} onClick={() => { setError(null); setConfirmar(true); }} className={`min-h-11 px-5 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 ${activa ? 'bg-red-600 hover:bg-red-700' : 'bg-[#139a6c]'}`}>{activa ? 'Desactivar tienda' : 'Reactivar tienda'}</button>
            <button type="button" disabled={guardando} onClick={onClose} className="min-h-11 px-5 py-2 border border-slate-200 rounded-xl text-sm font-semibold">Cancelar</button>
            {activa && <button type="submit" disabled={bloqueado} className="min-h-11 px-5 py-2 rounded-xl text-white bg-[#139a6c] text-xs font-semibold disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar cambios'}</button>}
          </div>
        </form>
    </ModalShell>
  );
};
