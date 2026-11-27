import React, { useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import type { TiendaResumenResponse } from '../../types/tiendas';
import { consultarTienda } from '../../api/tiendas';
import { obtenerMensajeError } from '../../api/errores';

interface TiendasListPageProps {
  tiendas: TiendaResumenResponse[];
  onConsultar: (tienda: TiendaResumenResponse) => void;
  aviso: string | null;
  busqueda: string;
  onBuscar: (valor: string) => void;
  onGoToRegister: () => void;
  onEditTienda: (tienda: TiendaResumenResponse) => void;
}

export const TiendasListPage: React.FC<TiendasListPageProps> = ({
  tiendas,
  onConsultar,
  aviso,
  busqueda,
  onBuscar,
  onGoToRegister,
  onEditTienda,
}) => {
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | 'Activo' | 'Inactivo'>('TODOS');

  const [idConsulta, setIdConsulta] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buscarTienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (consultando) return;
    const id = Number(idConsulta);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('Ingresa un ID de tienda válido.');
      return;
    }
    setConsultando(true);
    setError(null);
    try {
      onConsultar(await consultarTienda(id));
      setIdConsulta('');
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setConsultando(false);
    }
  };

  // Filtrado reactivo en tiempo real
  const tiendasFiltradas = tiendas.filter((t) => {
    const matchesSearch =
      t.nombreTienda.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.documentoTienda.includes(busqueda.trim()) || String(t.idTienda) === busqueda.trim();
    const matchesEstado = estadoFilter === 'TODOS' || t.estadoTienda === (estadoFilter === 'Activo' ? 'ACTIVO' : 'INACTIVO');
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Título de la sección y botón Registrar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tiendas registradas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Negocios que operan de forma independiente en la plataforma.
          </p>
        </div>

        <button
          onClick={onGoToRegister}
          className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar tienda</span>
        </button>
      </div>

      <p className="text-xs text-slate-500">El servidor permite consultar tiendas por ID. Esta tabla incluye solo las tiendas consultadas o registradas durante la sesión.</p>
      {aviso && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">{aviso}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <form onSubmit={buscarTienda} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="id-tienda-consulta" className="block text-xs font-semibold text-slate-700 mb-1">ID de tienda</label>
          <input id="id-tienda-consulta" type="number" min="1" step="1" required value={idConsulta} onChange={e => setIdConsulta(e.target.value)} className="rounded-xl border border-slate-200 p-2.5 text-xs" />
        </div>
        <button type="submit" disabled={consultando} className="rounded-xl bg-[#139a6c] text-white px-4 py-2.5 text-xs font-semibold disabled:opacity-50">{consultando ? 'Consultando...' : 'Consultar tienda'}</button>
      </form>

      {/* Resumen Métrico Compacto (Fila de 4 números) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Tiendas consultadas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tiendas.length}</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Activas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tiendas.filter(t => t.estadoTienda === 'ACTIVO').length}</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Inactivas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tiendas.filter(t => t.estadoTienda === 'INACTIVO').length}</p>
        </div>
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Total plataforma</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">—</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro de Estados */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            placeholder="Buscar tienda, documento o ID"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
          />
        </div>

        <div className="relative sm:w-48">
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as 'TODOS' | 'Activo' | 'Inactivo')}
            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] pr-8 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Tabla Completa de Tiendas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">TIENDA</th>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">DOCUMENTO</th>
                <th className="py-3 px-6">ESTADO</th>
                <th className="py-3 px-6 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tiendasFiltradas.map((t) => (
                <tr key={t.idTienda} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-semibold text-slate-900">{t.nombreTienda}</td>
                  <td className="py-4 px-6 text-slate-600">{t.idTienda}</td>
                  <td className="py-4 px-6 text-slate-600">{t.documentoTienda}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        t.estadoTienda === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border-rose-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          t.estadoTienda === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      {t.estadoTienda === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onEditTienda(t)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:border-[#139a6c] hover:text-[#139a6c] hover:bg-slate-50 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Gestionar estado
                    </button>
                  </td>
                </tr>
              ))}
              {!tiendasFiltradas.length && <tr><td colSpan={5} className="py-8 text-center text-slate-500">{tiendas.length ? 'No hay resultados para el filtro.' : 'Consulta una tienda por ID o registra una nueva.'}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {tiendasFiltradas.length} de {tiendas.length} tiendas</span>
        </div>
      </div>
    </div>
  );
};
