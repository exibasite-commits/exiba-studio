import { Router } from 'express';
import * as db from '../db';
import { ApiError, asyncHandler } from '../utils';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/users — lista todos os usuários
router.get(
  '/users',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await db.listAllUsers();
    res.json(
      users.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name ?? null,
        plan: u.plan ?? 'free',
        planExpiresAt: u.plan_expires_at ?? null,
        isAdmin: Boolean(u.is_admin),
        createdAt: u.created_at,
      }))
    );
  })
);

// PATCH /api/admin/users/:id/plan — altera o plano de um usuário
router.patch(
  '/users/:id/plan',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'ID inválido.');

    const { plan, expiresAt } = req.body ?? {};
    if (plan !== 'free' && plan !== 'pro') {
      throw new ApiError(400, "plan deve ser 'free' ou 'pro'.");
    }

    const user = await db.findUserById(id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    let expires: Date | null = null;
    if (plan === 'pro') {
      expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    await db.setUserPlan(id, plan, expires);

    const updated = await db.findUserById(id);
    res.json({
      id: String(updated!.id),
      plan: updated!.plan,
      planExpiresAt: updated!.plan_expires_at ?? null,
      isAdmin: Boolean(updated!.is_admin),
    });
  })
);

// GET /api/admin/sites — lista todos os sites (apenas metadados)
router.get(
  '/sites',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const sites = await db.listAllSites();
    res.json(
      sites.map((s) => ({
        id: String(s.id),
        ownerId: String(s.owner_id),
        ownerEmail: s.owner_email,
        slug: s.slug,
        title: s.title ?? null,
        isPublished: Boolean(s.is_published),
        createdAt: s.created_at,
      }))
    );
  })
);

// GET /api/admin/summary — números gerais da plataforma
router.get(
  '/summary',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    res.json(await db.getAdminSummary());
  })
);

export default router;
