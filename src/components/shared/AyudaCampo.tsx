import { Info } from 'lucide-react';

export function AyudaCampo({ etiqueta, texto }: { etiqueta: string; texto: string }) {
  return <details className="inline-block text-slate-600">
    <summary aria-label={`Ayuda sobre ${etiqueta}`} className="grid size-7 cursor-pointer place-items-center rounded-md text-emerald-700 [&::-webkit-details-marker]:hidden">
      <Info aria-hidden="true" className="size-4" />
    </summary>
    <p className="my-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-normal">{texto}</p>
  </details>;
}
