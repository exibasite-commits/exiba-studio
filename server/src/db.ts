import mysql from 'mysql2/promise';
import type { ResultSetHeader } from 'mysql2/promise';
import { config } from './config';
import { ApiError, randomHex, SiteRow, slugify, UserRow } from './utils';

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// ---------- users ----------

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function findUserByGoogleId(googleId: string): Promise<UserRow | null> {
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE google_id = ?', [googleId]);
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const rows = await query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  name?: string | null;
}): Promise<number> {
  const result = await query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash, google_id, name) VALUES (?, ?, ?, ?)',
    [input.email, input.passwordHash ?? null, input.googleId ?? null, input.name ?? null]
  );
  return result.insertId;
}

export async function linkGoogleId(id: number, googleId: string): Promise<void> {
  await query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, id]);
}

// ---------- sites ----------

export async function createSite(
  ownerId: number,
  input: { title?: string | null; templateId?: string | null; slug?: string | null; config: unknown }
): Promise<SiteRow> {
  const title = input.title ?? null;
  const templateId = input.templateId ?? null;
  const configJson = input.config == null ? {} : input.config;
  const base = input.slug || title || 'meu-site';

  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 && input.slug ? slugify(input.slug) : `${slugify(base)}-${randomHex(4)}`;
    try {
      const result = await query<ResultSetHeader>(
        'INSERT INTO sites (owner_id, slug, title, template_id, config, is_published) VALUES (?, ?, ?, ?, ?, ?)',
        [ownerId, slug, title, templateId, JSON.stringify(configJson), true]
      );
      const row = await findSiteById(result.insertId);
      if (!row) throw new Error('Falha ao ler o site recém-criado.');
      return row;
    } catch (err: any) {
      lastError = err;
      // Slug duplicado → tenta de novo com outro sufixo.
      if (err?.code === 'ER_DUP_ENTRY') continue;
      throw err;
    }
  }
  throw lastError;
}

export async function listSitesByOwner(ownerId: number): Promise<SiteRow[]> {
  return query<SiteRow[]>('SELECT * FROM sites WHERE owner_id = ? ORDER BY created_at DESC', [ownerId]);
}

export async function findSiteById(id: number): Promise<SiteRow | null> {
  const rows = await query<SiteRow[]>('SELECT * FROM sites WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function updateSiteConfig(
  id: number,
  input: { config?: unknown; title?: string | null }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  if (input.config !== undefined) {
    fields.push('config = ?');
    values.push(JSON.stringify(input.config));
  }
  if (input.title !== undefined) {
    fields.push('title = ?');
    values.push(input.title ?? null);
  }
  if (fields.length === 0) return;
  values.push(id);
  await query(`UPDATE sites SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteSiteById(id: number): Promise<void> {
  await query('DELETE FROM sites WHERE id = ?', [id]);
}

// ---------- analytics ----------

export async function insertAnalyticsEvent(
  siteId: number,
  eventType: 'view' | 'click',
  blockId?: string | null
): Promise<void> {
  await query('INSERT INTO analytics_events (site_id, event_type, block_id) VALUES (?, ?, ?)', [
    siteId,
    eventType,
    blockId ?? null,
  ]);
}

interface AnalyticsCountRow {
  event_type: 'view' | 'click';
  block_id: string | null;
  cnt: unknown;
}

export async function getAnalyticsSummary(siteId: number): Promise<{
  totalViews: number;
  totalClicks: number;
  clicksByBlock: Record<string, number>;
}> {
  const rows = await query<AnalyticsCountRow[]>(
    'SELECT event_type, block_id, COUNT(*) AS cnt FROM analytics_events WHERE site_id = ? GROUP BY event_type, block_id',
    [siteId]
  );

  let totalViews = 0;
  let totalClicks = 0;
  const clicksByBlock: Record<string, number> = {};

  for (const row of rows) {
    const n = Number(row.cnt) || 0;
    if (row.event_type === 'view') {
      totalViews += n;
    } else if (row.event_type === 'click') {
      totalClicks += n;
      if (row.block_id) {
        clicksByBlock[row.block_id] = (clicksByBlock[row.block_id] || 0) + n;
      }
    }
  }

  return { totalViews, totalClicks, clicksByBlock };
}

export async function clearAnalytics(siteId: number): Promise<void> {
  await query('DELETE FROM analytics_events WHERE site_id = ?', [siteId]);
}

// ---------- plans & payments ----------

export async function setUserPlan(userId: number, plan: 'free' | 'pro', expiresAt: Date | null): Promise<void> {
  await query('UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?', [plan, expiresAt, userId]);
}

export async function setUserSubscriptionId(userId: number, mpSubscriptionId: string | null): Promise<void> {
  await query('UPDATE users SET mp_subscription_id = ? WHERE id = ?', [mpSubscriptionId, userId]);
}

// Rebaixa assinantes pro com plan_expires_at no passado para o plano free.
export async function downgradeExpiredSubscriptions(): Promise<number> {
  const rows = await query<{ id: number }[]>(
    "SELECT id FROM users WHERE plan = 'pro' AND plan_expires_at IS NOT NULL AND plan_expires_at < NOW()"
  );
  for (const row of rows) {
    await setUserPlan(row.id, 'free', null);
    await insertPayment({ userId: row.id, mpPaymentId: '', amount: 0, status: 'expired' });
  }
  return rows.length;
}

export async function countSitesByOwner(ownerId: number): Promise<number> {
  const rows = await query<{ cnt: unknown }[]>('SELECT COUNT(*) AS cnt FROM sites WHERE owner_id = ?', [ownerId]);
  return Number(rows[0]?.cnt) || 0;
}

export async function insertPayment(input: {
  userId: number;
  mpPaymentId: string;
  amount: number;
  status: string;
}): Promise<void> {
  await query('INSERT INTO payments (user_id, mp_payment_id, amount, status) VALUES (?, ?, ?, ?)', [
    input.userId,
    input.mpPaymentId,
    input.amount,
    input.status,
  ]);
}

// ---------- admin ----------

export async function listAllUsers(): Promise<UserRow[]> {
  return query<UserRow[]>('SELECT * FROM users ORDER BY created_at DESC');
}

export async function listAllSites(): Promise<any[]> {
  return query<any[]>(
    `SELECT s.id, s.owner_id, u.email AS owner_email, s.slug, s.title, s.is_published, s.created_at
     FROM sites s
     JOIN users u ON u.id = s.owner_id
     ORDER BY s.created_at DESC`
  );
}

export async function getAdminSummary(): Promise<{
  totalUsers: number;
  totalPro: number;
  mrr: number;
  recentPaymentsCount: number;
  recentPaymentsAmount: number;
}> {
  const [users] = await query<any[]>(
    "SELECT COUNT(*) AS total, COALESCE(SUM(plan = 'pro'), 0) AS pro FROM users"
  );
  const totalUsers = Number(users?.total) || 0;
  const totalPro = Number(users?.pro) || 0;

  const [pay] = await query<any[]>(
    'SELECT COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total FROM payments WHERE created_at >= NOW() - INTERVAL 30 DAY'
  );

  return {
    totalUsers,
    totalPro,
    mrr: totalPro * 35,
    recentPaymentsCount: Number(pay?.cnt) || 0,
    recentPaymentsAmount: Number(pay?.total) || 0,
  };
}

// ---------- public site ----------

export async function findPublishedSiteBySlug(
  slug: string
): Promise<{ site: SiteRow; plan: 'free' | 'pro'; isAdmin: boolean; ownerEmail: string } | null> {
  const rows = await query<any[]>(
    `SELECT s.*, u.plan AS owner_plan, u.is_admin AS owner_is_admin, u.email AS owner_email
     FROM sites s
     JOIN users u ON u.id = s.owner_id
     WHERE s.slug = ? AND s.is_published = 1`,
    [slug]
  );
  const row = rows[0];
  if (!row) return null;
  const { owner_plan, owner_is_admin, owner_email, ...siteRow } = row;
  return {
    site: siteRow as SiteRow,
    plan: (owner_plan ?? 'free') as 'free' | 'pro',
    isAdmin: Boolean(owner_is_admin),
    ownerEmail: owner_email,
  };
}

// ---------- availability & bookings ----------

export interface AvailabilitySlotRow {
  id: number;
  site_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: number | boolean;
  created_at: Date;
}

export async function createAvailabilitySlots(
  siteId: number,
  slots: { date: string; startTime: string; endTime: string }[]
): Promise<void> {
  for (const s of slots) {
    await query(
      'INSERT INTO availability_slots (site_id, date, start_time, end_time) VALUES (?, ?, ?, ?)',
      [siteId, s.date, s.startTime, s.endTime]
    );
  }
}

export async function listAvailabilityBySite(siteId: number): Promise<AvailabilitySlotRow[]> {
  return query<AvailabilitySlotRow[]>(
    'SELECT * FROM availability_slots WHERE site_id = ? ORDER BY date, start_time',
    [siteId]
  );
}

export async function findAvailabilitySlot(slotId: number): Promise<AvailabilitySlotRow | null> {
  const rows = await query<AvailabilitySlotRow[]>('SELECT * FROM availability_slots WHERE id = ?', [slotId]);
  return rows[0] ?? null;
}

export async function deleteAvailabilitySlot(slotId: number): Promise<void> {
  await query('DELETE FROM availability_slots WHERE id = ?', [slotId]);
}

export async function listBookingsBySite(siteId: number): Promise<any[]> {
  return query<any[]>(
    `SELECT b.id, b.client_name, b.client_phone, b.client_email, b.status, b.created_at,
            a.date, a.start_time, a.end_time
     FROM bookings b
     JOIN availability_slots a ON a.id = b.slot_id
     WHERE b.site_id = ?
     ORDER BY b.created_at DESC`,
    [siteId]
  );
}

export async function cancelBooking(bookingId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute<any[]>('SELECT slot_id, status FROM bookings WHERE id = ?', [bookingId]);
    const booking = rows[0];
    if (!booking) throw new ApiError(404, 'Agendamento não encontrado.');
    await conn.execute("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);
    if (booking.status === 'confirmed') {
      await conn.execute('UPDATE availability_slots SET is_booked = FALSE WHERE id = ?', [booking.slot_id]);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Reserva um slot de forma atômica (previne corrida entre dois clientes).
export async function bookSlot(
  slotId: number,
  siteId: number,
  client: { clientName: string; clientPhone: string; clientEmail?: string }
): Promise<{ bookingId: number; date: string; startTime: string }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute<any[]>(
      'SELECT id, site_id, date, start_time, is_booked FROM availability_slots WHERE id = ? FOR UPDATE',
      [slotId]
    );
    const slot = rows[0];
    if (!slot || Number(slot.site_id) !== siteId) {
      await conn.rollback();
      throw new ApiError(404, 'Horário não encontrado.');
    }
    if (slot.is_booked) {
      await conn.rollback();
      throw new ApiError(409, 'Esse horário acabou de ser reservado, escolha outro.');
    }
    await conn.execute('UPDATE availability_slots SET is_booked = TRUE WHERE id = ?', [slotId]);
    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO bookings (slot_id, site_id, client_name, client_phone, client_email) VALUES (?, ?, ?, ?, ?)',
      [slotId, siteId, client.clientName, client.clientPhone, client.clientEmail ?? null]
    );
    await conn.commit();
    return { bookingId: result.insertId, date: slot.date, startTime: slot.start_time };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// ---------- password reset ----------

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
  await query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
    userId,
    token,
    expiresAt,
  ]);
}

export async function findPasswordResetToken(token: string): Promise<{
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: number | boolean;
} | null> {
  const rows = await query<any[]>('SELECT * FROM password_reset_tokens WHERE token = ?', [token]);
  return rows[0] ?? null;
}

export async function markPasswordResetTokenUsed(id: number): Promise<void> {
  await query('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?', [id]);
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}
