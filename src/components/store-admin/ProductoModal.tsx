import { ModalShell, cuerpoModal } from './ModalShell';
import { AyudaCampo } from '../shared/AyudaCampo';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { consultarImagenProducto } from '../../api/productos';
import { obtenerMensajeError } from '../../api/errores';
import { UNIDADES_PRODUCTO } from '../../types/productos';

export interface ProductoData {
  id?: number;
  nombre: string;
  tipo: 'Producto' | 'Servicio';
  proveedor?: string;
  marca: string;
  unidad: string;
  estado: 'Activo' | 'Inactivo';
  descripcion?: string;
  precioContado: number;
  precioCredito: number;
  precioContadoUsd: number | null;
  precioCreditoUsd: number | null;
  modalidad: 'Ambas modalidades' | 'Pago único' | 'En meses';
  imagenProducto?: string | null;
}

interface ProductoModalProps {
  isOpen: boolean;
  mode: 'nuevo' | 'editar' | 'detalle';
  initialData?: ProductoData | null;
  onClose: () => void;
  idTienda: number;
  onSave: (data: ProductoData, archivo?: File) => Promise<void>;
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  idTienda,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'Producto' | 'Servicio'>('Producto');
  const [proveedor, setProveedor] = useState('');
  const [marca, setMarca] = useState('');
  const [unidad, setUnidad] = useState('Unidad');
  const [estado, setEstado] = useState<ProductoData['estado']>('Activo');

  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File>();
  const [preview, setPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [precioContado, setPrecioContado] = useState('');
  const [precioCredito, setPrecioCredito] = useState('');
  const [contadoUsd, setContadoUsd] = useState('');
  const [creditoUsd, setCreditoUsd] = useState('');
  const [modalidad, setModalidad] = useState<'Ambas modalidades' | 'Pago único' | 'En meses'>('Ambas modalidades');

  useEffect(() => {
    if (isOpen) {
      setArchivo(undefined);
      setError(null);
      if (mode !== 'nuevo' && initialData) {
        setNombre(initialData.nombre || '');
        setTipo(initialData.tipo || 'Producto');
        setProveedor(initialData.proveedor || '');
        setMarca(initialData.marca || '');
        setUnidad(initialData.unidad || 'Unidad');
        setEstado(initialData.estado);
        setDescripcion(initialData.descripcion || '');
        setPrecioContado(initialData.precioContado !== undefined ? initialData.precioContado.toFixed(2) : '00.00');
        setPrecioCredito(initialData.precioCredito !== undefined ? initialData.precioCredito.toFixed(2) : '00.00');
        setContadoUsd(initialData.precioContadoUsd?.toFixed(2) ?? '');
        setCreditoUsd(initialData.precioCreditoUsd?.toFixed(2) ?? '');
        setModalidad(initialData.modalidad || 'Ambas modalidades');
      } else {
        // Reset para nuevo producto
        setNombre('');
        setTipo('Producto');
        setProveedor('');
        setMarca('');
        setUnidad('Unidad');
        setEstado('Activo');
        setDescripcion('');
        setPrecioContado('00.00');
        setPrecioCredito('00.00');
        setContadoUsd('');
        setCreditoUsd('');
        setModalidad('Ambas modalidades');
      }
    }
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (!archivo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando || mode === 'detalle') return;
    setError(null);
    if (!nombre.trim() || !/^\d+(\.\d{1,2})?$/.test(precioContado) || !/^\d+(\.\d{1,2})?$/.test(precioCredito)
        || !Number.isFinite(Number(precioContado)) || !Number.isFinite(Number(precioCredito))
        || Number(precioContado) <= 0 || Number(precioCredito) <= 0) {
      setError('Ingresa el nombre y precios mayores a cero con hasta dos decimales.');
      return;
    }
    const preciosUsd = [contadoUsd, creditoUsd];
    if (preciosUsd.some(Boolean) && !preciosUsd.every(precio => /^\d{1,16}(\.\d{1,2})?$/.test(precio) && Number(precio) > 0)) {
      setError('Ingresa ambos precios en dólares con hasta dos decimales, o deja ambos campos vacíos.');
      return;
    }
    if (!archivo && mode === 'nuevo') {
      setError('Selecciona una imagen PNG o JPEG.');
      return;
    }
    setGuardando(true);
    try {
      await onSave({
      id: initialData?.id,
      nombre: nombre.trim(),
      tipo,
      proveedor: tipo === 'Producto' ? proveedor.trim() : '',
      marca: tipo === 'Producto' ? marca.trim() : '',
      unidad,
      estado,
      descripcion,
      precioContado: Number(precioContado),
      precioCredito: Number(precioCredito),
      precioContadoUsd: contadoUsd ? Number(contadoUsd) : null,
      precioCreditoUsd: creditoUsd ? Number(creditoUsd) : null,
      modalidad,
    }, archivo);
      onClose();
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalShell titulo={mode === 'nuevo' ? 'Nuevo producto o servicio' : mode === 'detalle' ? 'Detalle de producto o servicio' : 'Editar producto o servicio'} descripcion="Define los datos y modalidades disponibles para ventas a crédito." onClose={onClose} bloqueado={guardando} ancho="normal">
      <form onSubmit={handleSubmit} className={cuerpoModal}>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          <fieldset disabled={guardando || mode === 'detalle'} className="space-y-6">
          {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
          <div>
            <h4 className="text-xs font-semibold text-jades-muted uppercase tracking-wider mb-3">
              INFORMACIÓN GENERAL
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-nombre">Nombre</label><AyudaCampo etiqueta="Nombre" texto="Nombre comercial del producto o servicio." /></div>
                <input id="pc-nombre"
                  type="text"
                  required
                  placeholder="Nombre comercial"
                  maxLength={150}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary"
                />
              </div>

              {/* Tipo */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-tipo">Tipo</label><AyudaCampo etiqueta="Tipo" texto="Producto físico o servicio prestado." /></div>
                <div className="relative">
                  <select id="pc-tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'Producto' | 'Servicio')}
                    className="w-full appearance-none px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary cursor-pointer"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-jades-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-proveedor">Proveedor</label><AyudaCampo etiqueta="Proveedor" texto="Opcional cuando corresponda." /></div>
                <input id="pc-proveedor"
                  type="text"
                  placeholder="Opcional"
                  disabled={tipo === 'Servicio'}
                  maxLength={150}
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="w-full px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary"
                />
              </div>

              {/* Marca */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-marca">Marca</label><AyudaCampo etiqueta="Marca" texto="Opcional; no aplica a todos los servicios." /></div>
                <input id="pc-marca"
                  type="text"
                  placeholder="Opcional"
                  disabled={tipo === 'Servicio'}
                  maxLength={100}
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary"
                />
              </div>

              {/* Unidad de medida */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-unidad-de-medida">Unidad de medida</label><AyudaCampo etiqueta="Unidad de medida" texto="Unidad usada en el detalle de venta." /></div>
                <div className="relative">
                  <select id="pc-unidad-de-medida"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="w-full appearance-none px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary cursor-pointer"
                  >
                    {Object.entries(UNIDADES_PRODUCTO).map(([codigo, etiqueta]) => <option key={codigo} value={etiqueta}>{etiqueta}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-jades-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Estado */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-estado">Estado</label><AyudaCampo etiqueta="Estado" texto="Los nuevos registros se crean activos. En edición puedes cambiar el estado; un producto inactivo no estará disponible para nuevas ventas." /></div>
                <div className="relative">
                  <select id="pc-estado"
                    value={estado}
                    onChange={e => setEstado(e.target.value as ProductoData['estado'])}
                    disabled={mode === 'nuevo'}
                    className="w-full appearance-none px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-jades-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-descripcion">Descripción</label><AyudaCampo etiqueta="Descripción" texto="Características que permiten identificarlo." /></div>
                <input id="pc-descripcion"
                  type="text"
                  placeholder="Selección de productos para el hogar"
                  maxLength={500}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary"
                />
              </div>

              {/* Imagen */}
              <div>
                <div className="flex items-center gap-1"><span className="text-sm font-semibold">Imagen</span><AyudaCampo etiqueta="Imagen" texto="PNG o JPEG, máximo 5 MB. Obligatoria al registrar." /></div>
                <label className="border-2 border-dashed border-jades-line hover:border-jades-primary rounded-xl p-2.5 flex items-center justify-center text-blue-600 hover:text-emerald-700 text-xs font-semibold cursor-pointer transition bg-jades-subtle/50">
                  <input type="file" className="hidden" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(e) => {
                    const seleccion = e.target.files?.[0];
                    if (!seleccion) return;
                    if (!['image/png', 'image/jpeg'].includes(seleccion.type) || seleccion.size > 5 * 1024 * 1024 || seleccion.size === 0) {
                      setError('Selecciona una imagen PNG o JPEG de hasta 5 MB.');
                      e.target.value = '';
                      return;
                    }
                    setError(null);
                    setArchivo(seleccion);
                  }} />
                  <span>{archivo?.name ?? '+ Seleccionar imagen'}</span>
                </label>
                {preview ? <img src={preview} alt="Vista previa" className="mt-2 h-24 w-24 rounded-xl object-cover" /> : initialData?.id && initialData.imagenProducto ? <ImagenProducto idTienda={idTienda} idProducto={initialData.id} imagen={initialData.imagenProducto} nombre={initialData.nombre} className="mt-2 h-24 w-24 rounded-xl object-cover" /> : null}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PRECIOS Y CRÉDITO */}
          <div className="pt-2 border-t border-jades-line">
            <h4 className="text-xs font-semibold text-jades-muted uppercase tracking-wider mb-3">
              PRECIOS Y CRÉDITO
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio contado */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-precio-contado-pen-obligatorio">Precio contado PEN (obligatorio)</label><AyudaCampo etiqueta="Precio contado PEN (obligatorio)" texto="Precio si se paga al contado." /></div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-jades-muted font-medium">
                    S/
                  </span>
                  <input id="pc-precio-contado-pen-obligatorio"
                    type="text"
                    required
                    placeholder="00.00"
                    value={precioContado}
                    onChange={(e) => setPrecioContado(e.target.value)}
                    className="w-full pl-9 pr-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary"
                  />
                </div>
              </div>

              {/* Precio de lista / crédito */}
              <div>
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-precio-credito-pen-obligatorio">Precio crédito PEN (obligatorio)</label><AyudaCampo etiqueta="Precio crédito PEN (obligatorio)" texto="Capital unitario usado en la venta a crédito." /></div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-jades-muted font-medium">
                    S/
                  </span>
                  <input id="pc-precio-credito-pen-obligatorio"
                    type="text"
                    required
                    placeholder="00.00"
                    value={precioCredito}
                    onChange={(e) => setPrecioCredito(e.target.value)}
                    className="w-full pl-9 pr-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary"
                  />
                </div>
              </div>

              {([
                ['Precio contado USD (opcional)', contadoUsd, setContadoUsd],
                ['Precio crédito USD (opcional)', creditoUsd, setCreditoUsd],
              ] as const).map(([label, valor, cambiar], indice) => <div key={label}>
                <div className="flex items-baseline gap-1"><label htmlFor={`precio-usd-${indice}`} className="text-sm font-semibold">{label}</label><AyudaCampo etiqueta={label} texto="Opcional. Completa este precio si el artículo se podrá vender en dólares con esta modalidad." /></div>
                <input id={`precio-usd-${indice}`} type="text" inputMode="decimal" maxLength={19} value={valor} onChange={e => cambiar(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-jades-line px-3" />
              </div>)}

              {/* Modalidades permitidas */}
              <div className="sm:col-span-1">
                <div className="mb-1 flex items-baseline gap-1"><label className="text-sm font-semibold text-slate-700" htmlFor="pc-modalidades-permitidas">Modalidades permitidas</label><AyudaCampo etiqueta="Modalidades permitidas" texto="Pago único por ciclo, en meses o ambos." /></div>
                <div className="relative">
                  <select id="pc-modalidades-permitidas"
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as 'Ambas modalidades' | 'Pago único' | 'En meses')}
                    className="w-full appearance-none px-3.5 min-h-11 py-2 bg-white border border-jades-line rounded-lg text-sm text-jades-ink focus:outline-none focus:border-jades-primary focus:ring-1 focus:ring-jades-primary cursor-pointer"
                  >
                    <option value="Ambas modalidades">Ambas modalidades</option>
                    <option value="Pago único">Pago único</option>
                    <option value="En meses">En meses</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-jades-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          </fieldset>
          {/* Footer Botones */}
          {mode !== 'detalle' && (
          <div className="pt-4 border-t border-jades-line flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="min-h-11 px-5 py-2 border border-jades-line text-slate-700 hover:bg-jades-subtle text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="min-h-11 px-5 py-2 bg-jades-primary hover:bg-jades-hover active:bg-jades-active text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              {guardando ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
          )}
        </form>
    </ModalShell>
  );
};

export function ImagenProducto({ idTienda, idProducto, imagen, nombre, className }: {
  idTienda: number;
  idProducto: number;
  imagen: string;
  nombre: string;
  className?: string;
}) {
  const [resultado, setResultado] = useState<{ imagen: string; url: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let url: string | undefined;
    setResultado(null);
    consultarImagenProducto(idTienda, idProducto, imagen, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setResultado({ imagen, url });
    }).catch(() => {
      if (!controller.signal.aborted) setResultado(null);
    });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [idTienda, idProducto, imagen]);

  return resultado?.imagen === imagen
    ? <img src={resultado.url} alt={nombre} className={className} />
    : <span className={`${className ?? ''} flex items-center justify-center bg-slate-100 text-[9px] text-jades-muted text-center`}>Sin imagen</span>;
}
