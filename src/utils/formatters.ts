export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export type FileTypeCategory = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'code' | 'archive' | 'other';

export function getFileCategory(mimeType?: string, extension?: string): FileTypeCategory {
  const ext = (extension || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (mime.includes('pdf') || ext === 'pdf') {
    return 'pdf';
  }
  if (
    ['json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'sh', 'sql', 'xml', 'yaml', 'yml'].includes(ext) ||
    mime.includes('javascript') ||
    mime.includes('json')
  ) {
    return 'code';
  }
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('text') ||
    ['doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'csv', 'xlsx', 'xls', 'pptx'].includes(ext)
  ) {
    return 'document';
  }
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  return 'other';
}
