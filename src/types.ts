export type StorageProtocol = 'mtproto' | 'bot_api';

export interface StorageItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number; // bytes (0 for folder)
  mimeType?: string;
  extension?: string;
  parentId: string | null; // null = root
  createdAt: string;
  updatedAt: string;
  // Telegram metadata (for files)
  telegramFileId?: string;
  telegramMessageId?: number;
  telegramChatId?: string;
  telegramDocumentId?: string;
  storageProtocol?: StorageProtocol;
  isDemo?: boolean;
  downloadUrl?: string;
  thumbnailUrl?: string;
  demoContent?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  apiId?: string;
  apiHash?: string;
  protocol: StorageProtocol;
  isConfigured: boolean;
  botUsername?: string;
  botFirstName?: string;
  chatTitle?: string;
  isDemoMode: boolean;
  mtprotoConnected?: boolean;
  maxFileSizeBytes: number;
  maxFileSizeLabel: string;
  lastSyncTime?: string;
  isSyncing?: boolean;
}

export interface StorageStats {
  totalFiles: number;
  totalFolders: number;
  totalBytes: number;
  categoryBreakdown: {
    category: 'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'other';
    count: number;
    bytes: number;
  }[];
  telegramConnected: boolean;
  botUsername?: string;
  chatTitle?: string;
  protocol: StorageProtocol;
  maxFileSizeLabel: string;
  mtprotoActive: boolean;
  lastSyncTime?: string;
  isSyncing?: boolean;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'size' | 'updatedAt' | 'type';
export type SortOrder = 'asc' | 'desc';
export type FileCategory = 'all' | 'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'other';

export interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}
