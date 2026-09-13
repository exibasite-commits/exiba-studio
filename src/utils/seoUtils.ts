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
}
