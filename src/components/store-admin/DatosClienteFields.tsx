import React from 'react';
import { Campo, inputClase } from './CondicionesCreditoForm';

export interface DatosClienteForm {
    nombre: string;
    dni: string;
    telefono: string;
    correo: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

interface DatosClienteFieldsProps {
    valores: DatosClienteForm;
    onChange: (valores: DatosClienteForm) => void;
    /** Contraseña inicial: solo se pide al registrar. */
    contrasena?: { valor: string; onChange: (valor: string) => void };
}

export const DatosClienteFields: React.FC<DatosClienteFieldsProps> = ({ valores, onChange, contrasena }) => {
    const set = <K extends keyof DatosClienteForm>(campo: K, valor: DatosClienteForm[K]) =>
        onChange({ ...valores, [campo]: valor });

    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Datos generales</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo id="dc-nombre" label="Nombres y apellidos" ayuda="Nombre completo del titular del crédito.">
                    <input
                        id="dc-nombre"
                        type="text"
                        required
                        maxLength={200}
                        value={valores.nombre}
                        onChange={(e) => set('nombre', e.target.value)}
                        placeholder="María Quispe"
                        className={inputClase}
                    />
                </Campo>
                <Campo id="dc-dni" label="DNI" ayuda="Documento de 8 dígitos; no puede repetirse en la tienda.">
                    <input
                        id="dc-dni"
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={8}
                        value={valores.dni}
                        onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))}
                        placeholder="45892136"
                        className={inputClase}
                    />
                </Campo>
                <Campo id="dc-telefono" label="Teléfono" ayuda="Opcional. Contacto para comunicaciones del negocio.">
                    <input
                        id="dc-telefono"
                        type="tel"
                        maxLength={15}
                        value={valores.telefono}
                        onChange={(e) => set('telefono', e.target.value)}
                        placeholder="987 654 321"
                        className={inputClase}
                    />
                </Campo>
                <Campo id="dc-estado" label="Estado" ayuda="Inactivo bloquea nuevas ventas; conserva deudas y pagos.">
                    <select
                        id="dc-estado"
                        value={valores.estado}
                        onChange={(e) => set('estado', e.target.value as DatosClienteForm['estado'])}
                        className={`${inputClase} cursor-pointer`}
                    >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </Campo>
                <Campo id="dc-correo" label="Correo de acceso" ayuda="Usuario del portal de consulta del cliente.">
                    <input
                        id="dc-correo"
                        type="email"
                        required
                        maxLength={150}
                        value={valores.correo}
                        onChange={(e) => set('correo', e.target.value)}
                        placeholder="maria@ejemplo.com"
                        className={inputClase}
                    />
                </Campo>
                {contrasena && (
                    <Campo id="dc-contrasena" label="Contraseña inicial" ayuda="Entre 8 y 72 caracteres. Entrégala al cliente para su primer ingreso.">
                        <input
                            id="dc-contrasena"
                            type="password"
                            required
                            minLength={8}
                            maxLength={72}
                            autoComplete="new-password"
                            value={contrasena.valor}
                            onChange={(e) => contrasena.onChange(e.target.value)}
                            placeholder="••••••••"
                            className={inputClase}
                        />
                    </Campo>
                )}
            </div>
        </div>
    );
};