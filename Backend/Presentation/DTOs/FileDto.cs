using Microsoft.AspNetCore.Http;

namespace Backend.Presentation.DTOs;

public class FileDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FolderId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class UploadFileRequestDto
{
    public IFormFile File { get; set; } = null!;
    public string FolderId { get; set; } = string.Empty;
    public string? Tags { get; set; }
}

public class UpdateFileTagsRequestDto
{
    public List<string> Tags { get; set; } = new();
}

public class FileAccessTokenDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

