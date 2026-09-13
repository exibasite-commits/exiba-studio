import React, { useState, useEffect, useCallback } from 'react';
import {
  createAvailability,
  listAvailability,
  deleteAvailability,
  listBookings,
  cancelBooking,
  AvailabilitySlot,
  Booking,
} from '../../api/db';

interface AvailabilityManagerProps {
  siteId: string;
}

const WEEK_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function fmtDate(d: string): string {
  const [y, m, day] = String(d).split('-');
  return `${day}/${m}`;
}

function fmtTime(t: string): string {
  return String(t).slice(0, 5);
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ siteId }) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [daysRange, setDaysRange] = useState(14);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, b] = await Promise.all([listAvailability(siteId), listBookings(siteId)]);
      setSlots(s);
      setBookings(b);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar agenda.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleWeekday = (d: number) => {
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const list: { date: string; startTime: string; endTime: string }[] = [];
      const today = new Date();
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const endMin = eh * 60 + em;

      for (let d = 1; d <= daysRange; d++) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
        if (!weekdays.includes(date.getDay())) continue;
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        let cur = sh * 60 + sm;
        while (cur + slotDuration <= endMin) {
          const sH = Math.floor(cur / 60);
          const sM = cur % 60;
          const eH = Math.floor((cur + slotDuration) / 60);
          const eM = (cur + slotDuration) % 60;
          list.push({
            date: dateStr,
            startTime: `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}:00`,
            endTime: `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}:00`,
          });
          cur += slotDuration;
        }
      }

      if (list.length === 0) {
        setError('Nenhum horário gerado. Ajuste os dias/expediente.');
        return;
      }
      await createAvailability(siteId, list);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar horários.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRemove = async (slotId: string) => {
    try {
      await deleteAvailability(siteId, slotId);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Erro ao remover.');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Cancelar este agendamento?')) {
      try {
        await cancelBooking(siteId, bookingId);
        await load();
      } catch (e: any) {
        alert(e?.message || 'Erro ao cancelar.');
      }
    }
  };

  return (
    <div className="space-y-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
      {error && <p className="text-xs text-rose-400">{error}</p>}

      {/* Gerar horários */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-slate-200">Gerar horários disponíveis</p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <label>
            Próximos{' '}
            <select value={daysRange} onChange={(e) => setDaysRange(Number(e.target.value))} className="ml-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </label>
          <label>
            Início{' '}
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="ml-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200" />
          </label>
          <label>
            Fim{' '}
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="ml-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200" />
          </label>
          <label>
            Duração{' '}
            <select value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} className="ml-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleWeekday(d)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                weekdays.includes(d) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              {WEEK_NAMES[d]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
        >
          {generating ? 'Gerando...' : 'Gerar horários'}
        </button>
      </div>

      {/* Horários */}
      <div>
        <p className="text-xs font-bold text-slate-200 mb-2">Horários cadastrados ({slots.length})</p>
        {loading ? (
          <p className="text-xs text-slate-500">Carregando...</p>
        ) : slots.length === 0 ? (
          <p className="text-xs text-slate-500">Nenhum horário cadastrado.</p>
        ) : (
          <div className="max-h-44 overflow-y-auto space-y-1">
            {slots.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-xs px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">{fmtDate(s.date)} às {fmtTime(s.startTime)}</span>
                <span className={`text-[10px] font-bold ${s.isBooked ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {s.isBooked ? 'Reservado' : 'Disponível'}
                </span>
                <button type="button" onClick={() => handleRemove(s.id)} disabled={s.isBooked} className="text-rose-400 hover:text-rose-300 disabled:opacity-30">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agendamentos */}
      <div>
        <p className="text-xs font-bold text-slate-200 mb-2">Agendamentos recebidos ({bookings.length})</p>
        {bookings.length === 0 ? (
          <p className="text-xs text-slate-500">Nenhum agendamento.</p>
        ) : (
          <div className="max-h-44 overflow-y-auto space-y-1">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 text-xs px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="min-w-0 truncate">
                  <span className="text-slate-200 font-semibold">{b.clientName}</span>
                  <span className="text-slate-400 ml-2">{b.clientPhone}</span>
                  <span className="text-slate-400 ml-2">{fmtDate(b.date)} às {fmtTime(b.startTime)}</span>
                </div>
                {b.status === 'confirmed' ? (
                  <button type="button" onClick={() => handleCancel(b.id)} className="text-rose-400 hover:text-rose-300 shrink-0">
                    Cancelar
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 shrink-0">Cancelado</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
