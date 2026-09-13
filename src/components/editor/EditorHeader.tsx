import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  BarChart3,
  RotateCcw,
  Layers,
  Palette,
  User,
  Share2,
  Undo2,
  Redo2,
  ArrowLeft,
  Check,
  Cloud,
  CloudCheck,
  Loader2,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import { ExibaLogo } from '../common/ExibaLogo';
import { Tooltip } from '../common/Tooltip';

interface EditorHeaderProps {
  activeTab: 'profile' | 'blocks' | 'social' | 'theme';
  onTabChange: (tab: 'profile' | 'blocks' | 'social' | 'theme') => void;
  onSelectTemplate: (templateId: string) => void;
  onReset: () => void;
  onOpenExport: () => void;
  onOpenAnalytics: () => void;
  onOpenQR: () => void;
  currentTemplateId?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onBackToDashboard?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  onOpenAiModal?: () => void;
  plan?: 'free' | 'pro';
  onOpenUpgrade?: () => void;
}

export function EditorHeader({
  activeTab,
  onTabChange,
  onSelectTemplate,
  onReset,
  onOpenExport,
  onOpenAnalytics,
  onOpenQR,
  currentTemplateId,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onBackToDashboard,
  isSaving = false,
  lastSavedAt = null,
  saveStatus = 'saved',
  isFocusMode = false,
  onToggleFocusMode,
  onOpenAiModal,
  plan = 'free',
  onOpenUpgrade,
}: EditorHeaderProps) {

  const [showToast, setShowToast] = useState(false);

  // Trigger brief toast confirmation whenever save finishes successfully
  useEffect(() => {
    if (saveStatus === 'saved' && lastSavedAt) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2600);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, lastSavedAt]);

  const formatSavedTime = (date: Date | null) => {
    if (!date) return 'sincronizado';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="hidden lg:flex px-4 pt-3 pb-3.5 shrink-0 flex-col gap-2.5 relative">
      {/* Informative Save Confirmation Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 bg-emerald-950/95 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-semibold shadow-lg shadow-emerald-950/50 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alterações salvas com sucesso</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: Brand & Status (Left) + Primary Global Actions (Right) */}
      <div className="flex items-center justify-between gap-2.5 w-full">
        {/* Left: Back button + Logo + Compact Save Status */}
        <div className="flex items-center gap-2 min-w-0">
          {onBackToDashboard && (
            <Tooltip content="Voltar para a lista dos seus Bio Sites">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
                aria-label="Voltar para Meus Sites"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <ExibaLogo height={22} size="sm" theme="dark" showSubtitle />

            {/* Compact Cloud Save Status Pill */}
            <Tooltip
              content={
                lastSavedAt
                  ? `Sincronizado na nuvem às ${formatSavedTime(lastSavedAt)}`
                  : 'Sincronização contínua com a nuvem'
              }
            >
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-default shrink-0 ${
                  isSaving
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : saveStatus === 'saved'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    <span>Salvo</span>
                  </>
                )}
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Right: Virar Pro + Publicar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {plan !== 'pro' && onOpenUpgrade && (
            <Tooltip content="Faça upgrade para o Plano Pro: use seu próprio domínio e remova a marca d'água">
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="px-2.5 py-1.5 rounded-lg border border-amber-500/35 hover:border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                aria-label="Upgrade Pro"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Virar Pro</span>
              </button>
            </Tooltip>
          )}

          <Tooltip content="Publicar, exportar código HTML e gerar QR Code">
            <button
              type="button"
              onClick={onOpenExport}
              className="px-3.5 py-1.5 rounded-lg bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs shadow-md shadow-[#0F6E56]/20 transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
              aria-label="Publicar e Exportar"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Publicar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Row 2: Model Switcher & AI Generator & Tools Toolbar */}
      <div className="flex items-center justify-between gap-2 w-full bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
        {/* Model Select */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <label htmlFor="header-template-select" className="text-xs text-slate-400 shrink-0 font-semibold flex items-center gap-1 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Modelo:</span>
          </label>
          <div className="flex-1 min-w-0">
            <select
              id="header-template-select"
              aria-label="Selecionar Modelo Pronto"
              onChange={(e) => onSelectTemplate(e.target.value)}
              value={currentTemplateId || ''}
              className="w-full min-w-0 bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] transition-colors truncate font-medium cursor-pointer hover:bg-slate-850"
            >
              <option value="" disabled>
                Trocar modelo pronto...
              </option>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.previewEmoji} {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Action Button */}
        {onOpenAiModal && (
          <Tooltip content="Gerar site completo instantâneo com Inteligência Artificial">
            <button
              type="button"
              onClick={onOpenAiModal}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/60 transition-all flex items-center gap-1.5 text-xs shrink-0 font-bold shadow-sm active:scale-95 whitespace-nowrap"
              aria-label="Gerar com IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Gerar com IA</span>
            </button>
          </Tooltip>
        )}

        {/* Quick Tools Divider */}
        <div className="w-px h-4 bg-slate-800 shrink-0" />

        {/* Tools (Undo, Redo, Focus, Analytics, Reset) */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip content="Desfazer última alteração (Ctrl+Z)">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md text-xs flex items-center transition-all ${
                canUndo
                  ? 'text-slate-300 hover:text-[#0F6E56] hover:bg-slate-800 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-40'
              }`}
              aria-label="Desfazer alteração"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Refazer alteração (Ctrl+Y)">
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md text-xs flex items-center transition-all ${
                canRedo
                  ? 'text-slate-300 hover:text-[#0F6E56] hover:bg-slate-800 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed opacity-40'
              }`}
              aria-label="Refazer alteração"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {onToggleFocusMode && (
            <Tooltip
              content={
                isFocusMode
                  ? 'Sair do Modo Foco (Mostrar painel de edição)'
                  : 'Modo Foco / Tela Cheia (Expandir prévia ao vivo)'
              }
            >
              <button
                type="button"
                onClick={onToggleFocusMode}
                className={`p-1.5 rounded-md transition-all flex items-center ${
                  isFocusMode
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                aria-label="Modo Foco"
              >
                {isFocusMode ? (
                  <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>
          )}

          <Tooltip content="Ver estatísticas e relatório de cliques do site">
            <button
              type="button"
              onClick={onOpenAnalytics}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Estatísticas de cliques"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Restaurar valores e blocos padrão do modelo original">
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Restaurar padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Row 3: Sub-navigation 4 Main Tabs with CSS Grid */}
      <nav className="grid grid-cols-4 gap-1.5 w-full bg-slate-950/90 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
        <Tooltip content="Editar foto de perfil, capa, nome, biografia e SEO">
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all w-full ${
              activeTab === 'profile'
                ? 'bg-[#0F6E56] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Perfil</span>
          </button>
        </Tooltip>

        <Tooltip content="Adicionar e gerenciar links, vídeos, chave PIX e vitrines">
          <button
            type="button"
            onClick={() => onTabChange('blocks')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all w-full ${
              activeTab === 'blocks'
                ? 'bg-[#0F6E56] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Blocos</span>
          </button>
        </Tooltip>

        <Tooltip content="Configurar links de redes sociais (WhatsApp, Instagram, etc.)">
          <button
            type="button"
            onClick={() => onTabChange('social')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all w-full ${
              activeTab === 'social'
                ? 'bg-[#0F6E56] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Redes</span>
          </button>
        </Tooltip>

        <Tooltip content="Personalizar cores, fontes, estilos de botões e animações">
          <button
            type="button"
            onClick={() => onTabChange('theme')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all w-full ${
              activeTab === 'theme'
                ? 'bg-[#0F6E56] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tema</span>
          </button>
        </Tooltip>
      </nav>
    </header>
  );
}
