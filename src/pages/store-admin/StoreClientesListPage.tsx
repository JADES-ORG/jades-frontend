import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus, ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { consultarCondicionCrediticia, consultarCuentaCorriente, listarClientes } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import type { ClienteResponse, CondicionCrediticiaResponse } from '../../types/clientes';
import { EstadoBadge } from '../../components/store-admin/EstadoBadge';
import { dinero, enLotes, iniciales, resumirDeuda, type ResumenDeuda } from '../../features/clientes/model';

const POR_PAGINA = 10;
const PETICIONES_SIMULTANEAS = 4;

/** Datos financieros de cada cliente. `undefined` = cargando; `null` = no disponible. */
interface Finanzas {
    condicion: CondicionCrediticiaResponse | null;
    deuda: ResumenDeuda | null;
}

type Filtro = 'TODOS' | 'SIN_MORA' | 'EN_MORA' | 'INACTIVOS';
type OrdenDeuda = 'desc' | 'asc' | null;

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
    const [ordenDeuda, setOrdenDeuda] = useState<OrdenDeuda>(null);

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
        if (c.estadoCliente !== 'ACTIVO') return false;
        const estado = finanzas[c.id]?.deuda?.estado;
        if (filtro === 'EN_MORA') return estado === 'En mora';
        return estado === 'Al día' || estado === 'Por vencer' || estado === 'Sin deuda';
    });
    const ordenados = ordenDeuda === null ? filtrados : [...filtrados].sort((a, b) => {
        const datosA = finanzas[a.id];
        const datosB = finanzas[b.id];
        const deudaA = datosA?.deuda;
        const deudaB = datosB?.deuda;
        if (!deudaA || !deudaB) {
            return deudaA ? -1 : deudaB ? 1 : a.id - b.id;
        }
        const monedaA = deudaA.moneda ?? datosA.condicion?.monedaCredito ?? 'PEN';
        const monedaB = deudaB.moneda ?? datosB.condicion?.monedaCredito ?? 'PEN';
        if (monedaA !== monedaB) return monedaA.localeCompare(monedaB);
        const diferencia = ordenDeuda === 'desc'
            ? deudaB.deudaActual - deudaA.deudaActual
            : deudaA.deudaActual - deudaB.deudaActual;
        return diferencia || a.id - b.id;
    });
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const visibles = ordenados.slice(inicio, inicio + POR_PAGINA);

    return (
        <div className="space-y-[18px]">
            {/* Encabezado y botón Nuevo cliente */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-jades-ink tracking-tight">Clientes</h2>
                    <p className="text-xs text-jades-muted mt-1">Gestiona límites, condiciones y deudas de tus clientes.</p>
                </div>
                {!soloConsulta && (
                    <button
                        type="button"
                        onClick={onNewClient}
                        className="inline-flex items-center justify-center space-x-2 bg-jades-primary hover:bg-jades-hover active:bg-jades-active text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Nuevo cliente</span>
                    </button>
                )}
            </div>

            {/* Resumen */}
            <div className="jades-compact-metrics grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                    { etiqueta: 'Clientes activos', valor: cargando || error ? '—' : String(activos.length), alerta: false },
                    { etiqueta: 'Con crédito activo', valor: metrica(deudas.filter((d) => d.deudaActual > 0).length), alerta: false },
                    { etiqueta: 'Sin deuda', valor: metrica(deudas.filter((d) => d.estado === 'Sin deuda').length), alerta: false },
                    { etiqueta: 'En mora', valor: metrica(deudas.filter((d) => d.estado === 'En mora').length), alerta: true },
                ].map((m) => (
                    <div key={m.etiqueta} className="px-2 sm:px-4">
                        <p className="text-[11px] text-jades-muted font-medium">{m.etiqueta}</p>
                        <p className={`text-2xl font-bold mt-1 ${m.alerta && m.valor !== '0' && /^\d+$/.test(m.valor) ? 'text-rose-600' : 'text-jades-ink'}`}>
                            {m.valor}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabla con buscador y filtro */}
            <div className="bg-white rounded-[13px] border border-jades-line overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative sm:w-72">
                        <Search className="w-4 h-4 text-jades-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="search"
                            aria-label="Buscar por nombre o DNI"
                            value={busqueda}
                            onChange={(e) => {
                                onBuscar(e.target.value);
                                setPagina(1);
                            }}
                            placeholder="Buscar por nombre o DNI"
                            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-jades-line rounded-xl text-jades-ink placeholder-jades-muted focus:outline-none focus:border-jades-primary"
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
                            className="w-full appearance-none px-4 py-2.5 text-xs bg-white border border-jades-line rounded-xl text-slate-700 font-medium focus:outline-none focus:border-jades-primary pr-8 cursor-pointer"
                        >
                            <option value="TODOS">Todos los clientes</option>
                            <option value="SIN_MORA">Sin mora</option>
                            <option value="EN_MORA">En mora</option>
                            <option value="INACTIVOS">Inactivos</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-jades-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {ordenDeuda !== null && !cargando && !error && (
                    <p role="status" className="px-4 pb-3 text-xs text-jades-muted">
                        Deuda {ordenDeuda === 'desc' ? 'de mayor a menor' : 'de menor a mayor'} por moneda (soles y dólares por separado).
                    </p>
                )}

                {cargando ? (
                    <p role="status" className="px-6 py-10 text-center text-sm text-jades-muted border-t border-jades-line">
                        Cargando clientes...
                    </p>
                ) : error ? (
                    <div role="alert" className="px-6 py-8 text-center text-sm text-red-700 space-y-3 border-t border-jades-line">
                        <p>{error}</p>
                        <button
                            type="button"
                            className="font-semibold text-jades-primary cursor-pointer"
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
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-jades-subtle border-y border-jades-line text-[10px] font-bold text-jades-muted uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-6">Cliente</th>
                                    <th className="py-3 px-6">DNI</th>
                                    <th className="py-3 px-6" aria-sort={ordenDeuda === 'desc' ? 'descending' : ordenDeuda === 'asc' ? 'ascending' : 'none'}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOrdenDeuda(actual => actual === 'desc' ? 'asc' : 'desc');
                                                setPagina(1);
                                            }}
                                            title="Ordenar por importe dentro de cada moneda"
                                            className="inline-flex items-center gap-1.5 uppercase tracking-wider hover:text-jades-primary"
                                            aria-label={ordenDeuda === 'desc' ? 'Ordenar deuda actual de menor a mayor por moneda' : 'Ordenar deuda actual de mayor a menor por moneda'}
                                        >
                                            Deuda actual
                                            {ordenDeuda === 'desc' ? <ArrowDown aria-hidden="true" className="size-3.5 text-jades-primary" /> : ordenDeuda === 'asc' ? <ArrowUp aria-hidden="true" className="size-3.5 text-jades-primary" /> : <ChevronsUpDown aria-hidden="true" className="size-3.5 text-jades-muted" />}
                                        </button>
                                    </th>
                                    <th className="py-3 px-6">Crédito disponible</th>
                                    <th className="py-3 px-6">Estado</th>
                                    <th className="py-3 px-6">
                                        <span className="sr-only">Ver detalle</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-jades-line text-slate-700">
                                {visibles.map((c) => {
                                    const datos = finanzas[c.id];
                                    const deuda = datos?.deuda;
                                    const condicion = datos?.condicion;
                                    return (
                                        <tr
                                            key={c.id}
                                            onClick={() => onSelectCliente(c.id)}
                                            className="hover:bg-jades-subtle transition cursor-pointer"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                                                        {iniciales(c.nombreCliente)}
                                                    </div>
                                                    <span className="font-semibold text-jades-ink">{c.nombreCliente}</span>
                                                    {c.estadoCliente !== 'ACTIVO' && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-jades-muted">
                                Inactivo
                              </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-jades-muted">{c.dniCliente}</td>
                                            <td className="py-4 px-6 font-bold text-jades-ink">
                                                {!datos ? '…' : deuda ? dinero(deuda.deudaActual, deuda.moneda ?? condicion?.monedaCredito ?? 'PEN') : '—'}
                                            </td>
                                            <td className="py-4 px-6 text-jades-muted">
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
                                                    className="grid size-10 place-items-center rounded-lg hover:bg-jades-soft cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-jades-muted" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {visibles.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-jades-muted">
                                            {clientes.length === 0
                                                ? 'Aún no hay clientes registrados en esta tienda.'
                                                : 'No se encontraron clientes con esos filtros.'}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="jades-pagination flex flex-wrap items-center justify-between gap-3 border-t border-jades-line px-4 py-2">
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
                                    className="px-3 py-1.5 border border-jades-line rounded-lg text-jades-muted hover:bg-jades-subtle font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    disabled={paginaActual >= totalPaginas}
                                    onClick={() => setPagina(paginaActual + 1)}
                                    className="px-3 py-1.5 border border-jades-line rounded-lg text-jades-muted hover:bg-jades-subtle font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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