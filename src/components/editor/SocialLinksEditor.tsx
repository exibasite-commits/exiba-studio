import React, { useState } from 'react';
import { SocialLink, SocialPlatform, ThemeConfig } from '../../types';
import { InfoTooltip } from '../common/Tooltip';
import {
  WhatsAppBrandIcon,
  FacebookBrandIcon,
  TikTokBrandIcon,
  TelegramBrandIcon,
  PinterestBrandIcon,
  SnapchatBrandIcon,
  ThreadsBrandIcon,
  SpotifyBrandIcon,
  KwaiBrandIcon,
} from '../common/BrandIcons';
import {
  Share2,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Layers,
  Palette,
  ExternalLink,
  Instagram,
  Youtube,
  Send,
  Linkedin,
  Github,
  Twitter,
  Music,
  Mail,
  Globe,
  Sparkles,
  Phone,
  Check,
} from 'lucide-react';
import { getValidPickerHex, normalizeHex } from '../../utils/colorUtils';

interface SocialLinksEditorProps {
  socialLinks: SocialLink[];
  socialPosition: 'top' | 'bottom';
  theme: ThemeConfig;
  showSocials?: boolean;
  onToggleShowSocials?: (enabled: boolean) => void;
  onChangeSocials: (updated: SocialLink[]) => void;
  onChangePosition: (pos: 'top' | 'bottom') => void;
  onChangeThemeField: (field: keyof ThemeConfig, val: any) => void;
}

interface PlatformDefinition {
  id: SocialPlatform;
  label: string;
  defaultPlaceholder: string;
  brandBg: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const AVAILABLE_PLATFORMS: PlatformDefinition[] = [
  { id: 'whatsapp', label: 'WhatsApp', defaultPlaceholder: 'https://wa.me/5511999999999', brandBg: '#25D366', icon: WhatsAppBrandIcon },
  { id: 'instagram', label: 'Instagram', defaultPlaceholder: 'https://instagram.com/seunome', brandBg: '#E1306C', icon: Instagram },
  { id: 'facebook', label: 'Facebook', defaultPlaceholder: 'https://facebook.com/seunome', brandBg: '#1877F2', icon: FacebookBrandIcon },
  { id: 'youtube', label: 'YouTube', defaultPlaceholder: 'https://youtube.com/@seucanal', brandBg: '#FF0000', icon: Youtube },
  { id: 'tiktok', label: 'TikTok', defaultPlaceholder: 'https://tiktok.com/@seunome', brandBg: '#000000', icon: TikTokBrandIcon },
  { id: 'linkedin', label: 'LinkedIn', defaultPlaceholder: 'https://linkedin.com/in/seunome', brandBg: '#0A66C2', icon: Linkedin },
  { id: 'github', label: 'GitHub', defaultPlaceholder: 'https://github.com/seunome', brandBg: '#24292e', icon: Github },
  { id: 'twitter', label: 'X (Twitter)', defaultPlaceholder: 'https://x.com/seunome', brandBg: '#1DA1F2', icon: Twitter },
  { id: 'threads', label: 'Threads', defaultPlaceholder: 'https://threads.net/@seunome', brandBg: '#000000', icon: ThreadsBrandIcon },
  { id: 'spotify', label: 'Spotify', defaultPlaceholder: 'https://open.spotify.com/artist/...', brandBg: '#1DB954', icon: SpotifyBrandIcon },
  { id: 'telegram', label: 'Telegram', defaultPlaceholder: 'https://t.me/seucanal', brandBg: '#229ED9', icon: TelegramBrandIcon },
  { id: 'pinterest', label: 'Pinterest', defaultPlaceholder: 'https://pinterest.com/seunome', brandBg: '#E60023', icon: PinterestBrandIcon },
  { id: 'snapchat', label: 'Snapchat', defaultPlaceholder: 'https://snapchat.com/add/seunome', brandBg: '#FFFC00', icon: SnapchatBrandIcon },
  { id: 'kwai', label: 'Kwai', defaultPlaceholder: 'https://kwai.com/@seunome', brandBg: '#FF6E00', icon: KwaiBrandIcon },
  { id: 'twitch', label: 'Twitch', defaultPlaceholder: 'https://twitch.tv/seucanal', brandBg: '#9146FF', icon: Sparkles },
  { id: 'discord', label: 'Discord', defaultPlaceholder: 'https://discord.gg/seuservidor', brandBg: '#5865F2', icon: Sparkles },
  { id: 'email', label: 'E-mail', defaultPlaceholder: 'mailto:voce@exemplo.com', brandBg: '#EA4335', icon: Mail },
  { id: 'behance', label: 'Behance', defaultPlaceholder: 'https://behance.net/seunome', brandBg: '#1769FF', icon: Globe },
  { id: 'dribbble', label: 'Dribbble', defaultPlaceholder: 'https://dribbble.com/seunome', brandBg: '#EA4C89', icon: Globe },
  { id: 'website', label: 'Site Pessoal', defaultPlaceholder: 'https://meusite.com', brandBg: '#475569', icon: Globe },
  { id: 'phone', label: 'Telefone', defaultPlaceholder: 'tel:+5511999999999', brandBg: '#10B981', icon: Phone },
];

export function SocialLinksEditor({
  socialLinks,
  socialPosition,
  theme,
  showSocials = true,
  onToggleShowSocials,
  onChangeSocials,
  onChangePosition,
  onChangeThemeField,
}: SocialLinksEditorProps) {
  const [selectedPlatformToAdd, setSelectedPlatformToAdd] = useState<SocialPlatform>('instagram');
  const [expandedColorId, setExpandedColorId] = useState<string | null>(null);

  const handleAddSocial = (platformToAdd?: SocialPlatform) => {
    const targetPlatform = platformToAdd || selectedPlatformToAdd;
    if (showSocials === false && onToggleShowSocials) {
      onToggleShowSocials(true);
    }

    const platformInfo = AVAILABLE_PLATFORMS.find((p) => p.id === targetPlatform);
    const newLink: SocialLink = {
      id: 'soc_' + Math.random().toString(36).substring(2, 9),
      platform: targetPlatform,
      url: platformInfo ? platformInfo.defaultPlaceholder : 'https://',
      enabled: true,
    };
    onChangeSocials([...socialLinks, newLink]);
  };

  const handleUpdateLink = (id: string, updates: Partial<SocialLink>) => {
    onChangeSocials(
      socialLinks.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleToggleLink = (id: string) => {
    onChangeSocials(
      socialLinks.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleDeleteLink = (id: string) => {
    const remaining = socialLinks.filter((item) => item.id !== id);
    onChangeSocials(remaining);
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja remover todos os links de redes sociais?')) {
      onChangeSocials([]);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;
    const clone = [...socialLinks];
    const temp = clone[index];
    clone[index] = clone[targetIndex];
    clone[targetIndex] = temp;
    onChangeSocials(clone);
  };

  const iconStyles = [
    {
      id: 'rounded',
      alias: ['rounded', 'pills'],
      label: 'Arredondados',
      sublabel: 'Squircle suave (16px)',
      previewShape: 'rounded-xl',
    },
    {
      id: 'square',
      alias: ['square'],
      label: 'Quadrados',
      sublabel: 'Reto & Minimalista (0px)',
      previewShape: 'rounded-none',
    },
    {
      id: 'circle',
      alias: ['circle', 'round'],
      label: 'Circulares',
      sublabel: 'Círculo Clássico (100%)',
      previewShape: 'rounded-full',
    },
    {
      id: 'minimal',
      alias: ['minimal'],
      label: 'Minimalista',
      sublabel: 'Sem Fundo (Transparente)',
      previewShape: 'rounded-lg bg-transparent border-dashed',
    },
    {
      id: 'glass',
      alias: ['glass'],
      label: 'Vidro (Glass)',
      sublabel: 'Translúcido & Blur',
      previewShape: 'rounded-xl backdrop-blur-sm bg-white/20',
    },
  ];

  const currentIconStyle = theme.socialIconsStyle || 'circle';

  return (
    <div className="grid grid-cols-1 gap-y-6">
      {/* 0. Master Toggle for Social Bar Visibility */}
      {onToggleShowSocials && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>Exibir Barra de Redes Sociais</span>
                  <InfoTooltip
                    title="Visibilidade da Barra Social"
                    text="Ativa ou oculta a barra com os ícones de redes sociais no bio-site."
                  />
                </h3>
                <p className="text-[11px] text-slate-400">
                  {showSocials
                    ? `${socialLinks.filter((s) => s.enabled).length} de ${socialLinks.length} redes ativas na prévia`
                    : 'Barra oculta no momento'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleShowSocials(!showSocials)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showSocials
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              {showSocials ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Exibindo</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Oculta</span>
                </>
              )}
            </button>
          </div>

          {!showSocials && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
              <span className="text-[11px] text-amber-300">
                A barra está oculta. Seus links não aparecerão até você ativá-la.
              </span>
              <button
                type="button"
                onClick={() => onToggleShowSocials(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0"
              >
                Ativar Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. Quick Add Popular Platforms */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Adicionar Rede Social</span>
            <InfoTooltip
              title="Adicionar com 1 Clique"
              text="Clique em qualquer rede para adicioná-la instantaneamente ao seu bio-site."
            />
          </h3>
        </div>

        {/* Quick Platform Chips */}
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_PLATFORMS.slice(0, 8).map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddSocial(p.id)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <div
                  className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: p.brandBg }}
                >
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <span>+ {p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown for All Other Platforms */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800/60">
          <select
            value={selectedPlatformToAdd}
            onChange={(e) => setSelectedPlatformToAdd(e.target.value as SocialPlatform)}
            aria-label="Escolha a plataforma"
            className="w-full sm:flex-1 bg-slate-950 border border-slate-700/80 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {AVAILABLE_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.defaultPlaceholder})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleAddSocial()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* 2. Estilo e Cores dos Ícones */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 min-w-0">
            <Palette className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Cores & Formato dos Botões</span>
            <InfoTooltip
              title="Esquema Visual"
              text="Escolha as cores oficiais de cada marca (WhatsApp verde, Instagram rosa), cor de destaque do tema ou cores sólidas."
            />
          </h3>
        </div>

        {/* Color Palette Presets */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium block">
            Esquema de Cores dos Ícones
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: 'brand' as const,
                label: 'Cores Oficiais',
                desc: 'Instagram, Whats, etc.',
                preview: 'bg-gradient-to-r from-rose-500 via-emerald-500 to-sky-500',
              },
              {
                id: 'accent' as const,
                label: 'Cor de Destaque',
                desc: 'Segue o tema principal',
                preview: 'bg-sky-500',
              },
              {
                id: 'monochrome' as const,
                label: 'Fundo do Card',
                desc: 'Ícones sobre fundo sólido',
                preview: 'bg-slate-800',
              },
              {
                id: 'surface' as const,
                label: 'Translúcido',
                desc: 'Vidro / Superfície suave',
                preview: 'bg-white/20',
              },
            ].map((col) => {
              const isSelected = (theme.socialIconsColor || 'brand') === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onChangeThemeField('socialIconsColor', col.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 shadow-md ring-1 ring-sky-400/40 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-full h-2 rounded-full mb-1.5 ${col.preview}`} />
                  <p className="text-xs font-bold truncate">{col.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{col.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shape Selection Cards */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <label className="text-xs text-slate-300 font-medium block">
            Formato Geométrico
          </label>
          <div className="grid grid-cols-3 gap-2">
            {iconStyles.slice(0, 3).map((st) => {
              const isSelected = st.alias.includes(currentIconStyle);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChangeThemeField('socialIconsStyle', st.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 flex items-center justify-center border text-[10px] ${st.previewShape} ${
                      isSelected
                        ? 'bg-sky-400 text-slate-950 border-sky-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Share2 className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Position on Page */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <label className="text-xs text-slate-300 font-medium block">
            Posição da Barra
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangePosition('top')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                socialPosition === 'top'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500 font-bold shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Topo (Abaixo da Bio)
            </button>
            <button
              type="button"
              onClick={() => onChangePosition('bottom')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                socialPosition === 'bottom'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500 font-bold shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Rodapé (Final da Página)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Social Links List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Redes Adicionadas ({socialLinks.length})</span>
          </h3>

          {socialLinks.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Limpar todas
            </button>
          )}
        </div>

        {/* List of items */}
        <div className="space-y-3">
          {socialLinks.map((link, index) => {
            const platformInfo = AVAILABLE_PLATFORMS.find((p) => p.id === link.platform);
            const Icon = platformInfo?.icon || Globe;
            const isCustomizingColor = expandedColorId === link.id;

            return (
              <div
                key={link.id}
                className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
                  link.enabled
                    ? 'bg-slate-950 border-slate-800 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                }`}
              >
                {/* Header Row: Platform info + Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Platform Icon Badge */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow"
                      style={{ backgroundColor: link.customColor || platformInfo?.brandBg || '#3b82f6' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 capitalize truncate">
                          {platformInfo?.label || link.platform}
                        </span>
                        {!link.enabled && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Oculto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleToggleLink(link.id)}
                      title={link.enabled ? 'Ocultar da página' : 'Exibir na página'}
                      className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                        link.enabled
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {link.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      title="Mover para cima"
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 transition-colors"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === socialLinks.length - 1}
                      title="Mover para baixo"
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 transition-colors"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Customize Color */}
                    <button
                      type="button"
                      onClick={() => setExpandedColorId(isCustomizingColor ? null : link.id)}
                      title="Personalizar cor deste ícone"
                      className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                        link.customColor
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Link Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteLink(link.id);
                      }}
                      title="Excluir este link permanentemente"
                      className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Second Row: Full Width URL Input with Test Link */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                    placeholder={platformInfo?.defaultPlaceholder || 'https://...'}
                    className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-3 pr-24 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-1.5 px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-[10px] font-semibold text-sky-300 flex items-center gap-1 transition-all whitespace-nowrap"
                  >
                    <span>Testar</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Optional Individual Color Editor */}
                {isCustomizingColor && (
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 mt-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-sky-400" />
                        Cor Personalizada para {platformInfo?.label}
                      </span>
                      {link.customColor && (
                        <button
                          type="button"
                          onClick={() => handleUpdateLink(link.id, { customColor: undefined, customTextColor: undefined })}
                          className="text-[10px] text-sky-400 hover:underline"
                        >
                          Restaurar Padrão
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Cor do Fundo</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={getValidPickerHex(link.customColor || platformInfo?.brandBg, '#000000')}
                            onChange={(e) => handleUpdateLink(link.id, { customColor: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                          />
                          <input
                            type="text"
                            value={link.customColor || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateLink(link.id, { customColor: val ? normalizeHex(val) : undefined });
                            }}
                            placeholder="Padrão"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Cor do Ícone</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={getValidPickerHex(link.customTextColor, '#ffffff')}
                            onChange={(e) => handleUpdateLink(link.id, { customTextColor: e.target.value })}
                            className="w-7 h-7 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                          />
                          <input
                            type="text"
                            value={link.customTextColor || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateLink(link.id, { customTextColor: val ? normalizeHex(val) : undefined });
                            }}
                            placeholder="#ffffff"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {socialLinks.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-2xl p-4">
              <Share2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-400">
                Nenhuma rede social adicionada no momento.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Clique nos botões acima para adicionar Instagram, WhatsApp, etc.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
