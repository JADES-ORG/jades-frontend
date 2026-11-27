import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { listarClientes } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import type { ClienteResponse } from '../../types/clientes';

// Tipo legado utilizado por el modal de registro aún no integrado.
export interface ClienteStoreItem {
  id: number;
  nombre: string;
  avatar: string;
  dni: string;
  deudaActual: number;
  creditoDisponible: number;
  estado: 'Al día' | 'Por vencer' | 'En mora' | 'Sin deuda';
}


interface StoreClientesListPageProps {
  idTienda: number;
}

export const StoreClientesListPage: React.FC<StoreClientesListPageProps> = ({ idTienda }) => {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [seleccionado, setSeleccionado] = useState<ClienteResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listarClientes(idTienda, false, controller.signal).then(resultado => {
      if (controller.signal.aborted) return;
      setClientes(resultado);
      setCargando(false);
    }).catch((err: unknown) => {
      if (controller.signal.aborted) return;
      setError(obtenerMensajeError(err));
      setCargando(false);
    });
    return () => controller.abort();
  }, [idTienda, recarga]);

  const termino = searchTerm.trim().toLocaleLowerCase('es-PE');
  const filtrados = clientes.filter(cliente =>
    (cliente.dniCliente.includes(termino) || cliente.nombreCliente.toLocaleLowerCase('es-PE').includes(termino)) &&
    (estadoFilter === 'TODOS' || cliente.estadoCliente === estadoFilter)
  );
  const activos = clientes.filter(cliente => cliente.estadoCliente === 'ACTIVO').length;
  const inactivos = clientes.filter(cliente => cliente.estadoCliente === 'INACTIVO').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clientes</h2>
        <p className="text-xs text-slate-500 mt-1">Consulta los clientes registrados en la tienda seleccionada.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-slate-100">
        {[['Clientes registrados', clientes.length], ['Clientes activos', activos], ['Clientes inactivos', inactivos]].map(([etiqueta, valor]) => (
          <div key={etiqueta} className="p-2 sm:px-4">
            <p className="text-[11px] text-slate-400 font-medium">{etiqueta}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{cargando || error ? '—' : valor}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="search" aria-label="Buscar cliente por nombre o DNI" value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setSeleccionado(null); }}
            placeholder="Buscar por nombre o DNI"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]" />
        </div>
        <div className="relative sm:w-48">
          <select aria-label="Filtrar por estado" value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setSeleccionado(null); }}
            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] pr-8">
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {cargando ? <p role="status" className="p-5 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">Cargando clientes...</p>
      : error ? <div role="alert" className="p-5 bg-white rounded-2xl border border-red-200 text-sm text-red-700 space-y-3">
          <p>{error}</p>
          <button type="button" className="font-semibold text-[#139a6c]" onClick={() => {
            setError(null); setCargando(true); setSeleccionado(null); setRecarga(n => n + 1);
          }}>Reintentar</button>
        </div>
      : <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Cliente</th>
                <th className="py-3 px-6">DNI</th>
                <th className="py-3 px-6">Teléfono</th>
                <th className="py-3 px-6">Correo</th>
                <th className="py-3 px-6">Estado</th>
                <th className="py-3 px-6"><span className="sr-only">Detalle</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtrados.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="py-4 px-6 font-semibold text-slate-900">{c.nombreCliente}</td>
                  <td className="py-4 px-6">{c.dniCliente}</td>
                  <td className="py-4 px-6">{c.telefonoCliente || '—'}</td>
                  <td className="py-4 px-6">{c.correoCliente || '—'}</td>
                  <td className="py-4 px-6"><span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${c.estadoCliente === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{c.estadoCliente}</span></td>
                  <td className="py-4 px-6 text-right"><button type="button" aria-label={`Ver datos de ${c.nombreCliente}`} aria-expanded={seleccionado?.id === c.id} onClick={() => setSeleccionado(seleccionado?.id === c.id ? null : c)} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight className="w-4 h-4 text-slate-400" /></button></td>
                </tr>
              ))}
              {filtrados.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">{clientes.length === 0 ? 'No hay clientes registrados en esta tienda.' : 'No se encontraron clientes con esos filtros.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="p-4 border-t border-slate-100 text-xs text-slate-500">Mostrando {filtrados.length} de {clientes.length} clientes.</p>
      </div>}
      {seleccionado && !cargando && !error && <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900">{seleccionado.nombreCliente}</h3>
          <button type="button" onClick={() => setSeleccionado(null)} className="text-xs text-[#139a6c]">Cerrar detalle</button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div><dt className="text-slate-400">DNI</dt><dd>{seleccionado.dniCliente}</dd></div>
          <div><dt className="text-slate-400">Estado</dt><dd>{seleccionado.estadoCliente}</dd></div>
          <div><dt className="text-slate-400">Teléfono</dt><dd>{seleccionado.telefonoCliente || '—'}</dd></div>
          <div><dt className="text-slate-400">Correo</dt><dd>{seleccionado.correoCliente || '—'}</dd></div>
        </dl>
        <p className="text-[11px] text-slate-500">Por ahora puedes consultar los datos personales del cliente.</p>
      </section>}
    </div>
  );
};
