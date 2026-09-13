import React, { useState, useRef } from 'react';
import {
  ContentBlock,
  LinkBlock,
  ScheduleBlock,
  BentoBlock,
  VideoBlock,
  AudioBlock,
  ProductBlock,
  PixBlock,
  WhatsAppBlock,
  CountdownBlock,
  FaqBlock,
  TextBlock,
  GalleryBlock,
  ButtonAnimation,
  GoogleReviewBlock,
  WifiBlock,
} from '../../types';
import { IconSelector, renderDynamicIcon } from '../common/IconSelector';
import { BLOCK_DEFAULT_COLORS, resolveBlockColor } from '../../utils/blockColors';
import { Tooltip, InfoTooltip } from '../common/Tooltip';
import { ProductMediaManager } from './ProductMediaManager';
import { GalleryBlockEditor } from './GalleryBlockEditor';
import { AvailabilityManager } from './AvailabilityManager';
import { enhanceCopy } from '../../api/ai';

import {
  Sparkles,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  Calendar,
  DollarSign,
  Send,
  HelpCircle,
  Video,
  Music,
  ShoppingBag,
  FileText,
  Clock,
  Layers,
  Image as ImageIcon,
  Star,
  Wifi,
  QrCode,
  Eye,
  EyeOff,
  CheckCircle2,
  Palette,
  RotateCcw,
  Loader2,
} from 'lucide-react';

import { getValidPickerHex, normalizeHex } from '../../utils/colorUtils';

// Normaliza um valor digitado em reais para o formato canônico "R$ X,XX".
// Aceita "10", "10,00", "R$ 10", "R$ 10,50", "1.234,56", etc. Retorna '' quando inválido.
function normalizePixAmount(raw: string): string {
  const cleaned = String(raw ?? '').trim();
  if (!cleaned) return '';
  let digits = cleaned.replace(/[^\d.,]/g, '');
  if (!digits) return '';
  if (digits.includes(',') && digits.includes('.')) {
    // Ambos os separadores: "." é milhar e "," é decimal (ex: 1.234,56).
    digits = digits.replace(/\./g, '').replace(',', '.');
  } else if (digits.includes(',')) {
    // Vírgula como separador decimal (ex: 10,50).
    digits = digits.replace(',', '.');
  }
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return '';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Paleta rápida compartilhada pelos controles de "fundo do bloco" e "cor do botão".
const QUICK_BLOCK_COLORS: { label: string; bg?: string; text?: string }[] = [
  { label: 'Padrão do Tema', bg: undefined, text: undefined },
  { label: 'Pink VIP', bg: '#e11d48', text: '#ffffff' },
  { label: 'Instagram', bg: '#E1306C', text: '#ffffff' },
  { label: 'WhatsApp', bg: '#25D366', text: '#ffffff' },
  { label: 'Azul Real', bg: '#2563eb', text: '#ffffff' },
  { label: 'Ciano Tech', bg: '#0ea5e9', text: '#030712' },
  { label: 'Esmeralda', bg: '#10b981', text: '#ffffff' },
  { label: 'Roxo VIP', bg: '#8b5cf6', text: '#ffffff' },
  { label: 'Dourado', bg: '#eab308', text: '#000000' },
  { label: 'Laranja', bg: '#f97316', text: '#ffffff' },
  { label: 'Preto', bg: '#0f172a', text: '#ffffff' },
  { label: 'Branco', bg: '#ffffff', text: '#0f172a' },
];

interface BlockItemEditorProps {
  block: ContentBlock;
  onChange: (updated: ContentBlock) => void;
  siteId?: string;
}

export function BlockItemEditor({ block, onChange, siteId }: BlockItemEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEnhancingProductDesc, setIsEnhancingProductDesc] = useState(false);
  const [productDescSuggestions, setProductDescSuggestions] = useState<string[]>([]);

  const handleEnhanceProductDesc = async (currentDesc?: string, title?: string) => {
    setIsEnhancingProductDesc(true);
    setProductDescSuggestions([]);
    try {
      const suggestions = await enhanceCopy({
        type: 'product_description',
        currentText: currentDesc,
        businessName: title || 'Produto',
      });
      setProductDescSuggestions(suggestions);
    } catch {
      // ignore
    } finally {
      setIsEnhancingProductDesc(false);
    }
  };

  const update = (partial: Partial<ContentBlock>) => {

    onChange({ ...block, ...partial } as ContentBlock);
  };

  const isDraft = !block.enabled || block.status === 'draft';

  // Cor resultante do elemento colorido (botão/ação) deste bloco, segundo a cascata
  // de 3 camadas. O editor não tem o tema em mãos, então usamos a cor primária da
  // marca como fallback da Camada 3 — a cor real do tema é aplicada no renderizador.
  const resolvedColor = resolveBlockColor(block, '#0F6E56');
  const defaultTypeColor = BLOCK_DEFAULT_COLORS[block.type];
  // Blocos que têm um botão de ação interno separado do fundo do card
  // (schedule e whatsapp) ganham DOIS controles de cor no painel.
  const hasButtonColor = block.type === 'schedule' || block.type === 'whatsapp';
  const customButtonColor = (block as any).customButtonColor as string | undefined;
  const buttonDefaultTypeColor = BLOCK_DEFAULT_COLORS[block.type];
  const buttonResolvedColor = customButtonColor || buttonDefaultTypeColor || '#0F6E56';

  const renderBlockControls = () => {
    switch (block.type) {
      case 'schedule': {
        const sch = block as ScheduleBlock;
        return (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                  <span>Título do Agendamento *</span>
                  <InfoTooltip
                    title="Título do Agendamento"
                    text="O texto principal exibido em destaque no card (ex: Agendar Consulta, Sessão de Mentoria)."
                  />
                </label>
                <input
                  type="text"
                  value={sch.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Ex: Agendar Consulta / Horário"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                  <span>Subtítulo Explicativo</span>
                  <InfoTooltip
                    title="Subtítulo da Agenda"
                    text="Uma breve instrução para seus clientes (ex: Escolha dia e horário na agenda online)."
                  />
                </label>
                <input
                  type="text"
                  value={sch.subtitle || ''}
                  onChange={(e) => update({ subtitle: e.target.value })}
                  placeholder="Ex: Escolha o melhor dia e horário na agenda online"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="pb-4 border-b border-slate-800 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <span>Link de Agendamento (Calendly ou similar) *</span>
                    <InfoTooltip
                      title="URL do Agendamento"
                      text="Cole o link da sua agenda do Calendly, Cal.com, Google Agenda, TidyCal ou outra ferramenta."
                    />
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>Exemplos:</span>
                    <button
                      type="button"
                      onClick={() => update({ bookingUrl: 'https://calendly.com/', platform: 'calendly', buttonText: 'Agendar no Calendly' })}
                      className="text-sky-400 hover:underline focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                    >
                      Calendly
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => update({ bookingUrl: 'https://cal.com/', platform: 'cal_com', buttonText: 'Agendar no Cal.com' })}
                      className="text-sky-400 hover:underline focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                    >
                      Cal.com
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => update({ bookingUrl: 'https://calendar.google.com/', platform: 'google_calendar', buttonText: 'Ver Agenda Google' })}
                      className="text-sky-400 hover:underline focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                    >
                      Google
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={sch.bookingUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    let detectedPlatform = sch.platform;
                    if (val.includes('calendly.com')) detectedPlatform = 'calendly';
                    else if (val.includes('cal.com')) detectedPlatform = 'cal_com';
                    else if (val.includes('tidycal.com')) detectedPlatform = 'tidycal';
                    else if (val.includes('youcanbook.me')) detectedPlatform = 'youcanbookme';
                    else if (val.includes('calendar.google.com')) detectedPlatform = 'google_calendar';
                    update({ bookingUrl: val, platform: detectedPlatform });
                  }}
                  placeholder="https://calendly.com/seu-usuario/30min ou https://cal.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                />
              </div>

              {sch.platform === 'native' && siteId && (
                <AvailabilityManager siteId={siteId} />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                    <span>Plataforma / Estilo</span>
                    <InfoTooltip
                      title="Plataforma de Agenda"
                      text="Define o ícone e a estilização associada ao serviço escolhido."
                    />
                  </label>
                  <select
                    value={sch.platform || 'calendly'}
                    onChange={(e) => update({ platform: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  >
                    <option value="calendly">Calendly</option>
                    <option value="cal_com">Cal.com</option>
                    <option value="tidycal">TidyCal</option>
                    <option value="youcanbookme">YouCanBook.me</option>
                    <option value="google_calendar">Google Calendar / Agenda</option>
                    <option value="whatsapp">Agendamento via WhatsApp</option>
                    <option value="generic">Sistema Próprio / Outro Link</option>
                    <option value="native">Agendamento Nativo (próprio)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                    <span>Badge em Destaque</span>
                    <InfoTooltip
                      title="Etiqueta no Card"
                      text="Texto em pílula destacada (ex: Vagas Abertas, Urgente, Grátis)."
                    />
                  </label>
                  <input
                    type="text"
                    value={sch.badge || ''}
                    onChange={(e) => update({ badge: e.target.value })}
                    placeholder="Ex: Vagas Abertas"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                    <span>Duração Estimada</span>
                    <InfoTooltip
                      title="Tempo da Sessão"
                      text="Tempo estimado da consulta ou reunião (ex: 45 min / 1 hora)."
                    />
                  </label>
                  <input
                    type="text"
                    value={sch.durationText || ''}
                    onChange={(e) => update({ durationText: e.target.value })}
                    placeholder="Ex: 45 min / 1 hora"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
              <div>
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                  <span>Texto do Botão de Ação (CTA) *</span>
                  <InfoTooltip
                    title="Chamada para Ação"
                    text="Texto clicável do botão no mini-site (ex: Agendar Horário, Ver Horários Disponíveis, Agendar Consulta)."
                  />
                </label>
                <input
                  type="text"
                  value={sch.buttonText || ''}
                  onChange={(e) => update({ buttonText: e.target.value })}
                  placeholder="Ex: Agendar Horário"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                  <span>Valor / Preço da Sessão</span>
                  <InfoTooltip
                    title="Preço do Atendimento"
                    text="Opcional. Exibe se a sessão é gratuita ou tem valor fixo (ex: Grátis, R$ 150, Primeira Consulta Off)."
                  />
                </label>
                <input
                  type="text"
                  value={sch.priceText || ''}
                  onChange={(e) => update({ priceText: e.target.value })}
                  placeholder="Ex: Grátis ou R$ 150"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        );
      }
    case 'google_review': {
      const rev = block as GoogleReviewBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Botão Google *</span>
                <InfoTooltip
                  title="Avaliação Google"
                  text="Texto de convite para os clientes avaliarem sua empresa no Google."
                />
              </label>
              <input
                type="text"
                value={rev.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Avaliar no Google"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Texto de Avaliação / Nota</span>
                <InfoTooltip
                  title="Nota e Estrelas"
                  text="Exibe a nota média ou contagem de avaliações (ex: 5.0 ★★★★★ com +500 reviews)."
                />
              </label>
              <input
                type="text"
                value={rev.ratingText || ''}
                onChange={(e) => update({ ratingText: e.target.value })}
                placeholder="Ex: 5.0 ★★★★★ (Mais de 500 avaliações)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Link Direto de Avaliação do Google *</span>
              <InfoTooltip
                title="Link de Avaliação Google"
                text="Cole o link do seu perfil Google Meu Negócio / Maps que abre a janela de 5 estrelas direto."
              />
            </label>
            <input
              type="text"
              value={rev.reviewUrl}
              onChange={(e) => update({ reviewUrl: e.target.value })}
              placeholder="https://g.page/r/seu-link/review"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Cole o link direto do perfil da sua empresa no Google Maps / Google Meu Negócio para abrir a tela de 5 estrelas direto.
            </p>
          </div>
        </div>
      );
    }

    case 'wifi': {
      const wifi = block as WifiBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Botão WiFi *</span>
                <InfoTooltip
                  title="WiFi Rápido"
                  text="Título do botão que abre o pop-up com QR Code e cópia rápida de senha."
                />
              </label>
              <input
                type="text"
                value={wifi.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: WiFi Grátis para Clientes"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Nome da Rede (SSID) *</span>
                <InfoTooltip
                  title="Nome da Rede WiFi"
                  text="O nome exato da rede sem fio do seu comércio ou escritório."
                />
              </label>
              <input
                type="text"
                value={wifi.networkName}
                onChange={(e) => update({ networkName: e.target.value })}
                placeholder="Ex: WiFi_Restaurante"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Senha do WiFi *</span>
                <InfoTooltip
                  title="Senha da Rede"
                  text="A senha que o cliente copiará com 1 clique ou escaneará via QR Code."
                />
              </label>
              <input
                type="text"
                value={wifi.password}
                onChange={(e) => update({ password: e.target.value })}
                placeholder="Ex: senhadowifi123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Tipo de Segurança</span>
                <InfoTooltip
                  title="Criptografia WiFi"
                  text="WPA/WPA2 é a mais comum para roteadores modernos."
                />
              </label>
              <select
                value={wifi.encryption || 'WPA'}
                onChange={(e) => update({ encryption: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="WPA">WPA / WPA2 (Padrão)</option>
                <option value="WEP">WEP (Antigo)</option>
                <option value="nopass">Sem Senha (Aberta)</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Quando o visitante clicar, abrirá um modal interativo com botão para copiar a senha com 1 clique e QR Code para escanear com a câmera e conectar automaticamente.
          </p>
        </div>
      );
    }

    case 'link': {
      const link = block as LinkBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Link *</span>
                <InfoTooltip
                  title="Título Principal"
                  text="Texto de destaque principal do botão de link."
                />
              </label>
              <input
                type="text"
                value={link.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Meu Novo Curso 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Endereço Web (URL) *</span>
                <InfoTooltip
                  title="Destino do Link"
                  text="Endereço web para onde o usuário será redirecionado ao clicar (ex: https://meusite.com)."
                />
              </label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => update({ url: e.target.value })}
                placeholder="https://exemplo.com/pagina"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Subtítulo / Descrição Curta</span>
              <InfoTooltip
                title="Subtítulo Opcional"
                text="Texto complementar exibido logo abaixo do título no botão."
              />
            </label>
            <input
              type="text"
              value={link.subtitle || ''}
              onChange={(e) => update({ subtitle: e.target.value })}
              placeholder="Ex: Assista a 3 aulas gratuitas com certificado"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      );
    }

    case 'bento': {
      const bento = block as BentoBlock;
      const handleUpdateItem = (id: string, partial: any) => {
        update({
          items: bento.items.map((it) => (it.id === id ? { ...it, ...partial } : it)),
        });
      };
      const handleAddItem = () => {
        const newItem = {
          id: 'bi_' + Math.random().toString(36).substring(2, 8),
          title: 'Novo Card',
          subtitle: 'Descrição rápida',
          url: 'https://',
          icon: 'Sparkles',
        };
        update({ items: [...bento.items, newItem] });
      };
      const handleRemoveItem = (id: string) => {
        update({ items: bento.items.filter((it) => it.id !== id) });
      };

      return (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <span>Colunas:</span>
                <InfoTooltip
                  title="Layout do Grid Bento"
                  text="Organize 2 ou 3 mini cards lado a lado na mesma linha."
                />
              </label>
              <button
                type="button"
                onClick={() => update({ columns: 2 })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  bento.columns === 2 ? 'bg-sky-500 text-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                2 Colunas
              </button>
              <button
                type="button"
                onClick={() => update({ columns: 3 })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  bento.columns === 3 ? 'bg-sky-500 text-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                3 Colunas
              </button>
            </div>

            <Tooltip content="Adicionar um novo card à grade bento">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Mini Card
              </button>
            </Tooltip>
          </div>

          <div className="space-y-2">
            {bento.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-700 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                  placeholder="Título"
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => handleUpdateItem(item.id, { subtitle: e.target.value })}
                  placeholder="Subtítulo"
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                  placeholder="https://"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                />
                <Tooltip content="Remover este mini card">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'product': {
      const prod = block as ProductBlock;
      return (
        <div className="space-y-4 pt-2">
          {/* Carrossel de Fotos & Vídeos (Upload Celular/PC e Links) */}
          <div className="pb-4 border-b border-slate-800">
            <ProductMediaManager
              media={prod.media}
              imageUrl={prod.imageUrl}
              autoPlayCarousel={prod.autoPlayCarousel}
              onUpdate={(mediaData) => update(mediaData)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Nome do Produto / Serviço *</span>
                <InfoTooltip
                  title="Nome do Produto"
                  text="Título do produto, curso ou mentoria que será exibido no card da loja."
                />
              </label>
              <input
                type="text"
                value={prod.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Mentoria VIP 1-on-1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Link de Compra / Checkout / Contratação *</span>
                <InfoTooltip
                  title="Link de Checkout"
                  text="Cole o link da sua página de vendas, WhatsApp ou checkout de pagamento."
                />
              </label>
              <input
                type="text"
                value={prod.url}
                onChange={(e) => update({ url: e.target.value })}
                placeholder="https://checkout.com/produto"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <span>Descrição Curta do Produto / Serviço</span>
                <InfoTooltip
                  title="Descrição do Item"
                  text="Destaque as principais características ou benefícios em poucas palavras."
                />
              </label>
              <button
                type="button"
                onClick={() => handleEnhanceProductDesc(prod.description, prod.title)}
                disabled={isEnhancingProductDesc}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 transition-all disabled:opacity-50"
              >
                {isEnhancingProductDesc ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>{isEnhancingProductDesc ? 'Gerando...' : 'Sugerir com IA'}</span>
              </button>
            </div>
            <input
              type="text"
              value={prod.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Ex: Edição limitada com frete grátis para todo o Brasil"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            {productDescSuggestions.length > 0 && (
              <div className="mt-2 p-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                  <span>✨ Sugestões vendedoras da IA:</span>
                  <button type="button" onClick={() => setProductDescSuggestions([])} className="text-slate-500 hover:text-slate-300">
                    Fechar
                  </button>
                </div>
                {productDescSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      update({ description: s });
                      setProductDescSuggestions([]);
                    }}
                    className="w-full text-left p-1.5 rounded-lg text-xs text-slate-200 hover:text-white bg-slate-900/60 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>


          <div className="pb-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <span>Comprar via WhatsApp</span>
                <InfoTooltip
                  title="Compra via WhatsApp"
                  text="Ativa um botão que abre o WhatsApp com uma mensagem pronta com o nome e preço do produto."
                />
              </label>
              <button
                type="button"
                onClick={() => update({ enableWhatsappBuy: !prod.enableWhatsappBuy })}
                className={`relative w-10 h-5 rounded-full transition-colors ${prod.enableWhatsappBuy ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${prod.enableWhatsappBuy ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
            {prod.enableWhatsappBuy && (
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Número do WhatsApp (opcional)</label>
                <input
                  type="text"
                  value={prod.whatsappNumber || ''}
                  onChange={(e) => update({ whatsappNumber: e.target.value })}
                  placeholder="Ex: 5511999999999 (vazio = usa o do perfil)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition-all"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Preço Atual *</span>
                <InfoTooltip
                  title="Preço de Venda"
                  text="Valor promocional ou preço atual do item (ex: R$ 197,00)."
                />
              </label>
              <input
                type="text"
                value={prod.price}
                onChange={(e) => update({ price: e.target.value })}
                placeholder="R$ 197,00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Preço Original (Riscado)</span>
                <InfoTooltip
                  title="Preço Original"
                  text="Valor antes do desconto para criar ancoragem de preço (ex: R$ 397,00)."
                />
              </label>
              <input
                type="text"
                value={prod.originalPrice || ''}
                onChange={(e) => update({ originalPrice: e.target.value })}
                placeholder="R$ 397,00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Tag / Badge de Destaque</span>
                <InfoTooltip
                  title="Badge Promocional"
                  text="Etiqueta no card (ex: OFERTA, 50% OFF, Mais Vendido, Frete Grátis)."
                />
              </label>
              <input
                type="text"
                value={prod.badge || ''}
                onChange={(e) => update({ badge: e.target.value })}
                placeholder="Ex: OFERTA, 50% OFF"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Texto do Botão</span>
              <InfoTooltip
                title="Botão de Compra"
                text="Texto da ação de checkout (ex: Comprar Agora, Garantir Vaga, Contratar Serviço)."
              />
            </label>
            <input
              type="text"
              value={prod.buttonText}
              onChange={(e) => update({ buttonText: e.target.value })}
              placeholder="Comprar Agora"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      );
    }

    case 'pix': {
      const pix = block as PixBlock;
      const amounts = pix.suggestedAmounts || [];

      const handleAddAmount = () => update({ suggestedAmounts: [...amounts, ''] });
      const handleChangeAmount = (index: number, value: string) => {
        const next = [...amounts];
        next[index] = value;
        update({ suggestedAmounts: next });
      };
      const handleBlurAmount = (index: number) => {
        const raw = amounts[index] || '';
        const normalized = normalizePixAmount(raw);
        if (normalized === raw) return;
        const next = [...amounts];
        if (normalized) {
          next[index] = normalized;
        } else {
          // Valor vazio ou inválido: remove a entrada.
          next.splice(index, 1);
        }
        update({ suggestedAmounts: next });
      };
      const handleRemoveAmount = (index: number) => {
        update({ suggestedAmounts: amounts.filter((_, i) => i !== index) });
      };

      return (
        <div className="space-y-4 pt-2">
          {/* Style selector */}
          <div className="pb-4 border-b border-slate-800">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Estilo de Exibição do Pix</span>
              <InfoTooltip
                title="Formato do PIX"
                text="Escolha entre um botão discreto que abre modal com QR Code ou um card fixo já visível na página."
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ displayStyle: 'button' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  pix.displayStyle === 'button'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔘 Botão Limpo c/ Pop-up QR Code
              </button>
              <button
                type="button"
                onClick={() => update({ displayStyle: 'card' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  pix.displayStyle !== 'button'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                🗂️ Card Aberto na Página
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Bloco PIX</span>
                <InfoTooltip
                  title="Título do PIX"
                  text="Título do botão ou card (ex: Apoie meu canal via PIX, Gorjeta do Criador)."
                />
              </label>
              <input
                type="text"
                value={pix.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Apoie meu canal via PIX"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Tipo da Chave</span>
                <InfoTooltip
                  title="Tipo da Chave"
                  text="Tipo cadastrado no seu banco para formatação automática."
                />
              </label>
              <select
                value={pix.pixKeyType}
                onChange={(e) => update({ pixKeyType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Chave PIX Exata *</span>
                <InfoTooltip
                  title="Chave PIX"
                  text="Sua chave que será copiada com 1 clique pelo visitante ao clicar no botão."
                />
              </label>
              <input
                type="text"
                value={pix.pixKey}
                onChange={(e) => update({ pixKey: e.target.value })}
                placeholder="Ex: contato@meusite.com.br ou 12345678900"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Nome do Titular</span>
                <InfoTooltip
                  title="Nome do Beneficiário"
                  text="Nome de quem vai receber o PIX para confirmação segura do pagador."
                />
              </label>
              <input
                type="text"
                value={pix.recipientName}
                onChange={(e) => update({ recipientName: e.target.value })}
                placeholder="Ex: Camila Rocha"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Mensagem / Motivo do Apoio</span>
              <InfoTooltip
                title="Mensagem de Apoio"
                text="Breve agradecimento ou explicação do destino do apoio."
              />
            </label>
            <input
              type="text"
              value={pix.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Ex: Sua contribuição ajuda a manter o conteúdo 100% gratuito!"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <span>Valores Sugeridos</span>
                <InfoTooltip
                  title="Valores Sugeridos"
                  text="Valores rápidos que geram um QR Code com valor fixo. Deixe vazio para exibir apenas o QR Code aberto."
                />
              </label>
              <button
                type="button"
                onClick={handleAddAmount}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar valor
              </button>
            </div>
            {amounts.length > 0 ? (
              <div className="space-y-2">
                {amounts.map((amt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={amt}
                      onChange={(e) => handleChangeAmount(i, e.target.value)}
                      onBlur={() => handleBlurAmount(i)}
                      placeholder="Ex: R$ 10 ou 10,00"
                      inputMode="decimal"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAmount(i)}
                      aria-label="Remover valor"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Sem valores sugeridos — o bloco exibirá apenas o QR Code aberto.</p>
            )}
          </div>
        </div>
      );
    }

    case 'whatsapp': {
      const wa = block as WhatsAppBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Bloco</span>
                <InfoTooltip
                  title="Título do WhatsApp"
                  text="Texto de destaque no botão (ex: Fale comigo no WhatsApp, Orçamento Rápido)."
                />
              </label>
              <input
                type="text"
                value={wa.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Fale comigo no WhatsApp"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Número com DDD (Apenas números) *</span>
                <InfoTooltip
                  title="Número do WhatsApp"
                  text="Inclua o código 55 do Brasil + DDD + 9 dígitos (ex: 5511999999999)."
                />
              </label>
              <input
                type="text"
                value={wa.phoneNumber}
                onChange={(e) => update({ phoneNumber: e.target.value })}
                placeholder="5511999999999"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="pb-4 border-b border-slate-800">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Mensagem Pré-preenchida</span>
              <InfoTooltip
                title="Mensagem Pronta"
                text="Texto que já vem pronto na conversa quando o cliente clicar para iniciar o chat."
              />
            </label>
            <input
              type="text"
              value={wa.defaultMessage}
              onChange={(e) => update({ defaultMessage: e.target.value })}
              placeholder="Ex: Olá! Vim através do seu link na bio e gostaria de tirar uma dúvida."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Subtítulo</span>
                <InfoTooltip
                  title="Subtítulo do WhatsApp"
                  text="Instrução de atendimento (ex: Atendimento rápido em até 10 minutos)."
                />
              </label>
              <input
                type="text"
                value={wa.subtitle || ''}
                onChange={(e) => update({ subtitle: e.target.value })}
                placeholder="Atendimento rápido em até 10 minutos"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Texto do Botão</span>
                <InfoTooltip
                  title="Ação do WhatsApp"
                  text="Texto de chamada do botão (ex: Iniciar Conversa, Chamar no Zap)."
                />
              </label>
              <input
                type="text"
                value={wa.buttonText}
                onChange={(e) => update({ buttonText: e.target.value })}
                placeholder="Iniciar Conversa"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'countdown': {
      const cd = block as CountdownBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Cronômetro</span>
                <InfoTooltip
                  title="Contagem Regressiva"
                  text="Título do evento ou encerramento (ex: Lançamento do Novo Livro, Fim das Vagas)."
                />
              </label>
              <input
                type="text"
                value={cd.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Lançamento do Novo Livro"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Data e Hora Alvo *</span>
                <InfoTooltip
                  title="Data Limite"
                  text="Quando o cronômetro chegar a zero, a contagem será finalizada."
                />
              </label>
              <input
                type="datetime-local"
                value={cd.targetDate ? cd.targetDate.substring(0, 16) : ''}
                onChange={(e) => update({ targetDate: new Date(e.target.value).toISOString() })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Texto do Botão (Opcional)</span>
                <InfoTooltip
                  title="Botão de Inscrição"
                  text="Texto de chamada do botão sob o cronômetro (ex: Entrar na Lista de Espera)."
                />
              </label>
              <input
                type="text"
                value={cd.buttonText || ''}
                onChange={(e) => update({ buttonText: e.target.value })}
                placeholder="Ex: Entrar na Lista de Espera"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Link do Botão</span>
                <InfoTooltip
                  title="Destino do Botão"
                  text="Link da página de inscrição ou compra do evento."
                />
              </label>
              <input
                type="text"
                value={cd.buttonUrl || ''}
                onChange={(e) => update({ buttonUrl: e.target.value })}
                placeholder="https://"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'faq': {
      const faq = block as FaqBlock;
      const handleUpdateItem = (id: string, partial: any) => {
        update({
          items: faq.items.map((it) => (it.id === id ? { ...it, ...partial } : it)),
        });
      };
      const handleAddItem = () => {
        const newItem = {
          id: 'faq_' + Math.random().toString(36).substring(2, 8),
          question: 'Nova Pergunta Frequente?',
          answer: 'Resposta detalhada para seus visitantes.',
        };
        update({ items: [...faq.items, newItem] });
      };
      const handleRemoveItem = (id: string) => {
        update({ items: faq.items.filter((it) => it.id !== id) });
      };

      return (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-1 mr-2">
              <input
                type="text"
                value={faq.title || ''}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Título da Seção de Dúvidas (Ex: FAQ)"
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              <InfoTooltip
                title="Título do FAQ"
                text="Título do bloco de perguntas e respostas expansíveis."
              />
            </div>
            <Tooltip content="Adicionar nova pergunta ao FAQ">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Pergunta
              </button>
            </Tooltip>
          </div>

          <div className="space-y-3">
            {faq.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => handleUpdateItem(item.id, { question: e.target.value })}
                    placeholder="Pergunta..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                  <Tooltip content="Remover esta pergunta">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={(e) => handleUpdateItem(item.id, { answer: e.target.value })}
                  placeholder="Resposta..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'video': {
      const vid = block as VideoBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="pb-4 border-b border-slate-800">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Link do Vídeo (YouTube ou Vimeo) *</span>
              <InfoTooltip
                title="URL do Vídeo"
                text="Cole o link completo do vídeo no YouTube ou Vimeo para incorporá-lo na bio."
              />
            </label>
            <input
              type="text"
              value={vid.videoUrl}
              onChange={(e) => update({ videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Vídeo</span>
                <InfoTooltip
                  title="Título do Vídeo"
                  text="Título descritivo exibido acima do player."
                />
              </label>
              <input
                type="text"
                value={vid.title || ''}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Assista meu último vlog"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Legenda / Créditos</span>
                <InfoTooltip
                  title="Créditos do Vídeo"
                  text="Texto de rodapé exibido logo abaixo do player."
                />
              </label>
              <input
                type="text"
                value={vid.caption || ''}
                onChange={(e) => update({ caption: e.target.value })}
                placeholder="Ex: Direção por Studio Neon"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'audio': {
      const aud = block as AudioBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="pb-4 border-b border-slate-800">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Link do Embed Spotify ou SoundCloud *</span>
              <InfoTooltip
                title="Embed de Música"
                text="Cole o link do Spotify Embed ou SoundCloud para tocar a música diretamente na bio."
              />
            </label>
            <input
              type="text"
              value={aud.embedUrl}
              onChange={(e) => update({ embedUrl: e.target.value })}
              placeholder="https://open.spotify.com/embed/track/..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título da Música / Faixa</span>
                <InfoTooltip
                  title="Título da Faixa"
                  text="Nome da música ou episódio de podcast."
                />
              </label>
              <input
                type="text"
                value={aud.title || ''}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Novo Single no Spotify"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Legenda / Álbum</span>
                <InfoTooltip
                  title="Álbum ou Artista"
                  text="Informações adicionais do artista ou álbum."
                />
              </label>
              <input
                type="text"
                value={aud.caption || ''}
                onChange={(e) => update({ caption: e.target.value })}
                placeholder="Ex: Álbum Frequência Solar"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'text': {
      const txt = block as TextBlock;
      return (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Título do Bloco (Opcional)</span>
                <InfoTooltip
                  title="Título do Texto"
                  text="Cabeçalho opcional para seu recado ou comunicado."
                />
              </label>
              <input
                type="text"
                value={txt.title || ''}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Ex: Aviso Importante"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
                <span>Alinhamento do Texto</span>
                <InfoTooltip
                  title="Alinhamento"
                  text="Posicionamento do texto: esquerda, centro ou direita."
                />
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => update({ alignment: align })}
                    className={`py-1.5 text-xs rounded-xl font-medium capitalize focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      txt.alignment === align
                        ? 'bg-sky-500 text-black font-bold'
                        : 'bg-slate-950 border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {align === 'left' ? 'Esq.' : align === 'center' ? 'Centro' : 'Dir.'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-4 border-b border-slate-800">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Conteúdo do Texto</span>
              <InfoTooltip
                title="Mensagem ou Aviso"
                text="Escreva um comunicado, biografia, citação ou nota importante."
              />
            </label>
            <textarea
              rows={3}
              value={txt.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="Escreva um comunicado, citação ou nota aqui..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={txt.highlight}
                onChange={(e) => update({ highlight: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-2 focus:ring-emerald-500/50"
              />
              <span>Destacar como caixa de aviso colorida</span>
            </label>
            <InfoTooltip
              title="Destaque Visual"
              text="Adiciona uma cor de fundo sutil com borda brilhante para chamar atenção ao recado."
            />
          </div>
        </div>
      );
    }

    case 'gallery': {
      const gal = block as GalleryBlock;
      return (
        <GalleryBlockEditor
          block={gal}
          update={(changes) => update(changes)}
        />
      );
    }

    default:
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft / Published status toggle toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-700">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>Status na Página:</span>
            <InfoTooltip
              title="Visibilidade do Bloco"
              text="Blocos publicados aparecem na sua bio online. Blocos em rascunho ficam ocultos temporariamente sem serem apagados."
            />
          </span>
        </div>

        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => update({ enabled: true, status: 'published' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
              !isDraft
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publicado</span>
          </button>
          <button
            type="button"
            onClick={() => update({ enabled: false, status: 'draft' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
              isDraft
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Rascunho</span>
          </button>
        </div>
      </div>

      {/* Universal Appearance, Icon, Badge, Animation & Highlight section */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Personalização Visual (Ícone, Tag e Efeito)</span>
            <InfoTooltip
              title="Personalização Visual Completa"
              text="Adicione ícone temático, tag de destaque (badge), animação de clique ou destaque luminoso a qualquer bloco."
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Icon picker button */}
          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Ícone</span>
              <InfoTooltip
                title="Ícone do Botão"
                text="Escolha um ícone temático para ilustrar este bloco ou clique para alterar."
              />
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 flex items-center justify-between hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <span className="flex items-center gap-2 truncate">
                  {renderDynamicIcon(block.icon || 'Link', 'w-3.5 h-3.5 shrink-0', {
                    color: block.customIconColor || '#38bdf8',
                  })}
                  <span className="truncate">{block.icon || 'Selecionar'}</span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 ml-1">Alterar</span>
              </button>
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <IconSelector
                    selectedIcon={block.icon}
                    onSelect={(icon) => {
                      update({ icon });
                      setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Badge label */}
          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Tag / Badge</span>
              <InfoTooltip
                title="Badge Promocional"
                text="Etiqueta pequena destacada (ex: NOVO, 50% OFF, POPULAR, VAGAS ABERTAS)."
              />
            </label>
            <input
              type="text"
              value={block.badge || ''}
              onChange={(e) => update({ badge: e.target.value })}
              placeholder="Ex: NOVO, 50% OFF"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Animation effect */}
          <div>
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
              <span>Efeito Visual</span>
              <InfoTooltip
                title="Animação do Botão"
                text="Chame mais atenção com pulsação contínua, brilho neon, efeito de pulo ou tremor."
              />
            </label>
            <select
              value={block.animation || 'none'}
              onChange={(e) => update({ animation: e.target.value as ButtonAnimation })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            >
              <option value="none">Nenhum</option>
              <option value="pulse">✨ Pulsação Contínua</option>
              <option value="glow">💡 Brilho Neon (Glow)</option>
              <option value="shimmer">⚡ Reflexo / Shimmer</option>
              <option value="bounce">🚀 Pulo ao Passar Mouse</option>
              <option value="wobble">📳 Tremor / Wobble</option>
            </select>
          </div>
        </div>

        {/* Dedicated Icon Color Customization for ANY block when icon is selected */}
        {block.icon && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-sky-400" />
              <span>Cor Específica deste Ícone ({block.icon})</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Cor do Ícone</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={getValidPickerHex(block.customIconColor, '#38bdf8')}
                    onChange={(e) => update({ customIconColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                  />
                  <input
                    type="text"
                    value={block.customIconColor || ''}
                    onChange={(e) => update({ customIconColor: e.target.value ? normalizeHex(e.target.value) : undefined })}
                    placeholder="Padrão do tema"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Fundo do Ícone</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={getValidPickerHex(block.customIconBgColor, '#0f172a')}
                    onChange={(e) => update({ customIconBgColor: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                  />
                  <input
                    type="text"
                    value={block.customIconBgColor || ''}
                    onChange={(e) => update({ customIconBgColor: e.target.value ? normalizeHex(e.target.value) : undefined })}
                    placeholder="Transparente / Tema"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={!!block.featured}
              onChange={(e) => update({ featured: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-2 focus:ring-emerald-500/50"
            />
            <span>Destacar este card com borda iluminada</span>
          </label>
          <InfoTooltip
            title="Card em Destaque"
            text="Adiciona uma borda com gradiente e leve brilho para dar destaque especial ao bloco."
          />
        </div>
      </div>

      {/* Block Specific Content Form */}
      {renderBlockControls()}

      {/* Universal Block Color & Styling Customizer */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-sky-400" />
            <span>Personalizar Cores deste Botão / Card</span>
            <InfoTooltip
              title="Cores Individuais"
              text="Mude a cor de fundo, cor do texto ou cor do botão deste bloco independentemente do tema geral."
            />
          </label>

          {(block.customColor || block.customTextColor || block.customBorderColor || (block as any).customButtonColor) && (
            <button
              type="button"
              onClick={() =>
                update({
                  customColor: undefined,
                  customTextColor: undefined,
                  customBorderColor: undefined,
                  ...(hasButtonColor ? { customButtonColor: undefined, customButtonTextColor: undefined } : {}),
                } as any)
              }
              className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-rose-500/50 rounded px-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar Tema Padrão</span>
            </button>
          )}
        </div>

        {hasButtonColor && (
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            Cor de Fundo do Bloco
          </span>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-slate-300">
              {hasButtonColor ? 'Prévia da cor de fundo' : 'Prévia da cor de destaque resultante'}
            </span>
            <span className="flex items-center gap-2 text-[10px] font-mono text-slate-300 shrink-0">
              <i
                className="h-4 w-4 rounded-full border border-white/20"
                style={{ backgroundColor: hasButtonColor ? (block.customColor || '#475569') : resolvedColor }}
              />
              {hasButtonColor ? (block.customColor || 'Tema (fundo do card)') : resolvedColor}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
            <span>
              {hasButtonColor
                ? block.customColor
                  ? 'Fundo customizado do bloco'
                  : 'Usa o fundo padrão do card (tema)'
                : block.customColor
                ? 'Camada 1 — cor customizada deste bloco'
                : defaultTypeColor
                ? `Camada 2 — padrão do tipo (${defaultTypeColor})`
                : 'Camada 3 — cor de destaque do tema'}
            </span>
            {block.customColor && (
              <button
                type="button"
                onClick={() => update({ customColor: undefined } as any)}
                className="text-[11px] font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-sky-500/50 rounded px-1 transition-colors shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                Usar cor padrão
              </button>
            )}
          </div>
        </div>

        {/* Quick Color Presets */}
        <div className="space-y-2 pb-3 border-b border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Cores Rápidas de Fundo:</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_BLOCK_COLORS.map((preset, idx) => {
              const isSelected = block.customColor === preset.bg;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    update({
                      customColor: preset.bg,
                      customTextColor: preset.text,
                    } as any)
                  }
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                    isSelected
                      ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-sm bg-slate-900'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-950'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                    style={{
                      backgroundColor: preset.bg || '#475569',
                    }}
                  />
                  <span className="text-slate-200 text-[11px]">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] text-slate-300 font-medium flex items-center justify-between mb-1.5">
              <span>Cor de Fundo Livre</span>
              <span className="font-mono text-[10px] text-slate-400">{block.customColor || 'Tema Global'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getValidPickerHex(block.customColor, '#e11d48')}
                onChange={(e) => update({ customColor: e.target.value } as any)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
              />
              <input
                type="text"
                value={block.customColor || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update({ customColor: val ? normalizeHex(val) : undefined } as any);
                }}
                placeholder="Ex: #e11d48 ou rgb(...)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-medium flex items-center justify-between mb-1.5">
              <span>Cor do Texto / Ícone</span>
              <span className="font-mono text-[10px] text-slate-400">{block.customTextColor || 'Tema Global'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getValidPickerHex(block.customTextColor, '#ffffff')}
                onChange={(e) => update({ customTextColor: e.target.value } as any)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
              />
              <input
                type="text"
                value={block.customTextColor || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update({ customTextColor: val ? normalizeHex(val) : undefined } as any);
                }}
                placeholder="Ex: #ffffff"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Cor do Botão de Ação (somente blocos com botão interno: schedule, whatsapp) */}
        {hasButtonColor && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              Cor do Botão
            </span>

            {/* Button layer preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-slate-300">Prévia da cor do botão</span>
                <span className="flex items-center gap-2 text-[10px] font-mono text-slate-300 shrink-0">
                  <i className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: buttonResolvedColor }} />
                  {buttonResolvedColor}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                <span>
                  {customButtonColor
                    ? 'Camada 1 — cor customizada do botão'
                    : buttonDefaultTypeColor
                    ? `Camada 2 — padrão do tipo (${buttonDefaultTypeColor})`
                    : 'Camada 3 — cor de destaque do tema'}
                </span>
                {customButtonColor && (
                  <button
                    type="button"
                    onClick={() => update({ customButtonColor: undefined } as any)}
                    className="text-[11px] font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-sky-500/50 rounded px-1 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Usar cor padrão
                  </button>
                )}
              </div>
            </div>

            {/* Button quick colors */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-medium">Cores Rápidas do Botão:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_BLOCK_COLORS.map((preset, idx) => {
                  const isSelected = customButtonColor === preset.bg;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        update({
                          customButtonColor: preset.bg,
                          customButtonTextColor: preset.text,
                        } as any)
                      }
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                        isSelected
                          ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-sm bg-slate-900'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-950'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: preset.bg || '#475569' }}
                      />
                      <span className="text-slate-200 text-[11px]">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Button free pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-medium flex items-center justify-between mb-1.5">
                  <span>Cor do Botão Livre</span>
                  <span className="font-mono text-[10px] text-slate-400">{customButtonColor || 'Padrão'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={getValidPickerHex(customButtonColor, '#25D366')}
                    onChange={(e) => update({ customButtonColor: e.target.value } as any)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                  />
                  <input
                    type="text"
                    value={customButtonColor || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      update({ customButtonColor: val ? normalizeHex(val) : undefined } as any);
                    }}
                    placeholder="Ex: #25D366"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium flex items-center justify-between mb-1.5">
                  <span>Cor do Texto do Botão</span>
                  <span className="font-mono text-[10px] text-slate-400">{(block as any).customButtonTextColor || '#ffffff (Padrão)'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={getValidPickerHex((block as any).customButtonTextColor, '#ffffff')}
                    onChange={(e) => update({ customButtonTextColor: e.target.value } as any)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5"
                  />
                  <input
                    type="text"
                    value={(block as any).customButtonTextColor || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      update({ customButtonTextColor: val ? normalizeHex(val) : undefined } as any);
                    }}
                    placeholder="#ffffff"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
