using Backend.Domain.Models;

namespace Backend.Domain.Interfaces;

public interface IFolderRepository
{
    Task<Folder?> GetByIdAsync(string id);
    Task<List<Folder>> GetAllAsync();
    Task<List<Folder>> GetByParentIdAsync(string? parentId);
    Task<Folder> CreateAsync(Folder folder);
    Task<bool> DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
}

