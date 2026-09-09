import React, { useState, useEffect } from 'react';
import { Edit2, X } from 'lucide-react';
import { StorageItem } from '../types';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StorageItem | null;
  onRename: (id: string, newName: string) => Promise<void>;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  item,
  onRename,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setError(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a valid name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRename(item.id, name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to rename item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="rename-modal-overlay" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Rename {item.type === 'folder' ? 'Folder' : 'File'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Name</label>
            <input
              id="input-rename-item"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {error && <div className="text-xs text-rose-600">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-rename"
              type="submit"
              disabled={loading || !name.trim() || name === item.name}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
