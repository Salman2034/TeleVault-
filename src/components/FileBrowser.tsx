import React, { useState, useRef, useEffect } from 'react';
import {
  Folder, FileText, Image as ImageIcon, Film, Music, Code, Archive,
  MoreVertical, Download, Eye, Share2, Edit2, Trash2, FolderSymlink,
  ChevronRight, Home, Grid, List, ArrowUpDown, Upload, FolderPlus,
  Send, ShieldCheck, Check, CheckSquare, X
} from 'lucide-react';
import { StorageItem, ViewMode, SortField, SortOrder } from '../types';
import { formatBytes, formatDate, getFileCategory } from '../utils/formatters';
import { ItemActionsModal } from './ItemActionsModal';

interface FileBrowserProps {
  items: StorageItem[];
  currentFolderId: string | null;
  folderPath: StorageItem[]; // hierarchy from root to current folder
  onNavigateFolder: (folderId: string | null) => void;
  onPreviewFile: (item: StorageItem) => void;
  onDownloadFile: (item: StorageItem) => void;
  onShareFile: (item: StorageItem) => void;
  onRenameItem: (item: StorageItem) => void;
  onMoveItem: (item: StorageItem) => void;
  onDeleteItem: (item: StorageItem) => void;
  onBulkMove?: (items: StorageItem[]) => void;
  onBulkDelete?: (items: StorageItem[]) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  onOpenNewFolder: () => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  items,
  currentFolderId,
  folderPath,
  onNavigateFolder,
  onPreviewFile,
  onDownloadFile,
  onShareFile,
  onRenameItem,
  onMoveItem,
  onDeleteItem,
  onBulkMove,
  onBulkDelete,
  onUploadFiles,
  onOpenNewFolder,
  viewMode,
  onToggleViewMode,
}) => {
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [actionModalItem, setActionModalItem] = useState<StorageItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear selection when navigating to another folder
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentFolderId]);

  // Clean up selected items that no longer exist in items list
  useEffect(() => {
    if (selectedIds.size > 0) {
      const existingIds = new Set(items.map((i) => i.id));
      const filtered = new Set(Array.from(selectedIds).filter((id) => existingIds.has(id)));
      if (filtered.size !== selectedIds.size) {
        setSelectedIds(filtered);
      }
    }
  }, [items]);

  // Handle container background click
  const handleContainerClick = () => {
    // Background click handler
  };

  // Selection handlers
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (items.length === 0) return;
    setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (items.length > 0 && selectedIds.size === items.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected;
  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const selectedTotalBytes = selectedItems.reduce((acc, i) => acc + (i.size || 0), 0);
  const hasSelected = selectedIds.size > 0;

  // Separate folders and files
  const folders = items.filter((i) => i.type === 'folder');
  const files = items.filter((i) => i.type === 'file');

  // Sorting
  const sortItems = (list: StorageItem[]) => {
    return [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'size') {
        comparison = a.size - b.size;
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const sortedFolders = sortItems(folders);
  const sortedFiles = sortItems(files);

  // Drag & drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const renderFileIcon = (item: StorageItem) => {
    const category = getFileCategory(item.mimeType, item.extension);
    switch (category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      case 'video':
        return <Film className="w-5 h-5 text-indigo-600" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-600" />;
      case 'code':
        return <Code className="w-5 h-5 text-emerald-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-amber-700" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div
      id="file-browser-container"
      onClick={handleContainerClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative min-h-[500px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col transition-colors"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUploadFiles(e.target.files);
          }
        }}
      />

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-sky-500/10 dark:bg-sky-950/40 backdrop-blur-xs border-2 border-dashed border-sky-500 dark:border-sky-400 rounded-2xl flex flex-col items-center justify-center p-6 text-sky-800 dark:text-sky-200 animate-in fade-in duration-100">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Drop files to host on Telegram</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Files will be streamed straight to Telegram CDN storage</p>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-50/40 dark:bg-slate-900/60 rounded-t-2xl max-w-full overflow-hidden">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto scrollbar-none py-0.5 w-full min-w-0 max-w-full touch-pan-x">
          <button
            id="breadcrumb-root-btn"
            onClick={() => onNavigateFolder(null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
              currentFolderId === null
                ? 'font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Root Drive</span>
          </button>

          {folderPath.map((f, idx) => {
            const isLast = idx === folderPath.length - 1;
            return (
              <React.Fragment key={f.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                <button
                  onClick={() => onNavigateFolder(f.id)}
                  className={`px-2 py-1 rounded-lg transition-colors truncate max-w-[120px] sm:max-w-[140px] shrink-0 cursor-pointer ${
                    isLast
                      ? 'font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700'
                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  title={f.name}
                >
                  {f.name}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* View Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-center justify-between sm:justify-end shrink-0 max-w-full">
          {/* Quick Select All Button if items exist */}
          {items.length > 0 && (
            <button
              id="toolbar-select-all-btn"
              onClick={toggleSelectAll}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                hasSelected
                  ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
              title={isAllSelected ? 'Deselect All' : 'Select All'}
            >
              <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">{isAllSelected ? 'Deselect All' : 'Select All'}</span>
              {hasSelected && <span className="font-bold">({selectedIds.size})</span>}
            </button>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 sm:px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 min-w-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                setSortField(f);
                setSortOrder(o);
              }}
              className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium truncate max-w-[125px] sm:max-w-none"
            >
              <option value="updatedAt-desc" className="dark:bg-slate-800 dark:text-slate-100">Date (Newest)</option>
              <option value="updatedAt-asc" className="dark:bg-slate-800 dark:text-slate-100">Date (Oldest)</option>
              <option value="name-asc" className="dark:bg-slate-800 dark:text-slate-100">Name (A-Z)</option>
              <option value="name-desc" className="dark:bg-slate-800 dark:text-slate-100">Name (Z-A)</option>
              <option value="size-desc" className="dark:bg-slate-800 dark:text-slate-100">Size (Largest)</option>
              <option value="size-asc" className="dark:bg-slate-800 dark:text-slate-100">Size (Smallest)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700 shrink-0">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto w-full max-w-full">
        {/* Bulk Actions Floating Toolbar */}
        {hasSelected && (
          <div
            id="bulk-actions-toolbar"
            className="sticky top-0 z-30 mb-4 sm:mb-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-2.5 sm:p-3 px-3 sm:px-4 shadow-xl border border-slate-700/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-150 max-w-full overflow-hidden"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                id="btn-bulk-toggle-all"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 dark:border-slate-600 text-xs font-semibold text-sky-300 transition-colors cursor-pointer shrink-0"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAllSelected ? 'Deselect All' : 'Select All'}</span>
              </button>

              <div className="h-4 w-px bg-slate-700 hidden sm:block" />

              <div className="text-xs font-medium text-slate-200 truncate">
                <span className="font-bold text-white">{selectedIds.size}</span> selected
                {selectedTotalBytes > 0 && (
                  <span className="text-slate-400 ml-1.5 hidden sm:inline">
                    ({formatBytes(selectedTotalBytes)})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="btn-bulk-move-action"
                onClick={() => {
                  if (onBulkMove) {
                    onBulkMove(selectedItems);
                  } else if (selectedItems.length === 1) {
                    onMoveItem(selectedItems[0]);
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Move selected items to another folder"
              >
                <FolderSymlink className="w-3.5 h-3.5" />
                <span>Move ({selectedIds.size})</span>
              </button>

              <button
                id="btn-bulk-delete-action"
                onClick={() => {
                  if (onBulkDelete) {
                    onBulkDelete(selectedItems);
                  } else if (selectedItems.length === 1) {
                    onDeleteItem(selectedItems[0]);
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Delete selected items permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.size})</span>
              </button>

              <button
                id="btn-bulk-clear-selection"
                onClick={clearSelection}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors ml-0.5 cursor-pointer"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty state check */}
        {sortedFolders.length === 0 && sortedFiles.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No files in this folder</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Drag and drop files here, or use the buttons below to create folders and upload files.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenNewFolder}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>New Folder</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* ======================== GRID VIEW ======================== */
          <div className="space-y-6">
            {/* Folders Section in Grid */}
            {sortedFolders.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Folders ({sortedFolders.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                  {sortedFolders.map((folder) => {
                    const isSelected = selectedIds.has(folder.id);
                    return (
                      <div
                        key={folder.id}
                        onDoubleClick={() => onNavigateFolder(folder.id)}
                        className={`group relative border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 ring-2 ring-sky-500/80 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-800/80 hover:bg-sky-50/60 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-750 hover:border-sky-300 dark:hover:border-sky-500/50'
                        }`}
                      >
                        {/* Folder Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => toggleSelect(folder.id, e)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mr-2 transition-all cursor-pointer shadow-2xs ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500'
                          }`}
                          title={isSelected ? 'Deselect folder' : 'Select folder'}
                          aria-label={isSelected ? `Deselect ${folder.name}` : `Select ${folder.name}`}
                        >
                          <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'block' : 'opacity-0'}`} />
                        </button>

                        <div
                          onClick={() => onNavigateFolder(folder.id)}
                          className="flex items-center gap-2 min-w-0 flex-1 select-none"
                        >
                          <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={folder.name}>
                            {folder.name}
                          </span>
                        </div>

                        {/* 3-Dots Menu Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModalItem(folder);
                          }}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 p-1.5 rounded-md transition-colors touch-manipulation cursor-pointer shrink-0"
                          title="Folder options"
                          aria-label={`Options for folder ${folder.name}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Files Section in Grid */}
            {sortedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Files ({sortedFiles.length})
                  </h4>
                  <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Double click to preview</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {sortedFiles.map((file) => {
                    const isSelected = selectedIds.has(file.id);
                    const category = getFileCategory(file.mimeType, file.extension);
                    const isImage = category === 'image';
                    const streamUrl = `/api/files/${file.id}/stream`;

                    return (
                      <div
                        key={file.id}
                        onDoubleClick={() => onPreviewFile(file)}
                        className={`group relative bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col cursor-pointer ${
                          isSelected
                            ? 'border-sky-400 dark:border-sky-500 ring-2 ring-sky-500/80 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {/* File Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => toggleSelect(file.id, e)}
                          className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                            isSelected
                              ? 'bg-sky-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-sm'
                              : 'bg-white/95 dark:bg-slate-800/95 border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-sky-500 hover:bg-white dark:hover:bg-slate-700'
                          }`}
                          title={isSelected ? 'Deselect file' : 'Select file'}
                          aria-label={isSelected ? `Deselect ${file.name}` : `Select ${file.name}`}
                        >
                          <Check className={`w-4 h-4 stroke-[3] ${isSelected ? 'block' : 'opacity-0'}`} />
                        </button>

                        {/* 3-Dots Action Button at corner */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModalItem(file);
                          }}
                          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 shadow-2xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                          title="File options"
                          aria-label={`Options for ${file.name}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* File Thumbnail / Preview Box */}
                        <div
                          onClick={() => onPreviewFile(file)}
                          className="h-28 w-full bg-slate-100/70 dark:bg-slate-900/60 flex items-center justify-center relative overflow-hidden border-b border-slate-100 dark:border-slate-700/60"
                        >
                          {isImage ? (
                            <img
                              src={streamUrl}
                              alt={file.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center">
                              {renderFileIcon(file)}
                            </div>
                          )}

                          {/* Storage Badge */}
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs text-[9px] font-medium text-white flex items-center gap-1">
                            <Send className="w-2.5 h-2.5 -rotate-12 text-sky-300" />
                            <span>Telegram</span>
                          </div>
                        </div>

                        {/* File Meta Info */}
                        <div 
                          onClick={() => onPreviewFile(file)}
                          className="p-2.5 flex-1 flex flex-col justify-between"
                        >
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            <span>{formatBytes(file.size)}</span>
                            <span>{file.extension?.toUpperCase() || 'FILE'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================== LIST / TABLE VIEW ======================== */
          <div className="space-y-4">
            {/* Mobile Card List (sm:hidden) */}
            <div className="space-y-3 sm:hidden">
              {/* Folders in Mobile List */}
              {sortedFolders.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    Folders ({sortedFolders.length})
                  </h4>
                  {sortedFolders.map((folder) => {
                    const isSelected = selectedIds.has(folder.id);
                    return (
                      <div
                        key={folder.id}
                        onClick={() => onNavigateFolder(folder.id)}
                        className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors shadow-2xs cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 ring-1 ring-sky-500'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80'
                        }`}
                      >
                        <div
                          onClick={(e) => toggleSelect(folder.id, e)}
                          className="p-1 -ml-1 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isSelected ? 'block' : 'opacity-0'}`} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                            <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{folder.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="text-amber-700 dark:text-amber-400 font-medium">Folder</span>
                              <span>•</span>
                              <span>{formatDate(folder.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModalItem(folder);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shrink-0 touch-manipulation cursor-pointer"
                          title="Folder options"
                          aria-label={`Options for ${folder.name}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Files in Mobile List */}
              {sortedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    Files ({sortedFiles.length})
                  </h4>
                  {sortedFiles.map((file) => {
                    const isSelected = selectedIds.has(file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => onPreviewFile(file)}
                        className={`border rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors shadow-2xs cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 ring-1 ring-sky-500'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80'
                        }`}
                      >
                        <div
                          onClick={(e) => toggleSelect(file.id, e)}
                          className="p-1 -ml-1 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isSelected ? 'block' : 'opacity-0'}`} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            {renderFileIcon(file)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{file.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span className="text-sky-700 dark:text-sky-400 font-medium">Telegram</span>
                              <span>•</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModalItem(file);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shrink-0 touch-manipulation cursor-pointer"
                          title="File options"
                          aria-label={`Options for ${file.name}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="w-10 px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Type / Host</th>
                    <th className="px-4 py-3">Date Modified</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Folders Rows in Desktop Table */}
                  {sortedFolders.map((folder) => {
                    const isSelected = selectedIds.has(folder.id);
                    return (
                      <tr
                        key={folder.id}
                        onDoubleClick={() => onNavigateFolder(folder.id)}
                        className={`transition-colors group cursor-pointer ${
                          isSelected ? 'bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-50 dark:hover:bg-sky-950/60' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <td
                          className="w-10 px-3 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(folder.id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
                            title={isSelected ? 'Deselect folder' : 'Select folder'}
                          />
                        </td>
                        <td 
                          onClick={() => onNavigateFolder(folder.id)}
                          className="px-4 py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5"
                        >
                          <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />
                          <span className="truncate max-w-xs sm:max-w-md" title={folder.name}>
                            {folder.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500">—</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-semibold border border-amber-200/60 dark:border-amber-800/60">
                            <Folder className="w-2.5 h-2.5" /> Folder
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{formatDate(folder.updatedAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateFolder(folder.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Open Folder"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveItem(folder);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Move Folder"
                            >
                              <FolderSymlink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenameItem(folder);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Rename Folder"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteItem(folder);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                              title="Delete Folder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModalItem(folder);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer ml-0.5"
                              title="More Options"
                              aria-label={`More options for ${folder.name}`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Files Rows in Desktop Table */}
                  {sortedFiles.map((file) => {
                    const isSelected = selectedIds.has(file.id);
                    return (
                      <tr
                        key={file.id}
                        onDoubleClick={() => onPreviewFile(file)}
                        className={`transition-colors group cursor-pointer ${
                          isSelected ? 'bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-50 dark:hover:bg-sky-950/60' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <td
                          className="w-10 px-3 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(file.id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 cursor-pointer"
                            title={isSelected ? 'Deselect file' : 'Select file'}
                          />
                        </td>
                        <td 
                          onClick={() => onPreviewFile(file)}
                          className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2.5"
                        >
                          {renderFileIcon(file)}
                          <span className="truncate max-w-xs sm:max-w-md font-semibold" title={file.name}>
                            {file.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-[10px] font-medium border border-sky-200/60 dark:border-sky-800/60">
                            <Send className="w-2.5 h-2.5 -rotate-12" /> Telegram CDN
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{formatDate(file.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPreviewFile(file);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownloadFile(file);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onShareFile(file);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Share"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveItem(file);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                              title="Move"
                            >
                              <FolderSymlink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteItem(file);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionModalItem(file);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer ml-0.5"
                              title="More Options"
                              aria-label={`More options for ${file.name}`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Drop Prompt bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 rounded-b-2xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">Encrypted Telegram Storage • Unlimited</span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 shrink-0 p-1 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Unified 3-Dots Actions Modal for File and Folder Operations */}
      <ItemActionsModal
        isOpen={!!actionModalItem}
        onClose={() => setActionModalItem(null)}
        item={actionModalItem}
        isSelected={actionModalItem ? selectedIds.has(actionModalItem.id) : false}
        onToggleSelect={(item) => toggleSelect(item.id)}
        onPreview={onPreviewFile}
        onDownload={onDownloadFile}
        onShare={onShareFile}
        onMove={onMoveItem}
        onRename={onRenameItem}
        onDelete={onDeleteItem}
        onOpenFolder={onNavigateFolder}
        renderFileIcon={renderFileIcon}
      />
    </div>
  );
};
