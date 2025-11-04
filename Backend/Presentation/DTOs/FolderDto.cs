namespace Backend.Presentation.DTOs;

public class FolderDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ParentId { get; set; }
    public List<FolderDto> Children { get; set; } = new();
}

public class CreateFolderRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string ParentId { get; set; } = string.Empty;
}

