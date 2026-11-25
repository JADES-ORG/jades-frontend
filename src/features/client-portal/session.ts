import type { LoginResponse } from "../../types/finanzas";

/** Restaura solo una sesión cliente vigente; el backend sigue validando el JWT. */
export function sesionClienteGuardada(): LoginResponse | null {
  try {
    const raw = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    if (!raw || !token) return null;
    const user = JSON.parse(raw) as LoginResponse;
    if (user.rol !== "CLIENTE" || token !== user.tokenAcceso) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now())
      return null;
    return user;
  } catch {
    return null;
  }
}
