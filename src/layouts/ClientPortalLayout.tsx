import React from 'react';
import {
  ReceiptText,
  Home,
  FileText,
  CreditCard,
  HelpCircle,
  Search,
  Bell,
  LogOut,
} from 'lucide-react';

export type ClientTab = 'resumen' | 'compras' | 'pagos' | 'ayuda';

interface ClientPortalLayoutProps {
  currentTab: ClientTab;
  onSelectTab: (tab: ClientTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({
  currentTab,
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
          <div className="p-5 border-b border-white/10 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#139a6c] flex items-center justify-center text-white shadow-md">
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

          {/* Badge: Portal cliente - María Quispe */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="bg-white/10 rounded-2xl p-2.5 flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                MQ
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  Portal cliente
                </p>
                <p className="text-[10px] text-emerald-200/70 font-normal">
                  María Quispe
                </p>
              </div>
            </div>
          </div>

          {/* Menú de Navegación Principal */}
          <div className="px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/40 px-3 mb-2">
              MENÚ PRINCIPAL
            </p>

            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('resumen')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'resumen'
                    ? 'bg-[#139a6c] text-white shadow-xs'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Mi resumen</span>
              </button>

              <button
                onClick={() => onSelectTab('compras')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'compras'
                    ? 'bg-[#139a6c] text-white shadow-xs'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Mis compras</span>
              </button>

              <button
                onClick={() => onSelectTab('pagos')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'pagos'
                    ? 'bg-[#139a6c] text-white shadow-xs'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Mis pagos</span>
              </button>

              <button
                onClick={() => onSelectTab('ayuda')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  currentTab === 'ayuda'
                    ? 'bg-[#139a6c] text-white shadow-xs'
                    : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Ayuda</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer del Sidebar: Perfil María Quispe & Cerrar sesión */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                MQ
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  María Quispe
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
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-end">
          <div className="flex items-center space-x-3">
            {/* Buscador de compras */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar compras..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
              />
            </div>

            {/* Campana */}
            <button className="p-2 text-slate-400 hover:text-slate-600 transition cursor-pointer rounded-lg hover:bg-slate-50">
              <Bell className="w-4 h-4" />
            </button>

            {/* Avatar MQ */}
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
              MQ
            </div>
          </div>
        </header>

        {/* Área de Contenido a pantalla completa y óptima lectura */}
        <main className="flex-1 p-6 sm:p-8 md:p-10 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
