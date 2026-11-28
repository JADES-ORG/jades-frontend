import React, { useRef, useState } from 'react';
import type { TiendaResumenResponse } from '../types/tiendas';
import {
  ReceiptText,
  ChevronDown,
  Check,
  Home,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Calendar,
  HelpCircle,
  Settings,
  Search,
  Bell,
  LogOut,
} from 'lucide-react';

export type StoreTab =
    | 'inicio'
    | 'clientes'
    | 'productos'
    | 'nueva_venta'
    | 'pagos'
    | 'cortes'
    | 'ayuda'
    | 'configuracion';

interface StoreAdminLayoutProps {
  tiendas: TiendaResumenResponse[];
  idTiendaActiva: number | null;
  cargandoTiendas: boolean;
  correoUsuario: string;
  onSelectTienda: (idTienda: number) => void;
  currentTab: StoreTab;
  onSelectTab: (tab: StoreTab) => void;
  onLogout: () => void;
  busquedaClientes: string;
  onBuscarCliente: (valor: string) => void;
  children: React.ReactNode;
}

export const StoreAdminLayout: React.FC<StoreAdminLayoutProps> = ({
                                                                    tiendas,
                                                                    idTiendaActiva,
                                                                    cargandoTiendas,
                                                                    correoUsuario,
                                                                    onSelectTienda,
                                                                    currentTab,
                                                                    onSelectTab,
                                                                    onLogout,
                                                                    busquedaClientes,
                                                                    onBuscarCliente,
                                                                    children,
                                                                  }) => {
  const tiendaActiva = tiendas.find(tienda => tienda.idTienda === idTiendaActiva);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const botonTiendas = useRef<HTMLButtonElement>(null);
  const inicialUsuario = correoUsuario.slice(0, 2).toUpperCase();
  return (
      <div className="min-h-screen bg-[#f3f6f5] flex flex-col md:flex-row font-sans">
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-full md:w-64 bg-[#102f2a] text-white flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-dvh md:self-start md:overflow-y-auto">
          <div>
            {/* Logo JADES */}
            <div className="p-5 border-b border-white/10 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#087f5b] flex items-center justify-center text-white shadow-md">
                <ReceiptText className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                  JADES
                </h1>
                <p className="text-[11px] text-emerald-200/70 font-normal">
                  Créditos simples
                </p>
              </div>
            </div>

            {/* Tiendas autorizadas por el backend */}
            <div className="relative px-3 py-3" onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget)) setSelectorAbierto(false);
            }} onKeyDown={e => {
              if (e.key === 'Escape' && selectorAbierto) {
                setSelectorAbierto(false);
                botonTiendas.current?.focus();
              }
            }}>
              <button type="button" ref={botonTiendas} aria-label="Cambiar establecimiento" aria-expanded={selectorAbierto} aria-controls="tiendas-autorizadas"
                disabled={cargandoTiendas || !tiendas.length} onClick={() => setSelectorAbierto(abierto => !abierto)}
                className="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-3 text-left text-white focus-visible:outline-2 focus-visible:outline-emerald-300 disabled:opacity-60">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-[#102f2a]">{tiendaActiva?.nombreTienda.trim().split(/\s+/).slice(0, 2).map(palabra => palabra[0]).join('').toUpperCase() ?? '—'}</span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{tiendaActiva?.nombreTienda ?? (cargandoTiendas ? 'Cargando tiendas…' : 'Sin tiendas disponibles')}</strong>
                  {tiendaActiva && <small className="block truncate text-emerald-100">{tiendaActiva.estadoTienda === 'ACTIVO' ? tiendaActiva.documentoTienda : 'Tienda inactiva'}</small>}
                </span>
                <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
              </button>
              <ul id="tiendas-autorizadas" hidden={!selectorAbierto} className="absolute inset-x-3 top-full z-20 -mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {tiendas.map(tienda => <li key={tienda.idTienda}>
                  <button type="button" aria-current={tienda.idTienda === idTiendaActiva ? 'true' : undefined} onClick={() => {
                    setSelectorAbierto(false);
                    if (tienda.idTienda !== idTiendaActiva) onSelectTienda(tienda.idTienda);
                    botonTiendas.current?.focus();
                  }} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-emerald-50 aria-current:bg-emerald-50">
                    <span><strong className="block">{tienda.nombreTienda}</strong><small>{tienda.estadoTienda === 'ACTIVO' ? tienda.documentoTienda : 'Inactiva'}</small></span>
                    {tienda.idTienda === idTiendaActiva && <Check aria-hidden="true" className="size-4 text-emerald-700" />}
                  </button>
                </li>)}
              </ul>
            </div>

            {/* Menú de Navegación Principal */}
            <div className="px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/40 px-3 mb-2">
                MENÚ PRINCIPAL
              </p>

              <nav className="space-y-1">
                <button
                    onClick={() => onSelectTab('inicio')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'inicio'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Inicio</span>
                </button>

                <button
                    onClick={() => onSelectTab('clientes')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'clientes'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Clientes</span>
                </button>

                <button
                    onClick={() => onSelectTab('productos')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'productos'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Productos y servicios</span>
                </button>

                <button
                    disabled={tiendaActiva?.estadoTienda !== 'ACTIVO'}
                    onClick={() => onSelectTab('nueva_venta')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'nueva_venta'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Nueva venta</span>
                </button>

                <button
                    onClick={() => onSelectTab('pagos')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'pagos'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pagos</span>
                </button>

                <button
                    onClick={() => onSelectTab('cortes')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'cortes'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Cortes y cobranzas</span>
                </button>

                <button
                    onClick={() => onSelectTab('ayuda')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'ayuda'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ayuda</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Footer del Sidebar: Configuración / Luis Alvarez / Cerrar sesión */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <button
                onClick={() => onSelectTab('configuracion')}
                className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    currentTab === 'configuracion'
                        ? 'bg-[#087f5b] text-white'
                        : 'text-emerald-100/70 hover:text-white'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                  {inicialUsuario}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {correoUsuario}
                  </p>
                  <button
                      onClick={onLogout}
                      className="text-[10px] text-emerald-200/60 hover:text-red-300 transition cursor-pointer flex items-center gap-1 mt-0.5"
                  >
                    <LogOut className="w-3 h-3" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Superior */}
          <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold text-slate-700">{tiendaActiva?.nombreTienda}</span>
            <div className="flex items-center space-x-3">
              {/* Buscador */}
              <div className="relative hidden sm:block w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Buscar cliente…"
                    aria-label="Buscar un cliente de esta tienda"
                    value={busquedaClientes}
                    disabled={!tiendaActiva}
                    onChange={e => onBuscarCliente(e.target.value)}
                    className="w-full min-h-11 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#087f5b]"
                />
              </div>

              {/* Campana */}
              <button type="button" aria-label="Ver próximos cobros" disabled={!tiendaActiva} onClick={() => onSelectTab('pagos')} className="grid size-11 place-items-center text-slate-600 rounded-lg hover:bg-slate-50">
                <Bell className="w-4 h-4" />
              </button>

              {/* Avatar LA */}
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                {inicialUsuario}
              </div>
            </div>
          </header>

          {/* Área de Contenido */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
  );
};