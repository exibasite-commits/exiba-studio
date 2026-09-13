import React, { useState, useEffect } from 'react';
import { Sparkles, X, Wand2, CheckCircle2, ChevronDown, ChevronUp, Key, Building2, MapPin, Phone, Palette, ArrowRight, Loader2 } from 'lucide-react';
import { generateSiteWithAi, checkAiStatus } from '../../api/ai';
import { BioSiteConfig } from '../../types';

interface AiSiteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteGenerated: (config: BioSiteConfig) => void;
}

const NICHES = [
  { id: 'beleza', label: 'Salão & Estética', icon: '💅', exampleServices: 'Alongamento em gel, Design de sobrancelhas, Esmaltação' },
  { id: 'barbearia', label: 'Barbearia', icon: '💈', exampleServices: 'Corte degradê, Barba alinhada, Hidratação capilar' },
  { id: 'gastronomia', label: 'Restaurante / Café', icon: '🍽️', exampleServices: 'Pratos executivos, Sobremesas artesanais, Cafés especiais' },
  { id: 'saude', label: 'Saúde & Nutrição', icon: '🩺', exampleServices: 'Consulta nutricional, Bioimpedância, Plano alimentar' },
  { id: 'fitness', label: 'Personal & Treino', icon: '🏋️', exampleServices: 'Consultoria online, Treino personalizado, Acompanhamento' },
  { id: 'advocacia', label: 'Advocacia & Finanças', icon: '⚖️', exampleServices: 'Assessoria jurídica, Consultoria tributária, Contratos' },
  { id: 'loja', label: 'Loja / E-commerce', icon: '🛍️', exampleServices: 'Acessórios, Roupas femininas, Produtos exclusivos' },
  { id: 'criador', label: 'Criador & Mídia', icon: '🎨', exampleServices: 'Parcerias, Mídia kit, Ensaio fotográfico, Mentoria' },
];

const LOADING_STEPS = [
  'Analisando o nicho e público-alvo...',
  'Escrevendo bio persuasiva e diferenciais de marca...',
  'Definindo paleta de cores e tipografia de alta conversão...',
  'Estruturando blocos de agendamento, produtos e WhatsApp...',
  'Finalizando os detalhes do seu novo mini-site...',
];

export const AiSiteGeneratorModal: React.FC<AiSiteGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSiteGenerated,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('beleza');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState('');
  const [vibe, setVibe] = useState<'modern' | 'elegant' | 'minimal' | 'bold'>('modern');

  // Chave Gemini
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [hasServerKey, setHasServerKey] = useState(false);

  // Estados de geração
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkAiStatus().then((status) => {
        setHasServerKey(status.hasServerKey);
      });
      // Restaurar chave salva no localStorage se houver
      const savedKey = localStorage.getItem('exiba_gemini_api_key');
      if (savedKey) setCustomKey(savedKey);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId);
    const found = NICHES.find((n) => n.id === nicheId);
    if (found && !services) {
      setServices(found.exampleServices);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('Por favor, informe o nome do seu negócio.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    if (customKey.trim()) {
      localStorage.setItem('exiba_gemini_api_key', customKey.trim());
    }

    try {
      const generatedConfig = await generateSiteWithAi({
        businessName: businessName.trim(),
        niche: NICHES.find((n) => n.id === selectedNiche)?.label || selectedNiche,
        city: city.trim(),
        phone: phone.trim(),
        vibe,
        servicesOrProducts: services.trim(),
        apiKey: customKey.trim() || undefined,
      });

      setIsGenerating(false);
      onSiteGenerated(generatedConfig);
      onClose();
    } catch (err: any) {
      console.error('Erro na geração com IA:', err);
      setIsGenerating(false);
      setErrorMessage(err?.message || 'Ocorreu um erro ao gerar o site. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header com Gradiente */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Criar Site com Inteligência Artificial</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gere bio, fotos, blocos de agendamento, produtos e WhatsApp em 5 segundos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {isGenerating ? (
            /* Tela de Carregamento Dinâmica */
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-slate-800/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <Wand2 className="w-9 h-9 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="text-base font-bold text-white">Criando seu mini-site personalizado</h3>
                <p className="text-xs text-emerald-400 font-medium min-h-[20px] transition-all duration-300">
                  {LOADING_STEPS[stepIndex]}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                  style={{ width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <form id="ai-gen-form" onSubmit={handleGenerate} className="space-y-5">
              {/* 1. Seleção de Nicho */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>1. Qual é o seu segmento?</span>
                  <span className="text-[11px] text-slate-500 font-normal">Selecione o mais próximo</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NICHES.map((n) => {
                    const isSelected = selectedNiche === n.id;
                    return (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => handleNicheSelect(n.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-base">{n.icon}</span>
                        <span className="truncate">{n.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Nome do Negócio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  2. Nome do Negócio ou Profissional *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Dra. Camila Nutrição, Barbearia Silva, Mayrah Esmalteria"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {/* 3. Cidade & WhatsApp em Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Cidade / Bairro
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo, Moema"
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp de Atendimento
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 11 99999-9999"
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 4. Serviços Principais */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>4. Principais Serviços ou Produtos (opcional)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Separados por vírgula</span>
                </label>
                <textarea
                  rows={2}
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Ex: Esmaltação em gel, Spa dos pés, Blindagem, Sobrancelhas"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none"
                />
              </div>

              {/* 5. Vibe / Estilo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  5. Estilo Visual Desejado
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'modern', label: 'Moderno & Tech' },
                    { id: 'elegant', label: 'Elegante & Luxo' },
                    { id: 'minimal', label: 'Minimalista & Clean' },
                    { id: 'bold', label: 'Vibrante & Forte' },
                  ].map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setVibe(v.id as any)}
                      className={`p-2 text-center rounded-xl border text-xs font-medium transition-all ${
                        vibe === v.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Opções Avançadas: Chave de API Google Gemini */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Chave de API do Google Gemini (Opcional)
                    {hasServerKey ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Servidor Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        {customKey ? '• Chave pessoal ativa' : '• Motor Semântico Ativo'}
                      </span>
                    )}
                  </span>
                  {showKeyConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showKeyConfig && (
                  <div className="mt-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Se você possui uma chave da API do <strong>Google Gemini</strong>, insira abaixo para ativar o modelo generativo <code>gemini-2.5-flash</code> em tempo real. Se deixar em branco, o Exiba Studio usará seu poderoso <strong>Motor Semântico Inteligente</strong> com presets brasileiros.
                    </p>
                    <input
                      type="password"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 outline-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>A chave é armazenada com segurança localmente no seu navegador.</span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline"
                      >
                        Obter chave gratuita no Google AI Studio ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer com Botão de Ação */}
        {!isGenerating && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="ai-gen-form"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar Meu Site com IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
