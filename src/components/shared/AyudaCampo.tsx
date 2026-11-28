import { Info } from 'lucide-react';

export function AyudaCampo({ etiqueta, texto }: { etiqueta: string; texto: string }) {
  return <details className="inline-block text-jades-muted">
    <summary aria-label={`Ayuda sobre ${etiqueta}`} className="grid size-7 cursor-pointer place-items-center rounded-md text-jades-primary [&::-webkit-details-marker]:hidden">
      <Info aria-hidden="true" className="size-4" />
    </summary>
    <p className="my-1 rounded-lg border border-jades-line bg-jades-soft px-3 py-2 text-xs font-normal">{texto}</p>
  </details>;
}
