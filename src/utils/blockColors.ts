import { BlockType, ContentBlock } from '../types';
import { getIdealContrastColor } from './colorUtils';

// Camada 2 da cascata de cor: identidade visual de cada serviço/plataforma.
// Quando um bloco não define `customColor`, usa esta cor de marca; os tipos que
// não possuem uma identidade forte (link, bento, schedule genérico, etc.)
// caem automaticamente para a Camada 3 (theme.accentColor).
export const BLOCK_DEFAULT_COLORS: Partial<Record<BlockType, string>> = {
  whatsapp: '#25D366', // Verde oficial do WhatsApp
  pix: '#32BCAD', // Identidade própria do PIX (teal)
  google_review: '#4285F4', // Azul Google
  video: '#FF0000', // Vermelho YouTube
  audio: '#1DB954', // Verde Spotify
};

/**
 * Resolve a cor do elemento colorido (botão/ação) de um bloco seguindo a
 * cascata de 3 camadas:
 *   1. `block.customColor` (cor customizada do bloco específico)
 *   2. `BLOCK_DEFAULT_COLORS[block.type]` (cor padrão da plataforma/marca)
 *   3. `accentColor` (cor de destaque geral do tema)
 *
 * A primeira camada que existir vence. Blocos já criados sem `customColor`
 * continuam se comportando exatamente como antes (caem para as camadas 2/3).
 */
export function resolveBlockColor(
  block: Pick<ContentBlock, 'type' | 'customColor'>,
  accentColor: string
): string {
  return block.customColor || BLOCK_DEFAULT_COLORS[block.type] || accentColor;
}

/**
 * Resolve a cor de TEXTO adequada para o elemento colorido de um bloco.
 * Quando o fundo vem da cor de marca da plataforma (camada 2, ex.: PIX teal,
 * Google azul), calcula a cor de contraste ideal (branco/preto) em vez de
 * reutilizar o `accentTextColor` do tema — que foi calibrado para o accent,
 * não para a marca. Para `customColor` ou `accentColor` (camadas 1/3), mantém
 * o `accentTextColor` (ou o `customTextColor` quando definido).
 */
export function resolveBlockTextColor(
  block: Pick<ContentBlock, 'type' | 'customColor' | 'customTextColor'>,
  accentTextColor: string,
  background: string
): string {
  if (block.customTextColor) return block.customTextColor;
  if (block.customColor || !BLOCK_DEFAULT_COLORS[block.type]) return accentTextColor;
  return getIdealContrastColor(background);
}
