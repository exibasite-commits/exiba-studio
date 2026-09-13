import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Preciso saber programar ou ter computador para usar o Exiba?',
      a: 'Não! Tudo é visual: basta digitar os dados do seu negócio, escolher suas fotos e publicar em minutos.',
    },
    {
      q: 'Como funciona a chave Pix integrada no meu mini-site?',
      a: 'Quando seu cliente clica no botão do Pix, a sua chave (seja ela CNPJ, Telefone, E-mail ou Aleatória) é copiada instantaneamente para a área de transferência do celular dele, evitando erros de digitação no aplicativo do banco.',
    },
    {
      q: 'Onde posso divulgar o meu link do Exiba?',
      a: 'Você ganha um link exclusivo (ex: exiba.site/seunegocio) para colocar na bio do seu Instagram, no status do WhatsApp, no TikTok, no seu cartão de visitas impresso ou no QR Code do seu balcão.',
    },
    {
      q: 'Como funciona o botão de agendamento de horários?',
      a: 'Você pode direcionar o cliente com uma mensagem personalizada diretamente para o seu WhatsApp ou integrar com ferramentas como Calendly e Google Agenda para marcação automática.',
    },
    {
      q: 'Posso alterar fotos, preços e produtos depois de pronto?',
      a: 'Sim, quantas vezes quiser! Qualquer alteração salva no seu painel entra no ar imediatamente no seu link, sem precisar gerar um novo link ou avisar os clientes.',
    },
  ];

  return (
    <section id="duvidas" className="scroll-mt-20 py-10 bg-gray-50/70 border-b border-gray-100 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#0F6E56]" />
            <span>Tire suas Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Perguntas Frequentes
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-gray-950 hover:text-[#0F6E56] transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#0F6E56]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
