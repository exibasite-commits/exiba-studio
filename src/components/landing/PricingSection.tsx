import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Star } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: 'free' | 'pro') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="precos" className="scroll-mt-20 py-10 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planos Transparentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Planos feitos para o seu negócio crescer
          </h2>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200 mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#0F6E56] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Anual</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#FAEEDA] text-[#8B530F] text-[10px] font-black">
                -25% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          
          {/* Free Plan */}
          <div className="bg-gray-50/70 rounded-3xl border border-gray-200 p-4 flex flex-col justify-between hover:border-gray-300 transition-all">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Plano Inicial
                </span>
                <h3 className="text-xl font-black text-gray-950 mt-1">Grátis</h3>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-950">R$ 0</span>
                <span className="text-xs text-gray-500">/para sempre</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>1 mini-site completo com link exclusivo</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>Botão de WhatsApp e chave Pix integrada</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>Até 6 blocos de links e produtos</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3">
              <button
                type="button"
                onClick={() => onSelectPlan('free')}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-bold text-sm transition-all shadow-xs"
              >
                Começar Grátis
              </button>
            </div>
          </div>

          {/* Pro Plan (Highlighted with Âmbar #BA7517 badge and Verde-petróleo #0F6E56 button) */}
          <div className="bg-white rounded-3xl border-2 border-[#FAC775] p-4 flex flex-col justify-between relative shadow-xl shadow-amber-500/5 scale-100 md:scale-105">
            {/* Top Amber Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-[#BA7517] text-[#BA7517]" />
              <span>Mais Recomendado</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-[#0F6E56] uppercase tracking-wide">
                  Profissional & Ilimitado
                </span>
                <h3 className="text-xl font-black text-gray-950 mt-1">Exiba Pro</h3>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-gray-950">
                  {billingCycle === 'yearly' ? 'R$ 315' : 'R$ 35'}
                </span>
                <span className="text-xs text-gray-500">{billingCycle === 'yearly' ? '/ano' : '/mês'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-[11px] text-emerald-600 font-semibold -mt-2">
                  Equivale a R$ 26,25/mês
                </p>
              )}

              <div className="space-y-2 text-xs sm:text-sm text-gray-800">
                <div className="flex items-center gap-2.5 font-bold text-gray-950">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>Sem marca d'água do Exiba</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>Blocos ilimitados (Fotos, Cardápio, Pix, Galeria)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>Conexão de domínio próprio (.com.br)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3">
              <button
                type="button"
                onClick={() => onSelectPlan('pro')}
                className="w-full py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-sm shadow-md shadow-[#0F6E56]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Criar meu Exiba Pro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
