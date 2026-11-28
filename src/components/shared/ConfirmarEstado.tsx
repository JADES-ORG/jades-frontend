import { ModalShell, AvisoError, BotonesModal, cuerpoModal } from '../store-admin/ModalShell';

interface Props {
  titulo: string;
  descripcion: string;
  accion: string;
  guardando: boolean;
  error?: string | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function ConfirmarEstado({ titulo, descripcion, accion, guardando, error, onCancelar, onConfirmar }: Props) {
  return <ModalShell titulo={titulo} descripcion={descripcion} bloqueado={guardando} onClose={onCancelar}>
    <form className={cuerpoModal} onSubmit={e => { e.preventDefault(); onConfirmar(); }}>
      <AvisoError mensaje={error ?? null} />
      <BotonesModal onCancelar={onCancelar} textoGuardar={accion} textoGuardando="Guardando…" guardando={guardando} />
    </form>
  </ModalShell>;
}
