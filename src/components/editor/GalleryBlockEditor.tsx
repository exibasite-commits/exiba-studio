import React, { useState, useRef, useMemo } from 'react';
import { GalleryBlock, GalleryItem } from '../../types';
import { InfoTooltip } from '../common/Tooltip';
import { uploadMultipleMedia } from '../../api/upload';
import {
  Images,
  Upload,
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Play,
  Grid,
  Columns,
  Sliders,
  Eye,
  Maximize2,
  Layers,
  LayoutGrid,
  Loader2,
} from 'lucide-react';

interface GalleryBlockEditorProps {
  block: GalleryBlock;
  update: (data: Partial<GalleryBlock>) => void;
}

interface ServicePreset {
  name: string;
  category: string;
  items: GalleryItem[];
}

const SERVICE_PRESETS: ServicePreset[] = [
  {
    name: '💇‍♀️ Salão de Beleza & Cabelos',
    category: 'Beleza',
    items: [
      {
        id: 'p_bel_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
        title: 'Coloração & Mechas Iluminadas',
        caption: 'Técnica exclusiva de morena iluminada com tratamento reconstrutor.',
        category: 'Coloração',
      },
      {
        id: 'p_bel_2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hot-coffee-being-poured-into-a-cup-41549-large.mp4',
        title: 'Vídeo - Finalização com Escova Modelada',
        caption: 'Brilho espelhado e movimento natural dos fios.',
        category: 'Finalização',
      },
      {
        id: 'p_bel_3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        title: 'Penteado para Noivas & Eventos',
        caption: 'Semi-preso elegante com fixação de até 14 horas.',
        category: 'Penteados',
      },
      {
        id: 'p_bel_4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&auto=format&fit=crop&q=80',
        title: 'Corte em Camadas Moderno',
        caption: 'Leveza e definição para cabelos médios e longos.',
        category: 'Cortes',
      },
    ],
  },
  {
    name: '💈 Barbearia & Estilo Masculino',
    category: 'Barbearia',
    items: [
      {
        id: 'p_barb_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
        title: 'Degradê Navalhado (Fade Clean)',
        caption: 'Transição suave na máquina e navalha com acabamento milimétrico.',
        category: 'Corte',
      },
      {
        id: 'p_barb_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
        title: 'Barboterapia & Alinhamento',
        caption: 'Toalha quente, hidratação profunda e óleo essencial.',
        category: 'Barba',
      },
      {
        id: 'p_barb_3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
        title: 'Corte Social Clássico com Pomada',
        caption: 'Elegância para o dia a dia e ocasiões especiais.',
        category: 'Corte',
      },
    ],
  },
  {
    name: '🏡 Arquitetura & Obras de Interiores',
    category: 'Arquitetura',
    items: [
      {
        id: 'p_arq_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&auto=format&fit=crop&q=80',
        title: 'Living Integrado com Cozinha Gourmet',
        caption: 'Iluminação cênica em LED e marcenaria sob medida em tom freijó.',
        category: 'Interiores',
      },
      {
        id: 'p_arq_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80',
        title: 'Suíte Master Minimalista',
        caption: 'Cabeceira ripada e revestimento acústico.',
        category: 'Quarto',
      },
      {
        id: 'p_arq_3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        title: 'Banheiro Spa com Cuba Dupla',
        caption: 'Porcelanato calacatta e metais pretos foscos.',
        category: 'Banheiro',
      },
    ],
  },
  {
    name: '📸 Fotografia & Ensaios',
    category: 'Fotografia',
    items: [
      {
        id: 'p_foto_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        title: 'Ensaio Retrato Profissional',
        caption: 'Fotografia de posicionamento de imagem e autoridade.',
        category: 'Retrato',
      },
      {
        id: 'p_foto_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
        title: 'Cobertura de Casamento & Making Of',
        caption: 'Registros espontâneos cheios de emoção e luz natural.',
        category: 'Eventos',
      },
      {
        id: 'p_foto_3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
        title: 'Ensaio Pré-Wedding ao Pôr do Sol',
        caption: 'Cores quentes e momentos únicos do casal.',
        category: 'Casal',
      },
    ],
  },
];

export function GalleryBlockEditor({ block, update }: GalleryBlockEditorProps) {
  const [urlInput, setUrlInput] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo(() => {
    return block.items || [];
  }, [block.items]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const processUploadedFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const results = await uploadMultipleMedia(
        files,
        { maxWidth: 1200, maxHeight: 1200, quality: 0.82 },
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );

      const newItems: GalleryItem[] = results.map((r, index) => ({
        id: 'gal_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now() + index,
        type: r.type,
        url: r.url,
        imageUrl: r.url,
        title: r.originalName.replace(/\.[^/.]+$/, ''),
        caption: '',
        category: '',
      }));

      update({
        items: [...items, ...newItems],
      });
    } catch (err) {
      console.error('[GalleryBlockEditor] Erro no upload:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    processUploadedFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files) return;
    const files: File[] = Array.from(e.dataTransfer.files);
    processUploadedFiles(files);
  };

  const handleAddFromUrl = () => {
    const clean = urlInput.trim();
    if (!clean) return;

    const isVideo =
      mediaType === 'video' ||
      clean.endsWith('.mp4') ||
      clean.endsWith('.webm') ||
      clean.includes('youtube.com') ||
      clean.includes('youtu.be') ||
      clean.includes('vimeo.com');

    const newItem: GalleryItem = {
      id: 'gal_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      type: isVideo ? 'video' : 'image',
      url: clean,
      imageUrl: clean,
      title: titleInput.trim() || (isVideo ? 'Vídeo do Serviço' : 'Foto do Serviço'),
      caption: '',
      category: categoryInput.trim() || undefined,
    };

    update({
      items: [...items, newItem],
    });
    setUrlInput('');
    setTitleInput('');
    setCategoryInput('');
  };

  const handleRemoveItem = (index: number) => {
    const nextList = items.filter((_, idx) => idx !== index);
    update({ items: nextList });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const nextList = [...items];
    const temp = nextList[index];
    nextList[index] = nextList[target];
    nextList[target] = temp;
    update({ items: nextList });
  };

  const handleUpdateItem = (index: number, changes: Partial<GalleryItem>) => {
    const nextList = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, ...changes };
      }
      return item;
    });
    update({ items: nextList });
  };

  const handleLoadPreset = (preset: ServicePreset) => {
    update({
      title: block.title || 'Galeria de Serviços Realizados',
      subtitle: block.subtitle || 'Confira fotos e vídeos dos trabalhos entregues',
      items: preset.items,
      layout: 'grid-2',
      showCaptions: true,
      enableLightbox: true,
      showCategoriesFilter: true,
    });
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Informative Header */}
      <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl flex items-start gap-2.5">
        <Images className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-200 leading-relaxed">
          <span className="font-bold text-white">Galeria Exclusiva de Serviços:</span> Exiba fotos
          e vídeos de trabalhos prestados aos seus clientes com visualizador em tela cheia e
          filtros por categoria, 100% livre de botões de checkout ou compras.
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1">
            <span>Título da Galeria</span>
            <InfoTooltip
              title="Título da Seção"
              text="Título exibido acima da galeria (ex: Nossos Trabalhos, Galeria de Fotos, Serviços Realizados)."
            />
          </label>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Ex: Nossos Serviços Realizados"
            className="w-full bg-slate-950 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1">
            <span>Subtítulo ou Breve Descrição</span>
            <InfoTooltip
              title="Subtítulo"
              text="Texto explicativo para seus clientes (ex: Veja os resultados dos nossos atendimentos)."
            />
          </label>
          <input
            type="text"
            value={block.subtitle || ''}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="Ex: Veja fotos e vídeos dos resultados"
            className="w-full bg-slate-950 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Layout Selection */}
      <div>
        <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1.5">
          <span>Estilo de Exibição da Galeria</span>
          <InfoTooltip
            title="Layout da Galeria"
            text="Escolha como as fotos e vídeos serão organizados: Grade de 2 ou 3 colunas, Carrossel deslizante, Mosaico ou Cartões expandidos."
          />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { id: 'grid-2', label: 'Grade 2 Col', icon: LayoutGrid },
            { id: 'grid-3', label: 'Grade 3 Col', icon: Grid },
            { id: 'carousel', label: 'Carrossel', icon: Columns },
            { id: 'masonry', label: 'Mosaico', icon: Layers },
            { id: 'stacked', label: 'Expandido', icon: Film },
          ].map((mode) => {
            const IconComp = mode.icon;
            const isSelected = (block.layout || 'grid-2') === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => update({ layout: mode.id as any })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span className="text-[11px] whitespace-nowrap">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-300 font-medium flex items-center gap-1 mb-1">
            <span>Formato das Imagens</span>
            <InfoTooltip
              title="Proporção"
              text="Escolha a proporção ideal para valorizar seus serviços."
            />
          </label>
          <select
            value={block.aspectRatio || 'square'}
            onChange={(e) => update({ aspectRatio: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="square">🔲 Quadrado (1:1 - Padrão Instagram)</option>
            <option value="portrait">📱 Retrato / Vertical (4:5 - Ideal para Cabelo e Moda)</option>
            <option value="landscape">🖥️ Paisagem / Horizontal (16:9 - Ambientes e Obras)</option>
            <option value="auto">📐 Automático / Altura Livre</option>
          </select>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-col justify-end space-y-1.5">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={block.enableLightbox !== false}
              onChange={(e) => update({ enableLightbox: e.target.checked })}
              className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-sky-500"
            />
            <span>🔍 Abrir em Tela Cheia ao tocar na foto/vídeo</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={block.showCaptions !== false}
              onChange={(e) => update({ showCaptions: e.target.checked })}
              className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-sky-500"
            />
            <span>📝 Exibir Títulos e Legendas dos Serviços</span>
          </label>
          {block.layout === 'carousel' && (
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={block.autoPlayCarousel !== false}
                onChange={(e) => update({ autoPlayCarousel: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-sky-500"
              />
              <span>🔄 Rotação Automática de Slides (Auto-play)</span>
            </label>
          )}
        </div>
      </div>

      {/* Modelos Prontos de Demonstração (Presets) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Modelos Prontos de Portfólio (Preenchimento em 1 Clique)</span>
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SERVICE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white text-xs font-medium transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Drag & Drop and File Picker Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2.5 ${
          isDragging
            ? 'border-sky-400 bg-sky-500/15'
            : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-200">
            Arraste fotos ou vídeos dos seus serviços aqui
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Suporta múltiplos arquivos simultâneos (JPG, PNG, WebP e vídeos MP4, WebM)
          </p>
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                Processando {uploadProgress ? `(${uploadProgress.current}/${uploadProgress.total})` : '...'}
              </span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar Fotos/Vídeos do Celular ou PC</span>
            </>
          )}
        </button>
      </div>

      {/* Adicionar por URL / Link Externo */}
      <div className="space-y-1.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
          <span>Ou Adicionar por Link (Foto, MP4 ou YouTube/Vimeo)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-3">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="image">🖼️ Foto</option>
              <option value="video">🎬 Vídeo / YouTube</option>
            </select>
          </div>
          <div className="sm:col-span-9">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={
                mediaType === 'video'
                  ? 'https://... (MP4 ou link do YouTube/Vimeo)'
                  : 'https://images.unsplash.com/...'
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          <div className="sm:col-span-6">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Título do Serviço (ex: Mechas Loiras)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Categoria (ex: Cabelo, Make)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddFromUrl}
              disabled={!urlInput.trim()}
              className="w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Fotos e Vídeos Cadastrados */}
      {items.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>Fotos & Vídeos do Portfólio ({items.length} itens):</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Toque no item para editar detalhes ou legenda
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const isExpanded = expandedItemId === item.id || (!expandedItemId && index === 0);
              return (
                <div
                  key={item.id || index}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
                >
                  {/* Header Row */}
                  <div className="p-2.5 flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black relative border border-slate-700">
                      {item.type === 'video' ? (
                        item.url.includes('youtube') ||
                        item.url.includes('youtu.be') ||
                        item.url.includes('vimeo') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-purple-400">
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[7px] font-bold">Embed</span>
                          </div>
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" muted />
                        )
                      ) : (
                        <img
                          src={item.url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}

                      <span
                        className={`absolute bottom-0.5 right-0.5 text-[7px] font-extrabold px-1 rounded ${
                          item.type === 'video'
                            ? 'bg-purple-600 text-white'
                            : 'bg-sky-600 text-white'
                        }`}
                      >
                        {item.type === 'video' ? 'VÍDEO' : 'FOTO'}
                      </span>
                    </div>

                    {/* Quick Info & Expand Toggle */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {item.title || `Serviço #${index + 1}`}
                        </span>
                        {item.category && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.caption || (item.url.startsWith('data:') ? 'Arquivo enviado' : item.url)}
                      </p>
                    </div>

                    {/* Controls: Up / Down / Remove */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveItem(index, 'up')}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => handleMoveItem(index, 'down')}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Item Details Editor */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                            Título / Nome do Trabalho
                          </label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => handleUpdateItem(index, { title: e.target.value })}
                            placeholder="Ex: Mechas Loiras & Escova"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                            Categoria (Opcional)
                          </label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={(e) => handleUpdateItem(index, { category: e.target.value })}
                            placeholder="Ex: Cabelo, Make, Unhas"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                          Legenda / Detalhes do Serviço Prestado
                        </label>
                        <textarea
                          rows={2}
                          value={item.caption || ''}
                          onChange={(e) => handleUpdateItem(index, { caption: e.target.value })}
                          placeholder="Descreva detalhes, técnicas utilizadas, tempo ou materiais..."
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
          Nenhuma foto ou vídeo adicionado ainda. Carregue do celular/PC ou escolha um modelo de
          demonstração acima.
        </div>
      )}
    </div>
  );
}
