import React, { useState } from 'react';
import { actualizarCliente, desactivarCliente, reactivarCliente } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import type { ClienteResponse } from '../../types/clientes';
import { validarDatosCliente } from '../../features/clientes/model';
import { DatosClienteFields, type DatosClienteForm } from './DatosClienteFields';
import { AvisoError, BotonesModal, ModalShell, cuerpoModal } from './ModalShell';

interface EditarClienteModalProps {
  idTienda: number;
  cliente: ClienteResponse;
  onClose: () => void;
  onSave: (cliente: ClienteResponse) => void;
}

export const EditarClienteModal: React.FC<EditarClienteModalProps> = ({ idTienda, cliente, onClose, onSave }) => {
  const [datos, setDatos] = useState<DatosClienteForm>({
    nombre: cliente.nombreCliente,
    dni: cliente.dniCliente,
    telefono: cliente.telefonoCliente ?? '',
    correo: cliente.correoCliente ?? '',
    estado: cliente.estadoCliente === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO',
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    // El correo de acceso no se edita aquí: se envía el que ya tiene el cliente.
    const problema = validarDatosCliente(datos, { requiereCorreo: false });
    setError(problema);
    if (problema) return;
    setGuardando(true);
    try {
      let actualizado = await actualizarCliente(idTienda, cliente.id, {
        nombreCliente: datos.nombre.trim(),
        dniCliente: datos.dni.trim(),
        telefonoCliente: datos.telefono.trim() || null,
        correoCliente: datos.correo.trim() || null,
      });
      if (datos.estado !== actualizado.estadoCliente) {
        actualizado = datos.estado === 'INACTIVO'
            ? await desactivarCliente(idTienda, cliente.id)
            : await reactivarCliente(idTienda, cliente.id);
      }
      onSave(actualizado);
      onClose();
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
      <ModalShell
          titulo="Editar cliente"
          descripcion="Actualiza los datos generales y de acceso del cliente."
          onClose={onClose}
          bloqueado={guardando}
      >
        <form onSubmit={guardar} noValidate className={cuerpoModal}>
          <fieldset disabled={guardando}>
            <DatosClienteFields valores={datos} onChange={setDatos} />
          </fieldset>
          <AvisoError mensaje={error} />
          <BotonesModal onCancelar={onClose} textoGuardar="Guardar cambios" textoGuardando="Guardando..." guardando={guardando} />
        </form>
      </ModalShell>
  );
};