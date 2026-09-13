import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { PixBlock } from '../../types';
import { buildPixPayload } from '../../utils/pixPayload';
import { X, QrCode, Copy, Check, Download } from 'lucide-react';

interface PixModalProps {
  block: PixBlock;
  onClose: () => void;
  onCopied: (key: string) => void;
}

export const PixModal: React.FC<PixModalProps> = ({ block, onClose, onCopied }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<'key' | 'payload' | null>(null);

  const buildPayload = useCallback(
    (amount: number | null) =>
      buildPixPayload({
        pixKey: block.pixKey,
        recipientName: block.recipientName || 'Recebedor',
        city: 'BRASIL',
        amount: amount ?? undefined,
      }),
    [block.pixKey, block.recipientName]
  );

  const generateQr = useCallback(
    async (amount: number | null) => {
      try {
        const payload = buildPayload(amount);
        const url = await QRCode.toDataURL(payload, { width: 320, margin: 2 });
        setQrUrl(url);
      } catch (err) {
        console.error('Erro ao gerar QR Code Pix:', err);
      }
    },
    [buildPayload]
  );

  useEffect(() => {
    generateQr(selectedAmount);
  }, [generateQr, selectedAmount]);

  const copyText = async (text: string, kind: 'key' | 'payload') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      if (kind === 'key') onCopied(block.pixKey);
      setTimeout(() => setCopied(null), 2500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `pix-${selectedAmount ? selectedAmount.toFixed(2) : 'aberto'}.png`;
    a.click();
  };

  const amounts = (block.suggestedAmounts || [])
    .map((a) => Number(String(a).replace(/[^\d.,]/g, '').replace(',', '.')))
    .filter((n) => !Number.isNaN(n) && n > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl p-6 relative bg-slate-900 border border-white/15 text-white shadow-2xl text-center flex flex-col items-center max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
          <QrCode className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold">{block.title || 'Chave Pix'}</h3>
        {block.recipientName && (
          <p className="text-xs text-slate-300 mt-0.5">
            Titular: <span className="font-semibold text-white">{block.recipientName}</span>
          </p>
        )}

        {/* QR Code */}
        <div className="p-2.5 bg-white rounded-2xl shadow-md my-4">
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code Pix" className="w-40 h-40" />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">Gerando QR Code...</div>
          )}
        </div>

        {selectedAmount !== null && (
          <p className="text-xs font-semibold text-emerald-400 -mt-2 mb-3">
            QR Code para pagar R$ {selectedAmount.toFixed(2)}
          </p>
        )}

        {/* Valores sugeridos */}
        {amounts.length > 0 && (
          <div className="w-full mb-3">
            <p className="text-[11px] text-slate-400 mb-1.5">Valores sugeridos:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedAmount(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  selectedAmount === null
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                    : 'bg-white/5 text-slate-200 border-white/10 hover:border-white/30'
                }`}
              >
                Sem valor
              </button>
              {amounts.map((amt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selectedAmount === amt
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-white/5 text-slate-200 border-white/10 hover:border-white/30'
                  }`}
                >
                  R$ {amt.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chave copiável + copia-e-cola + download */}
        <div className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="uppercase font-semibold">{block.pixKeyType}</span>
            <span>Clique para copiar</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 truncate select-all">{block.pixKey}</span>
            <button
              type="button"
              onClick={() => copyText(block.pixKey, 'key')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
            >
              {copied === 'key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'key' ? 'Copiado!' : 'Copiar Chave'}
            </button>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => copyText(buildPayload(selectedAmount), 'payload')}
            className="py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied === 'payload' ? 'Copiado!' : 'PIX copia-e-cola'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar QR Code
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Concluído
        </button>
      </div>
    </div>
  );
};
