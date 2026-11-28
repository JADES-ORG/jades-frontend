import type { CuentaCorrienteResponse, ObligacionCuentaCorriente } from '../../types/finanzas';
import type {
    CondicionCrediticiaRequest,
    CondicionCrediticiaResponse,
    PeriodoTasa,
} from '../../types/clientes';
import { hoyLima, pendientes } from '../client-portal/model';

export { dinero, fecha, hoyLima } from '../client-portal/model';

/** Estado de la deuda de un cliente, tal como se muestra en la lista y el detalle. */
export type EstadoDeuda = 'Al día' | 'Por vencer' | 'En mora' | 'Sin deuda';

/** Días antes del vencimiento en los que una cuota se considera "por vencer". */
export const DIAS_POR_VENCER = 7;

export const PERIODOS: { valor: PeriodoTasa; etiqueta: string; dias: number }[] = [
    { valor: 'DIARIA', etiqueta: 'Diaria', dias: 1 },
    { valor: 'QUINCENAL', etiqueta: 'Quincenal', dias: 15 },
    { valor: 'MENSUAL', etiqueta: 'Mensual', dias: 30 },
    { valor: 'BIMESTRAL', etiqueta: 'Bimestral', dias: 60 },
    { valor: 'TRIMESTRAL', etiqueta: 'Trimestral', dias: 90 },
    { valor: 'CUATRIMESTRAL', etiqueta: 'Cuatrimestral', dias: 120 },
    { valor: 'SEMESTRAL', etiqueta: 'Semestral', dias: 180 },
    { valor: 'ANUAL', etiqueta: 'Anual', dias: 360 },
];

export const etiquetaPeriodo = (periodo: string | null | undefined): string =>
    PERIODOS.find((p) => p.valor === periodo)?.etiqueta ?? '—';

export const diasPeriodo = (periodo: string): number =>
    PERIODOS.find((p) => p.valor === periodo)?.dias ?? 0;

export const etiquetaTipoTasa = (tipo: string | null | undefined): string =>
    tipo === 'NOMINAL' ? 'Nominal' : tipo === 'EFECTIVA' ? 'Efectiva' : '—';

export const etiquetaMoneda = (moneda: string | null | undefined): string =>
    moneda === 'PEN' ? 'Soles (PEN)' : moneda === 'USD' ? 'Dólares (USD)' : '—';

/** Tasa guardada como fracción (0.025) mostrada como porcentaje con 7 decimales (2.5000000%). */
export const porcentajeTasa = (fraccion: number | null | undefined): string =>
    fraccion == null || !Number.isFinite(fraccion) ? '—' : `${(fraccion * 100).toFixed(7)}%`;

/** "Efectiva · 2.5000000% mensual" */
export function resumenTasaCompensatoria(c: CondicionCrediticiaResponse): string {
    return `${etiquetaTipoTasa(c.tipoTasa)} · ${porcentajeTasa(c.tasaInteres)} ${etiquetaPeriodo(c.periodoTasa).toLowerCase()}`;
}

/** "TNM 1.2000000% · cap. diaria" o "TEA 36.0000000%" */
export function resumenTasaMoratoria(c: CondicionCrediticiaResponse): string {
    const sigla = `T${c.tipoTasaMora === 'NOMINAL' ? 'N' : 'E'}${etiquetaPeriodo(c.periodoTasaMora).charAt(0)}`;
    const cap = c.tipoTasaMora === 'NOMINAL' && c.capitalizacionMora
        ? ` · cap. ${etiquetaPeriodo(c.capitalizacionMora).toLowerCase()}`
        : '';
    return `${sigla} ${porcentajeTasa(c.tasaMoratoria)}${cap}`;
}

/** "18:00:00" → "18:00 h" */
export const horaCorta = (hora: string | null | undefined): string =>
    hora ? `${hora.slice(0, 5)} h` : '—';

export function iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return 'CL';
    const letras = partes.length === 1 ? partes[0].slice(0, 2) : `${partes[0][0]}${partes[1][0]}`;
    return letras.toUpperCase();
}

function sumarDias(fechaIso: string, dias: number): string {
    const d = new Date(`${fechaIso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
}

export interface ResumenDeuda {
    estado: EstadoDeuda;
    deudaActual: number;
    capitalPendiente: number;
    moneda: string | null;
    proximoPago: ObligacionCuentaCorriente | null;
    cuotasVencidas: number;
}

/** Resume la cuenta corriente de un cliente: deuda, capital, próximo pago y estado. */
export function resumirDeuda(cuenta: CuentaCorrienteResponse, hoy = hoyLima()): ResumenDeuda {
    const faltan = pendientes(cuenta);
    const vencidas = faltan.filter((o) => o.vencida || o.fechaVencimiento < hoy);
    const limitePorVencer = sumarDias(hoy, DIAS_POR_VENCER);
    let estado: EstadoDeuda = 'Sin deuda';
    if (vencidas.length) estado = 'En mora';
    else if (faltan.some((o) => o.fechaVencimiento <= limitePorVencer)) estado = 'Por vencer';
    else if (faltan.length) estado = 'Al día';
    return {
        estado,
        deudaActual: faltan.reduce((s, o) => s + o.importePendiente, 0),
        capitalPendiente: faltan.reduce((s, o) => s + o.capital, 0),
        moneda: faltan[0]?.moneda ?? cuenta.compras[0]?.moneda ?? null,
        proximoPago: faltan[0] ?? null,
        cuotasVencidas: vencidas.length,
    };
}

/** Ejecuta `tarea` sobre cada elemento con un máximo de `limite` peticiones simultáneas. */
export async function enLotes<T, R>(items: T[], limite: number, tarea: (item: T) => Promise<R>): Promise<R[]> {
    const resultados: R[] = new Array(items.length);
    let siguiente = 0;
    const trabajador = async () => {
        while (siguiente < items.length) {
            const i = siguiente++;
            resultados[i] = await tarea(items[i]);
        }
    };
    await Promise.all(Array.from({ length: Math.min(limite, items.length) }, trabajador));
    return resultados;
}

/* ---------- Formulario de condiciones crediticias ---------- */

/** Valores del formulario como texto, tal como los escribe el usuario. Las tasas van en porcentaje. */
export interface CondicionesForm {
    tipoTasa: 'EFECTIVA' | 'NOMINAL';
    valorTasa: string;
    periodoTasa: PeriodoTasa;
    capitalizacionTasa: PeriodoTasa | '';
    moneda: 'PEN' | 'USD';
    limiteCredito: string;
    plazoMaximo: string;
    diaCorte: string;
    horaCorte: string;
    diaPago: string;
    tipoTasaMora: 'EFECTIVA' | 'NOMINAL';
    valorMora: string;
    periodoMora: PeriodoTasa;
    capitalizacionMora: PeriodoTasa | '';
}

export const CONDICIONES_INICIALES: CondicionesForm = {
    tipoTasa: 'EFECTIVA',
    valorTasa: '',
    periodoTasa: 'MENSUAL',
    capitalizacionTasa: '',
    moneda: 'PEN',
    limiteCredito: '',
    plazoMaximo: '',
    diaCorte: '',
    horaCorte: '18:00',
    diaPago: '',
    tipoTasaMora: 'NOMINAL',
    valorMora: '',
    periodoMora: 'MENSUAL',
    capitalizacionMora: 'DIARIA',
};

/* Formato de los campos tal como se muestran en el diseño: "2.5000000%", "S/ 2,000.00", "6 meses". */

export const simboloMoneda = (moneda: string): string => (moneda === 'USD' ? 'US$' : 'S/');

/** Quita símbolo de moneda, espacios y separadores de miles: "S/ 2,000.00" → "2000.00". */
const limpiarMonto = (texto: string): string => texto.replace(/S\/|US\$|\s|,/g, '');

/** "2.5" → "2.5000000%". Conserva todos los decimales escritos (mínimo 7). */
export function formatearPorcentaje(texto: string): string {
    const limpio = texto.replace(/[%\s]/g, '').replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(limpio)) return texto;
    const [entero, decimales = ''] = limpio.split('.');
    return `${Number(entero)}.${decimales.padEnd(7, '0')}%`;
}

/** "2000" → "S/ 2,000.00" (o "US$ 2,000.00"). */
export function formatearLimite(texto: string, moneda: string): string {
    const limpio = limpiarMonto(texto);
    if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return texto;
    const monto = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(limpio));
    return `${simboloMoneda(moneda)} ${monto}`;
}

const leerMeses = (texto: string): number => {
    const m = /^(\d+)\s*(mes|meses)?$/i.exec(texto.trim());
    return m ? Number(m[1]) : NaN;
};

/** "6" → "6 meses". */
export function formatearPlazo(texto: string): string {
    const meses = leerMeses(texto);
    if (!Number.isInteger(meses)) return texto;
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

/** Convierte la fracción del backend (0.025) a porcentaje sin perder precisión ("2.5"). */
function fraccionAPorcentaje(fraccion: number): string {
    return String(Number((fraccion * 100).toPrecision(15)));
}

export function condicionesDesdeRespuesta(c: CondicionCrediticiaResponse): CondicionesForm {
    return {
        tipoTasa: c.tipoTasa,
        valorTasa: formatearPorcentaje(fraccionAPorcentaje(c.tasaInteres)),
        periodoTasa: c.periodoTasa as PeriodoTasa,
        capitalizacionTasa: (c.capitalizacionTasa ?? '') as PeriodoTasa | '',
        moneda: c.monedaCredito,
        limiteCredito: formatearLimite(String(c.limiteCredito), c.monedaCredito),
        plazoMaximo: formatearPlazo(String(c.plazoMaximo)),
        diaCorte: String(c.diaCorte),
        horaCorte: (c.horaCorte ?? '18:00').slice(0, 5),
        diaPago: String(c.diaPago),
        tipoTasaMora: c.tipoTasaMora,
        valorMora: formatearPorcentaje(fraccionAPorcentaje(c.tasaMoratoria)),
        periodoMora: c.periodoTasaMora as PeriodoTasa,
        capitalizacionMora: (c.capitalizacionMora ?? '') as PeriodoTasa | '',
    };
}

function porcentajeAFraccion(texto: string): number {
    const limpio = texto.replace(/[%\s]/g, '').replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(limpio)) return NaN;
    return Number((Number(limpio) / 100).toPrecision(15));
}

const entero = (texto: string): number => (/^\d+$/.test(texto.trim()) ? Number(texto.trim()) : NaN);

/**
 * Valida el formulario con las mismas reglas del backend y arma la solicitud.
 * Devuelve un mensaje de error si algo no es válido.
 */
export function validarCondiciones(f: CondicionesForm): { solicitud: CondicionCrediticiaRequest } | { error: string } {
    const tasa = porcentajeAFraccion(f.valorTasa);
    const mora = porcentajeAFraccion(f.valorMora);
    const montoLimite = limpiarMonto(f.limiteCredito);
    const limite = Number(montoLimite);
    const plazo = leerMeses(f.plazoMaximo);
    const corte = entero(f.diaCorte);
    const pago = entero(f.diaPago);
    if (!Number.isFinite(tasa) || tasa <= 0) return { error: 'Ingresa una tasa de interés mayor a cero.' };
    if (!Number.isFinite(mora) || mora <= 0) return { error: 'Ingresa una tasa moratoria mayor a cero.' };
    if (!montoLimite || !Number.isFinite(limite) || limite <= 0) return { error: 'Ingresa un límite de crédito mayor a cero.' };
    if (!/^\d+(\.\d{1,2})?$/.test(montoLimite)) return { error: 'El límite de crédito admite como máximo 2 decimales.' };
    if (!Number.isInteger(plazo) || plazo < 1 || plazo > 120) return { error: 'El plazo máximo debe estar entre 1 y 120 meses.' };
    if (!Number.isInteger(corte) || corte < 1 || corte > 31) return { error: 'El día de corte debe estar entre 1 y 31.' };
    if (!Number.isInteger(pago) || pago < 1 || pago > 31) return { error: 'El día de pago debe estar entre 1 y 31.' };
    if (corte === pago) return { error: 'El día de pago debe ser distinto al día de corte.' };
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.horaCorte)) return { error: 'Ingresa la hora de corte en formato HH:MM.' };
    for (const [nombre, tipo, periodo, cap] of [
        ['de interés', f.tipoTasa, f.periodoTasa, f.capitalizacionTasa],
        ['moratoria', f.tipoTasaMora, f.periodoMora, f.capitalizacionMora],
    ] as const) {
        if (tipo === 'NOMINAL') {
            if (!cap) return { error: `La tasa ${nombre} nominal requiere el periodo de capitalización.` };
            if (diasPeriodo(cap) > diasPeriodo(periodo)) return { error: `La capitalización de la tasa ${nombre} no puede ser mayor que su periodo.` };
        }
    }
    return {
        solicitud: {
            monedaCredito: f.moneda,
            limiteCredito: Math.round(limite * 100) / 100,
            plazoMaximo: plazo,
            diaCorte: corte,
            diaPago: pago,
            horaCorte: `${f.horaCorte}:00`,
            tipoTasa: f.tipoTasa,
            tasaInteres: tasa,
            periodoTasa: f.periodoTasa,
            capitalizacionTasa: f.tipoTasa === 'NOMINAL' ? (f.capitalizacionTasa || null) : null,
            tipoTasaMora: f.tipoTasaMora,
            tasaMoratoria: mora,
            periodoTasaMora: f.periodoMora,
            capitalizacionMora: f.tipoTasaMora === 'NOMINAL' ? (f.capitalizacionMora || null) : null,
        },
    };
}

/* ---------- Datos generales del cliente ---------- */

export function validarDatosCliente(
    d: { nombre: string; dni: string; telefono: string; correo: string },
    { requiereCorreo = true }: { requiereCorreo?: boolean } = {},
): string | null {
    if (!d.nombre.trim()) return 'Ingresa los nombres y apellidos.';
    if (d.nombre.trim().length > 200) return 'El nombre admite como máximo 200 caracteres.';
    if (!/^\d{8}$/.test(d.dni.trim())) return 'El DNI debe tener exactamente 8 dígitos.';
    if (d.telefono.trim().length > 15) return 'El teléfono admite como máximo 15 caracteres.';
    if (!/^[+0-9() -]*$/.test(d.telefono.trim())) return 'El teléfono solo puede contener números, espacios, +, ( ) y -.';
    if (!requiereCorreo) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) return 'Ingresa un correo válido.';
    if (d.correo.trim().length > 150) return 'El correo admite como máximo 150 caracteres.';
    return null;
}