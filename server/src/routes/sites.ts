import { Router } from 'express';
import * as db from '../db';
import { ApiError, asyncHandler, serializeSite } from '../utils';
import { requireAuth } from '../middleware/auth';

const router = Router();

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'ID inválido.');
  }
  return id;
}

// GET /api/sites
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db.listSitesByOwner(req.user!.id);
    res.json(rows.map(serializeSite));
  })
);

// GET /api/sites/:id
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const row = await db.findSiteById(id);
    if (!row || row.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    res.json(serializeSite(row));
  })
);

// POST /api/sites
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, templateId, slug, config } = req.body ?? {};
    if (config == null || typeof config !== 'object') {
      throw new ApiError(400, 'Config do site é obrigatória.');
    }

    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');
    if (!user.is_admin && (user.plan ?? 'free') === 'free') {
      const siteCount = await db.countSitesByOwner(user.id);
      if (siteCount >= 1) {
        throw new ApiError(403, 'Limite do plano grátis atingido. Assine o plano Pro para criar mais sites.');
      }
    }

    const row = await db.createSite(user.id, { title, templateId, slug, config });
    res.status(201).json(serializeSite(row));
  })
);

// PUT /api/sites/:id
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    const { config, title } = req.body ?? {};
    if (config !== undefined && (config === null || typeof config !== 'object')) {
      throw new ApiError(400, 'Config inválida.');
    }
    await db.updateSiteConfig(id, { config, title });
    const updated = await db.findSiteById(id);
    res.json(serializeSite(updated!));
  })
);

// DELETE /api/sites/:id
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    await db.deleteSiteById(id);
    res.json({ ok: true });
  })
);

// POST /api/sites/:id/analytics — público (eventos de visitantes)
router.post(
  '/:id/analytics',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing) throw new ApiError(404, 'Site não encontrado.');
    const { eventType, blockId } = req.body ?? {};
    if (eventType !== 'view' && eventType !== 'click') {
      throw new ApiError(400, 'eventType deve ser "view" ou "click".');
    }
    await db.insertAnalyticsEvent(id, eventType, blockId ?? null);
    res.status(201).json({ ok: true });
  })
);

// GET /api/sites/:id/analytics/summary — resumo agregado (apenas dono do site)
router.get(
  '/:id/analytics/summary',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    res.json(await db.getAnalyticsSummary(id));
  })
);

// DELETE /api/sites/:id/analytics — zera os contadores (apenas dono do site)
router.delete(
  '/:id/analytics',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    await db.clearAnalytics(id);
    res.json({ ok: true });
  })
);

// ---------- availability (dono) ----------

// POST /api/sites/:id/availability — cadastra um ou mais horários
router.post(
  '/:id/availability',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    const { slots } = req.body ?? {};
    if (!Array.isArray(slots) || slots.length === 0) {
      throw new ApiError(400, 'Envie um array de slots (date, startTime, endTime).');
    }
    const normalized = slots.map((s: any) => ({
      date: String(s.date),
      startTime: String(s.startTime),
      endTime: String(s.endTime),
    }));
    await db.createAvailabilitySlots(id, normalized);
    res.status(201).json({ created: normalized.length });
  })
);

// GET /api/sites/:id/availability — lista todos os horários
router.get(
  '/:id/availability',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    const slots = await db.listAvailabilityBySite(id);
    res.json(
      slots.map((s) => ({
        id: String(s.id),
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        isBooked: Boolean(s.is_booked),
      }))
    );
  })
);

// DELETE /api/sites/:id/availability/:slotId — remove um horário não reservado
router.delete(
  '/:id/availability/:slotId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const slotId = parseId(req.params.slotId);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    const slot = await db.findAvailabilitySlot(slotId);
    if (!slot || slot.site_id !== id) {
      throw new ApiError(404, 'Horário não encontrado.');
    }
    if (slot.is_booked) {
      throw new ApiError(409, 'Não é possível remover um horário já reservado.');
    }
    await db.deleteAvailabilitySlot(slotId);
    res.json({ ok: true });
  })
);

// GET /api/sites/:id/bookings — lista agendamentos
router.get(
  '/:id/bookings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    const bookings = await db.listBookingsBySite(id);
    res.json(
      bookings.map((b) => ({
        id: String(b.id),
        clientName: b.client_name,
        clientPhone: b.client_phone,
        clientEmail: b.client_email ?? null,
        status: b.status,
        date: b.date,
        startTime: b.start_time,
        endTime: b.end_time,
        createdAt: b.created_at,
      }))
    );
  })
);

// PATCH /api/sites/:id/bookings/:bookingId — cancela e libera o slot
router.patch(
  '/:id/bookings/:bookingId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const bookingId = parseId(req.params.bookingId);
    const existing = await db.findSiteById(id);
    if (!existing || existing.owner_id !== req.user!.id) {
      throw new ApiError(404, 'Site não encontrado.');
    }
    await db.cancelBooking(bookingId);
    res.json({ ok: true });
  })
);

export default router;
