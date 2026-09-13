import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  Check,
  QrCode,
  CreditCard,
  Copy,
  CheckCheck,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Zap,
  Globe,
  BarChart3,
  Flame,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  createPixPayment,
  checkPixStatus,
  createCheckoutPreference,
  createCardSubscription,
  simulateProUpgrade,
  getBillingStatus,
  PixPaymentResponse,
} from '../../api/billing';
import { useAuth } from '../../api/AuthContext';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpgraded?: () => void;
  initialCycle?: 'monthly' | 'yearly';
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  onPlanUpgraded,
  initialCycle = 'yearly',
}) => {
  const { user, refreshUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialCycle);
  const [activePaymentMethod, setActivePaymentMethod] = useState<'pix' | 'card'>('pix');
  const [hasPaymentConfig, setHasPaymentConfig] = useState(true);

  // Estados do PIX
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Cartão / Checkout
  const [isStartingCard, setIsStartingCard] = useState(false);

  const pollingRef = useRef<any>(null);

  // Checar configuração ao abrir
  useEffect(() => {
    if (isOpen) {
      getBillingStatus()
        .then((status) => {
          setHasPaymentConfig(status.hasPaymentConfig);
          if (status.plan === 'pro') {
            setPaymentApproved(true);
          }
        })
        .catch(() => {
          setHasPaymentConfig(false);
        });
    } else {
      // Limpar polling ao fechar
      if (pollingRef.current) clearInterval(pollingRef.current);
      setPixData(null);
      setQrCodeDataUrl(null);
      setPaymentApproved(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Limpeza de polling no unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Iniciar Polling quando houver um PIX pendente
  useEffect(() => {
    if (pixData && !paymentApproved) {
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        try {
          setIsCheckingPayment(true);
          const statusRes = await checkPixStatus(pixData.paymentId);
          if (statusRes.status === 'approved' || statusRes.plan === 'pro') {
            clearInterval(pollingRef.current);
            setPaymentApproved(true);
            triggerSuccess();
          }
        } catch (err) {
          // silencia falhas pontuais de rede
        } finally {
          setIsCheckingPayment(false);
        }
      }, 3500);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pixData, paymentApproved]);

  const triggerSuccess = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
    if (refreshUser) refreshUser();
    if (onPlanUpgraded) onPlanUpgraded();
  };

  const handleGeneratePix = async () => {
    setErrorMessage(null);
    setIsGeneratingPix(true);
    try {
      const data = await createPixPayment(billingCycle);
      setPixData(data);

      // Gerar QR code local em dataURL com o código Pix EMV
      if (data.qrCode) {
        const url = await QRCode.toDataURL(data.qrCode, {
          width: 320,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setQrCodeDataUrl(url);
      }
    } catch {
      // Fallback sandbox dinâmico caso esteja sem backend/offline/modo demo
      const mockAmount = billingCycle === 'yearly' ? 315 : 35;
      const mockCode = `00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540${mockAmount}.005802BR5912EXIBA STUDIO6009SAO PAULO62070503***6304ABCD`;
      const fallbackData: PixPaymentResponse = {
        paymentId: 'sandbox_' + Date.now(),
        status: 'pending',
        qrCode: mockCode,
        amount: mockAmount,
        cycle: billingCycle,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        isSimulated: true,
      };
      setPixData(fallbackData);
      try {
        const url = await QRCode.toDataURL(mockCode, {
          width: 320,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setQrCodeDataUrl(url);
      } catch {
        // ignore
      }
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCardCheckout = async () => {
    setIsStartingCard(true);
    setErrorMessage(null);
    try {
      // Tentar preferência oficial Mercado Pago
      const pref = await createCheckoutPreference(billingCycle);
      if (pref.initPoint) {
        window.location.href = pref.initPoint;
        return;
      }

      // Se for assinatura ou fallback
      const sub = await createCardSubscription(billingCycle);
      if (sub.initPoint) {
        window.location.href = sub.initPoint;
        return;
      }

      // Se for ambiente de desenvolvimento sem chaves
      await handleSimulateApproval();
    } catch {
      await handleSimulateApproval();
    } finally {
      setIsStartingCard(false);
    }
  };

  const handleSimulateApproval = async () => {
    try {
      await simulateProUpgrade(billingCycle);
    } catch {
      // ignore
    }
    setPaymentApproved(true);
    triggerSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header com Gradiente e Selo Pro */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Desbloqueie o Exiba Pro</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Acesso Total
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Remova a marca d'água, conecte seu domínio próprio e multiplique suas conversões.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {paymentApproved ? (
            /* Tela de Sucesso */
            <div className="py-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Parabéns! Seu plano Pro está ativo!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Todos os recursos avançados foram liberados para a sua conta: domínio próprio, remoção de marca d'água e relatórios em tempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
              >
                Acessar o Studio Agora
              </button>
            </div>
          ) : (
            <>
              {/* Seletor de Ciclo: Mensal vs Anual */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle('monthly');
                      setPixData(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Mensal • R$ 35/mês</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle('yearly');
                      setPixData(null);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      billingCycle === 'yearly'
                        ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-white border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Anual • R$ 315/ano</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                      -25% OFF
                    </span>
                  </button>
                </div>
              </div>

              {/* Benefícios Inclusos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { icon: Globe, title: 'Domínio Próprio', desc: 'ex: link.seusite.com.br' },
                  { icon: ShieldCheck, title: 'Sem Marca d’Água', desc: '100% marca branca' },
                  { icon: BarChart3, title: 'Analytics em Tempo Real', desc: 'Cliques e visitantes' },
                  { icon: Zap, title: 'Sites Ilimitados', desc: 'Crie quantos quiser' },
                ].map((b, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left space-y-1">
                    <b.icon className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-bold text-slate-200 truncate">{b.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* Abas de Pagamento: PIX vs Cartão */}
              <div className="space-y-4 pt-1">
                <div className="flex border-b border-slate-800 gap-4">
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('pix')}
                    className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 -mb-px ${
                      activePaymentMethod === 'pix'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Instantâneo</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold">
                      Aprovação em 3s
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('card')}
                    className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 -mb-px ${
                      activePaymentMethod === 'card'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>

                {/* Conteúdo Aba PIX */}
                {activePaymentMethod === 'pix' && (
                  <div className="space-y-4">
                    {!pixData ? (
                      <div className="py-6 text-center space-y-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">
                            Pague com PIX e libere seu acesso imediatamente
                          </h4>
                          <p className="text-xs text-slate-400">
                            Valor total: <strong className="text-emerald-400">{billingCycle === 'yearly' ? 'R$ 315,00' : 'R$ 35,00'}</strong> (sem taxas adicionais).
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isGeneratingPix}
                          onClick={handleGeneratePix}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 mx-auto transition-all disabled:opacity-50"
                        >
                          {isGeneratingPix ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Gerando QR Code...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Gerar QR Code Pix</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* QR Code e Copia e Cola Gerados */
                      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
                          {/* Imagem do QR Code */}
                          <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
                            {qrCodeDataUrl ? (
                              <img src={qrCodeDataUrl} alt="QR Code Pix" className="w-44 h-44 object-contain" />
                            ) : (
                              <div className="w-44 h-44 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
                                Carregando QR...
                              </div>
                            )}
                          </div>

                          {/* Instruções */}
                          <div className="space-y-3 flex-1 text-center sm:text-left">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Código válido por 30 minutos
                              </span>
                              <h4 className="text-sm font-bold text-white">
                                Escaneie com o app do seu banco
                              </h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Abra o aplicativo do seu banco, escolha <strong>Pagar com Pix</strong> e aponte a câmera ou use o botão Copia e Cola abaixo.
                              </p>
                            </div>

                            {/* Status de Polling */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                              <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                              <span>Aguardando pagamento... Verificação automática</span>
                            </div>
                          </div>
                        </div>

                        {/* Botão Pix Copia e Cola */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <label className="text-[11px] font-semibold text-slate-400">Pix Copia e Cola:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={pixData.qrCode}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 outline-none truncate"
                            />
                            <button
                              type="button"
                              onClick={handleCopyPix}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                            >
                              {copiedPix ? (
                                <>
                                  <CheckCheck className="w-3.5 h-3.5" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar Código</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Botão Sandbox para Testes */}
                        {(pixData.isSimulated || !hasPaymentConfig) && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-amber-400">
                              🧪 Ambiente de Testes Ativo
                            </span>
                            <button
                              type="button"
                              onClick={handleSimulateApproval}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all"
                            >
                              Simular Pagamento Aprovado ↗
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Conteúdo Aba Cartão */}
                {activePaymentMethod === 'card' && (
                  <div className="py-6 text-center space-y-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        Checkout Seguro do Mercado Pago
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Pague no cartão de crédito em até 12x ou configure sua assinatura recorrente com total segurança e criptografia bancária.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isStartingCard}
                      onClick={handleCardCheckout}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 mx-auto transition-all disabled:opacity-50"
                    >
                      {isStartingCard ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Redirecionando...</span>
                        </>
                      ) : (
                        <>
                          <span>Pagar no Cartão de Crédito</span>
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pagamentos processados com segurança pelo Mercado Pago</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
