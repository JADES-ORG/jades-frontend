import React, { useState } from 'react';
import { Info } from 'lucide-react';
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
import { AvisoError, BotonesModal, ModalShell } from './ModalShell';

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
                ? 'Los cambios se aplican a las nuevas ventas. Las ventas anteriores conservan las condiciones pactadas al registrarse.'
                : 'Define las condiciones que se aplicarán a las ventas a crédito de este cliente.'
          }
          onClose={onClose}
          bloqueado={guardando}
      >
        <form onSubmit={guardar} noValidate className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <CondicionesCreditoForm
              valores={valores}
              onChange={setValores}
              monedaBloqueada={condicion !== null}
              deshabilitado={guardando}
          />
          <p className="flex items-start text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
            <Info className="w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 text-[#139a6c]" />
            {condicion
                ? 'El nuevo límite no puede ser menor que el crédito ya utilizado por el cliente.'
                : 'Base financiera 360/30. Las tasas se conservan con al menos 7 decimales para los cálculos.'}
          </p>
          <AvisoError mensaje={error} />
          <BotonesModal
              onCancelar={onClose}
              textoGuardar={condicion ? 'Guardar condiciones' : 'Registrar condiciones'}
              textoGuardando="Guardando..."
              guardando={guardando}
          />
        </form>
      </ModalShell>
  );
};