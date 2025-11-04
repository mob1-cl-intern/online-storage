import type { User, Tag, FileItem, Folder } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

// Token management
let authToken: string | null = null;

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await handleResponse(response);
    authToken = data.token;
    return { id: data.id, username: data.username };
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    authToken = null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (!authToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch {
      authToken = null;
      return null;
    }
  },

  getTags: async (): Promise<Tag[]> => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },

  createTag: async (name: string, color: string): Promise<Tag> => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color }),
    });
    return await handleResponse(response);
  },

  updateTag: async (id: string, name: string, color: string): Promise<Tag> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color }),
    });
    return await handleResponse(response);
  },

  deleteTag: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete tag: ${response.status}`);
    }
  },

  getFolders: async (): Promise<Folder[]> => {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  },

  createFolder: async (name: string, parentId: string): Promise<Folder> => {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, parentId }),
    });
    return await handleResponse(response);
  },

  deleteFolder: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete folder: ${response.status}`);
    }
  },

  getFileAccessToken: async (fileId: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/access-token`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.token;
  },

  getFiles: async (folderId: string): Promise<FileItem[]> => {
    const response = await fetch(`${API_BASE_URL}/files?folderId=${folderId}`, {
      headers: getAuthHeaders(),
    });
    const files = await handleResponse(response);
    
    // Get access tokens for all files
    const filesWithTokens = await Promise.all(
      files.map(async (file: any) => {
        try {
          const token = await api.getFileAccessToken(file.id);
          const baseUrl = API_BASE_URL.replace('/api', '');
          return {
            ...file,
            createdAt: new Date(file.createdAt),
            url: `${baseUrl}${file.url}?token=${token}`,
            thumbnailUrl: file.thumbnailUrl ? `${baseUrl}${file.thumbnailUrl}?token=${token}` : undefined,
          };
        } catch (error) {
          console.error(`Failed to get access token for file ${file.id}:`, error);
          return {
            ...file,
            createdAt: new Date(file.createdAt),
            url: `${API_BASE_URL.replace('/api', '')}${file.url}`,
            thumbnailUrl: file.thumbnailUrl ? `${API_BASE_URL.replace('/api', '')}${file.thumbnailUrl}` : undefined,
          };
        }
      })
    );
    
    return filesWithTokens;
  },

  uploadFile: async (
    file: File,
    folderId: string,
    tags: string[]
  ): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folderId);
    formData.append('tags', tags.join(','));

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: formData,
    });

    const uploadedFile = await handleResponse(response);
    
    // Get access token for the uploaded file
    try {
      const token = await api.getFileAccessToken(uploadedFile.id);
      const baseUrl = API_BASE_URL.replace('/api', '');
      return {
        ...uploadedFile,
        createdAt: new Date(uploadedFile.createdAt),
        url: `${baseUrl}${uploadedFile.url}?token=${token}`,
        thumbnailUrl: uploadedFile.thumbnailUrl ? `${baseUrl}${uploadedFile.thumbnailUrl}?token=${token}` : undefined,
      };
    } catch (error) {
      console.error('Failed to get access token for uploaded file:', error);
      return {
        ...uploadedFile,
        createdAt: new Date(uploadedFile.createdAt),
        url: `${API_BASE_URL.replace('/api', '')}${uploadedFile.url}`,
        thumbnailUrl: uploadedFile.thumbnailUrl ? `${API_BASE_URL.replace('/api', '')}${uploadedFile.thumbnailUrl}` : undefined,
      };
    }
  },

  deleteFile: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/files/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.status}`);
    }
  },

  updateFileTags: async (fileId: string, tags: string[]): Promise<FileItem> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/tags`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tags }),
    });
    const file = await handleResponse(response);
    
    // Get access token for the updated file
    try {
      const token = await api.getFileAccessToken(file.id);
      const baseUrl = API_BASE_URL.replace('/api', '');
      return {
        ...file,
        createdAt: new Date(file.createdAt),
        url: `${baseUrl}${file.url}?token=${token}`,
        thumbnailUrl: file.thumbnailUrl ? `${baseUrl}${file.thumbnailUrl}?token=${token}` : undefined,
      };
    } catch (error) {
      console.error('Failed to get access token for updated file:', error);
      return {
        ...file,
        createdAt: new Date(file.createdAt),
        url: `${API_BASE_URL.replace('/api', '')}${file.url}`,
        thumbnailUrl: file.thumbnailUrl ? `${API_BASE_URL.replace('/api', '')}${file.thumbnailUrl}` : undefined,
      };
    }
  },

  downloadFile: async (fileId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('ファイルが見つかりません');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const contentDisposition = response.headers.get('content-disposition');
    const fileNameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    const fileName = fileNameMatch ? fileNameMatch[1].replace(/['"]/g, '') : 'download';

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
