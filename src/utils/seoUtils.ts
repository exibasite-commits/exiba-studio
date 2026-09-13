import { ProfileConfig } from '../types';

/**
 * Atualiza dinamicamente as meta tags do documento (title, description, keywords, Open Graph e Twitter Cards)
 * com base nas configurações de perfil e SEO fornecidas.
 */
export function updateDocumentMetaTags(profile: ProfileConfig): void {
  if (typeof document === 'undefined') return;

  const title =
    profile.seoTitle?.trim() ||
    (profile.name ? `${profile.name} | Link na Bio` : 'BioLink Studio');

  const description =
    profile.seoDescription?.trim() ||
    profile.bio?.trim() ||
    'Crie e personalize seu mini-site ou link na bio com múltiplos blocos interativos e design profissional.';

  const keywords =
    profile.seoKeywords?.trim() ||
    `${profile.name || ''}, link na bio, biolink, cartão de visitas digital, ${profile.handle || ''}`.trim();

  const image =
    profile.seoOgImage?.trim() ||
    (profile.banner?.enabled && profile.banner.type === 'image' && profile.banner.url
      ? profile.banner.url
      : profile.avatarUrl || '');

  // 1. Atualiza document.title
  document.title = title;

  // Helper para atualizar ou criar meta tag padrão por "name"
  const setMetaTag = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Helper para atualizar ou criar meta tag Open Graph por "property"
  const setPropertyTag = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Meta tags básicas de SEO
  setMetaTag('description', description);
  if (keywords) {
    setMetaTag('keywords', keywords);
  }

  // 3. Open Graph (Facebook, WhatsApp, LinkedIn, Discord, Telegram)
  setPropertyTag('og:type', 'website');
  setPropertyTag('og:title', title);
  setPropertyTag('og:description', description);
  if (image) {
    setPropertyTag('og:image', image);
  }

  // 4. Twitter Cards
  setMetaTag('twitter:card', image ? 'summary_large_image' : 'summary');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  if (image) {
    setMetaTag('twitter:image', image);
  }

  // 5. Favicon Dinâmico (atualiza o ícone da aba do navegador para o avatar do perfil se existir)
  const faviconUrl = profile.avatarUrl || '/favicon.svg';
  let faviconEl = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!faviconEl) {
    faviconEl = document.createElement('link');
    faviconEl.rel = 'icon';
    document.head.appendChild(faviconEl);
  }
  faviconEl.href = faviconUrl;

  // 6. Link Canônico e OG URL
  if (typeof window !== 'undefined') {
    const canonicalUrl = window.location.href.split('?')[0];
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonicalUrl;
    setPropertyTag('og:url', canonicalUrl);
  }
}

/**
 * Retorna os dados computados de SEO para prévia visual interativa (WhatsApp, Google, Redes)
 */
export function getSeoPreviewData(profile: ProfileConfig) {
  const title =
    profile.seoTitle?.trim() ||
    (profile.name ? `${profile.name} | Exiba` : 'Exiba Studio');

  const description =
    profile.seoDescription?.trim() ||
    profile.bio?.trim() ||
    'Acesse meus links, cardápio, produtos, chave Pix e WhatsApp em um só lugar.';

  const image =
    profile.seoOgImage?.trim() ||
    (profile.banner?.enabled && profile.banner.type === 'image' && profile.banner.url
      ? profile.banner.url
      : profile.avatarUrl || '');

  const handle = profile.handle ? profile.handle.replace('@', '') : 'usuario';
  const displayUrl = `exiba.site/${handle}`;

  return { title, description, image, displayUrl };
}
