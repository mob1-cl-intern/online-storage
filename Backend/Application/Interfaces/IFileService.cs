using Backend.Domain.Models;
using Microsoft.AspNetCore.Http;

namespace Backend.Application.Interfaces;

public interface IFileService
{
    Task<FileMetadata?> GetByIdAsync(string id);
    Task<List<FileMetadata>> GetByFolderIdAsync(string folderId);
    Task<FileMetadata> UploadAsync(IFormFile file, string folderId, List<string> tags);
    Task<bool> DeleteAsync(string id);
    Task<FileMetadata?> UpdateTagsAsync(string fileId, List<string> tags);
    Task<string?> GetFilePathAsync(string fileId);
}

