import { useState, useEffect } from 'react';
import type { Tag } from '../types';
import { api } from '../services/api';
import '../styles/TagManager.css';

interface TagManagerProps {
  onClose: () => void;
}

export function TagManager({ onClose }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const tags = await api.getTags();
    setTags(tags);
  };

  const handleCreate = async () => {
    if (!tagName.trim()) return;
    await api.createTag(tagName, tagColor);
    await loadTags();
    setIsCreating(false);
    setTagName('');
    setTagColor('#3b82f6');
  };

  const handleUpdate = async () => {
    if (!editingTag || !tagName.trim()) return;
    await api.updateTag(editingTag.id, tagName, tagColor);
    await loadTags();
    setEditingTag(null);
    setTagName('');
    setTagColor('#3b82f6');
  };

  const handleDelete = async (tag: Tag) => {
    if (confirm(`タグ「${tag.name}」を削除しますか?\nこのタグが付けられているファイルからもタグが削除されます。`)) {
      await api.deleteTag(tag.id);
      await loadTags();
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingTag(null);
    setTagName('');
    setTagColor('#3b82f6');
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingTag(null);
    setTagName('');
    setTagColor('#3b82f6');
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog tag-manager-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>タグ管理</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="tag-manager-content">
          <div className="tag-list-section">
            <div className="section-header">
              <h3>既存のタグ</h3>
              <button onClick={startCreating} className="create-tag-button">
                新規作成
              </button>
            </div>
            <div className="tags-grid">
              {tags.map(tag => (
                <div key={tag.id} className="tag-item">
                  <div
                    className="tag-color-box"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="tag-item-name">{tag.name}</span>
                  <div className="tag-item-actions">
                    <button onClick={() => startEditing(tag)} title="編集">✎</button>
                    <button onClick={() => handleDelete(tag)} title="削除">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(isCreating || editingTag) && (
            <div className="tag-form-section">
              <h3>{editingTag ? 'タグを編集' : '新しいタグ'}</h3>
              <div className="form-group">
                <label>タグ名</label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="タグ名を入力"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>カラー</label>
                <div className="color-picker">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${tagColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTagColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button onClick={editingTag ? handleUpdate : handleCreate}>
                  {editingTag ? '更新' : '作成'}
                </button>
                <button onClick={cancelEdit}>キャンセル</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
