import { Router, Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '../config';
import * as db from '../db';
import { ApiError, asyncHandler, randomHex } from '../utils';
import { requireAuth } from '../middleware/auth';

const router = Router();

const MP_API = 'https://api.mercadopago.com';

const PLAN_CONFIG: Record<
  'monthly' | 'yearly',
  { amount: number; frequency: number; frequency_type: string; days: number }
> = {
  monthly: { amount: 35, frequency: 1, frequency_type: 'months', days: 30 },
  yearly: { amount: 315, frequency: 12, frequency_type: 'months', days: 365 },
};

async function mpRequest(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${MP_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.mpAccessToken}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Mercado Pago error:', res.status, JSON.stringify(data));
    throw new ApiError(502, 'Falha ao comunicar com o Mercado Pago.');
  }
  return data;
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validateMercadoPagoWebhook(req: Request): void {
  if (!config.mpWebhookSecret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('webhook sem validação - ambiente de desenvolvimento');
      return;
    }

    throw new ApiError(500, 'Segredo do webhook do Mercado Pago não configurado.');
  }

  const signature = getHeaderValue(req.headers['x-signature']);
  const requestId = getHeaderValue(req.headers['x-request-id']);
  const resourceId = req.body?.data?.id;
  if (!signature || !requestId || resourceId == null) {
    throw new ApiError(401, 'Assinatura de webhook inválida.');
  }

  const signatureParts = new Map<string, string>();
  for (const part of signature.split(',')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex !== -1) {
      signatureParts.set(part.slice(0, separatorIndex).trim(), part.slice(separatorIndex + 1).trim());
    }
  }

  const timestamp = signatureParts.get('ts');
  const receivedHash = signatureParts.get('v1');
  if (!timestamp || !receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
    throw new ApiError(401, 'Assinatura de webhook inválida.');
  }

  const id = String(resourceId);
  const normalizedId = /^[a-z0-9]+$/i.test(id) ? id.toLowerCase() : id;
  const template = `id:${normalizedId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac('sha256', config.mpWebhookSecret).update(template).digest();
  const actualHash = Buffer.from(receivedHash, 'hex');

  if (actualHash.length !== expectedHash.length || !timingSafeEqual(expectedHash, actualHash)) {
    throw new ApiError(401, 'Assinatura de webhook inválida.');
  }
}

// POST /api/billing/subscribe — cria assinatura no cartão (PreApproval)
router.post(
  '/subscribe',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cycle = (req.body?.cycle ?? req.body?.billingCycle) === 'yearly' ? 'yearly' : 'monthly';
    const planCfg = PLAN_CONFIG[cycle];

    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    if (!config.mpAccessToken || config.mpAccessToken.trim().length < 10) {
      return res.json({
        initPoint: null,
        preapprovalId: 'sim_sub_' + Date.now(),
        isSimulated: true,
      });
    }

    const data = await mpRequest('/preapproval', {
      method: 'POST',
      body: JSON.stringify({
        reason: `Assinatura Exiba Pro (${cycle === 'yearly' ? 'anual' : 'mensal'})`,
        external_reference: String(user.id),
        auto_recurring: {
          frequency: planCfg.frequency,
          frequency_type: planCfg.frequency_type,
          transaction_amount: planCfg.amount,
          currency_id: 'BRL',
        },
        back_url: config.frontendUrl,
        metadata: { user_id: String(user.id), billing_cycle: cycle },
      }),
    });

    if (data?.id) {
      await db.setUserSubscriptionId(user.id, String(data.id));
    }

    res.json({
      initPoint: data?.init_point ?? null,
      preapprovalId: data?.id ?? null,
      isSimulated: false,
    });
  })
);

// POST /api/billing/preference — cria preferência de checkout (cartão, boleto ou PIX)
router.post(
  '/preference',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cycle = (req.body?.cycle ?? req.body?.billingCycle) === 'yearly' ? 'yearly' : 'monthly';
    const planCfg = PLAN_CONFIG[cycle];
    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    if (!config.mpAccessToken || config.mpAccessToken.trim().length < 10) {
      return res.json({
        initPoint: null,
        preferenceId: 'sim_pref_' + Date.now(),
        isSimulated: true,
      });
    }

    const data = await mpRequest('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            id: `plan_pro_${cycle}`,
            title: `Exiba Studio Pro (${cycle === 'yearly' ? 'Plano Anual' : 'Plano Mensal'})`,
            description: 'Acesso completo a recursos Pro, remoção de marca dágua e domínio próprio.',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: planCfg.amount,
          },
        ],
        payer: {
          email: user.email,
          name: user.name || 'Assinante Exiba',
        },
        back_urls: {
          success: `${config.frontendUrl}/?status=success&billing=approved`,
          pending: `${config.frontendUrl}/?status=pending`,
          failure: `${config.frontendUrl}/?status=failure`,
        },
        auto_return: 'approved',
        external_reference: String(user.id),
        metadata: { user_id: String(user.id), billing_cycle: cycle },
      }),
    });

    res.json({
      initPoint: data?.init_point || data?.sandbox_init_point || null,
      preferenceId: data?.id || null,
      isSimulated: false,
    });
  })
);

// POST /api/billing/pix — gera cobrança PIX instantânea com QR Code e Copia e Cola
router.post(
  '/pix',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cycle = (req.body?.cycle ?? req.body?.billingCycle) === 'yearly' ? 'yearly' : 'monthly';
    const planCfg = PLAN_CONFIG[cycle];
    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    // Se o token do Mercado Pago estiver configurado, tenta chamar a API real do Mercado Pago
    if (config.mpAccessToken && config.mpAccessToken.trim().length > 10) {
      try {
        const idempotencyKey = `pix_${user.id}_${Date.now()}`;
        const mpPayment = await mpRequest('/v1/payments', {
          method: 'POST',
          headers: {
            'X-Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            transaction_amount: planCfg.amount,
            description: `Exiba Studio Pro (${cycle === 'yearly' ? 'Plano Anual' : 'Plano Mensal'})`,
            payment_method_id: 'pix',
            payer: {
              email: user.email,
              first_name: user.name?.split(' ')[0] || 'Cliente',
              last_name: user.name?.split(' ').slice(1).join(' ') || 'Exiba',
            },
            external_reference: String(user.id),
            metadata: {
              user_id: String(user.id),
              billing_cycle: cycle,
            },
          }),
        });

        const txData = mpPayment?.point_of_interaction?.transaction_data;
        if (mpPayment?.id && txData?.qr_code) {
          await db.insertPayment({
            userId: user.id,
            mpPaymentId: String(mpPayment.id),
            amount: planCfg.amount,
            status: 'pending',
          });

          return res.json({
            paymentId: String(mpPayment.id),
            status: mpPayment.status || 'pending',
            qrCode: txData.qr_code,
            qrCodeBase64: txData.qr_code_base64 || null,
            ticketUrl: txData.ticket_url || null,
            amount: planCfg.amount,
            cycle,
            expiresAt: mpPayment.date_of_expiration,
            isSimulated: false,
          });
        }
      } catch (err) {
        console.warn('[Mercado Pago PIX] Falha na API remota, ativando fallback simulado:', err);
      }
    }

    // Fallback Simulado de Alta Fidelidade (para testes locais sem quebrar o fluxo)
    const simulatedId = `sim_pix_${user.id}_${Date.now()}`;
    const mockEmvPix = `00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com.br/qr/v2/${randomHex(16)}520400005303986540${planCfg.amount}.005802BR5912EXIBA STUDIO6009SAO PAULO62070503***6304${randomHex(2).toUpperCase()}`;

    await db.insertPayment({
      userId: user.id,
      mpPaymentId: simulatedId,
      amount: planCfg.amount,
      status: 'pending',
    });

    res.json({
      paymentId: simulatedId,
      status: 'pending',
      qrCode: mockEmvPix,
      qrCodeBase64: null,
      ticketUrl: null,
      amount: planCfg.amount,
      cycle,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      isSimulated: true,
    });
  })
);

// GET /api/billing/pix/:paymentId — consulta status do PIX em tempo real (polling)
router.get(
  '/pix/:paymentId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    // Se o pagamento for real no Mercado Pago
    if (!paymentId.startsWith('sim_pix_') && config.mpAccessToken) {
      try {
        const payment = await mpRequest(`/v1/payments/${paymentId}`);
        const status = String(payment?.status ?? 'pending');
        const cycle = payment?.metadata?.billing_cycle === 'yearly' ? 'yearly' : 'monthly';
        const planCfg = PLAN_CONFIG[cycle];

        if (status === 'approved') {
          const expiresAt = new Date(Date.now() + planCfg.days * 24 * 60 * 60 * 1000);
          await db.setUserPlan(user.id, 'pro', expiresAt);
          await db.insertPayment({
            userId: user.id,
            mpPaymentId: String(paymentId),
            amount: planCfg.amount,
            status: 'approved',
          });
          return res.json({ status: 'approved', plan: 'pro', planExpiresAt: expiresAt });
        }

        return res.json({ status, plan: user.plan || 'free' });
      } catch (err) {
        console.error('Erro ao consultar pagamento no MP:', err);
      }
    }

    // Se o usuário já tiver o plano pro ativo no banco
    if (user.plan === 'pro') {
      return res.json({ status: 'approved', plan: 'pro', planExpiresAt: user.plan_expires_at });
    }

    res.json({ status: 'pending', plan: 'free' });
  })
);

// POST /api/billing/simulate-approval — ativação instantânea para testes de desenvolvimento
router.post(
  '/simulate-approval',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cycle = (req.body?.cycle ?? req.body?.billingCycle) === 'yearly' ? 'yearly' : 'monthly';
    const planCfg = PLAN_CONFIG[cycle];
    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    const expiresAt = new Date(Date.now() + planCfg.days * 24 * 60 * 60 * 1000);
    await db.setUserPlan(user.id, 'pro', expiresAt);
    await db.insertPayment({
      userId: user.id,
      mpPaymentId: `sim_appr_${Date.now()}`,
      amount: planCfg.amount,
      status: 'approved',
    });

    res.json({
      success: true,
      plan: 'pro',
      planExpiresAt: expiresAt,
      message: 'Plano Pro ativado com sucesso em ambiente de testes!',
    });
  })
);

// POST /api/billing/webhook — recebe notificações do Mercado Pago
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    validateMercadoPagoWebhook(req);

    const { type, data } = req.body ?? {};
    const resourceId = data?.id;
    if (!resourceId) {
      res.json({ ok: true });
      return;
    }

    if (type === 'payment') {
      const payment = await mpRequest(`/v1/payments/${resourceId}`);
      const status = String(payment?.status ?? 'unknown');
      const userId = Number(payment?.external_reference || payment?.metadata?.user_id || 0);
      const amount = Number(payment?.transaction_amount) || 0;
      const billingCycle = payment?.metadata?.billing_cycle === 'yearly' ? 'yearly' : 'monthly';
      const planCfg = PLAN_CONFIG[billingCycle];

      if (userId) {
        await db.insertPayment({
          userId,
          mpPaymentId: String(payment?.id ?? resourceId),
          amount,
          status,
        });

        if (status === 'approved') {
          const expiresAt = new Date(Date.now() + planCfg.days * 24 * 60 * 60 * 1000);
          await db.setUserPlan(userId, 'pro', expiresAt);
        } else if (status === 'rejected' || status === 'cancelled' || status === 'refunded' || status === 'charged_back') {
          await db.setUserPlan(userId, 'free', null);
        }
      }
    } else if (type === 'subscription_preapproval') {
      const preapproval = await mpRequest(`/preapproval/${resourceId}`);
      const status = String(preapproval?.status ?? '');
      const userId = Number(preapproval?.external_reference || preapproval?.metadata?.user_id || 0);
      if (userId && (status === 'cancelled' || status === 'paused')) {
        await db.setUserPlan(userId, 'free', null);
      }
    }

    res.json({ ok: true });
  })
);

// GET /api/billing/status — plano atual e expiração do usuário logado
router.get(
  '/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await db.findUserById(req.user!.id);
    if (!user) throw new ApiError(404, 'Usuário não encontrado.');

    let plan = (user.plan ?? 'free') as 'free' | 'pro';
    let expiresAt = user.plan_expires_at ?? null;

    // Downgrade automático se a assinatura expirou.
    if (plan === 'pro' && expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      await db.setUserPlan(user.id, 'free', null);
      plan = 'free';
      expiresAt = null;
    }

    res.json({
      plan,
      planExpiresAt: expiresAt,
      isAdmin: Boolean(user.is_admin),
      hasPaymentConfig: Boolean(config.mpAccessToken && config.mpAccessToken.trim().length > 0),
    });
  })
);

export default router;
