import React, { useEffect, useState } from 'react';
import { Plus, Search, ChevronDown, Package, ExternalLink } from 'lucide-react';
import { ImagenProducto, ProductoModal, type ProductoData } from '../../components/store-admin/ProductoModal';
import { actualizarProducto, desactivarProducto, listarProductos, registrarProducto } from '../../api/productos';
import { obtenerMensajeError } from '../../api/errores';
import { UNIDADES_PRODUCTO, type ProductoRequest, type ProductoResponse } from '../../types/productos';

function convertirProducto(p: ProductoResponse): ProductoData {
  return {
    id: p.id,
    nombre: p.nombreProducto,
    tipo: p.tipoProducto === 'SERVICIO' ? 'Servicio' : 'Producto',
    proveedor: p.proveedor ?? '',
    marca: p.marca ?? '',
    unidad: UNIDADES_PRODUCTO[p.unidadMedida as keyof typeof UNIDADES_PRODUCTO] ?? p.unidadMedida,
    precioContado: Number(p.precioContado),
    precioCredito: Number(p.precioCredito),
    modalidad: p.modalidad === 'UNICO' ? 'Pago único' : p.modalidad === 'MENSUAL' ? 'En meses' : 'Ambas modalidades',
    estado: p.estadoProducto === 'ACTIVO' ? 'Activo' : 'Inactivo',
    descripcion: p.descripcion ?? '',
    imagenProducto: p.imagenProducto,
  };
}

interface StoreProductosListPageProps {
  idTienda: number;
  soloConsulta: boolean;
}

export const StoreProductosListPage: React.FC<StoreProductosListPageProps> = ({ idTienda, soloConsulta }) => {
  const [productos, setProductos] = useState<ProductoData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const [modal, setModal] = useState<{ mode: 'nuevo' | 'editar'; producto?: ProductoData } | null>(null);
  const [desactivando, setDesactivando] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError(null);
    listarProductos(idTienda, false, controller.signal).then(data => {
      if (!controller.signal.aborted) setProductos(data.map(convertirProducto));
    }).catch(e => {
      if (!controller.signal.aborted) setError(obtenerMensajeError(e));
    }).finally(() => {
      if (!controller.signal.aborted) setCargando(false);
    });
    return () => controller.abort();
  }, [idTienda, recarga]);

  const guardarProducto = async (producto: ProductoData, archivo?: File) => {
    if (soloConsulta) throw new Error('La tienda está inactiva.');
    const unidad = Object.entries(UNIDADES_PRODUCTO).find(([, etiqueta]) => etiqueta === producto.unidad)?.[0];
    if (!unidad) throw new Error('Unidad de medida no válida.');
    const solicitud: ProductoRequest = {
      nombreProducto: producto.nombre,
      descripcion: producto.descripcion?.trim() || null,
      precioContado: producto.precioContado,
      precioCredito: producto.precioCredito,
      tipoProducto: producto.tipo === 'Producto' ? 'PRODUCTO' : 'SERVICIO',
      proveedor: producto.tipo === 'Producto' ? producto.proveedor || null : null,
      marca: producto.tipo === 'Producto' ? producto.marca || null : null,
      unidadMedida: unidad,
      modalidad: producto.modalidad === 'Pago único' ? 'UNICO' : producto.modalidad === 'En meses' ? 'MENSUAL' : 'AMBAS',
    };
    if (producto.id === undefined && !archivo) throw new Error('Selecciona una imagen.');
    const data = producto.id === undefined
      ? await registrarProducto(idTienda, solicitud, archivo!)
      : await actualizarProducto(idTienda, producto.id, solicitud, archivo);
    const guardado = convertirProducto(data);
    setProductos(prev => prev.some(p => p.id === guardado.id)
      ? prev.map(p => p.id === guardado.id ? guardado : p)
      : [guardado, ...prev]);
  };

  const desactivar = async (producto: ProductoData) => {
    if (soloConsulta || producto.id === undefined || desactivando !== null) return;
    if (!window.confirm(`¿Desactivar ${producto.nombre}? No estará disponible para nuevas ventas.`)) return;
    setDesactivando(producto.id);
    setError(null);
    try {
      const guardado = convertirProducto(await desactivarProducto(idTienda, producto.id));
      setProductos(prev => prev.map(p => p.id === guardado.id ? guardado : p));
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setDesactivando(null);
    }
  };

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
          disabled={soloConsulta || cargando || !!error}
          onClick={() => setModal({ mode: 'nuevo' })}
          className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo producto o servicio</span>
        </button>
      </div>

      {soloConsulta && <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">Tienda inactiva: catálogo disponible solo para consulta.</p>}
      {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error} <button type="button" onClick={() => setRecarga(n => n + 1)} className="font-semibold underline">Reintentar</button></div>}
      {cargando && <p role="status" className="text-xs text-slate-500">Cargando productos...</p>}

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
                      {item.id !== undefined && item.imagenProducto ? <ImagenProducto idTienda={idTienda} idProducto={item.id} imagen={item.imagenProducto} nombre={item.nombre} className="w-9 h-9 rounded-xl object-cover shrink-0" /> : <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
                        {item.tipo === 'Producto' ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                      </div>}
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
                      disabled={soloConsulta || desactivando !== null}
                      onClick={() => setModal({ mode: 'editar', producto: item })}
                      className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Editar
                    </button>
                    {item.estado === 'Activo' && !soloConsulta && <button type="button" disabled={desactivando !== null} onClick={() => void desactivar(item)} className="ml-2 text-xs font-semibold text-red-700 disabled:opacity-50">{desactivando === item.id ? 'Desactivando...' : 'Desactivar'}</button>}
                  </td>
                </tr>
              ))}

              {!cargando && !error && filtered.length === 0 && (
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
      {modal && !soloConsulta && <ProductoModal isOpen mode={modal.mode} initialData={modal.producto} idTienda={idTienda} onClose={() => setModal(null)} onSave={guardarProducto} />}
    </div>
  );
};
