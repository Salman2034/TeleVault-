/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  FolderPlus,
  Upload,
  RefreshCw,
  Settings,
  CheckCircle2,
  Home,
  Heart,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StorageStatsBar } from './components/StorageStatsBar';
import { FileBrowser } from './components/FileBrowser';
import { TelegramConfigModal } from './components/TelegramConfigModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { RenameModal } from './components/RenameModal';
import { MoveModal } from './components/MoveModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ShareModal } from './components/ShareModal';
import { UploadQueue } from './components/UploadQueue';
import { StartupLoadingScreen } from './components/StartupLoadingScreen';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  StorageItem,
  TelegramConfig,
  StorageStats,
  FileCategory,
  ViewMode,
  UploadQueueItem,
} from './types';

export default function App() {
  // Theme state with local persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('televault_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('televault_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Loading & Splash state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  // State
  const [items, setItems] = useState<StorageItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<StorageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);
  const [renameItem, setRenameItem] = useState<StorageItem | null>(null);
  const [moveItems, setMoveItems] = useState<StorageItem[] | null>(null);
  const [deleteTargetItems, setDeleteTargetItems] = useState<StorageItem[] | null>(null);
  const [shareItem, setShareItem] = useState<StorageItem | null>(null);
  const [allFolders, setAllFolders] = useState<StorageItem[]>([]);

  // Fetch Telegram configuration status
  const fetchTelegramStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setTelegramConfig({
          botToken: '',
          chatId: data.chatId || '',
          apiId: data.apiId || '',
          protocol: data.protocol || 'bot_api',
          isConfigured: data.configured,
          botUsername: data.botUsername,
          botFirstName: data.botFirstName,
          chatTitle: data.chatTitle,
          isDemoMode: data.isDemoMode,
          mtprotoConnected: data.mtprotoConnected,
          maxFileSizeBytes: data.maxFileSizeBytes || (data.protocol === 'mtproto' ? 2048 * 1024 * 1024 : 50 * 1024 * 1024),
          maxFileSizeLabel: data.maxFileSizeLabel || (data.protocol === 'mtproto' ? '2 GB (MTProto)' : '50 MB (Bot API)'),
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch storage statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/storage/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch files and folder items
  const fetchItems = useCallback(async () => {
    try {
      let url = '/api/files?';
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      } else {
        params.append('folderId', currentFolderId || 'root');
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      url += params.toString();
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // ignore
    }
  }, [currentFolderId, searchQuery, selectedCategory]);

  // Fetch all folders for move dialog
  const fetchAllFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        const folders = (data.items || []).filter((i: StorageItem) => i.type === 'folder');
        setAllFolders(folders);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initApp = async () => {
      await Promise.allSettled([
        fetchTelegramStatus(),
        fetchStats(),
        fetchAllFolders(),
        fetchItems(),
      ]);
      setIsDataReady(true);
    };
    initApp();
  }, [fetchTelegramStatus, fetchStats, fetchAllFolders, fetchItems]);

  // Refresh items on changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Update folder breadcrumb path
  useEffect(() => {
    if (!currentFolderId) {
      setFolderPath([]);
      return;
    }

    // Resolve breadcrumbs recursively from allFolders
    const buildPath = (id: string | null): StorageItem[] => {
      if (!id) return [];
      const found = allFolders.find((f) => f.id === id);
      if (!found) return [];
      return [...buildPath(found.parentId), found];
    };

    setFolderPath(buildPath(currentFolderId));
  }, [currentFolderId, allFolders]);

  // Upload handler with progress tracking
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Check size limit: 2GB (2,048MB) for MTProto / Sandbox, 50MB for standard Bot API
    const isMTProto = telegramConfig?.protocol === 'mtproto';
    const maxLimitBytes = isMTProto || telegramConfig?.isDemoMode ? 2048 * 1024 * 1024 : 50 * 1024 * 1024;
    const oversizedFiles = fileArray.filter((f) => f.size > maxLimitBytes);

    if (oversizedFiles.length > 0) {
      const fileName = oversizedFiles[0].name;
      const fileSizeMB = (oversizedFiles[0].size / (1024 * 1024)).toFixed(1);
      if (!isMTProto && !telegramConfig?.isDemoMode) {
        alert(
          `The file "${fileName}" (${fileSizeMB} MB) exceeds the 50 MB limit of the standard Telegram Bot API.\n\nTo upload files up to 2 GB, switch to the MTProto Client protocol in Telegram Settings!`
        );
      } else {
        alert(`The file "${fileName}" (${fileSizeMB} MB) exceeds the 2 GB maximum file limit allowed by Telegram MTProto.`);
      }
      return;
    }

    const newQueueItems: UploadQueueItem[] = fileArray.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      size: file.size,
      progress: 10,
      status: 'pending',
    }));

    setUploadQueue((prev) => [...newQueueItems, ...prev]);

    // Process each upload sequentially
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const queueItem = newQueueItems[i];

      setUploadQueue((prev) =>
        prev.map((item) => (item.id === queueItem.id ? { ...item, status: 'uploading', progress: 30 } : item))
      );

      const formData = new FormData();
      formData.append('file', file);
      if (currentFolderId) {
        formData.append('parentId', currentFolderId);
      }

      try {
        setUploadQueue((prev) =>
          prev.map((item) => (item.id === queueItem.id ? { ...item, progress: 65 } : item))
        );

        const res = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, status: 'completed', progress: 100 } : item
          )
        );
      } catch (err: any) {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id
              ? { ...item, status: 'error', progress: 100, errorMessage: err.message || 'Failed' }
              : item
          )
        );
      }
    }

    // Refresh directory and stats after upload batch finishes
    fetchItems();
    fetchStats();
    fetchAllFolders();
  };

  // Create folder
  const handleCreateFolder = async (name: string) => {
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        parentId: currentFolderId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create folder');
    }

    fetchItems();
    fetchStats();
    fetchAllFolders();
  };

  // Rename item
  const handleRenameItem = async (id: string, newName: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to rename item');
    }

    fetchItems();
    fetchAllFolders();
  };

  // Move item (single or bulk trigger)
  const handleMoveItem = (item: StorageItem) => {
    setMoveItems([item]);
  };

  const handleBulkMove = (itemsToMove: StorageItem[]) => {
    setMoveItems(itemsToMove);
  };

  const handleConfirmMove = async (itemIds: string[], newParentId: string | null) => {
    if (itemIds.length === 1) {
      const res = await fetch(`/api/files/${itemIds[0]}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: newParentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to move item');
      }
    } else {
      const res = await fetch('/api/files/bulk-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: itemIds, parentId: newParentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to move items');
      }
    }

    await fetchItems();
    await fetchAllFolders();
    setSyncFeedback(
      itemIds.length === 1
        ? 'Item moved successfully'
        : `Moved ${itemIds.length} items successfully`
    );
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Delete item (single or bulk trigger - opens DeleteConfirmModal)
  const handleDeleteItem = (item: StorageItem) => {
    setDeleteTargetItems([item]);
  };

  const handleBulkDelete = (itemsToDelete: StorageItem[]) => {
    setDeleteTargetItems(itemsToDelete);
  };

  const handleConfirmDelete = async (itemsToDelete: StorageItem[]) => {
    const ids = itemsToDelete.map((i) => i.id);
    let res;
    if (ids.length === 1) {
      res = await fetch(`/api/files/${ids[0]}`, { method: 'DELETE' });
    } else {
      res = await fetch('/api/files/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete selected item(s)');
    }

    if (previewItem && ids.includes(previewItem.id)) {
      setPreviewItem(null);
    }

    await fetchItems();
    await fetchStats();
    await fetchAllFolders();

    setSyncFeedback(
      ids.length === 1
        ? `Deleted "${itemsToDelete[0].name}" successfully`
        : `Deleted ${ids.length} items successfully`
    );
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Download item
  const handleDownloadFile = (item: StorageItem) => {
    const link = document.createElement('a');
    link.href = `/api/files/${item.id}/download`;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cross-device Telegram channel sync
  const handleSyncTelegram = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/telegram/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync with Telegram channel');
      }

      await fetchItems();
      await fetchStats();
      await fetchAllFolders();
      await fetchTelegramStatus();

      setSyncFeedback(
        data.message || `Successfully synced ${data.restoredItems || 0} items from Telegram channel!`
      );
      setTimeout(() => setSyncFeedback(null), 4500);
    } catch (err: any) {
      alert(err.message || 'Error syncing with Telegram channel');
    } finally {
      setIsSyncing(false);
    }
  }, [fetchItems, fetchStats, fetchAllFolders, fetchTelegramStatus]);

  // Current folder name for modal
  const currentFolderName = folderPath.length > 0 ? folderPath[folderPath.length - 1].name : 'Root Drive';

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Toast Notification for Sync & Success */}
      {syncFeedback && (
        <div
          id="sync-feedback-toast"
          className="fixed top-20 right-4 sm:right-6 z-50 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700 dark:border-slate-600 animate-in slide-in-from-top duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        telegramConfig={telegramConfig}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenUpload={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.click();
        }}
        onOpenNewFolder={() => setIsNewFolderOpen(true)}
        onSyncTelegram={handleSyncTelegram}
        isSyncing={isSyncing}
        totalFiles={stats?.totalFiles || 0}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* PWA Promotion & Quick Install Banner */}
      <PWAInstallBanner onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Storage Stats and Category Filters */}
        <StorageStatsBar
          stats={stats}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          telegramConfig={telegramConfig}
          onOpenConfig={() => setIsConfigOpen(true)}
          onSyncTelegram={handleSyncTelegram}
          isSyncing={isSyncing}
        />

        {/* File Browser Component */}
        <FileBrowser
          items={items}
          currentFolderId={currentFolderId}
          folderPath={folderPath}
          onNavigateFolder={(fId) => setCurrentFolderId(fId)}
          onPreviewFile={(item) => setPreviewItem(item)}
          onDownloadFile={handleDownloadFile}
          onShareFile={(item) => setShareItem(item)}
          onRenameItem={(item) => setRenameItem(item)}
          onMoveItem={handleMoveItem}
          onDeleteItem={handleDeleteItem}
          onBulkMove={handleBulkMove}
          onBulkDelete={handleBulkDelete}
          onConfirmMove={handleConfirmMove}
          onUploadFiles={handleUploadFiles}
          onOpenNewFolder={() => setIsNewFolderOpen(true)}
          viewMode={viewMode}
          onToggleViewMode={(mode) => setViewMode(mode)}
        />
      </main>

      {/* Footer with bottom clearance for mobile dock */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-4 pb-24 sm:pb-5 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          <span>TeleVault Cloud Storage • Encrypted & Powered by Telegram CDN</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
          >
            Install App (PC, Android, Mac, iOS)
          </button>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse" /> by <span className="font-semibold text-sky-600 dark:text-sky-400">Salman Sami</span>
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Dock (sm:hidden) */}
      <nav
        id="mobile-bottom-nav-dock"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg"
      >
        {/* Root Drive */}
        <button
          onClick={() => setCurrentFolderId(null)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentFolderId === null ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Drive</span>
        </button>

        {/* New Folder */}
        <button
          onClick={() => setIsNewFolderOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <FolderPlus className="w-5 h-5" />
          <span>Folder</span>
        </button>

        {/* Floating Upload Action (Center) */}
        <button
          onClick={() => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.click();
          }}
          className="w-12 h-12 -mt-5 rounded-full bg-sky-600 dark:bg-sky-500 text-white shadow-lg shadow-sky-500/30 flex items-center justify-center active:scale-95 transition-all"
          aria-label="Upload file"
        >
          <Upload className="w-6 h-6" />
        </button>

        {/* Sync Channel */}
        <button
          onClick={handleSyncTelegram}
          disabled={isSyncing}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-sky-600 dark:text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsConfigOpen(true)}
          className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Config</span>
        </button>
      </nav>

      {/* Upload Progress Queue Drawer */}
      <UploadQueue
        queue={uploadQueue}
        onDismissItem={(id) => setUploadQueue((prev) => prev.filter((i) => i.id !== id))}
        onClearCompleted={() => setUploadQueue((prev) => prev.filter((i) => i.status !== 'completed'))}
      />

      {/* Modals */}
      <TelegramConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentConfig={telegramConfig}
        onConfigSaved={(cfg) => {
          setTelegramConfig(cfg);
          fetchStats();
        }}
        onSyncChannel={handleSyncTelegram}
        isSyncing={isSyncing}
      />

      <CreateFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
        currentFolderName={currentFolderName}
      />

      <RenameModal
        isOpen={!!renameItem}
        onClose={() => setRenameItem(null)}
        item={renameItem}
        onRename={handleRenameItem}
      />

      <MoveModal
        isOpen={!!moveItems}
        onClose={() => setMoveItems(null)}
        items={moveItems}
        folders={allFolders}
        onMove={handleConfirmMove}
      />

      <FilePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={handleDeleteItem}
        onShare={(item) => setShareItem(item)}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTargetItems}
        onClose={() => setDeleteTargetItems(null)}
        items={deleteTargetItems}
        onConfirm={handleConfirmDelete}
      />

      <ShareModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
      />

      {/* PWA Install & Multi-Platform Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Connectivity & Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Animated First-Launch Startup Loading Screen */}
      {isInitialLoading && (
        <StartupLoadingScreen
          isDataReady={isDataReady}
          onFinished={() => setIsInitialLoading(false)}
        />
      )}
    </div>
  );
}
