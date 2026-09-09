import React, { useState } from 'react';
import { Folder, FolderSymlink, Home, X, Check } from 'lucide-react';
import { StorageItem } from '../types';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StorageItem[] | null;
  folders: StorageItem[];
  onMove: (itemIds: string[], newParentId: string | null) => Promise<void>;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  items,
  folders,
  onMove,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !items || items.length === 0) return null;

  const isSingle = items.length === 1;
  const singleItem = items[0];

  // Get all descendant folder IDs for any folder in items to avoid cyclic hierarchy
  const getItemFolderIds = new Set<string>(items.filter((i) => i.type === 'folder').map((i) => i.id));
  const getDescendantFolderIds = (parentIds: Set<string>): Set<string> => {
    const descendants = new Set<string>();
    let currentLevel = Array.from(parentIds);
    while (currentLevel.length > 0) {
      const nextLevel: string[] = [];
      for (const f of folders) {
        if (f.parentId && currentLevel.includes(f.parentId) && !descendants.has(f.id)) {
          descendants.add(f.id);
          nextLevel.push(f.id);
        }
      }
      currentLevel = nextLevel;
    }
    return descendants;
  };

  const forbiddenFolderIds = new Set([...getItemFolderIds, ...getDescendantFolderIds(getItemFolderIds)]);
  const availableFolders = folders.filter((f) => !forbiddenFolderIds.has(f.id));

  // Determine if all items are already at selectedFolderId
  const allAlreadyThere = items.every((i) => (i.parentId || null) === selectedFolderId);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onMove(
        items.map((i) => i.id),
        selectedFolderId
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to move items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="move-modal-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4"
    >
      <div
        id="move-modal-card"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
              <FolderSymlink className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isSingle ? `Move "${singleItem.name}"` : `Move ${items.length} Selected Items`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Select target destination folder</p>
            </div>
          </div>
          <button
            id="btn-close-move-modal"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300">Choose where to move the selected items:</p>

          <div className="max-h-60 overflow-y-auto space-y-1 rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-850 dark:bg-slate-800/40">
            {/* Drive Root */}
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                selectedFolderId === null
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 shadow-2xs font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Drive Root (Top level)</span>
              </div>
              {selectedFolderId === null && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
            </button>

            {availableFolders.map((f) => {
              const isSelected = selectedFolderId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 shadow-2xs font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              id="btn-cancel-move"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-move"
              type="button"
              onClick={handleConfirm}
              disabled={loading || allAlreadyThere}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FolderSymlink className="w-3.5 h-3.5" />
              <span>{loading ? 'Moving...' : allAlreadyThere ? 'Already in this folder' : 'Move Here'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
