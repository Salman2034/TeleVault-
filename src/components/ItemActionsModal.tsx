import React from 'react';
import {
  X, Eye, Download, Share2, FolderSymlink, Edit2, Trash2,
  Folder, Send, CheckSquare, Square, Check
} from 'lucide-react';
import { StorageItem } from '../types';
import { formatBytes, formatDate, getFileCategory } from '../utils/formatters';

interface ItemActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StorageItem | null;
  isSelected: boolean;
  onToggleSelect: (item: StorageItem) => void;
  onPreview: (item: StorageItem) => void;
  onDownload: (item: StorageItem) => void;
  onShare: (item: StorageItem) => void;
  onMove: (item: StorageItem) => void;
  onRename: (item: StorageItem) => void;
  onDelete: (item: StorageItem) => void;
  onOpenFolder?: (folderId: string) => void;
  renderFileIcon: (item: StorageItem) => React.ReactNode;
}

export const ItemActionsModal: React.FC<ItemActionsModalProps> = ({
  isOpen,
  onClose,
  item,
  isSelected,
  onToggleSelect,
  onPreview,
  onDownload,
  onShare,
  onMove,
  onRename,
  onDelete,
  onOpenFolder,
  renderFileIcon,
}) => {
  if (!isOpen || !item) return null;

  const isFolder = item.type === 'folder';
  const category = !isFolder ? getFileCategory(item.mimeType, item.extension) : null;
  const isImage = category === 'image';
  const streamUrl = !isFolder ? `/api/files/${item.id}/stream` : '';

  return (
    <div
      id="item-actions-modal-overlay"
      className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="item-actions-modal-card"
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header with Item Summary */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
              {isFolder ? (
                <Folder className="w-6 h-6 text-amber-500 fill-amber-500/20" />
              ) : isImage ? (
                <img src={streamUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                renderFileIcon(item)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 truncate" title={item.name}>
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                {isFolder ? (
                  <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                    Folder
                  </span>
                ) : (
                  <>
                    <span className="font-medium">{formatBytes(item.size)}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5 text-sky-700 font-medium">
                      <Send className="w-2.5 h-2.5 -rotate-12" /> Telegram CDN
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-1.5">
          {/* Select / Deselect Action */}
          <button
            type="button"
            onClick={() => {
              onToggleSelect(item);
            }}
            className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer border ${
              isSelected
                ? 'bg-sky-50 border-sky-200 text-sky-900 font-semibold'
                : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'bg-white border-slate-300'
                }`}
              >
                <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'block' : 'opacity-0'}`} />
              </div>
              <div>
                <span className="text-xs font-semibold block">
                  {isSelected ? 'Deselect Item' : 'Select Item'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {isSelected ? 'Currently in bulk selection' : 'Add to selection for bulk move or delete'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-sky-600">
              {isSelected ? 'Selected' : 'Tap to select'}
            </span>
          </button>

          {/* Primary Action: Preview or Open Folder */}
          {isFolder ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFolder?.(item.id);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Folder className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div>Open Folder</div>
                <div className="text-[11px] font-normal text-slate-500">View contents inside this folder</div>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPreview(item);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div>Preview File</div>
                <div className="text-[11px] font-normal text-slate-500">Inspect contents, stream, and view details</div>
              </div>
            </button>
          )}

          {/* Download (Files only) */}
          {!isFolder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDownload(item);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div>Download File</div>
                <div className="text-[11px] font-normal text-slate-500">Stream original file to your device</div>
              </div>
            </button>
          )}

          {/* Share Link (Files only) */}
          {!isFolder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onShare(item);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div>Share File Link</div>
                <div className="text-[11px] font-normal text-slate-500">Direct streaming and download links</div>
              </div>
            </button>
          )}

          {/* Move to Folder */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onMove(item);
            }}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FolderSymlink className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div>Move...</div>
              <div className="text-[11px] font-normal text-slate-500">Relocate to root or another folder</div>
            </div>
          </button>

          {/* Rename */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onRename(item);
            }}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Edit2 className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div>Rename</div>
              <div className="text-[11px] font-normal text-slate-500">Change name of this item</div>
            </div>
          </button>

          {/* Delete (Permanently) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(item);
            }}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100 mt-1"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div>Delete Permanently</div>
              <div className="text-[11px] font-normal text-rose-500/90">
                {isFolder
                  ? 'Delete folder and all enclosed files'
                  : 'Remove from storage and delete from Telegram'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
