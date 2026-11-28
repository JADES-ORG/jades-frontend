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
  nombreUsuario?: string;
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
                                                                    nombreUsuario,
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
  const nombreVisible = nombreUsuario?.trim() || correoUsuario || 'Mi cuenta';
  const partesNombre = nombreUsuario?.trim().split(/\s+/).filter(Boolean) ?? [];
  const inicialUsuario = (partesNombre.length > 1 ? partesNombre.slice(0, 2).map(parte => parte[0]).join('') : nombreVisible.slice(0, 2)).toUpperCase();
  return (
      <div className="min-h-screen bg-[#f3f6f5] flex flex-col md:flex-row font-sans">
        {/* SIDEBAR IZQUIERDO */}
        <aside className="jades-sidebar w-full bg-[#102f2a] text-white flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-dvh md:self-start md:overflow-y-auto">
          <div>
            {/* Logo JADES */}
            <div className="jades-brand">
              <div className="jades-brand-symbol rounded-xl bg-jades-primary flex items-center justify-center text-white shadow-md">
                <ReceiptText className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                  JADES
                </h1>
                <p className="text-[11px] text-jades-on-navy font-normal">
                  Créditos simples
                </p>
              </div>
            </div>

            {/* Tiendas autorizadas por el backend */}
            <div className="jades-sidebar-context relative" onBlur={e => {
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
            <div className="jades-nav">
              <p className="text-[10px] font-bold uppercase tracking-wider text-jades-on-navy px-3 mb-2">
                MENÚ PRINCIPAL
              </p>

              <nav className="space-y-0">
                <button
                    onClick={() => onSelectTab('inicio')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        currentTab === 'inicio'
                            ? 'bg-[#087f5b] text-white shadow-xs'
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
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
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
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
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
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
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
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
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
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
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
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
                            : 'text-jades-soft hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ayuda</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Footer del Sidebar: Configuración / Luis Alvarez / Cerrar sesión */}
          <div className="space-y-2">
            <button
                onClick={() => onSelectTab('configuracion')}
                className={`jades-config w-full flex items-center space-x-3 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    currentTab === 'configuracion'
                        ? 'bg-[#087f5b] text-white'
                        : 'text-jades-soft hover:text-white'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>

            <div className="jades-profile flex items-center">
              <div className="flex w-full min-w-0 items-center gap-[9px]">
                <div className="grid size-[35px] shrink-0 place-items-center rounded-full bg-[#edf1f6] text-xs font-bold text-jades-navy">
                  {inicialUsuario}
                </div>
                <div className="min-w-0 flex-1">
                  <p title={nombreVisible} className="truncate text-xs font-semibold text-white leading-tight">
                    {nombreVisible}
                  </p>
                  <button
                      onClick={onLogout}
                      className="mt-0.5 block text-left text-xs font-normal text-jades-on-navy transition hover:text-white"
                  >
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
          <header className="jades-topbar h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold text-slate-700">{tiendaActiva?.nombreTienda}</span>
            <div className="flex min-w-0 items-center gap-3">
              {/* Buscador */}
              <div className="relative hidden sm:block w-[255px]">
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

              <div className="flex min-w-0 items-center gap-2.5 border-l border-jades-line pl-3" title={nombreVisible}>
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf1f6] text-xs font-bold text-jades-navy">{inicialUsuario}</span>
                <div className="hidden min-w-0 max-w-[200px] sm:block">
                  <p className="truncate text-[13px] font-semibold leading-tight text-jades-ink">{nombreVisible}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-jades-muted">Administrador del negocio</p>
                </div>
              </div>
            </div>
          </header>

          {/* Área de Contenido */}
          <main className="jades-content flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
  );
};