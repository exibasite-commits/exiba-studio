import { BioSiteConfig, ContentBlock, SocialLink, ThemeConfig } from '../types';
import { THEME_PRESETS } from '../data/themes';

export interface GenerateSiteParams {
  businessName: string;
  niche: string;
  city?: string;
  phone?: string;
  vibe?: 'modern' | 'elegant' | 'minimal' | 'bold' | 'cozy';
  servicesOrProducts?: string;
  apiKey?: string;
}

export interface EnhanceCopyParams {
  type: 'bio' | 'tagline' | 'product_description' | 'cta' | 'faq';
  currentText?: string;
  businessName: string;
  niche?: string;
  vibe?: string;
  apiKey?: string;
}

export async function checkAiStatus(): Promise<{ hasServerKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/ai/status', {
      method: 'GET',
      headers: { credentials: 'omit' },
    });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return { hasServerKey: false, model: 'gemini-2.5-flash' };
  }
}

// Imagens padrão curadas do Unsplash por nicho para dar acabamento premium instantâneo
const NICHE_IMAGE_ASSETS: Record<string, { banner: string; avatar: string; themeId: string }> = {
  'beleza': {
    banner: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    themeId: 'esmalteria-vip',
  },
  'barbearia': {
    banner: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop&q=80',
    themeId: 'cyber-dark',
  },
  'gastronomia': {
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
    themeId: 'apple-minimal-light',
  },
  'saude': {
    banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    themeId: 'emerald-sage',
  },
  'fitness': {
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    themeId: 'neo-brutalist',
  },
  'advocacia': {
    banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
    themeId: 'apple-minimal-light',
  },
  'padrao': {
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    themeId: 'cyber-dark',
  },
};

function getNicheAssets(niche: string) {
  const lower = niche.toLowerCase();
  if (lower.includes('barb') || lower.includes('corte') || lower.includes('masculin')) return NICHE_IMAGE_ASSETS.barbearia;
  if (lower.includes('beleza') || lower.includes('unha') || lower.includes('cilio') || lower.includes('estet') || lower.includes('salao') || lower.includes('cabelo')) return NICHE_IMAGE_ASSETS.beleza;
  if (lower.includes('restaurante') || lower.includes('cafe') || lower.includes('pizz') || lower.includes('burger') || lower.includes('comida') || lower.includes('doce')) return NICHE_IMAGE_ASSETS.gastronomia;
  if (lower.includes('saude') || lower.includes('nutri') || lower.includes('psico') || lower.includes('med') || lower.includes('terapia') || lower.includes('odonto')) return NICHE_IMAGE_ASSETS.saude;
  if (lower.includes('personal') || lower.includes('fit') || lower.includes('treino') || lower.includes('academia') || lower.includes('cross')) return NICHE_IMAGE_ASSETS.fitness;
  if (lower.includes('advoc') || lower.includes('direito') || lower.includes('contab') || lower.includes('consult')) return NICHE_IMAGE_ASSETS.advocacia;
  return NICHE_IMAGE_ASSETS.padrao;
}

// Constrói tema customizado a partir da paleta retornada pela IA ou seleciona preset harmonioso
function buildThemeFromAi(palette: any, nicheAssets: { themeId: string }): ThemeConfig {
  const preset = THEME_PRESETS.find((t) => t.id === nicheAssets.themeId) || THEME_PRESETS[0];

  if (!palette || !palette.primary) return preset;

  return {
    ...preset,
    id: 'ai-custom-' + Date.now(),
    name: 'Tema Gerado por IA',
    bgColor: palette.background || preset.bgColor,
    bgGradient: palette.background
      ? `linear-gradient(180deg, ${palette.background} 0%, ${palette.background}dd 100%)`
      : preset.bgGradient,
    accentColor: palette.primary || preset.accentColor,
    textColor: palette.textColor || preset.textColor,
    textSecondaryColor: palette.textSecondary || preset.textSecondaryColor,
    cardBg: palette.cardBg || preset.cardBg,
    cardBorder: palette.cardBorder || preset.cardBorder,
  };
}

// Normaliza o retorno da IA para a tipagem estrita do Exiba Studio
function normalizeAiResponse(data: any, params: GenerateSiteParams): BioSiteConfig {
  const assets = getNicheAssets(params.niche);
  const theme = buildThemeFromAi(data.palette, assets);
  const cleanPhone = (params.phone || '').replace(/\D/g, '');

  const defaultSocialLinks: SocialLink[] = [
    {
      id: 's_wa',
      platform: 'whatsapp',
      url: cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://whatsapp.com',
      enabled: true,
    },
    {
      id: 's_ig',
      platform: 'instagram',
      url: `https://instagram.com/${(data.profile?.handle || params.businessName).replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase()}`,
      enabled: true,
    },
  ];

  const profile = {
    avatarUrl: assets.avatar,
    name: data.profile?.name || params.businessName,
    handle: data.profile?.handle || `@${params.businessName.toLowerCase().replace(/\s+/g, '')}`,
    bio: data.profile?.bio || `Atendimento de excelência em ${params.city || 'sua região'}. Entre em contato para saber mais.`,
    location: data.profile?.location || params.city || 'Brasil',
    verified: true,
    badgeText: data.profile?.badgeText || 'Atendimento VIP',
    avatarStyle: (data.profile?.avatarStyle || 'squircle') as any,
    avatarSize: 'md' as const,
    avatarBorder: true,
    avatarBorderColor: theme.cardBorder || '#ffffff',
    avatarBorderWidth: 3,
    showAvatar: true,
    showName: true,
    showHandle: true,
    showBio: true,
    showLocation: true,
    showBadge: true,
    showVerified: true,
    showSocials: true,
    banner: {
      enabled: true,
      type: 'image' as const,
      url: assets.banner,
      height: 'medium' as const,
      overlayOpacity: 25,
      overlayBlur: 0,
      videoMuted: true,
      videoLoop: true,
    },
    businessInfo: {
      tagline: data.profile?.businessInfo?.tagline || 'Qualidade, pontualidade e dedicação.',
      highlights: data.profile?.businessInfo?.highlights || ['Atendimento personalizado', 'Garantia de satisfação', 'Agendamento rápido'],
      operatingHours: data.profile?.businessInfo?.operatingHours || 'Seg a Sex: 09h às 19h | Sáb: 09h às 14h',
      isOpenNow: true,
    },
    seoTitle: data.profile?.seoTitle || `${params.businessName} | Site Oficial`,
    seoDescription: data.profile?.seoDescription || `Página oficial de ${params.businessName}. Faça seu agendamento ou tire dúvidas.`,
    seoKeywords: data.profile?.seoKeywords || `${params.businessName}, ${params.niche}, agendamento, atendimento`,
  };

  const blocks: ContentBlock[] = Array.isArray(data.blocks) && data.blocks.length > 0
    ? data.blocks.map((b: any, index: number) => ({
        ...b,
        id: b.id || `block_${Date.now()}_${index}`,
        enabled: b.enabled !== false,
      }))
    : [];

  return {
    id: 'ai_site_' + Date.now(),
    profile,
    socialLinks: defaultSocialLinks,
    socialPosition: 'top',
    blocks,
    theme,
    showShareButton: true,
    showFooter: true,
    customFooter: `© ${new Date().getFullYear()} ${params.businessName} • Exiba Studio`,
  };
}

// Fallback: Exiba Smart Semantic Engine (Gera sites completos sem necessidade de chave de API)
function generateSmartSemanticSite(params: GenerateSiteParams): BioSiteConfig {
  const assets = getNicheAssets(params.niche);
  const cleanPhone = (params.phone || '').replace(/\D/g, '') || '5511999999999';
  const cleanHandle = `@${params.businessName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
  const cityText = params.city || 'São Paulo, SP';
  const theme = THEME_PRESETS.find((t) => t.id === assets.themeId) || THEME_PRESETS[0];

  const blocks: ContentBlock[] = [
    {
      id: 'b_wa_' + Date.now(),
      type: 'whatsapp',
      enabled: true,
      title: 'Falar Direto no WhatsApp',
      subtitle: 'Tire dúvidas, solicite orçamentos ou agende seu horário',
      phoneNumber: cleanPhone,
      defaultMessage: `Olá! Vim pelo site da ${params.businessName} e gostaria de informações.`,
      buttonText: 'Iniciar Conversa',
      featured: true,
      animation: 'pulse',
    },
    {
      id: 'b_sched_' + Date.now(),
      type: 'schedule',
      enabled: true,
      title: 'Agendamento Online',
      subtitle: 'Selecione seu horário preferido com confirmação imediata',
      bookingUrl: `https://wa.me/${cleanPhone}?text=Ol%C3%A1!+Gostaria+de+agendar+um+hor%C3%A1rio.`,
      platform: 'whatsapp',
      badge: 'Vagas Abertas',
      buttonText: 'Ver Dias & Horários',
      durationText: '45 min',
    },
    {
      id: 'b_prod1_' + Date.now(),
      type: 'product',
      enabled: true,
      title: params.servicesOrProducts ? params.servicesOrProducts.split(',')[0]?.trim() || 'Serviço Premium' : 'Atendimento Especializado',
      description: 'Experiência completa com produtos de alta qualidade e foco nos seus objetivos.',
      price: 'R$ 140,00',
      originalPrice: 'R$ 170,00',
      url: `https://wa.me/${cleanPhone}?text=Ol%C3%A1!+Gostaria+de+contratar+o+servi%C3%A7o+principal.`,
      buttonText: 'Agendar / Comprar',
      badge: 'Mais Pedido',
    },
    {
      id: 'b_prod2_' + Date.now(),
      type: 'product',
      enabled: true,
      title: 'Pacote Fidelidade / Sessão Avulsa',
      description: 'Ideal para quem busca resultados consistentes com o melhor custo-benefício.',
      price: 'R$ 90,00',
      url: `https://wa.me/${cleanPhone}?text=Ol%C3%A1!+Gostaria+de+saber+mais+sobre+os+pacotes.`,
      buttonText: 'Consultar Detalhes',
    },
    {
      id: 'b_faq_' + Date.now(),
      type: 'faq',
      enabled: true,
      title: 'Perguntas Frequentes',
      items: [
        {
          id: 'f1',
          question: 'Quais são as formas de pagamento aceitas?',
          answer: 'Aceitamos Pix com desconto especial, cartões de crédito em até 12x e débito.',
        },
        {
          id: 'f2',
          question: 'Como funciona o cancelamento ou reagendamento?',
          answer: 'Você pode reagendar com até 24 horas de antecedência diretamente pelo nosso WhatsApp sem custos adicionais.',
        },
        {
          id: 'f3',
          question: 'Qual é o horário de funcionamento?',
          answer: 'Nosso atendimento presencial e online funciona de segunda a sábado com horário agendado.',
        },
      ],
    },
    {
      id: 'b_pix_' + Date.now(),
      type: 'pix',
      enabled: true,
      title: 'Pagamento Rápido via Pix',
      description: 'Chave oficial para pagamentos e confirmação de agendamento',
      pixKey: params.phone ? cleanPhone : 'contato@exiba.com.br',
      pixKeyType: params.phone ? 'telefone' : 'email',
      recipientName: params.businessName,
      suggestedAmounts: ['50', '100', '150'],
    },
  ];

  return {
    id: 'smart_' + Date.now(),
    profile: {
      avatarUrl: assets.avatar,
      name: params.businessName,
      handle: cleanHandle,
      bio: `✨ Excelência e exclusividade em ${params.niche}. Atendimento com hora marcada em ${cityText}.`,
      location: cityText,
      verified: true,
      badgeText: 'Profissional Verificado',
      avatarStyle: 'squircle',
      avatarSize: 'md',
      avatarBorder: true,
      avatarBorderColor: '#ffffff',
      avatarBorderWidth: 3,
      showAvatar: true,
      showName: true,
      showHandle: true,
      showBio: true,
      showLocation: true,
      showBadge: true,
      showVerified: true,
      showSocials: true,
      banner: {
        enabled: true,
        type: 'image',
        url: assets.banner,
        height: 'medium',
        overlayOpacity: 20,
        overlayBlur: 0,
        videoMuted: true,
        videoLoop: true,
      },
      businessInfo: {
        tagline: 'Sua melhor experiência começa aqui.',
        highlights: ['Pontualidade britânica', 'Atendimento humanizado', 'Ambiente climatizado'],
        operatingHours: 'Segunda a Sábado: 09h às 19h',
        isOpenNow: true,
      },
      seoTitle: `${params.businessName} | ${params.niche}`,
      seoDescription: `Visite o site oficial da ${params.businessName}. Agende seu horário ou solicite um orçamento rápido pelo WhatsApp.`,
      seoKeywords: `${params.businessName}, ${params.niche}, agendamento, whatsapp, ${cityText}`,
    },
    socialLinks: [
      { id: 's_wa', platform: 'whatsapp', url: `https://wa.me/${cleanPhone}`, enabled: true },
      { id: 's_ig', platform: 'instagram', url: `https://instagram.com/${cleanHandle.replace('@', '')}`, enabled: true },
    ],
    socialPosition: 'top',
    blocks,
    theme,
    showShareButton: true,
    showFooter: true,
    customFooter: `© ${new Date().getFullYear()} ${params.businessName} • Feito no Exiba Studio`,
  };
}

/**
 * Gera um site completo via Google Gemini 2.5 Flash com fallback semântico automático
 */
export async function generateSiteWithAi(params: GenerateSiteParams): Promise<BioSiteConfig> {
  // 1. Tentar chamada via Backend Express
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: params.businessName,
        niche: params.niche,
        city: params.city,
        phone: params.phone,
        vibe: params.vibe,
        servicesOrProducts: params.servicesOrProducts,
        customApiKey: params.apiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return normalizeAiResponse(data.data, params);
      }
    }
  } catch (err) {
    console.warn('[AI Service] Backend call failed, attempting direct or smart fallback:', err);
  }

  // 2. Se o usuário forneceu uma chave direta de API no cliente, tentar via SDK @google/genai direto no browser
  const directApiKey = params.apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (directApiKey && directApiKey.trim().length > 10) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: directApiKey.trim() });
      const prompt = `Gere uma configuração JSON estrita para o negócio "${params.businessName}" (${params.niche}) em "${params.city || 'Brasil'}". Retorne um objeto JSON com profile, palette e blocks.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
        return normalizeAiResponse(parsed, params);
      }
    } catch (clientErr) {
      console.warn('[AI Service] Direct Gemini SDK in browser failed:', clientErr);
    }
  }

  // 3. Smart Semantic Engine (Garante que nunca trava e sempre gera uma página deslumbrante)
  return generateSmartSemanticSite(params);
}

/**
 * Melhora textos específicos (Bio, Slogan, Descrição de Produto)
 */
export async function enhanceCopy(params: EnhanceCopyParams): Promise<string[]> {
  try {
    const res = await fetch('/api/ai/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return data.suggestions;
      }
    }
  } catch {
    // Fallback inteligente de copy
  }

  // Fallback de sugestões de copywriting
  if (params.type === 'bio') {
    return [
      `✨ Especialista em ${params.niche || 'atendimento VIP'}. Agende seu horário com exclusividade.`,
      `Transformando sua autoestima e bem-estar em ${params.businessName}. Clique no link para agendar!`,
      `🌟 Atendimento personalizado com foco em resultados. Fale conosco pelo WhatsApp!`,
    ];
  }

  if (params.type === 'product_description') {
    return [
      `Procedimento completo realizado com produtos de alta qualidade, garantindo conforto e durabilidade.`,
      `O queridinho das nossas clientes! Resultados visíveis desde a primeira sessão com atendimento exclusivo.`,
      `Desenvolvido para oferecer a melhor experiência com técnica refinada e máxima segurança.`,
    ];
  }

  return [
    `Conheça mais sobre ${params.businessName}`,
    `Agende seu procedimento agora mesmo`,
    `Fale diretamente com nossa equipe`,
  ];
}
