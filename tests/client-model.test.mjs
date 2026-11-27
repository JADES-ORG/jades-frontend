import test from "node:test";
import assert from "node:assert/strict";
import {
  pendientes,
  capitalPorMoneda,
  capitalCompra,
  estadoCompra,
  estadoObligacion,
  dinero,
  fecha,
  porcentaje,
  coincide,
} from "../src/features/client-portal/model.ts";

const compra = {
  idVenta: 10,
  fechaCompra: "2025-06-01",
  modalidadPago: "MENSUAL",
  numeroCuotas: 3,
  total: 600,
  moneda: "PEN",
  estado: "VIGENTE",
  codigoCredito: "CR-000010",
};
const cuota = {
  idCuota: 1,
  idCredito: 2,
  idVenta: 10,
  numeroCuota: 2,
  fechaVencimiento: "2025-06-15",
  estado: "PENDIENTE",
  vencida: false,
  capital: 200,
  interesCompensatorio: 10,
  importeCuota: 210,
  importePendiente: 215,
  moraPendiente: 5,
  moneda: "PEN",
};
const cuenta = (compras = [compra], obligaciones = [cuota]) => ({
  compras,
  obligaciones,
  pagos: [],
});

test("No mezcla capitales en distintas monedas", () => {
  assert.deepEqual(
    capitalPorMoneda(
      cuenta(
        [compra, { ...compra, idVenta: 11, moneda: "USD" }],
        [
          cuota,
          { ...cuota, idCuota: 2, idVenta: 11, moneda: "USD", capital: 50 },
        ],
      ),
    ),
    [
      ["PEN", 200],
      ["USD", 50],
    ],
  );
});
test("La obligación usa importe pendiente del backend, sin sumar mora nuevamente", () => {
  assert.equal(pendientes(cuenta())[0].importePendiente, 215);
});
test("Excluye cuotas pagadas y ventas anuladas de próximos pagos", () => {
  assert.deepEqual(pendientes(cuenta([{ ...compra, estado: "ANULADA" }])), []);
  assert.deepEqual(
    pendientes(cuenta([compra], [{ ...cuota, importePendiente: 0 }])),
    [],
  );
});
test("Una compra sin cronograma no se presenta como pagada", () => {
  assert.equal(
    estadoCompra(cuenta([compra], []), compra, "2025-06-15"),
    "Sin plan",
  );
  assert.equal(capitalCompra(cuenta([compra], []), compra), null);
});
test("Distingue vencimiento hoy, futuro y mora con fechas de calendario", () => {
  assert.equal(estadoObligacion(cuota, "2025-06-15"), "Vence hoy");
  assert.equal(estadoObligacion(cuota, "2025-06-16"), "En mora");
  assert.equal(estadoObligacion(cuota, "2025-06-14"), "Próxima");
});
test("Conserva precio de compra y calcula solo capital pendiente de sus cuotas", () => {
  assert.equal(
    capitalCompra(
      cuenta(
        [compra],
        [cuota, { ...cuota, idCuota: 3, importePendiente: 0, capital: 100 }],
      ),
      compra,
    ),
    200,
  );
  assert.equal(compra.total, 600);
});
test("No inventa cero cuando un importe o tasa no fueron informados", () => {
  assert.equal(dinero(null, "PEN"), "—");
  assert.equal(porcentaje(null), "—");
  assert.equal(porcentaje(0.025), "2.5000000%");
});
test("No convierte una fecha local en el día anterior", () => {
  assert.match(fecha("2025-06-15"), /15/);
});
test("La búsqueda coincide con el código real o ID de venta", () => {
  assert.equal(coincide(compra, "cr-000010"), true);
  assert.equal(coincide(compra, "otra compra"), false);
});

test("El resumen no presenta cero cuando falta el cronograma de una compra", () => {
  assert.deepEqual(capitalPorMoneda(cuenta([compra], [])), [["PEN", null]]);
});
