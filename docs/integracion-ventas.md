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
