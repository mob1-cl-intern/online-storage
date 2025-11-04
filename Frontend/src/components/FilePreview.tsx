import type { FileItem } from '../types';
import '../styles/FilePreview.css';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>{file.name}</h3>
          <button className="preview-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="preview-content">
          {file.type === 'image' ? (
            <img src={file.url} alt={file.name} />
          ) : (
            <iframe src={file.url} title={file.name} />
          )}
        </div>
      </div>
    </div>
  );
}
