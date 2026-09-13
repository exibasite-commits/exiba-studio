import React from 'react';
import { TEMPLATES } from '../../data/templates';
import { BioSiteRenderer } from '../preview/BioSiteRenderer';
import { X, ArrowRight, Check, Sparkles, Calendar, MessageCircle, Zap, ShoppingBag, Star } from 'lucide-react';

interface TemplatePreviewModalProps {
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  templateId,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  if (!isOpen || !templateId) return null;

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const { blocks } = template.config;

  const hasSchedule = blocks.some((b) => b.type === 'schedule');
  const hasWhatsApp = blocks.some((b) => b.type === 'whatsapp');
  const hasPix = blocks.some((b) => b.type === 'pix');
  const hasProducts = blocks.some((b) => b.type === 'product');
  const hasReviews = blocks.some((b) => b.type === 'google_review');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {template.previewEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#0F6E56] uppercase tracking-wider">
                  {template.segment}
                </span>
                {template.badge && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F]">
                    {template.badge}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-950 leading-tight">
                {template.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white">
          {/* Left Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-[#8B530F] bg-[#FAEEDA] border border-[#FAC775] px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modelo 100% Personalizável</span>
              </span>
              <h4 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
                Pronto para converter seguidores em clientes pagantes
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {template.benefit}
              </p>
            </div>

            {/* Included highlights */}
            <div className="bg-gray-50/90 rounded-2xl border border-gray-200/80 p-5 space-y-3.5 text-xs sm:text-sm text-gray-700">
              <p className="font-extrabold text-gray-950">O que já está configurado neste modelo:</p>
              
              <div className="grid grid-cols-1 gap-2.5">
                {hasSchedule && (
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bloco de Agendamento Online (Calendly/Cal.com)</span>
                  </div>
                )}
                {hasWhatsApp && (
                  <div className="flex items-center gap-2.5 text-emerald-800 font-medium">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Botão de WhatsApp com mensagem personalizada</span>
                  </div>
                )}
                {hasPix && (
                  <div className="flex items-center gap-2.5 text-amber-800 font-medium">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Chave Pix Copia e Cola instantânea</span>
                  </div>
                )}
                {hasProducts && (
                  <div className="flex items-center gap-2.5 text-purple-800 font-medium">
                    <ShoppingBag className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Catálogo de produtos com fotos e preços</span>
                  </div>
                )}
                {hasReviews && (
                  <div className="flex items-center gap-2.5 text-amber-800 font-medium">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                    <span>Selo de Avaliação Google 5.0 Estrelas</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Check className="w-4 h-4 text-[#0F6E56] shrink-0" />
                  <span>Cores, fontes e banner ajustados profissionalmente</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUseTemplate(template.id);
                }}
                className="w-full py-4 rounded-2xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#0F6E56]/20 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <span>Usar este modelo no Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Physical Natural Titanium Chassis Frame */}
            <div className="relative w-[285px] sm:w-[310px] h-[550px] sm:h-[585px] rounded-[52px] p-[4px] bg-gradient-to-b from-[#f5f5f7] via-[#dcdce0] to-[#a8a8b0] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_12px_24px_-10px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.7)] flex flex-col shrink-0">
              {/* Outer Metallic Bevel Rim with Titanium Sheen */}
              <div className="relative w-full h-full rounded-[48px] p-[4px] sm:p-[5px] bg-gradient-to-br from-[#ebebee] via-[#d6d6dc] to-[#b2b3bc] border border-[#a1a1aa]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.25)] flex flex-col">
                
                {/* Antenna Hairline Bands */}
                <div className="absolute -left-[4px] top-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />
                <div className="absolute -left-[4px] bottom-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />
                <div className="absolute -right-[4px] top-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />
                <div className="absolute -right-[4px] bottom-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />

                {/* Hardware Titanium Buttons */}
                <div className="absolute -left-[7px] top-[95px] w-[3.5px] h-[22px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" />
                <div className="absolute -left-[7px] top-[130px] w-[3.5px] h-[44px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" />
                <div className="absolute -left-[7px] top-[186px] w-[3.5px] h-[44px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" />
                <div className="absolute -right-[7px] top-[145px] w-[3.5px] h-[65px] bg-gradient-to-l from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-r-[3px] border-y border-r border-[#8e8e93]" />

                {/* Black Inner Screen Bezel */}
                <div className="w-full h-full rounded-[42px] bg-black p-[2.5px] sm:p-[3px] shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">
                  
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-22 h-4.5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md">
                    <div className="w-2 h-2 rounded-full bg-gray-900 border border-gray-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Display */}
                  <div className="w-full h-full rounded-[38px] overflow-hidden bg-black relative">
                    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                      <BioSiteRenderer config={template.config} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Ground contact shadow */}
            <div className="w-[80%] h-4 bg-gradient-to-r from-transparent via-gray-900/25 to-transparent blur-md rounded-full mt-2 mx-auto" />
          </div>
        </div>

      </div>
    </div>
  );
};
