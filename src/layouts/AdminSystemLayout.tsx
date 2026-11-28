import React from 'react';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  ReceiptText,
  Search,
  LogOut,
} from 'lucide-react';

export type AdminTab = 'resumen' | 'tiendas' | 'registrar';

interface AdminSystemLayoutProps {
  currentTab: AdminTab;
  busqueda: string;
  onBuscar: (valor: string) => void;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminSystemLayout: React.FC<AdminSystemLayoutProps> = ({
  currentTab,
  busqueda,
  onBuscar,
  onSelectTab,
  onLogout,
  children,
}) => {
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
              <p className="text-xs text-jades-on-navy font-normal">
                Créditos simples
              </p>
            </div>
          </div>

          {/* Badge de Rol: Administración */}
          <div className="jades-sidebar-context flex items-center gap-3 rounded-lg px-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs text-white border border-white/20">
              AS
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Administración
              </p>
              <p className="text-[11px] text-jades-on-navy font-normal">
                Control de plataforma
              </p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <div className="jades-nav">
            <p className="text-[10px] font-bold uppercase tracking-wider text-jades-on-navy px-3 mb-2">
              MENÚ PRINCIPAL
            </p>

            <nav className="space-y-0">
              <button
                onClick={() => onSelectTab('resumen')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'resumen'
                    ? 'bg-[#087f5b] text-white shadow-sm'
                    : 'text-jades-soft hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Resumen general</span>
              </button>

              <button
                onClick={() => onSelectTab('tiendas')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'tiendas'
                    ? 'bg-[#087f5b] text-white shadow-sm'
                    : 'text-jades-soft hover:bg-white/5 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Tiendas</span>
              </button>

              <button
                onClick={() => onSelectTab('registrar')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'registrar'
                    ? 'bg-[#087f5b] text-white shadow-sm'
                    : 'text-jades-soft hover:bg-white/5 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar tienda</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer del Sidebar: Administrador sistema / Cerrar sesión */}
        <div className="jades-profile flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs text-white border border-white/20">
              AS
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Administrador sistema
              </p>
              <button
                onClick={onLogout}
                className="text-[11px] text-jades-on-navy hover:text-red-300 transition cursor-pointer flex items-center gap-1 mt-0.5"
              >
                <LogOut className="w-3 h-3" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Header */}
        <header className="jades-topbar h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-700">Administrador del sistema</span>

          <div className="flex items-center space-x-3">
            {/* Buscador rápido */}
            <div className="relative hidden sm:block w-[255px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar tienda..."
                aria-label="Buscar tienda"
                value={busqueda}
                onChange={e => onBuscar(e.target.value)}
                className="w-full min-h-11 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#087f5b]"
              />
            </div>

            {/* Avatar AS */}
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
              AS
            </div>
          </div>
        </header>

        {/* Área de Contenido Dinámico */}
        <main className="jades-content flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
