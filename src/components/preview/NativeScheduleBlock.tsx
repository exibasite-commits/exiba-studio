import React, { useState, useEffect } from 'react';
import { getPublicAvailability, createPublicBooking, PublicSlot, PublicBookingResult } from '../../api/db';
import { ThemeConfig } from '../../types';

interface NativeScheduleBlockProps {
  slug: string;
  title?: string;
  subtitle?: string;
  theme: ThemeConfig;
}

function formatDate(d: string): string {
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}/${y}`;
}

function formatTime(t: string): string {
  return String(t).slice(0, 5);
}

export const NativeScheduleBlock: React.FC<NativeScheduleBlockProps> = ({ slug, title, subtitle, theme }) => {
  const [slots, setSlots] = useState<PublicSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<PublicBookingResult | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSlots(await getPublicAvailability(slug));
    } catch {
      setError('Não foi possível carregar os horários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createPublicBooking(slug, {
        slotId: selectedSlot.id,
        clientName: name,
        clientPhone: phone,
        clientEmail: email || undefined,
      });
      setConfirmed(result);
    } catch (err: any) {
      setError(err?.message || 'Erro ao reservar.');
      if (String(err?.message).includes('reservado')) await load();
    } finally {
      setSubmitting(false);
    }
  };

  const byDate: Record<string, PublicSlot[]> = {};
  for (const s of slots) {
    (byDate[s.date] ||= []).push(s);
  }

  if (confirmed) {
    return (
      <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.cardTextColor, borderRadius: 16, padding: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15 }}>Agendamento confirmado!</p>
        <p style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
          {confirmed.date} às {confirmed.time}
        </p>
        {confirmed.whatsappUrl && (
          <a
            href={confirmed.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', marginTop: 12, padding: '8px 14px', borderRadius: 10, backgroundColor: theme.accentColor, color: theme.accentTextColor, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            Enviar confirmação no WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.cardTextColor, borderRadius: 16, padding: 16, width: '100%' }}>
      {title && <p style={{ fontWeight: 700, fontSize: 15 }}>{title}</p>}
      {subtitle && <p style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{subtitle}</p>}

      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>Carregando horários...</p>
      ) : slots.length === 0 ? (
        <p style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>Nenhum horário disponível no momento.</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {Object.entries(byDate).map(([date, list]) => (
            <div key={date} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginBottom: 4 }}>{formatDate(date)}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {list.map((s) => {
                  const active = selectedSlot?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: active ? theme.accentColor : 'transparent',
                        color: active ? theme.accentTextColor : theme.cardTextColor,
                        border: `1px solid ${active ? theme.accentColor : theme.cardBorder}`,
                      }}
                    >
                      {formatTime(s.startTime)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <form onSubmit={handleSubmit} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 700 }}>
            Reservar {formatDate(selectedSlot.date)} às {formatTime(selectedSlot.startTime)}
          </p>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.cardTextColor }}
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Seu telefone"
            style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.cardTextColor }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail (opcional)"
            style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13, border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.cardTextColor }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px', borderRadius: 10, backgroundColor: theme.accentColor, color: theme.accentTextColor, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </form>
      )}
    </div>
  );
};
