import React, { useState } from 'react';
import { TEMPLATES } from '../../data/templates';
import {
  Smartphone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Flame,
  Eye,
  Wifi,
  Signal,
  QrCode,
  Instagram,
  MessageCircle,
  Calendar,
  ExternalLink,
  ChevronRight,
  UtensilsCrossed,
  Dumbbell,
  Wrench,
  ShoppingBag,
  Scissors,
  Apple,
} from 'lucide-react';

interface ExamplesShowcaseSectionProps {
  onUseTemplate: (templateId: string) => void;
  isLoading?: boolean;
}

interface TemplateHeroViewData {
  name: string;
  nameFontClass: string;
  nameColor: string;
  role: string;
  bannerUrl: string;
  avatarUrl: string;
  cardBgColor: string;
  cardShadowColor: string;
  accentPillBg: string;
  instagramHandle: string;
  whatsappName: string;
  serviceActionTitle: string;
  thirdCardType: 'calendar' | 'menu' | 'fitness' | 'tools' | 'store' | 'scissors' | 'nutri';
  pixTitle: string;
  pixHolder: string;
}

const TEMPLATE_MOCKUP_DATA: Record<string, TemplateHeroViewData> = {
  'salao-beleza': {
    name: 'Mayrah Esmalteria',
    nameFontClass: "font-['Dancing_Script',cursive] text-lg tracking-wide",
    nameColor: 'text-[#e1144b]',
    role: 'Nail Designer & Salão VIP',
    bannerUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#e1144b]',
    cardShadowColor: 'shadow-[#e1144b]/25',
    accentPillBg: 'bg-[#b90e3c]',
    instagramHandle: '@mayrah_esmalteria',
    whatsappName: 'WhatsApp',
    serviceActionTitle: 'Agendar Horário',
    thirdCardType: 'calendar',
    pixTitle: 'Chave Pix',
    pixHolder: 'Titular: Mayrah Esmalteria Vip',
  },
  'clinica-estetica': {
    name: 'Dra. Camila Vasconcelos',
    nameFontClass: 'font-serif italic font-bold text-sm tracking-tight',
    nameColor: 'text-[#0F6E56]',
    role: 'Harmonização Facial & Dermatologia',
    bannerUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#0F6E56]',
    cardShadowColor: 'shadow-[#0F6E56]/25',
    accentPillBg: 'bg-[#0B5643]',
    instagramHandle: '@dracamilavasconcelos',
    whatsappName: 'Secretaria & Consultas',
    serviceActionTitle: 'Agendar Consulta',
    thirdCardType: 'calendar',
    pixTitle: 'Chave Pix Consultório',
    pixHolder: 'Titular: Clínica Dra Camila',
  },
  'food-truck': {
    name: 'Brutus Burger',
    nameFontClass: 'font-black tracking-tight text-lg uppercase',
    nameColor: 'text-[#ea580c]',
    role: 'Burgers Artesanais & Chopp',
    bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#ea580c]',
    cardShadowColor: 'shadow-[#ea580c]/25',
    accentPillBg: 'bg-[#c2410c]',
    instagramHandle: '@brutusburger_artesanal',
    whatsappName: 'Fazer Pedido',
    serviceActionTitle: 'Ver Cardápio',
    thirdCardType: 'menu',
    pixTitle: 'Chave Pix (CNPJ)',
    pixHolder: 'Titular: Brutus Burger Ltda',
  },
  'personal-autonomo': {
    name: 'Lucas Silva',
    nameFontClass: 'font-black tracking-tight text-xl uppercase',
    nameColor: 'text-[#2563eb]',
    role: 'Consultoria Fitness & Treinamento',
    bannerUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#2563eb]',
    cardShadowColor: 'shadow-[#2563eb]/25',
    accentPillBg: 'bg-[#1d4ed8]',
    instagramHandle: '@lucassilva_coach',
    whatsappName: 'Consultoria Online',
    serviceActionTitle: 'Ver Planos',
    thirdCardType: 'fitness',
    pixTitle: 'Chave Pix Direta',
    pixHolder: 'Titular: Lucas Silva Fitness',
  },
  'empresa-servicos': {
    name: 'EletroTech',
    nameFontClass: 'font-black tracking-tight text-xl uppercase',
    nameColor: 'text-[#1d4ed8]',
    role: 'Manutenção & Elétrica 24H',
    bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#1d4ed8]',
    cardShadowColor: 'shadow-[#1d4ed8]/25',
    accentPillBg: 'bg-[#1e40af]',
    instagramHandle: '@eletrotech_oficial',
    whatsappName: 'Plantão 24 Horas',
    serviceActionTitle: 'Pedir Orçamento',
    thirdCardType: 'tools',
    pixTitle: 'Chave Pix (CNPJ)',
    pixHolder: 'Titular: EletroTech Serviços Ltda',
  },
  'loja-catalogo': {
    name: 'Donna Flor',
    nameFontClass: 'font-serif italic font-bold text-xl tracking-tight',
    nameColor: 'text-[#db2777]',
    role: 'Moda Feminina & Acessórios',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#db2777]',
    cardShadowColor: 'shadow-[#db2777]/25',
    accentPillBg: 'bg-[#be185d]',
    instagramHandle: '@donnaflor.boutique',
    whatsappName: 'Atendimento & Vendas',
    serviceActionTitle: 'Ver Catálogo',
    thirdCardType: 'store',
    pixTitle: 'Chave Pix (5% OFF)',
    pixHolder: 'Titular: Donna Flor Moda Ltda',
  },
  'barbearia-vintage': {
    name: 'Don Corleone',
    nameFontClass: 'font-serif font-black text-xl tracking-wide uppercase',
    nameColor: 'text-[#b45309]',
    role: 'Barbearia Clássica & Bar',
    bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#b45309]',
    cardShadowColor: 'shadow-[#b45309]/25',
    accentPillBg: 'bg-[#92400e]',
    instagramHandle: '@doncorleone.barber',
    whatsappName: 'Agendamento Direto',
    serviceActionTitle: 'Agendar Horário',
    thirdCardType: 'scissors',
    pixTitle: 'Chave Pix da Barbearia',
    pixHolder: 'Titular: Don Corleone Barber Ltda',
  },
  'nutricionista-saude': {
    name: 'Dra. Beatriz Mendes',
    nameFontClass: 'font-serif italic font-bold text-base tracking-tight',
    nameColor: 'text-[#059669]',
    role: 'Nutrição Clínica & Esportiva',
    bannerUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#059669]',
    cardShadowColor: 'shadow-[#059669]/25',
    accentPillBg: 'bg-[#047857]',
    instagramHandle: '@drabeatriz.nutri',
    whatsappName: 'Secretaria & Avaliação',
    serviceActionTitle: 'Agendar Consulta',
    thirdCardType: 'nutri',
    pixTitle: 'Chave Pix (Sinal)',
    pixHolder: 'Titular: Beatriz Mendes Nutrição',
  },
};

export const ExamplesShowcaseSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
    {/* Left: Templates Selector List Skeleton */}
    <div className="lg:col-span-7 space-y-3.5">
      {/* Category Pills Skeleton */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`cat-skel-${i}`} className="w-20 h-7 rounded-xl bg-gray-200 animate-pulse shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`example-skeleton-item-${idx}`}
            className="p-3 rounded-2xl border border-gray-200 bg-white/80 animate-pulse flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="w-16 h-2.5 bg-emerald-100/70 rounded-md" />
                <div className="w-28 h-3 bg-gray-200 rounded-md" />
                <div className="w-36 max-w-full h-2.5 bg-gray-100 rounded-md" />
              </div>
            </div>
            <div className="w-5 h-5 rounded-full bg-gray-100 shrink-0" />
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 animate-pulse">
        <div className="w-32 h-3 bg-gray-200 rounded-md" />
        <div className="w-48 h-4 bg-gray-300 rounded-md" />
        <div className="w-full h-12 rounded-xl bg-[#0F6E56]/20" />
      </div>
    </div>

    {/* Right: Phone Frame Preview Skeleton */}
    <div className="lg:col-span-5 hidden lg:flex flex-col items-center">
      <div className="w-[200px] sm:w-[210px] h-[350px] sm:h-[370px] rounded-[26px] p-[3.5px] bg-gradient-to-b from-[#f5f5f7] via-[#dcdce0] to-[#a8a8b0] shadow-xl flex flex-col shrink-0">
        <div className="w-full h-full rounded-[24px] p-[3.5px] bg-[#d6d6dc] border border-[#a1a1aa]/60 flex flex-col">
          <div className="w-full h-full rounded-[22px] bg-black p-[2px] overflow-hidden flex flex-col">
            <div className="w-full h-full rounded-[20px] overflow-hidden bg-white relative p-4 flex flex-col items-center justify-start space-y-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 mt-4" />
              <div className="space-y-1.5 text-center w-full flex flex-col items-center">
                <div className="w-28 h-3.5 bg-gray-200 rounded-md" />
                <div className="w-36 h-2.5 bg-gray-100 rounded-md" />
              </div>
              <div className="w-full space-y-2 pt-2 flex-1">
                <div className="w-full h-10 rounded-xl bg-gray-100 border border-gray-200/60" />
                <div className="w-full h-12 rounded-xl bg-gray-100 border border-gray-200/60" />
                <div className="w-full h-10 rounded-xl bg-gray-100 border border-gray-200/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[75%] h-3 bg-gradient-to-r from-transparent via-gray-900/20 to-transparent blur-md rounded-full mt-1.5 mx-auto" />
    </div>
  </div>
);

export const ExamplesShowcaseSection: React.FC<ExamplesShowcaseSectionProps> = ({
  onUseTemplate,
  isLoading = false,
}) => {
  const [activeTemplateId, setActiveTemplateId] = useState<string>(TEMPLATES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos', count: TEMPLATES.length },
    { id: 'beleza', label: 'Beleza & Saúde' },
    { id: 'gastronomia', label: 'Gastronomia' },
    { id: 'servicos', label: 'Serviços & Consultoria' },
    { id: 'moda', label: 'Moda & Comércio' },
  ];

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'beleza') return ['salao-beleza', 'clinica-estetica', 'nutricionista-saude', 'barbearia-vintage'].includes(tmpl.id);
    if (selectedCategory === 'gastronomia') return ['food-truck'].includes(tmpl.id);
    if (selectedCategory === 'servicos') return ['personal-autonomo', 'empresa-servicos'].includes(tmpl.id);
    if (selectedCategory === 'moda') return ['loja-catalogo'].includes(tmpl.id);
    return true;
  });

  const currentTemplate =
    TEMPLATES.find((t) => t.id === activeTemplateId) || TEMPLATES[0];

  const mockData: TemplateHeroViewData = TEMPLATE_MOCKUP_DATA[currentTemplate.id] || {
    name: currentTemplate.config.profile.name,
    nameFontClass: 'font-bold text-xl',
    nameColor: 'text-[#0F6E56]',
    role: currentTemplate.segment,
    bannerUrl: currentTemplate.config.profile.banner?.url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
    avatarUrl: currentTemplate.config.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    cardBgColor: 'bg-[#0F6E56]',
    cardShadowColor: 'shadow-[#0F6E56]/25',
    accentPillBg: 'bg-[#0B5643]',
    instagramHandle: currentTemplate.config.profile.handle || '@exiba',
    whatsappName: 'WhatsApp',
    serviceActionTitle: 'Agendar Horário',
    thirdCardType: 'calendar',
    pixTitle: 'Chave Pix',
    pixHolder: `Titular: ${currentTemplate.config.profile.name}`,
  };

  return (
    <section id="exemplos" className="scroll-mt-20 py-8 sm:py-10 lg:py-12 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulador Interativo em Tempo Real</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Veja como seu cliente vai interagir
          </h2>
        </div>

        {/* Interactive Studio Split Layout or Skeleton Loader */}
        {isLoading ? (
          <ExamplesShowcaseSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left: Templates Selector (Grid 2-Col on Tablet/Desktop, No Vertical Cut) */}
            <div className="lg:col-span-7 space-y-3.5">
              
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0F6E56] text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* 2-Column Responsive Grid of All Templates - Fits cleanly without awkward scrollbars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredTemplates.map((tmpl, index) => {
                  const isSelected = tmpl.id === activeTemplateId;
                  const itemMock = TEMPLATE_MOCKUP_DATA[tmpl.id];
                  const avatarToShow =
                    itemMock?.avatarUrl ||
                    tmpl.config.profile.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setActiveTemplateId(tmpl.id)}
                      className={`${index >= 4 ? 'hidden sm:block ' : ''}p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 relative group ${
                        isSelected
                          ? 'bg-white border-[#0F6E56] shadow-md shadow-[#0F6E56]/12 ring-2 ring-[#0F6E56] scale-[1.01]'
                          : 'bg-white/90 border-gray-200/80 hover:bg-white hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={avatarToShow}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                            }}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-gray-200"
                          />
                          <span className="absolute -bottom-1 -right-1 text-[11px] bg-white rounded-full shadow-xs px-0.5 leading-none">
                            {tmpl.previewEmoji}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#0F6E56] uppercase tracking-wider truncate">
                              {tmpl.segment.split('&')[0]}
                            </span>
                            {tmpl.badge && (
                              <span className="text-[8.5px] font-black uppercase px-1 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                {tmpl.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-950 truncate leading-tight mt-0.5">
                            {tmpl.name.split(' - ')[0]}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {tmpl.benefit}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#0F6E56] text-white flex items-center justify-center shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-700 transition-colors">
                            Ver
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary Action */}
              <button
                type="button"
                onClick={() => onUseTemplate(currentTemplate.id)}
                className="w-full py-3 px-4 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-black text-sm shadow-md shadow-[#0F6E56]/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer group"
              >
                <span>Usar Este Modelo no Editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right: Scaled Phone Frame Preview (Fits viewport without cutting) */}
            <div className="lg:col-span-5 hidden lg:flex flex-col items-center">
              
              {/* Physical Natural Titanium Chassis Frame */}
              <div className="relative w-[200px] sm:w-[210px] h-[350px] sm:h-[370px] rounded-[26px] p-[3.5px] bg-gradient-to-b from-[#f5f5f7] via-[#dcdce0] to-[#a8a8b0] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3),0_8px_20px_-8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.7)] flex flex-col shrink-0 transition-all">
                
                {/* Outer Metallic Bevel Rim with Titanium Sheen */}
                <div className="relative w-full h-full rounded-[24px] p-[3.5px] bg-gradient-to-br from-[#ebebee] via-[#d6d6dc] to-[#b2b3bc] border border-[#a1a1aa]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.25)] flex flex-col">
                  
                  {/* Antenna Hairline Bands */}
                  <div className="absolute -left-[3.5px] top-[65px] w-[3.5px] h-[2.5px] bg-[#71717a]/50" />
                  <div className="absolute -left-[3.5px] bottom-[65px] w-[3.5px] h-[2.5px] bg-[#71717a]/50" />
                  <div className="absolute -right-[3.5px] top-[65px] w-[3.5px] h-[2.5px] bg-[#71717a]/50" />
                  <div className="absolute -right-[3.5px] bottom-[65px] w-[3.5px] h-[2.5px] bg-[#71717a]/50" />

                  {/* Hardware Titanium Buttons */}
                  <div className="absolute -left-[6px] top-[80px] w-[3px] h-[18px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[2px] border-y border-l border-[#8e8e93]" title="Action Button" />
                  <div className="absolute -left-[6px] top-[110px] w-[3px] h-[36px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[2px] border-y border-l border-[#8e8e93]" title="Volume Up" />
                  <div className="absolute -left-[6px] top-[156px] w-[3px] h-[36px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[2px] border-y border-l border-[#8e8e93]" title="Volume Down" />
                  <div className="absolute -right-[6px] top-[125px] w-[3px] h-[54px] bg-gradient-to-l from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-r-[2px] border-y border-r border-[#8e8e93]" title="Power Button" />

                  {/* Black Inner Screen Bezel */}
                  <div className="w-full h-full rounded-[22px] bg-black p-[2px] shadow-[inset_0_0_6px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">
                    {/* Smartphone Display Screen */}
                    <div className="w-full h-full rounded-[20px] overflow-hidden bg-white relative flex flex-col shadow-inner select-none">
                    
                    {/* Status Bar: Time, Dynamic Island & System Icons */}
                    <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-2.5 flex items-center justify-between text-white drop-shadow-md pointer-events-none">
                      <span className="text-[10px] font-bold tracking-tight text-white font-mono">
                        06:45
                      </span>

                      {/* Dynamic Island Capsule */}
                      <div className="w-18 h-4 bg-black rounded-full shadow-md flex items-center justify-between px-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#182030] border border-gray-800" />
                        <div className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
                      </div>

                      <div className="flex items-center gap-1 text-white">
                        <Signal className="w-2.5 h-2.5 fill-white" />
                        <Wifi className="w-2.5 h-2.5" />
                        <div className="w-4 h-2 border border-white rounded-[3px] p-0.5 flex items-center">
                          <div className="w-full h-full bg-white rounded-[1.5px]" />
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Mini-Site Content Area */}
                    <div className="w-full h-full overflow-y-auto scrollbar-none flex flex-col bg-white">
                      
                      {/* Top Cover Banner */}
                      <div className="relative w-full h-[75px] shrink-0 overflow-hidden bg-gray-900">
                        <img
                          src={mockData.bannerUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        {/* Gradient overlay on banner */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
                      </div>

                      {/* Profile Header with Centered Overlapping Avatar */}
                      <div className="relative px-3 pt-0 pb-2.5 flex flex-col items-center text-center -mt-8 z-20">
                        {/* Circular Overlapping Avatar */}
                        <div className="w-10 h-10 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={mockData.avatarUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>

                        {/* Name in Signature Script / Display Style */}
                        <div className="mt-1.5">
                          <h3 className={`${mockData.nameFontClass} ${mockData.nameColor} leading-tight drop-shadow-xs`}>
                            {mockData.name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                            {mockData.role}
                          </p>
                        </div>
                      </div>

                      {/* Action Cards Container */}
                      <div className="px-3 pb-6 space-y-2 flex-1">
                        
                        {/* Card 1: Instagram */}
                        <div
                          className={`w-full min-h-[44px] p-2.5 rounded-[15px] ${mockData.cardBgColor} text-white shadow-sm ${mockData.cardShadowColor} flex items-center justify-between transition-all duration-300`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                              <Instagram className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-xs text-white tracking-tight truncate">
                              Instagram
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-white/80 shrink-0 ml-1.5" />
                        </div>

                        {/* Card 2: WhatsApp with Dual Action Button */}
                        <div
                          className={`w-full p-2.5 rounded-[15px] ${mockData.cardBgColor} text-white shadow-sm ${mockData.cardShadowColor} space-y-1.5 transition-all duration-300`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                              <MessageCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-xs text-white tracking-tight truncate">
                              {mockData.whatsappName}
                            </span>
                          </div>

                          {/* WhatsApp High-Contrast Inner Green Pill CTA */}
                          <div className="w-full h-8 px-2.5 rounded-lg bg-[#25D366] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs">
                            <MessageCircle className="w-3 h-3 fill-white text-white shrink-0" />
                            <span>WhatsApp</span>
                          </div>
                        </div>

                        {/* Card 3: Direct Compatible Service Action */}
                        <div
                          className={`w-full min-h-[44px] p-2.5 rounded-[15px] ${mockData.cardBgColor} text-white shadow-sm ${mockData.cardShadowColor} flex items-center justify-between transition-all duration-300`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 shadow-xs border border-white/20">
                              {mockData.thirdCardType === 'menu' ? (
                                <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
                              ) : mockData.thirdCardType === 'fitness' ? (
                                <Dumbbell className="w-3.5 h-3.5 text-white" />
                              ) : mockData.thirdCardType === 'tools' ? (
                                <Wrench className="w-3.5 h-3.5 text-white" />
                              ) : mockData.thirdCardType === 'store' ? (
                                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                              ) : mockData.thirdCardType === 'scissors' ? (
                                <Scissors className="w-3.5 h-3.5 text-white" />
                              ) : mockData.thirdCardType === 'nutri' ? (
                                <Apple className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <Calendar className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                            <span className="font-bold text-xs text-white tracking-tight truncate">
                              {mockData.serviceActionTitle}
                            </span>
                          </div>

                          <ChevronRight className="w-3 h-3 text-white/80 shrink-0 ml-1.5" />
                        </div>

                        {/* Card 4: Chave Pix */}
                        <div
                          className={`w-full min-h-[44px] p-2.5 rounded-[15px] ${mockData.cardBgColor} text-white shadow-sm ${mockData.cardShadowColor} flex items-center justify-between transition-all duration-300`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                              <QrCode className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="font-bold text-xs text-white tracking-tight truncate leading-tight">
                                {mockData.pixTitle}
                              </p>
                              <p className="text-[9.5px] text-white/80 truncate leading-tight mt-0.5">
                                {mockData.pixHolder}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-white/80 shrink-0 ml-1.5" />
                        </div>
                      </div>
                    </div>

                    {/* Floating Badge: Inside phone frame bottom-right */}
                    <div className="absolute bottom-3 right-3 z-40 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-gray-200/80 shadow-md flex items-center gap-1 text-[10px] font-bold text-gray-900 pointer-events-none">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#FAEEDA] border border-[#FAC775] flex items-center justify-center text-[#8B530F] shrink-0">
                        <QrCode className="w-2 h-2" />
                      </div>
                      <span className="whitespace-nowrap">Pix integrado</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Realistic Ground Contact Shadow under the phone */}
            <div className="w-[75%] h-3 bg-gradient-to-r from-transparent via-gray-900/20 to-transparent blur-md rounded-full mt-1.5 mx-auto" />
            
            {/* Scroll Hint */}
            <p className="text-[11px] text-gray-400 font-medium mt-1 text-center">
              💡 Role a tela dentro do celular para ver a prévia completa
            </p>

          </div>
        </div>
      )}
    </div>
  </section>
);
};
