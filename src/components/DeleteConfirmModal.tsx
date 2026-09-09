import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, FileText, Folder, CheckCircle2 } from 'lucide-react';
import { StorageItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StorageItem[] | null;
  onConfirm: (items: StorageItem[]) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  items,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !items || items.length === 0) return null;

  const isSingle = items.length === 1;
  const singleItem = items[0];
  const fileCount = items.filter((i) => i.type === 'file').length;
  const folderCount = items.filter((i) => i.type === 'folder').length;
  const totalBytes = items.reduce((acc, i) => acc + (i.size || 0), 0);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(items);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="delete-confirm-modal-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4"
    >
      <div
        id="delete-confirm-modal-card"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-950/60 flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isSingle
                  ? `Delete ${singleItem.type === 'folder' ? 'Folder' : 'File'}`
                  : `Delete ${items.length} Selected Items`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Permanent removal confirmation</p>
            </div>
          </div>
          <button
            id="btn-close-delete-modal"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {isSingle ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-slate-900 dark:text-white break-all">"{singleItem.name}"</span>?
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  {singleItem.type === 'folder' ? (
                    <Folder className="w-4 h-4 text-amber-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{singleItem.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {singleItem.type === 'folder' ? 'Folder' : formatBytes(singleItem.size)}
                  </p>
                </div>
              </div>

              {singleItem.type === 'folder' && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Deleting this folder will recursively delete all files and subfolders contained inside it.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete these{' '}
                <strong className="text-slate-900 dark:text-white">{items.length} items</strong>?
              </p>

              {/* Breakdown Pill */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                {fileCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-medium border border-sky-100 dark:border-sky-800">
                    {fileCount} {fileCount === 1 ? 'file' : 'files'} ({formatBytes(totalBytes)})
                  </span>
                )}
                {folderCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium border border-amber-100 dark:border-amber-800">
                    {folderCount} {folderCount === 1 ? 'folder' : 'folders'}
                  </span>
                )}
              </div>

              {/* List of items */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-850 dark:bg-slate-800/40">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                  >
                    {it.type === 'folder' ? (
                      <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    )}
                    <span className="truncate flex-1 font-medium text-slate-700 dark:text-slate-200">{it.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      {it.type === 'folder' ? 'Folder' : formatBytes(it.size)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 text-[11px] text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>
                  All selected files and folders will be deleted from your drive and Telegram channel storage.
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              id="btn-cancel-delete"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete"
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {loading
                  ? 'Deleting...'
                  : isSingle
                  ? 'Delete Permanently'
                  : `Delete ${items.length} Items`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
