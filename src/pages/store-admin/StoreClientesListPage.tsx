import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { consultarCondicionCrediticia, consultarCuentaCorriente, listarClientes } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import type { ClienteResponse, CondicionCrediticiaResponse } from '../../types/clientes';
import { EstadoBadge } from '../../components/store-admin/EstadoBadge';
import { dinero, enLotes, iniciales, resumirDeuda, type EstadoDeuda, type ResumenDeuda } from '../../features/clientes/model';

const POR_PAGINA = 10;
const PETICIONES_SIMULTANEAS = 4;

/** Datos financieros de cada cliente. `undefined` = cargando; `null` = no disponible. */
interface Finanzas {
    condicion: CondicionCrediticiaResponse | null;
    deuda: ResumenDeuda | null;
}

type Filtro = 'TODOS' | EstadoDeuda | 'INACTIVOS';

interface StoreClientesListPageProps {
    idTienda: number;
    busqueda: string;
    onBuscar: (valor: string) => void;
    onSelectCliente: (idCliente: number) => void;
    onNewClient: () => void;
    soloConsulta?: boolean;
}

const normalizar = (texto: string) =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('es-PE');

export const StoreClientesListPage: React.FC<StoreClientesListPageProps> = ({
                                                                                idTienda,
                                                                                busqueda,
                                                                                onBuscar,
                                                                                onSelectCliente,
                                                                                onNewClient,
                                                                                soloConsulta = false,
                                                                            }) => {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [finanzas, setFinanzas] = useState<Record<number, Finanzas>>({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recarga, setRecarga] = useState(0);
    const [filtro, setFiltro] = useState<Filtro>('TODOS');
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        listarClientes(idTienda, false, signal)
            .then(async (lista) => {
                if (signal.aborted) return;
                setClientes(lista);
                setFinanzas({});
                setCargando(false);
                // La deuda y el crédito de cada cliente se completan a medida que llegan.
                await enLotes(lista, PETICIONES_SIMULTANEAS, async (cliente) => {
                    if (signal.aborted) return;
                    const [condicion, cuenta] = await Promise.allSettled([
                        consultarCondicionCrediticia(idTienda, cliente.id, signal),
                        consultarCuentaCorriente(cliente.id, signal),
                    ]);
                    if (signal.aborted) return;
                    setFinanzas((previo) => ({
                        ...previo,
                        [cliente.id]: {
                            condicion: condicion.status === 'fulfilled' ? condicion.value : null,
                            deuda: cuenta.status === 'fulfilled' ? resumirDeuda(cuenta.value) : null,
                        },
                    }));
                });
            })
            .catch((err: unknown) => {
                if (signal.aborted) return;
                setError(obtenerMensajeError(err));
                setCargando(false);
            });
        return () => controller.abort();
    }, [idTienda, recarga]);

    const activos = clientes.filter((c) => c.estadoCliente === 'ACTIVO');
    const completos = clientes.every((c) => finanzas[c.id]);
    const deudas = activos.map((c) => finanzas[c.id]?.deuda).filter((d): d is ResumenDeuda => !!d);
    const metrica = (valor: number) => (cargando || error ? '—' : completos ? String(valor) : '…');

    const termino = normalizar(busqueda.trim());
    const filtrados = clientes.filter((c) => {
        const coincide = !termino || normalizar(c.nombreCliente).includes(termino) || c.dniCliente.includes(termino);
        if (!coincide) return false;
        if (filtro === 'TODOS') return true;
        if (filtro === 'INACTIVOS') return c.estadoCliente !== 'ACTIVO';
        return finanzas[c.id]?.deuda?.estado === filtro;
    });
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

    return (
        <div className="space-y-6">
            {/* Encabezado y botón Nuevo cliente */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clientes</h2>
                    <p className="text-xs text-slate-500 mt-1">Gestiona límites, condiciones y deudas de tus clientes.</p>
                </div>
                {!soloConsulta && (
                    <button
                        type="button"
                        onClick={onNewClient}
                        className="inline-flex items-center justify-center space-x-2 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Nuevo cliente</span>
                    </button>
                )}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:divide-x divide-slate-100">
                {[
                    { etiqueta: 'Clientes activos', valor: cargando || error ? '—' : String(activos.length), alerta: false },
                    { etiqueta: 'Con crédito activo', valor: metrica(deudas.filter((d) => d.deudaActual > 0).length), alerta: false },
                    { etiqueta: 'Sin deuda', valor: metrica(deudas.filter((d) => d.estado === 'Sin deuda').length), alerta: false },
                    { etiqueta: 'En mora', valor: metrica(deudas.filter((d) => d.estado === 'En mora').length), alerta: true },
                ].map((m) => (
                    <div key={m.etiqueta} className="px-2 sm:px-4">
                        <p className="text-[11px] text-slate-400 font-medium">{m.etiqueta}</p>
                        <p className={`text-2xl font-bold mt-1 ${m.alerta && m.valor !== '0' && /^\d+$/.test(m.valor) ? 'text-rose-600' : 'text-slate-900'}`}>
                            {m.valor}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabla con buscador y filtro */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="search"
                            aria-label="Buscar por nombre o DNI"
                            value={busqueda}
                            onChange={(e) => {
                                onBuscar(e.target.value);
                                setPagina(1);
                            }}
                            placeholder="Buscar por nombre o DNI"
                            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
                        />
                    </div>
                    <div className="relative sm:w-48">
                        <select
                            aria-label="Filtrar por estado"
                            value={filtro}
                            onChange={(e) => {
                                setFiltro(e.target.value as Filtro);
                                setPagina(1);
                            }}
                            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#139a6c] pr-8 cursor-pointer"
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="Al día">Al día</option>
                            <option value="Por vencer">Por vencer</option>
                            <option value="En mora">En mora</option>
                            <option value="Sin deuda">Sin deuda</option>
                            <option value="INACTIVOS">Inactivos</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {cargando ? (
                    <p role="status" className="px-6 py-10 text-center text-sm text-slate-500 border-t border-slate-100">
                        Cargando clientes...
                    </p>
                ) : error ? (
                    <div role="alert" className="px-6 py-8 text-center text-sm text-red-700 space-y-3 border-t border-slate-100">
                        <p>{error}</p>
                        <button
                            type="button"
                            className="font-semibold text-[#139a6c] cursor-pointer"
                            onClick={() => {
                                setError(null);
                                setCargando(true);
                                setRecarga((n) => n + 1);
                            }}
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/70 border-y border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-6">Cliente</th>
                                    <th className="py-3 px-6">DNI</th>
                                    <th className="py-3 px-6">Deuda actual</th>
                                    <th className="py-3 px-6">Crédito disponible</th>
                                    <th className="py-3 px-6">Estado</th>
                                    <th className="py-3 px-6">
                                        <span className="sr-only">Ver detalle</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                {visibles.map((c) => {
                                    const datos = finanzas[c.id];
                                    const deuda = datos?.deuda;
                                    const condicion = datos?.condicion;
                                    return (
                                        <tr
                                            key={c.id}
                                            onClick={() => onSelectCliente(c.id)}
                                            className="hover:bg-slate-50/60 transition cursor-pointer"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                                                        {iniciales(c.nombreCliente)}
                                                    </div>
                                                    <span className="font-semibold text-slate-900">{c.nombreCliente}</span>
                                                    {c.estadoCliente !== 'ACTIVO' && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                Inactivo
                              </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600">{c.dniCliente}</td>
                                            <td className="py-4 px-6 font-bold text-slate-900">
                                                {!datos ? '…' : deuda ? dinero(deuda.deudaActual, deuda.moneda ?? condicion?.monedaCredito ?? 'PEN') : '—'}
                                            </td>
                                            <td className="py-4 px-6 text-slate-600">
                                                {!datos ? '…' : condicion ? dinero(condicion.creditoDisponible, condicion.monedaCredito) : 'Sin condiciones'}
                                            </td>
                                            <td className="py-4 px-6">{deuda ? <EstadoBadge estado={deuda.estado} /> : datos ? '—' : '…'}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    type="button"
                                                    aria-label={`Ver detalle de ${c.nombreCliente}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectCliente(c.id);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {visibles.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            {clientes.length === 0
                                                ? 'Aún no hay clientes registrados en esta tienda.'
                                                : 'No se encontraron clientes con esos filtros.'}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {filtrados.length === 0
                    ? 'Mostrando 0 clientes'
                    : `Mostrando ${inicio + 1}–${inicio + visibles.length} de ${filtrados.length} clientes`}
              </span>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    disabled={paginaActual <= 1}
                                    onClick={() => setPagina(paginaActual - 1)}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    disabled={paginaActual >= totalPaginas}
                                    onClick={() => setPagina(paginaActual + 1)}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};