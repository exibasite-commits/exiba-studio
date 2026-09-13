/**
 * Utilitários robustos para sanitização, normalização e validação de cores Hexadecimais
 */

/**
 * Verifica se uma string é uma cor hexadecimal válida (#RGB, #RRGGBB ou #RRGGBBAA)
 */
export function isValidHex(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  const clean = color.trim().replace(/^#/, '');
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(clean);
}

/**
 * Normaliza qualquer entrada de cor hexadecimal digitada pelo usuário.
 * Adiciona automaticamente o '#' se omitido e expande formatos abreviados de 3 para 6 dígitos.
 * Exemplo: 'e11d48' -> '#e11d48', 'fff' -> '#ffffff', '#3b82f6' -> '#3b82f6'
 */
export function normalizeHex(input: string, fallback?: string): string {
  if (!input || typeof input !== 'string') return fallback || '';
  const trimmed = input.trim();
  if (trimmed === '') return fallback || '';

  // Se já for rgb/rgba/hsl, retorna como está
  if (/^(rgb|hsl)/i.test(trimmed)) {
    return trimmed;
  }

  // Remove hashes iniciais para analisar
  const clean = trimmed.replace(/^#+/, '');

  // Expande 3 dígitos para 6
  if (/^[0-9A-Fa-f]{3}$/.test(clean)) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toLowerCase()}`;
  }

  // 6 dígitos
  if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return `#${clean.toLowerCase()}`;
  }

  // 8 dígitos (com alpha)
  if (/^[0-9A-Fa-f]{8}$/.test(clean)) {
    return `#${clean.toLowerCase()}`;
  }

  // Se o usuário estiver digitando parcialmente (ex: '#e11' ou 'e11d')
  if (/^[0-9A-Fa-f]{1,6}$/.test(clean)) {
    return `#${clean}`;
  }

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

/**
 * Retorna estritamente um valor hexadecimal de 7 caracteres no formato '#RRGGBB'
 * compatível com o elemento nativo <input type="color">.
 * Se o valor fornecido for inválido, usa o fallback garantido.
 */
export function getValidPickerHex(color?: string, fallback: string = '#38bdf8'): string {
  if (!color || typeof color !== 'string') return fallback.startsWith('#') ? fallback : `#${fallback}`;
  const clean = color.trim().replace(/^#+/, '');

  if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return `#${clean.toLowerCase()}`;
  }

  if (/^[0-9A-Fa-f]{3}$/.test(clean)) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toLowerCase()}`;
  }

  return fallback.startsWith('#') ? fallback : `#${fallback}`;
}

/**
 * Calcula a cor de texto com contraste ideal (Preto ou Branco) para qualquer cor de fundo HEX
 */
export function getIdealContrastColor(hexColor?: string): '#ffffff' | '#0f172a' {
  if (!hexColor) return '#ffffff';
  const clean = hexColor.trim().replace(/^#+/, '');
  let r = 0, g = 0, b = 0;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else {
    return '#ffffff';
  }

  // Fórmula de luminância relativa YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0f172a' : '#ffffff';
}
