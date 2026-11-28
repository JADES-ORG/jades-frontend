import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
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
    if (!archivo && (mode === 'nuevo' || !initialData?.imagenProducto)) {
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
      estado: initialData?.estado ?? 'Activo',
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'nuevo' ? 'Nuevo producto o servicio' : mode === 'detalle' ? 'Detalle de producto o servicio' : 'Editar producto o servicio'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Define los datos y modalidades disponibles para ventas a crédito.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={guardando}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          <fieldset disabled={guardando || mode === 'detalle'} className="space-y-6">
          {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              INFORMACIÓN GENERAL
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre comercial"
                  maxLength={150}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nombre comercial del producto o servicio.
                </p>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo
                </label>
                <div className="relative">
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'Producto' | 'Servicio')}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] cursor-pointer"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Producto físico o servicio prestado.
                </p>
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Opcional"
                  disabled={tipo === 'Servicio'}
                  maxLength={150}
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Opcional cuando corresponda.
                </p>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  placeholder="Opcional"
                  disabled={tipo === 'Servicio'}
                  maxLength={100}
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Opcional; no aplica a todos los servicios.
                </p>
              </div>

              {/* Unidad de medida */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidad de medida
                </label>
                <div className="relative">
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] cursor-pointer"
                  >
                    {Object.entries(UNIDADES_PRODUCTO).map(([codigo, etiqueta]) => <option key={codigo} value={etiqueta}>{etiqueta}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Unidad usada en el detalle de venta.
                </p>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado
                </label>
                <div className="relative">
                  <select
                    value={initialData?.estado ?? 'Activo'}
                    disabled
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Inactivo impide agregarlo a nuevas ventas.
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Selección de productos para el hogar"
                  maxLength={500}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Características que permiten identificarlo.
                </p>
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Imagen
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-[#139a6c] rounded-xl p-2.5 flex items-center justify-center text-blue-600 hover:text-emerald-700 text-xs font-semibold cursor-pointer transition bg-slate-50/50">
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
                <p className="text-[10px] text-slate-400 mt-1">
                  PNG o JPEG, máximo 5 MB. Obligatoria al registrar.
                </p>
                {preview ? <img src={preview} alt="Vista previa" className="mt-2 h-24 w-24 rounded-xl object-cover" /> : initialData?.id && initialData.imagenProducto ? <ImagenProducto idTienda={idTienda} idProducto={initialData.id} imagen={initialData.imagenProducto} nombre={initialData.nombre} className="mt-2 h-24 w-24 rounded-xl object-cover" /> : null}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PRECIOS Y CRÉDITO */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              PRECIOS Y CRÉDITO
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio contado */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio contado
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                    S/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="00.00"
                    value={precioContado}
                    onChange={(e) => setPrecioContado(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Precio si se paga al contado.
                </p>
              </div>

              {/* Precio de lista / crédito */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio de lista / crédito
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                    S/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="00.00"
                    value={precioCredito}
                    onChange={(e) => setPrecioCredito(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Capital unitario usado en la venta a crédito.
                </p>
              </div>

              {([
                ['Precio contado USD (opcional)', contadoUsd, setContadoUsd],
                ['Precio crédito USD (opcional)', creditoUsd, setCreditoUsd],
              ] as const).map(([label, valor, cambiar]) => <label key={label} className="block text-xs font-semibold text-slate-700">
                {label}
                <input type="text" inputMode="decimal" maxLength={19} value={valor} onChange={e => cambiar(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 px-3" />
              </label>)}

              {/* Modalidades permitidas */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modalidades permitidas
                </label>
                <div className="relative">
                  <select
                    value={modalidad}
                    onChange={(e) => setModalidad(e.target.value as 'Ambas modalidades' | 'Pago único' | 'En meses')}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] cursor-pointer"
                  >
                    <option value="Ambas modalidades">Ambas modalidades</option>
                    <option value="Pago único">Pago único</option>
                    <option value="En meses">En meses</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pago único por ciclo, en meses o ambos.
                </p>
              </div>
            </div>
          </div>

          </fieldset>
          {/* Footer Botones */}
          {mode !== 'detalle' && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              {guardando ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
          )}
        </form>
      </div>
    </div>
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
    : <span className={`${className ?? ''} flex items-center justify-center bg-slate-100 text-[9px] text-slate-500 text-center`}>Sin imagen</span>;
}
