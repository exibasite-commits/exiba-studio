import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  ContentBlock,
  BlockType,
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
  GoogleReviewBlock,
  WifiBlock,
  GalleryBlock,
} from '../../types';
import { SortableBlockItem, BlockDragOverlayPreview } from './SortableBlockItem';
import { Tooltip, InfoTooltip } from '../common/Tooltip';
import {
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Layers,
  Video,
  Music,
  ShoppingBag,
  DollarSign,
  Send,
  Clock,
  HelpCircle,
  FileText,
  Sparkles,
  MousePointerClick,
  GripVertical,
  Star,
  Wifi,
  Calendar,
  CheckCircle2,
  Images,
  Search,
  X,
} from 'lucide-react';

interface BlocksEditorProps {
  blocks: ContentBlock[];
  onChangeBlocks: (updated: ContentBlock[]) => void;
  siteId?: string;
}

const BLOCK_CATALOG: {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  {
    type: 'gallery',
    label: 'Galeria de Serviços (Fotos & Vídeos)',
    description: 'Mostre fotos e vídeos dos serviços prestados em grade ou carrossel com tela cheia (sem links de compra).',
    icon: Images,
    badge: 'Portfólio',
  },
  {
    type: 'schedule',
    label: 'Agendamento / Agenda Online',
    description: 'Botão de agendar consulta com Calendly, Google Agenda ou WhatsApp.',
    icon: Calendar,
    badge: 'Novo',
  },
  {
    type: 'google_review',
    label: 'Avaliação Google (Estrelas)',
    description: 'Botão para clientes avaliarem no Google com nota e estrelas.',
    icon: Star,
    badge: 'Destaque',
  },
  {
    type: 'wifi',
    label: 'Conectar ao WiFi (QR Code)',
    description: 'Abre pop-up com senha rápida e QR Code para seus clientes.',
    icon: Wifi,
    badge: 'Novo',
  },
  {
    type: 'link',
    label: 'Link / Botão',
    description: 'Botão de link clássico com ícone, subtítulo e animações.',
    icon: LinkIcon,
  },
  {
    type: 'bento',
    label: 'Grid Bento (Mini Cards)',
    description: 'Grade de 2 ou 3 cards compactos lado a lado.',
    icon: Layers,
    badge: 'Popular',
  },
  {
    type: 'pix',
    label: 'PIX / Apoie & Gorjeta',
    description: 'Chave PIX com botão de copiar 1-clique e QR Code interativo.',
    icon: DollarSign,
    badge: 'Brasil',
  },
  {
    type: 'whatsapp',
    label: 'WhatsApp Direto',
    description: 'Botão com mensagem pronta para fechar vendas no WhatsApp.',
    icon: Send,
  },
  {
    type: 'product',
    label: 'Produto / Loja',
    description: 'Card com foto, preço de/por e botão de compra.',
    icon: ShoppingBag,
  },
  {
    type: 'video',
    label: 'Vídeo (YouTube / Vimeo)',
    description: 'Player de vídeo incorporado direto na sua bio.',
    icon: Video,
  },
  {
    type: 'audio',
    label: 'Música / Spotify',
    description: 'Player do Spotify ou SoundCloud para suas músicas.',
    icon: Music,
  },
  {
    type: 'countdown',
    label: 'Contagem Regressiva',
    description: 'Cronômetro ao vivo para lançamentos ou promoções.',
    icon: Clock,
  },
  {
    type: 'faq',
    label: 'FAQ / Sanfona de Dúvidas',
    description: 'Perguntas e respostas expansíveis.',
    icon: HelpCircle,
  },
  {
    type: 'text',
    label: 'Texto / Nota ou Aviso',
    description: 'Bloco de texto formatado ou banner de comunicado.',
    icon: FileText,
  },
];

export function BlocksEditor({ blocks, onChangeBlocks, siteId }: BlocksEditorProps) {
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    blocks[0]?.id || null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChangeBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;
  const activeCatalogItem = activeBlock
    ? BLOCK_CATALOG.find((c) => c.type === activeBlock.type)
    : undefined;

  // Filter blocks based on search query
  const filteredBlocks = blocks.filter((block) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const catalogItem = BLOCK_CATALOG.find((c) => c.type === block.type);
    const label = catalogItem?.label.toLowerCase() || '';
    const type = block.type.toLowerCase();
    let title = '';
    if ('title' in block && block.title) title = block.title.toLowerCase();
    let subtitle = '';
    if ('subtitle' in block && block.subtitle) subtitle = block.subtitle.toLowerCase();

    return (
      title.includes(q) ||
      subtitle.includes(q) ||
      label.includes(q) ||
      type.includes(q)
    );
  });

  const handleAddBlock = (type: BlockType) => {
    const id = 'blk_' + Math.random().toString(36).substring(2, 9);
    let newBlock: ContentBlock;

    switch (type) {
      case 'schedule':
        newBlock = {
          id,
          type: 'schedule',
          enabled: true,
          status: 'published',
          title: 'Agendar Consulta / Horário',
          subtitle: 'Escolha o melhor dia e horário na agenda online',
          bookingUrl: 'https://calendly.com/',
          platform: 'calendly',
          badge: 'Vagas Abertas',
          buttonText: 'Ver Horários',
          durationText: '45 min',
          icon: 'Calendar',
          animation: 'none',
          featured: false,
        };
        break;

      case 'google_review':
        newBlock = {
          id,
          type: 'google_review',
          enabled: true,
          status: 'published',
          title: 'Avaliar no Google',
          subtitle: 'Sua opinião é fundamental para nós',
          reviewUrl: 'https://g.page/r/sua-empresa/review',
          ratingText: '5.0 ★★★★★ (Mais de 500 avaliações)',
          icon: 'Star',
          badge: '5 Estrelas',
          animation: 'none',
          featured: false,
        };
        break;

      case 'wifi':
        newBlock = {
          id,
          type: 'wifi',
          enabled: true,
          status: 'published',
          title: 'WiFi Grátis para Clientes',
          subtitle: 'Conecte-se à nossa rede de alta velocidade',
          networkName: 'WiFi_Visitantes',
          password: 'senha_do_wifi',
          encryption: 'WPA',
          icon: 'Wifi',
          badge: 'Grátis',
          animation: 'none',
          featured: false,
        };
        break;

      case 'link':
        newBlock = {
          id,
          type: 'link',
          enabled: true,
          status: 'published',
          title: 'Novo Link Importante',
          subtitle: 'Clique para conferir agora',
          url: 'https://',
          icon: 'Sparkles',
          badge: 'Novo',
          animation: 'none',
          featured: false,
        };
        break;

      case 'bento':
        newBlock = {
          id,
          type: 'bento',
          enabled: true,
          status: 'published',
          title: 'Grade de Destaques',
          subtitle: 'Acesse rapidamente nossos principais links',
          columns: 2,
          animation: 'none',
          featured: false,
          items: [
            {
              id: 'bi_' + Math.random().toString(36).substring(2, 7),
              title: 'Destaque 1',
              subtitle: 'Acesse rápido',
              url: 'https://',
              icon: 'Flame',
            },
            {
              id: 'bi_' + Math.random().toString(36).substring(2, 7),
              title: 'Destaque 2',
              subtitle: 'Mais detalhes',
              url: 'https://',
              icon: 'Star',
            },
          ],
        };
        break;

      case 'pix':
        newBlock = {
          id,
          type: 'pix',
          enabled: true,
          status: 'published',
          title: 'Apoie o Projeto via PIX',
          subtitle: 'Contribua diretamente e fortaleça nosso trabalho',
          description: 'Qualquer contribuição ajuda muito!',
          pixKey: 'suachave@pix.com.br',
          pixKeyType: 'email',
          recipientName: 'Seu Nome ou Empresa',
          suggestedAmounts: ['R$ 5', 'R$ 10', 'R$ 20'],
          icon: 'QrCode',
          badge: 'PIX Direto',
          animation: 'none',
          featured: false,
        };
        break;

      case 'whatsapp':
        newBlock = {
          id,
          type: 'whatsapp',
          enabled: true,
          status: 'published',
          title: 'Atendimento via WhatsApp',
          subtitle: 'Tire suas dúvidas em tempo real',
          phoneNumber: '5511999999999',
          defaultMessage: 'Olá! Vim através do seu site.',
          buttonText: 'Chamar no WhatsApp',
          icon: 'MessageCircle',
          badge: 'Online',
          animation: 'none',
          featured: false,
        };
        break;

      case 'product':
        newBlock = {
          id,
          type: 'product',
          enabled: true,
          status: 'published',
          title: 'Novo Produto em Promoção',
          subtitle: 'Oferta exclusiva por tempo limitado',
          description: 'Edição limitada com frete grátis.',
          price: 'R$ 97,00',
          originalPrice: 'R$ 150,00',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          media: [
            {
              id: 'med_p1',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
              title: 'Foto 1 - Produto',
            },
            {
              id: 'med_p2',
              type: 'video',
              url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hot-coffee-being-poured-into-a-cup-41549-large.mp4',
              title: 'Vídeo Demonstrativo',
            },
            {
              id: 'med_p3',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
              title: 'Foto 2 - Detalhes',
            },
          ],
          autoPlayCarousel: true,
          url: 'https://',
          buttonText: 'Comprar Agora',
          badge: 'Oferta',
          icon: 'ShoppingBag',
          animation: 'none',
          featured: false,
        };
        break;

      case 'video':
        newBlock = {
          id,
          type: 'video',
          enabled: true,
          status: 'published',
          title: 'Assista ao Vídeo',
          subtitle: 'Conteúdo exclusivo em vídeo',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          caption: 'Vídeo oficial em alta definição',
          icon: 'Play',
          badge: 'Vídeo',
          animation: 'none',
          featured: false,
        };
        break;

      case 'audio':
        newBlock = {
          id,
          type: 'audio',
          enabled: true,
          status: 'published',
          title: 'Ouça no Spotify',
          subtitle: 'Faixa exclusiva em streaming',
          embedUrl: 'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT',
          caption: 'Disponível no streaming',
          icon: 'Music',
          badge: 'Áudio',
          animation: 'none',
          featured: false,
        };
        break;

      case 'countdown':
        newBlock = {
          id,
          type: 'countdown',
          enabled: true,
          status: 'published',
          title: 'Contagem Regressiva',
          subtitle: 'Faltam poucos dias para a grande estreia',
          targetDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          buttonText: 'Participar do Evento',
          buttonUrl: 'https://',
          icon: 'Timer',
          badge: 'Em Breve',
          animation: 'none',
          featured: false,
        };
        break;

      case 'gallery':
        newBlock = {
          id,
          type: 'gallery',
          enabled: true,
          status: 'published',
          title: 'Nossos Serviços Realizados',
          subtitle: 'Confira fotos e vídeos dos trabalhos entregues',
          layout: 'grid-2',
          aspectRatio: 'square',
          showCaptions: true,
          autoPlayCarousel: true,
          enableLightbox: true,
          showCategoriesFilter: true,
          icon: 'Images',
          badge: 'Portfólio',
          animation: 'none',
          featured: false,
          items: [
            {
              id: 'gal_1',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
              imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
              title: 'Coloração & Mechas Iluminadas',
              caption: 'Técnica de iluminação suave com tratamento reconstrutor.',
              category: 'Coloração',
            },
            {
              id: 'gal_2',
              type: 'video',
              url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hot-coffee-being-poured-into-a-cup-41549-large.mp4',
              imageUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hot-coffee-being-poured-into-a-cup-41549-large.mp4',
              title: 'Vídeo - Finalização com Escova Modelada',
              caption: 'Brilho espelhado e movimento natural dos fios.',
              category: 'Finalização',
            },
            {
              id: 'gal_3',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
              imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
              title: 'Penteado para Noivas & Eventos',
              caption: 'Semi-preso elegante para eventos e festas.',
              category: 'Penteados',
            },
            {
              id: 'gal_4',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&auto=format&fit=crop&q=80',
              imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&auto=format&fit=crop&q=80',
              title: 'Corte em Camadas Moderno',
              caption: 'Leveza e definição para cabelos médios e longos.',
              category: 'Cortes',
            },
          ],
        };
        break;

      case 'faq':
        newBlock = {
          id,
          type: 'faq',
          enabled: true,
          status: 'published',
          title: 'Perguntas Frequentes',
          subtitle: 'Tire suas principais dúvidas',
          icon: 'HelpCircle',
          badge: 'FAQ',
          animation: 'none',
          featured: false,
          items: [
            {
              id: 'fq_1',
              question: 'Como funciona a entrega?',
              answer: 'O envio é imediato logo após a confirmação.',
            },
          ],
        };
        break;

      case 'text':
      default:
        newBlock = {
          id,
          type: 'text',
          enabled: true,
          status: 'published',
          title: 'Aviso Importante',
          subtitle: 'Comunicado oficial',
          content: 'Escreva seu comunicado ou mensagem de boas-vindas aqui.',
          alignment: 'center',
          highlight: false,
          icon: 'FileText',
          badge: 'Aviso',
          animation: 'none',
          featured: false,
        };
        break;
    }

    onChangeBlocks([newBlock, ...blocks]);
    setExpandedBlockId(id);
    setShowCatalogModal(false);
  };

  const handleUpdateBlock = (id: string, updated: ContentBlock) => {
    onChangeBlocks(blocks.map((b) => (b.id === id ? updated : b)));
  };

  const handleToggleBlock = (id: string) => {
    onChangeBlocks(
      blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const handleDuplicateBlock = (block: ContentBlock) => {
    const duplicated: ContentBlock = {
      ...block,
      id: 'blk_' + Math.random().toString(36).substring(2, 9),
    };
    const index = blocks.findIndex((b) => b.id === block.id);
    const clone = [...blocks];
    clone.splice(index + 1, 0, duplicated);
    onChangeBlocks(clone);
  };

  const handleDeleteBlock = (id: string) => {
    onChangeBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const clone = [...blocks];
    const temp = clone[index];
    clone[index] = clone[targetIndex];
    clone[targetIndex] = temp;
    onChangeBlocks(clone);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Blocos & Conteúdo</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {blocks.length}
            </span>
            <InfoTooltip
              title="Gerenciamento de Blocos"
              text="Adicione, reordene por arrastar e soltar, duplique ou oculte blocos da sua bio. Blocos em rascunho não aparecem para os visitantes."
            />
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Organize links, vitrines, vídeos e PIX em tempo real.
          </p>
        </div>

        <Tooltip content="Abrir catálogo para adicionar um novo componente à página">
          <button
            type="button"
            onClick={() => setShowCatalogModal(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Bloco</span>
          </button>
        </Tooltip>
      </div>

      {/* Search Filter Bar */}
      {blocks.length > 1 && (
        <div className="space-y-4">
          <div className="border-b border-slate-800" />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar bloco por título ou tipo (ex: WhatsApp, PIX, Instagram)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="border-b border-slate-800" />
        </div>
      )}

      {/* Blocks Accordion Stack with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={filteredBlocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {filteredBlocks.map((block) => {
              const originalIndex = blocks.findIndex((b) => b.id === block.id);
              const isExpanded = expandedBlockId === block.id;
              const catalogItem = BLOCK_CATALOG.find((c) => c.type === block.type);

              return (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  siteId={siteId}
                  index={originalIndex >= 0 ? originalIndex : 0}
                  totalBlocks={blocks.length}
                  isExpanded={isExpanded}
                  catalogItem={catalogItem}
                  onToggleExpand={() =>
                    setExpandedBlockId(isExpanded ? null : block.id)
                  }
                  onToggleStatus={() => {
                    const newEnabled = !block.enabled;
                    handleUpdateBlock(block.id, {
                      ...block,
                      enabled: newEnabled,
                      status: newEnabled ? 'published' : 'draft',
                    });
                  }}
                  onMove={(dir) => handleMove(originalIndex, dir)}
                  onDuplicate={() => handleDuplicateBlock(block)}
                  onDelete={() => handleDeleteBlock(block.id)}
                  onUpdate={(updated) => handleUpdateBlock(block.id, updated)}
                />
              );
            })}

            {/* Empty search result */}
            {blocks.length > 0 && filteredBlocks.length === 0 && (
              <div className="p-6 text-center border border-slate-800 bg-slate-900/40 rounded-2xl">
                <Search className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <p className="text-xs font-semibold text-slate-300">
                  Nenhum bloco encontrado para "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-sky-400 hover:underline font-medium"
                >
                  Limpar filtro de pesquisa
                </button>
              </div>
            )}

            {blocks.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">
                  Nenhum bloco criado ainda
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Comece adicionando botões de links, produtos ou seu PIX.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Bloco
                </button>
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeBlock ? (
            <BlockDragOverlayPreview
              block={activeBlock}
              catalogItem={activeCatalogItem}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Catalog Modal (Mobile Bottom Sheet / Desktop Centered Modal) */}
      {showCatalogModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowCatalogModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">
                  Escolha o Tipo de Bloco
                </h3>
                <p className="text-xs text-slate-400">
                  Clique para adicionar à sua página instantaneamente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {BLOCK_CATALOG.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => handleAddBlock(cat.type)}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-sky-500/60 hover:bg-slate-800/40 active:scale-[0.98] text-left transition-all group flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-sky-500/50 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-100 group-hover:text-sky-300">
                          {cat.label}
                        </span>
                        {cat.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                                     <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}