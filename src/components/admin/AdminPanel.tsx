import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../api/AuthContext';
import {
  adminListUsers,
  adminSetUserPlan,
  adminListSites,
  adminGetSummary,
  AdminUser,
  AdminSite,
  AdminSummary,
} from '../../api/db';
import { ArrowLeft, Users, CreditCard, BarChart3, Globe } from 'lucide-react';

interface AdminPanelProps {
  onNavigateToDashboard: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateToDashboard }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u, si] = await Promise.all([adminGetSummary(), adminListUsers(), adminListSites()]);
      setSummary(s);
      setUsers(u);
      setSites(si);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (user?.isAdmin !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Acesso negado</h1>
          <p className="text-sm text-gray-600 mt-1">Esta área é restrita a administradores.</p>
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="mt-4 px-4 py-2 rounded-xl bg-[#0F6E56] text-white text-sm font-bold"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => u.email.toLowerCase().includes(filter.toLowerCase()));

  const handleSetPlan = async (id: string, plan: 'free' | 'pro') => {
    try {
      await adminSetUserPlan(id, plan);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Erro ao alterar plano.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-black text-gray-950">Painel do Administrador</h1>
        </div>
        <span className="text-xs text-gray-500">{user?.email}</span>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                  <Users className="w-4 h-4" /> Usuários
                </div>
                <p className="text-2xl font-black mt-2">{summary?.totalUsers ?? 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                  <CreditCard className="w-4 h-4" /> Assinantes Pro
                </div>
                <p className="text-2xl font-black mt-2">{summary?.totalPro ?? 0}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                  <BarChart3 className="w-4 h-4" /> MRR estimado
                </div>
                <p className="text-2xl font-black mt-2">R$ {(summary?.mrr ?? 0).toFixed(2)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                  <Globe className="w-4 h-4" /> Pagamentos (30d)
                </div>
                <p className="text-2xl font-black mt-2">{summary?.recentPaymentsCount ?? 0}</p>
                <p className="text-xs text-gray-500">R$ {(summary?.recentPaymentsAmount ?? 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Users table */}
            <section>
              <h2 className="text-base font-bold mb-3">Usuários</h2>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar por email..."
                className="w-full max-w-sm mb-3 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F6E56]"
              />
              <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Email</th>
                      <th className="px-4 py-2.5 font-semibold">Plano</th>
                      <th className="px-4 py-2.5 font-semibold">Expira</th>
                      <th className="px-4 py-2.5 font-semibold">Admin</th>
                      <th className="px-4 py-2.5 font-semibold">Criado em</th>
                      <th className="px-4 py-2.5 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-gray-100">
                        <td className="px-4 py-2.5">{u.email}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              u.plan === 'pro' ? 'bg-emerald-50 text-[#0F6E56]' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">
                          {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-2.5">{u.isAdmin ? 'Sim' : '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={u.plan}
                            onChange={(e) => handleSetPlan(u.id, e.target.value as 'free' | 'pro')}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                          >
                            <option value="free">free</option>
                            <option value="pro">pro</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sites table */}
            <section>
              <h2 className="text-base font-bold mb-3">Sites da plataforma</h2>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">ID</th>
                      <th className="px-4 py-2.5 font-semibold">Dono</th>
                      <th className="px-4 py-2.5 font-semibold">Slug</th>
                      <th className="px-4 py-2.5 font-semibold">Título</th>
                      <th className="px-4 py-2.5 font-semibold">Publicado</th>
                      <th className="px-4 py-2.5 font-semibold">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((s) => (
                      <tr key={s.id} className="border-t border-gray-100">
                        <td className="px-4 py-2.5 text-xs text-gray-500">{s.id}</td>
                        <td className="px-4 py-2.5 text-xs">{s.ownerEmail}</td>
                        <td className="px-4 py-2.5 text-xs font-mono">{s.slug}</td>
                        <td className="px-4 py-2.5">{s.title ?? '—'}</td>
                        <td className="px-4 py-2.5">{s.isPublished ? 'Sim' : 'Não'}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">
                          {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
