import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContentBlock, BlockType } from '../../types';
import { BlockItemEditor } from './BlockItemEditor';
import { Tooltip } from '../common/Tooltip';
import {
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  GripVertical,
} from 'lucide-react';

interface SortableBlockItemProps {
  key?: React.Key;
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  isExpanded: boolean;
  catalogItem?: {
    type: BlockType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  };
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdate: (updated: ContentBlock) => void;
  siteId?: string;
}

export function SortableBlockItem({
  block,
  index,
  totalBlocks,
  isExpanded,
  catalogItem,
  onToggleExpand,
  onToggleStatus,
  onMove,
  onDuplicate,
  onDelete,
  onUpdate,
  siteId,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = catalogItem?.icon || LinkIcon;
  const isDraft = !block.enabled || block.status === 'draft';

  // Block title preview
  let blockTitlePreview = 'Bloco';
  if ('title' in block && block.title) blockTitlePreview = block.title;
  else if (block.type === 'bento') blockTitlePreview = 'Grid Bento';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all duration-200 ${
        isDragging
          ? 'opacity-40 border-dashed border-sky-400/80 bg-sky-950/20 scale-[0.98] shadow-inner'
          : !isDraft
          ? isExpanded
            ? 'bg-slate-900/90 border-sky-500/50 shadow-xl ring-1 ring-sky-500/20'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          : 'bg-slate-950/60 border-dashed border-slate-800/60 opacity-60'
      }`}
    >
      {/* Accordion Summary Row */}
      <div className="p-3 flex items-center justify-between gap-2">
        {/* Left Drag Handle */}
        <Tooltip content="Segure e arraste para reordenar este bloco">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-slate-800/80 cursor-grab active:cursor-grabbing transition-colors shrink-0 touch-none"
            aria-label="Arrastar para reordenar bloco"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Clickable Header Info */}
        <div
          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
          onClick={onToggleExpand}
        >
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
              !isDraft
                ? 'bg-slate-950 border-slate-800 text-sky-400'
                : 'bg-slate-900 border-slate-800 text-amber-400'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-100 truncate max-w-[180px] sm:max-w-xs">
                {blockTitlePreview}
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                {catalogItem?.label || block.type}
              </span>
              {isDraft ? (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Rascunho
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Publicado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip
            content={
              !isDraft
                ? 'Ocultar bloco (Mudar para Rascunho sem excluir)'
                : 'Publicar bloco (Tornar visível na página)'
            }
          >
            <button
              type="button"
              onClick={onToggleStatus}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label={!isDraft ? 'Mudar para Rascunho' : 'Publicar na página'}
            >
              {!isDraft ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Mover para cima">
            <button
              type="button"
              onClick={() => onMove('up')}
              disabled={index === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20"
              aria-label="Mover para cima"
            >
              <MoveUp className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Mover para baixo">
            <button
              type="button"
              onClick={() => onMove('down')}
              disabled={index === totalBlocks - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20"
              aria-label="Mover para baixo"
            >
              <MoveDown className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Duplicar bloco com as mesmas configurações">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              aria-label="Duplicar bloco"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Excluir este bloco permanentemente">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              aria-label="Excluir bloco"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={isExpanded ? 'Recolher configurações' : 'Expandir e editar configurações'}>
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              aria-label={isExpanded ? 'Recolher' : 'Expandir'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-sky-400" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isExpanded && (
        <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 rounded-b-2xl">
          <BlockItemEditor
            block={block}
            onChange={onUpdate}
            siteId={siteId}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Floating preview of the dragged block rendered in DragOverlay
 */
export function BlockDragOverlayPreview({
  block,
  catalogItem,
}: {
  block: ContentBlock;
  catalogItem?: {
    type: BlockType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  };
}) {
  const Icon = catalogItem?.icon || LinkIcon;
  const isDraft = !block.enabled || block.status === 'draft';

  let blockTitlePreview = 'Bloco';
  if ('title' in block && block.title) blockTitlePreview = block.title;
  else if (block.type === 'bento') blockTitlePreview = 'Grid Bento';

  return (
    <div className="p-3 rounded-2xl border-2 border-sky-400 bg-slate-900 shadow-2xl shadow-sky-500/30 flex items-center justify-between gap-2.5 w-full cursor-grabbing select-none rotate-1 opacity-95">
      <div className="p-1.5 -ml-1 text-sky-400">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div
          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
            !isDraft
              ? 'bg-slate-950 border-slate-800 text-sky-400'
              : 'bg-slate-900 border-slate-800 text-amber-400'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100 truncate">
              {blockTitlePreview}
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
              {catalogItem?.label || block.type}
            </span>
          </div>
        </div>
      </div>

      <span className="text-xs font-bold text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-400/30">
        Movendo...
      </span>
    </div>
  );
}
