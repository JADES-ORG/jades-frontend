import { useCallback, useEffect, useState } from 'react';
import { cerrarSesion, expiracionSesion, recuperarSesion, type CodigoRecuperacionResponse } from './api/autenticacion';
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
import { StoreClientesListPage } from './pages/store-admin/StoreClientesListPage';
import { StoreClienteDetailPage } from './pages/store-admin/StoreClienteDetailPage';
import { RegistrarClienteModal } from './components/store-admin/RegistrarClienteModal';
import { EditarClienteModal } from './components/store-admin/EditarClienteModal';
import { EditarCondicionesModal } from './components/store-admin/EditarCondicionesModal';
import { StoreProductosListPage } from './pages/store-admin/StoreProductosListPage';
import { StoreNuevaVentaPage } from './pages/store-admin/StoreNuevaVentaPage';
import { StorePagosPage } from './pages/store-admin/StorePagosPage';
import { StoreCortesPage } from './pages/store-admin/StoreCortesPage';
import { StoreAyudaPage } from './pages/store-admin/StoreAyudaPage';
import { StoreConfiguracionPage } from './pages/store-admin/StoreConfiguracionPage';

// Módulo 3: Portal Cliente
import { ClientPortal } from './features/client-portal/ClientPortal';

import type { LoginResponse } from './types/finanzas';
import type { ClienteResponse, CondicionCrediticiaResponse } from './types/clientes';

export type MainView =
    | 'login'             // 1. Inicia sesión
    | 'forgot_password'   // 2. Recuperar contraseña
    | 'verify_code'       // 3. Verifica tu correo
    | 'reset_password'    // 4. Crea una nueva contraseña
    | 'password_updated'  // 5. Contraseña actualizada
    | 'admin_system'      // 6. Panel Administrador del Sistema
    | 'store_admin'       // 7. Panel Administrador del Negocio (Bodega San Blas)
    | 'client_portal';    // 8. Portal Cliente (María Quispe)

export type StoreSubView = 'lista' | 'detalle_cliente';

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'l***@ejemplo.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***@${domain}`;
}

export function App() {
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(() => recuperarSesion());
  const [currentView, setCurrentView] = useState<MainView>(() => {
    switch (currentUser?.rol) {
      case 'ADMIN_SISTEMA': return 'admin_system';
      case 'ADMIN_NEGOCIO': return 'store_admin';
      case 'CLIENTE': return 'client_portal';
      default: return 'login';
    }
  });
  const [userEmail, setUserEmail] = useState<string>(() => currentUser?.correo ?? '');
  const [codigoRecuperacion, setCodigoRecuperacion] = useState<CodigoRecuperacionResponse | null>(null);
  const [tokenRecuperacion, setTokenRecuperacion] = useState<string | null>(null);
  const [misTiendas, setMisTiendas] = useState<TiendaResumenResponse[]>([]);
  const [idTiendaActiva, setIdTiendaActiva] = useState<number | null>(null);
  const [cargandoTiendas, setCargandoTiendas] = useState(currentUser?.rol === 'ADMIN_NEGOCIO');
  const [errorTiendas, setErrorTiendas] = useState<string | null>(null);
  const [recargaTiendas, setRecargaTiendas] = useState(0);

  useEffect(() => {
    if (currentUser?.rol !== 'ADMIN_NEGOCIO') return;
    const controller = new AbortController();
    listarMisTiendas(controller.signal).then((resultado) => {
      if (controller.signal.aborted) return;
      setMisTiendas(resultado);
      setIdTiendaActiva((anterior) => resultado.some(t => t.idTienda === anterior)
          ? anterior : resultado.find(t => t.estadoTienda === 'ACTIVO')?.idTienda ?? resultado[0]?.idTienda ?? null);
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

  // Estados del Administrador del Sistema
  const [adminTab, setAdminTab] = useState<AdminTab>('resumen');
  const [tiendas, setTiendas] = useState<TiendaDetalleResponse[]>([]);
  const [cargandoAdminTiendas, setCargandoAdminTiendas] = useState(currentUser?.rol === 'ADMIN_SISTEMA');
  const [errorAdminTiendas, setErrorAdminTiendas] = useState<string | null>(null);
  const [recargaAdminTiendas, setRecargaAdminTiendas] = useState(0);
  const [avisoTiendas, setAvisoTiendas] = useState<string | null>(null);
  const [busquedaTiendas, setBusquedaTiendas] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTienda, setEditingTienda] = useState<TiendaDetalleResponse | null>(null);

  useEffect(() => {
    if (currentUser?.rol !== 'ADMIN_SISTEMA') return;
    const controller = new AbortController();
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

  // Clientes y condiciones crediticias
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState<number | null>(null);
  const [busquedaClientes, setBusquedaClientes] = useState('');
  const [recargaClientes, setRecargaClientes] = useState(0);
  const [isRegisterClientModalOpen, setIsRegisterClientModalOpen] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState<ClienteResponse | null>(null);
  // undefined: modal cerrado; null: registrar condiciones; objeto: editar condiciones.
  const [condicionEnEdicion, setCondicionEnEdicion] = useState<CondicionCrediticiaResponse | null | undefined>(undefined);
  const cerrarModalesClientes = () => {
    setIsRegisterClientModalOpen(false);
    setClienteEnEdicion(null);
    setCondicionEnEdicion(undefined);
  };
  const recargarClientes = () => setRecargaClientes((n) => n + 1);

  const [revisionCobros, setRevisionCobros] = useState(0);

  useEffect(() => {
    const expirar = () => {
      setCodigoRecuperacion(null);
      setTokenRecuperacion(null);
      setUserEmail('');
      setStoreSubView('lista');
      setIdClienteSeleccionado(null);
      setBusquedaClientes('');
      cerrarModalesClientes();
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

  useEffect(() => {
    if (!currentUser) return;
    const comprobarSesion = () => {
      if (Date.now() >= expiracionSesion(currentUser)) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    };
    const tiempoRestante = Math.max(0, expiracionSesion(currentUser) - Date.now());
    const timer = window.setTimeout(comprobarSesion, Math.min(tiempoRestante, 2_147_483_647));
    window.addEventListener('focus', comprobarSesion);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', comprobarSesion);
    };
  }, [currentUser]);

  // --- Manejadores de Autenticación ---
  const handleLoginSuccess = (user: LoginResponse) => {
    setCurrentUser(user);
    setUserEmail(user.correo);
    setCodigoRecuperacion(null);
    setTokenRecuperacion(null);

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
      setStoreTab('inicio');
      setStoreSubView('lista');
    }
  };

  const handleGoToForgotPassword = () => {
    cerrarSesion();
    setCurrentUser(null);
    setUserEmail('');
    setCodigoRecuperacion(null);
    setTokenRecuperacion(null);
    setCurrentView('forgot_password');
  };

  const handleCodeSent = (email: string, respuesta: CodigoRecuperacionResponse) => {
    setUserEmail(email);
    setCodigoRecuperacion(respuesta);
    setCurrentView('verify_code');
  };

  const handleCodeVerified = (token: string) => {
    setCodigoRecuperacion(null);
    setTokenRecuperacion(token);
    setCurrentView('reset_password');
  };

  const handlePasswordSaved = () => {
    setTokenRecuperacion(null);
    setUserEmail('');
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
    setIdClienteSeleccionado(null);
    setBusquedaClientes('');
    cerrarModalesClientes();
    setCodigoRecuperacion(null);
    setTokenRecuperacion(null);
    setUserEmail('');
    setCurrentView('login');
  };

  // --- Manejadores de Tiendas (Admin Sistema) ---
  const handleOpenEdit = (tienda: TiendaDetalleResponse) => {
    setEditingTienda(tienda);
    setIsEditModalOpen(true);
  };

  const recargarAdminTiendas = () => {
    setCargandoAdminTiendas(true);
    setErrorAdminTiendas(null);
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

  if (currentView === 'verify_code' && codigoRecuperacion && userEmail) {
    return (
      <VerifyCodePage
        correo={userEmail}
        emailMasked={maskEmail(userEmail)}
        codigoInicial={codigoRecuperacion}
        onVerify={handleCodeVerified}
        onBackToLogin={handleLogout}
      />
    );
  }

  if (currentView === 'reset_password' && tokenRecuperacion && userEmail) {
    return (
      <ResetPasswordPage
        correo={userEmail}
        tokenRecuperacion={tokenRecuperacion}
        onPasswordSaved={handlePasswordSaved}
        onBackToLogin={handleLogout}
        onRestart={handleGoToForgotPassword}
      />
    );
  }

  if (currentView === 'verify_code' || currentView === 'reset_password') {
    return <ForgotPasswordPage onCodeSent={handleCodeSent} onBackToLogin={handleLogout} />;
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
                setStoreTab('inicio');
                setIdClienteSeleccionado(null);
                setBusquedaClientes('');
                cerrarModalesClientes();
              }}
              currentTab={storeTab}
              busquedaClientes={busquedaClientes}
              onBuscarCliente={(valor) => {
                setBusquedaClientes(valor);
                setStoreTab('clientes');
                setStoreSubView('lista');
              }}
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
                  {/* Pestaña: Inicio (Dashboard de la Bodega) */}
                  {storeTab === 'inicio' && (
                      <StoreDashboardPage
                          key={idTiendaActiva}
                          idTienda={idTiendaActiva}
                          nombreUsuario={currentUser?.nombre}
                          soloConsulta={soloConsulta}
                          revision={revisionCobros}
                          onGoToPayments={() => setStoreTab('pagos')}
                          onGoToClients={() => {
                            setStoreTab('clientes');
                            setStoreSubView('lista');
                          }}
                          onGoToSales={() => { setIdClienteSeleccionado(null); setStoreTab('nueva_venta'); }}
                      />
                  )}

                  {/* Pestaña: Clientes */}
                  {storeTab === 'clientes' && (
                      <>
                        {/* 1. Lista de Clientes */}
                        {storeSubView === 'lista' && (
                            <StoreClientesListPage
                                key={`${idTiendaActiva}-${recargaClientes}`}
                                idTienda={idTiendaActiva}
                                soloConsulta={soloConsulta}
                                busqueda={busquedaClientes}
                                onBuscar={setBusquedaClientes}
                                onNewClient={() => setIsRegisterClientModalOpen(true)}
                                onSelectCliente={(idCliente) => {
                                  setIdClienteSeleccionado(idCliente);
                                  setStoreSubView('detalle_cliente');
                                }}
                            />
                        )}

                        {/* 2. Detalle del Cliente */}
                        {storeSubView === 'detalle_cliente' && idClienteSeleccionado !== null && (
                            <StoreClienteDetailPage
                                key={`${idTiendaActiva}-${idClienteSeleccionado}-${recargaClientes}`}
                                idTienda={idTiendaActiva}
                                idCliente={idClienteSeleccionado}
                                soloConsulta={soloConsulta}
                                onBack={() => setStoreSubView('lista')}
                                onEditClient={(cliente) => setClienteEnEdicion(cliente)}
                                onEditConditions={(condicion) => setCondicionEnEdicion(condicion)}
                                onNewSale={() => setStoreTab('nueva_venta')}
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
                          idClienteInicial={storeSubView === 'detalle_cliente' ? idClienteSeleccionado : null}
                          onCancel={() => { setStoreTab('clientes'); setStoreSubView('lista'); }}
                      />
                  )}

                  {/* Pestaña: Pagos */}
                  {storeTab === 'pagos' && (
                      <StorePagosPage
                          key={idTiendaActiva}
                          idTienda={idTiendaActiva}
                          revision={revisionCobros}
                          onPagoRegistrado={() => { setRevisionCobros(n => n + 1); recargarClientes(); }}
                      />
                  )}

                  {/* Pestaña: Cortes y cobranzas */}
                  {storeTab === 'cortes' && (
                      <StoreCortesPage
                          key={idTiendaActiva}
                          idTienda={idTiendaActiva}
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
          {isRegisterClientModalOpen && idTiendaActiva !== null && (
              <RegistrarClienteModal
                  idTienda={idTiendaActiva}
                  onClose={() => setIsRegisterClientModalOpen(false)}
                  onClientRegistered={recargarClientes}
              />
          )}

          {clienteEnEdicion && idTiendaActiva !== null && (
              <EditarClienteModal
                  idTienda={idTiendaActiva}
                  cliente={clienteEnEdicion}
                  onClose={() => setClienteEnEdicion(null)}
                  onSave={recargarClientes}
              />
          )}

          {condicionEnEdicion !== undefined && idTiendaActiva !== null && idClienteSeleccionado !== null && (
              <EditarCondicionesModal
                  idTienda={idTiendaActiva}
                  idCliente={idClienteSeleccionado}
                  condicion={condicionEnEdicion}
                  onClose={() => setCondicionEnEdicion(undefined)}
                  onSave={recargarClientes}
              />
          )}

        </>
    );
  }

  // El portal gestiona su propia navegación y cuenta; la autorización sigue en App y el servidor.
  if (currentUser?.rol !== 'CLIENTE') return null;
  return <ClientPortal key={currentUser.id} onLogout={handleLogout} />;
}

export default App;