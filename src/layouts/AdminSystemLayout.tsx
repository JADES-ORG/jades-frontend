import React from 'react';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  ReceiptText,
  Search,
  Bell,
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {/* SIDEBAR IZQUIERDO */}
      <aside className="w-full md:w-64 bg-[#0e3b2e] text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo JADES */}
          <div className="p-6 border-b border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#139a6c] flex items-center justify-center text-white shadow-md">
              <ReceiptText className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                JADES
              </h1>
              <p className="text-xs text-emerald-200/70 font-normal">
                Créditos simples
              </p>
            </div>
          </div>

          {/* Badge de Rol: Administración */}
          <div className="px-6 py-5 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs text-white border border-white/20">
              AS
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Administración
              </p>
              <p className="text-[11px] text-emerald-200/60 font-normal">
                Control de plataforma
              </p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/40 px-3 mb-2">
              MENÚ PRINCIPAL
            </p>

            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('resumen')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'resumen'
                    ? 'bg-[#139a6c] text-white shadow-sm'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Resumen general</span>
              </button>

              <button
                onClick={() => onSelectTab('tiendas')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'tiendas'
                    ? 'bg-[#139a6c] text-white shadow-sm'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Tiendas</span>
              </button>

              <button
                onClick={() => onSelectTab('registrar')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'registrar'
                    ? 'bg-[#139a6c] text-white shadow-sm'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar tienda</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer del Sidebar: Administrador sistema / Cerrar sesión */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
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
                className="text-[11px] text-emerald-200/60 hover:text-red-300 transition cursor-pointer flex items-center gap-1 mt-0.5"
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
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">
              {currentTab === 'resumen' && 'Administración'}
              {currentTab === 'tiendas' && 'Tiendas'}
              {currentTab === 'registrar' && 'Registrar tienda'}
            </h2>
            <p className="text-xs text-slate-400 font-normal">
              {currentTab === 'resumen' && 'Vista general del sistema'}
              {currentTab === 'tiendas' && 'Gestión de tiendas'}
              {currentTab === 'registrar' && 'Nueva cuenta independiente'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Buscador rápido */}
            <div className="relative hidden sm:block w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar tienda..."
                aria-label="Buscar tienda"
                value={busqueda}
                onChange={e => onBuscar(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
              />
            </div>

            {/* Campana de Notificaciones */}
            <button className="p-2 text-slate-400 hover:text-slate-600 transition cursor-pointer rounded-lg hover:bg-slate-50">
              <Bell className="w-4 h-4" />
            </button>

            {/* Avatar AS */}
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
              AS
            </div>
          </div>
        </header>

        {/* Área de Contenido Dinámico */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
