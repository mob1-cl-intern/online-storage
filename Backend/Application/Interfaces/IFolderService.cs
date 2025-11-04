using Backend.Domain.Models;

namespace Backend.Application.Interfaces;

public interface IFolderService
{
    Task<List<Folder>> GetAllAsync();
    Task<Folder> CreateAsync(string name, string? parentId);
    Task<bool> DeleteAsync(string id);
}

