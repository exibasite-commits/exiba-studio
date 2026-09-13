import { Router } from 'express';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';
import { config } from '../config';
import * as db from '../db';
import { ApiError, asyncHandler, serializeSite, serializeUser } from '../utils';
import { requireAuth } from '../middleware/auth';

const router = Router();
const googleClient = new OAuth2Client(config.googleClientId);
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user: { id: number; email: string }): string {
  return jwt.sign({ sub: String(user.id), email: user.email }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

function setSessionCookie(res: import('express').Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name, initialSite } = req.body ?? {};
    if (!email || !EMAIL_RE.test(String(email))) {
      throw new ApiError(400, 'Formato de e-mail inválido.');
    }
    if (!password || String(password).length < 6) {
      throw new ApiError(400, 'A senha deve ter no mínimo 6 caracteres.');
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await db.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new ApiError(409, 'Este e-mail já está cadastrado. Faça login ou use outro.');
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const userId = await db.createUser({
      email: normalizedEmail,
      passwordHash,
      name: name || null,
    });

    const userRow = await db.findUserById(userId);
    if (!userRow) throw new ApiError(500, 'Erro ao criar usuário.');

    let site = null;
    if (initialSite) {
      const siteRow = await db.createSite(userId, {
        title: initialSite.title ?? null,
        templateId: initialSite.templateId ?? null,
        slug: initialSite.slug ?? null,
        config: initialSite.config ?? {},
      });
      site = serializeSite(siteRow);
    }

    const token = signToken({ id: userId, email: normalizedEmail });
    setSessionCookie(res, token);
    res.status(201).json({ user: serializeUser(userRow), site });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      throw new ApiError(400, 'Informe e-mail e senha.');
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const userRow = await db.findUserByEmail(normalizedEmail);
    if (!userRow || !userRow.password_hash) {
      throw new ApiError(401, 'E-mail ou senha incorretos.');
    }
    const ok = await bcrypt.compare(String(password), userRow.password_hash);
    if (!ok) {
      throw new ApiError(401, 'E-mail ou senha incorretos.');
    }

    const token = signToken({ id: userRow.id, email: userRow.email });
    setSessionCookie(res, token);
    res.json({ user: serializeUser(userRow) });
  })
);

// POST /api/auth/google
router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { credential } = req.body ?? {};
    if (!credential) {
      throw new ApiError(400, 'Credencial do Google ausente.');
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: String(credential),
        audience: config.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new ApiError(401, 'Não foi possível validar o login do Google.');
    }

    const googleId = payload?.sub;
    const email = (payload?.email ?? '').toLowerCase();
    if (!googleId || !email) {
      throw new ApiError(400, 'Conta Google sem dados suficientes.');
    }

    let userRow = await db.findUserByGoogleId(googleId);
    if (!userRow) {
      const byEmail = await db.findUserByEmail(email);
      if (byEmail) {
        await db.linkGoogleId(byEmail.id, googleId);
        userRow = byEmail;
      } else {
        const id = await db.createUser({ email, googleId, name: payload?.name ?? null });
        userRow = await db.findUserById(id);
      }
    }

    if (!userRow) throw new ApiError(500, 'Erro ao criar/atualizar usuário Google.');
    const token = signToken({ id: userRow.id, email: userRow.email });
    setSessionCookie(res, token);
    res.json({ user: serializeUser(userRow) });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userRow = await db.findUserById(req.user!.id);
    if (!userRow) throw new ApiError(404, 'Usuário não encontrado.');
    res.json({ user: serializeUser(userRow) });
  })
);

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ ok: true });
});

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body ?? {};
    if (!email) throw new ApiError(400, 'Informe o e-mail.');

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await db.findUserByEmail(normalizedEmail);

    // Resposta genérica (não revela se o e-mail existe).
    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await db.createPasswordResetToken(user.id, token, expiresAt);

      const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
      if (resend) {
        try {
          await resend.emails.send({
            from: config.resendFrom,
            to: [user.email],
            subject: 'Redefinição de senha — Exiba',
            html:
              '<p>Olá!</p>' +
              '<p>Você solicitou a redefinição de senha no Exiba.</p>' +
              `<p><a href="${resetUrl}">Clique aqui para redefinir sua senha</a></p>` +
              '<p>Este link é válido por 1 hora.</p>',
          });
        } catch (err) {
          console.error('Falha ao enviar e-mail de reset:', err);
        }
      } else {
        console.log('[Auth Dev] Link de redefinição de senha gerado:', resetUrl);
      }
    }

    res.json({ ok: true });
  })
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body ?? {};
    if (!token || !newPassword) throw new ApiError(400, 'Token e nova senha são obrigatórios.');
    if (String(newPassword).length < 6) throw new ApiError(400, 'A senha deve ter no mínimo 6 caracteres.');

    const resetToken = await db.findPasswordResetToken(String(token));
    if (!resetToken || resetToken.used || new Date(resetToken.expires_at).getTime() <= Date.now()) {
      throw new ApiError(400, 'Token inválido ou expirado.');
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await db.updateUserPassword(resetToken.user_id, passwordHash);
    await db.markPasswordResetTokenUsed(resetToken.id);

    res.json({ ok: true });
  })
);

export default router;
