import React from 'react';
import { Heart } from 'lucide-react';
import { ExibaLogo } from '../common/ExibaLogo';

interface LandingFooterProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenAuth }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-gray-600 text-xs border-t border-gray-100 pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-6 border-b border-gray-100">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center">
              <ExibaLogo height={32} size="md" theme="light" />
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              A plataforma definitiva de mini-sites e bio links para micro e pequenos negócios brasileiros venderem mais.
            </p>
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
              <span>Feito com</span>
              <Heart className="w-3.5 h-3.5 text-[#BA7517] fill-[#BA7517]" />
              <span>para o pequeno negócio brasileiro de verdade</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-gray-950 font-bold text-xs uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('como-funciona')}
                  className="hover:text-[#0F6E56] transition-colors"
                >
                  Como Funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('exemplos')}
                  className="hover:text-[#0F6E56] transition-colors"
                >
                  Exemplos Reais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('precos')}
                  className="hover:text-[#0F6E56] transition-colors"
                >
                  Planos e Preços
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('duvidas')}
                  className="hover:text-[#0F6E56] transition-colors"
                >
                  Dúvidas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Segmentos */}
          <div className="space-y-3">
            <h4 className="text-gray-950 font-bold text-xs uppercase tracking-wider">
              Segmentos
            </h4>
            <ul className="space-y-2.5 text-gray-500">
              <li>Salões de Beleza & Esmalterias</li>
              <li>Clínicas & Profissionais de Saúde</li>
              <li>Food Trucks & Gastronomia</li>
              <li>Personal Trainers & Autônomos</li>
              <li>Prestadores de Serviços & Reformas</li>
              <li>Lojas & Catálogos Online</li>
            </ul>
          </div>

          {/* Minha Conta */}
          <div className="space-y-3">
            <h4 className="text-gray-950 font-bold text-xs uppercase tracking-wider">
              Acesso
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="hover:text-[#0F6E56] transition-colors"
                >
                  Fazer Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="hover:text-[#0F6E56] font-bold text-[#0F6E56] transition-colors"
                >
                  Criar Conta Gratuita
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} Exiba Tecnologia Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-700 cursor-pointer">Termos de Uso</span>
            <span className="hover:text-gray-700 cursor-pointer">Privacidade & LGPD</span>
            <span className="hover:text-gray-700 cursor-pointer">Suporte no WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
