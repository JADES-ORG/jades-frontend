import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

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
  modalidad: 'Ambas modalidades' | 'Pago único' | 'En meses';
}

interface ProductoModalProps {
  isOpen: boolean;
  mode: 'nuevo' | 'editar';
  initialData?: ProductoData | null;
  onClose: () => void;
  onSave: (data: ProductoData) => void;
}

export const ProductoModal: React.FC<ProductoModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'Producto' | 'Servicio'>('Producto');
  const [proveedor, setProveedor] = useState('');
  const [marca, setMarca] = useState('');
  const [unidad, setUnidad] = useState('Unidad');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [descripcion, setDescripcion] = useState('Selección de productos para el hogar');
  const [precioContado, setPrecioContado] = useState('');
  const [precioCredito, setPrecioCredito] = useState('');
  const [modalidad, setModalidad] = useState<'Ambas modalidades' | 'Pago único' | 'En meses'>('Ambas modalidades');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'editar' && initialData) {
        setNombre(initialData.nombre || '');
        setTipo(initialData.tipo || 'Producto');
        setProveedor(initialData.proveedor || '');
        setMarca(initialData.marca || '');
        setUnidad(initialData.unidad || 'Unidad');
        setEstado(initialData.estado || 'Activo');
        setDescripcion(initialData.descripcion || 'Selección de productos para el hogar');
        setPrecioContado(initialData.precioContado !== undefined ? initialData.precioContado.toFixed(2) : '00.00');
        setPrecioCredito(initialData.precioCredito !== undefined ? initialData.precioCredito.toFixed(2) : '00.00');
        setModalidad(initialData.modalidad || 'Ambas modalidades');
      } else {
        // Reset para nuevo producto
        setNombre('');
        setTipo('Producto');
        setProveedor('');
        setMarca('');
        setUnidad('Unidad');
        setEstado('Activo');
        setDescripcion('Selección de productos para el hogar');
        setPrecioContado('00.00');
        setPrecioCredito('00.00');
        setModalidad('Ambas modalidades');
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      nombre: nombre || 'Producto sin nombre',
      tipo,
      proveedor,
      marca: marca || '—',
      unidad,
      estado,
      descripcion,
      precioContado: parseFloat(precioContado) || 0,
      precioCredito: parseFloat(precioCredito) || 0,
      modalidad,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'nuevo' ? 'Nuevo producto o servicio' : 'Editar producto o servicio'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Define los datos y modalidades disponibles para ventas a crédito.
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
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
                    <option value="Unidad">Unidad</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Servicio">Servicio</option>
                    <option value="Sesión">Sesión</option>
                    <option value="Kilo (kg)">Kilo (kg)</option>
                    <option value="Litro (L)">Litro (L)</option>
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
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'Activo' | 'Inactivo')}
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
                  <input type="file" className="hidden" accept="image/*" />
                  <span>+ Seleccionar imagen</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Foto del producto o imagen representativa del servicio.
                </p>
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

          {/* Footer Botones */}
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
              Guardar producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
