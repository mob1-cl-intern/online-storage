using Backend.Domain.Interfaces;
using Backend.Domain.Models;
using Backend.Infrastructure.Data;
using MongoDB.Driver;

namespace Backend.Infrastructure.Repositories;

public class FileRepository : IFileRepository
{
    private readonly MongoDbContext _context;

    public FileRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<FileMetadata?> GetByIdAsync(string id)
    {
        return await _context.Files.Find(f => f.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<FileMetadata>> GetByFolderIdAsync(string folderId)
    {
        return await _context.Files.Find(f => f.FolderId == folderId).ToListAsync();
    }

    public async Task<FileMetadata> CreateAsync(FileMetadata file)
    {
        await _context.Files.InsertOneAsync(file);
        return file;
    }

    public async Task<bool> UpdateAsync(FileMetadata file)
    {
        var result = await _context.Files.ReplaceOneAsync(f => f.Id == file.Id, file);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Files.DeleteOneAsync(f => f.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> DeleteByFolderIdAsync(string folderId)
    {
        var result = await _context.Files.DeleteManyAsync(f => f.FolderId == folderId);
        return result.DeletedCount > 0;
    }
}

