import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, X, Send, Download, Link2 } from 'lucide-react';
import { StorageItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StorageItem | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !item) return null;

  const downloadUrl = `${window.location.origin}/api/files/${item.id}/download`;
  const streamUrl = `${window.location.origin}/api/files/${item.id}/stream`;

  const copyToClipboard = (text: string, isId = false) => {
    navigator.clipboard.writeText(text);
    if (isId) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div id="share-modal-overlay" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Share File</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{formatBytes(item.size)} • Hosted on Telegram</p>
          </div>

          {/* Direct Download Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Direct Download Link</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Streams straight from Telegram</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={downloadUrl}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200 select-all"
              />
              <button
                onClick={() => copyToClipboard(downloadUrl)}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Telegram File ID */}
          {item.telegramFileId && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 -rotate-12" />
                <span>Telegram Bot File ID</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={item.telegramFileId}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200 select-all"
                />
                <button
                  onClick={() => copyToClipboard(item.telegramFileId!, true)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                Can be accessed via any bot using the Telegram Bot API getFile method.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
