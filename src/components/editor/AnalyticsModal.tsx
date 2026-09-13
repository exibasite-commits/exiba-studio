import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BioSiteConfig } from '../../types';
import { getAnalyticsSummary, resetAnalytics, AnalyticsSummary, DailyMetric } from '../../api/db';
import {
  BarChart3,
  MousePointerClick,
  Eye,
  TrendingUp,
  Smartphone,
  Share2,
  RotateCcw,
  Download,
  Trophy,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Check,
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
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | 'all'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<DailyMetric | null>(null);
  const [exportedCsv, setExportedCsv] = useState(false);

  const load = useCallback(async () => {
    if (!siteId) {
      setSummary(null);
      return;
    }
    try {
      const data = await getAnalyticsSummary(siteId);
      setSummary(data);
    } catch {
      setSummary(null);
    }
  }, [siteId]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const handleReset = async () => {
    if (!siteId) return;
    if (window.confirm('Tem certeza de que deseja zerar todas as estatísticas deste mini-site?')) {
      await resetAnalytics(siteId);
      await load();
    }
  };

  // Filtragem do histórico temporal com base no período selecionado
  const filteredHistory = useMemo(() => {
    const rawHistory = summary?.dailyHistory || [];
    if (timeRange === '7d') {
      return rawHistory.slice(-7);
    }
    return rawHistory.slice(-14);
  }, [summary?.dailyHistory, timeRange]);

  // Totais do período selecionado
  const { periodViews, periodClicks } = useMemo(() => {
    if (timeRange === 'all' || !filteredHistory.length) {
      return {
        periodViews: summary?.totalViews ?? 0,
        periodClicks: summary?.totalClicks ?? 0,
      };
    }
    const v = filteredHistory.reduce((acc, cur) => acc + cur.views, 0);
    const c = filteredHistory.reduce((acc, cur) => acc + cur.clicks, 0);
    return { periodViews: v, periodClicks: c };
  }, [filteredHistory, summary, timeRange]);

  const ctr = periodViews > 0 ? ((periodClicks / periodViews) * 100).toFixed(1) : '0.0';

  // Identificação do Bloco Campeão de Cliques
  const clicksByBlock = summary?.clicksByBlock ?? {};
  const blockRanking = useMemo(() => {
    return [...config.blocks]
      .map((block) => {
        let title = 'Bloco';
        if ('title' in block && block.title) title = block.title;
        else if (block.type === 'bento') title = 'Grid Bento';
        else if (block.type === 'pix') title = 'Chave Pix';
        else if (block.type === 'whatsapp') title = 'Botão WhatsApp';
        else if (block.type === 'schedule') title = 'Agendamento Online';

        const clicks = clicksByBlock[block.id] || 0;
        return { block, title, clicks };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }, [config.blocks, clicksByBlock]);

  const championBlock = blockRanking.length > 0 && blockRanking[0].clicks > 0 ? blockRanking[0] : null;

  // Gerador e Exportador de Relatório CSV
  const handleExportCsv = () => {
    const siteSlug = config.profile.handle ? config.profile.handle.replace('@', '') : 'site';
    const filename = `relatorio-analytics-${siteSlug}-${new Date().toISOString().split('T')[0]}.csv`;

    let csvContent = '\uFEFF'; // UTF-8 BOM para abrir acentos no Excel
    csvContent += 'RESUMO ANALÍTICO — EXIBA STUDIO\n';
    csvContent += `Site: ${config.profile.name || siteSlug}\n`;
    csvContent += `Data de Exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n`;
    csvContent += `Total de Visualizações: ${periodViews}\n`;
    csvContent += `Total de Cliques: ${periodClicks}\n`;
    csvContent += `Taxa CTR: ${ctr}%\n\n`;

    csvContent += 'HISTÓRICO DIÁRIO\n';
    csvContent += 'Data,Visualizações,Cliques,CTR (%)\n';
    filteredHistory.forEach((h) => {
      const dayCtr = h.views > 0 ? ((h.clicks / h.views) * 100).toFixed(1) : '0.0';
      csvContent += `${h.date},${h.views},${h.clicks},${dayCtr}%\n`;
    });

    csvContent += '\nDESEMPENHO POR BLOCO / LINK\n';
    csvContent += 'Título do Bloco,Tipo,Cliques,Participação (%)\n';
    blockRanking.forEach((item) => {
      const pct = periodClicks > 0 ? ((item.clicks / periodClicks) * 100).toFixed(1) : '0.0';
      csvContent += `"${item.title.replace(/"/g, '""')}",${item.block.type},${item.clicks},${pct}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);

    setExportedCsv(true);
    setTimeout(() => setExportedCsv(false), 2500);
  };

  if (!isOpen) return null;

  // Cálculos para o gráfico SVG suave
  const chartHeight = 130;
  const chartWidth = 500;
  const paddingX = 20;
  const paddingY = 20;

  const maxVal = Math.max(
    ...filteredHistory.map((h) => Math.max(h.views, h.clicks)),
    10
  );

  const getCoordinates = (index: number, value: number) => {
    const n = Math.max(filteredHistory.length - 1, 1);
    const x = paddingX + (index / n) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (value / maxVal) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const viewsPoints = filteredHistory.map((h, i) => getCoordinates(i, h.views));
  const clicksPoints = filteredHistory.map((h, i) => getCoordinates(i, h.clicks));

  const buildSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  };

  const buildAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const line = buildSvgPath(points);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = chartHeight - paddingY;
    return `${line} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Métricas & Desempenho em Tempo Real</span>
              </h2>
              <p className="text-xs text-slate-400">
                Acompanhe visualizações, cliques e conversões para expandir seus resultados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
              title="Baixar planilha CSV"
            >
              {exportedCsv ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Exportado!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Exportar CSV</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Seletor de Período */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '7d'
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Últimos 7 dias
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('14d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '14d'
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Últimos 14 dias
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === 'all'
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todo o período
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs" />
                <span className="text-slate-300 font-medium">Visualizações</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs" />
                <span className="text-slate-300 font-medium">Cliques nos Links</span>
              </div>
            </div>
          </div>

          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  Visualizações
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                  {timeRange === '7d' ? '7 dias' : timeRange === '14d' ? '14 dias' : 'Total'}
                </span>
              </div>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {periodViews.toLocaleString('pt-BR')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Visitas únicas e páginas visualizadas
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                  Total de Cliques
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Tempo real
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {periodClicks.toLocaleString('pt-BR')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Cliques em botões, produtos e Pix
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Taxa de Conversão (CTR)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  {Number(ctr) >= 20 ? 'Excelente' : 'Bom'}
                </span>
              </div>
              <p className="text-2xl font-black text-amber-300 font-mono mt-1">
                {ctr}%
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Média de cliques por visitante
              </p>
            </div>
          </div>

          {/* Interactive SVG Line / Area Timeline Chart */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Tendência Diária (Visualizações vs. Cliques)
              </span>

              {hoveredPoint ? (
                <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                  {hoveredPoint.date}: <strong className="text-sky-400">{hoveredPoint.views} vistas</strong> · <strong className="text-emerald-400">{hoveredPoint.clicks} cliques</strong>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">Passe o mouse para detalhes</span>
              )}
            </div>

            <div className="relative w-full overflow-hidden pt-2">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 overflow-visible">
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Linhas de grade sutis */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#334155" opacity="0.6" />

                {/* Áreas preenchidas */}
                <path d={buildAreaPath(viewsPoints)} fill="url(#viewsGrad)" />
                <path d={buildAreaPath(clicksPoints)} fill="url(#clicksGrad)" />

                {/* Linhas de traçado */}
                <path d={buildSvgPath(viewsPoints)} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={buildSvgPath(clicksPoints)} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Pontos interativos */}
                {viewsPoints.map((pt, idx) => {
                  const metric = filteredHistory[idx];
                  const isHovered = hoveredPoint?.date === metric?.date;
                  return (
                    <g key={`point-${idx}`}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5 : 3.5}
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(metric)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle
                        cx={clicksPoints[idx]?.x ?? pt.x}
                        cy={clicksPoints[idx]?.y ?? pt.y}
                        r={isHovered ? 5 : 3.5}
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(metric)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Rótulos de data no eixo X */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 px-2">
                <span>{filteredHistory[0]?.date ? filteredHistory[0].date.slice(5) : ''}</span>
                <span>{filteredHistory[Math.floor(filteredHistory.length / 2)]?.date ? filteredHistory[Math.floor(filteredHistory.length / 2)].date.slice(5) : ''}</span>
                <span>{filteredHistory[filteredHistory.length - 1]?.date ? filteredHistory[filteredHistory.length - 1].date.slice(5) : ''}</span>
              </div>
            </div>
          </div>

          {/* Destaque do Bloco Campeão */}
          {championBlock && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-400/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                      Campeão de Conversão 🏆
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-0.5">
                    {championBlock.title}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Responsável por <strong className="text-emerald-400">{championBlock.clicks} cliques</strong> no período.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-mono font-black text-amber-300 block">
                  {periodClicks > 0 ? Math.round((championBlock.clicks / periodClicks) * 100) : 0}%
                </span>
                <span className="text-[10px] text-slate-400">do tráfego</span>
              </div>
            </div>
          )}

          {/* Ranking Detalhado por Bloco / Link */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Desempenho Individual dos Blocos
              </h3>
              <span className="text-[11px] text-slate-500">
                {blockRanking.length} blocos monitorados
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {blockRanking.map((item, idx) => {
                const percentage =
                  periodClicks > 0
                    ? Math.round((item.clicks / periodClicks) * 100)
                    : 0;

                return (
                  <div
                    key={item.block.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-200 truncate max-w-[260px] sm:max-w-[340px]">
                          {item.title}
                        </span>
                      </div>

                      <span className="font-mono text-sky-400 font-bold text-[11px] shrink-0">
                        {item.clicks} cliques ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 && item.clicks > 0
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                            : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Breakdown Cards (Dispositivos & Origens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                Dispositivos Utilizados
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Mobile (Smartphones)</span>
                  <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded">86%</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Computador / Desktop</span>
                  <span className="font-mono text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded">12%</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tablets / iPads</span>
                  <span className="font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded">2%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                Canais de Origem (Referral)
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Instagram (Bio & Stories)</span>
                  <span className="font-mono text-pink-400 font-bold bg-slate-900 px-2 py-0.5 rounded">62%</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>WhatsApp (Grupos & Direto)</span>
                  <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded">26%</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Google / Acesso Direto</span>
                  <span className="font-mono text-sky-400 font-bold bg-slate-900 px-2 py-0.5 rounded">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Contadores</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="sm:hidden px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
