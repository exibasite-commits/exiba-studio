import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Sparkles,
  MessageCircle,
  Calendar,
  QrCode,
  Star,
  ExternalLink,
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  Instagram,
  UtensilsCrossed,
  Dumbbell,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: (mode: 'login' | 'register', templateId?: string) => void;
  onSelectTemplatePreview?: (templateId: string) => void;
  onOpenAiModal?: () => void;
}

interface ExampleSite {
  id: string;
  segment: string;
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
  thirdCardType: 'calendar' | 'menu' | 'fitness';
  pixTitle: string;
  pixHolder: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onOpenAiModal }) => {

  const [currentIdx, setCurrentIdx] = useState(0);

  const examples: ExampleSite[] = [
    // 1. Hellen Raniely - Esmalteria & Nail Designer (Exact match with reference)
    {
      id: 'salao-beleza',
      segment: 'Nail Designer & Salão',
      name: 'Hellen Raniely',
      nameFontClass: "font-['Dancing_Script',cursive] text-xl tracking-wide",
      nameColor: 'text-[#e1144b]',
      role: 'Nail Designer',
      bannerUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      cardBgColor: 'bg-[#e1144b]',
      cardShadowColor: 'shadow-[#e1144b]/25',
      accentPillBg: 'bg-[#b90e3c]',
      instagramHandle: '@hellen_nails',
      whatsappName: 'WhatsApp',
      serviceActionTitle: 'Agendar Horário',
      thirdCardType: 'calendar',
      pixTitle: 'Chave Pix',
      pixHolder: 'Titular: Hellen Raniely Vip',
    },

    // 2. Gastronomia & Burgers Artesanais (Cardápio / Pedidos)
    {
      id: 'food-truck',
      segment: 'Gastronomia & Hambúrguer',
      name: 'Brutus Burger',
      nameFontClass: 'font-black tracking-tight text-xl uppercase',
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

    // 3. Clínica Médica & Harmonização
    {
      id: 'clinica-estetica',
      segment: 'Clínica & Estética',
      name: 'Dra. Camila Vasconcelos',
      nameFontClass: 'font-serif italic font-bold text-base tracking-tight',
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

    // 4. Personal Trainer & Consultoria Fitness
    {
      id: 'personal-trainer',
      segment: 'Fitness & Personal Trainer',
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
  ];

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % examples.length);
    }, 4000);
  }, [examples.length]);

  // Auto-switch examples every 4 seconds
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  const handleThumbnailClick = (idx: number) => {
    setCurrentIdx(idx);
    startAutoPlay();
  };

  const currentExample = examples[currentIdx];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full bg-white pt-6 pb-10 sm:pt-8 sm:pb-12 overflow-hidden border-b border-gray-100">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-[#0F6E56]/6 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="hero-title-container lg:col-span-7 space-y-7 text-left">
            
            {/* Small Badge: Amber background (#FAEEDA), text (#BA7517) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-bold tracking-tight shadow-xs">
              <Star className="w-3.5 h-3.5 text-[#BA7517] fill-[#BA7517]" />
              <span>Feito pro pequeno negócio brasileiro</span>
            </div>

            {/* Main Headline with Prominent Primary Highlight */}
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-[1.1]">
              Seu negócio inteiro em <br className="hidden sm:inline" />
              <span className="text-[#0F6E56] underline decoration-[#0F6E56]/30 underline-offset-8">
                um único link.
              </span>
            </h1>

            {/* Support paragraph */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
              Crie um mini-site profissional com WhatsApp, catálogo de produtos,
              agendamento de horários e chave Pix. Compartilhe um único link na bio
              das suas redes e comece a vender em minutos.
            </p>

            {/* Three CTAs: primary solid + AI Generator + secondary outline */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenAuth('register', currentExample.id)}
                className="px-7 py-3.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-base shadow-lg shadow-[#0F6E56]/25 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <span>Criar meu Exiba grátis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenAiModal && (
                <button
                  type="button"
                  onClick={onOpenAiModal}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer border border-emerald-400/30"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  <span>Criar com IA</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('exemplos')}
                className="px-7 py-3.5 rounded-xl border border-gray-300 text-gray-700 hover:border-[#0F6E56] hover:text-[#0F6E56] font-bold text-base transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Ver Exemplos</span>
              </button>
            </div>


          </div>

          {/* Right Smartphone Column */}
          <div className="hero-section-mockup lg:col-span-5 hidden lg:flex flex-col items-center select-none">

            {/* Natural Titanium iPhone Mockup Container */}
            <div className="relative flex flex-col items-center">

              {/* Floating Feature Badges */}
              <div className="absolute top-[120px] left-0 z-30 -translate-x-full hidden xl:flex items-center gap-2 pr-1">
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white border border-gray-200/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
                  <QrCode className="w-3.5 h-3.5 text-[#0F6E56]" />
                  <span>Pix integrado</span>
                </div>
                <div className="w-6 h-px bg-gray-300" />
              </div>

              <div className="absolute top-[220px] right-0 z-30 translate-x-full hidden xl:flex items-center gap-2 pl-1">
                <div className="w-6 h-px bg-gray-300" />
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white border border-gray-200/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
                  <MessageCircle className="w-3.5 h-3.5 text-[#0F6E56]" />
                  <span>WhatsApp direto</span>
                </div>
              </div>

              <div className="absolute top-[340px] left-0 z-30 -translate-x-full hidden xl:flex items-center gap-2 pr-1">
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white border border-gray-200/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
                  <Calendar className="w-3.5 h-3.5 text-[#0F6E56]" />
                  <span>Agenda automática</span>
                </div>
                <div className="w-6 h-px bg-gray-300" />
              </div>

              {/* Physical Natural Titanium Chassis Frame */}
              <div className="relative w-[230px] sm:w-[240px] h-[440px] sm:h-[460px] rounded-[38px] p-[4px] bg-gradient-to-b from-[#f5f5f7] via-[#dcdce0] to-[#a8a8b0] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_12px_24px_-10px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.7)] flex flex-col shrink-0">
                
                {/* Outer Metallic Bevel Rim with Titanium Sheen */}
                <div className="relative w-full h-full rounded-[35px] p-[3px] sm:p-[4px] bg-gradient-to-br from-[#ebebee] via-[#d6d6dc] to-[#b2b3bc] border border-[#a1a1aa]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.25)] flex flex-col">
                  
                  {/* Antenna Hairline Bands */}
                  <div className="absolute -left-[4px] top-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />
                  <div className="absolute -left-[4px] bottom-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />
                  <div className="absolute -right-[4px] top-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />
                  <div className="absolute -right-[4px] bottom-[75px] w-[4px] h-[3px] bg-[#71717a]/50" />

                  {/* Hardware Titanium Buttons */}
                  {/* Action Button */}
                  <div className="absolute -left-[7px] top-[95px] w-[3.5px] h-[22px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" title="Action Button" />
                  {/* Volume Up */}
                  <div className="absolute -left-[7px] top-[130px] w-[3.5px] h-[44px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" title="Volume Up" />
                  {/* Volume Down */}
                  <div className="absolute -left-[7px] top-[186px] w-[3.5px] h-[44px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" title="Volume Down" />
                  {/* Power / Lock Button */}
                  <div className="absolute -right-[7px] top-[145px] w-[3.5px] h-[65px] bg-gradient-to-l from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-r-[3px] border-y border-r border-[#8e8e93]" title="Power Button" />

                  {/* Black Inner Screen Bezel */}
                  <div className="w-full h-full rounded-[32px] bg-black p-[2px] sm:p-[2.5px] shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">
                    
                    {/* Smartphone Display Screen Glass */}
                    <div className="w-full h-full rounded-[29px] overflow-hidden bg-white relative flex flex-col shadow-inner select-none">
                      
                      {/* Status Bar: Time, Dynamic Island & System Icons */}
                      <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-2.5 flex items-center justify-between text-white drop-shadow-md pointer-events-none">
                        <span className="text-[11px] font-bold tracking-tight text-white font-mono">06:45</span>
                        
                        {/* Dynamic Island Capsule */}
                        <div className="w-20 h-4 bg-black rounded-full shadow-md flex items-center justify-between px-2">
                          <div className="w-2 h-2 rounded-full bg-[#182030] border border-gray-800" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                        </div>

                        <div className="flex items-center gap-1.5 text-white">
                          <Signal className="w-3 h-3 fill-white" />
                          <Wifi className="w-3 h-3" />
                          <div className="w-5 h-2.5 border border-white rounded-[4px] p-0.5 flex items-center">
                            <div className="w-full h-full bg-white rounded-[2px]" />
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Mini-Site Content Area */}
                      <div className="w-full h-full overflow-y-auto scrollbar-none flex flex-col bg-white">
                        
                        {/* Top Cover Banner */}
                        <div className="relative w-full h-[110px] shrink-0 overflow-hidden bg-gray-900">
                          <img
                            src={currentExample.bannerUrl}
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
                        <div className="relative px-4 pt-0 pb-3 flex flex-col items-center text-center -mt-8 z-20">
                          
                          {/* Circular Overlapping Avatar */}
                          <div className="w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={currentExample.avatarUrl}
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
                          <div className="mt-2">
                            <h3 className={`${currentExample.nameFontClass} ${currentExample.nameColor} leading-tight drop-shadow-xs`}>
                              {currentExample.name}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                              {currentExample.role}
                            </p>
                          </div>
                        </div>

                        {/* Action Cards Container */}
                        <div className="px-3 pb-6 space-y-2.5 flex-1">
                          
                          {/* Card 1: Instagram */}
                          <div
                            className={`w-full min-h-[44px] p-2.5 rounded-[16px] ${currentExample.cardBgColor} text-white shadow-md ${currentExample.cardShadowColor} flex items-center justify-between transition-all duration-300`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                                <Instagram className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-bold text-xs sm:text-[13px] text-white tracking-tight truncate">
                                Instagram
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0 ml-2" />
                          </div>

                          {/* Card 2: WhatsApp with Dual Action Button */}
                          <div
                            className={`w-full p-2.5 rounded-[16px] ${currentExample.cardBgColor} text-white shadow-md ${currentExample.cardShadowColor} space-y-2 transition-all duration-300`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                                <MessageCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-bold text-xs sm:text-[13px] text-white tracking-tight truncate">
                                {currentExample.whatsappName}
                              </span>
                            </div>

                            {/* WhatsApp High-Contrast Inner Green Pill CTA */}
                            <div className="w-full h-9 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#25D366]/30">
                              <MessageCircle className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                              <span>WhatsApp</span>
                            </div>
                          </div>

                          {/* Card 3: Direct Compatible Service Action (Agendar Horário, Ver Cardápio, Agendar Consulta, Ver Planos) */}
                          <div
                            className={`w-full min-h-[44px] p-2.5 rounded-[16px] ${currentExample.cardBgColor} text-white shadow-md ${currentExample.cardShadowColor} flex items-center justify-between transition-all duration-300`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 shadow-xs border border-white/20">
                                {currentExample.thirdCardType === 'menu' ? (
                                  <UtensilsCrossed className="w-4 h-4 text-white" />
                                ) : currentExample.thirdCardType === 'fitness' ? (
                                  <Dumbbell className="w-4 h-4 text-white" />
                                ) : (
                                  <Calendar className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className="font-bold text-xs sm:text-[13px] text-white tracking-tight truncate">
                                {currentExample.serviceActionTitle}
                              </span>
                            </div>

                            <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0 ml-2" />
                          </div>

                          {/* Card 4: Chave Pix */}
                          <div
                            className={`w-full min-h-[44px] p-2.5 rounded-[16px] ${currentExample.cardBgColor} text-white shadow-md ${currentExample.cardShadowColor} flex items-center justify-between transition-all duration-300`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                                <QrCode className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="font-bold text-xs sm:text-[13px] text-white tracking-tight truncate leading-tight">
                                  {currentExample.pixTitle}
                                </p>
                                <p className="text-[10px] text-white/80 truncate leading-tight mt-0.5">
                                  {currentExample.pixHolder}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0 ml-2" />
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* Floating Badge: Inside phone frame bottom-right */}
                    <div className="absolute bottom-4 right-4 z-40 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl border border-gray-200/80 shadow-lg flex items-center gap-1.5 text-[11px] font-bold text-gray-900 pointer-events-none">
                      <div className="w-4 h-4 rounded-full bg-[#FAEEDA] border border-[#FAC775] flex items-center justify-center text-[#8B530F] shrink-0">
                        <QrCode className="w-2.5 h-2.5" />
                      </div>
                      <span className="whitespace-nowrap">Pix integrado</span>
                    </div>

                  </div>

                </div>

              </div>

              {/* Realistic Ground Contact Shadow under the phone */}
              <div className="w-[82%] h-4 bg-gradient-to-r from-transparent via-gray-900/25 to-transparent blur-md rounded-full mt-2 mx-auto" />

            </div>

            {/* Below Phone: Clickable Niche Thumbnails */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {examples.map((ex, idx) => {
                const isActive = idx === currentIdx;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-[#0F6E56] ring-offset-2 scale-110'
                        : 'ring-1 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Ver exemplo ${ex.segment}`}
                    title={ex.segment}
                  >
                    <img
                      src={ex.avatarUrl}
                      alt={ex.segment}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

