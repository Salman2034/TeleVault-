import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, X, Loader2, Send } from 'lucide-react';
import { UploadQueueItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface UploadQueueProps {
  queue: UploadQueueItem[];
  onDismissItem: (id: string) => void;
  onClearCompleted: () => void;
}

export const UploadQueue: React.FC<UploadQueueProps> = ({
  queue,
  onDismissItem,
  onClearCompleted,
}) => {
  const [minimized, setMinimized] = useState(false);

  if (queue.length === 0) return null;

  const uploadingCount = queue.filter((i) => i.status === 'uploading' || i.status === 'pending').length;
  const completedCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div id="upload-queue-container" className="fixed bottom-5 right-5 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          {uploadingCount > 0 ? (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-xs font-semibold">
            {uploadingCount > 0 ? `Uploading to Telegram (${uploadingCount})` : `Uploads complete (${completedCount})`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {uploadingCount === 0 && (
            <button
              onClick={onClearCompleted}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Item List */}
      {!minimized && (
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-2">
          {queue.map((item) => (
            <div key={item.id} className="p-2.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-800 truncate" title={item.name}>
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{formatBytes(item.size)}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    item.status === 'error'
                      ? 'bg-rose-500'
                      : item.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1">
                  {item.status === 'uploading' && (
                    <span className="text-sky-600 font-medium flex items-center gap-1">
                      <Send className="w-3 h-3 -rotate-12 animate-pulse" /> Sending to Telegram CDN... {item.progress}%
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Stored in Telegram
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {item.errorMessage || 'Upload failed'}
                    </span>
                  )}
                  {item.status === 'pending' && <span className="text-slate-400">Waiting in queue...</span>}
                </span>

                <button
                  onClick={() => onDismissItem(item.id)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
