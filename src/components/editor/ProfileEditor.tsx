import React, { useRef, useState } from 'react';
import { ProfileConfig, HeaderBannerConfig, BusinessInfo } from '../../types';
import { RichNameEditor } from './RichNameEditor';
import { uploadMediaFile, uploadMultipleMedia } from '../../api/upload';
import { enhanceCopy } from '../../api/ai';
import {
  Loader2,
  User,
  AtSign,
  MapPin,
  CheckCircle2,
  Tag,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Video,
  Play,
  Film,
  Building2,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  X,
  Palette,
  Layers,
  Sliders,
  Check,
  Store,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Share2,
  Search,
  Globe,
  FileText,
  ExternalLink,
  Copy,
  CheckCheck,
  Type,
  CornerDownLeft,
} from 'lucide-react';
import { getValidPickerHex, normalizeHex } from '../../utils/colorUtils';

interface ProfileEditorProps {
  profile: ProfileConfig;
  onChange: (updated: ProfileConfig) => void;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

const PRESET_VIDEO_BANNERS = [
  {
    name: 'Cyber Waves / Neon Lights',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-40748-large.mp4',
    category: 'Tech & Moderno',
  },
  {
    name: 'Linhas Tecnológicas Roxas',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-and-purple-lines-41551-large.mp4',
    category: 'Tecnologia',
  },
  {
    name: 'Fumaça Atmosférica Dark',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-smoke-moving-in-a-dark-room-42352-large.mp4',
    category: 'Música & Estilo',
  },
  {
    name: 'Café & Vapor Quente',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hot-coffee-being-poured-into-a-cup-41549-large.mp4',
    category: 'Gastronomia',
  },
  {
    name: 'Partículas Douradas (Luxo)',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-golden-particles-floating-in-space-41539-large.mp4',
    category: 'Luxo & Eventos',
  },
  {
    name: 'Ondas do Mar & Praia',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-the-beach-41540-large.mp4',
    category: 'Natureza & Lifestyle',
  },
];

const PRESET_IMAGE_BANNERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
];

const SUGGESTED_BUSINESS_HIGHLIGHTS = [
  '⚡ Atendimento 24/7',
  '🚀 Frete Grátis Brasil',
  '🔒 100% Seguro',
  '⭐ Mais de 5.000 Clientes',
  '🛡️ Garantia de 30 Dias',
  '✅ CNPJ Verificado',
  '💳 Parcelamento sem Juros',
  '🏆 Empresa Premiada',
  '📍 Loja Física Própria',
];

export function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const avatarFileRef = useRef<HTMLInputElement | null>(null);
  const bannerFileRef = useRef<HTMLInputElement | null>(null);
  const bannerMultiFileRef = useRef<HTMLInputElement | null>(null);
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newSlideshowUrl, setNewSlideshowUrl] = useState('');
  const [activeSection, setActiveSection] = useState<'avatar' | 'banner' | 'bio' | 'seo' | 'visibility'>('avatar');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isEnhancingBio, setIsEnhancingBio] = useState(false);
  const [bioSuggestions, setBioSuggestions] = useState<string[]>([]);
  const [isEnhancingTagline, setIsEnhancingTagline] = useState(false);
  const [taglineSuggestions, setTaglineSuggestions] = useState<string[]>([]);

  const handleEnhanceBio = async () => {
    setIsEnhancingBio(true);
    setBioSuggestions([]);
    try {
      const suggestions = await enhanceCopy({
        type: 'bio',
        currentText: profile.bio,
        businessName: profile.name,
      });
      setBioSuggestions(suggestions);
    } catch {
      // ignore
    } finally {
      setIsEnhancingBio(false);
    }
  };

  const handleEnhanceTagline = async () => {
    setIsEnhancingTagline(true);
    setTaglineSuggestions([]);
    try {
      const suggestions = await enhanceCopy({
        type: 'tagline',
        currentText: profile.businessInfo?.tagline,
        businessName: profile.name,
      });
      setTaglineSuggestions(suggestions);
    } catch {
      // ignore
    } finally {
      setIsEnhancingTagline(false);
    }
  };

  const handleFieldChange = (field: keyof ProfileConfig, value: any) => {

    onChange({
      ...profile,
      [field]: value,
    });
  };

  const handleBannerChange = (field: keyof HeaderBannerConfig, value: any) => {
    const currentBanner: HeaderBannerConfig = profile.banner || {
      enabled: true,
      type: 'video',
      url: PRESET_VIDEO_BANNERS[0].url,
      height: 'medium',
      overlayOpacity: 40,
      overlayBlur: 0,
      videoMuted: true,
      videoLoop: true,
    };

    onChange({
      ...profile,
      banner: {
        ...currentBanner,
        [field]: value,
      },
    });
  };

  const toggleBannerEnabled = (enabled: boolean) => {
    const currentBanner: HeaderBannerConfig = profile.banner || {
      enabled,
      type: 'video',
      url: PRESET_VIDEO_BANNERS[0].url,
      height: 'medium',
      overlayOpacity: 40,
      overlayBlur: 0,
      videoMuted: true,
      videoLoop: true,
    };

    onChange({
      ...profile,
      banner: {
        ...currentBanner,
        enabled,
      },
    });
  };

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: any) => {
    const currentBiz: BusinessInfo = profile.businessInfo || {
      highlights: ['Atendimento Rápido', 'Qualidade Garantida'],
      isOpenNow: true,
    };

    onChange({
      ...profile,
      businessInfo: {
        ...currentBiz,
        [field]: value,
      },
    });
  };

  const handleAddHighlight = (highlight: string) => {
    const clean = highlight.trim();
    if (!clean) return;
    const currentHighlights = profile.businessInfo?.highlights || [];
    if (!currentHighlights.includes(clean)) {
      handleBusinessInfoChange('highlights', [...currentHighlights, clean]);
    }
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (indexToRemove: number) => {
    const currentHighlights = profile.businessInfo?.highlights || [];
    handleBusinessInfoChange(
      'highlights',
      currentHighlights.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false);

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingOgImage(true);
      try {
        const result = await uploadMediaFile(file, { maxWidth: 1200, maxHeight: 630, quality: 0.85 });
        handleFieldChange('seoOgImage', result.url);
      } finally {
        setIsUploadingOgImage(false);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        const result = await uploadMediaFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
        handleFieldChange('avatarUrl', result.url);
      } finally {
        setIsUploadingAvatar(false);
        if (avatarFileRef.current) avatarFileRef.current.value = '';
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingBanner(true);
      const isVideo = file.type.startsWith('video/');
      try {
        const result = await uploadMediaFile(file, { maxWidth: 1400, maxHeight: 900, quality: 0.82 });
        const currentBanner: HeaderBannerConfig = profile.banner || {
          enabled: true,
          type: isVideo ? 'video' : 'image',
          url: result.url,
          height: 'medium',
          overlayOpacity: 40,
          overlayBlur: 0,
          videoMuted: true,
          videoLoop: true,
        };
        onChange({
          ...profile,
          banner: {
            ...currentBanner,
            enabled: true,
            type: isVideo ? 'video' : 'image',
            url: result.url,
          },
        });
      } finally {
        setIsUploadingBanner(false);
        if (bannerFileRef.current) bannerFileRef.current.value = '';
      }
    }
  };

  // Envia VÁRIOS arquivos de uma vez (fotos ou vídeos) para o Slide de Capa
  const handleBannerMultiFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingBanner(true);
    try {
      const results = await uploadMultipleMedia(Array.from(files), { maxWidth: 1400, maxHeight: 900, quality: 0.82 });
      const currentUrls = profile.banner?.slideshowUrls || [];
      const newUrls = results.map((r) => r.url);
      handleBannerChange('slideshowUrls', [...currentUrls, ...newUrls]);
    } finally {
      setIsUploadingBanner(false);
      if (bannerMultiFileRef.current) bannerMultiFileRef.current.value = '';
    }
  };

  const handleAddSlideshowUrlText = () => {
    const clean = newSlideshowUrl.trim();
    if (!clean) return;
    const currentUrls = profile.banner?.slideshowUrls || [];
    handleBannerChange('slideshowUrls', [...currentUrls, clean]);
    setNewSlideshowUrl('');
  };

  const handleRemoveSlideshowUrl = (indexToRemove: number) => {
    const currentUrls = profile.banner?.slideshowUrls || [];
    handleBannerChange(
      'slideshowUrls',
      currentUrls.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const currentBanner = profile.banner || {
    enabled: false,
    type: 'video' as const,
    url: PRESET_VIDEO_BANNERS[0].url,
    height: 'medium' as const,
    overlayOpacity: 40,
    overlayBlur: 0,
    videoMuted: true,
    videoLoop: true,
  };

  const businessInfo = profile.businessInfo || {
    tagline: '',
    highlights: [],
    operatingHours: '',
    isOpenNow: false,
    cnpjOrDoc: '',
    addressDetail: '',
  };

  return (
    <div className="grid grid-cols-1 gap-y-6">
      {/* Visual Navigation Subtabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl w-full">
        <button
          type="button"
          onClick={() => setActiveSection('avatar')}
          title="Logo & Foto de Perfil"
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            activeSection === 'avatar'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Foto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('banner')}
          title="Capa & Vídeo de Fundo"
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            activeSection === 'banner'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Film className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Capa</span>
          {currentBanner.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('bio')}
          title="Biografia, Nome & Negócio"
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            activeSection === 'bio'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Bio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('seo')}
          title="SEO & Indexação no Google"
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            activeSection === 'seo'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">SEO</span>
          {profile.seoTitle && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('visibility')}
          title="Visibilidade e Status dos Elementos"
          className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            activeSection === 'visibility'
              ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Status</span>
        </button>
      </div>

      {/* SECTION 1: LOGO & FOTO DE PERFIL */}
      {activeSection === 'avatar' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                Logo / Foto de Perfil
              </h3>
              <span className="text-[11px] text-slate-400">Suporte a quadrado & redondo</span>
            </div>

            {/* Avatar Preview & Upload */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={profile.avatarUrl || DEFAULT_AVATAR}
                  alt="Avatar"
                  className={`w-20 h-20 object-cover shadow-lg transition-all duration-200 ${
                    profile.avatarStyle === 'circle'
                      ? 'rounded-full'
                      : profile.avatarStyle === 'square'
                      ? 'rounded-md'
                      : profile.avatarStyle === 'squircle'
                      ? 'rounded-[26px]'
                      : profile.avatarStyle === 'ring'
                      ? 'rounded-full p-1'
                      : 'rounded-2xl'
                  }`}
                  style={{
                    borderWidth: profile.avatarBorder !== false ? `${profile.avatarBorderWidth || 3}px` : '0px',
                    borderColor: profile.avatarBorderColor || '#ffffff',
                    borderStyle: 'solid',
                    backgroundColor: '#0f172a',
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={avatarFileRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarFileRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-bold flex items-center gap-1.5 border border-sky-500/40 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                        <span>Comprimindo & Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        <span>Enviar Imagem do Computador</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Ou cole a URL direta da imagem..."
                  value={profile.avatarUrl.startsWith('data:') ? '' : profile.avatarUrl}
                  onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Avatar Shape / Formato: Quadrado vs Redondo vs Squircle vs Arredondado vs Anel */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1.5 font-semibold">
                Formato do Avatar / Logo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-1.5">
                {[
                  { id: 'circle', label: 'Círculo' },
                  { id: 'squircle', label: 'Squircle' },
                  { id: 'rounded', label: 'Arredondado' },
                  { id: 'square', label: 'Quadrado' },
                  { id: 'ring', label: 'Anel' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleFieldChange('avatarStyle', st.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center flex items-center justify-center min-h-[38px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      profile.avatarStyle === st.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Borda / Moldura Branca ou Personalizada (Toggle Obrigatório) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Moldura / Borda Branca de Destaque
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Destaca a foto e logo contra qualquer imagem de fundo
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.avatarBorder !== false}
                    onChange={(e) => handleFieldChange('avatarBorder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {profile.avatarBorder !== false && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                      Cor da Moldura
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={getValidPickerHex(profile.avatarBorderColor, '#ffffff')}
                        onChange={(e) => handleFieldChange('avatarBorderColor', e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleFieldChange('avatarBorderColor', '#ffffff')}
                        className="px-2 py-1 rounded-xl bg-slate-800 text-[10px] font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        Branco Padrão
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                      Espessura da Moldura
                    </label>
                    <div className="flex items-center gap-1">
                      {[
                        { label: '2px', val: 2 },
                        { label: '3px', val: 3 },
                        { label: '4px', val: 4 },
                        { label: '6px', val: 6 },
                      ].map((th) => (
                        <button
                          key={th.val}
                          type="button"
                          onClick={() => handleFieldChange('avatarBorderWidth', th.val)}
                          className={`flex-1 py-1 rounded-xl text-[11px] font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                            (profile.avatarBorderWidth || 3) === th.val
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {th.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Avatar Size / Tamanho */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1.5 font-semibold">
                Tamanho da Foto / Logo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'sm', label: 'Pequeno (80px)' },
                  { id: 'md', label: 'Médio (96px)' },
                  { id: 'lg', label: 'Grande (112px)' },
                  { id: 'xl', label: 'Destaque (128px)' },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => handleFieldChange('avatarSize', sz.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      (profile.avatarSize || 'md') === sz.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CAPA & BANNER EM VÍDEO OU IMAGEM */}
      {activeSection === 'banner' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-sky-400" />
                  Banner / Capa de Topo
                </h3>
                <p className="text-[11px] text-slate-400">
                  Suporte a vídeo em loop de alta qualidade, imagem de topo ou slide de fotos/vídeos
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentBanner.enabled}
                  onChange={(e) => toggleBannerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {currentBanner.enabled ? (
              <div className="space-y-6 pt-2 border-t border-slate-800">
                {/* Banner Media Type Selector */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Tipo de Mídia da Capa
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'video', label: '🎬 Vídeo em Loop HD' },
                      { id: 'image', label: '🖼️ Imagem Estática' },
                      { id: 'slideshow-images', label: '🎞️ Slide de Fotos' },
                      { id: 'slideshow-videos', label: '📹 Slide de Vídeos' },
                      { id: 'gradient', label: '✨ Degradê Brand' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleBannerChange('type', type.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          currentBanner.type === type.id
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-b border-slate-800" />

                {/* Video Loop Banner Options */}
                {currentBanner.type === 'video' && (
                  <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        Vídeo em Loop HD (MP4 / WebM)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">Autoplay & Muted</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bannerFileRef}
                        onChange={handleBannerUpload}
                        accept="video/mp4,video/webm,image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingBanner}
                        onClick={() => bannerFileRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                      >
                        {isUploadingBanner ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-sky-400" />
                            <span>Enviar Vídeo Local</span>
                          </>
                        )}
                      </button>

                      <input
                        type="text"
                        placeholder="Ou URL de vídeo MP4..."
                        value={currentBanner.url.startsWith('data:') ? '' : currentBanner.url}
                        onChange={(e) => handleBannerChange('url', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                      />
                    </div>

                    {/* Presets of High Quality Loop Videos */}
                    <div>
                      <p className="text-[11px] text-slate-400 mb-2 font-medium">
                        Selecione um Vídeo em Loop HD pronto:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_VIDEO_BANNERS.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              handleBannerChange('type', 'video');
                              handleBannerChange('url', v.url);
                            }}
                            className={`p-2 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                              currentBanner.url === v.url
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <p className="text-xs font-bold truncate leading-tight flex items-center gap-1">
                              <Play className="w-3 h-3 text-sky-400 shrink-0" />
                              {v.name}
                            </p>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {v.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Static Image Banner Options */}
                {currentBanner.type === 'image' && (
                  <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bannerFileRef}
                        onChange={handleBannerUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingBanner}
                        onClick={() => bannerFileRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                      >
                        {isUploadingBanner ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                            <span>Comprimindo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-sky-400" />
                            <span>Enviar Foto da Capa</span>
                          </>
                        )}
                      </button>

                      <input
                        type="text"
                        placeholder="Ou URL da imagem da capa..."
                        value={currentBanner.url.startsWith('data:') ? '' : currentBanner.url}
                        onChange={(e) => handleBannerChange('url', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                      />
                    </div>

                    {/* Presets of Images */}
                    <div>
                      <p className="text-[11px] text-slate-400 mb-2 font-medium">
                        Capas em Imagem de Alta Resolução:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_IMAGE_BANNERS.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              handleBannerChange('type', 'image');
                              handleBannerChange('url', imgUrl);
                            }}
                            className={`h-14 rounded-lg overflow-hidden border-2 transition-all relative focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                              currentBanner.url === imgUrl
                                ? 'border-sky-500 ring-2 ring-sky-500/40 scale-105'
                                : 'border-slate-800 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt="Capa" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Slideshow Images Banner Options */}
                {currentBanner.type === 'slideshow-images' && (
                  <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Slide de Fotos (sem limite de itens)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {(currentBanner.slideshowUrls || []).length} foto(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bannerMultiFileRef}
                        onChange={handleBannerMultiFilesUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bannerMultiFileRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        Enviar Várias Fotos
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSlideshowUrl}
                        onChange={(e) => setNewSlideshowUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSlideshowUrlText();
                          }
                        }}
                        placeholder="Ou cole a URL de uma foto e pressione Enter..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddSlideshowUrlText}
                        className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/40 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {(currentBanner.slideshowUrls || []).length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {(currentBanner.slideshowUrls || []).map((url, idx) => (
                          <div key={idx} className="relative group h-16 rounded-lg overflow-hidden border border-slate-800">
                            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveSlideshowUrl(idx)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950/80 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-0.5 left-0.5 text-[9px] font-mono bg-slate-950/80 text-slate-300 px-1 rounded">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(currentBanner.slideshowUrls || []).length === 0 && (
                      <p className="text-[11px] text-slate-500 italic">
                        Nenhuma foto adicionada ainda. Envie fotos ou cole URLs acima.
                      </p>
                    )}
                  </div>
                )}

                {/* Slideshow Videos Banner Options */}
                {currentBanner.type === 'slideshow-videos' && (
                  <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        Slide de Vídeos (sem limite de itens)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {(currentBanner.slideshowUrls || []).length} vídeo(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={bannerMultiFileRef}
                        onChange={handleBannerMultiFilesUpload}
                        accept="video/mp4,video/webm"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bannerMultiFileRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        Enviar Vários Vídeos
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSlideshowUrl}
                        onChange={(e) => setNewSlideshowUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSlideshowUrlText();
                          }
                        }}
                        placeholder="Ou cole a URL de um vídeo MP4 e pressione Enter..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddSlideshowUrlText}
                        className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/40 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {(currentBanner.slideshowUrls || []).length > 0 && (
                      <div className="space-y-1.5">
                        {(currentBanner.slideshowUrls || []).map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                            <Play className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="text-[11px] text-slate-300 font-mono truncate flex-1">
                              Vídeo {idx + 1}: {url.startsWith('data:') ? '(arquivo enviado)' : url}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlideshowUrl(idx)}
                              className="text-rose-400 hover:text-rose-300 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(currentBanner.slideshowUrls || []).length === 0 && (
                      <p className="text-[11px] text-slate-500 italic">
                        Nenhum vídeo adicionado ainda. Envie vídeos ou cole URLs acima.
                      </p>
                    )}
                  </div>
                )}

                {/* Slideshow Interval (compartilhado pelos dois tipos de slide) */}
                {(currentBanner.type === 'slideshow-images' || currentBanner.type === 'slideshow-videos') && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-300">Intervalo entre trocas</span>
                      <span className="text-sky-400 font-mono">{currentBanner.slideshowInterval || 5}s</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={15}
                      step={1}
                      value={currentBanner.slideshowInterval || 5}
                      onChange={(e) => handleBannerChange('slideshowInterval', Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
                    />
                  </div>
                )}

                {/* Divider */}
                <div className="border-b border-slate-800" />

                {/* Banner Height */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Altura da Capa / Banner
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'compact', label: 'Compacto (130px)' },
                      { id: 'medium', label: 'Médio (180px)' },
                      { id: 'tall', label: 'Amplo (240px)' },
                      { id: 'hero', label: 'Hero (300px)' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleBannerChange('height', h.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          currentBanner.height === h.id
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-b border-slate-800" />

                {/* Overlay & Contrast Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-300">Escurecimento (Overlay)</span>
                      <span className="text-sky-400 font-mono">{currentBanner.overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={currentBanner.overlayOpacity}
                      onChange={(e) => handleBannerChange('overlayOpacity', Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-300">Desfoque da Capa (Blur)</span>
                      <span className="text-sky-400 font-mono">{currentBanner.overlayBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={1}
                      value={currentBanner.overlayBlur}
                      onChange={(e) => handleBannerChange('overlayBlur', Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
                <Film className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">Banner de Topo Desativado</p>
                <p className="text-[11px] text-slate-500">
                  Ative o switch acima para adicionar um vídeo em loop ou imagem de capa de topo de alta qualidade.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: BIO, PROPOSTA DE VALOR & INFORMAÇÕES DA EMPRESA */}
      {activeSection === 'bio' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Identidade, Nome & Tipografia Individual
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                Formatação por Frase ou Palavra
              </span>
            </div>

            {/* Handle & Pronouns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Usuário / @Handle
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Link do Site</span>
                </div>
                <div className="relative">
                  <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.handle}
                    onChange={(e) => handleFieldChange('handle', e.target.value)}
                    placeholder="Ex: @mayrah_esmalteria"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <span>Pronomes / Distintivo</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Opcional</span>
                </div>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.pronouns || ''}
                    onChange={(e) => handleFieldChange('pronouns', e.target.value)}
                    placeholder="Ex: Ela/Dela ou Pro"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Rich Name & Individual Typography Formatter */}
            <div className="pt-1">
              <RichNameEditor profile={profile} onChange={onChange} />
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Tagline / Proposta de Valor em Destaque */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>Tagline / Proposta de Valor</span>
                </label>
                <button
                  type="button"
                  onClick={handleEnhanceTagline}
                  disabled={isEnhancingTagline}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {isEnhancingTagline ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>{isEnhancingTagline ? 'Gerando...' : 'Sugerir com IA'}</span>
                </button>
              </div>
              <input
                type="text"
                value={businessInfo.tagline || ''}
                onChange={(e) => handleBusinessInfoChange('tagline', e.target.value)}
                placeholder="Ex: Transformamos ideias em produtos digitais de alto impacto"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium transition-all"
              />
              {taglineSuggestions.length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                    <span>✨ Escolha uma sugestão da IA:</span>
                    <button type="button" onClick={() => setTaglineSuggestions([])} className="text-slate-500 hover:text-slate-300">
                      Fechar
                    </button>
                  </div>
                  {taglineSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleBusinessInfoChange('tagline', s);
                        setTaglineSuggestions([]);
                      }}
                      className="w-full text-left p-1.5 rounded-lg text-xs text-slate-200 hover:text-white bg-slate-900/60 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Bio / Descrição Completa do Negócio */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300 font-semibold">
                  Bio / Descrição do Negócio
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEnhanceBio}
                    disabled={isEnhancingBio}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 transition-all disabled:opacity-50"
                  >
                    {isEnhancingBio ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{isEnhancingBio ? 'Melhorando...' : 'Melhorar com IA'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {profile.bio.length}/280
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                maxLength={280}
                value={profile.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Descreva de forma clara e legível sua empresa, serviços, história ou proposta de valor..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 leading-relaxed resize-none transition-all"
              />
              {bioSuggestions.length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                    <span>✨ Escolha uma opção para sua bio:</span>
                    <button type="button" onClick={() => setBioSuggestions([])} className="text-slate-500 hover:text-slate-300">
                      Fechar
                    </button>
                  </div>
                  {bioSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleFieldChange('bio', s);
                        setBioSuggestions([]);
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs text-slate-200 hover:text-white bg-slate-900/60 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 transition-all leading-relaxed"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Badges de Destaque / Diferenciais do Negócio */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Diferenciais & Badges da Empresa
                </label>
                <span className="text-[10px] text-slate-400">Pílulas de confiança</span>
              </div>

              {/* Active Badges */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {(businessInfo.highlights || []).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm"
                  >
                    <span>{highlight}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(businessInfo.highlights || []).length === 0 && (
                  <p className="text-[11px] text-slate-500 italic">
                    Nenhum diferencial adicionado ainda. Clique nas sugestões abaixo:
                  </p>
                )}
              </div>

              {/* Custom Add Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newHighlightInput}
                  onChange={(e) => setNewHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHighlight(newHighlightInput);
                    }
                  }}
                  placeholder="Digitar novo diferencial e pressionar Enter..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddHighlight(newHighlightInput)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Sugestões rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_BUSINESS_HIGHLIGHTS.map((sug, i) => {
                    const isAdded = (businessInfo.highlights || []).includes(sug);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddHighlight(sug)}
                        className={`text-[10px] font-medium px-2 py-1 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          isAdded
                            ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-default'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-300'
                        }`}
                      >
                        {sug}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Informações da Empresa & Atendimento */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                Informações de Atendimento & Estabelecimento
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Horário de Funcionamento
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={businessInfo.operatingHours || ''}
                      onChange={(e) => handleBusinessInfoChange('operatingHours', e.target.value)}
                      placeholder="Ex: Seg a Sex: 08h às 18h"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    CNPJ ou Registro Profissional
                  </label>
                  <input
                    type="text"
                    value={businessInfo.cnpjOrDoc || ''}
                    onChange={(e) => handleBusinessInfoChange('cnpjOrDoc', e.target.value)}
                    placeholder="Ex: CNPJ: 12.345.678/0001-90"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Localização & Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder="Ex: Av. Paulista, 1000 - SP"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Badge de Destaque / Tag Superior
                  </label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.badgeText || ''}
                      onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                      placeholder="Ex: Aberto Agora, Top 1 Brasil"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Status Aberto Agora & Selo de Verificado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Status "Aberto Agora"
                    </p>
                    <p className="text-[10px] text-slate-400">Exibir badge verde ativo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!businessInfo.isOpenNow}
                      onChange={(e) => handleBusinessInfoChange('isOpenNow', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      Selo de Verificado
                    </p>
                    <p className="text-[10px] text-slate-400">Badge azul oficial</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.verified}
                      onChange={(e) => handleFieldChange('verified', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              </div>

              {/* SEO & Meta Tags Quick Config Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-sky-400" />
                      SEO & Título da Página no Navegador
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      Atualiza em tempo real as meta tags do documento e o resultado no Google
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('seo')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 hover:underline shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    <span>Abrir Aba SEO</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Título da Página (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={profile.seoTitle || ''}
                      onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                      placeholder={
                        profile.name
                          ? `${profile.name} | Link na Bio Oficial`
                          : 'BioLink Studio | Conheça nossos links'
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 font-medium block mb-1">
                      Descrição Curta para SEO (Meta Description)
                    </label>
                    <textarea
                      rows={2}
                      value={profile.seoDescription || ''}
                      onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                      placeholder={
                        profile.bio ||
                        'Resumo para mecanismos de busca e prévia do WhatsApp...'
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SEO, GOOGLE & COMPARTILHAMENTO DE LINKS */}
      {activeSection === 'seo' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  SEO, Google & Compartilhamento nas Redes
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Personalize o título da página e a descrição curta indexada por buscadores e exibida no WhatsApp.
                </p>
              </div>

              {/* Live Head Sync Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold shrink-0 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Meta Tags Sincronizadas</span>
              </div>
            </div>

            {/* Field 1: Título da Página / Meta Title */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  Título da Página (SEO Title / &lt;title&gt;)
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      (profile.seoTitle || '').length > 60
                        ? 'text-amber-400'
                        : (profile.seoTitle || '').length >= 30
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {(profile.seoTitle || '').length}/60 caracteres
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        'seoTitle',
                        profile.name
                          ? `${profile.name} | Link na Bio Oficial`
                          : 'BioLink Studio | Link na Bio'
                      )
                    }
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 flex items-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    <Sparkles className="w-3 h-3" />
                    Sugerir
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={profile.seoTitle || ''}
                onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                placeholder={
                  profile.name
                    ? `Ex: ${profile.name} - Conheça nossos serviços e links oficiais`
                    : 'Ex: Studio Design | Portfólio, Contatos e Redes Sociais'
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium transition-all"
              />
              <p className="text-[10px] text-slate-400">
                Aparece na aba do navegador, no resultado de buscas do Google e no topo ao compartilhar o link.
              </p>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Field 2: Descrição Curta para SEO / Meta Description */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Descrição Curta para SEO (Meta Description)
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      (profile.seoDescription || '').length > 160
                        ? 'text-amber-400'
                        : (profile.seoDescription || '').length >= 70
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {(profile.seoDescription || '').length}/160 caracteres
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const desc =
                        profile.bio ||
                        profile.businessInfo?.tagline ||
                        `Acesse todos os links, redes sociais, formas de contato e serviços oficiais de ${profile.name || 'nossa empresa'}.`;
                      handleFieldChange('seoDescription', desc);
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 flex items-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar da Bio
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                maxLength={200}
                value={profile.seoDescription || ''}
                onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                placeholder={
                  profile.bio ||
                  'Descreva brevemente sua marca ou serviços para que os motores de busca e o WhatsApp exibam um resumo convidativo...'
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 leading-relaxed resize-none font-normal transition-all"
              />
              <p className="text-[10px] text-slate-400">
                Resumo indexado pelo Google e exibido no balão de prévia do WhatsApp e redes sociais. Ideal entre 120 e 160 caracteres.
              </p>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Field 3: Palavras-chave / Keywords */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                Palavras-Chave de Busca (Meta Keywords)
              </label>

              <input
                type="text"
                value={profile.seoKeywords || ''}
                onChange={(e) => handleFieldChange('seoKeywords', e.target.value)}
                placeholder="Ex: link na bio, atendimento whatsapp, esmalteria são paulo, catálogo"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-normal transition-all"
              />

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'link na bio',
                  'contato oficial',
                  'whatsapp',
                  'redes sociais',
                  'catálogo digital',
                  profile.location || 'são paulo',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const current = profile.seoKeywords || '';
                      if (!current.toLowerCase().includes(chip.toLowerCase())) {
                        const updated = current ? `${current}, ${chip}` : chip;
                        handleFieldChange('seoKeywords', updated);
                      }
                    }}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Field 4: Imagem de Compartilhamento para Redes Sociais (OG Image) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  Imagem de Compartilhamento (OG Image / Redes Sociais)
                </label>
                {profile.seoOgImage && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('seoOgImage', '')}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                  >
                    Restaurar Padrão
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400">
                Esta imagem aparecerá quando seu link for compartilhado no WhatsApp, Telegram, Facebook, LinkedIn, Twitter e Discord. (Recomendado: 1200x630px).
              </p>

              <div className="flex items-center gap-3">
                <div className="w-20 h-14 rounded-lg bg-slate-900 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center relative">
                  <img
                    src={
                      profile.seoOgImage ||
                      (profile.banner?.enabled && profile.banner.type === 'image' && profile.banner.url
                        ? profile.banner.url
                        : profile.avatarUrl || DEFAULT_AVATAR)
                    }
                    alt="OG Image Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={profile.seoOgImage || ''}
                    onChange={(e) => handleFieldChange('seoOgImage', e.target.value)}
                    placeholder="Cole a URL da imagem (https://...)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-normal transition-all"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-[11px] font-semibold transition-all focus-within:ring-2 focus-within:ring-emerald-500/50">
                      {isUploadingOgImage ? (
                        <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>{isUploadingOgImage ? 'Enviando...' : 'Fazer Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingOgImage}
                        className="hidden"
                        onChange={handleOgImageUpload}
                      />
                    </label>

                    {profile.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('seoOgImage', profile.avatarUrl)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        Usar Foto de Perfil
                      </button>
                    )}

                    {profile.banner?.enabled && profile.banner.type === 'image' && profile.banner.url && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('seoOgImage', profile.banner?.url)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        Usar Imagem de Capa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-800" />

            {/* Google SERP Snippet Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  Prévia em Tempo Real no Google (Resultado Orgânico)
                </span>
                <span className="text-[10px] text-slate-400">Simulação SERP</span>
              </div>

              {/* Realistic Google Search Card */}
              <div className="p-3.5 rounded-xl bg-[#202124] border border-[#303134] space-y-1 text-left font-sans">
                {/* Domain & Favicon */}
                <div className="flex items-center gap-2 text-[12px] text-[#bdc1c6]">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                    <img
                      src={profile.avatarUrl || DEFAULT_AVATAR}
                      alt="Favicon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-[12px] font-medium text-[#e8eaed] truncate">
                      {profile.name || 'BioLink Studio'}
                    </span>
                    <span className="text-[11px] text-[#9aa0a6] truncate">
                      https://exiba.me › {profile.handle ? profile.handle.replace('@', '') : 'perfil'}
                    </span>
                  </div>
                </div>

                {/* Google Blue Title */}
                <h4 className="text-[15px] sm:text-[16px] text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug pt-0.5 line-clamp-1">
                  {profile.seoTitle?.trim() || `${profile.name || 'Exiba'} - Link na Bio Oficial`}
                </h4>

                {/* Snippet Description */}
                <p className="text-[12px] text-[#bdc1c6] leading-relaxed line-clamp-2">
                  {profile.seoDescription?.trim() ||
                    profile.bio?.trim() ||
                    `Acesse todos os links oficiais, formas de contato, horário e serviços de ${profile.name || 'nossa empresa'}.`}
                </p>
              </div>
            </div>

            {/* Social Share / WhatsApp Card Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  Prévia de Compartilhamento (WhatsApp & Redes)
                </span>
                <span className="text-[10px] text-slate-400">Open Graph Preview</span>
              </div>

              {/* WhatsApp Card Box */}
              <div className="max-w-md mx-auto rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col">
                <div className="h-36 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      profile.seoOgImage ||
                      (profile.banner?.enabled && profile.banner.type === 'image' && profile.banner.url
                        ? profile.banner.url
                        : profile.avatarUrl || DEFAULT_AVATAR)
                    }
                    alt="Preview Card"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <img
                      src={profile.avatarUrl || DEFAULT_AVATAR}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow"
                    />
                    <span className="text-xs font-bold text-white shadow-sm">
                      {profile.name || 'Exiba Studio'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                    exiba.me
                  </p>
                  <p className="text-xs font-bold text-slate-100 line-clamp-1">
                    {profile.seoTitle?.trim() || `${profile.name || 'Exiba'} | Link na Bio`}
                  </p>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                    {profile.seoDescription?.trim() ||
                      profile.bio?.trim() ||
                      'Clique para acessar links, WhatsApp, produtos e informações completas.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: VISIBILIDADE & CONTROLE DE ELEMENTOS (ATIVAR / DESATIVAR) */}
      {activeSection === 'visibility' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  Ativar / Desativar Elementos da Página
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ligue ou desligue qualquer elemento visual com 1 clique para deixar o bio-site exatamente no seu estilo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  key: 'showAvatar' as const,
                  label: 'Foto / Logo de Perfil',
                  desc: 'Avatar central ou squircle',
                  icon: ImageIcon,
                  val: profile.showAvatar !== false,
                },
                {
                  key: 'showName' as const,
                  label: 'Nome Principal',
                  desc: 'Título em destaque no topo',
                  icon: User,
                  val: profile.showName !== false,
                },
                {
                  key: 'showHandle' as const,
                  label: 'Usuário @Handle',
                  desc: 'Identificador do perfil',
                  icon: AtSign,
                  val: profile.showHandle !== false,
                },
                {
                  key: 'showVerified' as const,
                  label: 'Selo de Verificado',
                  desc: 'Badge azul de autenticidade',
                  icon: CheckCircle2,
                  val: profile.showVerified !== false,
                },
                {
                  key: 'showBadge' as const,
                  label: 'Tag / Badge Superior',
                  desc: 'Ex: "Aberto Agora", "Top 1"',
                  icon: Tag,
                  val: profile.showBadge !== false,
                },
                {
                  key: 'showLocation' as const,
                  label: 'Localização / Cidade',
                  desc: 'Endereço e pin no perfil',
                  icon: MapPin,
                  val: profile.showLocation !== false,
                },
                {
                  key: 'showTagline' as const,
                  label: 'Tagline de Impacto',
                  desc: 'Frase principal de proposta de valor',
                  icon: Sparkles,
                  val: profile.showTagline !== false,
                },
                {
                  key: 'showBio' as const,
                  label: 'Bio / Descrição do Negócio',
                  desc: 'Parágrafo explicativo',
                  icon: Building2,
                  val: profile.showBio !== false,
                },
                {
                  key: 'showOperatingHours' as const,
                  label: 'Horário & Documento/CNPJ',
                  desc: 'Card de expediente e dados fiscais',
                  icon: Clock,
                  val: profile.showOperatingHours !== false,
                },
                {
                  key: 'showSocials' as const,
                  label: 'Barra de Redes Sociais',
                  desc: 'Ícones do Instagram, WhatsApp, etc.',
                  icon: Share2,
                  val: profile.showSocials !== false,
                },
                {
                  key: 'showFooter' as const,
                  label: 'Rodapé e Copyright',
                  desc: 'Nome no rodapé da página',
                  icon: Layers,
                  val: profile.showFooter !== false,
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.key}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      item.val
                        ? 'bg-slate-950 border-slate-700/80 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          item.val
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={item.val}
                        onChange={(e) => handleFieldChange(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}