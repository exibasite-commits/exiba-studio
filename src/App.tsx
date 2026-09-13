/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './api/AuthContext';
import { getSite, saveSiteConfig, trackSiteView, trackBlockClick } from './api/db';
import { BioSiteConfig, DeviceMode, ContentBlock, SocialLink, ThemeConfig } from './types';
import { loadSavedConfig, saveConfig } from './utils/storage';
import { updateDocumentMetaTags } from './utils/seoUtils';
import { TEMPLATES } from './data/templates';

// Landing Page Components
import { LandingHeader } from './components/landing/LandingHeader';
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { ExamplesShowcaseSection } from './components/landing/ExamplesShowcaseSection';
import { PricingSection } from './components/landing/PricingSection';
import { FaqSection } from './components/landing/FaqSection';
import { LandingFooter } from './components/landing/LandingFooter';
import { FloatingWhatsApp } from './components/landing/FloatingWhatsApp';
import { TemplatePreviewModal } from './components/landing/TemplatePreviewModal';
import { AuthModal } from './components/auth/AuthModal';

// Dashboard
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { PublicSiteView } from './components/public/PublicSiteView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';

// Studio Editor Components
import { EditorHeader } from './components/editor/EditorHeader';
import { ProfileEditor } from './components/editor/ProfileEditor';
import { BlocksEditor } from './components/editor/BlocksEditor';
import { SocialLinksEditor } from './components/editor/SocialLinksEditor';
import { ThemeEditor } from './components/editor/ThemeEditor';
import { LivePreviewPhone } from './components/preview/LivePreviewPhone';
import { ExportModal } from './components/editor/ExportModal';
import { AnalyticsModal } from './components/editor/AnalyticsModal';
import { AiSiteGeneratorModal } from './components/editor/AiSiteGeneratorModal';
import { PlanUpgradeModal } from './components/billing/PlanUpgradeModal';
import confetti from 'canvas-confetti';

import { motion, AnimatePresence } from 'motion/react';


import {
  Edit3,
  Eye,
  Sparkles,
  User,
  Layers,
  Share2,
  Palette,
  Download,
  Undo2,
  Redo2,
  ArrowLeft,
  LayoutDashboard,
  Minimize2,
  Maximize2,
} from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Navigation View: 'landing' | 'dashboard' | 'editor' | 'admin'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'editor' | 'admin'>('landing');

  // Rota inicial: detecta /:slug (site público) ou /reset-password.
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/reset-password') {
      setShowResetPassword(true);
      return;
    }
    const match = path.match(/^\/([^/]+)$/);
    if (match && !['admin', 'reset-password'].includes(match[1])) {
      setPublicSlug(match[1]);
    }
  }, []);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [activeSiteSlug, setActiveSiteSlug] = useState<string | null>(null);
  const [isSavingRemote, setIsSavingRemote] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [selectedTemplateForAuth, setSelectedTemplateForAuth] = useState<string | null>(null);

  // Template Preview Modal
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Editor State
  const initialConfig = loadSavedConfig();
  const [config, setConfigState] = useState<BioSiteConfig>(initialConfig);
  
  // Undo / Redo history state stack
  const historyRef = useRef<BioSiteConfig[]>([initialConfig]);
  const historyIndexRef = useRef<number>(0);
  const [, setHistoryVersion] = useState(0);

  const [activeTab, setActiveTab] = useState<'profile' | 'blocks' | 'social' | 'theme'>('profile');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [mobileScreenMode, setMobileScreenMode] = useState<'editor' | 'preview'>('editor');
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('salao-beleza');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleSiteGeneratedByAi = (generatedConfig: BioSiteConfig) => {
    updateConfig(generatedConfig);
    setCurrentTemplateId('');
    if (currentView === 'landing') {
      setCurrentView('editor');
    }
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.4 },
      });
    } catch {
      // ignore
    }
  };


  // Auto-save debouncing timer for the remote API
  const remoteSaveTimerRef = useRef<any>(null);

  // Load site from the API when activeSiteId changes
  useEffect(() => {
    if (activeSiteId) {
      setIsPreviewLoading(true);
      getSite(activeSiteId).then((siteDoc) => {
        if (siteDoc && siteDoc.config) {
          setConfigState(siteDoc.config);
          historyRef.current = [siteDoc.config];
          historyIndexRef.current = 0;
          if (siteDoc.templateId) {
            setCurrentTemplateId(siteDoc.templateId);
          }
          setLastSavedAt(new Date());
          setSaveStatus('saved');
          setActiveSiteSlug(siteDoc.slug);
          trackSiteView(activeSiteId).catch(() => {});
        }
        setTimeout(() => setIsPreviewLoading(false), 250);
      }).catch(() => {
        setIsPreviewLoading(false);
      });
    }
  }, [activeSiteId]);

  // Set config with history record
  const updateConfig = useCallback((updater: BioSiteConfig | ((prev: BioSiteConfig) => BioSiteConfig), recordHistory = true) => {
    setConfigState((prev) => {
      const nextConfig = typeof updater === 'function' ? updater(prev) : updater;
      if (recordHistory) {
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(nextConfig);
        if (newHistory.length > 50) newHistory.shift();
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
        setHistoryVersion((v) => v + 1);
      }

      // Auto save to the remote API if user is authenticated and activeSiteId exists
      if (activeSiteId) {
        setIsSavingRemote(true);
        setSaveStatus('saving');
        if (remoteSaveTimerRef.current) clearTimeout(remoteSaveTimerRef.current);
        remoteSaveTimerRef.current = setTimeout(async () => {
          try {
            await saveSiteConfig(activeSiteId, nextConfig, nextConfig.profile?.name);
            setIsSavingRemote(false);
            setSaveStatus('saved');
            setLastSavedAt(new Date());
          } catch (err) {
            setIsSavingRemote(false);
            setSaveStatus('error');
          }
        }, 1200);
      }

      return nextConfig;
    });
  }, [activeSiteId]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const targetConfig = historyRef.current[historyIndexRef.current];
      setConfigState(targetConfig);
      setHistoryVersion((v) => v + 1);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const targetConfig = historyRef.current[historyIndexRef.current];
      setConfigState(targetConfig);
      setHistoryVersion((v) => v + 1);
    }
  }, []);

  // Dynamically update SEO meta tags (title, description, keywords, Open Graph, Twitter Cards)
  useEffect(() => {
    if (config.profile) {
      updateDocumentMetaTags(config.profile);
    }
  }, [config.profile]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y in editor
  useEffect(() => {
    if (currentView !== 'editor') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleUndo, handleRedo]);

  // Auto-save locally
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Dynamically update document title & meta tags for SEO
  useEffect(() => {
    updateDocumentMetaTags(config.profile);
  }, [config.profile]);

  // Route Handlers
  const handleOpenAuth = (mode: 'login' | 'register', templateId?: string) => {
    setAuthModalMode(mode);
    if (templateId) setSelectedTemplateForAuth(templateId);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (siteId: string) => {
    setIsAuthModalOpen(false);
    setActiveSiteId(siteId);
    setCurrentView('editor');
  };

  const handleUseTemplate = (templateId: string) => {
    if (user) {
      // Find template
      const found = TEMPLATES.find((t) => t.id === templateId);
      if (found) {
        updateConfig({ ...found.config });
        setCurrentTemplateId(templateId);
      }
      setCurrentView('editor');
    } else {
      setSelectedTemplateForAuth(templateId);
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
    }
  };

  const handleOpenEditorFromDashboard = (siteId: string) => {
    setActiveSiteId(siteId);
    setCurrentView('editor');
  };

  // Protected View Check
  const handleNavigateToDashboard = () => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    setCurrentView('dashboard');
  };

  const handleNavigateToEditor = () => {
    setCurrentView('editor');
  };

  // Editor Form Handlers
  const handleProfileChange = (updatedProfile: any) => {
    updateConfig((prev) => ({ ...prev, profile: updatedProfile }));
  };

  const handleBlocksChange = (updatedBlocks: ContentBlock[]) => {
    updateConfig((prev) => ({ ...prev, blocks: updatedBlocks }));
  };

  const handleSocialsChange = (updatedSocials: SocialLink[]) => {
    updateConfig((prev) => ({ ...prev, socialLinks: updatedSocials }));
  };

  const handleSocialPositionChange = (socialPosition: 'top' | 'bottom') => {
    updateConfig((prev) => ({ ...prev, socialPosition }));
  };

  const handleThemeChange = (updatedTheme: ThemeConfig) => {
    updateConfig((prev) => ({ ...prev, theme: updatedTheme }));
  };

  const handleThemeFieldChange = (field: keyof ThemeConfig, val: any) => {
    updateConfig((prev) => ({
      ...prev,
      theme: { ...prev.theme, [field]: val },
    }));
  };

  const handleSelectTemplate = (templateId: string) => {
    const found = TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setIsPreviewLoading(true);
      updateConfig({ ...found.config });
      setCurrentTemplateId(templateId);
      setTimeout(() => setIsPreviewLoading(false), 240);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Deseja restaurar as configurações padrão do modelo?')) {
      setIsPreviewLoading(true);
      updateConfig({ ...TEMPLATES[0].config });
      setCurrentTemplateId('salao-beleza');
      setTimeout(() => setIsPreviewLoading(false), 240);
    }
  };

  const handleBlockClick = (blockId: string) => {
    if (activeSiteId) {
      trackBlockClick(activeSiteId, blockId).catch(() => {});
    }
  };

  const handleImportConfig = (newConfig: BioSiteConfig) => {
    updateConfig(newConfig);
  };

  // 0a. RESET PASSWORD VIEW (rota /reset-password)
  if (showResetPassword) {
    return (
      <ResetPasswordView
        onDone={() => {
          setShowResetPassword(false);
          setCurrentView('landing');
        }}
      />
    );
  }

  // 0b. PUBLIC SITE VIEW (rota /:slug)
  if (publicSlug) {
    return <PublicSiteView slug={publicSlug} />;
  }

  // 1. LANDING PAGE VIEW
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen w-full bg-white text-gray-900 font-sans selection:bg-[#0F6E56] selection:text-white">
        <LandingHeader
          onOpenAuth={handleOpenAuth}
          onNavigateToDashboard={handleNavigateToDashboard}
          onNavigateToEditor={handleNavigateToEditor}
          onOpenAiModal={() => setIsAiModalOpen(true)}
        />

        <main>
          <HeroSection
            onOpenAuth={handleOpenAuth}
            onSelectTemplatePreview={(id) => setPreviewTemplateId(id)}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />

          <HowItWorksSection />

          <ExamplesShowcaseSection onUseTemplate={handleUseTemplate} />

          <PricingSection
            onSelectPlan={(plan) => {
              if (plan === 'pro') {
                if (user) {
                  setIsUpgradeModalOpen(true);
                } else {
                  handleOpenAuth('register');
                }
              } else {
                handleOpenAuth('register');
              }
            }}
          />

          <FaqSection />
        </main>

        <LandingFooter onOpenAuth={handleOpenAuth} />

        <FloatingWhatsApp />

        {/* AI Site Generator Modal */}
        <AiSiteGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onSiteGenerated={handleSiteGeneratedByAi}
        />

        {/* Template Preview Modal */}
        <TemplatePreviewModal
          templateId={previewTemplateId}
          isOpen={!!previewTemplateId}
          onClose={() => setPreviewTemplateId(null)}
          onUseTemplate={handleUseTemplate}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}

          initialMode={authModalMode}
          templateId={selectedTemplateForAuth}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          onDemoMode={() => {
            setIsAuthModalOpen(false);
            if (selectedTemplateForAuth) {
              const found = TEMPLATES.find((t) => t.id === selectedTemplateForAuth);
              if (found) {
                updateConfig({ ...found.config });
                setCurrentTemplateId(selectedTemplateForAuth);
              }
            }
            setCurrentView('editor');
          }}
        />

        {/* Plan Upgrade Modal */}
        <PlanUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onPlanUpgraded={() => {
            refreshUser();
          }}
        />
      </div>
    );
  }

  // 2. DASHBOARD VIEW (Protected)
  if (currentView === 'dashboard') {
    return (
      <UserDashboard
        onOpenEditor={handleOpenEditorFromDashboard}
        onNavigateToLanding={() => setCurrentView('landing')}
        onNavigateToAdmin={() => setCurrentView('admin')}
      />
    );
  }

  // 3. ADMIN VIEW (admin only)
  if (currentView === 'admin') {
    return <AdminPanel onNavigateToDashboard={() => setCurrentView('dashboard')} />;
  }

  // 4. STUDIO EDITOR VIEW
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Mobile Top Navigation Bar (< 1024px) */}
      <header className="lg:hidden h-14 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/90 flex items-center px-2 sm:px-3 justify-between shrink-0 z-40 gap-1 sm:gap-2">
        {/* Brand & Back Button */}
        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView(user ? 'dashboard' : 'landing')}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-white tracking-tight truncate">
            Exiba <span className="text-emerald-400">Studio</span>
          </span>
        </div>

        {/* Mobile Undo / Redo & Mode Switcher */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded text-xs flex items-center ${
                canUndo ? 'text-slate-200 hover:text-emerald-400 active:scale-90' : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title="Desfazer"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded text-xs flex items-center ${
                canRedo ? 'text-slate-200 hover:text-emerald-400 active:scale-90' : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title="Refazer"
            >
              <Redo2 className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="p-1.5 px-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 shrink-0"
            title="Criar com IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] hidden xs:inline">IA</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="p-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1 shrink-0"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] hidden xs:inline">Salvar</span>
          </button>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setMobileScreenMode('editor')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mobileScreenMode === 'editor'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden xs:inline">Editar</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileScreenMode('preview')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                mobileScreenMode === 'preview'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden xs:inline">Prévia</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Visual Studio Editor with Rigid Grid and Sticky Header */}
        <aside
          className={`${
            isFocusMode ? 'hidden' : 'w-full lg:w-[470px] xl:w-[490px] 2xl:w-[540px] flex'
          } flex-col bg-slate-950 border-r border-slate-800/80 shrink-0 h-full overflow-hidden transition-all duration-300 relative ${
            mobileScreenMode === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Sticky Header Navigation Bar */}
          <div className="sticky top-0 z-30 w-full shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 shadow-md">
            <EditorHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSelectTemplate={handleSelectTemplate}
              onReset={handleResetToDefault}
              onOpenExport={() => setIsExportOpen(true)}
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
              onOpenQR={() => setIsExportOpen(true)}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              currentTemplateId={currentTemplateId}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onBackToDashboard={() => setCurrentView(user ? 'dashboard' : 'landing')}
              isSaving={isSavingRemote}
              lastSavedAt={lastSavedAt}
              saveStatus={saveStatus}
              isFocusMode={isFocusMode}
              onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
              plan={user?.plan ?? 'free'}
              onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            />
          </div>


          {/* Active Tab Scrollable Form Content with Fixed Padding and Row Gap Grid */}
          <main
            className="flex-1 overflow-y-auto p-6 pb-32 lg:pb-10 scroll-padding-top-24 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            <div className="grid grid-cols-1 gap-6 w-full max-w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.985, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.985, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 gap-6 w-full max-w-full"
                >
                  {activeTab === 'profile' && (
                    <ProfileEditor
                      profile={config.profile}
                      onChange={handleProfileChange}
                    />
                  )}

                  {activeTab === 'blocks' && (
                    <BlocksEditor
                      blocks={config.blocks}
                      onChangeBlocks={handleBlocksChange}
                      siteId={activeSiteId ?? undefined}
                    />
                  )}

                  {activeTab === 'social' && (
                    <SocialLinksEditor
                      socialLinks={config.socialLinks}
                      socialPosition={config.socialPosition}
                      theme={config.theme}
                      showSocials={config.profile.showSocials !== false}
                      onToggleShowSocials={(enabled) =>
                        handleProfileChange({ ...config.profile, showSocials: enabled })
                      }
                      onChangeSocials={handleSocialsChange}
                      onChangePosition={handleSocialPositionChange}
                      onChangeThemeField={handleThemeFieldChange}
                    />
                  )}

                  {activeTab === 'theme' && (
                    <ThemeEditor
                      theme={config.theme}
                      onChangeTheme={handleThemeChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </aside>

        {/* Floating Focus Mode Exit button when editor is hidden */}
        {isFocusMode && (
          <div className="absolute top-4 left-4 z-40">
            <button
              type="button"
              onClick={() => setIsFocusMode(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Minimize2 className="w-4 h-4 text-sky-400" />
              <span>Sair do Modo Foco (Editar)</span>
            </button>
          </div>
        )}

        {/* Right Pane: Interactive Live Device Frame */}
        <section
          className={`flex-1 flex flex-col h-full overflow-hidden ${
            mobileScreenMode === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <LivePreviewPhone
            config={config}
            deviceMode={deviceMode}
            onDeviceChange={setDeviceMode}
            onOpenQR={() => setIsExportOpen(true)}
            onBlockClick={handleBlockClick}
            isLoading={isPreviewLoading}
            plan={user?.plan ?? 'free'}
            isAdmin={user?.isAdmin ?? false}
            slug={activeSiteSlug ?? undefined}
          />
        </section>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            setMobileScreenMode('editor');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            mobileScreenMode === 'editor' && activeTab === 'profile'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('blocks');
            setMobileScreenMode('editor');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all relative ${
            mobileScreenMode === 'editor' && activeTab === 'blocks'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Layers className="w-4 h-4 mb-0.5" />
            {config.blocks.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-extrabold flex items-center justify-center">
                {config.blocks.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Blocos</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('social');
            setMobileScreenMode('editor');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            mobileScreenMode === 'editor' && activeTab === 'social'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Share2 className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Sociais</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('theme');
            setMobileScreenMode('editor');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            mobileScreenMode === 'editor' && activeTab === 'theme'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Palette className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Tema</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileScreenMode((prev) => (prev === 'preview' ? 'editor' : 'preview'));
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-all ${
            mobileScreenMode === 'preview'
              ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/30'
              : 'text-slate-200 hover:text-white font-semibold'
          }`}
        >
          <Eye className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span className="text-[10px] text-emerald-400">
            {mobileScreenMode === 'preview' ? 'Voltar' : 'Prévia'}
          </span>
        </button>
      </nav>

      {/* Export, Domain & QR Code Modal */}
      <ExportModal
        config={config}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onImportConfig={handleImportConfig}
        onUpdateConfig={updateConfig}
        plan={user?.plan ?? 'free'}
        isAdmin={user?.isAdmin ?? false}
        onUpgradeToPro={() => setIsUpgradeModalOpen(true)}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        config={config}
        siteId={activeSiteId}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* AI Site Generator Modal */}
      <AiSiteGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSiteGenerated={handleSiteGeneratedByAi}
      />

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onPlanUpgraded={() => {
          refreshUser();
        }}
      />
    </div>

  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
