import { randomBytes } from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function slugify(input: string): string {
  const slug =
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'meu-site';
  return slug;
}

export function randomHex(length = 4): string {
  return randomBytes(length).toString('hex');
}

export interface UserRow {
  id: number;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  name: string | null;
  plan: 'free' | 'pro';
  plan_expires_at: Date | null;
  mp_subscription_id: string | null;
  is_admin: number | boolean;
  created_at: Date;
}

export interface SiteRow {
  id: number;
  owner_id: number;
  slug: string;
  title: string | null;
  template_id: string | null;
  config: unknown;
  is_published: number | boolean;
  created_at: Date;
  updated_at: Date;
}

function parseConfig(value: unknown): unknown {
  if (value == null) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

export function serializeUser(row: UserRow) {
  return {
    uid: String(row.id),
    email: row.email,
    displayName: row.name ?? null,
    photoURL: null,
    plan: row.plan ?? 'free',
    planExpiresAt: row.plan_expires_at ?? null,
    isAdmin: Boolean(row.is_admin),
  };
}

export function serializeSite(row: SiteRow) {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    slug: row.slug,
    title: row.title ?? null,
    templateId: row.template_id ?? null,
    config: parseConfig(row.config),
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
