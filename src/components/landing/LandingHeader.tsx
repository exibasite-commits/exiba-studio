import React, { useState } from 'react';
import { Menu, X, ArrowRight, User, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { ExibaLogo } from '../common/ExibaLogo';

interface LandingHeaderProps {
  onOpenAuth: (mode: 'login' | 'register', templateId?: string) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToEditor?: () => void;
  onOpenAiModal?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onOpenAuth,
  onNavigateToDashboard,
  onNavigateToEditor,
  onOpenAiModal,
}) => {

  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          className="flex items-center cursor-pointer select-none transition-transform active:scale-98"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ExibaLogo height={36} size="md" theme="light" />
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <button
            type="button"
            onClick={() => scrollToSection('como-funciona')}
            className="hover:text-[#0F6E56] transition-colors"
          >
            Como funciona
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('exemplos')}
            className="hover:text-[#0F6E56] transition-colors"
          >
            Exemplos
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('precos')}
            className="hover:text-[#0F6E56] transition-colors"
          >
            Preço
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('duvidas')}
            className="hover:text-[#0F6E56] transition-colors"
          >
            Dúvidas
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#0F6E56]" />
                <span>Meus Sites</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToEditor}
                className="px-5 py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-sm shadow-sm transition-all active:scale-95"
              >
                Abrir Studio
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {onOpenAiModal && (
                <button
                  type="button"
                  onClick={onOpenAiModal}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl border border-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Criar com IA</span>
                </button>
              )}
              {onNavigateToEditor && (
                <button
                  type="button"
                  onClick={onNavigateToEditor}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  Testar Editor
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-5 py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-sm shadow-sm shadow-[#0F6E56]/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Criar meu Exiba</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="px-3.5 py-2 rounded-xl bg-[#0F6E56] text-white font-bold text-xs shadow-sm"
          >
            Criar Exiba
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-100 text-gray-700"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 text-base font-semibold text-gray-700">
            <button
              type="button"
              onClick={() => scrollToSection('como-funciona')}
              className="text-left py-1 hover:text-[#0F6E56]"
            >
              Como funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('exemplos')}
              className="text-left py-1 hover:text-[#0F6E56]"
            >
              Exemplos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('precos')}
              className="text-left py-1 hover:text-[#0F6E56]"
            >
              Preço
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('duvidas')}
              className="text-left py-1 hover:text-[#0F6E56]"
            >
              Dúvidas
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToDashboard?.();
                  }}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-bold text-sm text-center"
                >
                  Meus Sites
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToEditor?.();
                  }}
                  className="w-full py-3 rounded-xl bg-[#0F6E56] text-white font-bold text-sm text-center"
                >
                  Abrir Studio
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-900 font-bold text-sm text-center"
                >
                  Entrar
                </button>
                {onOpenAiModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAiModal();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Criar com IA em 5 segundos</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-3 rounded-xl bg-[#0F6E56] text-white font-bold text-sm text-center"
                >
                  Criar meu Exiba grátis

                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
