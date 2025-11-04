using Backend.Domain.Models;

namespace Backend.Application.Interfaces;

public interface ITagService
{
    Task<List<FileTag>> GetAllAsync();
    Task<FileTag> CreateAsync(string name, string color);
    Task<FileTag?> UpdateAsync(string id, string name, string color);
    Task<bool> DeleteAsync(string id);
}

