import React, { useState, useRef } from 'react';
import { ProductMediaItem } from '../../types';
import { InfoTooltip } from '../common/Tooltip';
import { uploadMultipleMedia } from '../../api/upload';
import {
  Upload,
  Image as ImageIcon,
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  Sparkles,
  Star,
  Check,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface ProductMediaManagerProps {
  media?: ProductMediaItem[];
  imageUrl?: string;
  autoPlayCarousel?: boolean;
  onUpdate: (data: { media: ProductMediaItem[]; imageUrl?: string; autoPlayCarousel?: boolean }) => void;
}

const DEMO_PRESET_MEDIA: ProductMediaItem[] = [
  {
    id: 'demo_m1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    title: 'Foto 1 - Produto em Destaque',
  },
  {
    id: 'demo_m2',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hot-coffee-being-poured-into-a-cup-41549-large.mp4',
    title: 'Vídeo - Demonstração do Serviço',
  },
  {
    id: 'demo_m3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    title: 'Foto 2 - Detalhes do Produto',
  },
];

export function ProductMediaManager({
  media = [],
  imageUrl,
  autoPlayCarousel = true,
  onUpdate,
}: ProductMediaManagerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Normalize active items
  const activeMedia: ProductMediaItem[] = React.useMemo(() => {
    if (media && media.length > 0) return media;
    if (imageUrl) {
      const isVideo =
        imageUrl.endsWith('.mp4') ||
        imageUrl.endsWith('.webm') ||
        imageUrl.includes('youtube.com') ||
        imageUrl.includes('youtu.be') ||
        imageUrl.includes('vimeo.com');
      return [
        {
          id: 'initial_single_media',
          type: isVideo ? 'video' : 'image',
          url: imageUrl,
          title: 'Mídia Principal',
        },
      ];
    }
    return [];
  }, [media, imageUrl]);

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

      const newItems: ProductMediaItem[] = results.map((r, index) => ({
        id: 'med_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now() + index,
        type: r.type,
        url: r.url,
        title: r.originalName.replace(/\.[^/.]+$/, ''),
      }));

      const combined = [...activeMedia, ...newItems];
      onUpdate({
        media: combined,
        imageUrl: combined[0]?.url || '',
        autoPlayCarousel,
      });
    } catch (err) {
      console.error('[ProductMediaManager] Erro no upload:', err);
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

    const newItem: ProductMediaItem = {
      id: 'med_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      type: isVideo ? 'video' : 'image',
      url: clean,
      title: isVideo ? 'Vídeo Adicionado' : 'Foto Adicionada',
    };

    const combined = [...activeMedia, newItem];
    onUpdate({
      media: combined,
      imageUrl: combined[0]?.url || '',
      autoPlayCarousel,
    });
    setUrlInput('');
  };

  const handleRemoveItem = (index: number) => {
    const nextList = activeMedia.filter((_, idx) => idx !== index);
    onUpdate({
      media: nextList,
      imageUrl: nextList[0]?.url || '',
      autoPlayCarousel,
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= activeMedia.length) return;
    const nextList = [...activeMedia];
    const temp = nextList[index];
    nextList[index] = nextList[target];
    nextList[target] = temp;
    onUpdate({
      media: nextList,
      imageUrl: nextList[0]?.url || '',
      autoPlayCarousel,
    });
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const nextList = [...activeMedia];
    const [selected] = nextList.splice(index, 1);
    nextList.unshift(selected);
    onUpdate({
      media: nextList,
      imageUrl: nextList[0]?.url || '',
      autoPlayCarousel,
    });
  };

  const handleLoadDemoPresets = () => {
    onUpdate({
      media: DEMO_PRESET_MEDIA,
      imageUrl: DEMO_PRESET_MEDIA[0].url,
      autoPlayCarousel: true,
    });
  };

  return (
    <div className="space-y-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs text-sky-300 font-bold flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-sky-400" />
          <span>Carrossel de Fotos & Vídeos do Serviço/Produto</span>
          <InfoTooltip
            title="Carrossel de Mídias"
            text="Adicione várias fotos e vídeos para mostrar seus serviços e produtos em um carrossel interativo com toque ou setas."
          />
        </label>
        {activeMedia.length > 0 && (
          <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {activeMedia.length} {activeMedia.length === 1 ? 'mídia' : 'mídias'}
          </span>
        )}
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
            Arraste suas fotos ou vídeos aqui
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Suporta múltiplas imagens (JPG, PNG, WebP) e vídeos (MP4, WebM)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
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
                <span>Carregar do Celular ou Computador</span>
              </>
            )}
          </button>

          {activeMedia.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDemoPresets}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Usar Mídias de Demonstração</span>
            </button>
          )}
        </div>
      </div>

      {/* Adicionar Mídia por URL / Link Direto */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <span>Ou adicione por link (Foto, MP4 ou YouTube/Vimeo)</span>
        </label>
        <div className="flex items-center gap-2">
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 shrink-0"
          >
            <option value="image">🖼️ Foto</option>
            <option value="video">🎬 Vídeo / YouTube</option>
          </select>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFromUrl();
              }
            }}
            placeholder={
              mediaType === 'video'
                ? 'https://... (MP4 ou link do YouTube/Vimeo)'
                : 'https://images.unsplash.com/...'
            }
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={handleAddFromUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Lista de Slides / Fotos e Vídeos Adicionados */}
      {activeMedia.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Ordem dos Slides no Carrossel:</span>
            <span>{activeMedia.length} {activeMedia.length === 1 ? 'item' : 'itens'}</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activeMedia.map((item, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={item.id || index}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    isCover
                      ? 'bg-slate-950 border-sky-500/60 shadow-sm ring-1 ring-sky-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Thumbnail Preview */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black relative border border-slate-700">
                    {item.type === 'video' ? (
                      item.url.includes('youtube') || item.url.includes('youtu.be') || item.url.includes('vimeo') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-purple-400">
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-[8px] font-bold mt-0.5">Embed</span>
                        </div>
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )
                    ) : (
                      <img
                        src={item.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Media Type Badge */}
                    <span
                      className={`absolute bottom-0.5 right-0.5 text-[8px] font-extrabold px-1 rounded ${
                        item.type === 'video'
                          ? 'bg-purple-600 text-white'
                          : 'bg-sky-600 text-white'
                      }`}
                    >
                      {item.type === 'video' ? 'VÍDEO' : 'FOTO'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        Slide #{index + 1}
                      </span>
                      {isCover && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-sky-500 text-slate-950 flex items-center gap-0.5 uppercase tracking-wider">
                          <Star className="w-2.5 h-2.5 fill-current" /> Capa
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {item.url.startsWith('data:') ? 'Arquivo carregado do dispositivo' : item.url}
                    </p>
                  </div>

                  {/* Actions: Move Up / Down / Cover / Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(index)}
                        title="Definir como Capa / Primeiro Slide"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(index, 'up')}
                      title="Mover para cima"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === activeMedia.length - 1}
                      onClick={() => handleMoveItem(index, 'down')}
                      title="Mover para baixo"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      title="Remover este item"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Settings */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPlayCarousel}
                onChange={(e) =>
                  onUpdate({
                    media: activeMedia,
                    imageUrl: activeMedia[0]?.url || '',
                    autoPlayCarousel: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
              />
              <span>🔄 Rotação Automática de Fotos (Auto-play a cada 4,5s)</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
          Nenhuma foto ou vídeo adicionado ainda. Carregue do celular/PC acima para ativar o carrossel.
        </div>
      )}
    </div>
  );
}
