import { Paginacion } from '../../components/shared/Paginacion';
import { EstadoBadge } from '../../components/store-admin/EstadoBadge';
import React, { useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import type { TiendaDetalleResponse } from '../../types/tiendas';

interface TiendasListPageProps {
  tiendas: TiendaDetalleResponse[];
  cargando: boolean;
  error: string | null;
  onRecargar: () => void;
  aviso: string | null;
  busqueda: string;
  onBuscar: (valor: string) => void;
  onGoToRegister: () => void;
  onEditTienda: (tienda: TiendaDetalleResponse) => void;
}

export const TiendasListPage: React.FC<TiendasListPageProps> = ({
  tiendas,
  cargando,
  error,
  onRecargar,
  aviso,
  busqueda,
  onBuscar,
  onGoToRegister,
  onEditTienda,
}) => {
  const [paginacion, setPaginacion] = useState({ busqueda, pagina: 1 });
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | 'Activo' | 'Inactivo'>('TODOS');

  // Filtrado reactivo en tiempo real
  const tiendasFiltradas = tiendas.filter((t) => {
    const matchesSearch =
      [t.nombreTienda, t.documentoTienda, t.razonSocial, t.giroDeNegocio, t.direccion, String(t.idTienda),
        ...t.administradores.flatMap(a => [a.nombreUsuario, a.correoUsuario])]
        .some(valor => valor.toLowerCase().includes(busqueda.trim().toLowerCase()));
    const matchesEstado = estadoFilter === 'TODOS' || t.estadoTienda === (estadoFilter === 'Activo' ? 'ACTIVO' : 'INACTIVO');
    return matchesSearch && matchesEstado;
  });

  const pagina = Math.min(paginacion.busqueda === busqueda ? paginacion.pagina : 1, Math.max(1, Math.ceil(tiendasFiltradas.length / 10)));

  return (
    <div className="space-y-[18px]">
      {/* Título de la sección y botón Registrar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-jades-ink tracking-tight">
            Tiendas registradas
          </h2>
          <p className="text-xs text-jades-muted mt-1">
            Negocios que operan de forma independiente en la plataforma.
          </p>
        </div>

        <button
          onClick={onGoToRegister}
          className="inline-flex items-center justify-center space-x-2 bg-jades-primary hover:bg-jades-hover active:bg-jades-active text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar tienda</span>
        </button>
      </div>

      {aviso && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">{aviso}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <div className="flex items-center justify-end">
        <button type="button" disabled={cargando} onClick={onRecargar} className="rounded-xl border border-jades-line px-4 py-2 text-xs font-semibold disabled:opacity-50">{cargando ? 'Actualizando...' : 'Actualizar listado'}</button>
      </div>

      {/* Resumen Métrico Compacto (Fila de 4 números) */}
      <div className="jades-compact-metrics grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-jades-muted font-medium">Total tiendas</p>
          <p className="text-2xl font-bold text-jades-ink mt-1">{tiendas.length}</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-jades-muted font-medium">Activas</p>
          <p className="text-2xl font-bold text-jades-ink mt-1">{tiendas.filter(t => t.estadoTienda === 'ACTIVO').length}</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-jades-muted font-medium">Inactivas</p>
          <p className="text-2xl font-bold text-jades-ink mt-1">{tiendas.filter(t => t.estadoTienda === 'INACTIVO').length}</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-jades-muted font-medium">Giros distintos</p>
          <p className="text-2xl font-bold text-jades-ink mt-1">{new Set(tiendas.map(t => t.giroDeNegocio)).size}</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro de Estados */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-jades-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Buscar tiendas"
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder="Buscar tienda, documento, administrador o ubicación"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-jades-line rounded-xl text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary"
          />
        </div>

        <div className="relative sm:w-48">
          <select
            value={estadoFilter}
            aria-label="Estado de la tienda"
            onChange={(e) => { setEstadoFilter(e.target.value as 'TODOS' | 'Activo' | 'Inactivo'); setPaginacion({ busqueda, pagina: 1 }); }}
            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-jades-line rounded-xl text-slate-700 font-medium focus:outline-none focus:border-jades-primary pr-8 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
          <ChevronDown className="w-4 h-4 text-jades-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tabla Completa de Tiendas */}
      <div className="bg-white rounded-[13px] border border-jades-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-jades-subtle border-b border-jades-line text-[10px] font-bold text-jades-muted uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">TIENDA</th>
                <th className="py-3 px-6">DOCUMENTO</th>
                <th className="py-3 px-6">GIRO</th>
                <th className="py-3 px-6">ADMINISTRADOR</th>
                <th className="py-3 px-6">UBICACIÓN</th>
                <th className="py-3 px-6">TELÉFONO</th>
                <th className="py-3 px-6">ESTADO</th>
                <th className="py-3 px-6 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jades-line text-slate-700">
              {tiendasFiltradas.slice((pagina - 1) * 10, pagina * 10).map((t) => (
                <tr key={t.idTienda} className="hover:bg-jades-subtle transition">
                  <td className="py-4 px-6 font-semibold text-jades-ink">{t.nombreTienda}<p className="text-[10px] font-normal text-jades-muted">ID {t.idTienda}</p></td>
                  <td className="py-4 px-6 text-jades-muted">{t.documentoTienda}</td>
                  <td className="py-4 px-6 text-jades-muted">{t.giroDeNegocio}</td>
                  <td className="py-4 px-6 text-jades-muted">{t.administradores.map(a => a.nombreUsuario).join(', ') || '—'}</td>
                  <td className="py-4 px-6 text-jades-muted">{t.direccion}</td>
                  <td className="py-4 px-6 text-jades-muted">{t.telefonoTienda || '—'}</td>
                  <td className="py-4 px-6">
                    <EstadoBadge estado={t.estadoTienda === 'ACTIVO' ? 'Activo' : 'Inactivo'} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      disabled={cargando}
                      onClick={() => onEditTienda(t)}
                      className="px-3 py-1.5 border border-jades-line text-slate-700 hover:border-jades-primary hover:text-jades-primary hover:bg-jades-subtle text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Gestionar tienda
                    </button>
                  </td>
                </tr>
              ))}
              {!tiendasFiltradas.length && <tr><td colSpan={8} className="py-8 text-center text-jades-muted">{cargando ? 'Cargando tiendas...' : error ? 'No se pudo cargar el listado.' : tiendas.length ? 'No hay resultados para el filtro.' : 'No hay tiendas registradas.'}</td></tr>}
            </tbody>
          </table>
        </div>

        <Paginacion total={tiendasFiltradas.length} pagina={pagina} onCambiar={nueva => setPaginacion({ busqueda, pagina: nueva })} etiqueta="tiendas" />
      </div>
    </div>
  );
};
