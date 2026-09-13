import React, { useState, useEffect, useId } from 'react';
import {
  Type,
  Sliders,
  Palette,
  Plus,
  Minus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  Bold,
  Italic,
  Underline,
  CaseUpper,
  Check,
  RotateCcw,
  MousePointerClick,
  Highlighter,
  MoveHorizontal,
} from 'lucide-react';
import { ProfileConfig, ProfileLineConfig, TextSegmentStyle } from '../../types';
import { getValidPickerHex } from '../../utils/colorUtils';

interface RichNameEditorProps {
  profile: ProfileConfig;
  onChange: (updated: ProfileConfig) => void;
}

export const FONT_OPTIONS = [
  { id: 'inherit', name: 'Padrão do Tema', category: 'Herança', sample: 'Tema Padrão' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'Elegante / Luxo', sample: 'Elegância Clássica' },
  { id: 'Dancing Script', name: 'Dancing Script', category: 'Caligrafia / Assinatura', sample: 'Assinatura Fluida' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond', category: 'Editorial / Nobre', sample: 'Editorial Fino' },
  { id: 'Poppins', name: 'Poppins', category: 'Geométrica Suave', sample: 'Moderno & Limpo' },
  { id: 'Outfit', name: 'Outfit', category: 'Moderna & Tech', sample: 'Design Atual' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Corporativa Premium', sample: 'Equilíbrio Visual' },
  { id: 'Cinzel', name: 'Cinzel', category: 'Monumental / Joalheria', sample: 'LUXO & ALTA CLASSE' },
  { id: 'Syne', name: 'Syne', category: 'Artística / Fashion', sample: 'Vanguardista' },
  { id: 'Montserrat', name: 'Montserrat', category: 'Imponente / Forte', sample: 'FORÇA & PRESENÇA' },
  { id: 'Inter', name: 'Inter', category: 'Minimalista & Clara', sample: 'Interface & Clean' },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Futurista', sample: 'Criatividade Tech' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'Monospaçada / Código', sample: 'mono_style' },
];

const PRESET_COMBINATIONS = [
  {
    name: 'Elegância & Especialidade',
    desc: 'Nome clássico com subtítulo em caixa alta espaçada',
    lines: [
      { text: 'Hellen Raniely', fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 'bold' as const, color: '#ffffff' },
      { text: 'ESMALTERIA & NAIL DESIGN', fontFamily: 'Outfit', fontSize: 13, fontWeight: 'semibold' as const, uppercase: true, letterSpacing: 0.15, color: '#f43f5e' },
    ],
  },
  {
    name: 'Caligrafia & Charme',
    desc: 'Nome cursivo romântico e profissão moderna',
    lines: [
      { text: 'Mayrah Beauty', fontFamily: 'Dancing Script', fontSize: 38, fontWeight: 'bold' as const, color: '#fb7185' },
      { text: 'Estética & Micropigmentação', fontFamily: 'Poppins', fontSize: 14, fontWeight: 'normal' as const, color: '#cbd5e1' },
    ],
  },
  {
    name: 'Alto Luxo & Joalheria',
    desc: 'Estilo monumental dourado e nobre',
    lines: [
      { text: 'STUDIO PRESTIGE', fontFamily: 'Cinzel', fontSize: 26, fontWeight: 'bold' as const, uppercase: true, letterSpacing: 0.1, color: '#fbbf24' },
      { text: 'Alta Estética & Cuidados Exclusivos', fontFamily: 'Cormorant Garamond', fontSize: 15, italic: true, color: '#e2e8f0' },
    ],
  },
  {
    name: 'Criador Digital / Tech',
    desc: 'Nome impactante vanguardista',
    lines: [
      { text: 'Lucas Creator', fontFamily: 'Syne', fontSize: 34, fontWeight: 'extrabold' as const, color: '#38bdf8' },
      { text: 'UI Designer & Filmmaker', fontFamily: 'JetBrains Mono', fontSize: 13, color: '#94a3b8' },
    ],
  },
];

const QUICK_COLORS = [
  { name: 'Branco Puro', hex: '#ffffff' },
  { name: 'Dourado Ouro', hex: '#fbbf24' },
  { name: 'Rosa Neon', hex: '#f43f5e' },
  { name: 'Pink Suave', hex: '#f472b6' },
  { name: 'Céu Azul', hex: '#38bdf8' },
  { name: 'Verde Esmeralda', hex: '#34d399' },
  { name: 'Violeta / Roxo', hex: '#a855f7' },
  { name: 'Âmbar Quente', hex: '#f59e0b' },
  { name: 'Cinza Prata', hex: '#94a3b8' },
  { name: 'Preto Profundo', hex: '#0f172a' },
];

export const RichNameEditor: React.FC<RichNameEditorProps> = ({ profile, onChange }) => {
  const [activeTab, setActiveTab] = useState<'lines' | 'words' | 'presets'>('lines');
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<{ lineIndex: number; wordIndex: number } | null>(null);

  // Initialize lines from profile.nameLines or fallback to profile.name
  const getInitialLines = (): ProfileLineConfig[] => {
    if (profile.nameLines && profile.nameLines.length > 0) {
      return profile.nameLines;
    }
    const rawText = profile.name || 'Nome da Empresa';
    const splitLines = rawText.split('\n').filter((l) => l.trim().length > 0);

    if (splitLines.length > 1) {
      return splitLines.map((lineText, idx) => ({
        id: `line-${idx + 1}-${Date.now()}`,
        text: lineText,
        fontFamily: idx === 0 ? (profile.nameFontFamily || 'inherit') : 'inherit',
        fontSize: idx === 0 ? (profile.nameFontSize || 28) : 14,
        fontWeight: idx === 0 ? (profile.nameFontWeight || 'bold') : 'medium',
        color: profile.nameColor || undefined,
      }));
    }

    if (profile.nameSubtitle) {
      return [
        {
          id: `line-1-${Date.now()}`,
          text: rawText,
          fontFamily: profile.nameFontFamily || 'inherit',
          fontSize: profile.nameFontSize || 28,
          fontWeight: profile.nameFontWeight || 'bold',
          color: profile.nameColor || undefined,
        },
        {
          id: `line-2-${Date.now()}`,
          text: profile.nameSubtitle,
          fontFamily: 'inherit',
          fontSize: profile.nameSubtitleFontSize || 14,
          fontWeight: 'medium',
          color: profile.nameSubtitleColor || undefined,
        },
      ];
    }

    return [
      {
        id: `line-1-${Date.now()}`,
        text: rawText,
        fontFamily: profile.nameFontFamily || 'inherit',
        fontSize: profile.nameFontSize || 28,
        fontWeight: profile.nameFontWeight || 'bold',
        color: profile.nameColor || undefined,
      },
    ];
  };

  const lines = profile.nameLines && profile.nameLines.length > 0 ? profile.nameLines : getInitialLines();

  // Sync back to ProfileConfig
  const updateLines = (newLines: ProfileLineConfig[]) => {
    // Generate concatenated string for fallback
    const fullName = newLines.map((l) => l.text).join('\n');
    onChange({
      ...profile,
      name: fullName,
      nameLines: newLines,
      // If there's a primary line, also update base props for backward compatibility
      nameFontSize: newLines[0]?.fontSize || profile.nameFontSize,
      nameFontFamily: newLines[0]?.fontFamily || profile.nameFontFamily,
      nameFontWeight: newLines[0]?.fontWeight || profile.nameFontWeight,
      nameColor: newLines[0]?.color || profile.nameColor,
    });
  };

  const handleUpdateLine = (id: string, updates: Partial<ProfileLineConfig>) => {
    const updated = lines.map((l) => (l.id === id ? { ...l, ...updates } : l));
    updateLines(updated);
  };

  const handleAddLine = () => {
    const newLine: ProfileLineConfig = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: 'Nova Frase ou Especialidade',
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 'medium',
      color: '#94a3b8',
    };
    const newLines = [...lines, newLine];
    updateLines(newLines);
    setExpandedLineId(newLine.id);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) return;
    const filtered = lines.filter((l) => l.id !== id);
    updateLines(filtered);
  };

  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= lines.length) return;
    const newLines = [...lines];
    const [moved] = newLines.splice(index, 1);
    newLines.splice(targetIdx, 0, moved);
    updateLines(newLines);
  };

  const handleApplyPreset = (preset: (typeof PRESET_COMBINATIONS)[0]) => {
    const newLines: ProfileLineConfig[] = preset.lines.map((l, idx) => ({
      id: `preset-line-${idx + 1}-${Date.now()}`,
      text: l.text,
      fontFamily: l.fontFamily,
      fontSize: l.fontSize,
      fontWeight: l.fontWeight,
      color: l.color,
      uppercase: l.uppercase,
      italic: l.italic,
      letterSpacing: l.letterSpacing,
    }));
    updateLines(newLines);
    setActiveTab('lines');
  };

  // Word-level formatting handling
  const getWordSegments = (line: ProfileLineConfig): TextSegmentStyle[] => {
    if (line.segments && line.segments.length > 0) {
      return line.segments;
    }
    const words = line.text.split(' ').filter(Boolean);
    return words.map((w, idx) => ({
      id: `seg-${idx}`,
      text: w,
      fontFamily: line.fontFamily,
      fontSize: line.fontSize,
      color: line.color,
      fontWeight: line.fontWeight,
      italic: line.italic,
      uppercase: line.uppercase,
      underline: line.underline,
      letterSpacing: line.letterSpacing,
      backgroundColor: line.backgroundColor,
    }));
  };

  const handleUpdateWordSegment = (lineIndex: number, segIndex: number, updates: Partial<TextSegmentStyle>) => {
    const line = lines[lineIndex];
    if (!line) return;
    const currentSegments = getWordSegments(line);
    const updatedSegments = currentSegments.map((s, idx) => (idx === segIndex ? { ...s, ...updates } : s));
    
    // Check if we also should update line text
    const newText = updatedSegments.map((s) => s.text).join(' ');
    const updatedLine: ProfileLineConfig = {
      ...line,
      text: newText,
      segments: updatedSegments,
    };

    const newLines = lines.map((l, idx) => (idx === lineIndex ? updatedLine : l));
    updateLines(newLines);
  };

  const handleResetWordFormatting = (lineIndex: number, segIndex: number) => {
    const line = lines[lineIndex];
    if (!line) return;
    const currentSegments = getWordSegments(line);
    const updatedSegments = currentSegments.map((s, idx) =>
      idx === segIndex
        ? {
            id: `seg-${idx}`,
            text: s.text,
            fontFamily: undefined,
            fontSize: undefined,
            color: undefined,
            fontWeight: undefined,
            italic: false,
            uppercase: false,
            underline: false,
            backgroundColor: undefined,
          }
        : s
    );
    const newLines = lines.map((l, idx) => (idx === lineIndex ? { ...line, segments: updatedSegments } : l));
    updateLines(newLines);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls & Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('lines')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'lines'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Por Frases / Linhas ({lines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('words')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'words'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Por Palavra / Trecho</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'presets'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Combinações Prontas</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddLine}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Adicionar Linha</span>
        </button>
      </div>

      {/* TAB 1: PHRASES & LINES EDITOR */}
      {activeTab === 'lines' && (
        <div className="space-y-3">
          {lines.map((line, lineIdx) => {
            const isExpanded = expandedLineId === line.id || expandedLineId === null;

            return (
              <div
                key={line.id}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                {/* Line Card Header */}
                <div className="flex items-center justify-between p-3 bg-slate-900/90 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-sky-500/30">
                      {lineIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {line.text || `Linha ${lineIdx + 1}`}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono shrink-0">
                      {line.fontSize || 24}px • {line.fontFamily && line.fontFamily !== 'inherit' ? line.fontFamily : 'Tema'}
                    </span>
                  </div>

                  {/* Ordering & Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={lineIdx === 0}
                      onClick={() => handleMoveLine(lineIdx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-800"
                      title="Mover para cima"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={lineIdx === lines.length - 1}
                      onClick={() => handleMoveLine(lineIdx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-slate-800"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10"
                        title="Remover esta frase/linha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Line Card Body */}
                <div className="p-3.5 space-y-3.5">
                  {/* 1. Text Input */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                      Texto da Frase / Linha {lineIdx + 1}
                    </label>
                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => handleUpdateLine(line.id, { text: e.target.value })}
                      placeholder={`Ex: ${lineIdx === 0 ? 'Hellen Raniely' : 'Esmalteria & Nail Designer'}`}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                    />
                  </div>

                  {/* 2. Font Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                        <Type className="w-3 h-3 text-sky-400" />
                        Fonte da Linha {lineIdx + 1}
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {line.fontFamily && line.fontFamily !== 'inherit' ? line.fontFamily : 'Padrão do Tema'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleUpdateLine(line.id, { fontFamily: f.id })}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            (line.fontFamily || 'inherit') === f.id
                              ? 'bg-sky-500/20 border-sky-500 text-sky-300 ring-1 ring-sky-500/40'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <p
                            className="text-xs font-bold truncate"
                            style={{ fontFamily: f.id !== 'inherit' ? f.id : undefined }}
                          >
                            {f.name}
                          </p>
                          <span className="text-[9px] text-slate-500 block truncate">{f.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Font Size Controls */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-sky-400" />
                        Tamanho da Frase
                      </label>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLine(line.id, { fontSize: Math.max(10, (line.fontSize || 24) - 2) })
                          }
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-sky-400 min-w-[40px] text-center">
                          {line.fontSize || 24}px
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLine(line.id, { fontSize: Math.min(56, (line.fontSize || 24) + 2) })
                          }
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {[12, 16, 22, 28, 36].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleUpdateLine(line.id, { fontSize: s })}
                          className={`py-1 rounded text-[10px] font-semibold border transition-all ${
                            (line.fontSize || 24) === s
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {s}px
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={56}
                      step={1}
                      value={line.fontSize || 24}
                      onChange={(e) => handleUpdateLine(line.id, { fontSize: parseInt(e.target.value, 10) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  {/* 4. Color & Weight & Formatting */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Line Color */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1.5">
                        Cor da Frase
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={getValidPickerHex(line.color || '#ffffff')}
                          onChange={(e) => handleUpdateLine(line.id, { color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          placeholder="Cor do tema"
                          value={line.color || ''}
                          onChange={(e) => handleUpdateLine(line.id, { color: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                        />
                        {line.color && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLine(line.id, { color: undefined })}
                            className="text-[10px] text-slate-400 hover:text-red-400 px-1.5 py-1"
                            title="Restaurar cor do tema"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Quick Color Palette */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {QUICK_COLORS.slice(0, 7).map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => handleUpdateLine(line.id, { color: c.hex })}
                            className="w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Formatting Buttons */}
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1.5">
                        Formatação Visual
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLine(line.id, {
                              fontWeight: line.fontWeight === 'bold' || line.fontWeight === 'extrabold' ? 'normal' : 'bold',
                            })
                          }
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                            line.fontWeight === 'bold' || line.fontWeight === 'extrabold'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Negrito"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() => handleUpdateLine(line.id, { italic: !line.italic })}
                          className={`p-2 rounded-lg border text-xs transition-all ${
                            line.italic
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Itálico"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>

                        {/* Uppercase */}
                        <button
                          type="button"
                          onClick={() => handleUpdateLine(line.id, { uppercase: !line.uppercase })}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                            line.uppercase
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="MAIÚSCULAS"
                        >
                          <CaseUpper className="w-3.5 h-3.5" />
                        </button>

                        {/* Underline */}
                        <button
                          type="button"
                          onClick={() => handleUpdateLine(line.id, { underline: !line.underline })}
                          className={`p-2 rounded-lg border text-xs transition-all ${
                            line.underline
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Sublinhado"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>

                        {/* Letter Spacing Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateLine(line.id, {
                              letterSpacing: line.letterSpacing ? 0 : 0.12,
                            })
                          }
                          className={`p-2 rounded-lg border text-xs transition-all ${
                            line.letterSpacing
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Espaçamento entre letras (Tracking)"
                        >
                          <MoveHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INTERACTIVE WORD-BY-WORD SELECTOR */}
      {activeTab === 'words' && (
        <div className="space-y-4 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4 text-sky-400" />
                Clique em qualquer palavra para formatar individualmente
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Altere cor, tamanho, fonte e destaques palavra por palavra.
              </p>
            </div>
            {selectedWordIndex && (
              <button
                type="button"
                onClick={() => setSelectedWordIndex(null)}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800"
              >
                Desmarcar
              </button>
            )}
          </div>

          {/* Interactive Word Chips Area */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-3 min-h-[90px]">
            {lines.map((line, lineIdx) => {
              const segments = getWordSegments(line);

              return (
                <div key={line.id} className="flex flex-wrap items-center justify-center gap-2">
                  {segments.map((seg, segIdx) => {
                    const isSelected =
                      selectedWordIndex?.lineIndex === lineIdx && selectedWordIndex?.wordIndex === segIdx;

                    return (
                      <button
                        key={`${seg.id}-${segIdx}`}
                        type="button"
                        onClick={() => setSelectedWordIndex({ lineIndex: lineIdx, wordIndex: segIdx })}
                        className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none leading-tight ${
                          isSelected
                            ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-500/25 shadow-lg scale-105'
                            : 'bg-slate-950/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                        }`}
                        style={{
                          fontFamily: seg.fontFamily && seg.fontFamily !== 'inherit' ? seg.fontFamily : undefined,
                          fontSize: seg.fontSize ? `${seg.fontSize}px` : undefined,
                          color: seg.color || undefined,
                          fontWeight: seg.fontWeight || undefined,
                          fontStyle: seg.italic ? 'italic' : 'normal',
                          textTransform: seg.uppercase ? 'uppercase' : 'none',
                          textDecoration: seg.underline ? 'underline' : 'none',
                          letterSpacing: seg.letterSpacing ? `${seg.letterSpacing}em` : undefined,
                          backgroundColor: seg.backgroundColor || undefined,
                        }}
                      >
                        {seg.text}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Word Inspector Controls when a word is selected */}
          {selectedWordIndex !== null && (() => {
            const currentLine = lines[selectedWordIndex.lineIndex];
            if (!currentLine) return null;
            const segments = getWordSegments(currentLine);
            const currentSeg = segments[selectedWordIndex.wordIndex];
            if (!currentSeg) return null;

            return (
              <div className="p-3.5 bg-slate-900 border border-sky-500/40 rounded-xl space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                      Editando Palavra
                    </span>
                    <span className="text-sm font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                      "{currentSeg.text}"
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleResetWordFormatting(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex)
                    }
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resetar Estilo da Palavra</span>
                  </button>
                </div>

                {/* 1. Word Font Size */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-sky-400" />
                      Tamanho desta Palavra
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            fontSize: Math.max(10, (currentSeg.fontSize || currentLine.fontSize || 24) - 2),
                          })
                        }
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-sky-400 min-w-[36px] text-center">
                        {currentSeg.fontSize || currentLine.fontSize || 24}px
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            fontSize: Math.min(56, (currentSeg.fontSize || currentLine.fontSize || 24) + 2),
                          })
                        }
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={10}
                    max={56}
                    step={1}
                    value={currentSeg.fontSize || currentLine.fontSize || 24}
                    onChange={(e) =>
                      handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                        fontSize: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* 2. Word Font Family */}
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Fonte desta Palavra
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            fontFamily: f.id,
                          })
                        }
                        className={`p-1.5 rounded-lg border text-left text-xs transition-all ${
                          (currentSeg.fontFamily || currentLine.fontFamily || 'inherit') === f.id
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span style={{ fontFamily: f.id !== 'inherit' ? f.id : undefined }}>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Word Color & Formatting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  {/* Color */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                      Cor desta Palavra
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={getValidPickerHex(currentSeg.color || currentLine.color || '#ffffff')}
                        onChange={(e) =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            color: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                      />
                      <div className="flex flex-wrap gap-1">
                        {QUICK_COLORS.slice(0, 6).map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() =>
                              handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                                color: c.hex,
                              })
                            }
                            className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Formatting Buttons */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                      Formatação
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            fontWeight: currentSeg.fontWeight === 'bold' ? 'normal' : 'bold',
                          })
                        }
                        className={`p-1.5 rounded-lg border text-xs font-bold ${
                          currentSeg.fontWeight === 'bold'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            italic: !currentSeg.italic,
                          })
                        }
                        className={`p-1.5 rounded-lg border text-xs ${
                          currentSeg.italic
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            uppercase: !currentSeg.uppercase,
                          })
                        }
                        className={`p-1.5 rounded-lg border text-xs font-bold ${
                          currentSeg.uppercase
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CaseUpper className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            underline: !currentSeg.underline,
                          })
                        }
                        className={`p-1.5 rounded-lg border text-xs ${
                          currentSeg.underline
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateWordSegment(selectedWordIndex.lineIndex, selectedWordIndex.wordIndex, {
                            backgroundColor: currentSeg.backgroundColor ? undefined : '#f43f5e25',
                          })
                        }
                        className={`p-1.5 rounded-lg border text-xs ${
                          currentSeg.backgroundColor
                            ? 'bg-rose-500/30 text-rose-300 border-rose-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                        title="Destaque / Fundo"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Selecione uma combinação tipográfica de alta conversão para aplicar instantaneamente:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_COMBINATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 text-left transition-all group hover:shadow-md hover:shadow-sky-500/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {preset.name}
                  </h4>
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Aplicar
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">{preset.desc}</p>

                {/* Mini Preview */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1 text-center">
                  {preset.lines.map((l, lIdx) => (
                    <div
                      key={lIdx}
                      style={{
                        fontFamily: l.fontFamily,
                        fontSize: `${Math.min(l.fontSize, 18)}px`,
                        fontWeight: l.fontWeight === 'extrabold' ? 800 : l.fontWeight === 'bold' ? 700 : 500,
                        color: l.color,
                        fontStyle: l.italic ? 'italic' : 'normal',
                        textTransform: l.uppercase ? 'uppercase' : 'none',
                        letterSpacing: l.letterSpacing ? `${l.letterSpacing}em` : undefined,
                      }}
                      className="truncate"
                    >
                      {l.text}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
