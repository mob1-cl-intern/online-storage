using Backend.Application.Interfaces;
using Backend.Domain.Interfaces;
using Backend.Domain.Models;
using Backend.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Backend.Application.Services;

public class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;
    private readonly IFileStorageService _storageService;

    public FileService(IFileRepository fileRepository, IFileStorageService storageService)
    {
        _fileRepository = fileRepository;
        _storageService = storageService;
    }

    public async Task<FileMetadata?> GetByIdAsync(string id)
    {
        return await _fileRepository.GetByIdAsync(id);
    }

    public async Task<List<FileMetadata>> GetByFolderIdAsync(string folderId)
    {
        return await _fileRepository.GetByFolderIdAsync(folderId);
    }

    public async Task<FileMetadata> UploadAsync(IFormFile file, string folderId, List<string> tags)
    {
        // Validate file type
        var contentType = file.ContentType.ToLower();
        string fileType;
        
        if (contentType.StartsWith("image/"))
        {
            fileType = "image";
        }
        else if (contentType == "application/pdf")
        {
            fileType = "pdf";
        }
        else
        {
            throw new InvalidOperationException("Only images and PDF files are allowed.");
        }

        // Generate unique file name
        var extension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";

        // Save file to storage
        var filePath = await _storageService.SaveFileAsync(file, uniqueFileName);

        // Create metadata
        var metadata = new FileMetadata
        {
            Name = file.FileName,
            FolderId = folderId,
            Type = fileType,
            Size = file.Length,
            Path = filePath,
            Tags = tags,
            CreatedAt = DateTime.UtcNow
        };

        return await _fileRepository.CreateAsync(metadata);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var file = await _fileRepository.GetByIdAsync(id);
        if (file == null)
        {
            return false;
        }

        // Delete physical file
        await _storageService.DeleteFileAsync(file.Path);

        // Delete metadata
        return await _fileRepository.DeleteAsync(id);
    }

    public async Task<FileMetadata?> UpdateTagsAsync(string fileId, List<string> tags)
    {
        var file = await _fileRepository.GetByIdAsync(fileId);
        if (file == null)
        {
            return null;
        }

        file.Tags = tags;
        await _fileRepository.UpdateAsync(file);
        return file;
    }

    public async Task<string?> GetFilePathAsync(string fileId)
    {
        var file = await _fileRepository.GetByIdAsync(fileId);
        return file?.Path;
    }
}

