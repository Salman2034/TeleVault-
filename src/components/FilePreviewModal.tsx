import React, { useState, useEffect } from 'react';
import {
  X, Download, Share2, Trash2, Copy, Check, FileText, Image as ImageIcon,
  Film, Music, Code, Archive, ExternalLink, Send, ShieldCheck, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';
import { StorageItem } from '../types';
import { formatBytes, formatDate, getFileCategory } from '../utils/formatters';

interface FilePreviewModalProps {
  item: StorageItem | null;
  onClose: () => void;
  onDelete: (item: StorageItem) => void;
  onShare: (item: StorageItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  item,
  onClose,
  onDelete,
  onShare,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [copiedFileId, setCopiedFileId] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!item) {
      setTextContent(null);
      return;
    }

    setZoom(100);
    setRotation(0);

    const category = getFileCategory(item.mimeType, item.extension);
    if (category === 'code' || category === 'document' || item.extension === 'txt' || item.extension === 'md' || item.extension === 'json') {
      setLoadingText(true);
      fetch(`/api/files/${item.id}/stream`)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setLoadingText(false);
        })
        .catch(() => {
          setTextContent('Unable to load preview content.');
          setLoadingText(false);
        });
    } else {
      setTextContent(null);
    }
  }, [item]);

  if (!item) return null;

  const category = getFileCategory(item.mimeType, item.extension);
  const streamUrl = `/api/files/${item.id}/stream`;
  const downloadUrl = `/api/files/${item.id}/download`;

  const copyFileId = () => {
    if (item.telegramFileId) {
      navigator.clipboard.writeText(item.telegramFileId);
      setCopiedFileId(true);
      setTimeout(() => setCopiedFileId(false), 2000);
    }
  };

  return (
    <div id="file-preview-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-2 sm:p-6 overflow-hidden">
      <div id="file-preview-modal-card" className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-1 sm:pr-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200/80 flex items-center justify-center shrink-0">
              {category === 'image' && <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
              {category === 'video' && <Film className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />}
              {category === 'audio' && <Music className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />}
              {category === 'code' && <Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
              {category === 'pdf' && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />}
              {category === 'document' && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
              {category === 'archive' && <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />}
              {category === 'other' && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-semibold text-slate-900 truncate" title={item.name}>
                {item.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
                <span>{formatBytes(item.size)}</span>
                <span>•</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              id="btn-preview-download"
              href={downloadUrl}
              download={item.name}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              id="btn-preview-share"
              onClick={() => onShare(item)}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Share File"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              id="btn-preview-delete"
              onClick={() => onDelete(item)}
              className="p-1.5 sm:p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete File"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="btn-preview-close"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors ml-0.5"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Preview Stage & Metadata Inspector */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Stage (Left) */}
          <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative select-none">
            {category === 'image' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
                  <img
                    src={streamUrl}
                    alt={item.name}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    }}
                  />
                </div>

                {/* Image controls toolbar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-3 text-slate-300 text-xs shadow-xl">
                  <button
                    onClick={() => setZoom((z) => Math.max(25, z - 25))}
                    className="hover:text-white p-1"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] w-10 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(300, z + 25))}
                    className="hover:text-white p-1"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-3.5 bg-slate-700" />
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="hover:text-white p-1"
                    title="Rotate 90deg"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {category === 'video' && (
              <div className="w-full max-w-3xl flex flex-col items-center">
                <video
                  src={streamUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[65vh] rounded-xl shadow-2xl bg-black"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {category === 'audio' && (
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Music className="w-10 h-10 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-semibold truncate text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Audio Stream • {formatBytes(item.size)}</p>
                </div>
                <audio src={streamUrl} controls className="w-full" autoPlay>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {(category === 'code' || category === 'document') && (
              <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden flex flex-col border border-slate-800">
                <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Preview: {item.name}</span>
                  <button
                    onClick={() => {
                      if (textContent) {
                        navigator.clipboard.writeText(textContent);
                      }
                    }}
                    className="hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> Copy Text
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-sky-800">
                  {loadingText ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Loading file content...
                    </div>
                  ) : (
                    textContent || 'Empty or binary document. Use Download button to inspect.'
                  )}
                </div>
              </div>
            )}

            {category === 'pdf' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <iframe
                  src={streamUrl}
                  title={item.name}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              </div>
            )}

            {(category === 'archive' || category === 'other') && (
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Archive className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct in-browser preview not available for this format.
                  </p>
                </div>
                <a
                  href={downloadUrl}
                  download={item.name}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" /> Download to view
                </a>
              </div>
            )}
          </div>

          {/* Metadata Inspector (Right Sidebar) */}
          <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-5 overflow-y-auto space-y-5 shrink-0">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telegram Cloud Metadata</h3>
              <p className="text-xs text-slate-500 mt-0.5">Permanent hosting attributes</p>
            </div>

            {/* Telegram Hosting Card */}
            <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-950">
                <Send className="w-3.5 h-3.5 text-sky-600 -rotate-12" />
                <span>Hosted on Telegram CDN</span>
              </div>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                Stored permanently with zero expiration. Safe from server crashes or disk wipes.
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">File Name</span>
                <span className="font-medium text-slate-800 break-all">{item.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Size</span>
                <span className="font-semibold text-slate-800">{formatBytes(item.size)}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">MIME Type</span>
                <span className="font-mono text-slate-700">{item.mimeType || 'application/octet-stream'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Uploaded At</span>
                <span className="text-slate-700">{formatDate(item.createdAt)}</span>
              </div>

              {item.storageProtocol && (
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Storage Protocol</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold mt-0.5 ${
                    item.storageProtocol === 'mtproto'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      : 'bg-sky-100 text-sky-900 border border-sky-200'
                  }`}>
                    {item.storageProtocol === 'mtproto' ? '⚡ MTProto (2 GB Limit)' : 'Telegram Bot API (50 MB)'}
                  </span>
                </div>
              )}

              {item.telegramFileId && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-medium">Telegram File ID</span>
                    <button
                      onClick={copyFileId}
                      className="text-sky-600 hover:text-sky-700 flex items-center gap-1 text-[11px]"
                    >
                      {copiedFileId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFileId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="mt-1 p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600 break-all select-all">
                    {item.telegramFileId}
                  </div>
                </div>
              )}

              {item.telegramMessageId && (
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Telegram Message ID</span>
                  <span className="font-mono text-slate-700">#{item.telegramMessageId}</span>
                </div>
              )}

              {item.isDemo && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  Uploaded in Demo/Sandbox mode.
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <button
                onClick={() => onShare(item)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Get Shareable Link</span>
              </button>

              <a
                href={downloadUrl}
                download={item.name}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
