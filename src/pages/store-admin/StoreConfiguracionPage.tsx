import React, { useState } from 'react';

interface StoreConfiguracionPageProps {
  onSaveSuccess: () => void;
}

export const StoreConfiguracionPage: React.FC<StoreConfiguracionPageProps> = ({
  onSaveSuccess,
}) => {
  const [nombreComercial, setNombreComercial] = useState('Bodega San Blas');
  const [tipoNegocio, setTipoNegocio] = useState('Bodega');
  const [telefono, setTelefono] = useState('987 654 321');
  const [correo, setCorreo] = useState('contacto@ejemplo.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Subtítulo de la sección */}
      <p className="text-xs text-slate-500 font-normal">
        Datos visibles de la cuenta y preferencias del negocio.
      </p>

      {/* Tarjeta del Formulario */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nombre comercial */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre comercial
              </label>
              <input
                type="text"
                required
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Nombre visible para tus clientes.
              </p>
            </div>

            {/* Tipo de negocio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de negocio
              </label>
              <input
                type="text"
                required
                value={tipoNegocio}
                onChange={(e) => setTipoNegocio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Giro registrado de la tienda.
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Número de contacto del negocio.
              </p>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Correo para comunicaciones.
              </p>
            </div>
          </div>

          {/* Botón Guardar cambios */}
          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
