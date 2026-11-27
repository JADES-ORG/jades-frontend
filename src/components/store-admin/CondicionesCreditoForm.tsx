import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
    PERIODOS,
    etiquetaMoneda,
    formatearLimite,
    formatearPlazo,
    formatearPorcentaje,
    type CondicionesForm,
} from '../../features/clientes/model';
import type { PeriodoTasa } from '../../types/clientes';

export const inputClase =
    'w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-xl placeholder-slate-400 focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none disabled:bg-white disabled:text-slate-400 disabled:cursor-not-allowed';

interface CampoProps {
    id: string;
    label: string;
    ayuda: string;
    children: React.ReactNode;
}

export const Campo: React.FC<CampoProps> = ({ id, label, ayuda, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-slate-800 mb-1.5">
            {label}
        </label>
        {children}
        <p className="text-[11px] text-slate-500 mt-1.5">{ayuda}</p>
    </div>
);

/** Select con la flecha del diseño. */
export const Selector: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className = '', ...props }) => (
    <div className="relative">
        <select {...props} className={`${inputClase} appearance-none pr-10 cursor-pointer ${className}`}>
            {children}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
);

export const TituloSeccion: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-4">{children}</p>
);

interface CondicionesCreditoFormProps {
    valores: CondicionesForm;
    onChange: (valores: CondicionesForm) => void;
    /** En la edición la moneda es de solo lectura: el backend rechaza cambiarla. */
    modo: 'registro' | 'edicion';
    deshabilitado?: boolean;
}

export const CondicionesCreditoForm: React.FC<CondicionesCreditoFormProps> = ({
                                                                                  valores,
                                                                                  onChange,
                                                                                  modo,
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
        <fieldset disabled={deshabilitado}>
            <TituloSeccion>Condiciones de crédito</TituloSeccion>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <Campo id="cc-tipo-tasa" label="Tipo de tasa" ayuda="La tasa efectiva expresa directamente el costo del periodo indicado.">
                    <Selector
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
                    >
                        <option value="EFECTIVA">Efectiva</option>
                        <option value="NOMINAL">Nominal</option>
                    </Selector>
                </Campo>
                <Campo id="cc-valor-tasa" label="Valor de la tasa" ayuda="Mayor que 0; conserva al menos 7 decimales.">
                    <input
                        id="cc-valor-tasa"
                        type="text"
                        inputMode="decimal"
                        required
                        value={valores.valorTasa}
                        onChange={(e) => set('valorTasa', e.target.value)}
                        onBlur={() => set('valorTasa', formatearPorcentaje(valores.valorTasa))}
                        placeholder="2.5000000%"
                        className={inputClase}
                    />
                </Campo>

                <Campo id="cc-periodo-tasa" label="Periodo de referencia" ayuda="Periodo de la tasa; para cálculos se usa mes comercial de 30 días.">
                    <Selector
                        id="cc-periodo-tasa"
                        value={valores.periodoTasa}
                        onChange={(e) => set('periodoTasa', e.target.value as PeriodoTasa)}
                    >
                        {opcionesPeriodo}
                    </Selector>
                </Campo>
                <Campo id="cc-cap-tasa" label="Capitalización nominal" ayuda="Obligatoria cuando se elige una tasa nominal.">
                    {valores.tipoTasa === 'NOMINAL' ? (
                        <Selector
                            id="cc-cap-tasa"
                            value={valores.capitalizacionTasa}
                            onChange={(e) => set('capitalizacionTasa', e.target.value as PeriodoTasa)}
                        >
                            {opcionesPeriodo}
                        </Selector>
                    ) : (
                        <input id="cc-cap-tasa" type="text" readOnly value="No aplica a tasa efectiva" className={`${inputClase} cursor-default`} />
                    )}
                </Campo>

                <Campo
                    id="cc-moneda"
                    label="Moneda"
                    ayuda={modo === 'edicion' ? 'Solo lectura: la moneda del crédito no se modifica.' : 'Moneda única del crédito y sus pagos.'}
                >
                    {modo === 'edicion' ? (
                        <input id="cc-moneda" type="text" disabled value={etiquetaMoneda(valores.moneda)} className={inputClase} />
                    ) : (
                        <Selector
                            id="cc-moneda"
                            value={valores.moneda}
                            onChange={(e) => {
                                const moneda = e.target.value as CondicionesForm['moneda'];
                                onChange({ ...valores, moneda, limiteCredito: formatearLimite(valores.limiteCredito, moneda) });
                            }}
                        >
                            <option value="PEN">Soles (PEN)</option>
                            <option value="USD">Dólares (USD)</option>
                        </Selector>
                    )}
                </Campo>
                <Campo
                    id="cc-limite"
                    label="Límite máximo"
                    ayuda={modo === 'edicion' ? 'No puede ser menor al crédito utilizado.' : 'No se permite superar el crédito disponible.'}
                >
                    <input
                        id="cc-limite"
                        type="text"
                        inputMode="decimal"
                        required
                        value={valores.limiteCredito}
                        onChange={(e) => set('limiteCredito', e.target.value)}
                        onBlur={() => set('limiteCredito', formatearLimite(valores.limiteCredito, valores.moneda))}
                        placeholder={valores.moneda === 'USD' ? 'US$ 2,000.00' : 'S/ 2,000.00'}
                        className={inputClase}
                    />
                </Campo>

                <Campo id="cc-plazo" label="Plazo máximo" ayuda="Máximo número de meses permitido para el crédito.">
                    <input
                        id="cc-plazo"
                        type="text"
                        inputMode="numeric"
                        required
                        value={valores.plazoMaximo}
                        onChange={(e) => set('plazoMaximo', e.target.value)}
                        onBlur={() => set('plazoMaximo', formatearPlazo(valores.plazoMaximo))}
                        placeholder="6 meses"
                        className={inputClase}
                    />
                </Campo>
                <Campo id="cc-dia-corte" label="Día de corte" ayuda="Día 1–31; si no existe, último día del mes.">
                    <input
                        id="cc-dia-corte"
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={2}
                        value={valores.diaCorte}
                        onChange={(e) => set('diaCorte', e.target.value.replace(/\D/g, ''))}
                        placeholder="10"
                        className={inputClase}
                    />
                </Campo>

                <Campo id="cc-hora-corte" label="Hora de corte" ayuda="Hora límite del corte en formato de 24 horas.">
                    <input
                        id="cc-hora-corte"
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={5}
                        value={valores.horaCorte}
                        onChange={(e) => set('horaCorte', e.target.value)}
                        placeholder="18:00"
                        className={inputClase}
                    />
                </Campo>
                <Campo id="cc-dia-pago" label="Día de pago" ayuda="Día 1–31; si no existe, último día del mes.">
                    <input
                        id="cc-dia-pago"
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={2}
                        value={valores.diaPago}
                        onChange={(e) => set('diaPago', e.target.value.replace(/\D/g, ''))}
                        placeholder="15"
                        className={inputClase}
                    />
                </Campo>

                <Campo id="cc-tipo-mora" label="Tipo de tasa moratoria" ayuda="Naturaleza de la tasa aplicada por atraso.">
                    <Selector
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
                    >
                        <option value="EFECTIVA">Efectiva</option>
                        <option value="NOMINAL">Nominal</option>
                    </Selector>
                </Campo>
                <Campo id="cc-periodo-mora" label="Periodo de tasa moratoria" ayuda="Periodo al que corresponde la tasa moratoria.">
                    <Selector
                        id="cc-periodo-mora"
                        value={valores.periodoMora}
                        onChange={(e) => set('periodoMora', e.target.value as PeriodoTasa)}
                    >
                        {opcionesPeriodo}
                    </Selector>
                </Campo>

                <Campo id="cc-valor-mora" label="Tasa moratoria" ayuda="Mayor que 0; se aplica al total vencido.">
                    <input
                        id="cc-valor-mora"
                        type="text"
                        inputMode="decimal"
                        required
                        value={valores.valorMora}
                        onChange={(e) => set('valorMora', e.target.value)}
                        onBlur={() => set('valorMora', formatearPorcentaje(valores.valorMora))}
                        placeholder="1.2000000%"
                        className={inputClase}
                    />
                </Campo>
                <Campo id="cc-cap-mora" label="Capitalización moratoria" ayuda="Frecuencia de capitalización cuando la tasa moratoria es nominal.">
                    {valores.tipoTasaMora === 'NOMINAL' ? (
                        <Selector
                            id="cc-cap-mora"
                            value={valores.capitalizacionMora}
                            onChange={(e) => set('capitalizacionMora', e.target.value as PeriodoTasa)}
                        >
                            {opcionesPeriodo}
                        </Selector>
                    ) : (
                        <input id="cc-cap-mora" type="text" readOnly value="No aplica a tasa efectiva" className={`${inputClase} cursor-default`} />
                    )}
                </Campo>
            </div>
        </fieldset>
    );
};