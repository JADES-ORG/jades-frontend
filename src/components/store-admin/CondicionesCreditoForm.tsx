import React from 'react';
import { PERIODOS, type CondicionesForm } from '../../features/clientes/model';
import type { PeriodoTasa } from '../../types/clientes';

export const inputClase =
    'w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

interface CampoProps {
    id: string;
    label: string;
    ayuda: string;
    children: React.ReactNode;
}

export const Campo: React.FC<CampoProps> = ({ id, label, ayuda, children }) => (
    <div>
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">
            {label}
        </label>
        {children}
        <p className="text-[10px] text-slate-400 mt-1">{ayuda}</p>
    </div>
);

interface CondicionesCreditoFormProps {
    valores: CondicionesForm;
    onChange: (valores: CondicionesForm) => void;
    /** En la edición la moneda no puede cambiarse: el backend la rechaza. */
    monedaBloqueada?: boolean;
    deshabilitado?: boolean;
}

export const CondicionesCreditoForm: React.FC<CondicionesCreditoFormProps> = ({
                                                                                  valores,
                                                                                  onChange,
                                                                                  monedaBloqueada = false,
                                                                                  deshabilitado = false,
                                                                              }) => {
    const set = <K extends keyof CondicionesForm>(campo: K, valor: CondicionesForm[K]) =>
        onChange({ ...valores, [campo]: valor });

    const opcionesPeriodo = PERIODOS.map((p) => (
        <option key={p.valor} value={p.valor}>
            {p.etiqueta}
        </option>
    ));

    return (
        <fieldset disabled={deshabilitado} className="space-y-6">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Tasa compensatoria</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Campo id="cc-tipo-tasa" label="Tipo de tasa" ayuda="La tasa efectiva expresa directamente el costo del periodo indicado.">
                        <select
                            id="cc-tipo-tasa"
                            value={valores.tipoTasa}
                            onChange={(e) => {
                                const tipo = e.target.value as CondicionesForm['tipoTasa'];
                                onChange({
                                    ...valores,
                                    tipoTasa: tipo,
                                    capitalizacionTasa: tipo === 'NOMINAL' ? valores.capitalizacionTasa || 'DIARIA' : '',
                                });
                            }}
                            className={`${inputClase} cursor-pointer`}
                        >
                            <option value="EFECTIVA">Efectiva</option>
                            <option value="NOMINAL">Nominal</option>
                        </select>
                    </Campo>
                    <Campo id="cc-valor-tasa" label="Valor de la tasa (%)" ayuda="Porcentaje pactado. Ejemplo: 2.5 para 2.5 %.">
                        <input
                            id="cc-valor-tasa"
                            type="text"
                            inputMode="decimal"
                            required
                            value={valores.valorTasa}
                            onChange={(e) => set('valorTasa', e.target.value)}
                            placeholder="2.5"
                            className={inputClase}
                        />
                    </Campo>
                    <Campo id="cc-periodo-tasa" label="Periodo de referencia" ayuda="Periodo de la tasa; para los cálculos se usa el mes comercial de 30 días.">
                        <select
                            id="cc-periodo-tasa"
                            value={valores.periodoTasa}
                            onChange={(e) => set('periodoTasa', e.target.value as PeriodoTasa)}
                            className={`${inputClase} cursor-pointer`}
                        >
                            {opcionesPeriodo}
                        </select>
                    </Campo>
                    <Campo id="cc-cap-tasa" label="Capitalización nominal" ayuda="Obligatoria cuando se elige una tasa nominal.">
                        <select
                            id="cc-cap-tasa"
                            value={valores.capitalizacionTasa}
                            disabled={valores.tipoTasa === 'EFECTIVA'}
                            onChange={(e) => set('capitalizacionTasa', e.target.value as PeriodoTasa)}
                            className={`${inputClase} cursor-pointer`}
                        >
                            {valores.tipoTasa === 'EFECTIVA' && <option value="">No aplica a tasa efectiva</option>}
                            {valores.tipoTasa === 'NOMINAL' && opcionesPeriodo}
                        </select>
                    </Campo>
                </div>
            </div>

            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Límites y calendario</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Campo
                        id="cc-moneda"
                        label="Moneda"
                        ayuda={monedaBloqueada ? 'La moneda no puede modificarse después del registro.' : 'Moneda única del crédito y sus pagos.'}
                    >
                        <select
                            id="cc-moneda"
                            value={valores.moneda}
                            disabled={monedaBloqueada}
                            onChange={(e) => set('moneda', e.target.value as CondicionesForm['moneda'])}
                            className={`${inputClase} cursor-pointer`}
                        >
                            <option value="PEN">Soles (PEN)</option>
                            <option value="USD">Dólares (USD)</option>
                        </select>
                    </Campo>
                    <Campo id="cc-limite" label="Límite máximo" ayuda="No se permiten ventas superiores al crédito disponible.">
                        <input
                            id="cc-limite"
                            type="text"
                            inputMode="decimal"
                            required
                            value={valores.limiteCredito}
                            onChange={(e) => set('limiteCredito', e.target.value)}
                            placeholder="2000.00"
                            className={inputClase}
                        />
                    </Campo>
                    <Campo id="cc-plazo" label="Plazo máximo (meses)" ayuda="Máximo número de meses permitido para el crédito.">
                        <input
                            id="cc-plazo"
                            type="number"
                            min={1}
                            max={120}
                            required
                            value={valores.plazoMaximo}
                            onChange={(e) => set('plazoMaximo', e.target.value)}
                            placeholder="6"
                            className={inputClase}
                        />
                    </Campo>
                    <Campo id="cc-dia-corte" label="Día de corte" ayuda="Día mensual que cierra el ciclo de compras.">
                        <input
                            id="cc-dia-corte"
                            type="number"
                            min={1}
                            max={31}
                            required
                            value={valores.diaCorte}
                            onChange={(e) => set('diaCorte', e.target.value)}
                            placeholder="10"
                            className={inputClase}
                        />
                    </Campo>
                    <Campo id="cc-hora-corte" label="Hora de corte" ayuda="Hora límite del día de corte para incluir compras en el ciclo.">
                        <input
                            id="cc-hora-corte"
                            type="time"
                            required
                            value={valores.horaCorte}
                            onChange={(e) => set('horaCorte', e.target.value)}
                            className={inputClase}
                        />
                    </Campo>
                    <Campo id="cc-dia-pago" label="Día de pago" ayuda="Día mensual pactado para pagar. Debe ser distinto al día de corte.">
                        <input
                            id="cc-dia-pago"
                            type="number"
                            min={1}
                            max={31}
                            required
                            value={valores.diaPago}
                            onChange={(e) => set('diaPago', e.target.value)}
                            placeholder="15"
                            className={inputClase}
                        />
                    </Campo>
                </div>
            </div>

            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Tasa moratoria</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Campo id="cc-tipo-mora" label="Tipo de tasa moratoria" ayuda="Naturaleza de la tasa aplicada por atraso.">
                        <select
                            id="cc-tipo-mora"
                            value={valores.tipoTasaMora}
                            onChange={(e) => {
                                const tipo = e.target.value as CondicionesForm['tipoTasaMora'];
                                onChange({
                                    ...valores,
                                    tipoTasaMora: tipo,
                                    capitalizacionMora: tipo === 'NOMINAL' ? valores.capitalizacionMora || 'DIARIA' : '',
                                });
                            }}
                            className={`${inputClase} cursor-pointer`}
                        >
                            <option value="EFECTIVA">Efectiva</option>
                            <option value="NOMINAL">Nominal</option>
                        </select>
                    </Campo>
                    <Campo id="cc-periodo-mora" label="Periodo de la tasa moratoria" ayuda="Periodo al que corresponde la tasa moratoria.">
                        <select
                            id="cc-periodo-mora"
                            value={valores.periodoMora}
                            onChange={(e) => set('periodoMora', e.target.value as PeriodoTasa)}
                            className={`${inputClase} cursor-pointer`}
                        >
                            {opcionesPeriodo}
                        </select>
                    </Campo>
                    <Campo id="cc-valor-mora" label="Valor moratorio (%)" ayuda="Porcentaje aplicado al monto vencido durante el atraso.">
                        <input
                            id="cc-valor-mora"
                            type="text"
                            inputMode="decimal"
                            required
                            value={valores.valorMora}
                            onChange={(e) => set('valorMora', e.target.value)}
                            placeholder="1.2"
                            className={inputClase}
                        />
                    </Campo>
                    <Campo id="cc-cap-mora" label="Capitalización moratoria" ayuda="Obligatoria cuando la tasa moratoria es nominal.">
                        <select
                            id="cc-cap-mora"
                            value={valores.capitalizacionMora}
                            disabled={valores.tipoTasaMora === 'EFECTIVA'}
                            onChange={(e) => set('capitalizacionMora', e.target.value as PeriodoTasa)}
                            className={`${inputClase} cursor-pointer`}
                        >
                            {valores.tipoTasaMora === 'EFECTIVA' && <option value="">No aplica a tasa efectiva</option>}
                            {valores.tipoTasaMora === 'NOMINAL' && opcionesPeriodo}
                        </select>
                    </Campo>
                </div>
            </div>
        </fieldset>
    );
};