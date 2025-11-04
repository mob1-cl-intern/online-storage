using Backend.Domain.Interfaces;
using Backend.Domain.Models;
using Backend.Infrastructure.Data;
using MongoDB.Driver;

namespace Backend.Infrastructure.Repositories;

public class TagRepository : ITagRepository
{
    private readonly MongoDbContext _context;

    public TagRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<FileTag?> GetByIdAsync(string id)
    {
        return await _context.Tags.Find(t => t.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<FileTag>> GetAllAsync()
    {
        return await _context.Tags.Find(_ => true).ToListAsync();
    }

    public async Task<FileTag> CreateAsync(FileTag tag)
    {
        await _context.Tags.InsertOneAsync(tag);
        return tag;
    }

    public async Task<bool> UpdateAsync(FileTag tag)
    {
        var result = await _context.Tags.ReplaceOneAsync(t => t.Id == tag.Id, tag);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Tags.DeleteOneAsync(t => t.Id == id);
        return result.DeletedCount > 0;
    }
}

