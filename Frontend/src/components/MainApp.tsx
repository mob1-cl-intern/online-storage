import { useState } from 'react';
import type { FileItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FolderTree } from './FolderTree';
import { FileList } from './FileList';
import { FilePreview } from './FilePreview';
import { TagManager } from './TagManager';
import '../styles/MainApp.css';

export function MainApp() {
  const { user, logout } = useAuth();
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [tagUpdateTrigger, setTagUpdateTrigger] = useState(0);

  const handleLogout = async () => {
    if (confirm('ログアウトしますか?')) {
      await logout();
    }
  };

  const handleCloseTagManager = () => {
    setShowTagManager(false);
    setTagUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="main-app">
      <header className="app-header">
        <h1>オンラインストレージ</h1>
        <div className="header-actions">
          <button onClick={() => setShowTagManager(true)} className="header-button">
            タグ管理
          </button>
          <span className="user-info">ようこそ、{user?.username}さん</span>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <FolderTree
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
        </aside>
        <main className="app-main">
          <FileList
            folderId={selectedFolderId}
            onPreviewFile={setPreviewFile}
            tagUpdateTrigger={tagUpdateTrigger}
          />
        </main>
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {showTagManager && (
        <TagManager onClose={handleCloseTagManager} />
      )}
    </div>
  );
}
