import { apiFetch } from './api';

export interface PixPaymentResponse {
  paymentId: string;
  status: string;
  qrCode: string;
  qrCodeBase64?: string | null;
  ticketUrl?: string | null;
  amount: number;
  cycle: 'monthly' | 'yearly';
  expiresAt: string;
  isSimulated: boolean;
}

export interface PixStatusResponse {
  status: string;
  plan: 'free' | 'pro';
  planExpiresAt?: string | null;
}

export interface PreferenceResponse {
  initPoint: string | null;
  preferenceId: string | null;
  isSimulated: boolean;
}

export interface SubscriptionResponse {
  initPoint: string | null;
  preapprovalId: string | null;
  isSimulated: boolean;
}

export interface BillingStatusResponse {
  plan: 'free' | 'pro';
  planExpiresAt: string | null;
  isAdmin: boolean;
  hasPaymentConfig: boolean;
}

/**
 * Cria cobrança PIX imediata com QR Code e Copia e Cola
 */
export async function createPixPayment(cycle: 'monthly' | 'yearly'): Promise<PixPaymentResponse> {
  return apiFetch('/api/billing/pix', {
    method: 'POST',
    body: { cycle },
  });
}

/**
 * Consulta o status da transação PIX (polling a cada 3s)
 */
export async function checkPixStatus(paymentId: string): Promise<PixStatusResponse> {
  return apiFetch(`/api/billing/pix/${paymentId}`);
}

/**
 * Cria uma preferência do Mercado Pago para Checkout Pro (cartão, boleto ou PIX)
 */
export async function createCheckoutPreference(cycle: 'monthly' | 'yearly'): Promise<PreferenceResponse> {
  return apiFetch('/api/billing/preference', {
    method: 'POST',
    body: { cycle },
  });
}

/**
 * Cria assinatura recorrente no cartão via PreApproval do Mercado Pago
 */
export async function createCardSubscription(cycle: 'monthly' | 'yearly'): Promise<SubscriptionResponse> {
  return apiFetch('/api/billing/subscribe', {
    method: 'POST',
    body: { cycle },
  });
}

/**
 * Ativação do plano Pro para testes rápidos em ambiente de desenvolvimento
 */
export async function simulateProUpgrade(cycle: 'monthly' | 'yearly' = 'monthly'): Promise<{
  success: boolean;
  plan: 'pro';
  planExpiresAt: string;
  message: string;
}> {
  return apiFetch('/api/billing/simulate-approval', {
    method: 'POST',
    body: { cycle },
  });
}

/**
 * Retorna o plano do usuário e status da integração Mercado Pago
 */
export async function getBillingStatus(): Promise<BillingStatusResponse> {
  return apiFetch('/api/billing/status');
}
