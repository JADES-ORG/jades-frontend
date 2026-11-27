export interface TiendaResumenResponse {
  idTienda: number;
  nombreTienda: string;
  documentoTienda: string;
  estadoTienda: string;
}

export interface RegistrarTiendaRequest {
  nombreTienda: string;
  razonSocial: string;
  documentoTienda: string;
  giroDeNegocio: string;
  direccion: string;
  telefonoTienda: string | null;
  correoTienda: string | null;
  administrador: {
    nombreUsuario: string;
    correoUsuario: string;
    telefonoUsuario: string | null;
    contrasena: string;
  };
}

export interface TiendaRegistradaResponse extends TiendaResumenResponse {
  idAdministrador: number;
  correoAdministrador: string;
}

export interface BajaTiendaResponse {
  idTienda: number;
  estadoTienda: string;
  idUsuarioResponsable: number;
  fechaBaja: string;
}

export interface AdministradorTiendaResponse {
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  telefonoUsuario: string | null;
  activo: boolean;
}

export interface ConfiguracionTiendaRequest {
  nombreTienda: string;
  giroDeNegocio: string;
  telefonoTienda: string | null;
  correoTienda: string | null;
}

export interface ActualizarTiendaRequest extends ConfiguracionTiendaRequest {
  razonSocial: string;
  documentoTienda: string;
  direccion: string;
}

export interface TiendaDetalleResponse extends TiendaResumenResponse, ActualizarTiendaRequest {
  administradores: AdministradorTiendaResponse[];
}
