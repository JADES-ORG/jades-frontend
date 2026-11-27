# Integración de ventas y motor financiero

Los servicios de src/api usan el cliente Axios existente y su interceptor JWT.
No modifican aún las pantallas ni sustituyen los datos de demostración.

- tiendas.ts: listarMisTiendas obtiene las tiendas activas autorizadas del usuario autenticado.
- clientes.ts y productos.ts: lecturas necesarias para el formulario de venta.
- ventas.ts: registro, listado y consulta. Crear una clave de idempotencia por intento lógico y reutilizarla si se reintenta el mismo cuerpo.
- finanzas.ts: simulación mensual, consultas de créditos, mora, corte y registro de pagos.
- errores.ts: extracción de mensajes de error del backend.

El POST de venta genera el crédito y las cuotas automáticamente. Usar el id de la venta devuelta para consultar el cronograma o el pago único, según la modalidad.
Las tasas se envían como fracciones decimales (18% = 0.18). El campo graciaAdicional expresa meses; horaVenta y horaCorte usan HH:mm:ss, fechaVenta usa YYYY-MM-DD. Usar la hora de Lima para la simulación.
El campo interesesTotales del cronograma corresponde a los intereses de las cuotas, sin incluir interesGracia.

Pendientes: simulación previa de pago único, disponibilidad crediticia explícita, selección de tienda en la UI, eliminación del login ficticio y conexión de componentes. Los tipos MoraResponse y ListadoCorteResponse anteriores se mantienen para los mocks; los servicios reales usan CalculoMoraResponse y CorteResponse.

## Segunda etapa: autenticación, tiendas y listado de clientes

- El inicio de sesión usa el backend real, sin fallback ni cambio de roles de demostración. La recuperación de contraseña no se implementó en esta etapa.
- El administrador de negocio entra a Clientes, selecciona una tienda activa autorizada y consulta sus clientes (incluidos inactivos). El buscador filtra por DNI parcial/completo o nombre en memoria y el filtro por estado es independiente.
- Al cambiar de tienda se desmonta la lista anterior y se cancela su solicitud. El listado muestra solo datos devueltos por el backend. No se registran usuarios ni clientes desde esta nueva vista.
- Las otras secciones aún conservan sus prototipos; no usar para operaciones reales. El inicio de sesión sigue siendo obligatorio al recargar la aplicación.

## Tercera etapa: nueva venta

Wizard conectado a clientes activos, condiciones y catálogo de la tienda. El precio de crédito se estima por línea, se valida cantidad/modalidad/plazo, y el servidor recalcula al registrar. La simulación mensual se obtiene de /cronogramas/simular con hora de Lima; no se calcula interés en React. La venta real usa Idempotency-Key, y la confirmación consulta el cronograma o pago único persistido. Si falla esa consulta, se reintenta solo la lectura.

Pendientes: endpoint de crédito disponible, simulación de pago único y simulación integral server-side con precios, reloj y condiciones autoritativos. El pago único puede registrarse con aceptación expresa de que no hay cotización previa; el detalle definitivo se consulta luego. Las demás pantallas siguen fuera de alcance. Los productos deben existir en la base de datos, no en los mocks del catálogo.

## Cuarta etapa: crédito disponible

El DTO de condiciones incluye creditoUtilizado y creditoDisponible. El endpoint GET /tiendas/{tienda}/clientes/{cliente}/condicion-crediticia/credito-disponible refresca el saldo; se consulta también tras registrar la venta. El wizard valida el capital contra el disponible real y, para MENSUAL, el capital capitalizado que devuelve la simulación. Para UNICO se reserva el capital original. Los saldos previos son instantáneas, la validación final transaccional sigue en el servidor. No se almacena un saldo disponible redundante en PostgreSQL.

Pendientes vigentes: simulación de pago único e integral de venta, historial y perfil financiero del cliente.

## Quinta etapa: simulación integral y nuevos contratos de cobro

Nueva venta utiliza POST /tiendas/{tienda}/ventas/simular con el mismo cuerpo de registro. El servidor obtiene precios, reloj, tasas y crédito disponible, devuelve cotización mensual o única sin persistencia. Ambos flujos exigen simular antes de confirmar. graciaAdicional solo admite 0; la gracia obligatoria se conserva. Los DTO y servicios de pagos, liquidación y cortes incluyen las nuevas fechas, horas y detalles históricos. La UI de cobranzas permanece fuera de esta etapa. La confirmación vuelve a evaluar las reglas y puede producir importes diferentes si cambian los datos o el ciclo.

## Integración del portal cliente

El portal usa los contratos de src/types/finanzas.ts y los servicios compartidos de src/api/clientes.ts, finanzas.ts, autenticacion.ts y errores.ts. El GET /portal/mi-cuenta identifica al cliente desde su JWT. Se mantienen el interceptor, la validación por rol y todo el flujo administrativo de develop; solo el cliente restaura una sesión vigente al recargar. No hay controles de demostración. El portal es de lectura: el importe pendiente registrado no equivale necesariamente a una cotización de pago anticipado. Las pruebas del portal se ejecutan con npm run test:client y npm run test:client:ui.
