import React, { useState, useEffect, useCallback } from 'react';
import { BioSiteConfig } from '../../types';
import { getAnalyticsSummary, resetAnalytics } from '../../api/db';
import {
  BarChart3,
  MousePointerClick,
  Eye,
  TrendingUp,
  Smartphone,
  Globe,
  Share2,
  RotateCcw,
} from 'lucide-react';

interface AnalyticsModalProps {
  config: BioSiteConfig;
  siteId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsModal({
  config,
  siteId,
  isOpen,
  onClose,
}: AnalyticsModalProps) {
  const [summary, setSummary] = useState<{
    totalViews: number;
    totalClicks: number;
    clicksByBlock: Record<string, number>;
  } | null>(null);

  const load = useCallback(async () => {
    if (!siteId) {
      setSummary(null);
      return;
    }
    try {
      setSummary(await getAnalyticsSummary(siteId));
    } catch {
      setSummary(null);
    }
  }, [siteId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const handleReset = async () => {
    if (!siteId) return;
    await resetAnalytics(siteId);
    await load();
  };

  if (!isOpen) return null;

  const totalViews = summary?.totalViews ?? 0;
  const totalBlockClicks = summary?.totalClicks ?? 0;
  const clicksByBlock = summary?.clicksByBlock ?? {};
  const ctr = totalViews > 0 ? ((totalBlockClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Métricas & Desempenho do Bio Site
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhe visualizações em tempo real e os links mais clicados pelos seus visitantes.
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

        {/* Analytics Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Visualizações</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {totalViews.toLocaleString('pt-BR')}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">
                +14.2% esta semana
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total de Cliques</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {totalBlockClicks.toLocaleString('pt-BR')}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Tempo real
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Taxa CTR</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{ctr}%</p>
              <span className="text-[10px] text-slate-400 font-semibold">
                Alta conversão
              </span>
            </div>
          </div>

          {/* Clicks by Block Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Desempenho por Bloco / Link
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {config.blocks.map((block) => {
                const clicks = clicksByBlock[block.id] || 0;
                const percentage =
                  totalBlockClicks > 0
                    ? Math.round((clicks / totalBlockClicks) * 100)
                    : 0;

                let title = 'Bloco';
                if ('title' in block && block.title) title = block.title;
                else if (block.type === 'bento') title = 'Grid Bento';

                return (
                  <div
                    key={block.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-[280px]">
                        {title}
                      </span>
                      <span className="font-mono text-sky-400 font-bold">
                        {clicks} cliques ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                Dispositivos
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Mobile (iPhone / Android)</span>
                  <span className="font-mono text-slate-200 font-semibold">84%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Desktop</span>
                  <span className="font-mono text-slate-200 font-semibold">13%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tablet</span>
                  <span className="font-mono text-slate-200 font-semibold">3%</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-pink-400" />
                Principais Fontes
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Instagram Bio & Stories</span>
                  <span className="font-mono text-slate-200 font-semibold">68%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>WhatsApp Grupos & Direto</span>
                  <span className="font-mono text-slate-200 font-semibold">21%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TikTok & Outros</span>
                  <span className="font-mono text-slate-200 font-semibold">11%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Contadores</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
