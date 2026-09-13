import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  BioSiteConfig,
  ContentBlock,
  LinkBlock,
  ScheduleBlock,
  BentoBlock,
  VideoBlock,
  AudioBlock,
  ProductBlock,
  PixBlock,
  WhatsAppBlock,
  GoogleReviewBlock,
  WifiBlock,
  CountdownBlock,
  FaqBlock,
  TextBlock,
  GalleryBlock,
  SocialPlatform,
} from '../../types';
import { renderDynamicIcon } from '../common/IconSelector';
import { ExibaLogo } from '../common/ExibaLogo';
import { NativeScheduleBlock } from './NativeScheduleBlock';
import { PixModal } from './PixModal';
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
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Sparkles,
  Check,
  Instagram,
  Youtube,
  Github,
  Linkedin,
  Twitter,
  Music,
  Mail,
  Phone,
  Globe,
  ShoppingBag,
  ShieldCheck,
  Store,
  MapPin,
  Building2,
  FileCheck,
  Star,
  Wifi,
  QrCode,
  ChevronRight,
  X,
  Key,
  Calendar,
} from 'lucide-react';
import { ProductCardRenderer } from './ProductCardRenderer';
import { GalleryCardRenderer } from './GalleryCardRenderer';
import { resolveBlockColor, resolveBlockTextColor, BLOCK_DEFAULT_COLORS } from '../../utils/blockColors';

interface BioSiteRendererProps {
  config: BioSiteConfig;
  isInteractive?: boolean;
  onBlockClick?: (blockId: string) => void;
  plan?: 'free' | 'pro';
  isAdmin?: boolean;
  slug?: string;
}

export const SOCIAL_BRAND_CONFIG: Record<
  SocialPlatform,
  { bg: string; text: string; name: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
> = {
  whatsapp: { bg: '#25D366', text: '#ffffff', name: 'WhatsApp', icon: WhatsAppBrandIcon },
  instagram: { bg: '#E1306C', text: '#ffffff', name: 'Instagram', icon: Instagram },
  facebook: { bg: '#1877F2', text: '#ffffff', name: 'Facebook', icon: FacebookBrandIcon },
  youtube: { bg: '#FF0000', text: '#ffffff', name: 'YouTube', icon: Youtube },
  tiktok: { bg: '#000000', text: '#ffffff', name: 'TikTok', icon: TikTokBrandIcon },
  linkedin: { bg: '#0A66C2', text: '#ffffff', name: 'LinkedIn', icon: Linkedin },
  github: { bg: '#24292e', text: '#ffffff', name: 'GitHub', icon: Github },
  twitter: { bg: '#1DA1F2', text: '#ffffff', name: 'X (Twitter)', icon: Twitter },
  threads: { bg: '#000000', text: '#ffffff', name: 'Threads', icon: ThreadsBrandIcon },
  spotify: { bg: '#1DB954', text: '#ffffff', name: 'Spotify', icon: SpotifyBrandIcon },
  telegram: { bg: '#229ED9', text: '#ffffff', name: 'Telegram', icon: TelegramBrandIcon },
  pinterest: { bg: '#E60023', text: '#ffffff', name: 'Pinterest', icon: PinterestBrandIcon },
  snapchat: { bg: '#FFFC00', text: '#000000', name: 'Snapchat', icon: SnapchatBrandIcon },
  kwai: { bg: '#FF6E00', text: '#ffffff', name: 'Kwai', icon: KwaiBrandIcon },
  twitch: { bg: '#9146FF', text: '#ffffff', name: 'Twitch', icon: Sparkles },
  discord: { bg: '#5865F2', text: '#ffffff', name: 'Discord', icon: Sparkles },
  email: { bg: '#EA4335', text: '#ffffff', name: 'E-mail', icon: Mail },
  behance: { bg: '#1769FF', text: '#ffffff', name: 'Behance', icon: Globe },
  dribbble: { bg: '#EA4C89', text: '#ffffff', name: 'Dribbble', icon: Globe },
  website: { bg: '#475569', text: '#ffffff', name: 'Website', icon: Globe },
  phone: { bg: '#10B981', text: '#ffffff', name: 'Telefone', icon: Phone },
};

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  whatsapp: WhatsAppBrandIcon,
  instagram: Instagram,
  facebook: FacebookBrandIcon,
  youtube: Youtube,
  tiktok: TikTokBrandIcon,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  threads: ThreadsBrandIcon,
  spotify: SpotifyBrandIcon,
  telegram: TelegramBrandIcon,
  pinterest: PinterestBrandIcon,
  snapchat: SnapchatBrandIcon,
  kwai: KwaiBrandIcon,
  twitch: Sparkles,
  discord: Sparkles,
  email: Mail,
  behance: Globe,
  dribbble: Globe,
  website: Globe,
  phone: Phone,
};

function BioSiteRendererComponent({ config, isInteractive = true, onBlockClick, plan = 'pro', isAdmin = false, slug }: BioSiteRendererProps) {
  const { profile, socialLinks, blocks, theme, socialPosition = 'top' } = config;
  const [copiedPix, setCopiedPix] = useState<string | null>(null);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({});
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<Record<string, number>>({});
  const [activeWifiModal, setActiveWifiModal] = useState<WifiBlock | null>(null);
  const [activePixModal, setActivePixModal] = useState<PixBlock | null>(null);

  const banner = profile.banner;
  const businessInfo = profile.businessInfo;

  const handleBlockAction = (e: React.MouseEvent, block: ContentBlock, fallbackUrl?: string) => {
    if (onBlockClick) {
      onBlockClick(block.id);
    }
    if (!isInteractive) {
      e.preventDefault();
    }
  };

  const handleCopyPix = (pixKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(pixKey);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // safe fallback
    }
    setTimeout(() => setCopiedPix(null), 3000);
  };

  const handleCopyWifiPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  // Radius conversion & dynamic style helpers
  const getDynamicRadiusStyle = (): React.CSSProperties => {
    if (theme.borderRadiusValue !== undefined) {
      if (theme.borderRadiusValue >= 36) return { borderRadius: '9999px' };
      return { borderRadius: `${theme.borderRadiusValue}px` };
    }
    switch (theme.borderRadius) {
      case 'none': return { borderRadius: '0px' };
      case 'sm': return { borderRadius: '8px' };
      case 'md': return { borderRadius: '16px' };
      case 'lg': return { borderRadius: '24px' };
      case 'full': return { borderRadius: '9999px' };
      default: return { borderRadius: '16px' };
    }
  };

  const getDynamicPaddingStyle = (): React.CSSProperties => {
    if (theme.blockPadding !== undefined) {
      return { padding: `${theme.blockPadding}px` };
    }
    return {};
  };

  const radiusClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-2xl',
    lg: 'rounded-3xl',
    full: 'rounded-full',
  };
  const activeRadiusClass = theme.borderRadiusValue !== undefined
    ? ''
    : (radiusClasses[theme.borderRadius] || 'rounded-2xl');

  // Card styling classes
  const getCardStyle = () => {
    const base = 'transition-all duration-300 relative overflow-hidden ';
    switch (theme.cardStyle) {
      case 'glass':
        return base + 'backdrop-blur-xl shadow-lg hover:shadow-xl ';
      case 'brutalist':
        return base + 'border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ';
      case 'soft-shadow':
        return base + 'shadow-xl hover:shadow-2xl hover:-translate-y-0.5 ';
      case 'outline':
        return base + 'border-2 hover:bg-opacity-80 ';
      case 'gradient-border':
        return base + 'border-2 border-transparent bg-clip-padding ';
      case 'flat':
      default:
        return base + 'shadow-sm hover:shadow-md ';
    }
  };

  // Background computation
  const getBackgroundStyles = (): React.CSSProperties => {
    if (theme.bgType === 'gradient') {
      return { background: theme.bgGradient };
    }
    if (theme.bgType === 'image' && theme.bgImage) {
      return {
        backgroundImage: `url(${theme.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    if (theme.bgType === 'solid') {
      return { backgroundColor: theme.bgColor };
    }
    return { background: theme.bgGradient || theme.bgColor };
  };

  // Avatar Size computation
  const getAvatarSizeClass = () => {
    switch (profile.avatarSize) {
      case 'sm':
        return 'w-20 h-20';
      case 'lg':
        return 'w-28 h-28';
      case 'xl':
        return 'w-32 h-32';
      case 'md':
      default:
        return 'w-24 h-24';
    }
  };

  // Avatar Shape computation (Squircle vs Square vs Circle vs Rounded vs Ring)
  const getAvatarShapeClass = () => {
    switch (profile.avatarStyle) {
      case 'squircle':
        return 'rounded-[26px]';
      case 'square':
        return 'rounded-xl';
      case 'rounded':
        return 'rounded-3xl';
      case 'ring':
        return 'rounded-full p-1';
      case 'circle':
      default:
        return 'rounded-full';
    }
  };

  // Banner Height computation
  const getBannerHeightClass = () => {
    if (!banner?.enabled) return 'h-0';
    switch (banner.height) {
      case 'compact':
        return 'h-36 @sm:h-40';
      case 'tall':
        return 'h-60 @sm:h-64';
      case 'hero':
        return 'h-72 @sm:h-80';
      case 'medium':
      default:
        return 'h-48 @sm:h-52';
    }
  };

  const hasActiveBanner = Boolean(banner && banner.enabled);

  return (
    <div
      className="min-h-full flex-1 w-full flex flex-col items-center relative transition-colors duration-500 selection:bg-sky-500 selection:text-white pb-20"
      style={{
        ...getBackgroundStyles(),
        color: theme.textColor,
        fontFamily: theme.fontBody,
      }}
    >
      {/* Optional pattern overlay */}
      {theme.bgPattern === 'dots' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(${theme.textColor} 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />
      )}
      {theme.bgPattern === 'grid' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `linear-gradient(to right, ${theme.textColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.textColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      )}

      <div className="w-full @container">
      {/* TOP HEADER COVER / BANNER (Video Loop or Image) */}
      {hasActiveBanner && (
        <div className={`w-full relative overflow-hidden shrink-0 ${getBannerHeightClass()}`}>
          {/* Guaranteed Fallback Gradient behind video/image */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, ${theme.accentColor}40 0%, ${theme.bgColor} 100%)`,
            }}
          />

          {banner.type === 'video' && banner.url && (
            <video
              key={banner.url}
              src={banner.url}
              autoPlay
              loop={banner.videoLoop !== false}
              muted={banner.videoMuted !== false}
              playsInline
              className="w-full h-full object-cover relative z-10"
              style={{
                filter: banner.overlayBlur ? `blur(${banner.overlayBlur}px)` : undefined,
              }}
            />
          )}

          {banner.type === 'image' && banner.url && (
            <img
              key={banner.url}
              src={banner.url}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover relative z-10"
              style={{
                filter: banner.overlayBlur ? `blur(${banner.overlayBlur}px)` : undefined,
              }}
            />
          )}

          {(banner.type === 'slideshow-images' || banner.type === 'slideshow-videos') &&
            banner.slideshowUrls &&
            banner.slideshowUrls.length > 0 && (
              <BannerSlideshow
                urls={banner.slideshowUrls}
                mediaType={banner.type === 'slideshow-images' ? 'image' : 'video'}
                intervalSeconds={banner.slideshowInterval || 5}
                blurPx={banner.overlayBlur}
              />
            )}



          {banner.type === 'gradient' && (
            <div
              className="w-full h-full relative z-10"
              style={{
                background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.bgColor} 100%)`,
              }}
            />
          )}

          {/* Dark / Light Contrast Overlay */}
          <div
            className="absolute inset-0 z-20 transition-opacity pointer-events-none"
            style={{
              backgroundColor: '#000000',
              opacity: (banner.overlayOpacity ?? 40) / 100,
            }}
          />

          {/* Bottom subtle gradient shadow for seamless blend with content */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent z-20 pointer-events-none" />
        </div>
      )}

      {/* Main Content Container */}
      <div
        className={`w-full max-w-[460px] mx-auto px-4 flex flex-col items-center gap-4 z-20 relative ${
          hasActiveBanner ? '-mt-12 @sm:-mt-14' : 'pt-12 @sm:pt-14'
        }`}
      >
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col items-center text-center"
        >
          {/* Avatar / Logo with White Border / Frame Toggle */}
          {profile.showAvatar !== false && (
            <div className="relative group mb-2.5 z-30">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                }}
                className={`${getAvatarSizeClass()} ${getAvatarShapeClass()} object-cover transition-transform duration-300 group-hover:scale-105 shadow-2xl relative`}
                style={{
                  borderColor:
                    profile.avatarBorder !== false
                      ? profile.avatarBorderColor || '#ffffff'
                      : profile.avatarStyle === 'ring'
                      ? theme.accentColor
                      : 'transparent',
                  borderWidth:
                    profile.avatarBorder !== false
                      ? `${profile.avatarBorderWidth || 3}px`
                      : profile.avatarStyle === 'ring'
                      ? '3px'
                      : '0px',
                  borderStyle: 'solid',
                  backgroundColor: theme.cardBg,
                  boxShadow:
                    profile.avatarBorder !== false
                      ? '0 14px 32px -4px rgba(0, 0, 0, 0.55), 0 4px 8px -2px rgba(0,0,0,0.3)'
                      : '0 10px 25px -3px rgba(0, 0, 0, 0.4)',
                }}
              />
              {profile.showVerified !== false && profile.verified && (
                <div
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-950 border-2 border-white shadow-xl z-40"
                  title="Verificado Oficial"
                >
                  <CheckCircle2
                    className="w-4 h-4"
                    style={{ color: theme.accentColor }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Name, Pronouns, Subtitle & Individual Phrase/Word Styling */}
          {profile.showName !== false && (
            <div className="w-full flex flex-col items-center">
              {profile.nameLines && profile.nameLines.length > 0 ? (
                <div className="w-full flex flex-col items-center gap-1 text-center">
                  {profile.nameLines.map((line, lineIdx) => {
                    const hasSegments = line.segments && line.segments.length > 0;
                    const lineFont =
                      line.fontFamily && line.fontFamily !== 'inherit'
                        ? line.fontFamily
                        : profile.nameFontFamily && profile.nameFontFamily !== 'inherit'
                        ? profile.nameFontFamily
                        : theme.fontHeading;

                    const lineSize = line.fontSize || (lineIdx === 0 ? profile.nameFontSize || 28 : 14);
                    const lineColor = line.color || profile.nameColor || (lineIdx === 0 ? theme.textColor : theme.textSecondaryColor);
                    const lineWeight =
                      line.fontWeight === 'normal'
                        ? 400
                        : line.fontWeight === 'medium'
                        ? 500
                        : line.fontWeight === 'semibold'
                        ? 600
                        : line.fontWeight === 'extrabold'
                        ? 800
                        : 700;

                    return (
                      <div
                        key={line.id || lineIdx}
                        className="w-full flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 leading-tight break-words max-w-full"
                        style={{
                          fontFamily: lineFont,
                          fontSize: `${lineSize}px`,
                          fontWeight: lineWeight,
                          color: lineColor,
                          fontStyle: line.italic ? 'italic' : 'normal',
                          textTransform: line.uppercase ? 'uppercase' : 'none',
                          textDecoration: line.underline ? 'underline' : 'none',
                          letterSpacing: line.letterSpacing ? `${line.letterSpacing}em` : undefined,
                          backgroundColor: line.backgroundColor || undefined,
                        }}
                      >
                        {hasSegments ? (
                          line.segments!.map((seg, segIdx) => {
                            const segFont = seg.fontFamily && seg.fontFamily !== 'inherit' ? seg.fontFamily : lineFont;
                            const segSize = seg.fontSize ? `${seg.fontSize}px` : undefined;
                            const segColor = seg.color || lineColor;
                            const segWeight =
                              seg.fontWeight === 'normal'
                                ? 400
                                : seg.fontWeight === 'medium'
                                ? 500
                                : seg.fontWeight === 'semibold'
                                ? 600
                                : seg.fontWeight === 'extrabold'
                                ? 800
                                : seg.fontWeight === 'bold'
                                ? 700
                                : undefined;

                            return (
                              <span
                                key={seg.id || segIdx}
                                className="inline-block transition-all"
                                style={{
                                  fontFamily: segFont,
                                  fontSize: segSize,
                                  color: segColor,
                                  fontWeight: segWeight,
                                  fontStyle: seg.italic ? 'italic' : undefined,
                                  textTransform: seg.uppercase ? 'uppercase' : undefined,
                                  textDecoration: seg.underline ? 'underline' : undefined,
                                  letterSpacing: seg.letterSpacing ? `${seg.letterSpacing}em` : undefined,
                                  backgroundColor: seg.backgroundColor || undefined,
                                  padding: seg.backgroundColor ? '0 4px' : undefined,
                                  borderRadius: seg.backgroundColor ? '4px' : undefined,
                                }}
                              >
                                {seg.text}
                              </span>
                            );
                          })
                        ) : (
                          <span className="whitespace-pre-line break-words max-w-full">
                            {line.text}
                          </span>
                        )}

                        {lineIdx === 0 && profile.pronouns && (
                          <span className="text-[11px] font-normal opacity-70 px-2 py-0.5 rounded-full border border-current align-middle shrink-0 ml-1">
                            {profile.pronouns}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <h1
                  className={`tracking-tight flex flex-wrap items-center gap-1.5 justify-center leading-tight whitespace-pre-line text-center ${
                    !profile.nameFontSize ? 'text-2xl @sm:text-3xl font-extrabold' : ''
                  }`}
                  style={{
                    fontFamily:
                      profile.nameFontFamily && profile.nameFontFamily !== 'inherit'
                        ? profile.nameFontFamily
                        : theme.fontHeading,
                    fontSize: profile.nameFontSize ? `${profile.nameFontSize}px` : undefined,
                    fontWeight:
                      profile.nameFontWeight === 'normal'
                        ? 400
                        : profile.nameFontWeight === 'medium'
                        ? 500
                        : profile.nameFontWeight === 'semibold'
                        ? 600
                        : profile.nameFontWeight === 'extrabold'
                        ? 800
                        : profile.nameFontSize
                        ? 700
                        : undefined,
                    color: profile.nameColor || theme.textColor,
                  }}
                >
                  <span className="whitespace-pre-line break-words max-w-full">
                    {profile.name || 'Nome da Empresa'}
                  </span>
                  {profile.pronouns && (
                    <span className="text-[11px] font-normal opacity-70 px-2 py-0.5 rounded-full border border-current align-middle shrink-0">
                      {profile.pronouns}
                    </span>
                  )}
                </h1>
              )}

              {/* Optional dedicated 2nd line / Subtitle (if not using nameLines) */}
              {!profile.nameLines?.length && profile.nameSubtitle && (
                <p
                  className="mt-1 font-medium tracking-normal text-center opacity-85 leading-snug whitespace-pre-line break-words max-w-full"
                  style={{
                    fontFamily: theme.fontBody,
                    fontSize: profile.nameSubtitleFontSize ? `${profile.nameSubtitleFontSize}px` : '13px',
                    color: profile.nameSubtitleColor || theme.textSecondaryColor,
                  }}
                >
                  {profile.nameSubtitle}
                </p>
              )}
            </div>
          )}

          {/* Unified Subtitle Context Line (@handle • Location • Status) */}
          {((profile.showHandle !== false && profile.handle) ||
            (profile.showLocation !== false && profile.location) ||
            businessInfo?.isOpenNow ||
            (profile.showBadge !== false && profile.badgeText)) && (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-1 text-xs font-medium opacity-85">
              {profile.showHandle !== false && profile.handle && (
                <span className="font-mono" style={{ color: theme.textSecondaryColor }}>
                  {profile.handle}
                </span>
              )}

              {profile.showLocation !== false && profile.location && (
                <>
                  {profile.showHandle !== false && profile.handle && <span className="opacity-40">•</span>}
                  <span className="flex items-center gap-1 opacity-80" style={{ color: theme.textSecondaryColor }}>
                    <MapPin className="w-3 h-3 text-sky-400" />
                    {profile.location}
                  </span>
                </>
              )}

              {businessInfo?.isOpenNow && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aberto
                  </span>
                </>
              )}

              {profile.showBadge !== false && profile.badgeText && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${theme.accentColor}20`,
                    color: theme.accentColor,
                    border: `1px solid ${theme.accentColor}50`,
                  }}
                >
                  {profile.badgeText}
                </span>
              )}
            </div>
          )}

          {/* TAGLINE (se presente) */}
          {profile.showTagline !== false && businessInfo?.tagline && (
            <p
              className="mt-2 text-xs @sm:text-sm font-medium italic opacity-90 max-w-[380px]"
              style={{ color: theme.accentColor }}
            >
              “{businessInfo.tagline}”
            </p>
          )}

          {/* BIO / DESCRIÇÃO (Clean & Readable) */}
          {profile.showBio !== false && profile.bio && (
            <p
              className="text-sm mt-2 leading-relaxed max-w-[390px] opacity-90 px-1"
              style={{ color: theme.textColor }}
            >
              {profile.bio}
            </p>
          )}

          {/* BADGES / DIFERENCIAIS DA EMPRESA (Apenas se configurado) */}
          {businessInfo?.highlights && businessInfo.highlights.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 max-w-[400px]">
              {businessInfo.highlights.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/20 border border-white/10 flex items-center gap-1 shadow-sm"
                  style={{ color: theme.textColor }}
                >
                  <ShieldCheck className="w-3 h-3" style={{ color: theme.accentColor }} />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          )}

          {/* Informações Extras de Estabelecimento (Horário / CNPJ) */}
          {profile.showOperatingHours !== false && (businessInfo?.operatingHours || businessInfo?.cnpjOrDoc) && (
            <div
              className="mt-2 text-[11px] opacity-75 flex flex-wrap items-center justify-center gap-3"
              style={{ color: theme.textSecondaryColor }}
            >
              {businessInfo.operatingHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{businessInfo.operatingHours}</span>
                </div>
              )}
              {businessInfo.cnpjOrDoc && (
                <div className="flex items-center gap-1 font-mono">
                  <FileCheck className="w-3 h-3 text-sky-400" />
                  <span>{businessInfo.cnpjOrDoc}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Social Icons Bar - Top Position */}
        {profile.showSocials !== false && socialPosition === 'top' && socialLinks.some((s) => s.enabled) && (
          <SocialBarSection config={config} isInteractive={isInteractive} />
        )}

        {/* Dynamic Blocks Container */}
        {(() => {
          const visibleBlocks = blocks.filter(
            (block) => block.enabled && block.status !== 'draft'
          );

          const getBlockAnimation = (index: number) => {
            const anim = theme.blockAnimation || 'slide-up';
            switch (anim) {
              case 'fade-in':
                return {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.35, delay: index * 0.05 },
                };
              case 'bounce':
                return {
                  initial: { opacity: 0, scale: 0.7, y: 35 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.8 },
                  transition: {
                    type: 'spring' as const,
                    damping: 14,
                    stiffness: 260,
                    delay: index * 0.05,
                  },
                };
              case 'zoom-in':
                return {
                  initial: { opacity: 0, scale: 0.85 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.9 },
                  transition: { duration: 0.35, delay: index * 0.05, ease: 'easeOut' as const },
                };
              case 'slide-right':
                return {
                  initial: { opacity: 0, x: -30 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: 30 },
                  transition: { duration: 0.35, delay: index * 0.05, ease: 'easeOut' as const },
                };
              case 'none':
                return {
                  initial: { opacity: 1 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0 },
                };
              case 'slide-up':
              default:
                return {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.95 },
                  transition: { duration: 0.35, delay: index * 0.05, ease: 'easeOut' as const },
                };
            }
          };

          return (
            <div
              className="w-full flex flex-col mt-1 transition-all duration-200 @container"
              style={{
                gap: theme.blockGap !== undefined ? `${theme.blockGap}px` : '14px',
              }}
            >
              <AnimatePresence mode="popLayout">
                {visibleBlocks.map((block, index) => {
                  const animProps = getBlockAnimation(index);
                  return (
                    <motion.div
                      key={block.id}
                      layout
                      initial={animProps.initial}
                      animate={animProps.animate}
                      exit={animProps.exit}
                      transition={animProps.transition}
                      className="w-full"
                    >
                      {renderBlockComponent(block, config, {
                        activeRadiusClass,
                        getCardStyle,
                        copiedPix,
                        openFaq,
                        setOpenFaq,
                        activeGalleryIndex,
                        setActiveGalleryIndex,
                        handleCopyPix,
                        handleBlockAction,
                        setActiveWifiModal,
                        setActivePixModal,
                        slug,
                        isInteractive,
                      })}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {visibleBlocks.length === 0 && (
                <div
                  className={`w-full p-8 text-center border-2 border-dashed ${activeRadiusClass} opacity-60`}
                  style={{
                    borderColor: theme.cardBorder,
                    color: theme.textSecondaryColor,
                    ...getDynamicRadiusStyle(),
                  }}
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Nenhum bloco visível no momento.</p>
                  <p className="text-xs mt-1">Adicione links ou mude os blocos de rascunho para publicado.</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Social Icons Bar - Bottom Position */}
        {profile.showSocials !== false && socialPosition === 'bottom' && socialLinks.some((s) => s.enabled) && (
          <SocialBarSection config={config} isInteractive={isInteractive} />
        )}

        {/* Footer */}
        {(config.showFooter !== false && (config.customFooter || (plan === 'free' && !isAdmin))) && (
          <footer className="w-full text-center pt-6 pb-4 flex flex-col items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity">
            {config.customFooter && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondaryColor }}>
                <span>{config.customFooter}</span>
              </div>
            )}
            {plan === 'free' && !isAdmin && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] opacity-80">Feito com</span>
                <ExibaLogo height={16} size="xs" theme={theme.textColor.toLowerCase().includes('#f') || theme.textColor.toLowerCase().includes('#e') || theme.textColor.toLowerCase().includes('white') ? 'dark' : 'light'} />
              </div>
            )}
          </footer>
        )}
      </div>
      </div>

      {/* Interactive Wi-Fi Connection Modal */}
      <AnimatePresence>
        {activeWifiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl p-6 relative bg-slate-900 border border-white/15 text-white shadow-2xl text-center flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setActiveWifiModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-3">
                <Wifi className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold">Conectar ao Wi-Fi</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Rede do estabelecimento
              </p>

              {/* SSID Info */}
              <div className="w-full mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nome da Rede (SSID)
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{activeWifiModal.networkName || (activeWifiModal as any).ssid || 'Wi-Fi da Loja'}</span>
                </div>
              </div>

              {/* Password Info & 1-Click Copy */}
              <div className="w-full mt-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Senha
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-bold text-sky-400 line-clamp-2">
                    {activeWifiModal.password || 'Sem senha'}
                  </span>
                  {activeWifiModal.password && (
                    <button
                      type="button"
                      onClick={() => handleCopyWifiPassword(activeWifiModal.password)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
                    >
                      {copiedWifi ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar Senha
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code Auto-connect */}
              <div className="w-full mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                <p className="text-[11px] text-slate-300">
                  Ou aponte a câmera do celular para conectar automaticamente:
                </p>
                <div className="p-2 bg-white rounded-xl shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      `WIFI:S:${activeWifiModal.networkName || (activeWifiModal as any).ssid || 'WiFi'};T:${activeWifiModal.encryption || 'WPA'};P:${activeWifiModal.password || ''};;`
                    )}`}
                    alt="QR Code WiFi"
                    className="w-28 h-28"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveWifiModal(null)}
                className="w-full mt-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Pix Modal */}
      {activePixModal && (
        <PixModal
          block={activePixModal}
          onClose={() => setActivePixModal(null)}
          onCopied={(key) => handleCopyPix(key)}
        />
      )}

      {/* Floating Copied Toast */}
      <AnimatePresence>
        {copiedPix && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-emerald-400/50"
          >
            <Check className="w-4 h-4" />
            <span>Chave PIX copiada para a área de transferência!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Social Bar Helper
const SocialBarSection = React.memo(function SocialBarSection({ config, isInteractive }: { config: BioSiteConfig; isInteractive: boolean }) {
  const { socialLinks, theme } = config;
  const activeSocials = socialLinks.filter((s) => s.enabled);

  const getShapeClass = () => {
    switch (theme.socialIconsStyle) {
      case 'circle':
      case 'round':
        return 'rounded-full';
      case 'rounded':
      case 'pills':
        return 'rounded-2xl';
      case 'square':
        return 'rounded-none';
      case 'minimal':
        return 'rounded-xl bg-transparent border-transparent hover:bg-white/10';
      case 'glass':
        return 'rounded-2xl backdrop-blur-md bg-white/15 border-white/20 shadow-sm';
      default:
        return 'rounded-2xl';
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 py-1 w-full">
      {activeSocials.map((link) => {
        const brandConfig = SOCIAL_BRAND_CONFIG[link.platform] || {
          bg: '#475569',
          text: '#ffffff',
          name: link.platform,
          icon: Globe,
        };
        const Icon = brandConfig.icon;

        // Determine icon button Background, Border, and Text Colors with guaranteed high contrast
        let bgColor = link.customColor || theme.cardBg;
        let textColor = link.customTextColor || theme.cardTextColor || '#ffffff';
        let borderColor = link.customBorderColor || theme.cardBorder || 'rgba(255,255,255,0.15)';

        if (link.customColor) {
          bgColor = link.customColor;
          textColor = link.customTextColor || '#ffffff';
        } else if (theme.socialIconsColor === 'brand') {
          bgColor = brandConfig.bg;
          textColor = brandConfig.text;
          borderColor = 'transparent';
        } else if (theme.socialIconsColor === 'accent') {
          bgColor = theme.accentColor;
          textColor = theme.accentTextColor || '#ffffff';
          borderColor = 'transparent';
        } else if (theme.socialIconsColor === 'monochrome') {
          bgColor = theme.cardBg;
          textColor = theme.cardTextColor || '#ffffff';
        } else if (theme.socialIconsColor === 'surface') {
          bgColor = 'rgba(255, 255, 255, 0.15)';
          textColor = theme.textColor || '#ffffff';
          borderColor = 'rgba(255, 255, 255, 0.2)';
        }

        // Handle Minimalist / Glass style overrides
        if (theme.socialIconsStyle === 'minimal') {
          bgColor = 'transparent';
          borderColor = 'transparent';
          if (!link.customTextColor) {
            textColor = theme.socialIconsColor === 'accent' ? theme.accentColor : (theme.textColor || '#ffffff');
          }
        } else if (theme.socialIconsStyle === 'glass') {
          bgColor = link.customColor || 'rgba(255, 255, 255, 0.15)';
          borderColor = link.customBorderColor || 'rgba(255, 255, 255, 0.25)';
          textColor = link.customTextColor || '#ffffff';
        }

        // Safety anti-bug check: if background and icon color are the same or almost same (e.g. red on red), force visible contrast
        if (bgColor && textColor && bgColor.toLowerCase().trim() === textColor.toLowerCase().trim()) {
          textColor = '#ffffff';
        }

        return (
          <a
            key={link.id}
            href={isInteractive ? link.url : '#'}
            target={isInteractive ? '_blank' : undefined}
            rel="noopener noreferrer"
            title={link.label || brandConfig.name || link.platform}
            className={`w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm shrink-0 ${getShapeClass()}`}
            style={{
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: theme.socialIconsStyle === 'minimal' ? '0px' : '1px',
              borderStyle: 'solid',
              color: textColor,
            }}
          >
            <Icon className="w-4 h-4 shrink-0" />
          </a>
        );
      })}
    </div>
  );
});

// Banner Slideshow Helper (Fotos ou Vídeos alternando automaticamente)
function BannerSlideshow({
  urls,
  mediaType,
  intervalSeconds,
  blurPx,
}: {
  urls: string[];
  mediaType: 'image' | 'video';
  intervalSeconds: number;
  blurPx?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (urls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urls.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [urls.length, intervalSeconds]);

  const currentUrl = urls[currentIndex];

  return (
    <AnimatePresence mode="wait">
      {mediaType === 'image' ? (
        <motion.img
          key={currentIndex}
          src={currentUrl}
          alt=""
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover absolute inset-0 z-10"
          style={{
            filter: blurPx ? `blur(${blurPx}px)` : undefined,
          }}
        />
      ) : (
        <motion.video
          key={currentIndex}
          src={currentUrl}
          autoPlay
          muted
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover absolute inset-0 z-10"
          style={{
            filter: blurPx ? `blur(${blurPx}px)` : undefined,
          }}
        />
      )}
    </AnimatePresence>
  );
}


// Block Renderer dispatcher
function renderBlockComponent(
  block: ContentBlock,
  config: BioSiteConfig,
  helpers: {
    activeRadiusClass: string;
    getCardStyle: () => string;
    copiedPix: string | null;
    openFaq: Record<string, boolean>;
    setOpenFaq: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    activeGalleryIndex: Record<string, number>;
    setActiveGalleryIndex: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    handleCopyPix: (key: string, e?: React.MouseEvent) => void;
    handleBlockAction: (e: React.MouseEvent, block: ContentBlock, url?: string) => void;
    setActiveWifiModal: React.Dispatch<React.SetStateAction<WifiBlock | null>>;
    setActivePixModal: React.Dispatch<React.SetStateAction<PixBlock | null>>;
    isInteractive: boolean;
    slug?: string;
  }
) {
  const { theme } = config;
  const {
    activeRadiusClass,
    getCardStyle,
    copiedPix,
    openFaq,
    setOpenFaq,
    activeGalleryIndex,
    setActiveGalleryIndex,
    handleCopyPix,
    handleBlockAction,
    setActiveWifiModal,
    setActivePixModal,
    isInteractive,
    slug,
  } = helpers;

  const getDynamicRadiusStyle = (): React.CSSProperties => {
    if (theme.borderRadiusValue !== undefined) {
      if (theme.borderRadiusValue >= 36) return { borderRadius: '9999px' };
      return { borderRadius: `${theme.borderRadiusValue}px` };
    }
    switch (theme.borderRadius) {
      case 'none': return { borderRadius: '0px' };
      case 'sm': return { borderRadius: '8px' };
      case 'md': return { borderRadius: '16px' };
      case 'lg': return { borderRadius: '24px' };
      case 'full': return { borderRadius: '9999px' };
      default: return { borderRadius: '16px' };
    }
  };

  const getDynamicPaddingStyle = (): React.CSSProperties => {
    if (theme.blockPadding !== undefined) {
      return { padding: `${theme.blockPadding}px` };
    }
    return {};
  };

  const getBlockCardStyle = (b: ContentBlock): React.CSSProperties => {
    return {
      backgroundColor: b.customColor || theme.cardBg,
      borderColor: b.customBorderColor || theme.cardBorder,
      color: b.customTextColor || theme.cardTextColor,
      ...getDynamicRadiusStyle(),
      ...getDynamicPaddingStyle(),
    };
  };

  const cardBaseStyle: React.CSSProperties = {
    backgroundColor: block.customColor || theme.cardBg,
    borderColor: block.customBorderColor || theme.cardBorder,
    color: block.customTextColor || theme.cardTextColor,
    ...getDynamicRadiusStyle(),
    ...getDynamicPaddingStyle(),
  };

  // Animation pulse / shine / glow / wobble / bounce class for link buttons
  const getAnimationClass = (anim?: string) => {
    if (anim === 'pulse') return 'btn-effect-pulse';
    if (anim === 'bounce') return 'btn-effect-bounce';
    if (anim === 'glow') return 'btn-effect-glow';
    if (anim === 'shimmer') return 'btn-effect-shimmer';
    if (anim === 'wobble') return 'btn-effect-wobble';
    return '';
  };

  switch (block.type) {
    case 'schedule': {
      const sch = block as ScheduleBlock;
      const btnBg = sch.customButtonColor || theme.accentColor;
      const btnText = sch.customButtonTextColor || theme.accentTextColor;

      if (sch.platform === 'native' && slug) {
        return <NativeScheduleBlock slug={slug} title={sch.title} subtitle={sch.subtitle} theme={theme} />;
      }

      return (
        <a
          href={isInteractive ? sch.bookingUrl : '#'}
          target={isInteractive ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => handleBlockAction(e, sch, sch.bookingUrl)}
          className={`w-full p-4 ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            sch.animation
          )} ${sch.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} flex flex-col items-stretch justify-between gap-3.5 shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer group`}
          style={cardBaseStyle}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
              style={{
                backgroundColor: sch.customIconBgColor || `${sch.customIconColor ? `${sch.customIconColor}25` : `${theme.accentColor}25`}`,
                color: sch.customIconColor || theme.accentColor,
                border: `1px solid ${sch.customIconColor || theme.accentColor}40`,
              }}
            >
              {renderDynamicIcon(sch.icon || 'Calendar', 'w-5 h-5')}
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className="font-bold text-sm @sm:text-base leading-tight line-clamp-2"
                  style={{ fontFamily: theme.fontHeading, color: sch.customTextColor || theme.cardTextColor }}
                >
                  {sch.title || 'Agendar Consulta / Horário'}
                </h4>
                {sch.badge && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${theme.accentColor}25`,
                      color: theme.accentColor,
                      border: `1px solid ${theme.accentColor}40`,
                    }}
                  >
                    {sch.badge}
                  </span>
                )}
                {sch.priceText && (
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  >
                    {sch.priceText}
                  </span>
                )}
              </div>
              {sch.subtitle && (
                <p
                  className="text-xs opacity-85 mt-0.5 line-clamp-2"
                  style={{ color: sch.customTextColor || theme.textSecondaryColor }}
                >
                  {sch.subtitle}
                </p>
              )}
              {sch.durationText && (
                <p className="text-[11px] opacity-80 flex items-center gap-1.5 mt-1 font-mono" style={{ color: sch.customTextColor || undefined }}>
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Duração: {sch.durationText}</span>
                </p>
              )}
            </div>
          </div>

          <div className="w-full flex items-center justify-end gap-2 pt-2 border-t border-white/10 shrink-0">
            <button
              type="button"
              className="w-full min-h-11 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all group-hover:shadow-md"
              style={{
                backgroundColor: btnBg,
                color: btnText,
              }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{sch.buttonText || 'Agendar Horário'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </a>
      );
    }

    case 'google_review': {
      const rev = block as GoogleReviewBlock;
      const revBg = resolveBlockColor(rev, theme.accentColor);
      const revText = resolveBlockTextColor(rev, theme.accentTextColor, revBg);
      return (
        <a
          href={isInteractive ? rev.reviewUrl : '#'}
          target={isInteractive ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => handleBlockAction(e, rev, rev.reviewUrl)}
          className={`w-full p-3.5 @sm:p-4 ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            rev.animation
          )} ${rev.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} flex items-center justify-between gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer`}
          style={{
            ...cardBaseStyle,
            backgroundColor: revBg,
            color: revText,
            borderColor: rev.customBorderColor || (rev.featured ? theme.accentColor : 'transparent'),
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: rev.customIconBgColor || 'rgba(255, 255, 255, 0.2)',
                color: rev.customIconColor || 'inherit',
              }}
            >
              {renderDynamicIcon(rev.icon || 'Star', 'w-5 h-5 fill-current')}
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm @sm:text-base leading-tight line-clamp-2" style={{ color: revText }}>
                  {rev.title || 'Avaliar no Google'}
                </h4>
                {rev.badge && (
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 bg-white/20 text-white"
                  >
                    {rev.badge}
                  </span>
                )}
              </div>
              {rev.ratingText && (
                <p className="text-xs opacity-90 line-clamp-2 mt-0.5" style={{ color: revText }}>{rev.ratingText}</p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0 opacity-80" style={{ color: revText }} />
        </a>
      );
    }

    case 'wifi': {
      const wifi = block as WifiBlock;
      return (
        <button
          type="button"
          onClick={(e) => {
            handleBlockAction(e, wifi);
            if (isInteractive) {
              setActiveWifiModal(wifi);
            }
          }}
          className={`w-full p-3.5 @sm:p-4 ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            wifi.animation
          )} ${wifi.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} flex items-center justify-between gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer text-left`}
          style={{
            ...cardBaseStyle,
            backgroundColor: resolveBlockColor(wifi, theme.accentColor),
            color: wifi.customTextColor || theme.accentTextColor,
            borderColor: wifi.customBorderColor || (wifi.featured ? theme.accentColor : 'transparent'),
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: wifi.customIconBgColor || 'rgba(255, 255, 255, 0.2)',
                color: wifi.customIconColor || 'inherit',
              }}
            >
              {renderDynamicIcon(wifi.icon || 'Wifi', 'w-5 h-5')}
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm @sm:text-base leading-tight line-clamp-2" style={{ color: wifi.customTextColor || theme.accentTextColor }}>
                  {wifi.title || 'WiFi'}
                </h4>
                {wifi.badge && (
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 bg-white/20 text-white"
                  >
                    {wifi.badge}
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 line-clamp-2 mt-0.5" style={{ color: wifi.customTextColor || theme.accentTextColor }}>
                Toque para ver a senha e conectar
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0 opacity-80" style={{ color: wifi.customTextColor || theme.accentTextColor }} />
        </button>
      );
    }

    case 'link': {
      const link = block as LinkBlock;
      return (
        <a
          href={isInteractive ? link.url : '#'}
          target={isInteractive ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => handleBlockAction(e, link, link.url)}
          className={`block w-full p-4 ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            link.animation
          )} ${link.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'}`}
          style={{
            ...cardBaseStyle,
            borderColor: link.featured ? (link.customBorderColor || theme.accentColor) : (link.customBorderColor || theme.cardBorder),
            backgroundColor: link.customColor || theme.cardBg,
            color: link.customTextColor || theme.cardTextColor,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {link.icon && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: link.customIconBgColor || `${link.customIconColor ? `${link.customIconColor}20` : `${theme.accentColor}20`}`,
                    color: link.customIconColor || theme.accentColor,
                  }}
                >
                  {renderDynamicIcon(link.icon, 'w-5 h-5')}
                </div>
              )}
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm @sm:text-base leading-tight line-clamp-2">
                    {link.title || 'Link'}
                  </span>
                  {link.badge && (
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: theme.accentColor,
                        color: theme.accentTextColor,
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </div>
                {link.subtitle && (
                  <p
                    className="text-xs mt-1 line-clamp-2"
                    style={{ color: theme.cardSubtextColor }}
                  >
                    {link.subtitle}
                  </p>
                )}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100" />
          </div>
        </a>
      );
    }

    case 'bento': {
      const bento = block as BentoBlock;
      return (
        <div
          className={`grid gap-3 w-full ${
            bento.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
          } ${getAnimationClass(bento.animation)}`}
        >
          {bento.items.map((item) => (
            <a
              key={item.id}
              href={isInteractive ? item.url : '#'}
              target={isInteractive ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={(e) => handleBlockAction(e, bento, item.url)}
              className={`p-3.5 border flex flex-col justify-between ${activeRadiusClass} ${getCardStyle()} ${bento.featured ? 'border-2 ring-2 ring-sky-400/40' : ''}`}
              style={cardBaseStyle}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                {item.icon ? (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: item.customIconBgColor || `${item.customIconColor ? `${item.customIconColor}20` : `${theme.accentColor}20`}`,
                      color: item.customIconColor || theme.accentColor,
                    }}
                  >
                    {renderDynamicIcon(item.icon, 'w-4 h-4')}
                  </div>
                ) : (
                  <Sparkles className="w-4 h-4 opacity-50" />
                )}
                {item.badge && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: theme.accentTextColor,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-xs leading-snug line-clamp-2">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p
                    className="text-[11px] mt-0.5 line-clamp-2"
                    style={{ color: theme.cardSubtextColor }}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      );
    }

    case 'product': {
      const prod = block as ProductBlock;
      const defaultWhatsappNumber = (() => {
        const wa = config.socialLinks?.find((s) => s.platform === 'whatsapp' && s.enabled);
        if (wa?.url) {
          const m = String(wa.url).match(/(\d{10,15})/);
          if (m) return m[1];
        }
        const waBlock: any = config.blocks?.find((b: any) => b.type === 'whatsapp');
        if (waBlock?.phoneNumber) {
          const m = String(waBlock.phoneNumber).match(/(\d{10,15})/);
          if (m) return m[1];
        }
        return '';
      })();
      return (
        <ProductCardRenderer
          block={prod}
          theme={theme}
          cardBaseStyle={cardBaseStyle}
          activeRadiusClass={activeRadiusClass}
          getCardStyle={getCardStyle}
          getAnimationClass={getAnimationClass}
          isInteractive={isInteractive}
          handleBlockAction={handleBlockAction}
          renderDynamicIcon={renderDynamicIcon}
          defaultWhatsappNumber={defaultWhatsappNumber}
        />
      );
    }

    case 'pix': {
      const pix = block as PixBlock;
      const pixBg = resolveBlockColor(pix, theme.accentColor);
      const pixText = resolveBlockTextColor(pix, theme.accentTextColor, pixBg);

      if (pix.displayStyle === 'button') {
        return (
          <button
            type="button"
            onClick={(e) => {
              handleBlockAction(e, pix);
              if (isInteractive) {
                setActivePixModal(pix);
              }
            }}
            className={`w-full p-3.5 @sm:p-4 ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
              pix.animation
            )} ${pix.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} flex items-center justify-between gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer text-left`}
            style={{
              ...cardBaseStyle,
              backgroundColor: pixBg,
              color: pixText,
              borderColor: pix.customBorderColor || 'transparent',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: pix.customIconBgColor || 'rgba(255, 255, 255, 0.2)',
                  color: pix.customIconColor || 'inherit',
                }}
              >
                {renderDynamicIcon(pix.icon || 'QrCode', 'w-5 h-5')}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm @sm:text-base leading-tight line-clamp-2">
                    {pix.title || 'Chave Pix'}
                  </h4>
                  {pix.badge && (
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 bg-white/20 text-white"
                    >
                      {pix.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-90 line-clamp-2 mt-0.5">
                  {pix.recipientName ? `Titular: ${pix.recipientName}` : 'Toque para copiar a chave ou ver QR Code'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0 opacity-80" />
          </button>
        );
      }

      return (
        <div
          className={`p-4 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            pix.animation
          )} ${pix.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'}`}
          style={cardBaseStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: pix.customIconBgColor || '#32BCAD25',
                  color: pix.customIconColor || '#32BCAD',
                }}
              >
                {pix.icon ? renderDynamicIcon(pix.icon, 'w-4 h-4') : 'PIX'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm">{pix.title || 'Apoie via PIX'}</h4>
                  {pix.badge && (
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 bg-emerald-500/20 text-emerald-400"
                    >
                      {pix.badge}
                    </span>
                  )}
                </div>
                {pix.recipientName && (
                  <p className="text-[11px] opacity-75">{pix.recipientName}</p>
                )}
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {pix.pixKeyType.toUpperCase()}
            </span>
          </div>

          {pix.description && (
            <p
              className="text-xs mt-2.5"
              style={{ color: theme.cardSubtextColor }}
            >
              {pix.description}
            </p>
          )}

          {pix.suggestedAmounts && pix.suggestedAmounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {pix.suggestedAmounts.map((amt, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-black/20 border border-white/10"
                >
                  {amt}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
            <input
              type="text"
              readOnly
              value={pix.pixKey}
              className="bg-transparent text-xs font-mono w-full focus:outline-none select-all px-1 text-slate-200"
            />
            <button
              type="button"
              onClick={(e) => handleCopyPix(pix.pixKey, e)}
              className="px-3 min-h-11 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow"
              style={{
                backgroundColor: pixBg,
                color: pixText,
              }}
            >
              {copiedPix === pix.pixKey ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar PIX
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    case 'whatsapp': {
      const wa = block as WhatsAppBlock;
      const cleanPhone = wa.phoneNumber.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(wa.defaultMessage || 'Olá!');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

      return (
        <a
          href={isInteractive ? waUrl : '#'}
          target={isInteractive ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => handleBlockAction(e, wa, waUrl)}
          className={`p-4 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            wa.animation
          )} ${wa.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} block`}
          style={cardBaseStyle}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: wa.customIconBgColor || (wa.customColor ? 'rgba(255,255,255,0.2)' : 'rgba(37, 211, 102, 0.2)'),
                  color: wa.customIconColor || (wa.customTextColor || '#25D366'),
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {wa.icon ? renderDynamicIcon(wa.icon, 'w-5 h-5') : <WhatsAppBrandIcon className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm leading-tight line-clamp-2" style={{ color: wa.customTextColor || theme.cardTextColor }}>
                    {wa.title || 'Conversar no WhatsApp'}
                  </h4>
                  {wa.badge && (
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 bg-emerald-500 text-white"
                    >
                      {wa.badge}
                    </span>
                  )}
                </div>
                {wa.subtitle && (
                  <p className="text-xs mt-0.5 opacity-85 line-clamp-2" style={{ color: wa.customTextColor || theme.cardSubtextColor }}>
                    {wa.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="w-full mt-3 min-h-11 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98]"
            style={{
              backgroundColor: wa.customButtonColor || BLOCK_DEFAULT_COLORS.whatsapp || theme.accentColor,
              color: wa.customButtonTextColor || '#ffffff',
            }}
          >
            <WhatsAppBrandIcon className="w-4 h-4" />
            {wa.buttonText || 'Enviar Mensagem no WhatsApp'}
          </button>
        </a>
      );
    }

    case 'countdown': {
      const cd = block as CountdownBlock;
      return (
        <CountdownCard
          countdown={cd}
          config={config}
          cardBaseStyle={cardBaseStyle}
          activeRadiusClass={activeRadiusClass}
          getCardStyle={getCardStyle}
          isInteractive={isInteractive}
          handleBlockAction={handleBlockAction}
        />
      );
    }

    case 'faq': {
      const faq = block as FaqBlock;
      return (
        <div
          className={`p-4 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            faq.animation
          )} ${faq.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} space-y-2`}
          style={cardBaseStyle}
        >
          {faq.title && (
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: faq.customTextColor || undefined }}>
                {faq.icon ? renderDynamicIcon(faq.icon, 'w-4 h-4', { color: faq.customIconColor }) : <Sparkles className="w-4 h-4 shrink-0" style={{ color: theme.accentColor }} />}
                {faq.title}
              </h4>
              {faq.badge && (
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.accentTextColor,
                  }}
                >
                  {faq.badge}
                </span>
              )}
            </div>
          )}
          {faq.items.map((item) => {
            const isOpen = !!openFaq[item.id];
            return (
              <div
                key={item.id}
                className="border-b border-white/10 last:border-none pb-2 last:pb-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className="w-full py-1.5 flex items-center justify-between text-left gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <span className="line-clamp-2" style={{ color: faq.customTextColor || undefined }}>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 shrink-0 opacity-60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 0.9 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-xs pt-1 pb-2 leading-relaxed"
                      style={{ color: theme.cardSubtextColor }}
                    >
                      {item.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      );
    }

    case 'video': {
      const video = block as VideoBlock;
      let embedSrc = video.videoUrl;
      if (video.videoUrl.includes('youtube.com/watch?v=')) {
        const id = video.videoUrl.split('v=')[1]?.split('&')[0];
        embedSrc = `https://www.youtube.com/embed/${id}`;
      } else if (video.videoUrl.includes('youtu.be/')) {
        const id = video.videoUrl.split('youtu.be/')[1]?.split('?')[0];
        embedSrc = `https://www.youtube.com/embed/${id}`;
      }

      return (
        <div
          className={`p-3.5 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            video.animation
          )} ${video.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'}`}
          style={cardBaseStyle}
        >
          {video.title && (
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h4 className="font-bold text-xs flex items-center gap-1.5" style={{ color:video.customTextColor || undefined }}>
                {video.icon ? renderDynamicIcon(video.icon, 'w-4 h-4 shrink-0') : <Youtube className="w-4 h-4 text-red-500 shrink-0" />}
                {video.title}
              </h4>
              {video.badge && (
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.accentTextColor,
                  }}
                >
                  {video.badge}
                </span>
              )}
            </div>
          )}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40">
            <iframe
              src={embedSrc}
              title={video.title || 'Video Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {video.caption && (
            <p className="text-[11px] mt-2 text-center line-clamp-2" style={{ color: theme.cardSubtextColor }}>
              {video.caption}
            </p>
          )}
        </div>
      );
    }

    case 'audio': {
      const audio = block as AudioBlock;
      return (
        <div
          className={`p-3.5 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            audio.animation
          )} ${audio.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'}`}
          style={cardBaseStyle}
        >
          {audio.title && (
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-bold text-xs flex items-center gap-1.5" style={{ color:audio.customTextColor || undefined }}>
                {audio.icon ? renderDynamicIcon(audio.icon, 'w-4 h-4 shrink-0') : <Music className="w-4 h-4 text-emerald-400 shrink-0" />}
                {audio.title}
              </h4>
              {audio.badge && (
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.accentTextColor,
                  }}
                >
                  {audio.badge}
                </span>
              )}
            </div>
          )}
          <iframe
            src={audio.embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
          {audio.caption && (
            <p className="text-[11px] mt-2 text-center line-clamp-2" style={{ color: theme.cardSubtextColor }}>
              {audio.caption}
            </p>
          )}
        </div>
      );
    }

    case 'text': {
      const text = block as TextBlock;
      return (
        <div
          className={`p-4 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
            text.animation
          )} ${text.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} ${
            text.alignment === 'center'
              ? 'text-center'
              : text.alignment === 'right'
              ? 'text-right'
              : 'text-left'
          }`}
          style={{
            ...cardBaseStyle,
            borderColor: text.featured ? (text.customBorderColor || theme.accentColor) : text.highlight ? theme.accentColor : (text.customBorderColor || theme.cardBorder),
            backgroundColor: text.customColor || (text.highlight ? `${theme.accentColor}10` : theme.cardBg),
            color: text.customTextColor || theme.textColor,
          }}
        >
          {text.title && (
            <div className={`flex items-center gap-2 mb-1.5 ${text.alignment === 'center' ? 'justify-center' : text.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
              {text.icon && renderDynamicIcon(text.icon, 'w-4 h-4', { color: text.customIconColor })}
              <h4 className="font-bold text-sm line-clamp-2" style={{ color: text.customTextColor || theme.textColor }}>
                {text.title}
              </h4>
              {text.badge && (
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: theme.accentColor,
                    color: theme.accentTextColor,
                  }}
                >
                  {text.badge}
                </span>
              )}
            </div>
          )}
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: text.customTextColor || theme.cardSubtextColor }}>
            {text.content}
          </p>
        </div>
      );
    }

    case 'gallery': {
      const gallery = block as GalleryBlock;
      return (
        <GalleryCardRenderer
          block={gallery}
          theme={theme}
          cardBaseStyle={cardBaseStyle}
          activeRadiusClass={activeRadiusClass}
          getCardStyle={getCardStyle}
          getAnimationClass={getAnimationClass}
          isInteractive={isInteractive}
          handleBlockAction={handleBlockAction}
        />
      );
    }

    default:
      return null;
  }
}

// Countdown Card component with live ticker
function CountdownCard({
  countdown,
  config,
  cardBaseStyle,
  activeRadiusClass,
  getCardStyle,
  isInteractive,
  handleBlockAction,
}: {
  countdown: CountdownBlock;
  config: BioSiteConfig;
  cardBaseStyle: React.CSSProperties;
  activeRadiusClass: string;
  getCardStyle: () => string;
  isInteractive: boolean;
  handleBlockAction: (e: React.MouseEvent, block: ContentBlock, url?: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number; expired: boolean }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(countdown.targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [countdown.targetDate]);

  return (
    <div
      className={`p-4 border ${activeRadiusClass} ${getCardStyle()} text-center`}
      style={cardBaseStyle}
    >
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-1" style={{ color: config.theme.accentColor }}>
        <Clock className="w-3.5 h-3.5" />
        <span>{countdown.title || 'Contagem Regressiva'}</span>
      </div>
      {countdown.subtitle && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: config.theme.cardSubtextColor }}>
          {countdown.subtitle}
        </p>
      )}

      {timeLeft.expired ? (
        <div className="py-2 text-xs font-semibold text-emerald-400">
          {countdown.expiredMessage || '🎉 Evento iniciado!'}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 my-2">
          {[
            { label: 'DIAS', val: timeLeft.d },
            { label: 'HORAS', val: timeLeft.h },
            { label: 'MIN', val: timeLeft.m },
            { label: 'SEG', val: timeLeft.s },
          ].map((item, i) => (
            <div
              key={i}
              className="p-2 rounded-xl bg-black/25 border border-white/10 flex flex-col items-center"
            >
              <span className="text-base font-bold font-mono">{item.val.toString().padStart(2, '0')}</span>
              <span className="text-[9px] opacity-60 tracking-wider font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {countdown.buttonText && countdown.buttonUrl && (
        <a
          href={isInteractive ? countdown.buttonUrl : '#'}
          target={isInteractive ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => handleBlockAction(e, countdown, countdown.buttonUrl)}
          className="w-full mt-3 min-h-11 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-transform active:scale-95 shadow"
          style={{
            backgroundColor: config.theme.accentColor,
            color: config.theme.accentTextColor,
          }}
        >
          {countdown.buttonText}
        </a>
      )}
    </div>
  );
}

export const BioSiteRenderer = React.memo(BioSiteRendererComponent);
