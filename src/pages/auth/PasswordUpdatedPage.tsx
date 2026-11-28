import React from 'react';
import { Check } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';

interface PasswordUpdatedPageProps {
  onBackToLogin: () => void;
}

export const PasswordUpdatedPage: React.FC<PasswordUpdatedPageProps> = ({
  onBackToLogin,
}) => {
  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-8 sm:p-10 border border-slate-100">
        {/* Check Icon Circular Badge */}
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Contraseña actualizada
        </h1>

        <p className="text-sm text-slate-500 mt-2 font-normal">
          Ya puedes ingresar a tu cuenta con tu nueva contraseña.
        </p>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-8 bg-[#139a6c] hover:bg-[#0f825b] active:bg-[#0c6b4a] text-white text-sm font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-[#139a6c]/25 transition duration-150 flex items-center justify-center cursor-pointer"
        >
          Volver al inicio de sesión
        </button>

        <p className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed font-normal">
          Acceso seguro. Tu rol y permisos se cargan automáticamente al ingresar.
        </p>
      </div>
    </AuthLayout>
  );
};
