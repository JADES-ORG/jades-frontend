import React, { useState } from 'react';
import { Download, Eye, ChevronDown, Info } from 'lucide-react';
import type { CorteItemData } from '../../components/store-admin/DetalleCorteModal';

export const initialCortes: CorteItemData[] = [
  {
    id: 1,
    cliente: 'María Quispe',
    fechaCorte: '10 jun · 18:00 h',
    fechaPago: '15 jun 2025',
    obligacion: 'Cuota 02',
    capital: 201.61,
    interesCompensatorio: 10.21,
    mora: 0.00,
    totalPagar: 211.82,
    estado: 'Pendiente',
    subtituloModal: 'Corte 10 jun 2025, 18:00 h · Pago 15 jun 2025',
    conceptos: [
      {
        fecha: '05 abr 2025',
        concepto: 'Cuota 02 · CR-001284',
        dias: '30 días',
        capitalBase: 'S/ 201.61',
        interes: 'S/ 10.21',
      },
    ],
    totalExigible: 'S/ 211.82',
    estadoModal: 'Vence hoy',
    infoBanner:
      'TEM compensatoria: 2.500000%. Interés S/ 10.21 calculado sobre saldo inicial S/ 408.26; amortización S/ 201.61.',
    allowRegisterPago: true,
  },
  {
    id: 2,
    cliente: 'Rosa Huamán',
    fechaCorte: '02 jun · 20:00 h',
    fechaPago: '07 jun 2025',
    obligacion: '2 compras',
    capital: 280.00,
    interesCompensatorio: 3.58,
    mora: 0.91,
    totalPagar: 284.49,
    estado: 'En mora',
    subtituloModal: 'Corte 02 jun 2025, 20:00 h · Pago 07 jun 2025',
    conceptos: [
      {
        fecha: '18 may 2025',
        concepto: 'Productos varios · pago único',
        dias: '19 días',
        capitalBase: 'S/ 180.00',
        interes: 'S/ 2.84',
      },
      {
        fecha: '28 may 2025',
        concepto: 'Canasta familiar · pago único',
        dias: '9 días',
        capitalBase: 'S/ 100.00',
        interes: 'S/ 0.74',
      },
      {
        fecha: '07–15 jun',
        concepto: 'Intereses por mora',
        dias: '8 días',
        capitalBase: 'Base 283.58',
        interes: 'S/ 0.91',
        isMoraRow: true,
      },
    ],
    totalExigible: 'S/ 284.49',
    estadoModal: 'Vencido · 8 días',
    infoBanner:
      'TEM compensatoria 2.500000%. TNM moratoria 1.200000%, capitalización diaria. Base de mora: S/ 283.58. Tasa efectiva de 8 días: 0.3204484%.',
    allowRegisterPago: true,
  },
  {
    id: 3,
    cliente: 'Carlos Mendoza',
    fechaCorte: '11 jun · 18:00 h',
    fechaPago: '16 jun 2025',
    obligacion: '1 compra',
    capital: 1750.00,
    interesCompensatorio: 43.75,
    mora: 0.00,
    totalPagar: 1793.75,
    estado: 'Por vencer',
    subtituloModal: 'Corte 11 jun 2025, 18:00 h · Pago 16 jun 2025',
    conceptos: [
      {
        fecha: '16 may 2025',
        concepto: 'Productos · CR-001240',
        dias: '30 días',
        capitalBase: 'S/ 1,750.00',
        interes: 'S/ 43.75',
      },
    ],
    totalExigible: 'S/ 1,793.75',
    estadoModal: 'Por vencer',
    infoBanner: 'TEM compensatoria: 2.500000%.',
    allowRegisterPago: false,
  },
  {
    id: 4,
    cliente: 'Jorge Flores',
    fechaCorte: '05 jun · 18:00 h',
    fechaPago: '10 jun 2025',
    obligacion: '1 compra',
    capital: 150.00,
    interesCompensatorio: 3.12,
    mora: 0.00,
    totalPagar: 153.12,
    estado: 'Pagado',
    subtituloModal: 'Corte 05 jun 2025, 18:00 h · Pago 10 jun 2025',
    conceptos: [
      {
        fecha: '10 may 2025',
        concepto: 'Productos · CR-001190',
        dias: '30 días',
        capitalBase: 'S/ 150.00',
        interes: 'S/ 3.12',
      },
    ],
    totalExigible: 'S/ 153.12',
    estadoModal: 'Pagado',
    infoBanner: 'Obligación cancelada puntualmente el 10/06/2025.',
    allowRegisterPago: false,
  },
];

interface StoreCortesPageProps {
  cortes: CorteItemData[];
  onViewDetalle: (corte: CorteItemData) => void;
}

export const StoreCortesPage: React.FC<StoreCortesPageProps> = ({
  cortes,
  onViewDetalle,
}) => {
  const [selectedPeriodo, setSelectedPeriodo] = useState('Junio 2025');

  // Métricas acumuladas del corte
  const totalClientes = cortes.length;
  const capitalCorte = cortes.reduce((sum, c) => sum + c.capital, 0);
  const interesCorte = cortes.reduce((sum, c) => sum + c.interesCompensatorio, 0);
  const moraCorte = cortes.reduce((sum, c) => sum + c.mora, 0);
  const totalCorte = cortes.reduce((sum, c) => sum + c.totalPagar, 0);

  const handleDownloadReport = () => {
    alert('La descarga del reporte todavía no está disponible.');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Cortes y cobranzas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Obligaciones generadas para cada cliente en la fecha de corte.
          </p>
        </div>

        {/* Selector Período / corte */}
        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <div className="flex items-center space-x-1 justify-end text-[11px] text-slate-400">
              <span>Período / corte</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#139a6c] cursor-pointer shadow-xs"
            >
              <option value="Junio 2025">Junio 2025</option>
              <option value="Mayo 2025">Mayo 2025</option>
              <option value="Abril 2025">Abril 2025</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Resumen Métrico (5 KPIs en barra horizontal) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Clientes incluidos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalClientes}</p>
        </div>

        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Capital del corte</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            S/ {capitalCorte.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Interés compensatorio</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            S/ {interesCorte.toFixed(2)}
          </p>
        </div>

        <div className="p-2 sm:px-4 text-left">
          <p className="text-[11px] text-slate-400 font-medium">Mora</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            S/ {moraCorte.toFixed(2)}
          </p>
        </div>

        <div className="p-2 sm:px-4 text-left col-span-2 sm:col-span-1">
          <p className="text-[11px] text-slate-400 font-medium">Total del corte</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            S/ {totalCorte.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Contenedor de Tabla: Corte de Junio 2025 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header de la tarjeta */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Corte de {selectedPeriodo}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Compras y obligaciones incluidas hasta la fecha y hora de corte pactada por cliente.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar informe</span>
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-5">CLIENTE</th>
                <th className="py-3 px-4">FECHA DE CORTE</th>
                <th className="py-3 px-4">FECHA DE PAGO</th>
                <th className="py-3 px-4">OBLIGACIÓN</th>
                <th className="py-3 px-4">CAPITAL</th>
                <th className="py-3 px-4">INTERÉS COMPENSATORIO</th>
                <th className="py-3 px-4">MORA</th>
                <th className="py-3 px-4">TOTAL A PAGAR</th>
                <th className="py-3 px-4">ESTADO</th>
                <th className="py-3 px-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cortes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  {/* Cliente */}
                  <td className="py-4 px-5 font-bold text-slate-900">
                    {item.cliente}
                  </td>

                  {/* Fecha de corte */}
                  <td className="py-4 px-4 text-slate-600 font-normal">
                    {item.fechaCorte}
                  </td>

                  {/* Fecha de pago */}
                  <td className="py-4 px-4 text-slate-600 font-normal">
                    {item.fechaPago}
                  </td>

                  {/* Obligación */}
                  <td className="py-4 px-4 text-slate-600 font-normal">
                    {item.obligacion}
                  </td>

                  {/* Capital */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.capital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Interés compensatorio */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.interesCompensatorio.toFixed(2)}
                  </td>

                  {/* Mora */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    S/ {item.mora.toFixed(2)}
                  </td>

                  {/* Total a pagar */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    S/ {item.totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4">
                    {item.estado === 'Pendiente' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        • Pendiente
                      </span>
                    )}
                    {item.estado === 'En mora' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        • En mora
                      </span>
                    )}
                    {item.estado === 'Por vencer' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        • Por vencer
                      </span>
                    )}
                    {item.estado === 'Pagado' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        • Pagado
                      </span>
                    )}
                  </td>

                  {/* Icono Ojo (Ver Detalle) */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onViewDetalle(item)}
                      title="Ver detalle del corte"
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
