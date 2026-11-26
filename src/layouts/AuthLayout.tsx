import React from 'react';
import { ReceiptText } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-[#f8fafc]">
      {/* Panel Izquierdo Branding */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#0e3b2e] text-white p-8 md:p-16 flex flex-col justify-between min-h-[300px] md:min-h-screen">
        <div>
          {/* Logo Badge */}
          <div className="w-12 h-12 rounded-xl bg-[#139a6c] flex items-center justify-center shadow-lg shadow-black/20">
            <ReceiptText className="w-6 h-6 text-white stroke-[2.2]" />
          </div>

          {/* Nombre de la marca */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-6">
            JADES
          </h1>

          {/* Slogan principal */}
          <div className="mt-14 space-y-1">
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white">
              Créditos simples.
            </h2>
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white">
              Cuentas claras.
            </h2>
          </div>

          {/* Bajada */}
          <p className="mt-6 text-sm lg:text-base text-emerald-100/75 leading-relaxed font-normal max-w-sm">
            Una plataforma para el negocio y sus clientes.
          </p>
        </div>

        {/* Footer discreto en panel izquierdo */}
        <div className="hidden md:block pt-8 text-xs text-emerald-200/40">
          © {new Date().getFullYear()} JADES — UPC Finanzas e Ingeniería Económica
        </div>
      </div>

      {/* Panel Derecho Contenido / Formulario */}
      <div className="w-full md:w-7/12 lg:w-8/12 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
