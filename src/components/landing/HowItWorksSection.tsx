import React from 'react';
import { Palette, Smartphone, Share2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Escolha um modelo',
      desc: 'Escolha um modelo pronto para o seu segmento.',
      icon: Palette,
      color: 'bg-[#FAEEDA] text-[#8B530F] border-[#FAC775]',
    },
    {
      number: '02',
      title: 'Personalize em tempo real',
      desc: 'Personalize fotos, produtos, Pix e WhatsApp.',
      icon: Smartphone,
      color: 'bg-emerald-50 text-[#0F6E56] border-emerald-200',
    },
    {
      number: '03',
      title: 'Compartilhe e venda',
      desc: 'Compartilhe seu link e comece a vender.',
      icon: Share2,
      color: 'bg-amber-50 text-[#BA7517] border-amber-200',
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-20 py-8 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider">
            <span>Passo a Passo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Como funciona o Exiba?
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Coloque seu mini-site no ar em menos de 5 minutos.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-[#0F6E56]/40 transition-all flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${step.color} shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-gray-200 group-hover:text-[#0F6E56] transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-950 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
