import { useState, useEffect } from 'react';
import type { Folder } from '../types';
import { api } from '../services/api';
import '../styles/FolderTree.css';

interface FolderTreeProps {
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
}

export function FolderTree({ selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentForNew, setParentForNew] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const folders = await api.getFolders();
    setFolders(folders);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !parentForNew) return;

    await api.createFolder(newFolderName, parentForNew);
    await loadFolders();
    setIsCreating(false);
    setNewFolderName('');
    setParentForNew(null);
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (folderId === 'root') {
      alert('ルートフォルダは削除できません');
      return;
    }

    if (confirm(`フォルダ「${folderName}」とその中のすべてのファイルを削除しますか?`)) {
      await api.deleteFolder(folderId);
      await loadFolders();
      if (selectedFolderId === folderId) {
        onSelectFolder('root');
      }
    }
  };

  const startCreatingFolder = (parentId: string) => {
    setParentForNew(parentId);
    setIsCreating(true);
    setNewFolderName('');
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children.length > 0;

    return (
      <div key={folder.id} className="folder-item">
        <div
          className={`folder-row ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <span
              className="folder-toggle"
              onClick={() => toggleFolder(folder.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!hasChildren && <span className="folder-spacer" />}
          <span
            className="folder-name"
            onClick={() => onSelectFolder(folder.id)}
          >
            📁 {folder.name}
          </span>
          <div className="folder-actions">
            <button
              className="folder-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                startCreatingFolder(folder.id);
              }}
              title="サブフォルダを作成"
            >
              ＋
            </button>
            {folder.id !== 'root' && (
              <button
                className="folder-action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id, folder.name);
                }}
                title="削除"
              >
                ×
              </button>
            )}
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="folder-children">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      <div className="folder-tree-header">
        <h2>フォルダ</h2>
      </div>
      <div className="folder-list">
        {folders.map(folder => renderFolder(folder))}
      </div>
      {isCreating && (
        <div className="folder-create-dialog">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="フォルダ名"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewFolderName('');
              }
            }}
          />
          <div className="folder-create-actions">
            <button onClick={handleCreateFolder}>作成</button>
            <button onClick={() => {
              setIsCreating(false);
              setNewFolderName('');
            }}>キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}
