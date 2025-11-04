using Backend.Domain.Models;

namespace Backend.Domain.Interfaces;

public interface IFileRepository
{
    Task<FileMetadata?> GetByIdAsync(string id);
    Task<List<FileMetadata>> GetByFolderIdAsync(string folderId);
    Task<FileMetadata> CreateAsync(FileMetadata file);
    Task<bool> UpdateAsync(FileMetadata file);
    Task<bool> DeleteAsync(string id);
    Task<bool> DeleteByFolderIdAsync(string folderId);
}

