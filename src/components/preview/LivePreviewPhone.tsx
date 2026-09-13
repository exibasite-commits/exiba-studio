import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BioSiteConfig, DeviceMode } from '../../types';
import { BioSiteRenderer } from './BioSiteRenderer';
import { PreviewSkeleton } from './PreviewSkeleton';
import { Tooltip } from '../common/Tooltip';
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  Wifi,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  ArrowUp,
  X,
  Scan,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

interface LivePreviewPhoneProps {
  config: BioSiteConfig;
  deviceMode: DeviceMode;
  onDeviceChange: (mode: DeviceMode) => void;
  onOpenQR: () => void;
  onBlockClick?: (blockId: string) => void;
  isLoading?: boolean;
  plan?: 'free' | 'pro';
  isAdmin?: boolean;
  slug?: string;
}

type DeviceFrameStyle = 'iphone16' | 'frameless' | 'native';
type StudioBg = 'grid' | 'mesh' | 'slate';

function LivePreviewPhoneComponent({
  config,
  deviceMode,
  onDeviceChange,
  onOpenQR,
  onBlockClick,
  isLoading = false,
  plan = 'free',
  isAdmin = false,
  slug,
}: LivePreviewPhoneProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [keyRefresh, setKeyRefresh] = useState(0);
  const [frameStyle, setFrameStyle] = useState<DeviceFrameStyle>('iphone16');
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [studioBg, setStudioBg] = useState<StudioBg>('grid');
  const [isInteractiveTest] = useState(true);
  const [showQrQuickModal, setShowQrQuickModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState('09:41');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const phoneScrollRef = useRef<HTMLDivElement>(null);

  const publicUrl = slug
    ? `${window.location.origin}/${slug}`
    : `https://exiba.com/${config.profile.handle.replace('@', '') || 'demo'}`;

  // Keep time synced with current local time
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Measure container dimensions for intelligent auto-fitting
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate auto-fit zoom percentage so device is always 100% visible vertically and horizontally
  const calculateAutoFitZoom = (): number => {
    if (frameStyle === 'native') return 100;
    if (!containerSize.width || !containerSize.height) return 100;

    let targetW = 380;
    let targetH = 760;

    if (frameStyle === 'frameless') {
      targetW = 380;
      targetH = 740;
    } else if (deviceMode === 'tablet') {
      targetW = 630;
      targetH = 800;
    } else if (deviceMode === 'desktop') {
      targetW = 870;
      targetH = 780;
    }

    // Available inner padding (leave 16px safety margin on mobile, 32px on desktop)
    const paddingMargin = containerSize.width < 640 ? 16 : 32;
    const availableW = containerSize.width - paddingMargin;
    const availableH = containerSize.height - paddingMargin;

    if (availableW <= 0 || availableH <= 0) return 100;

    const scaleX = availableW / targetW;
    const scaleY = availableH / targetH;
    const scale = Math.min(scaleX, scaleY);

    // Limit auto-fit between 30% and 100%
    return Math.min(100, Math.max(30, Math.floor(scale * 100)));
  };

  const effectiveZoom = frameStyle === 'native' ? 100 : (autoFit ? calculateAutoFitZoom() : zoomLevel);

  // Generate Quick QR
  useEffect(() => {
    if (showQrQuickModal) {
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Error:', err));
    }
  }, [showQrQuickModal, publicUrl]);

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    try {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.25 } });
    } catch {}
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRefresh = () => {
    setKeyRefresh((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setAutoFit(false);
    setZoomLevel((prev) => Math.min(125, (autoFit ? calculateAutoFitZoom() : prev) + 10));
  };

  const handleZoomOut = () => {
    setAutoFit(false);
    setZoomLevel((prev) => Math.max(45, (autoFit ? calculateAutoFitZoom() : prev) - 10));
  };

  const handleToggleAutoFit = () => {
    setAutoFit((prev) => !prev);
  };

  const handleSetExactZoom = (zoom: number) => {
    setAutoFit(false);
    setZoomLevel(zoom);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 220) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (phoneScrollRef.current) {
      phoneScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/90 border-l border-slate-800/80 overflow-hidden relative select-none">
      {/* Top Preview Control Bar */}
      <header className="h-14 border-b border-slate-800/80 px-2.5 sm:px-4 flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-xl shrink-0 z-30 overflow-x-auto scrollbar-none min-w-0">
        {/* Left: Device & Frame Selection */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Device Type Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-800/90 shadow-inner shrink-0">
            <button
              type="button"
              title="iPhone 16 Pro (Moldura de Titânio)"
              onClick={() => {
                onDeviceChange('mobile');
                setFrameStyle('iphone16');
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                deviceMode === 'mobile' && frameStyle === 'iphone16'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">iPhone</span>
            </button>

            <button
              type="button"
              title="Sem Moldura (Visualização Minimalista)"
              onClick={() => {
                onDeviceChange('mobile');
                setFrameStyle('frameless');
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                deviceMode === 'mobile' && frameStyle === 'frameless'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Minimal</span>
            </button>

            <button
              type="button"
              title="Modo Nativo 1:1 (Ideal para Celular)"
              onClick={() => {
                onDeviceChange('mobile');
                setFrameStyle('native');
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                deviceMode === 'mobile' && frameStyle === 'native'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Nativo</span>
            </button>

            <button
              type="button"
              title="Visualização Tablet / iPad"
              onClick={() => onDeviceChange('tablet')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                deviceMode === 'tablet'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Tablet</span>
            </button>

            <button
              type="button"
              title="Visualização Desktop / Web"
              onClick={() => onDeviceChange('desktop')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                deviceMode === 'desktop'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Desktop</span>
            </button>
          </div>
        </div>

        {/* Center/Right: Live URL, Zoom & Studio Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Auto-Fit / Fit Screen Toggle */}
          <button
            type="button"
            title={autoFit ? 'Ajuste Automático Ativo (Celular 100% visível na tela)' : 'Clique para ajustar celular à tela inteira'}
            onClick={handleToggleAutoFit}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 ${
              autoFit
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 shadow-sm'
                : 'bg-slate-950/80 border-slate-800/90 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Ajustar</span>
            {autoFit && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
          </button>

          {/* Zoom Controller */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-950/80 px-1.5 py-1 rounded-xl border border-slate-800/90 text-xs shrink-0">
            <button
              type="button"
              title="Reduzir Zoom (-)"
              onClick={handleZoomOut}
              disabled={effectiveZoom <= 45}
              className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors shrink-0"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title={autoFit ? 'Ajustado à tela. Clique para 100%' : 'Zoom Manual. Clique para ajustar à tela'}
              onClick={() => {
                if (autoFit) {
                  handleSetExactZoom(100);
                } else {
                  setAutoFit(true);
                }
              }}
              className="px-1 font-mono text-[11px] font-semibold text-slate-300 min-w-[46px] text-center hover:text-sky-400 transition-colors flex items-center justify-center gap-0.5"
            >
              <span>{effectiveZoom}%</span>
              {autoFit && <span className="text-[9px] text-sky-400 font-sans">Fit</span>}
            </button>

            <button
              type="button"
              title="Aumentar Zoom (+)"
              onClick={handleZoomIn}
              disabled={effectiveZoom >= 125}
              className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors shrink-0"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Studio Ambience Selector */}
          <div className="hidden 2xl:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/90 shrink-0">
            <button
              type="button"
              title="Fundo Studio Grid"
              onClick={() => setStudioBg('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                studioBg === 'grid' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title="Fundo Mesh Gradient"
              onClick={() => setStudioBg('mesh')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                studioBg === 'mesh' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title="Fundo Minimal Slate"
              onClick={() => setStudioBg('slate')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                studioBg === 'slate' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Link Button */}
          <button
            type="button"
            title="Copiar Link Público"
            onClick={handleCopyPublicUrl}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-slate-700/60 shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="hidden sm:inline">Copiar Link</span>
              </>
            )}
          </button>

          {/* QR Code Quick View */}
          <button
            type="button"
            title="Gerar e Escanear QR Code"
            onClick={() => setShowQrQuickModal(true)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-slate-700/60 shadow-sm active:scale-95 shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden xl:inline">QR Code</span>
          </button>

          {/* Refresh preview */}
          <button
            type="button"
            title="Recarregar Prévia"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60 shadow-sm active:scale-95 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            title={deviceMode === 'fullscreen' ? 'Sair da tela cheia' : 'Visualizar em tela cheia'}
            onClick={() => onDeviceChange(deviceMode === 'fullscreen' ? 'mobile' : 'fullscreen')}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60 shadow-sm active:scale-95 shrink-0"
          >
            {deviceMode === 'fullscreen' ? (
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Stage Canvas */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 flex flex-col relative min-h-0 select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {/* Background Canvas Styles */}
        {studioBg === 'grid' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {studioBg === 'mesh' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 75%)',
            }}
          />
        )}

        {studioBg === 'slate' && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-900/40 to-slate-950/80" />
        )}

        {/* Dynamic Centered Auto-Fit & Zoom Container */}
        <div className="m-auto flex flex-col items-center justify-center p-2">
          <div
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center shrink-0"
            style={{
              transform: `scale(${effectiveZoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {/* ========================================================= */}
            {/* 1. SMARTPHONE VIEWPORT (IPHONE 16 PRO TITANIUM) */}
            {/* ========================================================= */}
            {deviceMode === 'mobile' && frameStyle === 'iphone16' && (
              <motion.div
                key={`iphone-${keyRefresh}`}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="relative shrink-0 select-none"
              >
                {/* External Natural Titanium Chassis Frame */}
                <div className="w-[370px] sm:w-[380px] h-[750px] rounded-[52px] p-[4px] bg-gradient-to-b from-[#f5f5f7] via-[#dcdce0] to-[#a8a8b0] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_12px_24px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.7)] relative flex flex-col shrink-0">
                  
                  {/* Outer Metallic Bevel Rim with Titanium Sheen */}
                  <div className="relative w-full h-full rounded-[48px] p-[5px] bg-gradient-to-br from-[#ebebee] via-[#d6d6dc] to-[#b2b3bc] border border-[#a1a1aa]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.25)] flex flex-col">
                    
                    {/* Antenna Hairline Bands */}
                    <div className="absolute -left-[4px] top-[95px] w-[4px] h-[3px] bg-[#71717a]/50" />
                    <div className="absolute -left-[4px] bottom-[95px] w-[4px] h-[3px] bg-[#71717a]/50" />
                    <div className="absolute -right-[4px] top-[95px] w-[4px] h-[3px] bg-[#71717a]/50" />
                    <div className="absolute -right-[4px] bottom-[95px] w-[4px] h-[3px] bg-[#71717a]/50" />

                    {/* Physical Titanium Hardware Side Buttons (Left & Right) */}
                    <div className="absolute -left-[7px] top-[108px] w-[3.5px] h-[26px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" title="Action Button" />
                    <div className="absolute -left-[7px] top-[148px] w-[3.5px] h-[48px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" title="Volume Up" />
                    <div className="absolute -left-[7px] top-[208px] w-[3.5px] h-[48px] bg-gradient-to-r from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-l-[3px] border-y border-l border-[#8e8e93]" title="Volume Down" />
                    <div className="absolute -right-[7px] top-[168px] w-[3.5px] h-[72px] bg-gradient-to-l from-[#a8a8b0] via-[#ebebee] to-[#cfd0d6] rounded-r-[3px] border-y border-r border-[#8e8e93]" title="Power / Siri Button" />

                    {/* Inner Screen Display Bezel */}
                    <div className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col bg-black shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] p-[3px]">
                      
                      {/* Inner Screen Glass */}
                      <div className="w-full h-full rounded-[39px] overflow-hidden relative flex flex-col bg-black">
                        {/* Dynamic Island Status Bar Overlay */}
                        <div className="absolute top-0 inset-x-0 z-40 px-6 pt-3 pb-2 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                          {/* Time */}
                          <span className="text-[12px] font-semibold tracking-tight text-white/90 drop-shadow-sm w-12 text-left font-mono">
                            {currentTime}
                          </span>

                          {/* Dynamic Island Pill */}
                          <div className="w-[105px] h-[28px] bg-black rounded-full border border-white/15 shadow-2xl flex items-center justify-between px-2.5">
                            {/* Front Camera Lens */}
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-sky-950" />
                            </div>
                            {/* Sensor / Audio Indicator */}
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                          </div>

                          {/* Right Status Icons (Signal & Battery) */}
                          <div className="flex items-center gap-1.5 text-white/90 drop-shadow-sm w-12 justify-end">
                            <Wifi className="w-3.5 h-3.5" />
                            <div className="flex items-center gap-0.5 border border-white/40 rounded-sm px-0.5 py-px">
                              <div className="w-3.5 h-1.5 bg-white rounded-2xs" />
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Screen Content Container */}
                        <div
                          ref={phoneScrollRef}
                          onScroll={handleScroll}
                          className="flex-1 overflow-y-auto relative scrollbar-none flex flex-col select-text"
                          style={{ backgroundColor: config.theme.bgColor || '#020617' }}
                        >
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full flex-1"
                              >
                                <PreviewSkeleton
                                  themeType={
                                    config.theme.textColor?.toLowerCase().includes('#f') ||
                                    config.theme.textColor?.toLowerCase().includes('white')
                                      ? 'dark'
                                      : 'light'
                                  }
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="w-full h-full flex-1"
                              >
                                <BioSiteRenderer
                                  config={config}
                                  isInteractive={isInteractiveTest}
                                  onBlockClick={onBlockClick} plan={plan} isAdmin={isAdmin} slug={slug}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Floating Scroll to Top Pill */}
                        <AnimatePresence>
                          {showScrollTop && (
                            <motion.button
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 15 }}
                              type="button"
                              onClick={scrollToTop}
                              className="absolute bottom-10 right-4 z-40 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 shadow-xl backdrop-blur-md transition-all active:scale-90"
                              title="Voltar ao topo"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </motion.button>
                          )}
                        </AnimatePresence>

                        {/* Home Indicator Gesture Bar */}
                        <div className="absolute bottom-0 inset-x-0 py-2 flex justify-center z-40 pointer-events-none bg-gradient-to-t from-black/60 to-transparent">
                          <div className="w-32 h-1 bg-white/50 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground Shadow */}
                <div className="w-[82%] h-4 bg-gradient-to-r from-transparent via-slate-950/40 to-transparent blur-md rounded-full mt-2 mx-auto" />
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* 2. MINIMAL FRAMELESS VIEWPORT (CLEAN FLOATING CARD) */}
            {/* ========================================================= */}
            {deviceMode === 'mobile' && frameStyle === 'frameless' && (
              <motion.div
                key={`frameless-${keyRefresh}`}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-[370px] sm:w-[380px] h-[740px] rounded-[36px] bg-slate-950 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col relative border border-slate-800 shrink-0"
              >
                {/* Minimal Top Header Indicator */}
                <div className="h-9 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
                  <span className="font-mono text-[11px] text-slate-300 font-semibold truncate max-w-[200px]">
                    {config.profile.handle || '@usuario'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    Visualização Limpa
                  </span>
                </div>

                {/* Scrollable Screen Content */}
                <div
                  ref={phoneScrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto relative scrollbar-none flex flex-col"
                  style={{ backgroundColor: config.theme.bgColor || '#020617' }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <PreviewSkeleton
                        themeType={
                          config.theme.textColor?.toLowerCase().includes('#f') ||
                          config.theme.textColor?.toLowerCase().includes('white')
                            ? 'dark'
                            : 'light'
                        }
                      />
                    ) : (
                      <BioSiteRenderer
                        config={config}
                        isInteractive={isInteractiveTest}
                        onBlockClick={onBlockClick} plan={plan} isAdmin={isAdmin} slug={slug}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* 3. NATIVE 1:1 MOBILE VIEWPORT (EDGE-TO-EDGE PERFECTION) */}
            {/* ========================================================= */}
            {deviceMode === 'mobile' && frameStyle === 'native' && (
              <motion.div
                key={`native-${keyRefresh}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[460px] min-h-[500px] h-full rounded-2xl sm:rounded-3xl bg-slate-950 overflow-hidden shadow-2xl flex flex-col relative border border-slate-800/80 shrink-0"
              >
                {/* Scrollable Screen Content */}
                <div
                  ref={phoneScrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto relative scrollbar-none flex flex-col"
                  style={{ backgroundColor: config.theme.bgColor || '#020617' }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <PreviewSkeleton
                        themeType={
                          config.theme.textColor?.toLowerCase().includes('#f') ||
                          config.theme.textColor?.toLowerCase().includes('white')
                            ? 'dark'
                            : 'light'
                        }
                      />
                    ) : (
                      <BioSiteRenderer
                        config={config}
                        isInteractive={isInteractiveTest}
                        onBlockClick={onBlockClick} plan={plan} isAdmin={isAdmin} slug={slug}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* 3. TABLET VIEWPORT (IPAD PRO) */}
            {/* ========================================================= */}
            {deviceMode === 'tablet' && (
              <motion.div
                key={`tablet-${keyRefresh}`}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-[600px] sm:w-[620px] h-[780px] bg-[#1c1e24] rounded-[38px] p-3.5 shadow-2xl border-[3px] border-[#2b2d35] flex flex-col relative overflow-hidden shrink-0"
              >
                {/* Tablet Camera dot */}
                <div className="w-full pb-2 flex justify-center z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>
                <div className="flex-1 rounded-[26px] overflow-y-auto relative scrollbar-none bg-slate-950 border border-white/10">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <PreviewSkeleton
                        themeType={
                          config.theme.textColor?.toLowerCase().includes('#f') ||
                          config.theme.textColor?.toLowerCase().includes('white')
                            ? 'dark'
                            : 'light'
                        }
                      />
                    ) : (
                      <BioSiteRenderer
                        config={config}
                        isInteractive={isInteractiveTest}
                        onBlockClick={onBlockClick} plan={plan} isAdmin={isAdmin} slug={slug}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* 4. DESKTOP BROWSER VIEWPORT (SAFARI WINDOW) */}
            {/* ========================================================= */}
            {deviceMode === 'desktop' && (
              <motion.div
                key={`desktop-${keyRefresh}`}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-[820px] sm:w-[860px] h-[760px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden shrink-0"
              >
                {/* Safari Window Controls & Address Bar */}
                <div className="h-10 bg-slate-950 border-b border-slate-800/90 flex items-center px-4 gap-3 shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/50" />
                  </div>
                  <div className="flex-1 max-w-md mx-auto bg-slate-900 rounded-lg px-4 py-1 text-xs text-slate-300 font-mono text-center truncate border border-slate-800 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{publicUrl}</span>
                  </div>
                </div>

                {/* Desktop Scroll Canvas */}
                <div className="flex-1 overflow-y-auto bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <PreviewSkeleton
                        themeType={
                          config.theme.textColor?.toLowerCase().includes('#f') ||
                          config.theme.textColor?.toLowerCase().includes('white')
                            ? 'dark'
                            : 'light'
                        }
                      />
                    ) : (
                      <BioSiteRenderer
                        config={config}
                        isInteractive={isInteractiveTest}
                        onBlockClick={onBlockClick} plan={plan} isAdmin={isAdmin} slug={slug}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Fullscreen Overlay Mode */}
      {deviceMode === 'fullscreen' && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto flex justify-center">
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPublicUrl}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 shadow-xl hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-sky-400" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDeviceChange('mobile')}
              className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 shadow-xl hover:bg-slate-800"
              title="Sair da tela cheia"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full max-w-[480px] my-auto min-h-screen py-10">
            {isLoading ? (
              <PreviewSkeleton
                themeType={
                  config.theme.textColor?.toLowerCase().includes('#f') ||
                  config.theme.textColor?.toLowerCase().includes('white')
                    ? 'dark'
                    : 'light'
                }
              />
            ) : (
              <BioSiteRenderer
                config={config}
                isInteractive={true}
                onBlockClick={onBlockClick} plan={plan} isAdmin={isAdmin} slug={slug}
              />
            )}
          </div>
        </div>
      )}

      {/* Quick QR Code Floating Modal */}
      <AnimatePresence>
        {showQrQuickModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button
                type="button"
                onClick={() => setShowQrQuickModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">Escanear no Celular</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Abra a câmera do seu smartphone para testar a experiência real.
              </p>

              {qrDataUrl && (
                <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-4">
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
              )}

              <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800 truncate mb-4">
                {publicUrl}
              </div>

              <button
                type="button"
                onClick={handleCopyPublicUrl}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Link Direto</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const LivePreviewPhone = React.memo(LivePreviewPhoneComponent);
