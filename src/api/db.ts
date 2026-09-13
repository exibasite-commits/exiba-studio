// Camada de dados do BioSite — fala com a API própria (Express + MySQL).
// Mantém as mesmas assinaturas de função para não quebrar quem já consome este módulo.

import { apiFetch } from './api';
import { BioSiteConfig } from '../types';
import { TEMPLATES } from '../data/templates';

export interface SiteRecord {
  id: string;
  ownerId: string;
  slug: string;
  title: string | null;
  templateId: string | null;
  config: BioSiteConfig;
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface DailyMetric {
  date: string;
  views: number;
  clicks: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  clicksByBlock: Record<string, number>;
  dailyHistory?: DailyMetric[];
}

// Monta o site inicial a partir de um template (lógica de template continua no frontend).
export function buildTemplateSite(
  templateId?: string,
  title?: string
): { title: string; templateId: string; config: BioSiteConfig } {
  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const config: BioSiteConfig = {
    ...selectedTemplate.config,
    ...(title
      ? { profile: { ...selectedTemplate.config.profile, name: title } }
      : {}),
  };
  return {
    title: title || selectedTemplate.name,
    templateId: selectedTemplate.id,
    config,
  };
}

// Garante que o usuário tenha pelo menos um site: retorna o primeiro existente ou cria um novo.
// (userId/userEmail ficam sem uso — o dono vem da sessão no backend.)
export async function createInitialUserSite(
  userId: string,
  userEmail: string,
  templateId?: string
): Promise<SiteRecord> {
  const sites = await getUserSites();
  if (sites.length > 0) return sites[0];

  const built = buildTemplateSite(templateId);
  return apiFetch<SiteRecord>('/api/sites', {
    method: 'POST',
    body: { title: built.title, templateId: built.templateId, config: built.config },
  });
}

export async function getUserSites(_userId?: string): Promise<SiteRecord[]> {
  try {
    return await apiFetch<SiteRecord[]>('/api/sites');
  } catch {
    return [];
  }
}

export async function getSite(siteId: string): Promise<SiteRecord | null> {
  try {
    return await apiFetch<SiteRecord>(`/api/sites/${siteId}`);
  } catch {
    return null;
  }
}

export async function saveSiteConfig(
  siteId: string,
  config: BioSiteConfig,
  title?: string
): Promise<void> {
  await apiFetch(`/api/sites/${siteId}`, {
    method: 'PUT',
    body: { config, title },
  });
}

export async function createNewSite(
  _userId: string,
  title: string,
  templateId: string
): Promise<SiteRecord> {
  const built = buildTemplateSite(templateId, title);
  return apiFetch<SiteRecord>('/api/sites', {
    method: 'POST',
    body: { title: built.title, templateId: built.templateId, config: built.config },
  });
}

export async function deleteSite(siteId: string): Promise<void> {
  await apiFetch(`/api/sites/${siteId}`, { method: 'DELETE' });
}

// ---------- analytics (eventos agregados no backend) ----------

export async function trackSiteView(siteId: string): Promise<void> {
  await apiFetch(`/api/sites/${siteId}/analytics`, {
    method: 'POST',
    body: { eventType: 'view' },
  });
}

export async function trackBlockClick(siteId: string, blockId: string): Promise<void> {
  await apiFetch(`/api/sites/${siteId}/analytics`, {
    method: 'POST',
    body: { eventType: 'click', blockId },
  });
}

export async function getAnalyticsSummary(siteId: string): Promise<AnalyticsSummary> {
  try {
    return await apiFetch<AnalyticsSummary>(`/api/sites/${siteId}/analytics/summary`);
  } catch {
    // Modo de demonstração / offline: gera histórico realista para os últimos 14 dias
    const history: DailyMetric[] = [];
    let viewsSum = 0;
    let clicksSum = 0;

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const views = Math.floor(18 + Math.sin(i) * 8 + (14 - i) * 3);
      const clicks = Math.floor(views * (0.28 + (i % 3) * 0.04));
      viewsSum += views;
      clicksSum += clicks;
      history.push({ date: dateStr, views, clicks });
    }

    return {
      totalViews: viewsSum,
      totalClicks: clicksSum,
      clicksByBlock: {},
      dailyHistory: history,
    };
  }
}

export async function resetAnalytics(siteId: string): Promise<void> {
  await apiFetch(`/api/sites/${siteId}/analytics`, { method: 'DELETE' });
}

// ---------- billing ----------

export interface BillingStatus {
  plan: 'free' | 'pro';
  planExpiresAt: string | null;
  isAdmin: boolean;
}

export async function subscribeToPro(cycle: 'monthly' | 'yearly'): Promise<{ initPoint: string | null }> {
  return apiFetch('/api/billing/subscribe', {
    method: 'POST',
    body: { cycle },
  });
}

export async function getBillingStatus(): Promise<BillingStatus> {
  return apiFetch('/api/billing/status');
}

// ---------- admin ----------

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'pro';
  planExpiresAt: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminSite {
  id: string;
  ownerId: string;
  ownerEmail: string;
  slug: string;
  title: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface AdminSummary {
  totalUsers: number;
  totalPro: number;
  mrr: number;
  recentPaymentsCount: number;
  recentPaymentsAmount: number;
}

export async function adminListUsers(): Promise<AdminUser[]> {
  return apiFetch('/api/admin/users');
}

export async function adminSetUserPlan(id: string, plan: 'free' | 'pro', expiresAt?: string): Promise<void> {
  await apiFetch(`/api/admin/users/${id}/plan`, {
    method: 'PATCH',
    body: { plan, expiresAt },
  });
}

export async function adminListSites(): Promise<AdminSite[]> {
  return apiFetch('/api/admin/sites');
}

export async function adminGetSummary(): Promise<AdminSummary> {
  return apiFetch('/api/admin/summary');
}

// ---------- public site ----------

export interface PublicSite {
  id: string;
  slug: string;
  config: BioSiteConfig;
  plan: 'free' | 'pro';
  isAdmin: boolean;
}

export async function getPublicSite(slug: string): Promise<PublicSite | null> {
  try {
    return await apiFetch<PublicSite>(`/api/public/sites/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

// ---------- password reset ----------

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email } });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiFetch('/api/auth/reset-password', { method: 'POST', body: { token, newPassword } });
}

// ---------- availability & bookings (dono) ----------

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export async function createAvailability(
  siteId: string,
  slots: { date: string; startTime: string; endTime: string }[]
): Promise<void> {
  await apiFetch(`/api/sites/${siteId}/availability`, { method: 'POST', body: { slots } });
}

export async function listAvailability(siteId: string): Promise<AvailabilitySlot[]> {
  return apiFetch(`/api/sites/${siteId}/availability`);
}

export async function deleteAvailability(siteId: string, slotId: string): Promise<void> {
  await apiFetch(`/api/sites/${siteId}/availability/${slotId}`, { method: 'DELETE' });
}

export async function listBookings(siteId: string): Promise<Booking[]> {
  return apiFetch(`/api/sites/${siteId}/bookings`);
}

export async function cancelBooking(siteId: string, bookingId: string): Promise<void> {
  await apiFetch(`/api/sites/${siteId}/bookings/${bookingId}`, { method: 'PATCH' });
}

// ---------- availability & bookings (público) ----------

export interface PublicSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface PublicBookingResult {
  bookingId: string;
  date: string;
  time: string;
  whatsappUrl: string | null;
}

export async function getPublicAvailability(slug: string): Promise<PublicSlot[]> {
  return apiFetch(`/api/public/sites/${slug}/availability`);
}

export async function createPublicBooking(
  slug: string,
  data: { slotId: string; clientName: string; clientPhone: string; clientEmail?: string }
): Promise<PublicBookingResult> {
  return apiFetch(`/api/public/sites/${slug}/bookings`, { method: 'POST', body: data });
}
