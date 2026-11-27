import type { CompraCuentaCorriente, CuentaCorrienteResponse, ObligacionCuentaCorriente } from "../../types/finanzas";

export const hoyLima = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima" }).format(
    new Date(),
  );
export function fecha(value: string | null | undefined): string {
  if (!value) return "—";
  const day = value.slice(0, 10);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}
export function dinero(
  value: number | null | undefined,
  moneda?: string | null,
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const amount = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return moneda
    ? `${moneda === "PEN" ? "S/" : moneda === "USD" ? "US$" : moneda} ${amount}`
    : `${amount} (moneda no informada)`;
}
export const porcentaje = (value: number | null | undefined) =>
  value == null ? "—" : `${(value * 100).toFixed(7)}%`;
export const codigo = (compra: CompraCuentaCorriente) =>
  compra.codigoCredito || `Venta #${compra.idVenta}`;
export const anulada = (compra: CompraCuentaCorriente) =>
  ["ANULADA", "ANULADO"].includes(compra.estado?.toUpperCase());
export const cuotasDe = (cuenta: CuentaCorrienteResponse, idVenta: number) =>
  cuenta.obligaciones.filter((o) => o.idVenta === idVenta);
export function pendientes(cuenta: CuentaCorrienteResponse): ObligacionCuentaCorriente[] {
  const ventasAnuladas = new Set(
    cuenta.compras.filter(anulada).map((c) => c.idVenta),
  );
  return cuenta.obligaciones
    .filter((o) => o.importePendiente > 0 && !ventasAnuladas.has(o.idVenta))
    .sort(
      (a, b) =>
        a.fechaVencimiento.localeCompare(b.fechaVencimiento) ||
        a.idCuota - b.idCuota,
    );
}
export function estadoCompra(
  cuenta: CuentaCorrienteResponse,
  compra: CompraCuentaCorriente,
  hoy = hoyLima(),
): string {
  if (anulada(compra)) return "Anulada";
  const cuotas = cuotasDe(cuenta, compra.idVenta);
  if (!cuotas.length)
    return ["PAGADA", "PAGADO", "CANCELADA", "CANCELADO"].includes(
      compra.estado,
    )
      ? "Pagado"
      : "Sin plan";
  const falta = cuotas.filter((o) => o.importePendiente > 0);
  if (!falta.length) return "Pagado";
  if (falta.some((o) => o.vencida || o.fechaVencimiento < hoy))
    return "En mora";
  return "Pendiente";
}
export function estadoObligacion(o: ObligacionCuentaCorriente, hoy = hoyLima()): string {
  if (o.importePendiente <= 0) return "Pagado";
  if (o.vencida || o.fechaVencimiento < hoy) return "En mora";
  if (o.fechaVencimiento === hoy) return "Vence hoy";
  return o.numeroCuota === 1 ? "Programada" : "Próxima";
}
export function capitalCompra(
  cuenta: CuentaCorrienteResponse,
  compra: CompraCuentaCorriente,
): number | null {
  if (anulada(compra)) return 0;
  const cuotas = cuotasDe(cuenta, compra.idVenta);
  return cuotas.length
    ? cuotas
        .filter((o) => o.importePendiente > 0)
        .reduce((s, o) => s + o.capital, 0)
    : null;
}
export function capitalPorMoneda(
  cuenta: CuentaCorrienteResponse,
): [string, number | null][] {
  const map = new Map<string, number | null>();
  for (const c of cuenta.compras.filter((c) => !anulada(c))) {
    const cuotas = cuotasDe(cuenta, c.idVenta);
    const saldo = cuotas.length
      ? cuotas
          .filter((o) => o.importePendiente > 0)
          .reduce((sum, o) => sum + o.capital, 0)
      : estadoCompra(cuenta, c) === "Pagado"
        ? 0
        : null;
    const previo = map.get(c.moneda);
    map.set(
      c.moneda,
      previo === null || saldo === null ? null : (previo || 0) + saldo,
    );
  }
  return [...map];
}
export function coincide(compra: CompraCuentaCorriente, busqueda: string): boolean {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return normalize(
    `${codigo(compra)} ${compra.idVenta} ${compra.modalidadPago} ${compra.fechaCompra}`,
  ).includes(normalize(busqueda.trim()));
}
