import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      'Olá! Gostaria de tirar uma dúvida sobre como criar meu mini-site no Exiba.'
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 select-none">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="bg-white text-gray-800 border border-gray-200 px-3.5 py-2 rounded-2xl shadow-xl text-xs max-w-[220px] relative animate-fade-in flex items-center justify-between gap-2">
          <span className="font-medium">
            Dúvidas? Fale com a equipe do <strong className="text-petroleo">Exiba</strong> no WhatsApp!
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-gray-400 hover:text-gray-900 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button with Verde-Petróleo and pulse effect */}
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="w-14 h-14 rounded-full bg-petroleo hover:bg-petroleo-dark text-white flex items-center justify-center shadow-petroleo btn-effect-pulse hover:scale-110 active:scale-95 transition-all duration-300 group"
        title="Falar com o Exiba no WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </button>
    </div>
  );
};
