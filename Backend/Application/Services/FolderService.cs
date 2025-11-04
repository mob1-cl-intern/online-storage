using Backend.Application.Interfaces;
using Backend.Domain.Interfaces;
using Backend.Domain.Models;

namespace Backend.Application.Services;

public class FolderService : IFolderService
{
    private readonly IFolderRepository _folderRepository;
    private readonly IFileRepository _fileRepository;

    public FolderService(IFolderRepository folderRepository, IFileRepository fileRepository)
    {
        _folderRepository = folderRepository;
        _fileRepository = fileRepository;
    }

    public async Task<List<Folder>> GetAllAsync()
    {
        return await _folderRepository.GetAllAsync();
    }

    public async Task<Folder> CreateAsync(string name, string? parentId)
    {
        // Validate parent folder exists if specified
        if (parentId != null && parentId != "root")
        {
            var parentExists = await _folderRepository.ExistsAsync(parentId);
            if (!parentExists)
            {
                throw new InvalidOperationException("Parent folder does not exist.");
            }
        }

        var folder = new Folder
        {
            Name = name,
            ParentId = parentId,
            CreatedAt = DateTime.UtcNow
        };

        return await _folderRepository.CreateAsync(folder);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        // Get all child folders recursively
        var allChildFolders = await GetAllChildFolderIdsAsync(id);
        allChildFolders.Add(id);

        // Delete all files in all folders
        foreach (var folderId in allChildFolders)
        {
            await _fileRepository.DeleteByFolderIdAsync(folderId);
        }

        // Delete all child folders
        foreach (var folderId in allChildFolders.Where(f => f != id))
        {
            await _folderRepository.DeleteAsync(folderId);
        }

        // Delete the folder itself
        return await _folderRepository.DeleteAsync(id);
    }

    private async Task<List<string>> GetAllChildFolderIdsAsync(string folderId)
    {
        var result = new List<string>();
        var children = await _folderRepository.GetByParentIdAsync(folderId);

        foreach (var child in children)
        {
            result.Add(child.Id);
            var grandChildren = await GetAllChildFolderIdsAsync(child.Id);
            result.AddRange(grandChildren);
        }

        return result;
    }
}

