export type BlockType =
  | 'link'
  | 'schedule'
  | 'bento'
  | 'video'
  | 'audio'
  | 'product'
  | 'pix'
  | 'whatsapp'
  | 'google_review'
  | 'wifi'
  | 'countdown'
  | 'faq'
  | 'text'
  | 'gallery';

export type CardStyle =
  | 'flat'
  | 'glass'
  | 'brutalist'
  | 'soft-shadow'
  | 'outline'
  | 'gradient-border';

export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'glow' | 'shimmer' | 'wobble';

export type BlockAnimation = 'slide-up' | 'fade-in' | 'bounce' | 'zoom-in' | 'slide-right' | 'none';

export type SocialPlatform =
  | 'instagram'
  | 'whatsapp'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'spotify'
  | 'twitch'
  | 'discord'
  | 'telegram'
  | 'pinterest'
  | 'snapchat'
  | 'kwai'
  | 'email'
  | 'threads'
  | 'behance'
  | 'dribbble'
  | 'website'
  | 'phone';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label?: string;
  enabled: boolean;
  customColor?: string;
  customTextColor?: string;
  customBorderColor?: string;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  status?: 'published' | 'draft';
  title?: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
  animation?: ButtonAnimation;
  featured?: boolean;
  customColor?: string;
  customTextColor?: string;
  customBorderColor?: string;
  customIconColor?: string;
  customIconBgColor?: string;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  badge?: string;
  animation?: ButtonAnimation;
  featured?: boolean;
}

export interface ScheduleBlock extends BaseBlock {
  type: 'schedule';
  title: string;
  subtitle?: string;
  bookingUrl: string;
  platform?: 'calendly' | 'google_calendar' | 'cal_com' | 'tidycal' | 'youcanbookme' | 'whatsapp' | 'generic' | 'native';
  badge?: string;
  buttonText?: string;
  durationText?: string;
  priceText?: string;
  customButtonColor?: string;
  customButtonTextColor?: string;
}

export interface BentoItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  badge?: string;
  image?: string;
  customIconColor?: string;
  customIconBgColor?: string;
}

export interface BentoBlock extends BaseBlock {
  type: 'bento';
  title?: string;
  subtitle?: string;
  items: BentoItem[];
  columns: 2 | 3;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  title?: string;
  videoUrl: string; // YouTube / Vimeo
  caption?: string;
}

export interface AudioBlock extends BaseBlock {
  type: 'audio';
  title?: string;
  embedUrl: string; // Spotify / SoundCloud
  caption?: string;
}

export interface ProductMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  alt?: string;
}

export interface ProductBlock extends BaseBlock {
  type: 'product';
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string; // fallback/single legacy image
  media?: ProductMediaItem[]; // Carrossel de fotos e vídeos do produto/serviço
  autoPlayCarousel?: boolean; // Rotação automática de slides
  url: string;
  buttonText: string;
  badge?: string;
  layoutStyle?: 'card' | 'compact';
  whatsappNumber?: string; // número alternativo para "comprar via WhatsApp"
  enableWhatsappBuy?: boolean; // ativa o botão "Comprar via WhatsApp"
}

export interface PixBlock extends BaseBlock {
  type: 'pix';
  title: string;
  description?: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  recipientName: string;
  suggestedAmounts?: string[];
  displayStyle?: 'card' | 'button'; // Card aberto ou botão compacto com seta
}

export interface GoogleReviewBlock extends BaseBlock {
  type: 'google_review';
  title: string;
  subtitle?: string;
  reviewUrl: string; // Link direto do Google Meu Negócio / Maps para avaliar
  ratingText?: string; // Ex: '5.0 ⭐⭐⭐⭐⭐'
  buttonText?: string;
}

export interface WifiBlock extends BaseBlock {
  type: 'wifi';
  title: string; // Ex: 'WiFi' ou 'Conectar ao WiFi'
  networkName: string; // SSID da rede
  password: string; // Senha da rede
  securityType?: 'WPA' | 'WEP' | 'nopass';
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface WhatsAppBlock extends BaseBlock {
  type: 'whatsapp';
  title: string;
  subtitle?: string;
  phoneNumber: string;
  defaultMessage: string;
  buttonText: string;
  customButtonColor?: string;
  customButtonTextColor?: string;
}

export interface CountdownBlock extends BaseBlock {
  type: 'countdown';
  title: string;
  subtitle?: string;
  targetDate: string; // ISO date string
  expiredMessage?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBlock extends BaseBlock {
  type: 'faq';
  title?: string;
  items: FaqItem[];
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  title?: string;
  content: string;
  alignment: 'left' | 'center' | 'right';
  highlight: boolean;
}

export interface GalleryItem {
  id: string;
  type?: 'image' | 'video';
  url: string;
  imageUrl?: string; // Backward compatibility
  title?: string;
  caption?: string;
  category?: string;
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  title?: string;
  subtitle?: string;
  items: GalleryItem[];
  layout?: 'grid-2' | 'grid-3' | 'carousel' | 'masonry' | 'stacked' | 'grid';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  showCaptions?: boolean;
  autoPlayCarousel?: boolean;
  enableLightbox?: boolean;
  showCategoriesFilter?: boolean;
}

export type ContentBlock =
  | LinkBlock
  | ScheduleBlock
  | BentoBlock
  | VideoBlock
  | AudioBlock
  | ProductBlock
  | PixBlock
  | WhatsAppBlock
  | GoogleReviewBlock
  | WifiBlock
  | CountdownBlock
  | FaqBlock
  | TextBlock
  | GalleryBlock;

export interface HeaderBannerConfig {
  enabled: boolean;
  type: 'image' | 'video' | 'gradient' | 'slideshow-images' | 'slideshow-videos';
  url: string; // Image URL or Video URL (MP4, WebM)
  slideshowUrls?: string[]; // Lista de URLs quando type = slideshow-images ou slideshow-videos
  slideshowInterval?: number; // Segundos entre cada troca (padrão: 5)
  height: 'compact' | 'medium' | 'tall' | 'hero';
  overlayOpacity: number; // 0 to 100
  overlayBlur: number; // 0 to 20
  videoMuted: boolean;
  videoLoop: boolean;
}

export interface BusinessInfo {
  tagline?: string; // Proposta de valor em destaque
  highlights?: string[]; // Badges/diferenciais da empresa (ex: 'Atendimento 24h', 'Frete Grátis')
  operatingHours?: string; // Ex: 'Seg a Sex: 08h às 18h'
  isOpenNow?: boolean;
  cnpjOrDoc?: string; // Ex: 'CNPJ: 00.000.000/0001-00'
  addressDetail?: string; // Endereço físico completo
}

export interface TextSegmentStyle {
  id?: string;
  text: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  italic?: boolean;
  uppercase?: boolean;
  underline?: boolean;
  letterSpacing?: number; // em ou px
  backgroundColor?: string; // fundo ou highlight
  borderRadius?: number;
}

export interface ProfileLineConfig {
  id: string;
  text: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  italic?: boolean;
  uppercase?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  backgroundColor?: string;
  segments?: TextSegmentStyle[];
}

export interface ProfileConfig {
  avatarUrl: string;
  name: string;
  handle: string;
  bio: string;
  location?: string;
  verified: boolean;
  badgeText?: string;
  pronouns?: string;
  avatarStyle: 'circle' | 'rounded' | 'squircle' | 'square' | 'ring';
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl';
  avatarBorder?: boolean; // Toggle de moldura/borda
  avatarBorderColor?: string; // Cor da borda (ex: '#ffffff')
  avatarBorderWidth?: number; // Espessura em px (2, 3, 4, etc)

  // Tipografia & Estilo do Nome / Título
  nameFontSize?: number; // Tamanho da fonte do nome em px (ex: 18 a 42)
  nameFontFamily?: string; // Fonte específica do nome (ex: 'Playfair Display', 'Poppins', 'Syne', etc) ou 'inherit'
  nameFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'; // Peso da fonte
  nameColor?: string; // Cor personalizada do nome (ou herda do tema)
  nameSubtitle?: string; // Segunda linha / Cargo / Especialidade opcional
  nameSubtitleFontSize?: number; // Tamanho da segunda linha em px (ex: 12 a 20)
  nameSubtitleColor?: string; // Cor da segunda linha

  // Formatação Avançada e Individual de Frases / Palavras
  nameLines?: ProfileLineConfig[]; // Configuração estruturada por frases/linhas com estilos individuais
  nameFormatted?: string; // HTML formatado com spans de estilos personalizados (para renderização rica)
  
  // SEO & Meta Tags (Otimização para Buscas e Compartilhamento)
  seoTitle?: string; // Título da página exibido na aba do navegador e no Google
  seoDescription?: string; // Meta description para motores de busca e compartilhamento
  seoKeywords?: string; // Palavras-chave para indexação (separadas por vírgula)
  seoOgImage?: string; // Imagem de compartilhamento para redes sociais (OG Image / WhatsApp preview)
  
  // Toggles individuais de ativação/desativação
  showAvatar?: boolean;
  showName?: boolean;
  showHandle?: boolean;
  showBio?: boolean;
  showLocation?: boolean;
  showBadge?: boolean;
  showVerified?: boolean;
  showTagline?: boolean;
  showOperatingHours?: boolean;
  showSocials?: boolean;
  showFooter?: boolean;

  banner?: HeaderBannerConfig;
  businessInfo?: BusinessInfo;
}

export type BackgroundType = 'solid' | 'gradient' | 'mesh' | 'image' | 'pattern';

export interface ThemeConfig {
  id: string;
  name: string;
  bgType: BackgroundType;
  bgColor: string;
  bgGradient: string;
  bgImage?: string;
  bgPattern?: 'dots' | 'grid' | 'stripes' | 'none';
  overlayBlur: number;
  
  cardStyle: CardStyle;
  cardBg: string;
  cardBorder: string;
  cardTextColor: string;
  cardSubtextColor: string;
  
  accentColor: string;
  accentTextColor: string;
  
  textColor: string;
  textSecondaryColor: string;
  
  fontHeading: string;
  fontBody: string;
  
  blockAnimation?: BlockAnimation;
  
  // Custom Gradient Controls
  gradientFrom?: string;
  gradientTo?: string;
  gradientVia?: string;
  gradientDirection?: 'to-b' | 'to-br' | 'to-r' | 'to-tr' | 'radial';
  
  borderRadius: BorderRadius;
  borderRadiusValue?: number; // Custom radius in px (0 to 36, where 36+ = full pill)
  blockPadding?: number; // Custom block inner padding in px (8 to 28px)
  blockGap?: number; // Custom spacing between blocks in px (6 to 28px)
  shadowDepth: 'none' | 'sm' | 'md' | 'lg' | 'neon';
  buttonHoverEffect: 'scale' | 'lift' | 'glow' | 'bounce' | 'none';
  
  socialIconsStyle: 'round' | 'circle' | 'rounded' | 'pills' | 'square' | 'minimal' | 'glass';
  socialIconsColor: 'accent' | 'brand' | 'monochrome' | 'surface';
  
  // Seletor de Modo Escuro / Claro / Automático
  darkModeOption?: 'light' | 'dark' | 'auto';
}

export interface BioSiteConfig {
  id: string;
  profile: ProfileConfig;
  socialLinks: SocialLink[];
  socialPosition: 'top' | 'bottom';
  blocks: ContentBlock[];
  theme: ThemeConfig;
  customFooter?: string;
  showFooter?: boolean;
  showShareButton: boolean;
  customDomain?: string; // Domínio próprio personalizado (ex: link.meunegocio.com.br)
  customDomainStatus?: 'pending' | 'active' | 'error';
}

export type DeviceMode = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';
