interface Props {
  total: number;
  pagina: number;
  onCambiar: (pagina: number) => void;
  etiqueta?: string;
}

export function Paginacion({ total, pagina, onCambiar, etiqueta = 'resultados' }: Props) {
  if (total === 0) return null;
  const paginas = Math.ceil(total / 10);
  const actual = Math.min(pagina, paginas);
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 text-sm text-slate-700">
    <span>{total} {etiqueta}</span>
    {paginas > 1 && <nav className="flex items-center gap-3" aria-label={`Páginas de ${etiqueta}`}>
      <button type="button" disabled={actual === 1} onClick={() => onCambiar(actual - 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Anterior</button>
      <span>{actual} de {paginas}</span>
      <button type="button" disabled={actual === paginas} onClick={() => onCambiar(actual + 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Siguiente</button>
    </nav>}
  </div>;
}
