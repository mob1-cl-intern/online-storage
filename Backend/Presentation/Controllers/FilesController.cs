using Backend.Application.Interfaces;
using Backend.Infrastructure.Interfaces;
using Backend.Presentation.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly IFileStorageService _storageService;
    private readonly IConfiguration _configuration;

    public FilesController(IFileService fileService, IFileStorageService storageService, IConfiguration configuration)
    {
        _fileService = fileService;
        _storageService = storageService;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<List<FileDto>>> GetByFolderId([FromQuery] string folderId)
    {
        var files = await _fileService.GetByFolderIdAsync(folderId);
        
        var fileDtos = files.Select(f => new FileDto
        {
            Id = f.Id,
            Name = f.Name,
            FolderId = f.FolderId,
            Type = f.Type,
            Size = f.Size,
            Url = $"/api/files/{f.Id}/content",
            ThumbnailUrl = f.Type == "image" ? $"/api/files/{f.Id}/content" : null,
            Tags = f.Tags,
            CreatedAt = f.CreatedAt
        }).ToList();

        return Ok(fileDtos);
    }

    [HttpPost("upload")]
    public async Task<ActionResult<FileDto>> Upload([FromForm] UploadFileRequestDto request)
    {
        try
        {
            var tagList = string.IsNullOrEmpty(request.Tags) 
                ? new List<string>() 
                : request.Tags.Split(',').Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList();

            var metadata = await _fileService.UploadAsync(request.File, request.FolderId, tagList);
            
            return Ok(new FileDto
            {
                Id = metadata.Id,
                Name = metadata.Name,
                FolderId = metadata.FolderId,
                Type = metadata.Type,
                Size = metadata.Size,
                Url = $"/api/files/{metadata.Id}/content",
                ThumbnailUrl = metadata.Type == "image" ? $"/api/files/{metadata.Id}/content" : null,
                Tags = metadata.Tags,
                CreatedAt = metadata.CreatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _fileService.DeleteAsync(id);
        
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPut("{id}/tags")]
    public async Task<ActionResult<FileDto>> UpdateTags(string id, [FromBody] UpdateFileTagsRequestDto request)
    {
        var file = await _fileService.UpdateTagsAsync(id, request.Tags);
        
        if (file == null)
        {
            return NotFound();
        }

        return Ok(new FileDto
        {
            Id = file.Id,
            Name = file.Name,
            FolderId = file.FolderId,
            Type = file.Type,
            Size = file.Size,
            Url = $"/api/files/{file.Id}/content",
            ThumbnailUrl = file.Type == "image" ? $"/api/files/{file.Id}/content" : null,
            Tags = file.Tags,
            CreatedAt = file.CreatedAt
        });
    }

    [HttpGet("{id}/content")]
    [AllowAnonymous]
    public async Task<ActionResult> GetFileContent(string id)
    {
        var file = await _fileService.GetByIdAsync(id);
        
        if (file == null)
        {
            return NotFound();
        }

        var fileBytes = await _storageService.GetFileAsync(file.Path);
        
        if (fileBytes == null)
        {
            return NotFound();
        }

        var contentType = file.Type == "image" 
            ? GetImageContentType(file.Name)
            : "application/pdf";

        return File(fileBytes, contentType);
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> DownloadFile(string id)
    {
        var file = await _fileService.GetByIdAsync(id);
        
        if (file == null)
        {
            return NotFound();
        }

        var fileBytes = await _storageService.GetFileAsync(file.Path);
        
        if (fileBytes == null)
        {
            return NotFound();
        }

        var contentType = file.Type == "image" 
            ? GetImageContentType(file.Name)
            : "application/pdf";

        return File(fileBytes, contentType, file.Name);
    }

    private string GetImageContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".bmp" => "image/bmp",
            _ => "application/octet-stream"
        };
    }
}

