using Backend.Domain.Interfaces;
using Backend.Domain.Models;
using Backend.Infrastructure.Data;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Infrastructure.Repositories;

public class FolderRepository : IFolderRepository
{
    private readonly MongoDbContext _context;

    public FolderRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Folder?> GetByIdAsync(string id)
    {
        return await _context.Folders.Find(f => f.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Folder>> GetAllAsync()
    {
        return await _context.Folders.Find(_ => true).ToListAsync();
    }

    public async Task<List<Folder>> GetByParentIdAsync(string? parentId)
    {
        return await _context.Folders.Find(f => f.ParentId == parentId).ToListAsync();
    }

    public async Task<Folder> CreateAsync(Folder folder)
    {
        // Generate ObjectId if Id is empty
        if (string.IsNullOrEmpty(folder.Id))
        {
            folder.Id = ObjectId.GenerateNewId().ToString();
        }
        await _context.Folders.InsertOneAsync(folder);
        return folder;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Folders.DeleteOneAsync(f => f.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ExistsAsync(string id)
    {
        var count = await _context.Folders.CountDocumentsAsync(f => f.Id == id);
        return count > 0;
    }
}

