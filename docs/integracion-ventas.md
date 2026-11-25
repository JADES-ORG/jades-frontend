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
