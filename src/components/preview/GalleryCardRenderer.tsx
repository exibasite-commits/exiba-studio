import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GalleryBlock, GalleryItem, ThemeConfig } from '../../types';
import { renderDynamicIcon } from '../common/IconSelector';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Maximize2,
  Images,
  Sparkles,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryCardRendererProps {
  block: GalleryBlock;
  theme: ThemeConfig;
  cardBaseStyle: React.CSSProperties;
  activeRadiusClass: string;
  getCardStyle: () => string;
  getAnimationClass: (animation?: string) => string;
  isInteractive: boolean;
  handleBlockAction: (e: React.MouseEvent, block: any) => void;
}

function getEmbedVideoUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return id
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&loop=1&playlist=${id}`
      : null;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&loop=1&playlist=${id}`
      : null;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
  }
  return null;
}

function GalleryCardRendererComponent({
  block,
  theme,
  cardBaseStyle,
  activeRadiusClass,
  getCardStyle,
  getAnimationClass,
  isInteractive,
  handleBlockAction,
}: GalleryCardRendererProps) {
  // Normalize items to ensure url and type are set
  const rawItems: GalleryItem[] = useMemo(() => {
    if (!block.items || block.items.length === 0) return [];
    return block.items.map((item, idx) => {
      const mainUrl = item.url || item.imageUrl || '';
      const isVideo =
        item.type === 'video' ||
        mainUrl.endsWith('.mp4') ||
        mainUrl.endsWith('.webm') ||
        mainUrl.includes('youtube.com') ||
        mainUrl.includes('youtu.be') ||
        mainUrl.includes('vimeo.com');

      return {
        id: item.id || `item_${idx}`,
        type: isVideo ? ('video' as const) : ('image' as const),
        url: mainUrl,
        imageUrl: mainUrl,
        title: item.title,
        caption: item.caption,
        category: item.category,
      };
    });
  }, [block.items]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawItems.forEach((i) => {
      if (i.category && i.category.trim()) {
        set.add(i.category.trim());
      }
    });
    return Array.from(set);
  }, [rawItems]);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return rawItems;
    return rawItems.filter((i) => i.category === activeCategory);
  }, [rawItems, activeCategory]);

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const autoPlay = block.autoPlayCarousel !== false;
  const layout = block.layout || 'grid-2';
  const showCaptions = block.showCaptions !== false;
  const enableLightbox = block.enableLightbox !== false;

  // Aspect ratio styling
  const aspectRatioClass = useMemo(() => {
    switch (block.aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4] sm:aspect-[4/5]';
      case 'landscape':
        return 'aspect-[16/9]';
      case 'auto':
        return 'aspect-auto min-h-[140px]';
      case 'square':
      default:
        return 'aspect-square';
    }
  }, [block.aspectRatio]);

  // Reset carousel index if list length changes
  useEffect(() => {
    if (carouselIndex >= filteredItems.length && filteredItems.length > 0) {
      setCarouselIndex(0);
    }
  }, [filteredItems.length, carouselIndex]);

  // Carousel Auto-play timer
  useEffect(() => {
    if (layout !== 'carousel' || !autoPlay || filteredItems.length <= 1 || isHovered) {
      return;
    }
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [layout, autoPlay, filteredItems.length, isHovered]);

  const nextCarouselSlide = () => {
    if (filteredItems.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevCarouselSlide = () => {
    if (filteredItems.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextCarouselSlide();
    } else if (diff < -45) {
      prevCarouselSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const openLightbox = (index: number, e: React.MouseEvent) => {
    handleBlockAction(e, block);
    if (enableLightbox) {
      setLightboxIndex(index);
    }
  };

  if (rawItems.length === 0) {
    return null;
  }

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <>
      <div
        className={`p-3.5 sm:p-4 border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
          block.animation
        )} ${block.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} flex flex-col gap-3 shadow-md transition-all`}
        style={{
          ...cardBaseStyle,
          borderColor: block.featured
            ? block.customBorderColor || theme.accentColor
            : block.customBorderColor || theme.cardBorder,
          backgroundColor: block.customColor || theme.cardBg,
          color: block.customTextColor || theme.cardTextColor,
        }}
      >
        {/* Header: Title, Subtitle, Badge, Icon */}
        {(block.title || block.subtitle || block.badge) && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {block.icon ? (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: block.customIconBgColor || `${theme.accentColor}25`,
                    color: block.customIconColor || theme.accentColor,
                  }}
                >
                  {renderDynamicIcon(block.icon, 'w-4 h-4')}
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: `${theme.accentColor}25`,
                    color: theme.accentColor,
                  }}
                >
                  <Images className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <h4
                  className="font-bold text-sm sm:text-base leading-tight line-clamp-2"
                  style={{ color: block.customTextColor || theme.cardTextColor }}
                >
                  {block.title || 'Galeria de Serviços'}
                </h4>
                {block.subtitle && (
                  <p
                    className="text-xs opacity-80 line-clamp-2 mt-0.5"
                    style={{ color: block.customTextColor || theme.cardSubtextColor }}
                  >
                    {block.subtitle}
                  </p>
                )}
              </div>
            </div>

            {block.badge && (
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentTextColor,
                }}
              >
                {block.badge}
              </span>
            )}
          </div>
        )}

        {/* Category Filters if enabled and multiple exist */}
        {block.showCategoriesFilter && categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-black/20 hover:bg-black/30 text-current opacity-70'
              }`}
            >
              Todos ({rawItems.length})
            </button>
            {categories.map((cat) => {
              const count = rawItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'bg-black/20 hover:bg-black/30 text-current opacity-70'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* CAROUSEL LAYOUT */}
        {layout === 'carousel' && (
          <div
            className="relative w-full overflow-hidden rounded-xl bg-black/40 group/carousel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {filteredItems.length > 0 && (
              <div
                className={`relative w-full ${aspectRatioClass} overflow-hidden cursor-pointer`}
                onClick={(e) => openLightbox(carouselIndex, e)}
              >
                {filteredItems[carouselIndex].type === 'video' ? (
                  getEmbedVideoUrl(filteredItems[carouselIndex].url) ? (
                    <iframe
                      src={getEmbedVideoUrl(filteredItems[carouselIndex].url)!}
                      title={filteredItems[carouselIndex].title || 'Vídeo do Serviço'}
                      className="w-full h-full border-0 pointer-events-none"
                      allow="autoplay; encrypted-media; picture-in-picture"
                    />
                  ) : (
                    <video
                      src={filteredItems[carouselIndex].url}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  )
                ) : (
                  <img
                    src={filteredItems[carouselIndex].url}
                    alt={filteredItems[carouselIndex].title || 'Foto do Serviço'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/carousel:scale-105"
                  />
                )}

                {/* Video Badge */}
                {filteredItems[carouselIndex].type === 'video' && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-purple-600/90 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-sm">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>VÍDEO</span>
                  </div>
                )}

                {/* Expand Fullscreen Icon Hint */}
                {enableLightbox && (
                  <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity backdrop-blur-sm">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Caption / Title Overlay at Bottom */}
                {showCaptions &&
                  (filteredItems[carouselIndex].title ||
                    filteredItems[carouselIndex].caption) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 text-white">
                      {filteredItems[carouselIndex].title && (
                        <p className="font-bold text-xs sm:text-sm leading-snug line-clamp-2">
                          {filteredItems[carouselIndex].title}
                        </p>
                      )}
                      {filteredItems[carouselIndex].caption && (
                        <p className="text-[11px] text-slate-200/90 line-clamp-2 mt-0.5">
                          {filteredItems[carouselIndex].caption}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevCarouselSlide();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 z-10 backdrop-blur-sm"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextCarouselSlide();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 z-10 backdrop-blur-sm"
                  title="Próxima foto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                  {filteredItems.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === carouselIndex ? 'w-5 bg-sky-400 shadow' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* GRID LAYOUTS (2 COLS / 3 COLS / DEFAULT GRID) */}
        {(layout === 'grid-2' || layout === 'grid-3' || layout === 'grid') && (
          <div
            className={`grid gap-2 ${
              layout === 'grid-3' ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id || index}
                onClick={(e) => openLightbox(index, e)}
                className={`relative group/item rounded-xl overflow-hidden bg-black/30 cursor-pointer ${aspectRatioClass} border border-white/5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md`}
              >
                {item.type === 'video' ? (
                  getEmbedVideoUrl(item.url) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-purple-400 relative">
                      <Play className="w-6 h-6 fill-current drop-shadow" />
                      <span className="text-[9px] font-bold mt-1">Assistir Vídeo</span>
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  )
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || 'Serviço'}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                  />
                )}

                {/* Video Tag / Play Overlay */}
                {item.type === 'video' && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-extrabold flex items-center gap-0.5 shadow backdrop-blur-sm">
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}

                {/* Hover overlay with Title */}
                {showCaptions && (item.title || item.caption) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-white opacity-90 group-hover/item:opacity-100 transition-opacity">
                    {item.title && (
                      <p className="font-bold text-[11px] leading-tight line-clamp-2">
                        {item.title}
                      </p>
                    )}
                    {item.caption && layout !== 'grid-3' && (
                      <p className="text-[9px] text-slate-300 line-clamp-2 mt-0.5 opacity-90">
                        {item.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MASONRY LAYOUT */}
        {layout === 'masonry' && (
          <div className="columns-2 gap-2 space-y-2">
            {filteredItems.map((item, index) => (
              <div
                key={item.id || index}
                onClick={(e) => openLightbox(index, e)}
                className="relative group/item rounded-xl overflow-hidden bg-black/30 cursor-pointer break-inside-avoid border border-white/5 shadow-sm transition-all hover:scale-[1.02]"
              >
                {item.type === 'video' ? (
                  <div className="relative aspect-[4/5] bg-black">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-extrabold flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || 'Serviço'}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover/item:scale-105"
                  />
                )}

                {showCaptions && (item.title || item.caption) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-white">
                    {item.title && (
                      <p className="font-bold text-[11px] leading-tight line-clamp-2">
                        {item.title}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STACKED FULL-WIDTH CARDS LAYOUT */}
        {layout === 'stacked' && (
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-xl overflow-hidden bg-black/20 border border-white/10 shadow-sm flex flex-col"
              >
                <div
                  className="relative w-full aspect-video bg-black/40 cursor-pointer group"
                  onClick={(e) => openLightbox(index, e)}
                >
                  {item.type === 'video' ? (
                    getEmbedVideoUrl(item.url) ? (
                      <iframe
                        src={getEmbedVideoUrl(item.url)!}
                        title={item.title || 'Vídeo'}
                        className="w-full h-full border-0 pointer-events-none"
                        allow="autoplay; encrypted-media"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    )
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || 'Serviço'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}

                  {item.type === 'video' && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>VÍDEO</span>
                    </div>
                  )}
                </div>

                {(item.title || item.caption || item.category) && (
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      {item.title && (
                        <h5 className="font-bold text-xs sm:text-sm leading-tight text-current">
                          {item.title}
                        </h5>
                      )}
                      {item.category && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.caption && (
                      <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                        {item.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {enableLightbox && lightboxIndex !== null && activeLightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Bar: Title & Close Button */}
            <div
              className="flex items-center justify-between gap-3 text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
                {activeLightboxItem.category && (
                  <span className="text-xs font-bold text-sky-400 bg-sky-500/20 px-2.5 py-1 rounded-full">
                    {activeLightboxItem.category}
                  </span>
                )}
                {activeLightboxItem.title && (
                  <h4 className="text-xs sm:text-sm font-bold truncate max-w-xs text-slate-100">
                    {activeLightboxItem.title}
                  </h4>
                )}
              </div>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 shadow"
                title="Fechar Visualizador (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stage: Photo or Video */}
            <div
              className="relative flex-1 flex items-center justify-center my-2 max-h-[78vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {activeLightboxItem.type === 'video' ? (
                getEmbedVideoUrl(activeLightboxItem.url) ? (
                  <iframe
                    src={getEmbedVideoUrl(activeLightboxItem.url)!}
                    title={activeLightboxItem.title || 'Vídeo em Tela Cheia'}
                    className="w-full max-w-3xl aspect-video rounded-2xl border-0 shadow-2xl"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeLightboxItem.url}
                    className="max-w-full max-h-[74vh] object-contain rounded-2xl shadow-2xl"
                    controls
                    autoPlay
                    playsInline
                  />
                )
              ) : (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.title || 'Visualização do Serviço'}
                  className="max-w-full max-h-[74vh] object-contain rounded-2xl shadow-2xl"
                />
              )}

              {/* Navigation Arrows inside Lightbox */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) =>
                        prev !== null
                          ? (prev - 1 + filteredItems.length) % filteredItems.length
                          : 0
                      );
                    }}
                    className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 border border-white/10 backdrop-blur-md"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) =>
                        prev !== null ? (prev + 1) % filteredItems.length : 0
                      );
                    }}
                    className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 border border-white/10 backdrop-blur-md"
                    title="Próxima"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption Bar */}
            <div
              className="text-center max-w-xl mx-auto px-4 py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {activeLightboxItem.caption && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {activeLightboxItem.caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const GalleryCardRenderer = React.memo(GalleryCardRendererComponent);
