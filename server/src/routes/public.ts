import { Router } from 'express';
import { Resend } from 'resend';
import { config } from '../config';
import * as db from '../db';
import { ApiError, asyncHandler, serializeSite } from '../utils';

const router = Router();
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

function formatDate(d: string): string {
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
}

function formatTime(t: string): string {
  return String(t).slice(0, 5);
}

function extractWhatsappNumber(configValue: any): string | null {
  const wa = configValue?.socialLinks?.find((s: any) => s.platform === 'whatsapp' && s.enabled);
  if (wa?.url) {
    const m = String(wa.url).match(/(\d{10,15})/);
    if (m) return m[1];
  }
  const block = configValue?.blocks?.find((b: any) => b.type === 'whatsapp');
  if (block?.phoneNumber) {
    const m = String(block.phoneNumber).match(/(\d{10,15})/);
    if (m) return m[1];
  }
  return null;
}

// GET /api/public/sites/:slug — retorna o config do site publicado (sem autenticação).
router.get(
  '/sites/:slug',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug ?? '');
    const result = await db.findPublishedSiteBySlug(slug);
    if (!result) throw new ApiError(404, 'Site não encontrado.');

    const site = serializeSite(result.site);
    res.json({ id: site.id, slug: site.slug, config: site.config, plan: result.plan, isAdmin: result.isAdmin });
  })
);

// GET /api/public/sites/:slug/availability — horários disponíveis para o visitante.
router.get(
  '/sites/:slug/availability',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug ?? '');
    const result = await db.findPublishedSiteBySlug(slug);
    if (!result) throw new ApiError(404, 'Site não encontrado.');

    const siteId = Number(result.site.id);
    const slots = await db.listAvailabilityBySite(siteId);
    const available = slots.filter((s) => !s.is_booked);
    res.json(
      available.map((s) => ({
        id: String(s.id),
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
      }))
    );
  })
);

// POST /api/public/sites/:slug/bookings — reserva um horário (transação atômica).
router.post(
  '/sites/:slug/bookings',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug ?? '');
    const { slotId, clientName, clientPhone, clientEmail } = req.body ?? {};
    if (!slotId || !clientName || !clientPhone) {
      throw new ApiError(400, 'slotId, clientName e clientPhone são obrigatórios.');
    }

    const result = await db.findPublishedSiteBySlug(slug);
    if (!result) throw new ApiError(404, 'Site não encontrado.');

    const siteId = Number(result.site.id);
    const site = serializeSite(result.site);
    const siteConfig = site.config as any;
    const siteName = siteConfig?.profile?.name || site.title || 'Exiba';

    const booked = await db.bookSlot(Number(slotId), siteId, {
      clientName: String(clientName),
      clientPhone: String(clientPhone),
      clientEmail: clientEmail ? String(clientEmail) : undefined,
    });

    const dateStr = formatDate(booked.date);
    const timeStr = formatTime(booked.startTime);

    // E-mail de confirmação ao cliente (se informado e Resend configurado).
    if (clientEmail && resend) {
      try {
        await resend.emails.send({
          from: config.resendFrom,
          to: [String(clientEmail)],
          subject: `Agendamento confirmado — ${siteName}`,
          html:
            `<p>Olá, ${clientName}!</p>` +
            `<p>Seu horário foi confirmado com sucesso:</p>` +
            `<p><strong>${dateStr} às ${timeStr}</strong></p>` +
            `<p>${siteName}</p>`,
        });
      } catch (err) {
        console.error('Falha ao enviar e-mail ao cliente:', err);
      }
    }

    // E-mail de notificação ao dono.
    if (resend) {
      try {
        await resend.emails.send({
          from: config.resendFrom,
          to: [result.ownerEmail],
          subject: `Novo agendamento — ${siteName}`,
          html:
            `<p>Novo agendamento recebido:</p>` +
            `<p>Cliente: <strong>${clientName}</strong></p>` +
            `<p>Telefone: ${clientPhone}</p>` +
            `<p>Data/hora: <strong>${dateStr} às ${timeStr}</strong></p>`,
        });
      } catch (err) {
        console.error('Falha ao notificar o dono:', err);
      }
    }

    // URL do WhatsApp pré-preenchida para o cliente confirmar.
    const whatsappNumber = extractWhatsappNumber(siteConfig);
    const waMessage = `Olá! Confirmei meu horário para ${dateStr} às ${timeStr}.`;
    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`
      : null;

    res.status(201).json({
      bookingId: String(booked.bookingId),
      date: dateStr,
      time: timeStr,
      whatsappUrl,
    });
  })
);

export default router;
