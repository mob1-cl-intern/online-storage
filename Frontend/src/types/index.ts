export interface User {
  id: string;
  username: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string;
  type: 'image' | 'pdf';
  size: number;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: Folder[];
}

export type ViewMode = 'grid' | 'list';
