import React, { useState } from 'react';
import { desactivarCliente, registrarCliente, registrarCondicionCrediticia } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import type { ClienteResponse } from '../../types/clientes';
import {
  CONDICIONES_INICIALES,
  validarCondiciones,
  validarDatosCliente,
  type CondicionesForm,
} from '../../features/clientes/model';
import { CondicionesCreditoForm } from './CondicionesCreditoForm';
import { DatosClienteFields, type DatosClienteForm } from './DatosClienteFields';
import { AvisoError, BotonesModal, ModalShell, NotaInfo, botonPrincipalModal, cuerpoModal } from './ModalShell';

interface RegistrarClienteModalProps {
  idTienda: number;
  onClose: () => void;
  /** Se llama cuando el cliente quedó registrado (aunque falten sus condiciones). */
  onClientRegistered: (cliente: ClienteResponse) => void;
}

export const RegistrarClienteModal: React.FC<RegistrarClienteModalProps> = ({
                                                                              idTienda,
                                                                              onClose,
                                                                              onClientRegistered,
                                                                            }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [datos, setDatos] = useState<DatosClienteForm>({ nombre: '', dni: '', telefono: '', correo: '', estado: 'ACTIVO' });
  const [contrasena, setContrasena] = useState('');
  const [condiciones, setCondiciones] = useState<CondicionesForm>(CONDICIONES_INICIALES);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  // Si el cliente ya se creó pero fallaron sus condiciones, el reintento solo registra las condiciones.
  const [clienteCreado, setClienteCreado] = useState<ClienteResponse | null>(null);
  // Cliente y condiciones guardados; solo queda cerrar el modal.
  const [completado, setCompletado] = useState(false);

  // Si el cliente ya existe (aunque falten sus condiciones), la lista debe actualizarse al cerrar.
  const cerrar = () => {
    if (clienteCreado) onClientRegistered(clienteCreado);
    onClose();
  };

  const continuar = (e: React.FormEvent) => {
    e.preventDefault();
    const problema = validarDatosCliente(datos)
        ?? (contrasena.length < 8 || contrasena.length > 72 ? 'La contraseña inicial debe tener entre 8 y 72 caracteres.' : null);
    setError(problema);
    if (!problema) setStep(2);
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const validacion = validarCondiciones(condiciones);
    if ('error' in validacion) {
      setError(validacion.error);
      return;
    }
    setError(null);
    setGuardando(true);
    let cliente = clienteCreado;
    try {
      if (!cliente) {
        cliente = await registrarCliente(idTienda, {
          nombreCliente: datos.nombre.trim(),
          dniCliente: datos.dni.trim(),
          telefonoCliente: datos.telefono.trim() || null,
          correoCliente: datos.correo.trim(),
          contrasenaTemporal: contrasena,
        });
        setClienteCreado(cliente);
      }
      await registrarCondicionCrediticia(idTienda, cliente.id, validacion.solicitud);
    } catch (err) {
      const mensaje = obtenerMensajeError(err);
      setError(
          cliente
              ? `El cliente quedó registrado, pero no se guardaron sus condiciones: ${mensaje} Corrige los datos y vuelve a intentarlo.`
              : mensaje,
      );
      // Errores del paso 1 (DNI o correo repetidos) se corrigen en los datos generales.
      if (!cliente) setStep(1);
      setGuardando(false);
      return;
    }
    // Las condiciones solo se registran con el cliente activo; si se pidió, se desactiva al final.
    if (datos.estado === 'INACTIVO') {
      try {
        cliente = await desactivarCliente(idTienda, cliente.id);
      } catch (err) {
        // Todo quedó guardado salvo el estado: ya no hay nada que reintentar aquí.
        setError(
            `El cliente y sus condiciones quedaron registrados, pero no se pudo desactivar: ${obtenerMensajeError(err)} Puedes hacerlo desde su detalle.`,
        );
        setCompletado(true);
        setGuardando(false);
        return;
      }
    }
    setGuardando(false);
    onClientRegistered(cliente);
    onClose();
  };

  return (
      <ModalShell
          titulo={step === 1 ? 'Registrar cliente' : 'Condiciones de crédito'}
          descripcion={
            step === 1
                ? 'Completa los datos generales y de acceso. Las condiciones de crédito se registran en el siguiente paso.'
                : 'Completa las condiciones pactadas para finalizar el registro del cliente.'
          }
          onClose={cerrar}
          bloqueado={guardando}
      >
        {step === 1 ? (
            <form onSubmit={continuar} noValidate className={cuerpoModal}>
              <DatosClienteFields valores={datos} onChange={setDatos} contrasena={{ valor: contrasena, onChange: setContrasena }} />
              <AvisoError mensaje={error} />
              <BotonesModal onCancelar={cerrar} textoGuardar="Continuar" textoGuardando="Continuar" guardando={false} />
            </form>
        ) : (
            <form onSubmit={registrar} noValidate className={cuerpoModal}>
              <CondicionesCreditoForm valores={condiciones} onChange={setCondiciones} modo="registro" deshabilitado={guardando} />
              <NotaInfo>
                Base 360/30. El periodo de gracia se determina con la fecha de compra y el ciclo, antes de calcular la cuota francesa.
              </NotaInfo>
              <AvisoError mensaje={error} />
              {completado ? (
                  <div className="pt-2 flex justify-end">
                    <button type="button" onClick={cerrar} className={botonPrincipalModal}>
                      Cerrar
                    </button>
                  </div>
              ) : (
                  <BotonesModal
                      onCancelar={() => {
                        if (clienteCreado) {
                          cerrar();
                          return;
                        }
                        setError(null);
                        setStep(1);
                      }}
                      textoCancelar={clienteCreado ? 'Registrar condiciones después' : 'Atrás'}
                      textoGuardar={clienteCreado ? 'Guardar condiciones' : 'Registrar cliente'}
                      textoGuardando="Guardando..."
                      guardando={guardando}
                  />
              )}
            </form>
        )}
      </ModalShell>
  );
};