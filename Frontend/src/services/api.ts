import type { User, Tag, FileItem, Folder } from '../types';

let mockUser: User | null = null;
let mockTags: Tag[] = [
  { id: '1', name: '重要', color: '#ef4444' },
  { id: '2', name: '作業中', color: '#3b82f6' },
];
let mockFolders: Folder[] = [
  { id: 'root', name: 'ルート', parentId: null, children: [] },
];
let mockFiles: FileItem[] = [];

let tagIdCounter = 3;
let folderIdCounter = 1;
let fileIdCounter = 1;

export const api = {
  login: async (username: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === 'user' && password === 'pass') {
      mockUser = { id: '1', username };
      return mockUser;
    }

    throw new Error('ユーザー名またはパスワードが正しくありません');
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockUser = null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    return mockUser;
  },

  getTags: async (): Promise<Tag[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockTags];
  },

  createTag: async (name: string, color: string): Promise<Tag> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTag: Tag = {
      id: String(tagIdCounter++),
      name,
      color,
    };
    mockTags.push(newTag);
    return newTag;
  },

  updateTag: async (id: string, name: string, color: string): Promise<Tag> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const tag = mockTags.find(t => t.id === id);
    if (!tag) throw new Error('タグが見つかりません');

    tag.name = name;
    tag.color = color;

    mockFiles.forEach(file => {
      if (file.tags.includes(id)) {
      }
    });

    return { ...tag };
  },

  deleteTag: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockTags = mockTags.filter(t => t.id !== id);

    mockFiles.forEach(file => {
      file.tags = file.tags.filter(tagId => tagId !== id);
    });
  },

  getFolders: async (): Promise<Folder[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return buildFolderTree(mockFolders);
  },

  createFolder: async (name: string, parentId: string): Promise<Folder> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newFolder: Folder = {
      id: `folder-${folderIdCounter++}`,
      name,
      parentId,
      children: [],
    };
    mockFolders.push(newFolder);
    return newFolder;
  },

  deleteFolder: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const getAllChildFolderIds = (folderId: string): string[] => {
      const children = mockFolders.filter(f => f.parentId === folderId);
      const allIds = [folderId];
      children.forEach(child => {
        allIds.push(...getAllChildFolderIds(child.id));
      });
      return allIds;
    };

    const folderIdsToDelete = getAllChildFolderIds(id);
    mockFiles = mockFiles.filter(f => !folderIdsToDelete.includes(f.folderId));
    mockFolders = mockFolders.filter(f => !folderIdsToDelete.includes(f.id));
  },

  getFiles: async (folderId: string): Promise<FileItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockFiles.filter(f => f.folderId === folderId);
  },

  uploadFile: async (
    file: File,
    folderId: string,
    tags: string[]
  ): Promise<FileItem> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
    const url = URL.createObjectURL(file);

    const newFile: FileItem = {
      id: `file-${fileIdCounter++}`,
      name: file.name,
      folderId,
      type: fileType,
      size: file.size,
      url,
      thumbnailUrl: fileType === 'image' ? url : undefined,
      tags,
      createdAt: new Date(),
    };

    mockFiles.push(newFile);
    return newFile;
  },

  deleteFile: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const file = mockFiles.find(f => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.url);
    }
    mockFiles = mockFiles.filter(f => f.id !== id);
  },

  updateFileTags: async (fileId: string, tags: string[]): Promise<FileItem> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) throw new Error('ファイルが見つかりません');

    file.tags = tags;
    return { ...file };
  },

  downloadFile: async (fileId: string): Promise<void> => {
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) throw new Error('ファイルが見つかりません');

    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

function buildFolderTree(folders: Folder[]): Folder[] {
  const folderMap = new Map<string, Folder>();

  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  const roots: Folder[] = [];

  folderMap.forEach(folder => {
    if (folder.parentId === null) {
      roots.push(folder);
    } else {
      const parent = folderMap.get(folder.parentId);
      if (parent) {
        parent.children.push(folder);
      }
    }
  });

  return roots;
}
