import React, { useState } from 'react';
import { TEMPLATES, TemplateDefinition } from '../../data/templates';
import {
  Sparkles,
  Eye,
  ArrowRight,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
  Dumbbell,
  Briefcase,
  ShoppingBag,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Zap,
  Flame,
  Star,
  Smartphone,
  HeartPulse,
  Crown,
  Wifi,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface TemplatesSectionProps {
  onSelectPreview: (templateId: string) => void;
  onUseTemplate: (templateId: string) => void;
  isLoading?: boolean;
}

// Representative icons and styling per template
const getTemplateMeta = (templateId: string) => {
  switch (templateId) {
    case 'salao-beleza':
      return {
        icon: Scissors,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        accentColor: '#e11d48',
      };
    case 'clinica-estetica':
      return {
        icon: Stethoscope,
        iconBg: 'bg-emerald-50 text-[#0F6E56] border-emerald-100',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        accentColor: '#0F6E56',
      };
    case 'food-truck':
      return {
        icon: UtensilsCrossed,
        iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        accentColor: '#d97706',
      };
    case 'personal-autonomo':
      return {
        icon: Dumbbell,
        iconBg: 'bg-sky-50 text-sky-700 border-sky-100',
        badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
        accentColor: '#0284c7',
      };
    case 'empresa-servicos':
      return {
        icon: Briefcase,
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        accentColor: '#4f46e5',
      };
    case 'loja-catalogo':
      return {
        icon: ShoppingBag,
        iconBg: 'bg-purple-50 text-purple-700 border-purple-100',
        badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
        accentColor: '#9333ea',
      };
    case 'barbearia-vintage':
      return {
        icon: Crown,
        iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
        badgeBg: 'bg-[#FAEEDA] text-[#8B530F] border-[#FAC775]',
        accentColor: '#b45309',
      };
    case 'nutricionista-saude':
      return {
        icon: HeartPulse,
        iconBg: 'bg-teal-50 text-teal-700 border-teal-100',
        badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
        accentColor: '#0d9488',
      };
    default:
      return {
        icon: Sparkles,
        iconBg: 'bg-emerald-50 text-[#0F6E56] border-emerald-100',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        accentColor: '#0F6E56',
      };
  }
};

export const TemplateCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-sm animate-pulse">
    <div className="space-y-4">
      {/* Icon & Badge Header */}
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-gray-200" />
        <div className="w-24 h-6 rounded-2xl bg-gray-200" />
      </div>

      {/* Mini Profile Card */}
      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="w-28 h-4 bg-gray-200 rounded-md" />
          <div className="w-20 h-3 bg-gray-200/70 rounded-md" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <div className="w-4/5 h-5 bg-gray-200 rounded-lg" />
        <div className="w-full h-3.5 bg-gray-100 rounded-md" />
        <div className="w-3/4 h-3.5 bg-gray-100 rounded-md" />
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap gap-1.5 pt-2">
        <div className="w-24 h-6 rounded-2xl bg-gray-100" />
        <div className="w-28 h-6 rounded-2xl bg-gray-100" />
        <div className="w-20 h-6 rounded-2xl bg-gray-100" />
      </div>
    </div>

    {/* Buttons */}
    <div className="pt-5 mt-5 border-t border-gray-100 flex items-center gap-3">
      <div className="flex-1 h-11 rounded-2xl bg-gray-100" />
      <div className="flex-1 h-11 rounded-2xl bg-[#0F6E56]/20" />
    </div>
  </div>
);

export const TemplatesSectionSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
    {Array.from({ length: 6 }).map((_, idx) => (
      <TemplateCardSkeleton key={`template-skeleton-${idx}`} />
    ))}
  </div>
);

const CATEGORIES = [
  { id: 'all', label: 'Todos os Modelos', icon: Sparkles },
  { id: 'beleza', label: 'Beleza & Estética', icon: Scissors, match: ['salao-beleza', 'barbearia-vintage'] },
  { id: 'saude', label: 'Saúde & Clínicas', icon: Stethoscope, match: ['clinica-estetica', 'nutricionista-saude'] },
  { id: 'gastronomia', label: 'Gastronomia', icon: UtensilsCrossed, match: ['food-truck'] },
  { id: 'fitness', label: 'Personal & Fitness', icon: Dumbbell, match: ['personal-autonomo'] },
  { id: 'servicos', label: 'Serviços 24h', icon: Briefcase, match: ['empresa-servicos'] },
  { id: 'loja', label: 'Moda & Catálogo', icon: ShoppingBag, match: ['loja-catalogo'] },
];

export const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  onSelectPreview,
  onUseTemplate,
  isLoading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (activeCategory === 'all') return true;
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    if (!cat || !cat.match) return true;
    return cat.match.includes(tpl.id);
  });

  return (
    <section id="modelos" className="py-20 sm:py-24 bg-gradient-to-b from-gray-50/60 via-white to-gray-50/80 border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modelos Prontos de Alta Conversão</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight">
            Escolha o modelo perfeito para o seu negócio
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Mini-sites desenvolvidos e testados para converter visitantes em clientes no WhatsApp, com agendamentos e Pix.
          </p>
        </div>

        {/* Category Tabs Filter */}
        <div className="flex items-center justify-start md:justify-center md:flex-wrap gap-2.5 overflow-x-auto pb-2 mb-10 scrollbar-none no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'all'
                ? TEMPLATES.length
                : TEMPLATES.filter((t) => cat.match?.includes(t.id)).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F6E56] text-white shadow-md shadow-[#0F6E56]/20 scale-102 ring-2 ring-[#0F6E56]/30'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-950 border border-gray-200/80 shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAC775]' : 'text-gray-500'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid with Modern rounded-2xl Cards */}
        {isLoading ? (
          <TemplatesSectionSkeleton />
        ) : (
          <div className="templates-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredTemplates.map((template) => {
              const { profile, blocks, theme } = template.config;
              const meta = getTemplateMeta(template.id);
              const SegmentIcon = meta.icon;
              const avatarUrl = profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
              const bannerUrl = profile.banner?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

              // Extract top blocks for highlights
              const hasSchedule = blocks.some((b) => b.type === 'schedule');
              const hasWhatsApp = blocks.some((b) => b.type === 'whatsapp');
              const hasPix = blocks.some((b) => b.type === 'pix');
              const hasProducts = blocks.some((b) => b.type === 'product');
              const hasReviews = blocks.some((b) => b.type === 'google_review');
              const hasWifi = blocks.some((b) => b.type === 'wifi');

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(15,110,86,0.12)] hover:border-[#0F6E56]/40 transition-all duration-300 hover:-translate-y-1 group relative"
                >
                  {/* Top Visual Card Preview */}
                  <div className="p-5 pb-0 space-y-4">
                    {/* Header: Segment Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${meta.iconBg}`}
                        >
                          <SegmentIcon className="w-5 h-5 shrink-0" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
                            {template.segment}
                          </span>
                          <span className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                            {template.previewEmoji} {template.category}
                          </span>
                        </div>
                      </div>

                      {template.badge ? (
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-2xl border shadow-xs flex items-center gap-1 ${meta.badgeBg}`}
                        >
                          <Flame className="w-3 h-3 text-[#BA7517]" />
                          <span>{template.badge}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-2xl bg-gray-100 text-gray-600 border border-gray-200">
                          {blocks.length} Blocos
                        </span>
                      )}
                    </div>

                    {/* Mini Profile Card with Banner Background */}
                    <div className="rounded-2xl overflow-hidden border border-gray-200/80 bg-gray-950 relative shadow-sm select-none group-hover:border-[#0F6E56]/30 transition-colors">
                      {/* Banner Cover */}
                      <div className="h-20 sm:h-22 w-full relative overflow-hidden">
                        <img
                          src={bannerUrl}
                          alt={profile.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                      </div>

                      {/* Profile Details in Mini Card */}
                      <div className="p-3 pt-0 relative z-10 flex items-center justify-between -mt-6">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={avatarUrl}
                              alt={profile.name}
                              loading="lazy"
                              decoding="async"
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md"
                            />
                            {profile.verified && (
                              <div className="absolute -bottom-1 -right-1 bg-[#0F6E56] rounded-full p-0.5 text-white ring-1 ring-white">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 pr-2">
                            <h4 className="text-white font-bold text-sm leading-tight truncate drop-shadow-sm">
                              {profile.name}
                            </h4>
                            <p className="text-[11px] text-gray-300 truncate font-mono opacity-90">
                              {profile.handle}
                            </p>
                          </div>
                        </div>

                        {/* Quick Indicator Chip */}
                        <span className="text-[10px] font-bold px-2 py-1 rounded-2xl bg-white/90 text-gray-900 shadow-sm shrink-0 flex items-center gap-1 backdrop-blur-xs">
                          <Smartphone className="w-2.5 h-2.5 text-[#0F6E56]" />
                          <span>Ao Vivo</span>
                        </span>
                      </div>
                    </div>

                    {/* Main Titles & Benefit Description */}
                    <div className="space-y-1.5 pt-1">
                      <h3 className="text-lg font-extrabold text-gray-950 group-hover:text-[#0F6E56] transition-colors leading-tight line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {template.benefit}
                      </p>
                    </div>

                    {/* Feature Chips with representative icons */}
                    <div className="pt-2 border-t border-gray-100/90 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                        <span>Recursos configurados:</span>
                        <span className="text-[#0F6E56] font-bold">{blocks.length} blocos inclusos</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {hasSchedule && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center gap-1 shadow-xs">
                            <Calendar className="w-3 h-3 text-[#0F6E56]" />
                            <span>Agendamento</span>
                          </span>
                        )}
                        {hasWhatsApp && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center gap-1 shadow-xs">
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp Direto</span>
                          </span>
                        )}
                        {hasPix && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center gap-1 shadow-xs">
                            <Zap className="w-3 h-3 text-amber-600" />
                            <span>Chave Pix</span>
                          </span>
                        )}
                        {hasProducts && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-2xl bg-purple-50 text-purple-800 border border-purple-200/70 flex items-center gap-1 shadow-xs">
                            <ShoppingBag className="w-3 h-3 text-purple-600" />
                            <span>Catálogo / Fotos</span>
                          </span>
                        )}
                        {hasReviews && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                            <span>Google 5.0</span>
                          </span>
                        )}
                        {hasWifi && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200/70 flex items-center gap-1 shadow-xs">
                            <Wifi className="w-3 h-3 text-sky-600" />
                            <span>QR WiFi</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-5 pt-4 border-t border-gray-100 flex items-center gap-2.5 bg-gray-50/40">
                    <button
                      type="button"
                      onClick={() => onSelectPreview(template.id)}
                      className="flex-1 py-3 px-3 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-gray-200/90 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>Ver Exemplo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUseTemplate(template.id)}
                      className="flex-1 py-3 px-3 rounded-2xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#0F6E56]/20 transition-all active:scale-95 cursor-pointer group/btn"
                    >
                      <span>Usar Modelo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
