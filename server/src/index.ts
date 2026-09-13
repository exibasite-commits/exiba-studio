import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import authRoutes from './routes/auth';
import siteRoutes from './routes/sites';
import billingRoutes from './routes/billing';
import adminRoutes from './routes/admin';
import internalRoutes from './routes/internal';
import publicRoutes from './routes/public';
import uploadRoutes from './routes/upload';
import aiRoutes from './routes/ai';
import { ApiError } from './utils';
import * as db from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

const origins = config.corsOrigin
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));

app.use('/uploads', express.static(uploadsDir));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);


// 404 para rotas desconhecidas
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Tratamento central de erros
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ApiError || (err && typeof err.status === 'number')) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
);


app.listen(config.port, () => {
  console.log(`API rodando em http://localhost:${config.port}`);
});

// Job interno: rebaixa assinaturas pro expiradas (roda a cada 24h).
const EXPIRE_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(async () => {
  try {
    const count = await db.downgradeExpiredSubscriptions();
    if (count > 0) console.log(`[billing] ${count} assinatura(s) expirada(s) rebaixada(s) para free.`);
  } catch (err) {
    console.error('[billing] erro ao rebaixar assinaturas expiradas:', err);
  }
}, EXPIRE_INTERVAL_MS);
