import React, { useState } from 'react';
import { actualizarCondicionCrediticia, registrarCondicionCrediticia } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import type { CondicionCrediticiaResponse } from '../../types/clientes';
import {
  CONDICIONES_INICIALES,
  condicionesDesdeRespuesta,
  validarCondiciones,
  type CondicionesForm,
} from '../../features/clientes/model';
import { CondicionesCreditoForm } from './CondicionesCreditoForm';
import { AvisoError, BotonesModal, ModalShell, NotaInfo, cuerpoModal } from './ModalShell';

interface EditarCondicionesModalProps {
  idTienda: number;
  idCliente: number;
  /** Condiciones actuales. Si es null, el modal las registra por primera vez. */
  condicion: CondicionCrediticiaResponse | null;
  onClose: () => void;
  onSave: (condicion: CondicionCrediticiaResponse) => void;
}

export const EditarCondicionesModal: React.FC<EditarCondicionesModalProps> = ({
                                                                                idTienda,
                                                                                idCliente,
                                                                                condicion,
                                                                                onClose,
                                                                                onSave,
                                                                              }) => {
  const [valores, setValores] = useState<CondicionesForm>(
      condicion ? condicionesDesdeRespuesta(condicion) : CONDICIONES_INICIALES,
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const validacion = validarCondiciones(valores);
    if ('error' in validacion) {
      setError(validacion.error);
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      const guardada = condicion
          ? await actualizarCondicionCrediticia(idTienda, idCliente, validacion.solicitud)
          : await registrarCondicionCrediticia(idTienda, idCliente, validacion.solicitud);
      onSave(guardada);
      onClose();
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
      <ModalShell
          titulo={condicion ? 'Editar condiciones de crédito' : 'Registrar condiciones de crédito'}
          descripcion={
            condicion
                ? 'Modifica las condiciones pactadas para las futuras ventas a crédito del cliente.'
                : 'Completa las condiciones pactadas para las futuras ventas a crédito del cliente.'
          }
          onClose={onClose}
          bloqueado={guardando}
      >
        <form onSubmit={guardar} noValidate className={cuerpoModal}>
          <CondicionesCreditoForm
              valores={valores}
              onChange={setValores}
              modo={condicion ? 'edicion' : 'registro'}
              deshabilitado={guardando}
          />
          <NotaInfo>
            {condicion
                ? 'Base 360/30. Los cambios se aplican solo a ventas nuevas; los créditos anteriores conservan sus condiciones.'
                : 'Base 360/30. El periodo de gracia se determina con la fecha de compra y el ciclo, antes de calcular la cuota francesa.'}
          </NotaInfo>
          <AvisoError mensaje={error} />
          <BotonesModal
              onCancelar={onClose}
              textoGuardar={condicion ? 'Guardar cambios' : 'Registrar condiciones'}
              textoGuardando="Guardando..."
              guardando={guardando}
          />
        </form>
      </ModalShell>
  );
};