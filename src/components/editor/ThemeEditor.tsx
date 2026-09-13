import React from 'react';
import { ThemeConfig, CardStyle, BorderRadius, BackgroundType, BlockAnimation } from '../../types';
import { THEME_PRESETS, BRAND_PALETTES, BrandPalette } from '../../data/themes';
import { Tooltip, InfoTooltip } from '../common/Tooltip';
import {
  Palette,
  Sparkles,
  Type,
  Layout,
  Brush,
  Check,
  Droplet,
  Crown,
  Layers,
  Wand2,
  Sliders,
  Maximize2,
  Minimize2,
  Square,
  Circle,
  Play,
  Compass,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  HelpCircle,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { getValidPickerHex, normalizeHex } from '../../utils/colorUtils';

interface ThemeEditorProps {
  theme: ThemeConfig;
  onChangeTheme: (updated: ThemeConfig) => void;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', from: '#f97316', to: '#ec4899', dir: 'to-br' as const },
  { name: 'Cyber Midnight', from: '#0b0f19', to: '#1e1b4b', dir: 'to-br' as const },
  { name: 'Aurora Emerald', from: '#064e3b', to: '#0f172a', dir: 'to-br' as const },
  { name: 'Royal Velvet', from: '#311042', to: '#09090b', dir: 'to-br' as const },
  { name: 'Luxury Gold', from: '#451a03', to: '#18181b', dir: 'to-br' as const },
  { name: 'Rose Petal', from: '#ffffff', to: '#ffe4e6', dir: 'to-b' as const },
  { name: 'Ocean Depth', from: '#0369a1', to: '#020617', dir: 'to-b' as const },
  { name: 'Neon Toxic', from: '#052e16', to: '#020617', dir: 'to-br' as const },
];

const FONT_OPTIONS = [
  { id: 'DM Sans', name: 'DM Sans', category: 'Geométrica & Moderna' },
  { id: 'Outfit', name: 'Outfit', category: 'Moderna & Arrojada' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'Elegante & Luxo (Serif)' },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Tech / Neo-Brutalista' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Equilibrada & Clean' },
  { id: 'Inter', name: 'Inter', category: 'Design Suíço & Minimal' },
  { id: 'Montserrat', name: 'Montserrat', category: 'Imponente & Publicitária' },
  { id: 'Cinzel', name: 'Cinzel', category: 'Romana Clássica & Luxo' },
  { id: 'Syne', name: 'Syne', category: 'Artística & Vanguarda' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'Código & Desenvolvedor' },
];

const FONT_PAIRINGS = [
  {
    name: 'Elegância & Luxo',
    heading: 'Playfair Display',
    body: 'Plus Jakarta Sans',
    desc: 'Estética clássica e refinada para marcas de alto padrão',
    tag: 'Clínicas & Joias',
    sample: 'Harmonização & Estética Avançada',
    subsample: 'Tratamentos exclusivos com atendimento personalizado para você',
  },
  {
    name: 'Tech & Inovação',
    heading: 'Outfit',
    body: 'DM Sans',
    desc: 'Visual contemporâneo, dinâmico e de alto impacto',
    tag: 'Startups & Criadores',
    sample: 'Soluções Digitais para o Seu Negócio',
    subsample: 'Aumente suas vendas com estratégias modernas e automatizadas',
  },
  {
    name: 'Design Suíço',
    heading: 'Inter',
    body: 'Inter',
    desc: 'Minimalismo funcional, clareza e precisão geométrica',
    tag: 'Arquitetura & Clean',
    sample: 'Projetos Funcionais & Interiores',
    subsample: 'Linhas puras com foco em eficiência, equilíbrio e elegância',
  },
  {
    name: 'Alta Costura',
    heading: 'Cinzel',
    body: 'Montserrat',
    desc: 'Tipografia serifada imponente com toque editorial',
    tag: 'Moda & Luxo',
    sample: 'COLEÇÃO EXCLUSIVA DE ALTA MODA',
    subsample: 'Peças atemporais desenvolvidas com acabamentos artesanais',
  },
  {
    name: 'Geek & Dev',
    heading: 'Space Grotesk',
    body: 'JetBrains Mono',
    desc: 'Identidade tech para desenvolvedores, produtos digitais e Web3',
    tag: 'Devs & Web3',
    sample: 'Fullstack Dev & Open Source',
    subsample: 'Construindo aplicações modernas de alta performance em nuvem',
  },
  {
    name: 'Vanguarda Criativa',
    heading: 'Syne',
    body: 'Plus Jakarta Sans',
    desc: 'Personalidade marcante para marcas artísticas e autorais',
    tag: 'Artes & Design',
    sample: 'Direção Criativa & Fotografia Autoral',
    subsample: 'Contando histórias visuais autênticas com estética marcante',
  },
];

const BLOCK_ANIMATIONS: { id: BlockAnimation; label: string; desc: string; icon: string }[] = [
  { id: 'slide-up', label: 'Deslizar para Cima', desc: 'Animação fluida e moderna de baixo para cima', icon: '↑' },
  { id: 'fade-in', label: 'Desvanecer (Fade-in)', desc: 'Transição suave e elegante de opacidade', icon: '✦' },
  { id: 'bounce', label: 'Pulo / Elasticidade (Bounce)', desc: 'Entrada dinâmica com efeito elástico e impacto', icon: '⚡' },
  { id: 'zoom-in', label: 'Aproximar (Zoom-in)', desc: 'Efeito de escala que atrai a atenção', icon: '⊕' },
  { id: 'slide-right', label: 'Deslizar Lateral', desc: 'Entrada dinâmica pela lateral', icon: '→' },
  { id: 'none', label: 'Sem Animação', desc: 'Blocos estáticos imediatos sem transição', icon: '—' },
];

const QUICK_BRAND_COLORS = [
  { name: 'Ciano Tech', hex: '#0ea5e9', text: '#030712' },
  { name: 'Azul Real', hex: '#2563eb', text: '#ffffff' },
  { name: 'Esmeralda Eco', hex: '#10b981', text: '#022c22' },
  { name: 'Verde Neon', hex: '#22c55e', text: '#052e16' },
  { name: 'Rosa Vibrante', hex: '#f43f5e', text: '#ffffff' },
  { name: 'Roxo Criativo', hex: '#a855f7', text: '#ffffff' },
  { name: 'Dourado Luxo', hex: '#eab308', text: '#000000' },
  { name: 'Laranja Fogo', hex: '#f97316', text: '#ffffff' },
  { name: 'Âmbar Artesanal', hex: '#d97706', text: '#ffffff' },
  { name: 'Preto Profundo', hex: '#0f172a', text: '#ffffff' },
  { name: 'Branco Puro', hex: '#ffffff', text: '#0f172a' },
];

export function ThemeEditor({ theme, onChangeTheme }: ThemeEditorProps) {
  const updateField = (field: keyof ThemeConfig, value: any) => {
    onChangeTheme({
      ...theme,
      [field]: value,
    });
  };

  const applyPreset = (preset: ThemeConfig) => {
    onChangeTheme({
      ...preset,
    });
  };

  const applyBrandPalette = (palette: BrandPalette) => {
    onChangeTheme({
      ...theme,
      accentColor: palette.primary,
      accentTextColor: palette.primaryText,
      bgColor: palette.background,
      bgGradient: palette.gradient || theme.bgGradient,
      bgType: palette.gradient ? 'gradient' : 'solid',
      cardBg: palette.cardBg,
      cardBorder: palette.cardBorder,
      textColor: palette.textColor,
      textSecondaryColor: palette.textSecondary,
    });
  };

  const handleQuickAccent = (hex: string, textHex: string) => {
    onChangeTheme({
      ...theme,
      accentColor: hex,
      accentTextColor: textHex,
    });
  };

  // Custom gradient generator
  const buildGradientCSS = (
    from = theme.gradientFrom || '#090d16',
    to = theme.gradientTo || '#1e1b4b',
    dir: 'to-b' | 'to-br' | 'to-r' | 'to-tr' | 'radial' = theme.gradientDirection || 'to-br',
    via = theme.gradientVia || ''
  ) => {
    if (dir === 'radial') {
      return via
        ? `radial-gradient(circle at center, ${from} 0%, ${via} 50%, ${to} 100%)`
        : `radial-gradient(circle at center, ${from} 0%, ${to} 100%)`;
    }
    const angleMap = {
      'to-b': '180deg',
      'to-br': '135deg',
      'to-r': '90deg',
      'to-tr': '45deg',
    };
    const angle = angleMap[dir] || '135deg';
    return via
      ? `linear-gradient(${angle}, ${from} 0%, ${via} 50%, ${to} 100%)`
      : `linear-gradient(${angle}, ${from} 0%, ${to} 100%)`;
  };

  const handleGradientChange = (partial: {
    gradientFrom?: string;
    gradientTo?: string;
    gradientVia?: string;
    gradientDirection?: 'to-b' | 'to-br' | 'to-r' | 'to-tr' | 'radial';
  }) => {
    const from = partial.gradientFrom !== undefined ? partial.gradientFrom : (theme.gradientFrom || '#090d16');
    const to = partial.gradientTo !== undefined ? partial.gradientTo : (theme.gradientTo || '#1e1b4b');
    const dir = partial.gradientDirection !== undefined ? partial.gradientDirection : (theme.gradientDirection || 'to-br');
    const via = partial.gradientVia !== undefined ? partial.gradientVia : (theme.gradientVia || '');

    const newGradient = buildGradientCSS(from, to, dir, via);
    onChangeTheme({
      ...theme,
      bgType: 'gradient',
      gradientFrom: from,
      gradientTo: to,
      gradientVia: via,
      gradientDirection: dir,
      bgGradient: newGradient,
    });
  };

  const handleApplyGradientPreset = (preset: typeof GRADIENT_PRESETS[0]) => {
    const newGradient = buildGradientCSS(preset.from, preset.to, preset.dir, '');
    onChangeTheme({
      ...theme,
      bgType: 'gradient',
      gradientFrom: preset.from,
      gradientTo: preset.to,
      gradientVia: '',
      gradientDirection: preset.dir,
      bgGradient: newGradient,
    });
  };

  // Current computed values for sliders
  const currentRadius = theme.borderRadiusValue !== undefined 
    ? theme.borderRadiusValue 
    : theme.borderRadius === 'none' ? 0
    : theme.borderRadius === 'sm' ? 8
    : theme.borderRadius === 'md' ? 16
    : theme.borderRadius === 'lg' ? 24
    : 36;

  const currentPadding = theme.blockPadding !== undefined ? theme.blockPadding : 16;
  const currentGap = theme.blockGap !== undefined ? theme.blockGap : 14;

  const handleRadiusSlider = (val: number) => {
    let radiusCategory: BorderRadius = 'md';
    if (val === 0) radiusCategory = 'none';
    else if (val <= 10) radiusCategory = 'sm';
    else if (val <= 20) radiusCategory = 'md';
    else if (val <= 32) radiusCategory = 'lg';
    else radiusCategory = 'full';

    onChangeTheme({
      ...theme,
      borderRadius: radiusCategory,
      borderRadiusValue: val,
    });
  };

  const handleRadiusPreset = (id: BorderRadius, px: number) => {
    onChangeTheme({
      ...theme,
      borderRadius: id,
      borderRadiusValue: px,
    });
  };

  const getRadiusLabel = (val: number) => {
    if (val === 0) return '0px • Reto / Brutalista';
    if (val <= 8) return `${val}px • Sutil & Minimalista`;
    if (val <= 16) return `${val}px • Moderno Padrão`;
    if (val <= 26) return `${val}px • Arredondado Bento`;
    return `${val}px • Pílula (Full)`;
  };

  const getPaddingLabel = (val: number) => {
    if (val <= 10) return `${val}px • Ultra Minimalista / Fino`;
    if (val <= 14) return `${val}px • Compacto`;
    if (val <= 18) return `${val}px • Equilibrado (Padrão)`;
    if (val <= 22) return `${val}px • Confortável`;
    return `${val}px • Amplo & Editorial`;
  };

  const getGapLabel = (val: number) => {
    if (val <= 8) return `${val}px • Denso / Agrupado`;
    if (val <= 14) return `${val}px • Equilibrado (Padrão)`;
    if (val <= 20) return `${val}px • Arejado`;
    return `${val}px • Espaçoso`;
  };

  return (
    <div className="grid grid-cols-1 gap-y-6">
      {/* 1. Cor Primária da Marca (Global Primary & Accent) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 min-w-0">
              <Droplet className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Cor Primária Global da Marca</span>
            </h3>
            <InfoTooltip
              title="Cor Primária da Marca"
              text="Define a cor dos botões de ação (CTA), ícones de destaque, badges e elementos interativos do seu BioLink."
            />
          </div>
          <span className="text-[10px] text-sky-400 font-mono shrink-0">Destaques, Botões & Ícones</span>
        </div>

        {/* Quick Brand Colors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Selecione uma cor marcante para sua marca:</span>
              <InfoTooltip text="Cores calibradas para garantir alto contraste e acessibilidade visual em telas de smartphones." />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
            {QUICK_BRAND_COLORS.map((c, i) => {
              const isSelected = theme.accentColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <Tooltip key={i} content={`${c.name} (${c.hex})`}>
                  <button
                    type="button"
                    onClick={() => handleQuickAccent(c.hex, c.text)}
                    className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 ${
                      isSelected
                        ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 border-white scale-105'
                        : 'border-white/25 hover:border-white/70'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                  >
                    {isSelected && (
                      <Check
                        className="w-4 h-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                        style={{ color: c.text }}
                      />
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Custom Color Inputs - Separated Stacked Blocks */}
        <div className="space-y-2.5 pt-1">
          {/* Bloco 1: Cor Primária Global / Fundo do Botão */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="color"
                value={getValidPickerHex(theme.accentColor, '#38bdf8')}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-slate-700/80 cursor-pointer bg-transparent shrink-0 p-0.5"
                title="Clique para escolher a cor principal no seletor de cores"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200">Cor Personalizada Hex</span>
                  <InfoTooltip text="Insira ou selecione a cor exata da identidade visual da sua empresa ou perfil." />
                </div>
                <span className="text-[11px] text-slate-400 block truncate">Destaque de botões e links principais</span>
              </div>
            </div>
            <input
              type="text"
              value={theme.accentColor}
              onChange={(e) => {
                const val = e.target.value;
                updateField('accentColor', val ? normalizeHex(val) : '#38bdf8');
              }}
              className="w-24 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 uppercase text-center focus:border-sky-500 focus:outline-none shrink-0"
              placeholder="#38BDF8"
            />
          </div>

          {/* Bloco 2: Cor do Texto no Botão */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="color"
                value={getValidPickerHex(theme.accentTextColor, '#ffffff')}
                onChange={(e) => updateField('accentTextColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-slate-700/80 cursor-pointer bg-transparent shrink-0 p-0.5"
                title="Clique para escolher a cor do texto no seletor de cores"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200">Cor do Texto no Botão</span>
                  <InfoTooltip text="Cor do texto ou ícone que fica sobre os botões primários (use branco para fundos escuros e preto para fundos claros)." />
                </div>
                <span className="text-[11px] text-slate-400 block truncate">Texto e ícones sobre o botão principal</span>
              </div>
            </div>
            <input
              type="text"
              value={theme.accentTextColor || '#ffffff'}
              onChange={(e) => {
                const val = e.target.value;
                updateField('accentTextColor', val ? normalizeHex(val) : '#ffffff');
              }}
              className="w-24 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-mono text-slate-200 uppercase text-center focus:border-sky-500 focus:outline-none shrink-0"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* 2. Paletas de Cores Prontas por Setor de Marca */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-sky-400" />
              Paletas de Marca Recomendadas (1-Clique)
            </h3>
            <InfoTooltip
              title="Paletas por Nicho"
              text="Combinações cromáticas testadas e otimizadas para clínicas, criadores, lojas e negócios, ajustando fundo, botões e tipografia harmoniosamente."
            />
          </div>
          <span className="text-[10px] text-slate-400">Harmonização Completa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BRAND_PALETTES.map((palette) => (
            <Tooltip
              key={palette.id}
              content={`Aplicar paleta ${palette.name} (${palette.category})`}
              className="w-full"
            >
              <button
                type="button"
                onClick={() => applyBrandPalette(palette)}
                className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-sky-500/60 hover:bg-slate-900 transition-all text-left flex items-center justify-between gap-3 group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                    {palette.name}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {palette.category}
                  </span>
                </div>

                {/* Color Swatch Circles */}
                <div className="flex items-center -space-x-1.5 shrink-0">
                  <div
                    className="w-5 h-5 rounded-full border border-slate-900 shadow-sm"
                    style={{ backgroundColor: palette.primary }}
                    title={`Destaque: ${palette.primary}`}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-slate-900 shadow-sm"
                    style={{ backgroundColor: palette.background }}
                    title={`Fundo: ${palette.background}`}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-slate-900 shadow-sm"
                    style={{ backgroundColor: palette.textColor }}
                    title={`Texto: ${palette.textColor}`}
                  />
                </div>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* 2.5 Seletor de Modo Escuro / Claro / Automático */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Modo Escuro / Esquema de Cores</span>
            </h3>
            <InfoTooltip
              title="Modo Escuro & Preferência do Visitante"
              text="Escolha se o seu mini-site deve ser exibido forçadamente em modo escuro, modo claro ou se adaptar automaticamente de acordo com as preferências do celular/computador do visitante."
            />
          </div>
          <span className="text-[10px] text-sky-400 font-mono">Modo de Cor</span>
        </div>

        <p className="text-xs text-slate-400">
          Defina o comportamento do tema para os visitantes da sua página:
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'auto' as const,
              label: 'Automático',
              desc: 'Segue sistema do visitante',
              icon: Laptop,
            },
            {
              id: 'light' as const,
              label: 'Modo Claro',
              desc: 'Fundo claro forçado',
              icon: Sun,
            },
            {
              id: 'dark' as const,
              label: 'Modo Escuro',
              desc: 'Fundo escuro/noturno',
              icon: Moon,
            },
          ].map((mode) => {
            const isSelected = (theme.darkModeOption || 'auto') === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateField('darkModeOption', mode.id)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300 font-semibold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {mode.label}
                </p>
                <span className="text-[10px] text-slate-400 truncate">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Temas Prontos Completos */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Temas Completos Pré-Configurados
            </h3>
            <InfoTooltip
              title="Temas Pré-Configurados"
              text="Presets completos com estética profissional que reconfiguram cores, estilos de cartões, fundos e gradientes de uma vez só."
            />
          </div>
          <span className="text-[10px] text-slate-400">1-Clique</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = theme.name === preset.name;
            return (
              <Tooltip key={preset.id} content={`Carregar tema ${preset.name}`}>
                <button
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-sky-400 ring-2 ring-sky-500/30 shadow-lg'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    background: preset.bgGradient || preset.bgColor,
                  }}
                >
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                    <div
                      className="w-8 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.cardBg, border: `1px solid ${preset.cardBorder}` }}
                    />
                  </div>
                  <p
                    className="text-xs font-bold truncate leading-tight drop-shadow"
                    style={{ color: preset.textColor }}
                  >
                    {preset.name}
                  </p>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* 4. Fundo & Degradê Customizável */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Brush className="w-3.5 h-3.5 text-sky-400" />
              Fundo & Degradê Customizável
            </h3>
            <InfoTooltip
              title="Estilização de Fundo"
              text="Defina a atmosfera visual do seu site: degradê suave, cor sólida minimalista ou imagem fotográfica."
            />
          </div>
          <span className="text-[10px] text-sky-400 font-mono">Gradientes & Cores</span>
        </div>

        {/* Background Type selector */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Tipo de Fundo
            </label>
            <InfoTooltip text="Escolha se deseja um gradiente moderno com transição de cores, cor sólida ou uma imagem de fundo." />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'gradient', label: 'Degradê Personalizado', desc: 'Duas cores com transição suave' },
              { id: 'solid', label: 'Cor Sólida', desc: 'Fundo minimalista de cor única' },
              { id: 'image', label: 'Imagem de Fundo', desc: 'Foto ou wallpaper personalizado' },
            ].map((bt) => (
              <Tooltip key={bt.id} content={bt.desc}>
                <button
                  type="button"
                  onClick={() => updateField('bgType', bt.id as BackgroundType)}
                  className={`w-full py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    theme.bgType === bt.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bt.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* CUSTOM GRADIENT BUILDER */}
        {theme.bgType === 'gradient' && (
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  Editor de Degradê Interativo
                </label>
                <InfoTooltip text="Ajuste as cores inicial e final e a rotação geométrica do degradê." />
              </div>
              <span className="text-[10px] text-slate-400">Tempo Real</span>
            </div>

            {/* Direction Selection */}
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-[11px] text-slate-400 font-medium">
                  Direção do Degradê (Linear ou Radial):
                </label>
                <InfoTooltip text="Escolha o sentido visual do fluxo de cores: vertical, horizontal, diagonal ou partindo do centro (radial)." />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'to-b', label: 'Vertical', icon: ArrowDown, desc: 'Do topo para a base (vertical)' },
                  { id: 'to-br', label: 'Diagonal', icon: ArrowDownRight, desc: 'Do canto sup. esquerdo ao inf. direito' },
                  { id: 'to-r', label: 'Horizontal', icon: ArrowRight, desc: 'Da esquerda para a direita' },
                  { id: 'to-tr', label: 'Ascendente', icon: ArrowUpRight, desc: 'De baixo para o topo diagonal' },
                  { id: 'radial', label: 'Radial', icon: Circle, desc: 'Emanando em círculos a partir do centro' },
                ].map((d) => {
                  const Icon = d.icon;
                  const isSelected = (theme.gradientDirection || 'to-br') === d.id;
                  return (
                    <Tooltip key={d.id} content={d.desc}>
                      <button
                        type="button"
                        onClick={() => handleGradientChange({ gradientDirection: d.id as any })}
                        className={`w-full p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                          isSelected
                            ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-bold shadow-sm'
                            : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-semibold">{d.label}</span>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Gradient Color Pickers (From, To) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={getValidPickerHex(theme.gradientFrom, '#090d16')}
                    onChange={(e) => handleGradientChange({ gradientFrom: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    title="Selecione a cor de início do degradê"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-200 block">Cor Inicial (Início)</span>
                      <InfoTooltip text="Primeira cor do degradê, localizada no ponto de origem." />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{theme.gradientFrom || '#090d16'}</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={getValidPickerHex(theme.gradientTo, '#1e1b4b')}
                    onChange={(e) => handleGradientChange({ gradientTo: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    title="Selecione a cor final do degradê"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-200 block">Cor Final (Fim)</span>
                      <InfoTooltip text="Segunda cor do degradê para onde o tom transiciona suavemente." />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{theme.gradientTo || '#1e1b4b'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Quick Presets */}
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-[11px] text-slate-400 font-medium">
                  Degradês Prontos Populares:
                </label>
                <InfoTooltip text="Presets populares com transições harmônicas e sofisticadas." />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((gp, i) => (
                  <Tooltip key={i} content={`Aplicar degradê ${gp.name} (${gp.from} → ${gp.to})`}>
                    <button
                      type="button"
                      onClick={() => handleApplyGradientPreset(gp)}
                      className="w-full p-2 rounded-xl border border-slate-800 hover:border-sky-400 flex items-center gap-2 transition-all bg-slate-900 text-left group"
                    >
                      <div
                        className="w-6 h-6 rounded-lg shadow shrink-0 border border-white/20"
                        style={{
                          background: `linear-gradient(135deg, ${gp.from} 0%, ${gp.to} 100%)`,
                        }}
                      />
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate">
                        {gp.name}
                      </span>
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Raw CSS Output & Edit */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-[11px] text-slate-400 font-medium">
                  Código CSS do Degradê (Avançado)
                </label>
                <InfoTooltip text="Permite colar qualquer função CSS complexa de gradiente gerada em ferramentas externas (como cssgradient.io)." />
              </div>
              <input
                type="text"
                value={theme.bgGradient}
                onChange={(e) => updateField('bgGradient', e.target.value)}
                placeholder="linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        )}

        {theme.bgType === 'image' && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-xs text-slate-300 font-medium block">
                URL da Imagem de Fundo Completo
              </label>
              <InfoTooltip text="Insira um link HTTPS público direto de imagem (Unsplash, Imgur, Cloudinary, etc.)." />
            </div>
            <input
              type="text"
              value={theme.bgImage || ''}
              onChange={(e) => updateField('bgImage', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-950 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200"
            />
          </div>
        )}

        {/* Individual Color pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-[11px] text-slate-400 font-medium">
                Cor de Fundo Base
              </label>
              <InfoTooltip text="Cor de fundo padrão do site ou fallback para imagens." />
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={getValidPickerHex(theme.bgColor, '#090d16')}
                onChange={(e) => updateField('bgColor', e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                title="Escolha a cor de fundo padrão"
              />
              <span className="text-xs font-mono text-slate-200 uppercase truncate">
                {theme.bgColor}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-[11px] text-slate-400 font-medium">
                Texto Principal
              </label>
              <InfoTooltip text="Cor aplicada aos títulos principais, nome e textos em destaque." />
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={getValidPickerHex(theme.textColor, '#f8fafc')}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                title="Escolha a cor dos títulos e textos principais"
              />
              <span className="text-xs font-mono text-slate-200 uppercase truncate">
                {theme.textColor}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-[11px] text-slate-400 font-medium">
                Texto Secundário
              </label>
              <InfoTooltip text="Cor dos subtítulos, biografia, links secundários e datas." />
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={getValidPickerHex(theme.textSecondaryColor, '#94a3b8')}
                onChange={(e) => updateField('textSecondaryColor', e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                title="Escolha a cor do texto secundário"
              />
              <span className="text-xs font-mono text-slate-200 uppercase truncate">
                {theme.textSecondaryColor}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-[11px] text-slate-400 font-medium">
                Borda dos Cards
              </label>
              <InfoTooltip text="Cor das bordas delimitadoras de todos os cartões e blocos." />
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={getValidPickerHex(theme.cardBorder, '#334155')}
                onChange={(e) => updateField('cardBorder', e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                title="Escolha a cor da borda dos blocos"
              />
              <span className="text-[10px] font-mono text-slate-200 truncate">
                {theme.cardBorder}
              </span>
            </div>
          </div>
        </div>

        {/* Pattern overlay */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <label className="text-[11px] text-slate-400 font-medium">
              Textura / Padrão de Fundo
            </label>
            <InfoTooltip text="Aplica uma máscara sutil com pontilhado ou grade moderna sobre o fundo, conferindo profundidade estética." />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'none', label: 'Sem Textura', desc: 'Fundo liso sem sobreposição' },
              { id: 'dots', label: 'Pontilhado Moderno', desc: 'Matriz sutil de micropontos' },
              { id: 'grid', label: 'Grade Tech', desc: 'Linhas finas em grade geométrica' },
            ].map((p) => (
              <Tooltip key={p.id} content={p.desc}>
                <button
                  type="button"
                  onClick={() => updateField('bgPattern', p.id)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                    (theme.bgPattern || 'none') === p.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* 5. ANIMAÇÕES DE ENTRADA DOS BLOCOS */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 min-w-0">
              <Play className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Animação de Entrada dos Blocos</span>
            </h3>
            <InfoTooltip
              title="Animações de Entrada"
              text="Efeitos visuais suaves acionados em cascata quando o visitante abre sua página de BioLink."
            />
          </div>
          <span className="text-[10px] text-sky-400 font-mono shrink-0">Ao Carregar a Página</span>
        </div>

        <p className="text-xs text-slate-400">
          Escolha como os botões e blocos surgem suavemente na tela para os visitantes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {BLOCK_ANIMATIONS.map((anim) => {
            const isSelected = (theme.blockAnimation || 'slide-up') === anim.id;
            return (
              <Tooltip key={anim.id} content={anim.desc}>
                <button
                  type="button"
                  onClick={() => updateField('blockAnimation', anim.id)}
                  className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all relative ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-sky-400">{anim.icon}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300 font-semibold">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {anim.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{anim.desc}</div>
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* 6. Estilo dos Cards, Arredondamento & Espaçamento */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 min-w-0">
              <Layout className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Design dos Blocos & Espaçamento</span>
            </h3>
            <InfoTooltip
              title="Acabamento & Geometria"
              text="Controle o estilo de renderização dos cartões, arredondamento dos cantos, espaçamento interno (padding) e distância entre blocos (gap)."
            />
          </div>
          <span className="text-[10px] text-sky-400 font-mono shrink-0">Arredondamento & Padding</span>
        </div>

        {/* Card Style */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-xs text-slate-300 font-semibold block">
              Acabamento dos Cards
            </label>
            <InfoTooltip text="Define a textura visual e o efeito de profundidade dos botões (vidro fosco, flat moderno, neo-brutalismo, etc.)." />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { id: 'glass', label: 'Vidro (Glass)', desc: 'Efeito translúcido com desfoque de fundo (Glassmorphism)' },
              { id: 'flat', label: 'Flat Minimalista', desc: 'Fundo sólido e limpo com bordas suaves' },
              { id: 'brutalist', label: 'Neo-Brutalista', desc: 'Bordas marcantes de alto contraste e sombra sólida' },
              { id: 'soft-shadow', label: 'Sombra 3D', desc: 'Sombra suave que dá elevação aos blocos' },
              { id: 'outline', label: 'Apenas Borda', desc: 'Fundo transparente com borda destacada' },
            ].map((cs) => (
              <Tooltip key={cs.id} content={cs.desc}>
                <button
                  type="button"
                  onClick={() => updateField('cardStyle', cs.id as CardStyle)}
                  className={`w-full py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    theme.cardStyle === cs.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cs.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* 1. SLIDER: Arredondamento das Bordas (Border Radius) */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Square className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <label className="text-xs font-bold text-slate-200">
                Arredondamento dos Blocos (Border-Radius)
              </label>
              <InfoTooltip text="Altera o formato geométrico dos cantos dos cartões, variando de cantos retos clássicos (0px) a formato pílula totalmente arredondado (36px)." />
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 shrink-0 self-start sm:self-auto whitespace-nowrap">
              {getRadiusLabel(currentRadius)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono shrink-0">0px</span>
            <input
              type="range"
              min="0"
              max="36"
              step="1"
              value={currentRadius}
              onChange={(e) => handleRadiusSlider(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              title="Ajuste o nível de curvatura dos cantos dos blocos"
            />
            <span className="text-[10px] text-slate-500 font-mono shrink-0">Pílula</span>
          </div>

          {/* Quick presets for border radius */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {[
              { id: 'none' as BorderRadius, px: 0, label: '0px', sub: 'Reto', desc: 'Cantos retos clássicos' },
              { id: 'sm' as BorderRadius, px: 8, label: '8px', sub: 'Suave', desc: 'Curvatura leve e refinada' },
              { id: 'md' as BorderRadius, px: 16, label: '16px', sub: 'Moderno', desc: 'Padrão contemporâneo arredondado' },
              { id: 'lg' as BorderRadius, px: 24, label: '24px', sub: 'Bento', desc: 'Curvatura pronunciada' },
              { id: 'full' as BorderRadius, px: 36, label: 'Pílula', sub: 'Full', desc: 'Bordas totalmente circulares' },
            ].map((r) => (
              <Tooltip key={r.id} content={r.desc}>
                <button
                  type="button"
                  onClick={() => handleRadiusPreset(r.id, r.px)}
                  className={`w-full py-1.5 px-0.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                    currentRadius === r.px
                      ? 'bg-sky-500/25 text-sky-300 border-sky-400 font-bold shadow-sm'
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight">{r.label}</span>
                  <span className="text-[9px] text-slate-400 leading-tight">{r.sub}</span>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* 2. SLIDER: Espaçamento Interno dos Blocos (Padding) */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Espaçamento Interno (Padding)</span>
              </label>
              <InfoTooltip text="Define a altura e a folga interna dentro de cada botão e card." />
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 shrink-0 self-start sm:self-auto whitespace-nowrap">
              {getPaddingLabel(currentPadding)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono shrink-0">8px</span>
            <input
              type="range"
              min="8"
              max="28"
              step="2"
              value={currentPadding}
              onChange={(e) => updateField('blockPadding', Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              title="Ajuste o preenchimento interno dos blocos"
            />
            <span className="text-[10px] text-slate-500 font-mono shrink-0">28px</span>
          </div>

          {/* Quick presets for padding */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {[
              { px: 8, label: '8px Minimal', desc: 'Botões ultra finos e compactos' },
              { px: 12, label: '12px Compacto', desc: 'Ideal para listas com muitos itens' },
              { px: 16, label: '16px Padrão', desc: 'Equilíbrio visual perfeito para mobile' },
              { px: 22, label: '22px Espaçoso', desc: 'Botões grandes com alto destaque para toque' },
            ].map((pd) => (
              <Tooltip key={pd.px} content={pd.desc}>
                <button
                  type="button"
                  onClick={() => updateField('blockPadding', pd.px)}
                  className={`w-full py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center truncate ${
                    currentPadding === pd.px
                      ? 'bg-sky-500/25 text-sky-300 border-sky-400 font-bold shadow-sm'
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pd.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* 3. SLIDER: Distância Entre Blocos (Gap) */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Distância Entre Blocos (Gap)</span>
              </label>
              <InfoTooltip text="Controla a separação vertical entre os diferentes cartões na página de exibição." />
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 shrink-0 self-start sm:self-auto whitespace-nowrap">
              {getGapLabel(currentGap)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono shrink-0">6px</span>
            <input
              type="range"
              min="6"
              max="28"
              step="2"
              value={currentGap}
              onChange={(e) => updateField('blockGap', Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              title="Ajuste o espaço vertical entre os blocos"
            />
            <span className="text-[10px] text-slate-500 font-mono shrink-0">28px</span>
          </div>

          {/* Quick presets for gap */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { px: 8, label: '8px Denso', desc: 'Espaço compacto e denso' },
              { px: 14, label: '14px Médio', desc: 'Espaçamento padrão confortável' },
              { px: 22, label: '22px Arejado', desc: 'Layout espaçoso com bastante respiro' },
            ].map((gp) => (
              <Tooltip key={gp.px} content={gp.desc}>
                <button
                  type="button"
                  onClick={() => updateField('blockGap', gp.px)}
                  className={`w-full py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center truncate ${
                    currentGap === gp.px
                      ? 'bg-sky-500/25 text-sky-300 border-sky-400 font-bold shadow-sm'
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {gp.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* 7. SELETOR COMPLETO DE FONTES & TIPOGRAFIA */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 min-w-0">
              <Type className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Tipografia & Fontes da Marca</span>
            </h3>
            <InfoTooltip
              title="Tipografia Global"
              text="Escolha fontes do Google Fonts para os títulos principais e para o corpo do texto que são aplicadas automaticamente em todo o BioLink."
            />
          </div>
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 transition-colors shrink-0"
            title="Explorar o catálogo oficial do Google Fonts"
          >
            <span>Google Fonts</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        {/* 1-Click Font Pairings - Type Specimen Format */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-300 font-semibold">
                Combinações Tipográficas Harmonizadas (1-Clique)
              </label>
              <InfoTooltip text="Pares de fontes selecionados por designers que combinam perfeitamente títulos marcantes e textos de alta legibilidade." />
            </div>
            <span className="text-[10px] text-sky-400/90 font-mono shrink-0 hidden sm:inline">Pares Recomendados</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {FONT_PAIRINGS.map((fp, i) => {
              const isSelected = theme.fontHeading === fp.heading && theme.fontBody === fp.body;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChangeTheme({
                      ...theme,
                      fontHeading: fp.heading,
                      fontBody: fp.body,
                    });
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-950/40 via-slate-950 to-slate-950 border-sky-400/80 ring-2 ring-sky-400/30 shadow-lg shadow-sky-950/30'
                      : 'bg-slate-950/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Bar: Name, Badges & Selected State */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        style={{ fontFamily: fp.heading }}
                        className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white transition-colors truncate"
                      >
                        {fp.name}
                      </span>
                      {fp.tag && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 shrink-0 hidden xs:inline">
                          {fp.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 whitespace-nowrap">
                        {fp.heading} + {fp.body}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Em Uso</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md text-slate-400 group-hover:text-slate-200 border border-transparent group-hover:border-slate-700 transition-all hidden sm:inline">
                          Aplicar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Specimen Sample Demonstration */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 space-y-1">
                    <p
                      style={{ fontFamily: fp.heading }}
                      className="text-xs sm:text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors truncate"
                    >
                      {fp.sample}
                    </p>
                    <p
                      style={{ fontFamily: fp.body }}
                      className="text-[11px] text-slate-400 leading-relaxed truncate"
                    >
                      {fp.subsample}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Font Selectors */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-2">
          {/* Heading Font */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <label className="text-xs text-slate-200 font-bold block truncate">
                  Fonte dos Títulos
                </label>
                <InfoTooltip text="Fonte aplicada no nome de perfil, cabeçalhos de seções e títulos dos cards." />
              </div>
              <a
                href={`https://fonts.google.com/specimen/${theme.fontHeading.replace(/\s+/g, '+')}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Abrir ${theme.fontHeading} no Google Fonts`}
                className="flex items-center gap-1 text-[11px] text-sky-400 font-mono hover:text-sky-300 hover:underline transition-colors shrink-0"
              >
                <span>Google Fonts</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <select
              value={theme.fontHeading}
              onChange={(e) => updateField('fontHeading', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
              title="Selecione a fonte para títulos e cabeçalhos"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — ({f.category})
                </option>
              ))}
            </select>

            <div
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60 text-center"
              style={{ fontFamily: theme.fontHeading }}
            >
              <span className="text-sm font-bold text-slate-100 block">
                {theme.fontHeading} • Título em Destaque
              </span>
              <span className="text-[11px] text-slate-400">
                1234567890 • ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </span>
            </div>
          </div>

          {/* Body Font */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <label className="text-xs text-slate-200 font-bold block truncate">
                  Fonte do Corpo & Botões
                </label>
                <InfoTooltip text="Fonte aplicada nas biografias, textos explicativos, rótulos de botões e links." />
              </div>
              <a
                href={`https://fonts.google.com/specimen/${theme.fontBody.replace(/\s+/g, '+')}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Abrir ${theme.fontBody} no Google Fonts`}
                className="flex items-center gap-1 text-[11px] text-sky-400 font-mono hover:text-sky-300 hover:underline transition-colors shrink-0"
              >
                <span>Google Fonts</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <select
              value={theme.fontBody}
              onChange={(e) => updateField('fontBody', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
              title="Selecione a fonte para o corpo do texto e botões"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — ({f.category})
                </option>
              ))}
            </select>

            <div
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60 text-center"
              style={{ fontFamily: theme.fontBody }}
            >
              <span className="text-xs font-medium text-slate-200 block">
                {theme.fontBody} • Texto fluido e legível para botões e descrições
              </span>
              <span className="text-[10px] text-slate-400">
                1234567890 • abcdefghijklmnopqrstuvwxyz
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
