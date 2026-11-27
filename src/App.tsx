import { useCallback, useEffect, useState } from 'react';
import { cerrarSesion, recuperarSesion } from './api/autenticacion';
import { SESSION_EXPIRED_EVENT } from './api/client';
import { listarMisTiendas, listarTiendas } from './api/tiendas';
import { obtenerMensajeError } from './api/errores';
import type { TiendaDetalleResponse, TiendaRegistradaResponse, TiendaResumenResponse } from './types/tiendas';
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
import { EditarTiendaModal } from './components/admin-system/EditarTiendaModal';

// Módulo 2: Administrador del Negocio (Bodega San Blas / Luis Alvarez)
import { StoreAdminLayout, type StoreTab } from './layouts/StoreAdminLayout';
import { StoreDashboardPage } from './pages/store-admin/StoreDashboardPage';
import { StoreClientesListPage, type ClienteStoreItem } from './pages/store-admin/StoreClientesListPage';
import { StoreClienteDetailPage } from './pages/store-admin/StoreClienteDetailPage';
import { StorePlanPagosPage } from './pages/store-admin/StorePlanPagosPage';
import { RegistrarClienteModal } from './components/store-admin/RegistrarClienteModal';
import { EditarClienteModal } from './components/store-admin/EditarClienteModal';
import { EditarCondicionesModal } from './components/store-admin/EditarCondicionesModal';
import { StoreProductosListPage } from './pages/store-admin/StoreProductosListPage';
import { StoreNuevaVentaPage } from './pages/store-admin/StoreNuevaVentaPage';
import { StorePagosPage, initialPagos } from './pages/store-admin/StorePagosPage';
import { RegistrarPagoModal, type PagoItemData } from './components/store-admin/RegistrarPagoModal';
import { PagoRegistradoModal } from './components/store-admin/PagoRegistradoModal';
import { StoreCortesPage, initialCortes } from './pages/store-admin/StoreCortesPage';
import { DetalleCorteModal, type CorteItemData } from './components/store-admin/DetalleCorteModal';
import { StoreAyudaPage } from './pages/store-admin/StoreAyudaPage';
import { StoreConfiguracionPage } from './pages/store-admin/StoreConfiguracionPage';

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

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'l***@ejemplo.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***@${domain}`;
}

export function App() {
  // Conservar la restauración del portal cliente; los administradores ingresan de nuevo.
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(() => recuperarSesion('CLIENTE'));
  const [currentView, setCurrentView] = useState<MainView>(() => currentUser ? 'client_portal' : 'login');
  const [userEmail, setUserEmail] = useState<string>(() => currentUser?.correo ?? '');
  const [isRecoveringPassword, setIsRecoveringPassword] = useState<boolean>(false);
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
      setTiendas([]);
      setAvisoTiendas(null);
      setBusquedaTiendas('');
      setIsEditModalOpen(false);
      setEditingTienda(null);
      cerrarSesion();
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
  const [tiendas, setTiendas] = useState<TiendaDetalleResponse[]>([]);
  const [cargandoAdminTiendas, setCargandoAdminTiendas] = useState(false);
  const [errorAdminTiendas, setErrorAdminTiendas] = useState<string | null>(null);
  const [recargaAdminTiendas, setRecargaAdminTiendas] = useState(0);
  const [avisoTiendas, setAvisoTiendas] = useState<string | null>(null);
  const [busquedaTiendas, setBusquedaTiendas] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTienda, setEditingTienda] = useState<TiendaDetalleResponse | null>(null);

  useEffect(() => {
    if (currentUser?.rol !== 'ADMIN_SISTEMA') return;
    const controller = new AbortController();
    setCargandoAdminTiendas(true);
    setErrorAdminTiendas(null);
    listarTiendas(controller.signal).then(data => {
      if (!controller.signal.aborted) setTiendas(data);
    }).catch(e => {
      if (!controller.signal.aborted) setErrorAdminTiendas(obtenerMensajeError(e));
    }).finally(() => {
      if (!controller.signal.aborted) setCargandoAdminTiendas(false);
    });
    return () => controller.abort();
  }, [currentUser, recargaAdminTiendas]);

  // Estados del Administrador del Negocio (Bodega San Blas)
  const [storeTab, setStoreTab] = useState<StoreTab>('inicio');
  const [storeSubView, setStoreSubView] = useState<StoreSubView>('lista');
  const [activeCreditoCode, setActiveCreditoCode] = useState<string>('CR-001284');

  // Modales de Clientes (Bodega San Blas)
  const [isRegisterClientModalOpen, setIsRegisterClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isEditConditionsModalOpen, setIsEditConditionsModalOpen] = useState(false);

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

  // --- Manejadores de Autenticación ---
  const handleLoginSuccess = (user: LoginResponse) => {
    setCurrentUser(user);
    setUserEmail(user.correo);

    if (user.rol === 'CLIENTE') {
      setCurrentView('client_portal');
    } else if (user.rol === 'ADMIN_SISTEMA') {
      setTiendas([]);
      setAvisoTiendas(null);
      setBusquedaTiendas('');
      setEditingTienda(null);
      setIsEditModalOpen(false);
      setCargandoAdminTiendas(true);
      setErrorAdminTiendas(null);
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
    setTiendas([]);
    setAvisoTiendas(null);
    setBusquedaTiendas('');
    setIsEditModalOpen(false);
    setEditingTienda(null);
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
  const handleOpenEdit = (tienda: TiendaDetalleResponse) => {
    setEditingTienda(tienda);
    setIsEditModalOpen(true);
  };

  const recargarAdminTiendas = () => {
    setCargandoAdminTiendas(true);
    setRecargaAdminTiendas(n => n + 1);
  };

  const handleSaveEdit = (tiendaActualizada: TiendaDetalleResponse, mensaje: string) => {
    if (currentUser?.rol !== 'ADMIN_SISTEMA' || localStorage.getItem('token') !== currentUser.tokenAcceso) return;
    setTiendas(prev => prev.map(t => t.idTienda === tiendaActualizada.idTienda ? tiendaActualizada : t));
    setAvisoTiendas(mensaje);
    recargarAdminTiendas();
  };

  const handleRegisterSuccess = (nuevaTienda: TiendaRegistradaResponse) => {
    if (currentUser?.rol !== 'ADMIN_SISTEMA' || localStorage.getItem('token') !== currentUser.tokenAcceso) return;
    setAvisoTiendas(`Tienda registrada con ID ${nuevaTienda.idTienda}. Administrador: ${nuevaTienda.correoAdministrador}.`);
    setBusquedaTiendas('');
    setAdminTab('tiendas');
    recargarAdminTiendas();
  };

  const actualizarTiendaSeleccionada = useCallback((tienda: TiendaDetalleResponse) => {
    if (currentUser?.rol !== 'ADMIN_NEGOCIO' || localStorage.getItem('token') !== currentUser.tokenAcceso) return;
    setMisTiendas(prev => prev.map(t => t.idTienda === tienda.idTienda ? {
      idTienda: tienda.idTienda, nombreTienda: tienda.nombreTienda, documentoTienda: tienda.documentoTienda, estadoTienda: tienda.estadoTienda,
    } : t));
  }, [currentUser]);

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
        onResend={() => alert('Por el momento no podemos reenviar el código. Comunícate con el administrador para recuperar tu acceso.')}
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
          busqueda={busquedaTiendas}
          onBuscar={(valor) => { setBusquedaTiendas(valor); setAdminTab('tiendas'); }}
          onSelectTab={setAdminTab}
          onLogout={handleLogout}
        >
          {adminTab === 'resumen' && (
            <DashboardOverviewPage
              tiendas={tiendas}
              cargando={cargandoAdminTiendas}
              error={errorAdminTiendas}
              onRecargar={recargarAdminTiendas}
              onGoToRegister={() => setAdminTab('registrar')}
              onGoToStores={() => setAdminTab('tiendas')}
            />
          )}

          {adminTab === 'tiendas' && (
            <TiendasListPage
              tiendas={tiendas}
              aviso={avisoTiendas}
              busqueda={busquedaTiendas}
              onBuscar={setBusquedaTiendas}
              cargando={cargandoAdminTiendas}
              error={errorAdminTiendas}
              onRecargar={recargarAdminTiendas}
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

        {isEditModalOpen && editingTienda && <EditarTiendaModal
          key={editingTienda.idTienda}
          isOpen={isEditModalOpen}
          tienda={editingTienda}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />}
      </>
    );
  }

  // VISTA: ADMINISTRADOR DEL NEGOCIO (BODEGA SAN BLAS / LUIS ALVAREZ)
  if (currentView === 'store_admin') {
    const tiendaSeleccionada = misTiendas.find(t => t.idTienda === idTiendaActiva);
    const soloConsulta = tiendaSeleccionada?.estadoTienda !== 'ACTIVO';
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
          <p className="text-sm text-slate-600 bg-white rounded-2xl border border-slate-200 p-5">No tienes tiendas asignadas.</p>
        ) : (
          <>
        {soloConsulta && <p className="mb-4 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">Tienda inactiva: se permiten consultas y cobranzas, no nuevas ventas ni modificaciones.</p>}
        {(storeTab === 'inicio' || storeTab === 'pagos' || storeTab === 'cortes') && (
          <p className="mb-4 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">
            {storeTab === 'inicio' && 'Este resumen muestra datos de ejemplo, no los saldos reales de tu tienda.'}
            {storeTab === 'pagos' && 'Los pagos de esta sección son de ejemplo. Los cambios no se registran en tu cuenta real.'}
            {storeTab === 'cortes' && 'Los reportes de esta sección muestran datos de ejemplo. No los utilices para realizar cobros.'}
          </p>
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
            key={idTiendaActiva}
            idTienda={idTiendaActiva}
            soloConsulta={misTiendas.find(t => t.idTienda === idTiendaActiva)?.estadoTienda !== 'ACTIVO'}
          />
        )}

        {/* Pestaña: Nueva venta a crédito */}
        {storeTab === 'nueva_venta' && soloConsulta && <p className="text-sm text-slate-600">No se pueden registrar ventas en una tienda inactiva.</p>}
        {storeTab === 'nueva_venta' && !soloConsulta && (
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
        {storeTab === 'configuracion' && tiendaSeleccionada && (
          <StoreConfiguracionPage
            key={idTiendaActiva}
            tienda={tiendaSeleccionada}
            correoUsuario={currentUser?.correo ?? ''}
            onActualizar={actualizarTiendaSeleccionada}
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

    </>
  );
}

  // El portal gestiona su propia navegación y cuenta; la autorización sigue en App y el servidor.
  if (currentUser?.rol !== 'CLIENTE') return null;
  return <ClientPortal key={currentUser.id} onLogout={handleLogout} />;
}

export default App;
