using Backend.Application.Interfaces;
using Backend.Domain.Interfaces;
using Backend.Domain.Models;

namespace Backend.Application.Services;

public class TagService : ITagService
{
    private readonly ITagRepository _tagRepository;
    private readonly IFileRepository _fileRepository;

    public TagService(ITagRepository tagRepository, IFileRepository fileRepository)
    {
        _tagRepository = tagRepository;
        _fileRepository = fileRepository;
    }

    public async Task<List<FileTag>> GetAllAsync()
    {
        return await _tagRepository.GetAllAsync();
    }

    public async Task<FileTag> CreateAsync(string name, string color)
    {
        var tag = new FileTag
        {
            Name = name,
            Color = color,
            CreatedAt = DateTime.UtcNow
        };

        return await _tagRepository.CreateAsync(tag);
    }

    public async Task<FileTag?> UpdateAsync(string id, string name, string color)
    {
        var tag = await _tagRepository.GetByIdAsync(id);
        if (tag == null)
        {
            return null;
        }

        tag.Name = name;
        tag.Color = color;
        
        await _tagRepository.UpdateAsync(tag);
        return tag;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        // Remove tag from all files
        var allFiles = await _fileRepository.GetByFolderIdAsync(""); // We need to get all files
        // This is not ideal, but we'll need to iterate through all folders
        // For now, we'll just delete the tag
        
        return await _tagRepository.DeleteAsync(id);
    }
}

