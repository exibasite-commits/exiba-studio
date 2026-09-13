import React, { useState, useEffect } from 'react';
import { useAuth } from '../../api/AuthContext';
import { getUserSites, createNewSite, deleteSite, SiteRecord, subscribeToPro } from '../../api/db';
import { TEMPLATES } from '../../data/templates';
import { ExibaLogo } from '../common/ExibaLogo';
import {
  Plus,
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  Layers,
  LogOut,
  ArrowLeft,
  Check,

  Loader2,
  Sparkles,
} from 'lucide-react';
import { PlanUpgradeModal } from '../billing/PlanUpgradeModal';


interface UserDashboardProps {
  onOpenEditor: (siteId: string) => void;
  onNavigateToLanding: () => void;
  onNavigateToAdmin?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenEditor,
  onNavigateToLanding,
  onNavigateToAdmin,
}) => {
  const { user, logout, refreshUser } = useAuth();
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  
  // Modal for new site
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [newSiteTitle, setNewSiteTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [creating, setCreating] = useState(false);

  const loadSites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userSites = await getUserSites(user.uid);
      setSites(userSites);
    } catch (err) {
      console.error('Error fetching sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, [user]);

  const handleCopyLink = (slug: string, id: string) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const newDoc = await createNewSite(
        user.uid,
        newSiteTitle || 'Meu Novo Exiba',
        selectedTemplateId
      );
      setIsNewSiteModalOpen(false);
      setNewSiteTitle('');
      onOpenEditor(newDoc.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este mini-site?')) {
      await deleteSite(siteId);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
    }
  };

  const handleSubscribe = async () => {
    try {
      const { initPoint } = await subscribeToPro(billingCycle);
      if (initPoint) {
        window.location.href = initPoint;
      } else {
        alert('Não foi possível iniciar o checkout.');
      }
    } catch (e: any) {
      alert(e?.message || 'Erro ao iniciar assinatura.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-950 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Início</span>
          </button>

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <ExibaLogo height={28} size="sm" theme="light" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Painel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-[#0F6E56] animate-pulse" />
            <span>{user?.email}</span>
          </div>

          {user?.isAdmin && onNavigateToAdmin && (
            <button
              type="button"
              onClick={onNavigateToAdmin}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
            >
              Admin
            </button>
          )}

          {user?.plan === 'pro' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Assinante PRO</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0F6E56] to-emerald-600 hover:opacity-95 shadow-xs transition-all transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Upgrade PRO</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => logout()}
            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-xl transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Banner header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#0F6E56] uppercase tracking-wide">
              Gerenciador de Mini-Sites
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
              Seus Mini-Sites & Catálogos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Edite o conteúdo em tempo real, acompanhe os cliques e divulgue seu link.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewSiteModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#0F6E56]/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Mini-Site</span>
          </button>
        </div>

        {/* Pro Banner Callout */}
        {user?.plan !== 'pro' && !user?.isAdmin && (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                <Sparkles className="w-3 h-3 fill-amber-300" />
                <span>EXIBA PRO</span>
              </div>
              <h2 className="text-lg font-bold">Turbine seu negócio com o Exiba Pro</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Remova a marca d'água Exiba, conecte seu domínio próprio (.com / .com.br), tenha mini-sites ilimitados e acesse estatísticas completas em tempo real via PIX instantâneo ou Cartão.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="relative z-10 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <span>Fazer Upgrade via PIX</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sites Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F6E56]" />
            <span className="text-xs">Carregando seus mini-sites...</span>
          </div>
        ) : sites.length === 0 ? (
          <div className="py-16 bg-white border border-gray-200 rounded-3xl text-center p-8 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] flex items-center justify-center mx-auto text-2xl font-bold">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-gray-950">
              Você ainda não possui mini-sites criados
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Clique no botão abaixo para criar seu primeiro mini-site profissional em menos de 1 minuto.
            </p>
            <button
              type="button"
              onClick={() => setIsNewSiteModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro Mini-Site</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => {
              return (
                <div
                  key={site.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#0F6E56]/40 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xl">
                        {site.config?.profile?.avatarUrl ? (
                          <img
                            src={site.config.profile.avatarUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          '⚡'
                        )}
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0F6E56] border border-emerald-200 text-[10px] font-bold">
                        Publicado
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-950 group-hover:text-[#0F6E56] transition-colors">
                        {site.title || site.config?.profile?.name || 'Mini-site sem título'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        exiba.site/?p={site.slug}
                      </p>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-5 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEditor(site.id)}
                      className="flex-1 py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(site.slug, site.id)}
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      title="Copiar Link"
                    >
                      {copiedId === site.id ? (
                        <Check className="w-4 h-4 text-[#0F6E56]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(site.id)}
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Create New Site Modal */}
      {isNewSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-bold text-gray-950">
                Criar Novo Mini-Site
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Escolha o nome e o modelo inicial para começar.
              </p>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome do Negócio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Studio Bella Unhas"
                  value={newSiteTitle}
                  onChange={(e) => setNewSiteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0F6E56] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Modelo Inicial
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        selectedTemplateId === tmpl.id
                          ? 'bg-emerald-50 border-[#0F6E56] text-gray-950 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{tmpl.previewEmoji}</span>
                      <span className="text-xs truncate">{tmpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Criar e Abrir Editor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onPlanUpgraded={() => {
          refreshUser();
          loadSites();
        }}
      />
    </div>
  );
};
