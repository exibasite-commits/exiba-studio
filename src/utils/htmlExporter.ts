import { BioSiteConfig } from '../types';
import { getValidPickerHex } from './colorUtils';

export function generateStandaloneHTML(config: BioSiteConfig, plan: 'free' | 'pro' = 'free', isAdmin = false): string {
  const { profile, socialLinks, blocks, theme } = config;
  const banner = profile.banner;
  const businessInfo = profile.businessInfo;

  // Background style computation
  let bgCSS = `background-color: ${theme.bgColor};`;
  if (theme.bgType === 'gradient') {
    bgCSS = `background: ${theme.bgGradient};`;
  } else if (theme.bgType === 'image' && theme.bgImage) {
    bgCSS = `background-image: url('${theme.bgImage}'); background-size: cover; background-position: center; background-attachment: fixed;`;
  }

  // Border radius class equivalent
  const radiusMap: Record<string, string> = {
    none: '0px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    full: '9999px',
  };
  const borderRadiusCSS =
    theme.borderRadiusValue !== undefined
      ? `${theme.borderRadiusValue}px`
      : radiusMap[theme.borderRadius] || '16px';

  // Card shadow & glass styles
  let cardStyles = `
    background: ${theme.cardBg};
    border: 1px solid ${theme.cardBorder};
    border-radius: ${borderRadiusCSS};
    color: ${theme.cardTextColor};
  `;
  if (theme.cardStyle === 'glass') {
    cardStyles += `
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    `;
  } else if (theme.cardStyle === 'brutalist') {
    cardStyles += `
      box-shadow: 4px 4px 0px #000000;
      border: 2px solid ${theme.cardBorder || '#000000'};
    `;
  } else if (theme.cardStyle === 'soft-shadow') {
    cardStyles += `
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
    `;
  }

  const avatarRadius =
    profile.avatarStyle === 'circle'
      ? '50%'
      : profile.avatarStyle === 'rounded'
      ? '24px'
      : profile.avatarStyle === 'ring'
      ? '50%'
      : '12px';

  const avatarBorderCSS =
    profile.avatarBorder !== false
      ? `border: ${profile.avatarBorderWidth || 3}px solid ${profile.avatarBorderColor || '#ffffff'};`
      : profile.avatarStyle === 'ring'
      ? `border: 3px solid ${theme.accentColor};`
      : 'border: none;';

  const hasBanner = banner && banner.enabled;
  const bannerHeightCSS =
    banner?.height === 'compact'
      ? '140px'
      : banner?.height === 'tall'
      ? '240px'
      : banner?.height === 'hero'
      ? '300px'
      : '180px';

  // Helper to format safe link attributes (respects tel:, mailto:, sms:, etc.)
  function formatLinkAttr(rawUrl: string, platform?: string): string {
    let url = (rawUrl || '').trim();
    if (!url) return 'href="#"';

    if (platform === 'email' && !url.toLowerCase().startsWith('mailto:')) {
      url = `mailto:${url}`;
    } else if (platform === 'phone' && !url.toLowerCase().startsWith('tel:')) {
      url = `tel:${url.replace(/\D/g, '')}`;
    } else if (platform === 'whatsapp' && !url.startsWith('http')) {
      url = `https://wa.me/${url.replace(/\D/g, '')}`;
    }

    const isDirectProtocol = /^(tel:|mailto:|sms:|callto:)/i.test(url);
    if (isDirectProtocol) {
      return `href="${url}"`;
    }
    return `href="${url}" target="_blank" rel="noopener noreferrer"`;
  }

  const pageTitle = (profile.seoTitle?.trim() || `${profile.name} (@${profile.handle.replace('@', '')})`).replace(/"/g, '&quot;');
  const metaDescription = (profile.seoDescription?.trim() || profile.bio || '').replace(/"/g, '&quot;');
  const metaKeywords = (profile.seoKeywords?.trim() || '').replace(/"/g, '&quot;');
  const ogImage = (
    profile.seoOgImage?.trim() ||
    (profile.banner?.enabled && profile.banner.type === 'image' && profile.banner.url
      ? profile.banner.url
      : profile.avatarUrl || '')
  ).replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDescription}">
  ${metaKeywords ? `<meta name="keywords" content="${metaKeywords}">` : ''}
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDescription}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=Syne:wght@600;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      min-height: 100vh;
      font-family: '${theme.fontBody}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ${bgCSS}
      color: ${theme.textColor};
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.5;
      padding-bottom: 3rem;
    }
    .banner-header {
      width: 100%;
      height: ${bannerHeightCSS};
      position: relative;
      overflow: hidden;
    }
    .banner-header video, .banner-header img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      ${banner?.overlayBlur ? `filter: blur(${banner.overlayBlur}px);` : ''}
    }
    .banner-overlay {
      position: absolute;
      inset: 0;
      background: #000000;
      opacity: ${(banner?.overlayOpacity ?? 40) / 100};
    }
    .bio-container {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      padding: 0 1rem;
      z-index: 10;
      ${hasBanner ? 'margin-top: -3.5rem;' : 'padding-top: 2.5rem;'}
    }
    h1, h2, h3, .heading-font {
      font-family: '${theme.fontHeading}', sans-serif;
    }
    .profile-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    .avatar {
      width: 96px;
      height: 96px;
      border-radius: ${avatarRadius};
      object-fit: cover;
      ${avatarBorderCSS}
      padding: ${profile.avatarStyle === 'ring' ? '3px' : '0'};
      box-shadow: 0 12px 28px rgba(0,0,0,0.35);
      margin-bottom: 0.75rem;
      background: ${theme.cardBg};
    }
    .profile-name {
      font-size: 1.5rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: ${theme.textColor};
    }
    .verified-badge {
      display: inline-flex;
      color: ${theme.accentColor};
    }
    .profile-handle {
      font-size: 0.9rem;
      color: ${theme.textSecondaryColor};
      margin-top: 0.15rem;
      font-weight: 600;
      font-family: monospace;
    }
    .tagline-box {
      margin-top: 0.75rem;
      background: ${theme.accentColor}18;
      border: 1px solid ${theme.accentColor}40;
      color: ${theme.textColor};
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .profile-bio {
      font-size: 0.9rem;
      margin-top: 0.5rem;
      color: ${theme.textColor};
      opacity: 0.9;
      max-width: 360px;
    }
    .highlights-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      justify-content: center;
      margin-top: 0.75rem;
    }
    .highlight-pill {
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      background: ${theme.cardBg};
      border: 1px solid ${theme.cardBorder};
      color: ${theme.textColor};
    }
    .social-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      justify-content: center;
      width: 100%;
    }
    .social-link-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${theme.cardBg};
      border: 1px solid ${theme.cardBorder};
      color: ${theme.textColor};
      text-decoration: none;
      font-size: 1.1rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .social-link-btn:hover {
      transform: translateY(-2px);
      border-color: ${theme.accentColor};
    }
    .blocks-stack {
      display: flex;
      flex-direction: column;
      gap: ${theme.blockGap !== undefined ? theme.blockGap : 14}px;
      width: 100%;
    }
    .block-card {
      ${cardStyles}
      display: block;
      padding: ${theme.blockPadding !== undefined ? theme.blockPadding : 16}px;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .block-card:hover {
      transform: translateY(-2px);
      border-color: ${theme.accentColor};
    }
    .block-title {
      font-weight: 700;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .block-subtitle {
      font-size: 0.8rem;
      color: ${theme.textSecondaryColor};
      margin-top: 0.25rem;
    }
    .block-badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background: ${theme.accentColor};
      color: ${theme.accentTextColor};
      font-weight: 700;
      text-transform: uppercase;
    }
    .btn-action {
      display: inline-block;
      width: 100%;
      text-align: center;
      background: ${theme.accentColor};
      color: ${theme.accentTextColor};
      font-weight: 700;
      padding: 0.65rem 1rem;
      border-radius: ${borderRadiusCSS};
      text-decoration: none;
      margin-top: 0.75rem;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      width: 100%;
    }
    .bento-item {
      ${cardStyles}
      padding: 0.85rem;
      text-decoration: none;
      transition: transform 0.2s ease;
    }
    .bento-item:hover {
      transform: translateY(-2px);
      border-color: ${theme.accentColor};
    }
    .faq-item {
      border-bottom: 1px solid ${theme.cardBorder};
      padding: 0.6rem 0;
    }
    .faq-question {
      font-weight: 700;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .faq-answer {
      font-size: 0.82rem;
      color: ${theme.textSecondaryColor};
      margin-top: 0.4rem;
      display: none;
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 1rem;
    }
    .modal-box {
      background: #0f172a;
      border: 1px solid #334155;
      color: #ffffff;
      border-radius: 20px;
      padding: 1.5rem;
      max-width: 360px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .toast-msg {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #38bdf8;
      border: 1px solid #38bdf8;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: none;
      z-index: 1000;
    }
    .footer {
      text-align: center;
      font-size: 0.75rem;
      color: ${theme.textSecondaryColor};
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  ${
    hasBanner
      ? `
    <div class="banner-header">
      ${
        banner.type === 'video'
          ? `<video src="${banner.url}" autoplay loop muted playsinline></video>`
          : `<img src="${banner.url}" alt="Cover" loading="lazy" decoding="async">`
      }
      <div class="banner-overlay"></div>
    </div>
  `
      : ''
  }

  <div class="bio-container">
    <header class="profile-header">
      <img class="avatar" src="${profile.avatarUrl}" alt="${profile.name}" loading="lazy" decoding="async">
      <h1 class="profile-name">
        <span>${profile.name}</span>
        ${profile.verified ? `<svg class="verified-badge" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` : ''}
      </h1>
      <p class="profile-handle">${profile.handle}</p>
      ${profile.badgeText ? `<div class="badge-pill">${profile.badgeText}</div>` : ''}

      ${businessInfo?.tagline ? `<div class="tagline-box">“${businessInfo.tagline}”</div>` : ''}
      ${profile.bio ? `<p class="profile-bio">${profile.bio}</p>` : ''}

      ${
        businessInfo?.highlights && businessInfo.highlights.length > 0
          ? `
        <div class="highlights-container">
          ${businessInfo.highlights.map((h) => `<span class="highlight-pill">✓ ${h}</span>`).join('')}
        </div>
      `
          : ''
      }
    </header>

    <!-- Social Bar -->
    <div class="social-bar">
      ${socialLinks
        .filter((s) => s.enabled)
        .map((s) => {
          const linkAttr = formatLinkAttr(s.url, s.platform);
          return `
        <a ${linkAttr} class="social-link-btn" title="${s.platform}" style="${s.customColor ? `background:${s.customColor};` : ''}${s.customTextColor ? `color:${s.customTextColor};` : ''}">
          ↗
        </a>
      `;
        })
        .join('')}
    </div>

    <!-- Blocks List -->
    <div class="blocks-stack">
      ${blocks
        .filter((b) => b.enabled && b.status !== 'draft')
        .map((b) => {
          const customStyle = `
            ${b.customColor ? `background:${b.customColor} !important;` : ''}
            ${b.customTextColor ? `color:${b.customTextColor} !important;` : ''}
            ${b.customBorderColor ? `border-color:${b.customBorderColor} !important;` : ''}
          `;

          if (b.type === 'link') {
            const linkAttr = formatLinkAttr(b.url);
            return `
            <a ${linkAttr} class="block-card" style="${customStyle}">
              <div class="block-title">
                <span>${b.title}</span>
                ${b.badge ? `<span class="block-badge">${b.badge}</span>` : '<span>↗</span>'}
              </div>
              ${b.subtitle ? `<div class="block-subtitle">${b.subtitle}</div>` : ''}
            </a>
          `;
          }

          if (b.type === 'whatsapp') {
            const encoded = encodeURIComponent(b.defaultMessage || 'Olá!');
            const cleanNum = b.phoneNumber.replace(/\D/g, '');
            const link = `https://wa.me/${cleanNum}?text=${encoded}`;
            const btnColor = (b as any).customButtonColor || '#25D366';
            const btnTextColor = (b as any).customButtonTextColor || '#ffffff';
            return `
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="block-card" style="${customStyle}">
              <div class="block-title">
                <span>${b.title}</span>
                <span class="block-badge" style="background:${btnColor};color:${btnTextColor};">WhatsApp</span>
              </div>
              ${b.subtitle ? `<div class="block-subtitle">${b.subtitle}</div>` : ''}
              <div class="btn-action" style="background:${btnColor};color:${btnTextColor};">${b.buttonText || 'Conversar'}</div>
            </a>
          `;
          }

          if (b.type === 'pix') {
            return `
            <div class="block-card" style="${customStyle}">
              <div class="block-title">
                <span>${b.title}</span>
                <span class="block-badge">PIX</span>
              </div>
              ${b.description ? `<div class="block-subtitle">${b.description}</div>` : ''}
              <div style="margin-top:0.75rem; background:rgba(0,0,0,0.2); padding:0.6rem; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-family:monospace; font-size:0.85rem;">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70%;">${b.pixKey}</span>
                <button onclick="navigator.clipboard.writeText('${b.pixKey}'); showToast('Chave PIX copiada com sucesso!');" style="background:${theme.accentColor}; color:${theme.accentTextColor}; border:none; padding:0.35rem 0.8rem; border-radius:6px; font-weight:bold; cursor:pointer;">Copiar</button>
              </div>
            </div>
          `;
          }

          if (b.type === 'bento') {
            return `
            <div class="bento-grid">
              ${b.items
                .map((item) => {
                  const linkAttr = formatLinkAttr(item.url);
                  return `
                <a ${linkAttr} class="bento-item" style="${customStyle}">
                  <div style="font-weight:700; font-size:0.85rem;">${item.title}</div>
                  ${item.subtitle ? `<div style="font-size:0.75rem; opacity:0.8; margin-top:0.2rem;">${item.subtitle}</div>` : ''}
                </a>
              `;
                })
                .join('')}
            </div>
          `;
          }

          if (b.type === 'schedule') {
            const linkAttr = formatLinkAttr(b.bookingUrl);
            const btnColor = (b as any).customButtonColor || theme.accentColor;
            const btnTextColor = (b as any).customButtonTextColor || theme.accentTextColor;
            return `
            <a ${linkAttr} class="block-card" style="${customStyle}">
              <div class="block-title">
                <span>${b.title}</span>
                <span class="block-badge" style="background:${btnColor}25;color:${btnColor};border:1px solid ${btnColor}40;">${b.badge || 'Agendamento'}</span>
              </div>
              ${b.subtitle ? `<div class="block-subtitle">${b.subtitle}</div>` : ''}
              ${(b as any).durationText ? `<div style="font-size:0.75rem; opacity:0.8; margin-top:0.3rem;">⏱ Duração: ${(b as any).durationText}</div>` : ''}
              ${(b as any).priceText ? `<div style="font-size:0.75rem; font-weight:bold; color:#10b981; margin-top:0.2rem;">${(b as any).priceText}</div>` : ''}
              <div class="btn-action" style="background:${btnColor};color:${btnTextColor};">${b.buttonText || 'Agendar Horário'}</div>
            </a>
          `;
          }

          if (b.type === 'google_review') {
            const linkAttr = formatLinkAttr(b.reviewUrl);
            return `
            <a ${linkAttr} class="block-card" style="${customStyle}">
              <div class="block-title">
                <span>${b.title}</span>
                <span class="block-badge" style="background:#f59e0b;color:#000;">${b.ratingText || '⭐⭐⭐⭐⭐'}</span>
              </div>
              ${b.subtitle ? `<div class="block-subtitle">${b.subtitle}</div>` : ''}
              <div class="btn-action" style="background:#f59e0b;color:#000;">${b.buttonText || 'Avaliar no Google'}</div>
            </a>
          `;
          }

          if (b.type === 'product') {
            const linkAttr = formatLinkAttr(b.url);
            return `
            <div class="block-card" style="${customStyle}">
              ${b.imageUrl ? `<img src="${b.imageUrl}" alt="${b.title}" style="width:100%; height:160px; object-fit:cover; border-radius:10px; margin-bottom:0.75rem;">` : ''}
              <div class="block-title">
                <span>${b.title}</span>
                <span class="block-badge">${b.price}</span>
              </div>
              ${b.description ? `<div class="block-subtitle">${b.description}</div>` : ''}
              <a ${linkAttr} class="btn-action">${b.buttonText || 'Comprar Agora'}</a>
            </div>
          `;
          }

          if (b.type === 'wifi') {
            const ssid = b.networkName || (b as any).ssid || 'WiFi';
            const pass = b.password || '';
            const enc = b.encryption || 'WPA';
            const qrData = encodeURIComponent(`WIFI:S:${ssid};T:${enc};P:${pass};;`);
            return `
            <div class="block-card" style="${customStyle}">
              <div class="block-title">
                <span>📶 ${b.title || 'Wi-Fi'}</span>
                <span class="block-badge">Conectar</span>
              </div>
              <div style="margin-top:0.75rem; text-align:center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}" alt="QR Code WiFi" style="width:120px; height:120px; border-radius:8px; background:#fff; padding:6px;">
                <div style="font-size:0.8rem; font-family:monospace; margin-top:0.5rem; opacity:0.9;">Rede: <strong>${ssid}</strong></div>
                ${pass ? `<button onclick="navigator.clipboard.writeText('${pass}'); showToast('Senha do Wi-Fi copiada!');" style="margin-top:0.4rem; background:${theme.accentColor}; color:${theme.accentTextColor}; border:none; padding:0.3rem 0.8rem; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.75rem;">Copiar Senha</button>` : ''}
              </div>
            </div>
          `;
          }

          if (b.type === 'faq') {
            return `
            <div class="block-card" style="${customStyle}">
              ${b.title ? `<div class="block-title" style="margin-bottom:0.6rem;">${b.title}</div>` : ''}
              ${b.items
                .map(
                  (item, idx) => `
                <div class="faq-item">
                  <div class="faq-question" onclick="toggleFaq('faq-${b.id}-${idx}')">
                    <span>${item.question}</span>
                    <span>▾</span>
                  </div>
                  <div id="faq-${b.id}-${idx}" class="faq-answer">${item.answer}</div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
          }

          if (b.type === 'text') {
            return `
            <div class="block-card" style="${customStyle} text-align:${(b as any).align || 'center'};">
              ${b.title ? `<h3 style="font-weight:700; font-size:1.1rem; margin-bottom:0.4rem;">${b.title}</h3>` : ''}
              <p style="font-size:0.9rem; opacity:0.85; white-space:pre-line;">${(b as any).content || ''}</p>
            </div>
          `;
          }

          return '';
        })
        .join('')}
    </div>

    <footer class="footer">
      <p>${plan === 'pro' || isAdmin ? (config.customFooter || '') : (config.customFooter ? `${config.customFooter} · Feito com Exiba` : 'Feito com Exiba')}</p>
    </footer>
  </div>

  <div id="toast" class="toast-msg"></div>

  <script>
    function showToast(text) {
      var t = document.getElementById('toast');
      t.innerText = text;
      t.style.display = 'block';
      setTimeout(function() { t.style.display = 'none'; }, 2500);
    }

    function toggleFaq(id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
      }
    }
  </script>
</body>
</html>`;
}
