import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyCodePage } from './pages/auth/VerifyCodePage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PasswordUpdatedPage } from './pages/auth/PasswordUpdatedPage';

// Módulo 1: Administrador del Sistema
import { AdminSystemLayout, type AdminTab } from './layouts/AdminSystemLayout';
import { DashboardOverviewPage } from './pages/admin-system/DashboardOverviewPage';
import { TiendasListPage } from './pages/admin-system/TiendasListPage';
import { RegistrarTiendaPage } from './pages/admin-system/RegistrarTiendaPage';
import { EditarTiendaModal, type TiendaData } from './components/admin-system/EditarTiendaModal';

// Módulo 2: Administrador del Negocio (Bodega San Blas / Luis Alvarez)
import { StoreAdminLayout, type StoreTab } from './layouts/StoreAdminLayout';
import { StoreDashboardPage } from './pages/store-admin/StoreDashboardPage';
import { StoreClientesListPage, type ClienteStoreItem } from './pages/store-admin/StoreClientesListPage';
import { StoreClienteDetailPage } from './pages/store-admin/StoreClienteDetailPage';
import { StorePlanPagosPage } from './pages/store-admin/StorePlanPagosPage';
import { RegistrarClienteModal } from './components/store-admin/RegistrarClienteModal';
import { EditarClienteModal } from './components/store-admin/EditarClienteModal';
import { EditarCondicionesModal } from './components/store-admin/EditarCondicionesModal';
import { StoreProductosListPage, initialProductos } from './pages/store-admin/StoreProductosListPage';
import { ProductoModal, type ProductoData } from './components/store-admin/ProductoModal';
import { StoreNuevaVentaPage } from './pages/store-admin/StoreNuevaVentaPage';
import { CreditoRegistradoModal } from './components/store-admin/CreditoRegistradoModal';
import { StorePagosPage, initialPagos } from './pages/store-admin/StorePagosPage';
import { RegistrarPagoModal, type PagoItemData } from './components/store-admin/RegistrarPagoModal';
import { PagoRegistradoModal } from './components/store-admin/PagoRegistradoModal';
import { StoreCortesPage, initialCortes } from './pages/store-admin/StoreCortesPage';
import { DetalleCorteModal, type CorteItemData } from './components/store-admin/DetalleCorteModal';
import { StoreAyudaPage } from './pages/store-admin/StoreAyudaPage';
import { StoreConfiguracionPage } from './pages/store-admin/StoreConfiguracionPage';
import { CambiosGuardadosModal } from './components/store-admin/CambiosGuardadosModal';

// Módulo 3: Portal Cliente
import { ClientPortal } from './features/client-portal/ClientPortal';

import type { LoginResponse } from './types/finanzas';

export type MainView =
  | 'login'             // 1. Inicia sesión
  | 'forgot_password'   // 2. Recuperar contraseña
  | 'verify_code'       // 3. Verifica tu correo
  | 'reset_password'    // 4. Crea una nueva contraseña
  | 'password_updated'  // 5. Contraseña actualizada
  | 'admin_system'      // 6. Panel Administrador del Sistema
  | 'store_admin'       // 7. Panel Administrador del Negocio (Bodega San Blas)
  | 'client_portal';    // 8. Portal Cliente (María Quispe)

export type StoreSubView = 'lista' | 'detalle_cliente' | 'plan_pagos';

// Tiendas registradas en la plataforma
const initialTiendas: TiendaData[] = [
  {
    id: 1,
    nombreComercial: 'Bodega San Blas',
    razonSocial: 'Luis Alvarez',
    giro: 'Bodega',
    telefono: '987 654 321',
    direccion: 'Cusco',
    correo: 'contacto@sanblas.com',
    estado: 'Activo',
    documento: '20601234567',
    adminNombre: 'Luis Alvarez',
    adminCorreo: 'luis@ejemplo.com',
    adminTelefono: '987 654 321',
  },
  {
    id: 2,
    nombreComercial: 'Dulce Trigo',
    razonSocial: 'Elena Ramos',
    giro: 'Panadería',
    telefono: '956 210 874',
    direccion: 'Arequipa',
    correo: 'contacto@dulcetrigo.com',
    estado: 'Activo',
    documento: '20601234568',
    adminNombre: 'Elena Ramos',
    adminCorreo: 'elena@ejemplo.com',
    adminTelefono: '956 210 874',
  },
  {
    id: 3,
    nombreComercial: 'Carnes Don Pepe',
    razonSocial: 'José Medina',
    giro: 'Carnicería',
    telefono: '944 823 110',
    direccion: 'Lima',
    correo: 'contacto@donpepe.com',
    estado: 'Activo',
    documento: '20601234569',
    adminNombre: 'José Medina',
    adminCorreo: 'jose@ejemplo.com',
    adminTelefono: '944 823 110',
  },
  {
    id: 4,
    nombreComercial: 'Studio Bella',
    razonSocial: 'Karla Soto',
    giro: 'Peluquería',
    telefono: '933 442 190',
    direccion: 'Trujillo',
    correo: 'contacto@studiobella.com',
    estado: 'Activo',
    documento: '20601234570',
    adminNombre: 'Karla Soto',
    adminCorreo: 'karla@ejemplo.com',
    adminTelefono: '933 442 190',
  },
];

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'l***@ejemplo.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***@${domain}`;
}

export function App() {
  // POR SEGURIDAD ESTRICTA: Siempre arranca en 'login'
  const [currentView, setCurrentView] = useState<MainView>('login');
  const [userEmail, setUserEmail] = useState<string>('luis@ejemplo.com');
  const [isRecoveringPassword, setIsRecoveringPassword] = useState<boolean>(false);
  const [, setCurrentUser] = useState<LoginResponse | null>(null);

  // Estados del Administrador del Sistema
  const [adminTab, setAdminTab] = useState<AdminTab>('resumen');
  const [tiendas, setTiendas] = useState<TiendaData[]>(initialTiendas);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTienda, setEditingTienda] = useState<TiendaData | null>(null);

  // Estados del Administrador del Negocio (Bodega San Blas)
  const [storeTab, setStoreTab] = useState<StoreTab>('inicio');
  const [storeSubView, setStoreSubView] = useState<StoreSubView>('lista');
  const [activeCreditoCode, setActiveCreditoCode] = useState<string>('CR-001284');

  // Modales de Clientes (Bodega San Blas)
  const [isRegisterClientModalOpen, setIsRegisterClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isEditConditionsModalOpen, setIsEditConditionsModalOpen] = useState(false);

  // Estados de Productos y Servicios (Bodega San Blas)
  const [productos, setProductos] = useState<ProductoData[]>(initialProductos);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [productoModalMode, setProductoModalMode] = useState<'nuevo' | 'editar'>('nuevo');
  const [editingProducto, setEditingProducto] = useState<ProductoData | null>(null);

  // Estados de Nueva Venta a Crédito (Bodega San Blas)
  const [isCreditoRegistradoModalOpen, setIsCreditoRegistradoModalOpen] = useState(false);
  const [registeredCreditoCode, setRegisteredCreditoCode] = useState('CR-001285');

  const handleOpenNewProducto = () => {
    setProductoModalMode('nuevo');
    setEditingProducto(null);
    setIsProductoModalOpen(true);
  };

  const handleOpenEditProducto = (producto: ProductoData) => {
    setProductoModalMode('editar');
    setEditingProducto(producto);
    setIsProductoModalOpen(true);
  };

  const handleSaveProducto = (productoGuardado: ProductoData) => {
    if (productoModalMode === 'nuevo') {
      const nuevo: ProductoData = {
        ...productoGuardado,
        id: Date.now(),
      };
      setProductos((prev) => [nuevo, ...prev]);
    } else {
      setProductos((prev) =>
        prev.map((p) => (p.id === productoGuardado.id ? productoGuardado : p))
      );
    }
  };

  // Estados de Pagos y Cobranzas (Bodega San Blas)
  const [pagosList, setPagosList] = useState<PagoItemData[]>(initialPagos);
  const [selectedPagoForRegister, setSelectedPagoForRegister] = useState<PagoItemData | null>(null);
  const [isRegistrarPagoModalOpen, setIsRegistrarPagoModalOpen] = useState(false);
  const [isPagoRegistradoModalOpen, setIsPagoRegistradoModalOpen] = useState(false);
  const [lastPaidItem, setLastPaidItem] = useState<PagoItemData | null>(null);

  const handleOpenRegistrarPago = (pago: PagoItemData) => {
    setSelectedPagoForRegister(pago);
    setIsRegistrarPagoModalOpen(true);
  };

  const handleConfirmPago = (pago: PagoItemData) => {
    setPagosList((prev) => prev.filter((p) => p.id !== pago.id));
    setSelectedPagoForRegister(null);
    setIsRegistrarPagoModalOpen(false);
    setLastPaidItem(pago);
    setIsPagoRegistradoModalOpen(true);
  };

  // Estados de Cortes y Cobranzas (Bodega San Blas)
  const [cortesList] = useState<CorteItemData[]>(initialCortes);
  const [selectedCorteForDetail, setSelectedCorteForDetail] = useState<CorteItemData | null>(null);
  const [isDetalleCorteModalOpen, setIsDetalleCorteModalOpen] = useState(false);

  const handleOpenDetalleCorte = (corte: CorteItemData) => {
    setSelectedCorteForDetail(corte);
    setIsDetalleCorteModalOpen(true);
  };

  const handleRegistrarPagoFromCorte = (corte: CorteItemData) => {
    const foundPago = pagosList.find((p) => p.cliente === corte.cliente) || {
      id: corte.id,
      cliente: corte.cliente,
      obligacion: corte.obligacion,
      vence: corte.fechaPago.slice(0, 6),
      capital: corte.capital,
      interesCompensatorio: corte.interesCompensatorio,
      mora: corte.mora,
      total: corte.totalPagar,
      estado: (corte.estado === 'Pagado' ? 'Pendiente' : corte.estado) as 'Pendiente' | 'En mora' | 'Por vencer',
      diasAtraso: corte.estado === 'En mora' ? 8 : 0,
      capitalPendientePost: corte.cliente.includes('Rosa') ? 0.00 : 560.28,
      creditoDisponiblePost: corte.cliente.includes('Rosa') ? 2000.00 : 1439.72,
      capitalLiberado: corte.capital,
    };
    setSelectedPagoForRegister(foundPago);
    setIsRegistrarPagoModalOpen(true);
  };

  // Estados de Configuración
  const [isCambiosGuardadosModalOpen, setIsCambiosGuardadosModalOpen] = useState(false);

  // --- Manejadores de Autenticación ---
  const handleLoginSuccess = (user: LoginResponse) => {
    setCurrentUser(user);
    setUserEmail(user.correo);

    if (user.rol === 'CLIENTE' || user.correo.toLowerCase().includes('maria')) {
      setCurrentView('client_portal');
    } else if (user.rol === 'ADMIN_SISTEMA' || user.correo.toLowerCase().includes('admin@jades')) {
      setCurrentView('admin_system');
      setAdminTab('resumen');
    } else {
      // Por defecto entra al Administrador del Negocio (Bodega San Blas)
      setCurrentView('store_admin');
      setStoreTab('inicio');
      setStoreSubView('lista');
    }
  };

  const handleGoToForgotPassword = () => {
    setIsRecoveringPassword(true);
    setCurrentView('forgot_password');
  };

  const handleCodeSent = (email: string) => {
    setUserEmail(email);
    setCurrentView('verify_code');
  };

  const handleCodeVerified = () => {
    if (isRecoveringPassword) {
      setCurrentView('reset_password');
    } else {
      setCurrentView('store_admin');
    }
  };

  const handlePasswordSaved = () => {
    setCurrentView('password_updated');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setCurrentUser(null);
    setIsRecoveringPassword(false);
    setCurrentView('login');
  };

  // --- Manejadores de Tiendas (Admin Sistema) ---
  const handleOpenEdit = (tienda: TiendaData) => {
    setEditingTienda(tienda);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (tiendaActualizada: TiendaData) => {
    setTiendas((prev) =>
      prev.map((t) => (t.id === tiendaActualizada.id ? tiendaActualizada : t))
    );
  };

  const handleRegisterSuccess = (nuevaTienda: TiendaData) => {
    setTiendas((prev) => [nuevaTienda, ...prev]);
    setAdminTab('tiendas');
  };

  // --- Renderizado Condicional de Vistas ---
  const renderRoleDemoBar = (currentRoleLabel: string) => (
    <div className="bg-slate-900 text-white text-xs px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
      <div className="flex items-center space-x-2">
        <span className="text-slate-400 font-medium hidden sm:inline">Demostración académica JADES:</span>
        <span className="text-emerald-400 font-bold">{currentRoleLabel}</span>
      </div>

      <div className="flex items-center space-x-1.5 text-xs">
        <span className="text-slate-400 mr-1 hidden md:inline">Cambiar vista:</span>
        <button
          onClick={() => {
            setCurrentView('admin_system');
            setAdminTab('resumen');
          }}
          className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
            currentView === 'admin_system'
              ? 'bg-[#139a6c] text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Admin Sistema
        </button>

        <button
          onClick={() => {
            setCurrentView('store_admin');
            setStoreTab('inicio');
          }}
          className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
            currentView === 'store_admin'
              ? 'bg-[#139a6c] text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Bodega San Blas
        </button>

        <button
          onClick={() => {
            setCurrentView('client_portal');
          }}
          className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
            currentView === 'client_portal'
              ? 'bg-[#139a6c] text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Portal Cliente (María)
        </button>
      </div>
    </div>
  );

  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={handleGoToForgotPassword}
      />
    );
  }

  if (currentView === 'forgot_password') {
    return (
      <ForgotPasswordPage
        onCodeSent={handleCodeSent}
        onBackToLogin={handleLogout}
      />
    );
  }

  if (currentView === 'verify_code') {
    return (
      <VerifyCodePage
        emailMasked={maskEmail(userEmail)}
        onVerify={handleCodeVerified}
        onResend={() => alert(`Nuevo código de 6 dígitos enviado a ${maskEmail(userEmail)}`)}
        onBackToLogin={handleLogout}
      />
    );
  }

  if (currentView === 'reset_password') {
    return (
      <ResetPasswordPage
        onPasswordSaved={handlePasswordSaved}
        onBackToLogin={handleLogout}
      />
    );
  }

  if (currentView === 'password_updated') {
    return (
      <PasswordUpdatedPage
        onBackToLogin={handleLogout}
      />
    );
  }

  // VISTA: ADMINISTRADOR DEL SISTEMA
  if (currentView === 'admin_system') {
    return (
      <>
        {renderRoleDemoBar('Vista activa: Administrador del Sistema')}

        <AdminSystemLayout
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          onLogout={handleLogout}
        >
          {adminTab === 'resumen' && (
            <DashboardOverviewPage
              onGoToRegister={() => setAdminTab('registrar')}
              onGoToStores={() => setAdminTab('tiendas')}
            />
          )}

          {adminTab === 'tiendas' && (
            <TiendasListPage
              tiendas={tiendas}
              onGoToRegister={() => setAdminTab('registrar')}
              onEditTienda={handleOpenEdit}
            />
          )}

          {adminTab === 'registrar' && (
            <RegistrarTiendaPage
              onCancel={() => setAdminTab('tiendas')}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}
        </AdminSystemLayout>

        <EditarTiendaModal
          isOpen={isEditModalOpen}
          tienda={editingTienda}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      </>
    );
  }

  // VISTA: ADMINISTRADOR DEL NEGOCIO (BODEGA SAN BLAS / LUIS ALVAREZ)
  if (currentView === 'store_admin') {
    return (
      <>
        {renderRoleDemoBar('Vista activa: Bodega San Blas (Administrador del Negocio)')}

      <StoreAdminLayout
        currentTab={storeTab}
        onSelectTab={(tab) => {
          setStoreTab(tab);
          setStoreSubView('lista');
        }}
        onLogout={handleLogout}
      >
        {/* Pestaña: Inicio (Dashboard de la Bodega) */}
        {storeTab === 'inicio' && (
          <StoreDashboardPage
            onGoToClients={() => {
              setStoreTab('clientes');
              setStoreSubView('lista');
            }}
            onGoToSales={() => setStoreTab('nueva_venta')}
          />
        )}

        {/* Pestaña: Clientes */}
        {storeTab === 'clientes' && (
          <>
            {/* 1. Lista de Clientes */}
            {storeSubView === 'lista' && (
              <StoreClientesListPage
                onSelectCliente={() => setStoreSubView('detalle_cliente')}
                onNewClient={() => setIsRegisterClientModalOpen(true)}
              />
            )}

            {/* 2. Detalle del Cliente (María Quispe) */}
            {storeSubView === 'detalle_cliente' && (
              <StoreClienteDetailPage
                onBack={() => setStoreSubView('lista')}
                onViewPlanPagos={(codigo) => {
                  setActiveCreditoCode(codigo);
                  setStoreSubView('plan_pagos');
                }}
                onEditClient={() => setIsEditClientModalOpen(true)}
                onEditConditions={() => setIsEditConditionsModalOpen(true)}
                onNewSale={() => setStoreTab('nueva_venta')}
              />
            )}

            {/* 3. Plan de Pagos / Cronograma Francés (HU-12) */}
            {storeSubView === 'plan_pagos' && (
              <StorePlanPagosPage
                codigoCredito={activeCreditoCode}
                onBackToClient={() => setStoreSubView('detalle_cliente')}
              />
            )}
          </>
        )}

        {/* Pestaña: Productos y servicios */}
        {storeTab === 'productos' && (
          <StoreProductosListPage
            productos={productos}
            onNewProducto={handleOpenNewProducto}
            onEditProducto={handleOpenEditProducto}
          />
        )}

        {/* Pestaña: Nueva venta a crédito */}
        {storeTab === 'nueva_venta' && (
          <StoreNuevaVentaPage
            productosCatalogo={productos}
            onCancel={() => setStoreTab('inicio')}
            onConfirmSale={(datosVenta) => {
              console.log('Venta confirmada:', datosVenta);
              setRegisteredCreditoCode('CR-001285');
              setIsCreditoRegistradoModalOpen(true);
            }}
          />
        )}

        {/* Pestaña: Pagos */}
        {storeTab === 'pagos' && (
          <StorePagosPage
            pagos={pagosList}
            onOpenRegistrarPago={handleOpenRegistrarPago}
          />
        )}

        {/* Pestaña: Cortes y cobranzas */}
        {storeTab === 'cortes' && (
          <StoreCortesPage
            cortes={cortesList}
            onViewDetalle={handleOpenDetalleCorte}
          />
        )}

        {/* Pestaña: Ayuda */}
        {storeTab === 'ayuda' && (
          <StoreAyudaPage onNavigateTab={(tab) => setStoreTab(tab)} />
        )}

        {/* Pestaña: Configuración */}
        {storeTab === 'configuracion' && (
          <StoreConfiguracionPage
            onSaveSuccess={() => setIsCambiosGuardadosModalOpen(true)}
          />
        )}
      </StoreAdminLayout>

      {/* Modales del Administrador del Negocio */}
      <RegistrarClienteModal
        isOpen={isRegisterClientModalOpen}
        onClose={() => setIsRegisterClientModalOpen(false)}
        onClientRegistered={(nuevoCliente: ClienteStoreItem) => {
          console.log('Cliente registrado:', nuevoCliente);
          setIsRegisterClientModalOpen(false);
        }}
      />

      <EditarClienteModal
        isOpen={isEditClientModalOpen}
        onClose={() => setIsEditClientModalOpen(false)}
        onSave={(datosActualizados) => {
          console.log('Cliente actualizado:', datosActualizados);
          setIsEditClientModalOpen(false);
        }}
      />

      <EditarCondicionesModal
        isOpen={isEditConditionsModalOpen}
        onClose={() => setIsEditConditionsModalOpen(false)}
        onSave={(condicionesActualizadas) => {
          console.log('Condiciones actualizadas:', condicionesActualizadas);
          setIsEditConditionsModalOpen(false);
        }}
      />

      <ProductoModal
        isOpen={isProductoModalOpen}
        mode={productoModalMode}
        initialData={editingProducto}
        onClose={() => setIsProductoModalOpen(false)}
        onSave={handleSaveProducto}
      />

      <CreditoRegistradoModal
        isOpen={isCreditoRegistradoModalOpen}
        operacionCodigo={registeredCreditoCode}
        clienteNombre="María Quispe"
        onClose={() => setIsCreditoRegistradoModalOpen(false)}
        onGoToClientDetail={() => {
          setIsCreditoRegistradoModalOpen(false);
          setStoreTab('clientes');
          setStoreSubView('detalle_cliente');
        }}
        onGoToHome={() => {
          setIsCreditoRegistradoModalOpen(false);
          setStoreTab('inicio');
        }}
      />

      <RegistrarPagoModal
        isOpen={isRegistrarPagoModalOpen}
        pagoItem={selectedPagoForRegister}
        onClose={() => setIsRegistrarPagoModalOpen(false)}
        onConfirmPago={handleConfirmPago}
      />

      <PagoRegistradoModal
        isOpen={isPagoRegistradoModalOpen}
        pagoItem={lastPaidItem}
        onClose={() => setIsPagoRegistradoModalOpen(false)}
      />

      <DetalleCorteModal
        isOpen={isDetalleCorteModalOpen}
        corte={selectedCorteForDetail}
        onClose={() => setIsDetalleCorteModalOpen(false)}
        onRegistrarPago={handleRegistrarPagoFromCorte}
      />

      <CambiosGuardadosModal
        isOpen={isCambiosGuardadosModalOpen}
        onClose={() => setIsCambiosGuardadosModalOpen(false)}
      />
    </>
  );
}

// VISTA: PORTAL CLIENTE
return (
  <>
    {renderRoleDemoBar('Vista activa: Portal Cliente (María Quispe)')}
    <ClientPortal onLogout={handleLogout} />
  </>
);
}

export default App;
