using Backend.Domain.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Backend.Infrastructure.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<FileMetadata> Files => _database.GetCollection<FileMetadata>("files");
    public IMongoCollection<Folder> Folders => _database.GetCollection<Folder>("folders");
    public IMongoCollection<FileTag> Tags => _database.GetCollection<FileTag>("tags");
}

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}

