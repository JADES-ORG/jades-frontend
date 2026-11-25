import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

interface EditarCondicionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (condicionesActualizadas: any) => void;
}

export const EditarCondicionesModal: React.FC<EditarCondicionesModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [tipoTasa, setTipoTasa] = useState('Efectiva');
  const [valorTasa, setValorTasa] = useState('2.500000%');
  const [periodoReferencia, setPeriodoReferencia] = useState('Mensual');
  const [capitalizacionNominal, setCapitalizacionNominal] = useState('No aplica a tasa efectiva');
  const [moneda, setMoneda] = useState('Soles (PEN)');
  const [limiteMaximo, setLimiteMaximo] = useState('S/ 2,000.00');
  const [plazoMaximo, setPlazoMaximo] = useState('6 meses');
  const [diaCorte, setDiaCorte] = useState('10');
  const [horaCorte, setHoraCorte] = useState('18:00');
  const [diaPago, setDiaPago] = useState('15');
  const [tipoMora, setTipoMora] = useState('Nominal');
  const [periodoMora, setPeriodoMora] = useState('Mensual');
  const [valorMora, setValorMora] = useState('1.200000%');
  const [capitalizacionMora, setCapitalizacionMora] = useState('Diaria');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      tipoTasa,
      valorTasa,
      periodoReferencia,
      moneda,
      limiteMaximo,
      plazoMaximo,
      diaCorte,
      horaCorte,
      diaPago,
      tipoMora,
      valorMora,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Editar condiciones de crédito
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifica las condiciones pactadas para las futuras ventas a crédito del cliente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              CONDICIONES DE CRÉDITO
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de tasa
                </label>
                <select
                  value={tipoTasa}
                  onChange={(e) => {
                    setTipoTasa(e.target.value);
                    if (e.target.value === 'Efectiva') {
                      setCapitalizacionNominal('No aplica a tasa efectiva');
                    } else {
                      setCapitalizacionNominal('Diaria');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Efectiva">Efectiva</option>
                  <option value="Nominal">Nominal</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">La tasa efectiva expresa directamente el costo del período indicado.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor de la tasa
                </label>
                <input
                  type="text"
                  value={valorTasa}
                  onChange={(e) => setValorTasa(e.target.value)}
                  placeholder="2.500000%"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Porcentaje pactado.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Periodo de referencia
                </label>
                <select
                  value={periodoReferencia}
                  onChange={(e) => setPeriodoReferencia(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Anual">Anual</option>
                  <option value="Diaria">Diaria</option>
                  <option value="Bimestral">Bimestral</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Periodo de la tasa; para cálculos se usa mes comercial de 30 días.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capitalización nominal
                </label>
                <input
                  type="text"
                  disabled={tipoTasa === 'Efectiva'}
                  value={capitalizacionNominal}
                  onChange={(e) => setCapitalizacionNominal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Obligatoria cuando se elige una tasa nominal.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Moneda
                </label>
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Soles (PEN)">Soles (PEN)</option>
                  <option value="Dólares (USD)">Dólares (USD)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Moneda única del crédito y sus pagos.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Límite máximo
                </label>
                <input
                  type="text"
                  value={limiteMaximo}
                  onChange={(e) => setLimiteMaximo(e.target.value)}
                  placeholder="S/ 2,000.00"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">No se permiten ventas superiores al disponible.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plazo máximo
                </label>
                <input
                  type="text"
                  value={plazoMaximo}
                  onChange={(e) => setPlazoMaximo(e.target.value)}
                  placeholder="6 meses"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Máximo número de meses permitido para el crédito.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Día de corte
                </label>
                <input
                  type="text"
                  value={diaCorte}
                  onChange={(e) => setDiaCorte(e.target.value)}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Día mensual que cierra el ciclo de compras.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hora de corte
                </label>
                <input
                  type="text"
                  value={horaCorte}
                  onChange={(e) => setHoraCorte(e.target.value)}
                  placeholder="18:00"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Hora límite del corte en formato de 24 horas.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Día de pago
                </label>
                <input
                  type="text"
                  value={diaPago}
                  onChange={(e) => setDiaPago(e.target.value)}
                  placeholder="15"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Día mensual pactado para cancelar las obligaciones.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de tasa moratoria
                </label>
                <select
                  value={tipoMora}
                  onChange={(e) => setTipoMora(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Nominal">Nominal</option>
                  <option value="Efectiva">Efectiva</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Naturaleza de la tasa aplicada por atraso.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Periodo de tasa moratoria
                </label>
                <select
                  value={periodoMora}
                  onChange={(e) => setPeriodoMora(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Diaria">Diaria</option>
                  <option value="Anual">Anual</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Periodo al que corresponde la tasa moratoria.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tasa moratoria
                </label>
                <input
                  type="text"
                  value={valorMora}
                  onChange={(e) => setValorMora(e.target.value)}
                  placeholder="1.200000%"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Porcentaje aplicado al total vencido durante el atraso.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capitalización moratoria
                </label>
                <select
                  value={capitalizacionMora}
                  onChange={(e) => setCapitalizacionMora(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-[#139a6c] focus:ring-1 focus:ring-[#139a6c] outline-none cursor-pointer"
                >
                  <option value="Diaria">Diaria</option>
                  <option value="Mensual">Mensual</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Frecuencia de capitalización cuando la tasa moratoria es nominal.</p>
              </div>
            </div>
          </div>

          {/* Banner Base 360/30 */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3.5 flex items-center space-x-3 text-emerald-800">
            <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
            <p className="text-xs font-medium">
              Base 360/30. El periodo de gracia se determina con la fecha de compra y el ciclo, antes de calcular la cuota francesa.
            </p>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
