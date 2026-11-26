import { useEffect, useState } from 'react';
import { cerrarSesion } from './api/autenticacion';
import { SESSION_EXPIRED_EVENT } from './api/client';
import { listarMisTiendas } from './api/tiendas';
import { obtenerMensajeError } from './api/errores';
import type { TiendaResumenResponse } from './types/tiendas';
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
import { StorePagosPage, initialPagos } from './pages/store-admin/StorePagosPage';
import { RegistrarPagoModal, type PagoItemData } from './components/store-admin/RegistrarPagoModal';
import { PagoRegistradoModal } from './components/store-admin/PagoRegistradoModal';
import { StoreCortesPage, initialCortes } from './pages/store-admin/StoreCortesPage';
import { DetalleCorteModal, type CorteItemData } from './components/store-admin/DetalleCorteModal';
import { StoreAyudaPage } from './pages/store-admin/StoreAyudaPage';
import { StoreConfiguracionPage } from './pages/store-admin/StoreConfiguracionPage';
import { CambiosGuardadosModal } from './components/store-admin/CambiosGuardadosModal';

// Módulo 3: Portal Cliente (María Quispe)
import { ClientPortalLayout, type ClientTab } from './layouts/ClientPortalLayout';
import { ClientDashboardPage } from './pages/client-portal/ClientDashboardPage';
import { ClientComprasPage } from './pages/client-portal/ClientComprasPage';
import { ClientPlanPagosPage } from './pages/client-portal/ClientPlanPagosPage';
import { ClientPagosPage } from './pages/client-portal/ClientPagosPage';
import { ClientAyudaPage } from './pages/client-portal/ClientAyudaPage';

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
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);
  const [misTiendas, setMisTiendas] = useState<TiendaResumenResponse[]>([]);
  const [idTiendaActiva, setIdTiendaActiva] = useState<number | null>(null);
  const [cargandoTiendas, setCargandoTiendas] = useState(false);
  const [errorTiendas, setErrorTiendas] = useState<string | null>(null);
  const [recargaTiendas, setRecargaTiendas] = useState(0);

  useEffect(() => {
    if (currentUser?.rol !== 'ADMIN_NEGOCIO') return;
    const controller = new AbortController();
    listarMisTiendas(controller.signal).then((resultado) => {
      if (controller.signal.aborted) return;
      setMisTiendas(resultado);
      setIdTiendaActiva((anterior) => resultado.some(t => t.idTienda === anterior)
        ? anterior : resultado[0]?.idTienda ?? null);
      setCargandoTiendas(false);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setMisTiendas([]);
      setIdTiendaActiva(null);
      setErrorTiendas(obtenerMensajeError(error));
      setCargandoTiendas(false);
    });
    return () => controller.abort();
  }, [currentUser, recargaTiendas]);

  useEffect(() => {
    const expirar = () => {
      setCurrentUser(null);
      setMisTiendas([]);
      setIdTiendaActiva(null);
      setCargandoTiendas(false);
      setErrorTiendas(null);
      setCurrentView('login');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expirar);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expirar);
  }, []);

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

  // Estados del Portal Cliente (María Quispe)
  const [clientTab, setClientTab] = useState<ClientTab>('resumen');
  const [clientSubView, setClientSubView] = useState<'dashboard' | 'plan_pagos'>('dashboard');
  const [clientActiveCredito, setClientActiveCredito] = useState<string>('CR-001284');

  // --- Manejadores de Autenticación ---
  const handleLoginSuccess = (user: LoginResponse) => {
    setCurrentUser(user);
    setUserEmail(user.correo);

    if (user.rol === 'CLIENTE') {
      setCurrentView('client_portal');
      setClientTab('resumen');
      setClientSubView('dashboard');
    } else if (user.rol === 'ADMIN_SISTEMA') {
      setCurrentView('admin_system');
      setAdminTab('resumen');
    } else if (user.rol === 'ADMIN_NEGOCIO') {
      setMisTiendas([]);
      setIdTiendaActiva(null);
      setErrorTiendas(null);
      setCargandoTiendas(true);
      setCurrentView('store_admin');
      setStoreTab('clientes');
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
      setCurrentView('login');
    }
  };

  const handlePasswordSaved = () => {
    setCurrentView('password_updated');
  };

  const handleLogout = () => {
    cerrarSesion();
    setCurrentUser(null);
    setMisTiendas([]);
    setIdTiendaActiva(null);
    setErrorTiendas(null);
    setCargandoTiendas(false);
    setStoreSubView('lista');
    setIsRegisterClientModalOpen(false);
    setIsEditClientModalOpen(false);
    setIsEditConditionsModalOpen(false);
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
  // La navegación protegida depende exclusivamente del rol autenticado.
  const vistaProtegida = currentView === 'admin_system' || currentView === 'store_admin' || currentView === 'client_portal';
  const vistaAutorizada = currentUser && (
    (currentView === 'admin_system' && currentUser.rol === 'ADMIN_SISTEMA') ||
    (currentView === 'store_admin' && currentUser.rol === 'ADMIN_NEGOCIO') ||
    (currentView === 'client_portal' && currentUser.rol === 'CLIENTE')
  );

  if (currentView === 'login' || (vistaProtegida && !vistaAutorizada)) {
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

      <StoreAdminLayout
        tiendas={misTiendas}
        idTiendaActiva={idTiendaActiva}
        cargandoTiendas={cargandoTiendas}
        correoUsuario={currentUser?.correo ?? ''}
        onSelectTienda={(id) => {
          setIdTiendaActiva(id);
          setStoreSubView('lista');
          setStoreTab('clientes');
          setIsRegisterClientModalOpen(false);
          setIsEditClientModalOpen(false);
          setIsEditConditionsModalOpen(false);
        }}
        currentTab={storeTab}
        onSelectTab={(tab) => {
          setStoreTab(tab);
          setStoreSubView('lista');
        }}
        onLogout={handleLogout}
      >
        {cargandoTiendas ? (
          <p role="status" className="text-sm text-slate-500">Cargando tiendas autorizadas...</p>
        ) : errorTiendas ? (
          <div role="alert" className="rounded-2xl bg-white border border-red-200 p-5 space-y-3">
            <p className="text-sm text-red-700">{errorTiendas}</p>
            <button type="button" className="text-sm font-semibold text-[#139a6c]" onClick={() => {
              setErrorTiendas(null);
              setCargandoTiendas(true);
              setRecargaTiendas(n => n + 1);
            }}>Reintentar</button>
          </div>
        ) : idTiendaActiva === null ? (
          <p className="text-sm text-slate-600 bg-white rounded-2xl border border-slate-200 p-5">No tienes tiendas activas asignadas.</p>
        ) : (
          <>
        {storeTab !== 'clientes' && storeTab !== 'ayuda' && storeTab !== 'nueva_venta' && (
          <p className="mb-4 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">Vista de demostración: esta sección aún no está conectada completamente al backend.</p>
        )}
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
              <StoreClientesListPage key={idTiendaActiva} idTienda={idTiendaActiva} />
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
            key={idTiendaActiva}
            idTienda={idTiendaActiva}
            onCancel={() => { setStoreTab('clientes'); setStoreSubView('lista'); }}
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
          </>
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

// VISTA: PORTAL CLIENTE (MARÍA QUISPE)
return (
  <>

    <ClientPortalLayout
      currentTab={clientTab}
      onSelectTab={(tab) => {
        setClientTab(tab);
        setClientSubView('dashboard');
      }}
      onLogout={handleLogout}
    >
      {clientSubView === 'dashboard' && (
        <>
          {clientTab === 'resumen' && (
            <ClientDashboardPage
              onVerPlan={(codigo) => {
                setClientActiveCredito(codigo);
                setClientTab('compras');
                setClientSubView('plan_pagos');
              }}
              onVerMisCompras={() => setClientTab('compras')}
            />
          )}

          {clientTab === 'compras' && (
            <ClientComprasPage
              onVerPlan={(codigo) => {
                setClientActiveCredito(codigo);
                setClientTab('compras');
                setClientSubView('plan_pagos');
              }}
            />
          )}

          {clientTab === 'pagos' && <ClientPagosPage />}

          {clientTab === 'ayuda' && <ClientAyudaPage />}
        </>
      )}

      {clientSubView === 'plan_pagos' && (
        <ClientPlanPagosPage
          codigoCredito={clientActiveCredito}
          onBackToCompras={() => {
            setClientSubView('dashboard');
            setClientTab('compras');
          }}
        />
      )}
    </ClientPortalLayout>
  </>
);
}

export default App;
