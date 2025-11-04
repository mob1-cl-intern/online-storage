using Microsoft.AspNetCore.Http;

namespace Backend.Infrastructure.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string fileName);
    Task<bool> DeleteFileAsync(string filePath);
    Task<byte[]?> GetFileAsync(string filePath);
    bool FileExists(string filePath);
}

