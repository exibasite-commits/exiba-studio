import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { BioSiteConfig } from '../../types';
import { generateStandaloneHTML } from '../../utils/htmlExporter';
import {
  Download,
  Copy,
  Check,
  Code,
  QrCode,
  FileJson,
  Upload,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Server,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  config: BioSiteConfig;
  isOpen: boolean;
  onClose: () => void;
  onImportConfig: (newConfig: BioSiteConfig) => void;
  onUpdateConfig?: (newConfig: BioSiteConfig) => void;
  plan?: 'free' | 'pro';
  isAdmin?: boolean;
  onUpgradeToPro?: () => void;
}

export function ExportModal({
  config,
  isOpen,
  onClose,
  onImportConfig,
  onUpdateConfig,
  plan = 'free',
  isAdmin = false,
  onUpgradeToPro,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'domain' | 'html' | 'qr' | 'json'>('domain');
  const [copiedHTML, setCopiedHTML] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedCNAME, setCopiedCNAME] = useState(false);
  const [copiedARecord, setCopiedARecord] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [domainInput, setDomainInput] = useState<string>(config.customDomain || '');
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  const htmlString = generateStandaloneHTML(config, plan, isAdmin);
  const jsonString = JSON.stringify(config, null, 2);
  const publicUrl = `https://exiba.me/${config.profile.handle.replace('@', '') || 'demo'}`;

  // Update domain input if config changes
  useEffect(() => {
    if (config.customDomain) {
      setDomainInput(config.customDomain);
    }
  }, [config.customDomain]);

  // Generate QR Code
  useEffect(() => {
    if (isOpen) {
      const qrTarget = config.customDomain ? `https://${config.customDomain}` : publicUrl;
      QRCode.toDataURL(qrTarget, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0F6E56',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, publicUrl, config.customDomain]);

  if (!isOpen) return null;

  const handleSaveDomain = () => {
    if (plan === 'free' && !isAdmin) {
      if (onUpgradeToPro) {
        onUpgradeToPro();
      } else {
        alert('Domínio personalizado é um recurso exclusivo do Plano Pro.');
      }
      return;
    }
    const cleanDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    setDomainInput(cleanDomain);
    if (onUpdateConfig) {
      onUpdateConfig({
        ...config,
        customDomain: cleanDomain,
        customDomainStatus: cleanDomain ? 'pending' : undefined,
      });
    }
    setIsVerifyingDomain(true);
    setTimeout(() => {
      setIsVerifyingDomain(false);
      if (cleanDomain) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }
    }, 1200);
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exiba-${config.profile.handle.replace('@', '') || 'site'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(htmlString);
    setCopiedHTML(true);
    setTimeout(() => setCopiedHTML(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-exiba-${config.profile.handle.replace('@', '') || 'site'}.png`;
    a.click();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2500);
  };

  const handleCopyText = (text: string, type: 'cname' | 'a') => {
    navigator.clipboard.writeText(text);
    if (type === 'cname') {
      setCopiedCNAME(true);
      setTimeout(() => setCopiedCNAME(false), 2000);
    } else {
      setCopiedARecord(true);
      setTimeout(() => setCopiedARecord(false), 2000);
    }
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.profile && parsed.blocks) {
            onImportConfig(parsed);
            alert('Configuração importada com sucesso!');
            onClose();
          } else {
            alert('Arquivo JSON inválido. Verifique o formato.');
          }
        } catch {
          alert('Erro ao processar arquivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Publicação & Configurações de Domínio
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conecte seu domínio próprio, baixe em HTML ou compartilhe via QR Code no Exiba.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'domain'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Domínio Próprio</span>
            {config.customDomain && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'html'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Arquivo HTML Único</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: DOMÍNIO PERSONALIZADO & APONTAMENTO DNS */}
          {activeTab === 'domain' && (
            <div className="space-y-5">
              {plan === 'free' && !isAdmin && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Recurso Exclusivo do Plano Pro</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Faça upgrade para o Plano Pro para conectar seu próprio domínio (.com.br) e remover a marca d'água Exiba.
                    </p>
                  </div>
                  {onUpgradeToPro && (
                    <button
                      type="button"
                      onClick={onUpgradeToPro}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shrink-0 shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Desbloquear com Pro</span>
                    </button>
                  )}
                </div>
              )}

              {/* Highlight Banner */}
              <div className="p-4 rounded-2xl bg-[#0F6E56]/15 border border-[#0F6E56]/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200 leading-relaxed">
                  <p className="font-bold text-white mb-1">
                    Use o seu próprio link (Ex: link.seunegocio.com.br ou meunegocio.com.br)
                  </p>
                  Conecte qualquer domínio registrado no Registro.br, GoDaddy, Cloudflare, Hostinger ou Locaweb com certificado SSL HTTPS gratuito e ativação rápida.
                </div>
              </div>

              {/* Domain Input Field */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Seu Domínio Personalizado
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="Ex: link.meunegocio.com.br ou www.minhaloja.com.br"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveDomain}
                    disabled={isVerifyingDomain}
                    className="py-2.5 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#0c5946] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isVerifyingDomain ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando & Testando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Domínio</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                {config.customDomain && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-slate-300">
                        Domínio configurado: <strong className="text-white font-mono">{config.customDomain}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      SSL Ativo
                    </span>
                  </div>
                )}
              </div>

              {/* DNS Pointing Instructions */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    Instruções de Apontamento DNS (Painel da sua Hospedagem)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Registro.br / GoDaddy / Cloudflare</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Acesse o painel onde você comprou seu domínio e adicione uma das seguintes entradas na zona de DNS:
                </p>

                {/* Record 1: CNAME (Recommended for subdomains like link.site.com or www.site.com) */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                      Opção 1: Subdomínio (Recomendado — ex: link.seusite.com.br ou www)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('cname.exiba.site', 'cname')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedCNAME ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Copiado!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copiar Destino
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Tipo</span>
                      <strong className="text-amber-400">CNAME</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Nome / Host</span>
                      <strong className="text-white">link</strong> (ou <span className="text-slate-400">www</span>)
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Destino / Valor</span>
                      <strong className="text-emerald-300 truncate block">cname.exiba.site</strong>
                    </div>
                  </div>
                </div>

                {/* Record 2: A Record (For root domain like seusite.com.br) */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                      Opção 2: Domínio Principal Raiz (ex: seusite.com.br)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('76.76.21.21', 'a')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedARecord ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Copiado!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copiar IP
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Tipo</span>
                      <strong className="text-sky-400">A</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Nome / Host</span>
                      <strong className="text-white">@</strong> (ou em branco)
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Endereço IP</span>
                      <strong className="text-sky-300">76.76.21.21</strong>
                    </div>
                  </div>
                </div>

                {/* Provider Specific Step-by-Step Guide */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-200 block">
                    Passo a Passo Rápido por Provedor:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-emerald-400 block font-semibold">Registro.br</strong>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Acesse seu domínio &gt; DNS &gt; Configurar Endereçamento &gt; Adicionar Registro &gt; Selecione CNAME, Nome: <code className="text-white">link</code>, Valor: <code className="text-emerald-300">cname.exiba.site</code>.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-sky-400 block font-semibold">Cloudflare</strong>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Acesse DNS &gt; Records &gt; Add record &gt; Type: CNAME, Name: <code className="text-white">link</code>, Target: <code className="text-sky-300">cname.exiba.site</code>, Proxy status: <code className="text-amber-300">DNS only</code>.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-amber-400 block font-semibold">GoDaddy / Hostinger</strong>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Gerenciar DNS &gt; Adicionar &gt; Tipo: CNAME, Nome/Host: <code className="text-white">link</code>, Aponta para: <code className="text-amber-300">cname.exiba.site</code>, TTL: 1/2 hora.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <strong className="text-purple-400 block font-semibold">Locaweb / UOL Host</strong>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Zona de DNS &gt; Nova entrada CNAME &gt; Entrada: <code className="text-white">link</code> &gt; Conteúdo: <code className="text-purple-300">cname.exiba.site.</code> (com ponto final se exigido).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>A propagação de DNS costuma levar de 15 minutos até poucas horas após o apontamento. O certificado SSL HTTPS é gerado automaticamente.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-emerald-300 mb-1">
                    Pronto para Produção & Zero Dependências!
                  </p>
                  O arquivo HTML gerado pelo Exiba é 100% autônomo. Você pode fazer upload para o
                  GitHub Pages, Vercel, Netlify, Cloudflare Pages ou qualquer servidor de hospedagem.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadHTML}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F6E56] hover:bg-[#0c5946] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0F6E56]/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar index.html</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyHTML}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  {copiedHTML ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Código HTML</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-[11px] font-mono text-slate-400 max-h-60 overflow-y-auto leading-relaxed select-all">
                  {htmlString}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 rounded-2xl" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-100">{config.profile.name}</h4>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {config.customDomain ? `https://${config.customDomain}` : publicUrl}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="py-2.5 px-6 rounded-xl bg-[#0F6E56] hover:bg-[#0c5946] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem PNG do QR Code</span>
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Exporte sua configuração para reutilizar depois ou importe um arquivo JSON salvo anteriormente.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700"
                >
                  {copiedJSON ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">JSON Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>

                <input
                  type="file"
                  ref={jsonFileInputRef}
                  onChange={handleImportJSONFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Importar Arquivo JSON</span>
                </button>
              </div>

              <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[11px] font-mono text-slate-400 max-h-52 overflow-y-auto leading-relaxed select-all">
                {jsonString}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
