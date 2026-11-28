import { useEffect, useState } from 'react';
import { consultarCuentaCorriente, listarClientes } from '../../api/clientes';
import { obtenerMensajeError } from '../../api/errores';
import { enLotes } from '../clientes/model';
import { anulada, hoyLima, pendientes } from '../client-portal/model';
import type { CuentaCorrienteResponse } from '../../types/finanzas';

export function useCuentasTienda(idTienda: number, revision: number) {
  const [resultado, setResultado] = useState<{ clave: string; cuentas: CuentaCorrienteResponse[]; error: string } | null>(null);
  const [intento, setIntento] = useState(0);
  const clave = `${idTienda}|${revision}|${intento}`;
  const actual = resultado?.clave === clave ? resultado : null;

  useEffect(() => {
    const controller = new AbortController();

    listarClientes(idTienda, false, controller.signal)
      .then(clientes => enLotes(clientes, 6, async cliente => {
        if (controller.signal.aborted) return null;
        return consultarCuentaCorriente(cliente.id, controller.signal);
      }))
      .then(resultado => {
        if (!controller.signal.aborted) {
          const cuentas = resultado.filter(cuenta => cuenta !== null);
          if (cuentas.some(cuenta => cuenta.idTienda !== idTienda)) {
            throw new Error('Una cuenta recibida no corresponde a la tienda seleccionada.');
          }
          setResultado({ clave, cuentas, error: '' });
        }
      })
      .catch((causa: unknown) => {
        if (!controller.signal.aborted) setResultado({ clave, cuentas: [], error: obtenerMensajeError(causa) });
      });
    return () => controller.abort();
  }, [idTienda, clave]);

  return { cuentas: actual?.cuentas ?? [], cargando: !actual, error: actual?.error ?? '', recargar: () => setIntento(n => n + 1) };
}

export function obligacionesPendientes(cuentas: CuentaCorrienteResponse[]) {
  const hoy = hoyLima();
  return cuentas.flatMap(cuenta => {
    const compras = new Map(cuenta.compras.filter(compra => !anulada(compra)).map(compra => [compra.idVenta, compra]));
    const cuotas = pendientes(cuenta);
    const primerVencimiento = new Map<number, string>();
    for (const cuota of cuenta.obligaciones) {
      const anterior = primerVencimiento.get(cuota.idCredito);
      if (!anterior || cuota.fechaVencimiento < anterior) primerVencimiento.set(cuota.idCredito, cuota.fechaVencimiento);
    }
    const primeraPorCredito = new Map<number, number>();
    for (const cuota of cuotas) {
      const primera = primeraPorCredito.get(cuota.idCredito);
      primeraPorCredito.set(cuota.idCredito, Math.min(primera ?? cuota.numeroCuota, cuota.numeroCuota));
    }
    return cuotas.flatMap(cuota => {
      const compra = compras.get(cuota.idVenta);
      if (!compra) return [];
      const mensual = compra.modalidadPago === 'MENSUAL';
      const inicioCobro = (primerVencimiento.get(cuota.idCredito) ?? cuota.fechaVencimiento).slice(0, 7);
      const estado = cuota.vencida || cuota.fechaVencimiento < hoy
        ? 'En mora' as const : cuota.fechaVencimiento === hoy ? 'Pendiente' as const : 'Por vencer' as const;
      return [{
        ...cuota,
        idCliente: cuenta.idCliente,
        cliente: cuenta.nombreCliente,
        obligacion: compra.codigoCredito ?? `Venta #${cuota.idVenta}`,
        mensual,
        inicioCobro,
        estado,
        gestionable: !mensual || (inicioCobro <= hoy.slice(0, 7) && cuota.numeroCuota === primeraPorCredito.get(cuota.idCredito)),
      }];
    });
  }).sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento) || a.idCuota - b.idCuota);
}

export type ObligacionCobro = ReturnType<typeof obligacionesPendientes>[number];

export function proximosSieteDias(fecha: string, hoy = hoyLima()) {
  const limite = new Date(hoy + 'T00:00:00Z');
  limite.setUTCDate(limite.getUTCDate() + 7);
  return fecha > hoy && fecha <= limite.toISOString().slice(0, 10);
}
