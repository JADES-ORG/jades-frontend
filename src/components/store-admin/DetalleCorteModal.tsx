import { dinero, fecha } from '../../features/client-portal/model';
import type { Moneda } from '../../types/finanzas';
import type { DetalleVentaResponse } from '../../types/ventas';
import { cuerpoModal, ModalShell } from './ModalShell';

export interface CorteItemData {
  id: string;
  idVenta?: number;
  cliente: string;
  obligacion: string;
  fechaCorte: string | null;
  fechaPago: string;
  fechaCompra?: string;
  fechaPagoEfectivo?: string;
  medioPago?: string;
  capital: number;
  interesCompensatorio: number;
  mora: number;
  totalPagar: number;
  moneda: Moneda;
  estado: string;
  detalles: DetalleVentaResponse[];
}

export function DetalleCorteModal({ corte, onClose, titulo = 'Detalle del corte' }: { corte: CorteItemData; onClose: () => void; titulo?: string }) {
  return <ModalShell titulo={titulo} descripcion={`${corte.cliente} · ${corte.obligacion}`} onClose={onClose}>
    <div className={cuerpoModal}>
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        {[
          ['Fecha de compra', fecha(corte.fechaCompra)],
          ['Corte', corte.fechaCorte ? corte.fechaCorte.replace('T', ' ') : '—'],
          ['Pago pactado', fecha(corte.fechaPago)],
          ['Pago efectivo', corte.fechaPagoEfectivo?.replace('T', ' ') ?? '—'],
          ['Medio', corte.medioPago ?? '—'],
          ['Estado', corte.estado],
          ['Capital', dinero(corte.capital, corte.moneda)],
          ['Interés compensatorio', dinero(corte.interesCompensatorio, corte.moneda)],
          ['Mora', dinero(corte.mora, corte.moneda)],
          ['Total', dinero(corte.totalPagar, corte.moneda)],
        ].map(([label, valor]) => <div key={label}>
          <dt className="text-slate-500">{label}</dt><dd className="font-semibold text-slate-900">{valor}</dd>
        </div>)}
      </dl>
      <section className="rounded-xl border border-slate-200 p-4">
        <h4 className="font-semibold">Productos y servicios</h4>
        {corte.detalles.length ? <ul className="mt-2 divide-y divide-slate-100 text-sm">
          {corte.detalles.map(detalle => <li className="flex justify-between gap-3 py-2" key={detalle.idProducto}>
            <span>{detalle.cantidad} × {detalle.nombreProducto}</span><span>{dinero(detalle.subtotal, corte.moneda)}</span>
          </li>)}
        </ul> : <p className="mt-2 text-sm text-slate-500">Sin detalle disponible.</p>}
      </section>
    </div>
  </ModalShell>;
}
