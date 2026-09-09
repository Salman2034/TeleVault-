import express from 'express';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { TelegramClient, sessions } from 'telegram';
import { LogLevel } from 'telegram/extensions/Logger';
import { CustomFile } from 'telegram/client/uploads';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Directories setup
const DATA_DIR = path.join(process.cwd(), 'data');
const TEMP_UPLOAD_DIR = path.join(DATA_DIR, 'temp_uploads');
const STORAGE_FILE = path.join(DATA_DIR, 'telegram_storage.json');
const CONFIG_FILE = path.join(DATA_DIR, 'telegram_config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

// Multer configured with diskStorage up to 2GB (2,048 MB) for MTProto chunking
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 2048 * 1024 * 1024 }, // 2GB
});

function cleanupTempFile(filePath?: string) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore
    }
  }
}

interface StorageItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  mimeType?: string;
  extension?: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  telegramFileId?: string;
  telegramMessageId?: number;
  telegramChatId?: string;
  telegramDocumentId?: string;
  storageProtocol?: 'mtproto' | 'bot_api';
  isDemo?: boolean;
  demoContent?: string;
}

interface AppConfig {
  botToken: string;
  chatId: string;
  apiId?: string;
  apiHash?: string;
  protocol: 'mtproto' | 'bot_api';
  sessionString?: string;
  botUsername?: string;
  botFirstName?: string;
  chatTitle?: string;
  isDemoMode: boolean;
}

// Configuration loader
function loadConfig(): AppConfig {
  let savedConfig: Partial<AppConfig> = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }

  const botToken = (process.env.TELEGRAM_BOT_TOKEN || savedConfig.botToken || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || savedConfig.chatId || '').trim();
  const apiId = (process.env.TELEGRAM_API_ID || savedConfig.apiId || '').trim();
  const apiHash = (process.env.TELEGRAM_API_HASH || savedConfig.apiHash || '').trim();
  const envProtocol = (process.env.TELEGRAM_PROTOCOL || '').toLowerCase().trim();

  let protocol: 'mtproto' | 'bot_api' = 'bot_api';
  if (savedConfig.protocol === 'mtproto' || savedConfig.protocol === 'bot_api') {
    protocol = savedConfig.protocol;
  } else if (apiId && apiHash) {
    protocol = 'mtproto';
  } else if (envProtocol === 'mtproto' || envProtocol === 'bot_api') {
    protocol = envProtocol;
  }

  const isConfigured = Boolean(botToken && chatId);

  return {
    botToken,
    chatId,
    apiId,
    apiHash,
    protocol,
    sessionString: savedConfig.sessionString || '',
    botUsername: savedConfig.botUsername,
    botFirstName: savedConfig.botFirstName,
    chatTitle: savedConfig.chatTitle,
    isDemoMode: savedConfig.isDemoMode !== undefined ? savedConfig.isDemoMode : !isConfigured,
  };
}

let currentConfig = loadConfig();

function saveConfig(config: AppConfig) {
  currentConfig = config;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

// Initial Sample Storage Data
function getInitialStorage(): StorageItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'folder-documents',
      name: 'Documents',
      type: 'folder',
      size: 0,
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'folder-photos',
      name: 'Photos & Wallpapers',
      type: 'folder',
      size: 0,
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'folder-notes',
      name: 'Work & Projects',
      type: 'folder',
      size: 0,
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'file-guide-pdf',
      name: 'Telegram_Storage_Guide.txt',
      type: 'file',
      size: 1450,
      mimeType: 'text/plain',
      extension: 'txt',
      parentId: 'folder-documents',
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoContent: `=====================================================
TELEGRAM AS UNLIMITED CLOUD HOSTING - 2GB MTPROTO GUIDE
=====================================================

Welcome to Telegram Cloud Storage!

Telegram provides free, unmetered storage for files:
1. Every file uploaded through this webapp is dispatched directly to your Telegram Channel.
2. Standard HTTP Bot API has a 50 MB file limit.
3. WITH MTPROTO CLIENT (GramJS):
   - You can upload files up to 2 GB (2,000 MB) each!
   - Full user-level account limits applied to your bot.
   - Stream high-definition videos, audio, and large archives directly from Telegram's CDN.

HOW TO ACTIVATE 2 GB MTPROTO PROTOCOL:
1. Open https://my.telegram.org and log in with your phone.
2. Go to "API development tools".
3. Copy your "App api_id" and "App api_hash".
4. In this app's "Telegram Settings", select "MTProto Protocol (Up to 2 GB per file)" and enter your API ID, API Hash, Bot Token, and Channel ID.

Enjoy your private, permanent, 2GB-capable cloud drive!`,
    },
    {
      id: 'file-sample-architecture',
      name: 'Cloud_Architecture.json',
      type: 'file',
      size: 680,
      mimeType: 'application/json',
      extension: 'json',
      parentId: 'folder-notes',
      createdAt: now,
      updatedAt: now,
      isDemo: true,
      demoContent: JSON.stringify(
        {
          appName: 'Telegram Cloud Storage',
          protocols: {
            mtproto: {
              library: 'GramJS (telegram)',
              maxFileSize: '2 GB (2,048 MB)',
              features: ['Chunked large uploads', 'Byte-range streaming', 'Zero throttling'],
            },
            botApi: {
              endpoint: 'api.telegram.org',
              maxFileSize: '50 MB',
            },
          },
          storageProvider: 'Telegram Global CDN',
          pricing: '$0.00 / Free Unlimited Quota',
        },
        null,
        2
      ),
    },
  ];
}

function loadStorage(): StorageItem[] {
  if (!fs.existsSync(STORAGE_FILE)) {
    const initial = getInitialStorage();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
  } catch {
    return getInitialStorage();
  }
}

function saveStorage(items: StorageItem[]) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

let storageItems = loadStorage();

// -------------------------------------------------------------
// MTProto Client Manager (GramJS)
// -------------------------------------------------------------
let mtprotoClient: TelegramClient | null = null;
let mtprotoConnecting: Promise<TelegramClient | null> | null = null;

async function getMTProtoClient(): Promise<TelegramClient | null> {
  if (mtprotoClient && mtprotoClient.connected) {
    return mtprotoClient;
  }

  if (!currentConfig.apiId || !currentConfig.apiHash || !currentConfig.botToken) {
    return null;
  }

  const numericApiId = parseInt(currentConfig.apiId, 10);
  if (isNaN(numericApiId) || !numericApiId) {
    return null;
  }

  if (mtprotoConnecting) {
    return mtprotoConnecting;
  }

  mtprotoConnecting = (async () => {
    try {
      if (mtprotoClient) {
        try {
          await mtprotoClient.disconnect();
        } catch {
          // ignore
        }
        mtprotoClient = null;
      }

      const stringSession = new sessions.StringSession(currentConfig.sessionString || '');
      const client = new TelegramClient(stringSession, numericApiId, currentConfig.apiHash!.trim(), {
        connectionRetries: 5,
        timeout: 15,
        autoReconnect: true,
      });
      client.setLogLevel(LogLevel.WARN);

      await client.connect();
      await client.start({
        botAuthToken: currentConfig.botToken.trim(),
      });

      const savedSession = (client.session.save() as unknown as string) || '';
      if (savedSession && savedSession !== currentConfig.sessionString) {
        currentConfig.sessionString = savedSession;
        saveConfig(currentConfig);
      }

      mtprotoClient = client;
      return client;
    } catch (err: any) {
      console.error('Failed to initialize MTProto client:', err?.message || err);
      mtprotoClient = null;
      return null;
    } finally {
      mtprotoConnecting = null;
    }
  })();

  return mtprotoConnecting;
}

// Peer resolver for channels & chats in MTProto
async function resolvePeer(client: TelegramClient, chatId: string): Promise<any> {
  const trimmed = chatId.trim();
  try {
    return await client.getInputEntity(trimmed);
  } catch {
    try {
      await client.getDialogs({ limit: 50 });
      return await client.getInputEntity(trimmed);
    } catch {
      return trimmed;
    }
  }
}

// Telegram Bot API helpers (for standard Bot API verification)
async function verifyTelegramBot(token: string, chatId?: string) {
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meData = (await meRes.json()) as any;

  if (!meData.ok) {
    throw new Error(meData.description || 'Invalid Telegram Bot Token');
  }

  let chatTitle: string | undefined;
  if (chatId) {
    try {
      const chatRes = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId)}`);
      const chatData = (await chatRes.json()) as any;
      if (chatData.ok) {
        chatTitle = chatData.result?.title || chatData.result?.username || 'Telegram Channel/Chat';
      }
    } catch {
      // non-blocking
    }
  }

  return {
    botUsername: meData.result.username,
    botFirstName: meData.result.first_name,
    chatTitle,
  };
}

// MTProto verification helper
async function verifyMTProto(apiId: string, apiHash: string, botToken: string, chatId?: string) {
  const numericApiId = parseInt(apiId, 10);
  if (isNaN(numericApiId) || !numericApiId) {
    throw new Error('API ID must be a valid number from https://my.telegram.org');
  }
  if (!apiHash || apiHash.trim().length < 10) {
    throw new Error('API Hash is required from https://my.telegram.org');
  }
  if (!botToken) {
    throw new Error('Bot Token is required from @BotFather');
  }

  const client = new TelegramClient(new sessions.StringSession(''), numericApiId, apiHash.trim(), {
    connectionRetries: 3,
    timeout: 12,
  });
  client.setLogLevel(LogLevel.WARN);

  await client.connect();
  await client.start({
    botAuthToken: botToken.trim(),
  });

  const me = (await client.getMe()) as any;
  const sessionString = (client.session.save() as unknown as string) || '';

  let chatTitle: string | undefined;
  if (chatId) {
    try {
      const entity = await client.getEntity(chatId.trim());
      chatTitle = (entity as any)?.title || (entity as any)?.username || (entity as any)?.firstName;
    } catch {
      // non-blocking
    }
  }

  return {
    botUsername: me?.username || 'Bot',
    botFirstName: me?.firstName || 'Telegram Bot',
    chatTitle,
    sessionString,
    client,
  };
}

// -------------------------------------------------------------
// Telegram Channel Sync & Manifest Engine
// Ensures all folders and files automatically persist across devices (PC, Phone, etc.)
// -------------------------------------------------------------
let lastSyncTime: string | null = null;
let isSyncing = false;

async function backupManifestToTelegram(): Promise<boolean> {
  if (currentConfig.isDemoMode || !currentConfig.botToken || !currentConfig.chatId) {
    return false;
  }

  try {
    const manifest = {
      version: 1,
      appName: 'TeleStorage',
      updatedAt: new Date().toISOString(),
      items: storageItems.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        size: item.size,
        mimeType: item.mimeType,
        extension: item.extension,
        parentId: item.parentId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        telegramFileId: item.telegramFileId,
        telegramMessageId: item.telegramMessageId,
        telegramDocumentId: item.telegramDocumentId,
        telegramChatId: item.telegramChatId,
        storageProtocol: item.storageProtocol,
      })),
    };

    const manifestJson = JSON.stringify(manifest, null, 2);
    const tempManifestPath = path.join(TEMP_UPLOAD_DIR, `manifest_${Date.now()}.json`);
    fs.writeFileSync(tempManifestPath, manifestJson, 'utf-8');

    const isMTProto = currentConfig.protocol === 'mtproto' && Boolean(currentConfig.apiId && currentConfig.apiHash);

    if (isMTProto) {
      const client = await getMTProtoClient();
      if (client) {
        const peer = await resolvePeer(client, currentConfig.chatId);
        const caption = `🏷️ [TeleStorage Sync Manifest v1]\n📁 Folders: ${manifest.items.filter((i) => i.type === 'folder').length}\n📄 Files: ${manifest.items.filter((i) => i.type === 'file').length}\n⏱️ ${new Date().toLocaleString()}`;
        
        const sent = (await client.sendFile(peer, {
          file: new CustomFile('tele_storage_manifest.json', Buffer.byteLength(manifestJson), tempManifestPath),
          caption,
          forceDocument: true,
        })) as any;

        try {
          await client.pinMessage(peer, sent.id, { notify: false });
        } catch {
          // non-blocking
        }
        cleanupTempFile(tempManifestPath);
        lastSyncTime = new Date().toISOString();
        return true;
      }
    }

    // Bot API mode backup
    const formData = new FormData();
    formData.append('chat_id', currentConfig.chatId);
    formData.append('document', new Blob([manifestJson], { type: 'application/json' }), 'tele_storage_manifest.json');
    formData.append(
      'caption',
      `🏷️ [TeleStorage Sync Manifest v1]\n📁 Folders: ${manifest.items.filter((i) => i.type === 'folder').length}\n📄 Files: ${manifest.items.filter((i) => i.type === 'file').length}\n⏱️ ${new Date().toLocaleString()}`
    );

    const tgRes = await fetch(`https://api.telegram.org/bot${currentConfig.botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    const tgData = (await tgRes.json()) as any;
    if (tgData.ok && tgData.result?.message_id) {
      try {
        await fetch(`https://api.telegram.org/bot${currentConfig.botToken}/pinChatMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: currentConfig.chatId,
            message_id: tgData.result.message_id,
            disable_notification: true,
          }),
        });
      } catch {
        // non-blocking
      }
    }
    cleanupTempFile(tempManifestPath);
    lastSyncTime = new Date().toISOString();
    return true;
  } catch (err) {
    console.warn('Backup manifest failed (non-blocking):', err);
    return false;
  }
}

async function syncFromTelegramChannel(): Promise<{
  success: boolean;
  totalFiles: number;
  totalFolders: number;
  restoredFromManifest: boolean;
  discoveredFiles: number;
  message: string;
}> {
  if (currentConfig.isDemoMode || !currentConfig.botToken || !currentConfig.chatId) {
    return {
      success: true,
      totalFiles: storageItems.filter((i) => i.type === 'file').length,
      totalFolders: storageItems.filter((i) => i.type === 'folder').length,
      restoredFromManifest: false,
      discoveredFiles: 0,
      message: 'Running in sandbox mode. Enter Telegram credentials to sync with live channel.',
    };
  }

  isSyncing = true;
  try {
    const isMTProto = currentConfig.protocol === 'mtproto' && Boolean(currentConfig.apiId && currentConfig.apiHash);
    let restoredItems: StorageItem[] = [];
    let foundManifest = false;
    let rawDiscoveredCount = 0;

    if (isMTProto) {
      const client = await getMTProtoClient();
      if (client) {
        const peer = await resolvePeer(client, currentConfig.chatId);
        const messages = (await client.getMessages(peer, { limit: 100 })) as any[];

        // 1. Search for latest manifest message in channel
        for (const msg of messages) {
          const caption = msg.message || '';
          const hasManifestCaption = caption.includes('[TeleStorage Sync Manifest v1]');
          const fileName = msg.media?.document?.attributes?.find((a: any) => a.fileName)?.fileName;

          if (hasManifestCaption || fileName === 'tele_storage_manifest.json') {
            try {
              let buf = Buffer.alloc(0);
              for await (const chunk of client.iterDownload({ file: msg.media, requestSize: 256 * 1024 })) {
                buf = Buffer.concat([buf, chunk]);
              }
              const parsed = JSON.parse(buf.toString('utf-8'));
              if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
                restoredItems = parsed.items;
                foundManifest = true;
                break;
              }
            } catch (parseErr) {
              console.warn('Error reading manifest document:', parseErr);
            }
          }
        }

        // 2. Scan channel for any media files not already in manifest or storage
        const existingIds = new Set(
          (foundManifest ? restoredItems : storageItems).map((i) => i.telegramMessageId).filter(Boolean)
        );

        const newDiscovered: StorageItem[] = [];
        for (const msg of messages) {
          if (msg.media && msg.media.document && msg.id) {
            const fileName =
              msg.media.document.attributes?.find((a: any) => a.fileName)?.fileName || `telegram_file_${msg.id}`;
            if (fileName === 'tele_storage_manifest.json') continue;

            if (!existingIds.has(msg.id)) {
              const mime = msg.media.document.mimeType || 'application/octet-stream';
              const ext = path.extname(fileName).replace('.', '').toLowerCase();
              const size = Number(msg.media.document.size) || 0;
              const dateIso = msg.date ? new Date(msg.date * 1000).toISOString() : new Date().toISOString();

              newDiscovered.push({
                id: `file-tg-${msg.id}`,
                name: fileName,
                type: 'file',
                size,
                mimeType: mime,
                extension: ext,
                parentId: null,
                createdAt: dateIso,
                updatedAt: dateIso,
                telegramMessageId: msg.id,
                telegramDocumentId: msg.media.document.id ? msg.media.document.id.toString() : undefined,
                telegramChatId: currentConfig.chatId,
                storageProtocol: 'mtproto',
                isDemo: false,
              });
              rawDiscoveredCount++;
            }
          }
        }

        if (foundManifest) {
          storageItems = [...restoredItems, ...newDiscovered];
        } else if (newDiscovered.length > 0) {
          const nonDemo = storageItems.filter((i) => !i.isDemo);
          storageItems = [...newDiscovered, ...nonDemo];
        }
      }
    } else {
      // Bot API sync: check pinned message
      try {
        const chatRes = await fetch(
          `https://api.telegram.org/bot${currentConfig.botToken}/getChat?chat_id=${encodeURIComponent(
            currentConfig.chatId
          )}`
        );
        const chatData = (await chatRes.json()) as any;
        const pinned = chatData.result?.pinned_message;
        if (pinned && pinned.document && pinned.document.file_name === 'tele_storage_manifest.json') {
          const fileInfoRes = await fetch(
            `https://api.telegram.org/bot${currentConfig.botToken}/getFile?file_id=${pinned.document.file_id}`
          );
          const fileInfo = (await fileInfoRes.json()) as any;
          if (fileInfo.ok && fileInfo.result?.file_path) {
            const docRes = await fetch(
              `https://api.telegram.org/file/bot${currentConfig.botToken}/${fileInfo.result.file_path}`
            );
            const parsed = await docRes.json();
            if (parsed && Array.isArray(parsed.items)) {
              storageItems = parsed.items;
              foundManifest = true;
            }
          }
        }
      } catch (tgErr) {
        console.warn('Bot API pinned manifest sync check failed:', tgErr);
      }
    }

    saveStorage(storageItems);
    lastSyncTime = new Date().toISOString();

    const totalFiles = storageItems.filter((i) => i.type === 'file').length;
    const totalFolders = storageItems.filter((i) => i.type === 'folder').length;

    let message = 'Synced successfully with Telegram Channel!';
    if (foundManifest) {
      message = `Restored ${totalFolders} folders and ${totalFiles} files from Telegram Channel manifest!`;
    } else if (rawDiscoveredCount > 0) {
      message = `Imported ${rawDiscoveredCount} existing media files directly from Telegram Channel!`;
    } else {
      message = `Synced with Telegram Channel. All folders and files are up to date!`;
    }

    return {
      success: true,
      totalFiles,
      totalFolders,
      restoredFromManifest: foundManifest,
      discoveredFiles: rawDiscoveredCount,
      message,
    };
  } catch (err: any) {
    console.error('Channel sync error:', err);
    throw new Error(err.message || 'Failed to sync with Telegram channel');
  } finally {
    isSyncing = false;
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Telegram Status & Health
app.get('/api/telegram/status', async (_req, res) => {
  const isConfigured = Boolean(currentConfig.botToken && currentConfig.chatId);
  const isMTProto = currentConfig.protocol === 'mtproto' && Boolean(currentConfig.apiId && currentConfig.apiHash);

  let mtprotoConnected = false;
  if (isMTProto && !currentConfig.isDemoMode) {
    try {
      const client = await getMTProtoClient();
      mtprotoConnected = Boolean(client && client.connected);
    } catch {
      mtprotoConnected = false;
    }
  }

  const maxFileSizeBytes = isMTProto ? 2048 * 1024 * 1024 : 50 * 1024 * 1024;
  const maxFileSizeLabel = isMTProto ? '2 GB (MTProto)' : '50 MB (Bot API)';

  res.json({
    configured: isConfigured,
    protocol: currentConfig.protocol,
    apiId: currentConfig.apiId ? String(currentConfig.apiId) : '',
    botUsername: currentConfig.botUsername || (isConfigured ? 'Connected Bot' : undefined),
    botFirstName: currentConfig.botFirstName,
    chatTitle: currentConfig.chatTitle,
    chatId: currentConfig.chatId || '',
    isDemoMode: currentConfig.isDemoMode,
    mtprotoConnected,
    maxFileSizeBytes,
    maxFileSizeLabel,
    lastSyncTime,
    isSyncing,
  });
});

// 2. Configure Telegram Bot, Chat ID, and Protocol (MTProto or Bot API)
app.post('/api/telegram/config', async (req, res) => {
  try {
    const { botToken, chatId, apiId, apiHash, protocol, isDemoMode } = req.body;

    if (isDemoMode) {
      currentConfig.isDemoMode = true;
      saveConfig(currentConfig);
      return res.json({ success: true, config: currentConfig });
    }

    if (!botToken || !chatId) {
      return res.status(400).json({ error: 'Bot Token and Chat ID are required' });
    }

    const selectedProtocol: 'mtproto' | 'bot_api' = protocol === 'mtproto' ? 'mtproto' : 'bot_api';

    let verificationResult: {
      botUsername: string;
      botFirstName: string;
      chatTitle?: string;
      sessionString?: string;
    };

    if (selectedProtocol === 'mtproto') {
      if (!apiId || !apiHash) {
        return res.status(400).json({
          error: 'Telegram App API ID and API Hash are required for MTProto mode. You can get them for free at https://my.telegram.org',
        });
      }

      const mtprotoRes = await verifyMTProto(String(apiId).trim(), String(apiHash).trim(), botToken.trim(), chatId.trim());
      mtprotoClient = mtprotoRes.client;
      verificationResult = {
        botUsername: mtprotoRes.botUsername,
        botFirstName: mtprotoRes.botFirstName,
        chatTitle: mtprotoRes.chatTitle,
        sessionString: mtprotoRes.sessionString,
      };
    } else {
      verificationResult = await verifyTelegramBot(botToken.trim(), chatId.trim());
    }

    currentConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      apiId: apiId ? String(apiId).trim() : '',
      apiHash: apiHash ? String(apiHash).trim() : '',
      protocol: selectedProtocol,
      sessionString: verificationResult.sessionString || currentConfig.sessionString,
      botUsername: verificationResult.botUsername,
      botFirstName: verificationResult.botFirstName,
      chatTitle: verificationResult.chatTitle,
      isDemoMode: false,
    };
    saveConfig(currentConfig);

    // Automatically sync previous folders & files from the Telegram channel in background!
    syncFromTelegramChannel().catch((e) => console.warn('Auto sync on connect warning:', e));

    const maxFileSizeLabel = selectedProtocol === 'mtproto' ? '2 GB (MTProto)' : '50 MB (Bot API)';
    const maxFileSizeBytes = selectedProtocol === 'mtproto' ? 2048 * 1024 * 1024 : 50 * 1024 * 1024;

    res.json({
      success: true,
      protocol: selectedProtocol,
      botUsername: verificationResult.botUsername,
      botFirstName: verificationResult.botFirstName,
      chatTitle: verificationResult.chatTitle,
      maxFileSizeLabel,
      maxFileSizeBytes,
      lastSyncTime,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to verify Telegram credentials' });
  }
});

// 2.1 Sync with Telegram Channel (Restores folders and files across devices)
app.post('/api/telegram/sync', async (_req, res) => {
  try {
    const result = await syncFromTelegramChannel();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync with Telegram channel' });
  }
});

// 2.2 Backup Storage Manifest to Telegram Channel
app.post('/api/telegram/backup-manifest', async (_req, res) => {
  try {
    const backedUp = await backupManifestToTelegram();
    res.json({ success: backedUp, lastSyncTime });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to backup manifest' });
  }
});

// 3. Get Storage Items (Files & Folders)
app.get('/api/files', (req, res) => {
  const { folderId, search, category } = req.query;

  let items = [...storageItems];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    items = items.filter((item) => item.name.toLowerCase().includes(q));
  } else if (folderId !== undefined) {
    const targetFolderId = folderId === 'root' || !folderId ? null : String(folderId);
    items = items.filter((item) => item.parentId === targetFolderId);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    items = items.filter((item) => {
      if (item.type === 'folder') return false;
      const mime = item.mimeType || '';
      const ext = (item.extension || '').toLowerCase();
      if (category === 'images') return mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      if (category === 'documents') return mime.includes('pdf') || mime.includes('document') || mime.includes('text') || ['pdf', 'doc', 'docx', 'txt', 'md', 'xlsx'].includes(ext);
      if (category === 'videos') return mime.startsWith('video/') || ['mp4', 'mkv', 'mov', 'webm'].includes(ext);
      if (category === 'audio') return mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext);
      if (category === 'archives') return mime.includes('zip') || mime.includes('tar') || mime.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
      return true;
    });
  }

  res.json({ items });
});

// 4. Get Storage Stats
app.get('/api/storage/stats', (_req, res) => {
  const files = storageItems.filter((i) => i.type === 'file');
  const folders = storageItems.filter((i) => i.type === 'folder');

  let totalBytes = 0;
  const catBytes: Record<string, { count: number; bytes: number }> = {
    images: { count: 0, bytes: 0 },
    documents: { count: 0, bytes: 0 },
    videos: { count: 0, bytes: 0 },
    audio: { count: 0, bytes: 0 },
    archives: { count: 0, bytes: 0 },
    other: { count: 0, bytes: 0 },
  };

  for (const f of files) {
    totalBytes += f.size;
    const mime = f.mimeType || '';
    const ext = (f.extension || '').toLowerCase();

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      catBytes.images.count++;
      catBytes.images.bytes += f.size;
    } else if (mime.includes('pdf') || mime.includes('document') || mime.includes('text') || ['pdf', 'doc', 'docx', 'txt', 'md', 'xlsx'].includes(ext)) {
      catBytes.documents.count++;
      catBytes.documents.bytes += f.size;
    } else if (mime.startsWith('video/') || ['mp4', 'mkv', 'mov', 'webm'].includes(ext)) {
      catBytes.videos.count++;
      catBytes.videos.bytes += f.size;
    } else if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      catBytes.audio.count++;
      catBytes.audio.bytes += f.size;
    } else if (mime.includes('zip') || mime.includes('tar') || mime.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      catBytes.archives.count++;
      catBytes.archives.bytes += f.size;
    } else {
      catBytes.other.count++;
      catBytes.other.bytes += f.size;
    }
  }

  const categoryBreakdown = Object.entries(catBytes).map(([category, val]) => ({
    category: category as any,
    count: val.count,
    bytes: val.bytes,
  }));

  const isMTProto = currentConfig.protocol === 'mtproto' && Boolean(currentConfig.apiId && currentConfig.apiHash);

  res.json({
    totalFiles: files.length,
    totalFolders: folders.length,
    totalBytes,
    categoryBreakdown,
    telegramConnected: Boolean(currentConfig.botToken && currentConfig.chatId && !currentConfig.isDemoMode),
    protocol: currentConfig.protocol,
    maxFileSizeLabel: isMTProto ? '2 GB (MTProto)' : '50 MB (Bot API)',
    mtprotoActive: isMTProto,
    botUsername: currentConfig.botUsername,
    chatTitle: currentConfig.chatTitle,
  });
});

// 5. Upload File (MTProto 2GB or Bot API 50MB)
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const tempFilePath = file.path;

  try {
    const parentId = req.body.parentId && req.body.parentId !== 'root' ? req.body.parentId : null;
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName).replace('.', '').toLowerCase();
    const now = new Date().toISOString();
    const itemId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const useTelegram = !currentConfig.isDemoMode && currentConfig.botToken && currentConfig.chatId;

    if (useTelegram) {
      const isMTProto = currentConfig.protocol === 'mtproto' && Boolean(currentConfig.apiId && currentConfig.apiHash);

      // --- MTPROTO UPLOAD (UP TO 2 GB) ---
      if (isMTProto) {
        const client = await getMTProtoClient();
        if (!client) {
          throw new Error('Failed to connect to Telegram MTProto client. Check your API ID, API Hash, and Bot Token.');
        }

        const peer = await resolvePeer(client, currentConfig.chatId);
        const caption = `📂 TeleStorage (MTProto 2 GB Limit)\n📄 File: ${originalName}\n📦 Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB\n⚡ Protocol: MTProto\n⏱️ ${new Date().toLocaleString()}`;

        // Send via GramJS CustomFile chunked upload
        const message = (await client.sendFile(peer, {
          file: new CustomFile(originalName, file.size, tempFilePath),
          caption,
          forceDocument: true,
          workers: 4,
        })) as any;

        const doc = message.media?.document;
        const documentId = doc?.id ? doc.id.toString() : undefined;
        const messageId = message.id;

        const newItem: StorageItem = {
          id: itemId,
          name: originalName,
          type: 'file',
          size: file.size,
          mimeType: file.mimetype,
          extension: ext,
          parentId,
          createdAt: now,
          updatedAt: now,
          telegramMessageId: messageId,
          telegramDocumentId: documentId,
          telegramChatId: currentConfig.chatId,
          storageProtocol: 'mtproto',
          isDemo: false,
        };

        storageItems.unshift(newItem);
        saveStorage(storageItems);
        backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));

        cleanupTempFile(tempFilePath);
        return res.json({ success: true, item: newItem, protocol: 'mtproto' });
      }

      // --- STANDARD BOT API UPLOAD (50 MB PER-FILE LIMIT) ---
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(
          `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the Bot API 50 MB per-file upload limit. Switch to the MTProto protocol in Settings to upload files up to 2 GB per file! (Note: Total channel storage space is unlimited).`
        );
      }

      const fileBuffer = fs.readFileSync(tempFilePath);
      const formData = new FormData();
      formData.append('chat_id', currentConfig.chatId);
      const fileBlob = new Blob([fileBuffer], { type: file.mimetype });
      formData.append('document', fileBlob, originalName);
      formData.append(
        'caption',
        `📂 TeleStorage (Bot API)\n📄 File: ${originalName}\n📦 Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB\n⏱️ ${new Date().toLocaleString()}`
      );

      const tgUrl = `https://api.telegram.org/bot${currentConfig.botToken}/sendDocument`;
      const tgRes = await fetch(tgUrl, {
        method: 'POST',
        body: formData,
      });

      const tgData = (await tgRes.json()) as any;
      if (!tgData.ok) {
        throw new Error(`Telegram API Error: ${tgData.description || 'Failed to upload document'}`);
      }

      const doc = tgData.result?.document || tgData.result?.video || tgData.result?.audio || tgData.result?.photo;
      const fileId = doc ? (Array.isArray(doc) ? doc[doc.length - 1].file_id : doc.file_id) : undefined;
      const messageId = tgData.result?.message_id;

      const newItem: StorageItem = {
        id: itemId,
        name: originalName,
        type: 'file',
        size: file.size,
        mimeType: file.mimetype,
        extension: ext,
        parentId,
        createdAt: now,
        updatedAt: now,
        telegramFileId: fileId,
        telegramMessageId: messageId,
        telegramChatId: currentConfig.chatId,
        storageProtocol: 'bot_api',
        isDemo: false,
      };

      storageItems.unshift(newItem);
      saveStorage(storageItems);
      backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));

      cleanupTempFile(tempFilePath);
      return res.json({ success: true, item: newItem, protocol: 'bot_api' });
    } else {
      // Demo / Sandbox mode: save content for preview
      let demoContent: string | undefined;
      if (file.mimetype.startsWith('text/') || ['json', 'js', 'ts', 'html', 'css', 'md', 'csv', 'txt'].includes(ext)) {
        demoContent = fs.readFileSync(tempFilePath, 'utf-8');
      } else if (file.mimetype.startsWith('image/')) {
        const fileBuffer = fs.readFileSync(tempFilePath);
        demoContent = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;
      }

      const newItem: StorageItem = {
        id: itemId,
        name: originalName,
        type: 'file',
        size: file.size,
        mimeType: file.mimetype,
        extension: ext,
        parentId,
        createdAt: now,
        updatedAt: now,
        isDemo: true,
        demoContent,
      };

      storageItems.unshift(newItem);
      saveStorage(storageItems);

      cleanupTempFile(tempFilePath);
      return res.json({
        success: true,
        item: newItem,
        note: 'Saved in Sandbox mode. Connect Telegram MTProto to host files up to 2 GB on Telegram CDN.',
      });
    }
  } catch (err: any) {
    cleanupTempFile(tempFilePath);
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// 6. Download File from Telegram (MTProto or Bot API)
app.get('/api/files/:id/download', async (req, res) => {
  try {
    const item = storageItems.find((i) => i.id === req.params.id && i.type === 'file');
    if (!item) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (item.isDemo) {
      if (item.demoContent) {
        if (item.demoContent.startsWith('data:')) {
          const parts = item.demoContent.split(';base64,');
          const buf = Buffer.from(parts[1], 'base64');
          res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.name)}"`);
          return res.send(buf);
        }
        res.setHeader('Content-Type', item.mimeType || 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.name)}"`);
        return res.send(item.demoContent);
      }
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.name)}"`);
      return res.send(`Demo file content for ${item.name}`);
    }

    // Try MTProto download if stored with MTProto or client is available
    if (item.storageProtocol === 'mtproto' || (!item.telegramFileId && item.telegramMessageId)) {
      const client = await getMTProtoClient();
      if (client && item.telegramMessageId) {
        const peer = await resolvePeer(client, item.telegramChatId || currentConfig.chatId);
        const msgs = (await client.getMessages(peer, { ids: [item.telegramMessageId] })) as any[];
        const msg = msgs && msgs[0];

        if (msg && msg.media) {
          res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.name)}"`);
          if (item.size) {
            res.setHeader('Content-Length', item.size.toString());
          }

          let aborted = false;
          res.on('close', () => {
            aborted = true;
          });

          for await (const chunk of client.iterDownload({
            file: msg.media,
            requestSize: 512 * 1024,
          })) {
            if (aborted) break;
            res.write(chunk);
          }
          return res.end();
        }
      }
    }

    // Fallback to standard Bot API download
    if (!item.telegramFileId || !currentConfig.botToken) {
      return res.status(400).json({ error: 'Telegram file information or Bot token missing' });
    }

    const getFileUrl = `https://api.telegram.org/bot${currentConfig.botToken}/getFile?file_id=${item.telegramFileId}`;
    const getFileRes = await fetch(getFileUrl);
    const fileData = (await getFileRes.json()) as any;

    if (!fileData.ok || !fileData.result?.file_path) {
      return res.status(502).json({ error: fileData.description || 'Could not retrieve file path from Telegram' });
    }

    const downloadUrl = `https://api.telegram.org/file/bot${currentConfig.botToken}/${fileData.result.file_path}`;
    const tgDownloadRes = await fetch(downloadUrl);

    if (!tgDownloadRes.ok) {
      return res.status(502).json({ error: 'Failed to download stream from Telegram CDN' });
    }

    res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.name)}"`);
    if (item.size) {
      res.setHeader('Content-Length', item.size.toString());
    }

    if (tgDownloadRes.body) {
      const nodeStream = Readable.fromWeb(tgDownloadRes.body as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message || 'Failed to download file' });
  }
});

// 7. Stream file for in-browser preview (Images, Audio, Video, PDF with MTProto support)
app.get('/api/files/:id/stream', async (req, res) => {
  try {
    const item = storageItems.find((i) => i.id === req.params.id && i.type === 'file');
    if (!item) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (item.isDemo) {
      if (item.demoContent) {
        if (item.demoContent.startsWith('data:')) {
          const parts = item.demoContent.split(';base64,');
          const buf = Buffer.from(parts[1], 'base64');
          res.setHeader('Content-Type', item.mimeType || 'image/png');
          return res.send(buf);
        }
        res.setHeader('Content-Type', item.mimeType || 'text/plain');
        return res.send(item.demoContent);
      }
      res.setHeader('Content-Type', 'text/plain');
      return res.send(`Preview for demo file ${item.name}`);
    }

    // Try MTProto streaming
    if (item.storageProtocol === 'mtproto' || (!item.telegramFileId && item.telegramMessageId)) {
      const client = await getMTProtoClient();
      if (client && item.telegramMessageId) {
        const peer = await resolvePeer(client, item.telegramChatId || currentConfig.chatId);
        const msgs = (await client.getMessages(peer, { ids: [item.telegramMessageId] })) as any[];
        const msg = msgs && msgs[0];

        if (msg && msg.media) {
          res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.name)}"`);
          if (item.size) {
            res.setHeader('Content-Length', item.size.toString());
          }

          let aborted = false;
          res.on('close', () => {
            aborted = true;
          });

          for await (const chunk of client.iterDownload({
            file: msg.media,
            requestSize: 512 * 1024,
          })) {
            if (aborted) break;
            res.write(chunk);
          }
          return res.end();
        }
      }
    }

    // Fallback to standard Bot API streaming
    if (!item.telegramFileId || !currentConfig.botToken) {
      return res.status(400).json({ error: 'Telegram file information missing' });
    }

    const getFileUrl = `https://api.telegram.org/bot${currentConfig.botToken}/getFile?file_id=${item.telegramFileId}`;
    const getFileRes = await fetch(getFileUrl);
    const fileData = (await getFileRes.json()) as any;

    if (!fileData.ok || !fileData.result?.file_path) {
      return res.status(502).json({ error: 'Could not locate file path in Telegram' });
    }

    const streamUrl = `https://api.telegram.org/file/bot${currentConfig.botToken}/${fileData.result.file_path}`;
    const tgStreamRes = await fetch(streamUrl);

    if (!tgStreamRes.ok) {
      return res.status(502).json({ error: 'Failed to retrieve media stream from Telegram' });
    }

    res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    if (item.size) {
      res.setHeader('Content-Length', item.size.toString());
    }

    if (tgStreamRes.body) {
      const nodeStream = Readable.fromWeb(tgStreamRes.body as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Stream error:', err);
    res.status(500).json({ error: err.message || 'Failed to stream media' });
  }
});

// 8. Create New Folder
app.post('/api/folders', (req, res) => {
  const { name, parentId } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const safeParentId = parentId && parentId !== 'root' ? parentId : null;
  const now = new Date().toISOString();
  const newFolder: StorageItem = {
    id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    type: 'folder',
    size: 0,
    parentId: safeParentId,
    createdAt: now,
    updatedAt: now,
  };

  storageItems.push(newFolder);
  saveStorage(storageItems);
  backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));
  res.json({ success: true, folder: newFolder });
});

// 9. Rename File or Folder
app.put('/api/files/:id', (req, res) => {
  const { name, parentId } = req.body;
  const itemIndex = storageItems.findIndex((i) => i.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (name && typeof name === 'string' && name.trim()) {
    storageItems[itemIndex].name = name.trim();
    if (storageItems[itemIndex].type === 'file') {
      const ext = path.extname(name.trim()).replace('.', '').toLowerCase();
      storageItems[itemIndex].extension = ext;
    }
  }

  if (parentId !== undefined) {
    storageItems[itemIndex].parentId = parentId === 'root' || !parentId ? null : parentId;
  }

  storageItems[itemIndex].updatedAt = new Date().toISOString();
  saveStorage(storageItems);
  backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));

  res.json({ success: true, item: storageItems[itemIndex] });
});

// 10. Helper to delete a single item and its descendants
async function deleteItemById(id: string): Promise<boolean> {
  const itemIndex = storageItems.findIndex((i) => i.id === id);
  if (itemIndex === -1) return false;

  const item = storageItems[itemIndex];

  // Try MTProto or Bot API message deletion with short timeouts so it never hangs
  if (item.type === 'file' && item.telegramMessageId) {
    try {
      if (currentConfig.protocol === 'mtproto' && currentConfig.apiId && currentConfig.apiHash) {
        const client = await Promise.race([
          getMTProtoClient(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);
        if (client) {
          const peer = await resolvePeer(client, item.telegramChatId || currentConfig.chatId);
          await Promise.race([
            client.deleteMessages(peer, [item.telegramMessageId], { revoke: true }),
            new Promise((resolve) => setTimeout(resolve, 2000)),
          ]);
        }
      } else if (item.telegramChatId && currentConfig.botToken) {
        await Promise.race([
          fetch(`https://api.telegram.org/bot${currentConfig.botToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: item.telegramChatId,
              message_id: item.telegramMessageId,
            }),
          }),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      }
    } catch {
      // ignore Telegram error to ensure deletion succeeds locally
    }
  }

  // If folder, recursively delete child items
  if (item.type === 'folder') {
    const getFolderDescendantIds = (folderId: string): string[] => {
      const children = storageItems.filter((i) => i.parentId === folderId);
      let ids: string[] = [];
      for (const child of children) {
        ids.push(child.id);
        if (child.type === 'folder') {
          ids = ids.concat(getFolderDescendantIds(child.id));
        }
      }
      return ids;
    };

    const idsToDelete = new Set([item.id, ...getFolderDescendantIds(item.id)]);
    storageItems = storageItems.filter((i) => !idsToDelete.has(i.id));
  } else {
    storageItems = storageItems.filter((i) => i.id !== id);
  }

  return true;
}

// 11. Delete Single File or Folder
app.delete('/api/files/:id', async (req, res) => {
  const success = await deleteItemById(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Item not found' });
  }

  saveStorage(storageItems);
  backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));
  res.json({ success: true });
});

// 12. Bulk Delete Files or Folders
app.post('/api/files/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }

  let deletedCount = 0;
  for (const id of ids) {
    const ok = await deleteItemById(id);
    if (ok) deletedCount++;
  }

  saveStorage(storageItems);
  backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));
  res.json({ success: true, count: deletedCount });
});

// 13. Bulk Move Files or Folders
app.post('/api/files/bulk-move', (req, res) => {
  const { ids, parentId } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }

  const targetParent = parentId === 'root' || !parentId ? null : parentId;

  const getFolderDescendantIds = (folderId: string): string[] => {
    const children = storageItems.filter((i) => i.parentId === folderId);
    let result: string[] = [];
    for (const child of children) {
      result.push(child.id);
      if (child.type === 'folder') {
        result = result.concat(getFolderDescendantIds(child.id));
      }
    }
    return result;
  };

  const movedIds: string[] = [];
  for (const id of ids) {
    const item = storageItems.find((i) => i.id === id);
    if (!item) continue;
    if (item.id === targetParent) continue;
    // Cannot move a folder into its own descendant
    if (item.type === 'folder' && targetParent && (item.id === targetParent || getFolderDescendantIds(item.id).includes(targetParent))) {
      continue;
    }
    item.parentId = targetParent;
    item.updatedAt = new Date().toISOString();
    movedIds.push(item.id);
  }

  saveStorage(storageItems);
  backupManifestToTelegram().catch((e) => console.warn('Manifest backup warning:', e));
  res.json({ success: true, count: movedIds.length, movedIds });
});

// -------------------------------------------------------------
// Vite Middleware & Production Server Setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telegram Cloud Storage server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
