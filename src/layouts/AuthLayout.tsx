import React, { useState } from 'react';
import { ReceiptText } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [anio] = useState(() => new Date().getFullYear());
  return (
    <div className="jades-auth min-h-screen flex flex-col md:flex-row w-full bg-jades-canvas">
      {/* Panel Izquierdo Branding */}
      <div className="jades-auth-brand relative w-full md:w-5/12 bg-jades-navy text-white p-8 md:p-16 flex flex-col justify-center min-h-[300px] md:min-h-screen">
        <div>
          {/* Logo Badge */}
          <div className="w-[60px] h-[60px] rounded-[14px] bg-jades-primary flex items-center justify-center shadow-lg shadow-black/20">
            <ReceiptText className="w-8 h-8 text-white stroke-[2.2]" />
          </div>

          {/* Nombre de la marca */}
          <p className="text-[40px] font-bold tracking-tight text-white mt-6">
            JADES
          </p>

          {/* Slogan principal */}
          <div className="mt-6 space-y-1">
            <p className="text-3xl lg:text-[32px] font-bold leading-tight text-white">
              Créditos simples.
            </p>
            <p className="text-3xl lg:text-[32px] font-bold leading-tight text-white">
              Cuentas claras.
            </p>
          </div>

          {/* Bajada */}
          <p className="mt-6 text-sm lg:text-base text-jades-on-navy leading-relaxed font-normal max-w-sm">
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
