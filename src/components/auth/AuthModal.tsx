import React, { useState } from 'react';
import { useAuth } from '../../api/AuthContext';
import { forgotPassword } from '../../api/db';
import { GoogleLogin } from '@react-oauth/google';
import { TEMPLATES } from '../../data/templates';
import { ExibaLogo } from '../common/ExibaLogo';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  templateId?: string | null;
  onClose: () => void;
  onSuccess: (siteId: string) => void;
  onDemoMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  templateId,
  onClose,
  onSuccess,
  onDemoMode,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const selectedTemplate = templateId
    ? TEMPLATES.find((t) => t.id === templateId) || null
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!email || !password) {
          throw new Error('Por favor, preencha todos os campos obrigatórios.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
        const { site } = await signUpWithEmail(
          email,
          password,
          name || undefined,
          templateId || undefined
        );
        onSuccess(site.id);
      } else {
        if (!email || !password) {
          throw new Error('Por favor, informe seu e-mail e senha.');
        }
        const user = await signInWithEmail(email, password);
        const { createInitialUserSite } = await import('../../api/db');
        const site = await createInitialUserSite(user.uid, user.email || 'usuario', templateId || undefined);
        onSuccess(site.id);
      }
    } catch (err: any) {
      console.error(err);
      // A API própria retorna mensagens de erro já em português.
      const msg = err.message || 'Ocorreu um erro ao processar sua solicitação.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { site } = await signInWithGoogle(credential, templateId || undefined);
      onSuccess(site.id);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível conectar com o Google. Tente com e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotStatus('loading');
    try {
      await forgotPassword(forgotEmail);
    } catch {
      // ignora — não revela se o e-mail existe
    }
    setForgotStatus('sent');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-3">
            <ExibaLogo height={42} size="lg" theme="light" />
          </div>
          <h3 className="text-xl font-black text-gray-950 tracking-tight">
            {mode === 'register' ? 'Crie seu Exiba grátis' : 'Acesse sua conta'}
          </h3>
          <p className="text-xs text-gray-500">
            {mode === 'register'
              ? 'Comece gratuitamente em menos de 1 minuto.'
              : 'Entre para editar e acompanhar os cliques do seu mini-site.'}
          </p>

          {/* Selected template highlight */}
          {selectedTemplate && mode === 'register' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAEEDA] border border-[#FAC775] text-[#8B530F] text-xs font-bold mt-2">
              <span>{selectedTemplate.previewEmoji}</span>
              <span>Modelo escolhido: {selectedTemplate.name}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl border border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Criar Conta Grátis
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Já tenho conta
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-in Button */}
        <div className="relative mb-4">
          <GoogleLogin
            onSuccess={(credentialResponse) =>
              handleGoogleSuccess(credentialResponse.credential ?? '')
            }
            onError={() => setIsLoading(false)}
            theme="outline"
            text="continue_with"
            shape="pill"
            width={320}
            containerProps={{ style: { display: 'flex', justifyContent: 'center' } }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl pointer-events-none">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-gray-400 uppercase font-semibold">
            ou com seu e-mail
          </span>
        </div>

        {/* Email/Password Form OR Forgot Password */}
        {showForgot ? (
          <div className="space-y-3.5">
            {forgotStatus === 'sent' ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                Se existir uma conta com esse e-mail, você receberá um link de redefinição em instantes.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com.br"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotStatus === 'loading'}
                  className="w-full py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs disabled:opacity-50"
                >
                  {forgotStatus === 'loading' ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => { setShowForgot(false); setForgotStatus('idle'); setForgotEmail(''); }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-900 underline underline-offset-4"
            >
              Voltar para o login
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nome do Negócio ou Responsável
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Ex: Mayrah Esmalteria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Senha {mode === 'register' && '(mínimo 6 caracteres)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#0F6E56] hover:bg-[#0B5643] text-white font-bold text-xs shadow-md shadow-[#0F6E56]/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Carregando...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'register' ? 'Criar meu Exiba e Abrir Editor' : 'Entrar no Painel'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'login' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setShowForgot(true); setError(null); }}
                className="text-xs text-gray-500 hover:text-[#0F6E56] underline underline-offset-4"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
        </form>
        )}

        {onDemoMode && (
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={onDemoMode}
              className="text-xs text-[#0F6E56] hover:text-[#0B5643] font-bold hover:underline transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>Experimentar o Editor agora sem cadastro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
