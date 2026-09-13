import React, { useState, useEffect, useRef } from 'react';
import { resolveBlockColor } from '../../utils/blockColors';
import { motion, AnimatePresence } from 'motion/react';
import { ProductBlock, ProductMediaItem, ThemeConfig, ContentBlock } from '../../types';
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Film,
  Play,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';

interface ProductCardRendererProps {
  block: ProductBlock;
  theme: ThemeConfig;
  cardBaseStyle: React.CSSProperties;
  activeRadiusClass: string;
  getCardStyle: () => string;
  getAnimationClass: (anim?: string) => string;
  isInteractive?: boolean;
  handleBlockAction: (e: React.MouseEvent, block: ContentBlock, fallbackUrl?: string) => void;
  renderDynamicIcon: (iconName?: string, className?: string, style?: any) => React.ReactNode;
  defaultWhatsappNumber?: string;
}

function getEmbedVideoUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` : null;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` : null;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1` : null;
  }
  return null;
}

function ProductCardRendererComponent({
  block,
  theme,
  cardBaseStyle,
  activeRadiusClass,
  getCardStyle,
  getAnimationClass,
  isInteractive = true,
  handleBlockAction,
  renderDynamicIcon,
  defaultWhatsappNumber,
}: ProductCardRendererProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Normalize media items list
  const mediaList: ProductMediaItem[] = React.useMemo(() => {
    if (block.media && block.media.length > 0) {
      return block.media;
    }
    if (block.imageUrl) {
      const isVideo =
        block.imageUrl.endsWith('.mp4') ||
        block.imageUrl.endsWith('.webm') ||
        block.imageUrl.includes('youtube.com') ||
        block.imageUrl.includes('youtu.be') ||
        block.imageUrl.includes('vimeo.com');
      return [
        {
          id: 'default-single-media',
          type: isVideo ? 'video' : 'image',
          url: block.imageUrl,
          title: block.title,
        },
      ];
    }
    return [];
  }, [block.media, block.imageUrl, block.title]);

  const hasMultipleMedia = mediaList.length > 1;
  const currentMedia = mediaList[activeIndex] || mediaList[0];

  // Auto-play carousel if enabled and has multiple items
  useEffect(() => {
    if (!block.autoPlayCarousel || !hasMultipleMedia || isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mediaList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [block.autoPlayCarousel, hasMultipleMedia, mediaList.length, isHovered]);

  // Adjust activeIndex if items change
  useEffect(() => {
    if (activeIndex >= mediaList.length && mediaList.length > 0) {
      setActiveIndex(0);
    }
  }, [mediaList.length, activeIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || !hasMultipleMedia) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setActiveIndex((prev) => (prev + 1) % mediaList.length);
      } else {
        // swipe right -> prev
        setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
      }
    }
    touchStartXRef.current = null;
  };

  const whatsappBuyUrl = React.useMemo(() => {
    if (!block.enableWhatsappBuy) return null;
    const number = block.whatsappNumber || defaultWhatsappNumber;
    if (!number) return null;
    const msg = `Olá! Tenho interesse no produto: ${block.title} - ${block.price}. Ainda está disponível?`;
    return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
  }, [block.enableWhatsappBuy, block.whatsappNumber, block.title, block.price, defaultWhatsappNumber]);

  // Render single media item
  const renderMediaContent = (item: ProductMediaItem, heightClasses: string) => {
    if (!item) return null;

    if (item.type === 'video') {
      const embedUrl = getEmbedVideoUrl(item.url);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title={item.title || block.title}
            className={`w-full ${heightClasses} border-0 pointer-events-auto`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return (
        <video
          src={item.url}
          autoPlay
          muted
          loop
          playsInline
          controls={isInteractive}
          className={`w-full ${heightClasses} object-cover bg-black`}
        />
      );
    }

    return (
      <img
        src={item.url}
        alt={item.alt || item.title || block.title}
        className={`w-full ${heightClasses} object-cover select-none transition-transform duration-300 group-hover:scale-105`}
        loading="lazy"
      />
    );
  };

  // Card Grande (Showcase Vertical)
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`overflow-hidden border ${activeRadiusClass} ${getCardStyle()} ${getAnimationClass(
        block.animation
      )} ${block.featured ? 'border-2 ring-2 ring-sky-400/40' : 'border'} flex flex-col shadow-md transition-all group`}
      style={{
        ...cardBaseStyle,
        borderColor: block.featured
          ? block.customBorderColor || theme.accentColor
          : block.customBorderColor || theme.cardBorder,
        backgroundColor: block.customColor || theme.cardBg,
        color: block.customTextColor || theme.cardTextColor,
      }}
    >
      {/* Media Carousel Container */}
      {mediaList.length > 0 ? (
        <div
          className="relative w-full aspect-[4/3] overflow-hidden bg-slate-950 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMedia ? currentMedia.id + activeIndex : 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              {renderMediaContent(currentMedia, 'h-full')}
            </motion.div>
          </AnimatePresence>

          {/* Badge on top-left */}
          {block.badge && (
            <div className="absolute top-3 left-3 z-20">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentTextColor,
                }}
              >
                {block.badge}
              </span>
            </div>
          )}

          {/* Counter & Video Tag on top-right */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            {currentMedia?.type === 'video' && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow">
                <Film className="w-3 h-3 text-sky-400" />
                Vídeo
              </span>
            )}
            {hasMultipleMedia && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider border border-white/20 shadow">
                {activeIndex + 1}/{mediaList.length}
              </span>
            )}
          </div>

          {/* Left & Right Arrows */}
          {hasMultipleMedia && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-transform active:scale-90 shadow-md"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-transform active:scale-90 shadow-md"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
                {mediaList.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={(e) => handleDotClick(idx, e)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all shadow-sm ${
                      idx === activeIndex
                        ? 'w-5 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
        <div>
          {mediaList.length === 0 && block.badge && (
            <div className="mb-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: theme.accentColor,
                  color: theme.accentTextColor,
                }}
              >
                {block.badge}
              </span>
            </div>
          )}
          <div className="flex items-start gap-2.5">
            {block.icon && mediaList.length === 0 && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: block.customIconBgColor || `${theme.accentColor}25`,
                  color: block.customIconColor || theme.accentColor,
                }}
              >
                {renderDynamicIcon(block.icon, 'w-5 h-5')}
              </div>
            )}
            <h4
              className="font-bold text-base sm:text-lg leading-snug line-clamp-2"
              style={{ color: block.customTextColor || theme.cardTextColor }}
            >
              {block.title}
            </h4>
          </div>
          {block.description && (
            <p
              className="text-xs sm:text-sm opacity-85 mt-1.5 line-clamp-2 leading-relaxed"
              style={{ color: block.customTextColor || theme.cardSubtextColor }}
            >
              {block.description}
            </p>
          )}
        </div>

        {/* Price & Checkout CTA */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            {block.originalPrice && (
              <span className="text-[11px] line-through opacity-60">
                {block.originalPrice}
              </span>
            )}
            <span
              className="font-extrabold text-base sm:text-lg tracking-tight line-clamp-2"
              style={{ color: block.customColor ? block.customTextColor : theme.accentColor }}
            >
              {block.price}
            </span>
          </div>
          <a
            href={isInteractive ? (whatsappBuyUrl || block.url) : '#'}
            target={isInteractive ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={(e) => handleBlockAction(e, block, whatsappBuyUrl || block.url)}
            className="px-4 min-h-11 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap hover:shadow-lg"
            style={{
              backgroundColor: whatsappBuyUrl ? '#25D366' : resolveBlockColor(block, theme.accentColor),
              color: whatsappBuyUrl ? '#ffffff' : theme.accentTextColor,
            }}
          >
            {whatsappBuyUrl ? (
              <MessageCircle className="w-4 h-4 shrink-0" />
            ) : (
              <ShoppingBag className="w-4 h-4 shrink-0" />
            )}
            <span>{whatsappBuyUrl ? 'Comprar via WhatsApp' : block.buttonText || 'Comprar Agora'}</span>
          </a>
        </div>
      </div>
    </div>
  );

}

export const ProductCardRenderer = React.memo(ProductCardRendererComponent);
