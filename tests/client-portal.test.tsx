import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { ClientPortal } from "../src/features/client-portal/ClientPortal";
import { App } from "../src/App";
import { api } from "../src/api/client";

vi.mock("../src/api/client", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const compra = (idVenta: number, modalidadPago = "MENSUAL") => ({
  idVenta,
  fechaCompra: "2025-04-05",
  modalidadPago,
  numeroCuotas: 3,
  total: 600,
  moneda: "PEN",
  estado: "VIGENTE",
  idCredito: idVenta,
  codigoCredito: `CR-${idVenta}`,
});
const o = {
  idCuota: 1,
  idCredito: 10,
  idVenta: 10,
  numeroCuota: 1,
  fechaVencimiento: "2030-06-15",
  estado: "PENDIENTE",
  vencida: false,
  capital: 200,
  interesCompensatorio: 10,
  importeCuota: 210,
  importePendiente: 215,
  moraPendiente: 5,
  moneda: "PEN",
};
const cuenta = {
  idCliente: 5,
  nombreCliente: "María Quispe",
  documentoCliente: "12345678",
  idTienda: 1,
  comercio: "Bodega San Blas",
  compras: [compra(10), compra(11, "UNICO")],
  obligaciones: [o],
  pagos: [
    {
      idPago: 3,
      idCuota: 1,
      fechaPago: "2025-05-15",
      fechaCancelacion: "2025-05-15",
      medioPago: "EFECTIVO",
      diasAtraso: 0,
      capitalPagado: 100,
      interesPagado: 10,
      moraPagada: 0,
      totalExigible: 110,
      estado: "REGISTRADO",
    },
  ],
  resumen: {
    totalCompras: 1200,
    capitalPendiente: 200,
    interesPendiente: 10,
    moraPagada: 0,
    totalPendienteRegistrado: 215,
    cuotasPendientes: 1,
    cuotasVencidas: 0,
  },
};
const plan = {
  idVenta: 10,
  idCredito: 10,
  codigoCredito: "CR-10",
  moneda: "PEN",
  fechaFinGracia: "2025-05-15",
  capitalVenta: 600,
  interesGracia: 10,
  capitalCapitalizado: 610,
  numeroCuotas: 3,
  totalFinanciamiento: 635,
  tasaEfectivaMensual: 0.025,
  cuotas: [
    {
      numeroCuota: 1,
      fechaVencimiento: "2030-06-15",
      saldoInicial: 610,
      interes: 15,
      amortizacion: 200,
      cuota: 215,
      saldoFinal: 410,
      estado: "PENDIENTE",
    },
  ],
};
const pagoUnico = {
  idVenta: 11,
  idCredito: 11,
  idCuota: 2,
  codigoCredito: "CR-11",
  moneda: "PEN",
  fechaVenta: "2025-04-05",
  fechaCorteAsignada: "2025-04-30T18:00:00",
  fechaPago: "2030-06-15",
  diasFinanciamiento: 70,
  capital: 600,
  tasaEfectivaDiaria: 0.0008,
  tasaEfectivaPeriodo: 0.03,
  interesCompensatorio: 20,
  totalSinMora: 620,
  estadoCuota: "PENDIENTE",
};
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
function server(data: unknown = cuenta) {
  get.mockImplementation(async (url) => ({
    data: String(url).startsWith("/cronogramas/")
      ? plan
      : String(url).startsWith("/deudas/")
        ? pagoUnico
        : data,
  }));
}
const tab = (name: string) =>
  within(screen.getByRole("navigation")).getByRole("button", {
    name,
    exact: true,
  });
async function portal() {
  const logout = vi.fn();
  render(<ClientPortal onLogout={logout} />);
  await screen.findByText("Hola, María");
  return logout;
}

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  server();
});
describe("Portal cliente con contratos HTTP controlados", () => {
  it("consulta mi-cuenta sin enviar un ID arbitrario y muestra identidad y comercio reales", async () => {
    await portal();
    expect(get).toHaveBeenCalledWith(
      "/portal/mi-cuenta",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getAllByText("María Quispe").length).toBeGreaterThan(0);
    expect(screen.getByText(/no informado por el negocio/)).toBeVisible();
    expect(screen.queryByText("Canasta familiar")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Demostración académica JADES:"),
    ).not.toBeInTheDocument();
  });
  it("busca compras y filtra por estado sin mostrar resultados inventados", async () => {
    await portal();
    await userEvent.click(
      screen.getByRole("button", { name: "Ver mis compras", exact: true }),
    );
    await userEvent.type(
      screen.getByLabelText("Buscar compra", { exact: true }),
      "CR-11",
    );
    expect(screen.getByText("Compra #11")).toBeVisible();
    expect(screen.queryByText("Compra #10")).not.toBeInTheDocument();
    await userEvent.clear(
      screen.getByLabelText("Buscar compra", { exact: true }),
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Filtrar compras por estado"),
      "Pagado",
    );
    expect(screen.getByText(/No hay compras que coincidan/)).toBeVisible();
  });
  it("abre un cronograma por ID de venta y vuelve a compras", async () => {
    await portal();
    await userEvent.click(
      screen.getByRole("button", { name: "Ver plan de CR-10", exact: true }),
    );
    await screen.findByText("Importes en PEN · TEM 2.5000000%");
    expect(get).toHaveBeenCalledWith(
      "/cronogramas/ventas/10",
      expect.any(Object),
    );
    expect(
      screen.getByRole("columnheader", { name: "Amortización" }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Volver a mis compras" }),
    );
    expect(
      screen.getByText("Detalle de tus compras realizadas a crédito."),
    ).toBeVisible();
  });
  it("pago único usa su endpoint, sin pedir un cronograma mensual", async () => {
    await portal();
    await userEvent.click(
      screen.getByRole("button", { name: "Ver detalle de CR-11", exact: true }),
    );
    await screen.findByText("Condiciones de la obligación");
    expect(get).toHaveBeenCalledWith(
      "/deudas/pago-unico/ventas/11",
      expect.any(Object),
    );
    expect(
      get.mock.calls.some(([url]) => String(url).includes("/cronogramas/")),
    ).toBe(false);
  });
  it("muestra importe pendiente del backend y pagos registrados", async () => {
    await portal();
    await userEvent.click(tab("Mis pagos"));
    expect(screen.getByText("Historial de pagos")).toBeVisible();
    expect(screen.getByText("EFECTIVO")).toBeVisible();
    expect(screen.getByText("S/ 215.00")).toBeVisible();
    expect(screen.queryByText("S/ 220.00")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Registrar pago" }),
    ).not.toBeInTheDocument();
  });
  it("ayuda navega y los avisos de vencimiento abren Mis pagos", async () => {
    await portal();
    await userEvent.click(tab("Ayuda"));
    await userEvent.click(screen.getByRole("button", { name: /OPCIÓN 2/ }));
    expect(
      screen.getByText("Detalle de tus compras realizadas a crédito."),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Ver próximos vencimientos" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /CR-10 ·/ }));
    expect(screen.getByText("Historial de pagos")).toBeVisible();
  });
  it("buscador global y menú móvil comparten navegación", async () => {
    await portal();
    fireEvent.change(screen.getByLabelText("Buscar en mis compras"), {
      target: { value: "CR-11" },
    });
    expect(screen.getByText("Compra #11")).toBeVisible();
    expect(screen.queryByText("Compra #10")).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Menú", exact: true }),
    );
    expect(
      screen.getByRole("button", { name: "Menú", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(tab("Ayuda"));
    expect(
      screen.getByRole("button", { name: "Menú", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
  });
  it("muestra un error real y permite reintentar sin datos ficticios", async () => {
    get.mockRejectedValueOnce(new AxiosError("unavailable"));
    render(<ClientPortal onLogout={vi.fn()} />);
    await screen.findByRole("alert");
    expect(screen.queryByText("Hola, María")).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Volver a intentar" }),
    );
    await screen.findByText("Hola, María");
  });
  it("maneja cuenta vacía", async () => {
    server({ ...cuenta, compras: [], obligaciones: [], pagos: [] });
    render(<ClientPortal onLogout={vi.fn()} />);
    await screen.findByText(/Aún no tienes compras registradas/);
    await userEvent.click(tab("Mis pagos"));
    expect(
      screen.getByText("No tienes pagos pendientes registrados."),
    ).toBeVisible();
    expect(
      screen.getByText("Todavía no hay pagos registrados en tu historial."),
    ).toBeVisible();
  });
  it("cada icono utilizado en las cinco vistas tiene un SVG local no vacío", async () => {
    await portal();
    const verificar = () => {
      for (const img of document.querySelectorAll<HTMLImageElement>(
        ".client-portal img",
      )) {
        const path = resolve("public", img.getAttribute("src")!.slice(1));
        expect(existsSync(path), path).toBe(true);
        expect(statSync(path).size, path).toBeGreaterThan(0);
      }
    };
    verificar();
    for (const name of ["Mis compras", "Mis pagos", "Ayuda"]) {
      await userEvent.click(tab(name));
      verificar();
    }
    await userEvent.click(tab("Mis compras"));
    await userEvent.click(
      screen.getByRole("button", { name: "Ver plan de CR-10", exact: true }),
    );
    await screen.findByText("Importes en PEN · TEM 2.5000000%");
    verificar();
  });
  it("cierre de sesión invoca la salida del portal", async () => {
    const logout = await portal();
    await userEvent.click(
      screen.getByRole("button", { name: "Cerrar sesión" }),
    );
    expect(logout).toHaveBeenCalledOnce();
  });
  it("conserva el acceso de demostración del login compartido", async () => {
    post.mockRejectedValueOnce(new AxiosError("unavailable"));
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Cliente (María)", exact: true }));
    await userEvent.click(screen.getByRole("button", { name: "Ingresar", exact: true }));
    await screen.findByText("Hola, María");
    expect(screen.getByText("Demostración académica JADES:")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Bodega San Blas", exact: true }));
    expect(screen.getByText("Vista activa: Bodega San Blas (Administrador del Negocio)")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Admin Sistema", exact: true }));
    expect(screen.getByText("Vista activa: Administrador del Sistema")).toBeVisible();
  });
  it("el login real abre el portal y conserva el cierre de sesión original", async () => {
    post.mockResolvedValueOnce({ data: {
      tokenAcceso: "test.jwt.token", id: 3,
      correo: "cliente@example.com", rol: "CLIENTE",
    } });
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Ingresar", exact: true }));
    await screen.findByText("Hola, María");
    expect(localStorage.getItem("token")).toBe("test.jwt.token");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión", exact: true }));
    expect(screen.getByRole("button", { name: "Ingresar", exact: true })).toBeVisible();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
