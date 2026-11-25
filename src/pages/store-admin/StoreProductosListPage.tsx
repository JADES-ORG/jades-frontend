import React, { useState } from 'react';
import { Plus, Search, ChevronDown, Package, ExternalLink } from 'lucide-react';
import type { ProductoData } from '../../components/store-admin/ProductoModal';

export const initialProductos: ProductoData[] = [
  {
    id: 1,
    nombre: 'Canasta de abarrotes',
    tipo: 'Producto',
    proveedor: 'Distribuidora Central',
    marca: 'Selección San Blas',
    unidad: 'Unidad',
    precioContado: 78.00,
    precioCredito: 85.00,
    modalidad: 'Ambas modalidades',
    estado: 'Activo',
    descripcion: 'Selección de productos para el hogar',
  },
  {
    id: 2,
    nombre: 'Pack cuidado personal',
    tipo: 'Producto',
    proveedor: 'Distribuidora Vida',
    marca: 'Vida',
    unidad: 'Paquete',
    precioContado: 40.00,
    precioCredito: 45.00,
    modalidad: 'Ambas modalidades',
    estado: 'Activo',
    descripcion: 'Kit de aseo y cuidado básico',
  },
  {
    id: 3,
    nombre: 'Corte de cabello',
    tipo: 'Servicio',
    proveedor: '',
    marca: '—',
    unidad: 'Servicio',
    precioContado: 25.00,
    precioCredito: 30.00,
    modalidad: 'Pago único',
    estado: 'Activo',
    descripcion: 'Corte de cabello estilo clásico o moderno',
  },
  {
    id: 4,
    nombre: 'Masaje relajante',
    tipo: 'Servicio',
    proveedor: '',
    marca: '—',
    unidad: 'Sesión',
    precioContado: 70.00,
    precioCredito: 82.00,
    modalidad: 'En meses',
    estado: 'Activo',
    descripcion: 'Sesión terapéutica descontracturante',
  },
];

interface StoreProductosListPageProps {
  productos: ProductoData[];
  onNewProducto: () => void;
  onEditProducto: (producto: ProductoData) => void;
}

export const StoreProductosListPage: React.FC<StoreProductosListPageProps> = ({
  productos,
  onNewProducto,
  onEditProducto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');

  // Métricas calculadas dinámicamente
  const totalRegistrados = productos.length;
  const countProductos = productos.filter((p) => p.tipo === 'Producto').length;
  const countServicios = productos.filter((p) => p.tipo === 'Servicio').length;
  const countInactivos = productos.filter((p) => p.estado === 'Inactivo').length;

  const filtered = productos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      p.nombre.toLowerCase().includes(term) ||
      p.marca.toLowerCase().includes(term) ||
      (p.proveedor && p.proveedor.toLowerCase().includes(term));
    const matchTipo = tipoFilter === 'TODOS' || p.tipo === tipoFilter;
    return matchSearch && matchTipo;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado y botón Nuevo producto o servicio */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Productos y servicios
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Catálogo de conceptos disponibles para ventas a crédito.
          </p>
        </div>

        <button
          onClick={onNewProducto}
          className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo producto o servicio</span>
        </button>
      </div>

      {/* Tarjeta de Métricas (4 KPIs) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Total registrados</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalRegistrados}</p>
        </div>

        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Productos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{countProductos}</p>
        </div>

        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Servicios</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{countServicios}</p>
        </div>

        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Inactivos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{countInactivos}</p>
        </div>
      </div>

      {/* Contenedor de Tabla con Buscador y Filtro */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Buscador y Dropdown */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar nombre, marca o proveedor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full sm:w-44 appearance-none px-3.5 py-2 pr-9 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] cursor-pointer"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="Producto">Producto</option>
              <option value="Servicio">Servicio</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-6">PRODUCTO / SERVICIO</th>
                <th className="py-3 px-4">TIPO</th>
                <th className="py-3 px-4">MARCA</th>
                <th className="py-3 px-4">UNIDAD</th>
                <th className="py-3 px-4">CONTADO</th>
                <th className="py-3 px-4">CRÉDITO</th>
                <th className="py-3 px-4">MODALIDAD</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  {/* Nombre con icono representativo */}
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
                        {item.tipo === 'Producto' ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900">{item.nombre}</span>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="py-4 px-4 text-slate-600 font-normal">{item.tipo}</td>

                  {/* Marca */}
                  <td className="py-4 px-4 text-slate-600 font-normal">{item.marca}</td>

                  {/* Unidad */}
                  <td className="py-4 px-4 text-slate-600 font-normal">{item.unidad}</td>

                  {/* Contado */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.precioContado.toFixed(2)}
                  </td>

                  {/* Crédito */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.precioCredito.toFixed(2)}
                  </td>

                  {/* Modalidad */}
                  <td className="py-4 px-4 text-slate-600 font-normal">
                    {item.modalidad === 'Ambas modalidades' ? 'Ambas' : item.modalidad}
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.estado === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      • {item.estado}
                    </span>
                  </td>

                  {/* Botón Editar */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onEditProducto(item)}
                      className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No se encontraron productos o servicios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
