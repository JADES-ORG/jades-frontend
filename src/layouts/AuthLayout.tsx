import React, { useState } from 'react';
import { ReceiptText } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [anio] = useState(() => new Date().getFullYear());
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-[#f8fafc]">
      {/* Panel Izquierdo Branding */}
      <div className="relative w-full md:w-5/12 bg-[#102e29] text-white p-8 md:p-16 flex flex-col justify-center min-h-[300px] md:min-h-screen">
        <div>
          {/* Logo Badge */}
          <div className="w-12 h-12 rounded-xl bg-[#139a6c] flex items-center justify-center shadow-lg shadow-black/20">
            <ReceiptText className="w-6 h-6 text-white stroke-[2.2]" />
          </div>

          {/* Nombre de la marca */}
          <p className="text-3xl font-extrabold tracking-tight text-white mt-6">
            JADES
          </p>

          {/* Slogan principal */}
          <div className="mt-6 space-y-1">
            <p className="text-3xl lg:text-4xl font-extrabold leading-tight text-white">
              Créditos simples.
            </p>
            <p className="text-3xl lg:text-4xl font-extrabold leading-tight text-white">
              Cuentas claras.
            </p>
          </div>

          {/* Bajada */}
          <p className="mt-6 text-sm lg:text-base text-emerald-100/75 leading-relaxed font-normal max-w-sm">
            Una plataforma para el negocio y sus clientes.
          </p>
        </div>

        {/* Footer discreto en panel izquierdo */}
        <div className="absolute bottom-8 hidden md:block text-xs text-emerald-200/40">
          © {anio} JADES — UPC Finanzas e Ingeniería Económica
        </div>
      </div>

      {/* Panel Derecho Contenido / Formulario */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <main className="w-full max-w-[520px]">
          {children}
        </main>
      </div>
    </div>
  );
};
