import React, { useState } from 'react';
import {
  Search,
  Info,
  Calendar,
  FileText,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import type { ProductoData } from '../../components/store-admin/ProductoModal';

export interface VentaItem {
  id: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

interface StoreNuevaVentaPageProps {
  productosCatalogo: ProductoData[];
  onCancel: () => void;
  onConfirmSale: (datosVenta: {
    cliente: string;
    dni: string;
    modalidad: 'unico' | 'meses';
    meses: number;
    totalCapital: number;
    totalEsperado: number;
  }) => void;
}

export const StoreNuevaVentaPage: React.FC<StoreNuevaVentaPageProps> = ({
  productosCatalogo,
  onCancel,
  onConfirmSale,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Paso 1: Cliente seleccionado
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient] = useState({
    nombre: 'María Quispe',
    dni: '45892136',
    estado: 'Activo',
    creditoDisponible: 1591.74,
    limiteCredito: 2000.00,
    tasa: 'Efectiva · 2.500000% mensual',
    plazoMaximo: '6 meses',
    cortePago: 'Día 10 · 18:00 h / Día 15',
    mora: 'TNM 1.200000% · cap. diaria',
    convenciones: '360 días / meses de 30 días',
    moneda: 'Soles (PEN)',
  });

  // Paso 2: Productos agregados
  const [itemsVenta, setItemsVenta] = useState<VentaItem[]>([
    {
      id: 1,
      nombre: 'Canasta de abarrotes',
      precioUnitario: 85.00,
      cantidad: 3,
    },
    {
      id: 2,
      nombre: 'Pack cuidado personal',
      precioUnitario: 45.00,
      cantidad: 2,
    },
  ]);
  const [productSearch, setProductSearch] = useState('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // Paso 3: Modalidad de pago
  const [modalidadPago, setModalidadPago] = useState<'unico' | 'meses'>('unico');
  const [cantidadMeses, setCantidadMeses] = useState<number>(3);

  // Cálculos dinámicos
  const capitalTotal = itemsVenta.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0
  );

  // Cálculos financieros (30 días base, TEM 2.5%)
  const interesGracia = Number((capitalTotal * 0.025).toFixed(2)); // S/ 8.63 para 345
  const capitalDespuesGracia = capitalTotal + interesGracia; // S/ 353.63

  // Cuota francesa para 3 meses: P = 353.63, i = 0.025, n = 3
  // Cuota = 353.63 * [0.025 * (1.025)^3] / [(1.025)^3 - 1] = S/ 123.82
  const cuotaMensual = 123.82;
  const totalEsperadoMeses = 371.46;
  const totalInteresesMeses = 26.46;

  const totalEsperadoUnico = Number((capitalTotal + interesGracia).toFixed(2)); // S/ 353.63

  const creditoRestante = (selectedClient.creditoDisponible - capitalTotal).toFixed(2);

  // Handlers de productos
  const handleIncreaseQty = (id: number) => {
    setItemsVenta((prev) =>
      prev.map((it) => (it.id === id ? { ...it, cantidad: it.cantidad + 1 } : it))
    );
  };

  const handleDecreaseQty = (id: number) => {
    setItemsVenta((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, cantidad: it.cantidad - 1 } : it))
        .filter((it) => it.cantidad > 0)
    );
  };

  const handleAddProduct = (prod: ProductoData) => {
    const existing = itemsVenta.find((it) => it.nombre === prod.nombre);
    if (existing) {
      handleIncreaseQty(existing.id);
    } else {
      setItemsVenta((prev) => [
        ...prev,
        {
          id: prod.id || Date.now(),
          nombre: prod.nombre,
          precioUnitario: prod.precioCredito,
          cantidad: 1,
        },
      ]);
    }
    setProductSearch('');
    setShowCatalogDropdown(false);
  };

  const handleRemoveProduct = (id: number) => {
    setItemsVenta((prev) => prev.filter((it) => it.id !== id));
  };

  const handleConfirm = () => {
    onConfirmSale({
      cliente: selectedClient.nombre,
      dni: selectedClient.dni,
      modalidad: modalidadPago,
      meses: cantidadMeses,
      totalCapital: capitalTotal,
      totalEsperado: modalidadPago === 'unico' ? totalEsperadoUnico : totalEsperadoMeses,
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Nueva venta a crédito
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Completa los datos para registrar el crédito.
        </p>
      </div>

      {/* Stepper Wizard (4 Pasos) */}
      <div className="flex items-center space-x-6 sm:space-x-12 py-2 text-xs font-semibold overflow-x-auto">
        <div className="flex items-center space-x-2 shrink-0">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1
                ? 'bg-[#139a6c] text-white'
                : currentStep > 1
                ? 'bg-emerald-100 text-[#139a6c]'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </span>
          <span className={currentStep === 1 ? 'text-slate-900 font-bold' : 'text-slate-500'}>
            Cliente
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2
                ? 'bg-[#139a6c] text-white'
                : currentStep > 2
                ? 'bg-emerald-100 text-[#139a6c]'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <span className={currentStep === 2 ? 'text-slate-900 font-bold' : 'text-slate-500'}>
            Productos / servicios
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3
                ? 'bg-[#139a6c] text-white'
                : currentStep > 3
                ? 'bg-emerald-100 text-[#139a6c]'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </span>
          <span className={currentStep === 3 ? 'text-slate-900 font-bold' : 'text-slate-500'}>
            Modalidad de pago
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 4
                ? 'bg-[#139a6c] text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            4
          </span>
          <span className={currentStep === 4 ? 'text-slate-900 font-bold' : 'text-slate-500'}>
            Confirmación
          </span>
        </div>
      </div>

      {/* =========================================================================
          PASO 1: SELECCIONA EL CLIENTE
          ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Selecciona el cliente
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Busca al cliente para consultar sus condiciones de crédito.
            </p>
          </div>

          {/* Buscador de cliente */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
            />
          </div>

          {/* Tarjeta de Cliente Seleccionado (Fondo verde suave) */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center font-extrabold text-xs text-slate-700 shadow-xs border border-emerald-100">
                MQ
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedClient.nombre}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  DNI {selectedClient.dni} · Cliente activo
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-[11px] text-slate-500 font-medium">
                Crédito disponible antes de esta venta
              </p>
              <p className="text-xl font-bold text-[#139a6c] mt-0.5">
                S/ {selectedClient.creditoDisponible.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Condiciones pactadas (Grid 2 filas x 4 columnas) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4">
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Tasa de interés</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.tasa}</p>
              </div>
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Límite de crédito</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  S/ {selectedClient.limiteCredito.toFixed(2)}
                </p>
              </div>
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Plazo máximo</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.plazoMaximo}</p>
              </div>
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Corte / pago</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.cortePago}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4">
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Tasa moratoria</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.mora}</p>
              </div>
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Convenciones</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.convenciones}</p>
              </div>
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Moneda</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.moneda}</p>
              </div>
              <div className="p-2 text-left">
                <p className="text-[11px] text-slate-400">Estado</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedClient.estado}</p>
              </div>
            </div>
          </div>

          {/* Banner Informativo */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 text-left flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-[#139a6c] shrink-0" />
            <p className="text-xs text-slate-600">
              Las condiciones mostradas son las pactadas con el cliente y se aplicarán al cálculo de esta venta.
            </p>
          </div>

          {/* Botones de navegación */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PASO 2: AGREGA PRODUCTOS O SERVICIOS
          ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2 Agrega productos o servicios
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Se aplicará el precio de crédito y solo estarán disponibles las modalidades permitidas por los conceptos seleccionados.
            </p>
          </div>

          {/* Buscador de productos con dropdown de catálogo */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto o servicio para agregar"
              value={productSearch}
              onFocus={() => setShowCatalogDropdown(true)}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowCatalogDropdown(true);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#139a6c]"
            />

            {showCatalogDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
                {productosCatalogo
                  .filter((p) =>
                    p.nombre.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-100 last:border-none text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{p.nombre}</p>
                        <p className="text-[10px] text-slate-400">{p.tipo} · {p.marca}</p>
                      </div>
                      <span className="font-bold text-[#139a6c]">
                        S/ {p.precioCredito.toFixed(2)} (crédito)
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Tabla de Detalle de la Venta */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              DETALLE DE LA VENTA
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-6">PRODUCTO</th>
                    <th className="py-3 px-4">PRECIO UNITARIO</th>
                    <th className="py-3 px-4 text-center">CANTIDAD</th>
                    <th className="py-3 px-6 text-right">SUBTOTAL</th>
                    <th className="py-3 px-4 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {itemsVenta.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {item.nombre}
                      </td>
                      <td className="py-4 px-4 font-normal text-slate-600">
                        S/ {item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center space-x-2 border border-slate-200 rounded-lg px-2 py-1">
                          <button
                            onClick={() => handleDecreaseQty(item.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-800 text-xs px-1">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => handleIncreaseQty(item.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleRemoveProduct(item.id)}
                          className="text-slate-300 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Fila de Totales de Capital y Crédito */}
              <div className="bg-slate-50/70 border-t border-slate-100 p-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Capital total</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    S/ {capitalTotal.toFixed(2)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] text-slate-400 font-medium">Disponible</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    S/ {selectedClient.creditoDisponible.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Atrás
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={itemsVenta.length === 0}
              className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PASO 3: CONFIGURA LA MODALIDAD DE PAGO
          ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3 Configura la modalidad de pago
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {modalidadPago === 'unico'
                ? 'Un solo pago en el ciclo correspondiente.'
                : 'Elige cómo pagará el cliente esta compra.'}
            </p>
          </div>

          {/* Dos tarjetas de selección de modalidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Modalidad 1: Pago único */}
            <div
              onClick={() => setModalidadPago('unico')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-4 ${
                modalidadPago === 'unico'
                  ? 'border-[#139a6c] bg-[#f0fdf4]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  modalidadPago === 'unico'
                    ? 'bg-[#139a6c] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Pago único del ciclo
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Un solo pago en la fecha del ciclo
                </p>
              </div>
            </div>

            {/* Modalidad 2: Pago en meses */}
            <div
              onClick={() => setModalidadPago('meses')}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-4 ${
                modalidadPago === 'meses'
                  ? 'border-[#139a6c] bg-[#f0fdf4]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  modalidadPago === 'meses'
                    ? 'bg-[#139a6c] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Pago en meses
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Plan mensual con método francés vencido
                </p>
              </div>
            </div>
          </div>

          {/* DETALLES DE MODALIDAD A: PAGO ÚNICO DEL CICLO */}
          {modalidadPago === 'unico' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Aplicación del ciclo mensual
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compra posterior al corte: pago en julio.
                  </p>
                </div>

                {/* Grid 4 columnas x 2 filas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs border-y border-slate-100 py-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Fecha de compra</p>
                    <p className="font-semibold text-slate-800 mt-0.5">15 jun 2025 · 10:42 h</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Corte aplicable</p>
                    <p className="font-semibold text-slate-800 mt-0.5">10 jul 2025 · 18:00 h</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Fecha de pago</p>
                    <p className="font-semibold text-slate-800 mt-0.5">15 jul 2025</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Días comerciales</p>
                    <p className="font-semibold text-slate-800 mt-0.5">30 días</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Capital</p>
                    <p className="font-bold text-slate-900 mt-0.5">S/ {capitalTotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Tasa efectiva mensual</p>
                    <p className="font-semibold text-slate-800 mt-0.5">2.500000%</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Interés compensatorio</p>
                    <p className="font-bold text-slate-900 mt-0.5">S/ {interesGracia.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Total esperado</p>
                    <p className="font-bold text-slate-900 mt-0.5">S/ {totalEsperadoUnico.toFixed(2)}</p>
                  </div>
                </div>

                {/* Banner Informativo */}
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 text-left flex items-start space-x-2.5">
                  <Info className="w-4 h-4 text-[#139a6c] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    Compra posterior al corte: la obligación pasa al ciclo de julio. El interés se calcula automáticamente desde la fecha de compra hasta la fecha de pago.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DETALLES DE MODALIDAD B: PAGO EN MESES (MÉTODO FRANCÉS CON GRACIA) */}
          {modalidadPago === 'meses' && (
            <div className="space-y-6">
              {/* Inputs de configuración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cantidad de meses
                  </label>
                  <div className="relative">
                    <select
                      value={cantidadMeses}
                      onChange={(e) => setCantidadMeses(Number(e.target.value))}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#139a6c] cursor-pointer"
                    >
                      <option value={1}>1 mes</option>
                      <option value={2}>2 meses</option>
                      <option value={3}>3 meses</option>
                      <option value={4}>4 meses</option>
                      <option value={5}>5 meses</option>
                      <option value={6}>6 meses</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Máximo pactado: 6 meses.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periodo de gracia total
                  </label>
                  <input
                    type="text"
                    disabled
                    value="30 días · hasta 15/07/2025"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Se capitaliza desde la compra hasta el pago del ciclo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primera fecha de pago
                  </label>
                  <input
                    type="text"
                    disabled
                    value="15/08/2025"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Primera cuota mensual después de capitalizar la gracia.
                  </p>
                </div>
              </div>

              {/* Resumen del Financiamiento */}
              <div className="border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Resumen del financiamiento
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Método francés vencido simple ordinario · TEM 2.500000% · Compra 15 jun 2025 · 10:42 h · Corte 10 jul 2025 · 18:00 h
                  </p>
                </div>

                {/* 4 Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl text-left">
                  <div>
                    <p className="text-[11px] text-slate-400">Capital inicial</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      S/ {capitalTotal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Interés de gracia</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      S/ {interesGracia.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Capital después de gracia</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      S/ {capitalDespuesGracia.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Cuota mensual</p>
                    <p className="text-base font-bold text-[#139a6c] mt-0.5">
                      S/ {cuotaMensual.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Cronograma preliminar */}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 mb-2">Cronograma preliminar</h5>
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="py-2.5 px-4">N.°</th>
                          <th className="py-2.5 px-4">FECHA DE PAGO</th>
                          <th className="py-2.5 px-4">SALDO INICIAL</th>
                          <th className="py-2.5 px-4">INTERÉS</th>
                          <th className="py-2.5 px-4">AMORTIZACIÓN</th>
                          <th className="py-2.5 px-4">CUOTA</th>
                          <th className="py-2.5 px-4">SALDO FINAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-900">01</td>
                          <td className="py-3 px-4">15 ago 2025</td>
                          <td className="py-3 px-4">S/ 353.63</td>
                          <td className="py-3 px-4">S/ 8.84</td>
                          <td className="py-3 px-4">S/ 114.98</td>
                          <td className="py-3 px-4 font-bold text-slate-900">S/ 123.82</td>
                          <td className="py-3 px-4">S/ 238.65</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-900">02</td>
                          <td className="py-3 px-4">15 sep 2025</td>
                          <td className="py-3 px-4">S/ 238.65</td>
                          <td className="py-3 px-4">S/ 5.97</td>
                          <td className="py-3 px-4">S/ 117.85</td>
                          <td className="py-3 px-4 font-bold text-slate-900">S/ 123.82</td>
                          <td className="py-3 px-4">S/ 120.80</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-900">03</td>
                          <td className="py-3 px-4">15 oct 2025</td>
                          <td className="py-3 px-4">S/ 120.80</td>
                          <td className="py-3 px-4">S/ 3.02</td>
                          <td className="py-3 px-4">S/ 120.80</td>
                          <td className="py-3 px-4 font-bold text-slate-900">S/ 123.82</td>
                          <td className="py-3 px-4">S/ 0.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Total programado: S/ 371.46 · Intereses totales: S/ 26.46. El cronograma definitivo se genera al registrar el crédito.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Atrás
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PASO 4: CONFIRMACIÓN Y REVISIÓN
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columna Izquierda: Revisa y confirma la venta */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Revisa y confirma la venta
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifica que los datos sean correctos.
              </p>
            </div>

            {/* Cliente */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CLIENTE
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {selectedClient.nombre} · DNI {selectedClient.dni}
              </p>
            </div>

            {/* Productos */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                PRODUCTOS
              </p>
              <div className="space-y-2 text-xs">
                {itemsVenta.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-slate-700">
                    <span>
                      {item.cantidad} × {item.nombre}
                    </span>
                    <span className="font-bold text-slate-900">
                      S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan de pagos */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                PLAN DE PAGOS
              </p>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Modalidad</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {modalidadPago === 'unico'
                        ? 'Pago único del ciclo'
                        : `${cantidadMeses} meses · método francés`}
                    </p>
                  </div>
                  <div className="sm:pl-4">
                    <p className="text-[11px] text-slate-400">Fecha de pago</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {modalidadPago === 'unico' ? '15 jul 2025' : 'Primera: 15 ago 2025'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Tasa pactada</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      Efectiva · 2.500000% mensual
                    </p>
                  </div>
                  <div className="sm:pl-4">
                    <p className="text-[11px] text-slate-400">Corte aplicable</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      10 jul · 18:00 h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de navegación */}
            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Atrás
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2.5 bg-[#139a6c] hover:bg-[#0f825b] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirmar crédito
              </button>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Verde Oscuro (#0e3b2e) Resumen Financiero */}
          <div className="bg-[#0e3b2e] text-white rounded-3xl p-6 shadow-md space-y-5">
            <h4 className="text-sm font-bold text-white">Resumen</h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-emerald-100/70">
                <span>Capital de la venta</span>
                <span className="font-semibold text-white">S/ {capitalTotal.toFixed(2)}</span>
              </div>

              {modalidadPago === 'unico' ? (
                <div className="flex justify-between items-center text-emerald-100/70">
                  <span>Interés compensatorio</span>
                  <span className="font-semibold text-white">S/ {interesGracia.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-emerald-100/70">
                  <span>Intereses totales</span>
                  <span className="font-semibold text-white">S/ {totalInteresesMeses.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-[11px] text-emerald-200/70">Total esperado</p>
              <p className="text-3xl font-extrabold text-white mt-1">
                S/ {modalidadPago === 'unico' ? totalEsperadoUnico.toFixed(2) : totalEsperadoMeses.toFixed(2)}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                Venta dentro del límite disponible
              </span>

              <p className="text-xs font-bold text-emerald-100">
                Restarán S/ {creditoRestante} de crédito
              </p>

              <p className="text-[10px] text-emerald-200/50 leading-relaxed">
                Disponible previo: S/ {selectedClient.creditoDisponible.toFixed(2)}. Para validar el límite se reserva el capital de la venta: S/ {capitalTotal.toFixed(2)}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
