using Backend.Domain.Models;

namespace Backend.Domain.Interfaces;

public interface ITagRepository
{
    Task<FileTag?> GetByIdAsync(string id);
    Task<List<FileTag>> GetAllAsync();
    Task<FileTag> CreateAsync(FileTag tag);
    Task<bool> UpdateAsync(FileTag tag);
    Task<bool> DeleteAsync(string id);
}

