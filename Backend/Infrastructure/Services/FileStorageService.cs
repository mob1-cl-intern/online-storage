using Backend.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Backend.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _uploadDirectory;

    public FileStorageService(IWebHostEnvironment environment)
    {
        _uploadDirectory = Path.Combine(environment.ContentRootPath, "upload-dir");
        
        // Ensure upload directory exists
        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file, string fileName)
    {
        var filePath = Path.Combine(_uploadDirectory, fileName);
        
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return filePath;
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    public async Task<byte[]?> GetFileAsync(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                return await File.ReadAllBytesAsync(filePath);
            }
            return null;
        }
        catch
        {
            return null;
        }
    }

    public bool FileExists(string filePath)
    {
        return File.Exists(filePath);
    }
}

