import React, { useState } from 'react';
import { resetPassword } from '../../api/db';

interface ResetPasswordViewProps {
  onDone: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onDone }) => {
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Token ausente. Use o link enviado no e-mail.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }
    setStatus('loading');
    try {
      await resetPassword(token, password);
      setStatus('success');
      setMessage('Senha redefinida com sucesso! Você já pode fazer login.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Erro ao redefinir senha.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-black text-gray-950">Redefinir senha</h1>
        <p className="text-xs text-gray-500 mt-1">Digite sua nova senha (mínimo 6 caracteres).</p>

        {status === 'success' ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-emerald-700">{message}</p>
            <button
              type="button"
              onClick={onDone}
              className="w-full py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-sm"
            >
              Ir para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            {status === 'error' && <p className="text-xs text-rose-600">{message}</p>}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirmar nova senha"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-sm disabled:opacity-50"
            >
              {status === 'loading' ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
