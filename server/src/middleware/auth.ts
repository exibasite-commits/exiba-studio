import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError, asyncHandler } from '../utils';
import * as db from '../db';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return next(new ApiError(401, 'Não autenticado.'));
  }
  try {
    const payload = jwt.verify(String(token), config.jwtSecret) as { sub: string; email: string };
    req.user = { id: Number(payload.sub), email: payload.email };
    return next();
  } catch {
    return next(new ApiError(401, 'Sessão inválida ou expirada.'));
  }
}

// Exige usuário autenticado E administrador (users.is_admin = true).
export const requireAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, 'Não autenticado.');

  let payload: { sub: string; email: string };
  try {
    payload = jwt.verify(String(token), config.jwtSecret) as { sub: string; email: string };
  } catch {
    throw new ApiError(401, 'Sessão inválida ou expirada.');
  }

  const id = Number(payload.sub);
  const user = await db.findUserById(id);
  if (!user) throw new ApiError(401, 'Usuário não encontrado.');
  if (!user.is_admin) throw new ApiError(403, 'Acesso negado. Apenas administradores.');

  req.user = { id, email: payload.email };
  next();
});
