import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
import type { FileItem, Tag, ViewMode } from '../types';
import { api } from '../services/api';
import '../styles/FileList.css';

interface FileListProps {
  folderId: string;
  onPreviewFile: (file: FileItem) => void;
}

export function FileList({ folderId, onPreviewFile }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);

  useEffect(() => {
    loadFiles();
    loadTags();
  }, [folderId]);

  const loadFiles = async () => {
    const files = await api.getFiles(folderId);
    setFiles(files);
  };

  const loadTags = async () => {
    const tags = await api.getTags();
    setTags(tags);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        await api.uploadFile(file, folderId, []);
      } else {
        alert(`${file.name} はサポートされていないファイル形式です`);
      }
    }
    await loadFiles();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        await api.uploadFile(file, folderId, []);
      } else {
        alert(`${file.name} はサポートされていないファイル形式です`);
      }
    }
    await loadFiles();
    e.target.value = '';
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (confirm(`ファイル「${file.name}」を削除しますか?`)) {
      await api.deleteFile(file.id);
      await loadFiles();
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    await api.downloadFile(fileId);
  };

  const openTagDialog = (file: FileItem) => {
    setSelectedFile(file);
    setShowTagDialog(true);
  };

  const handleUpdateTags = async (tagIds: string[]) => {
    if (!selectedFile) return;
    await api.updateFileTags(selectedFile.id, tagIds);
    await loadFiles();
    setShowTagDialog(false);
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('ja-JP');
  };

  return (
    <div className="file-list-container">
      <div className="file-list-toolbar">
        <label className="upload-button">
          アップロード
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
        <div className="view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="グリッド表示"
          >
            ⊞
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="リスト表示"
          >
            ☰
          </button>
        </div>
      </div>

      <div
        className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${viewMode}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <div className="empty-message">
            ファイルをドラッグ&ドロップするか、アップロードボタンをクリックしてください
          </div>
        ) : viewMode === 'grid' ? (
          <div className="file-grid">
            {files.map(file => (
              <div key={file.id} className="file-card">
                <div
                  className="file-thumbnail"
                  onClick={() => onPreviewFile(file)}
                >
                  {file.type === 'image' && file.thumbnailUrl ? (
                    <img src={file.thumbnailUrl} alt={file.name} />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                </div>
                <div className="file-info">
                  <div className="file-name" title={file.name}>{file.name}</div>
                  <div className="file-tags">
                    {file.tags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="file-tag"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="file-actions">
                  <button onClick={() => onPreviewFile(file)} title="プレビュー">👁</button>
                  <button onClick={() => handleDownloadFile(file.id)} title="ダウンロード">⬇</button>
                  <button onClick={() => openTagDialog(file)} title="タグ">🏷</button>
                  <button onClick={() => handleDeleteFile(file)} title="削除">🗑</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="file-table">
            <thead>
              <tr>
                <th>名前</th>
                <th>種類</th>
                <th>サイズ</th>
                <th>タグ</th>
                <th>更新日時</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.id}>
                  <td className="file-name-cell" onClick={() => onPreviewFile(file)}>
                    {file.name}
                  </td>
                  <td>{file.type === 'image' ? '画像' : 'PDF'}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>
                    <div className="file-tags">
                      {file.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className="file-tag"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td>{formatDate(file.createdAt)}</td>
                  <td>
                    <div className="file-actions">
                      <button onClick={() => onPreviewFile(file)} title="プレビュー">👁</button>
                      <button onClick={() => handleDownloadFile(file.id)} title="ダウンロード">⬇</button>
                      <button onClick={() => openTagDialog(file)} title="タグ">🏷</button>
                      <button onClick={() => handleDeleteFile(file)} title="削除">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showTagDialog && selectedFile && (
        <TagDialog
          file={selectedFile}
          allTags={tags}
          onClose={() => {
            setShowTagDialog(false);
            setSelectedFile(null);
          }}
          onSave={handleUpdateTags}
        />
      )}
    </div>
  );
}

interface TagDialogProps {
  file: FileItem;
  allTags: Tag[];
  onClose: () => void;
  onSave: (tagIds: string[]) => void;
}

function TagDialog({ file, allTags, onClose, onSave }: TagDialogProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(file.tags));

  const toggleTag = (tagId: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tagId)) {
      newTags.delete(tagId);
    } else {
      newTags.add(tagId);
    }
    setSelectedTags(newTags);
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>タグを編集: {file.name}</h3>
        <div className="tag-list">
          {allTags.map(tag => (
            <label key={tag.id} className="tag-checkbox">
              <input
                type="checkbox"
                checked={selectedTags.has(tag.id)}
                onChange={() => toggleTag(tag.id)}
              />
              <span
                className="tag-label"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            </label>
          ))}
        </div>
        <div className="dialog-actions">
          <button onClick={() => onSave(Array.from(selectedTags))}>保存</button>
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
