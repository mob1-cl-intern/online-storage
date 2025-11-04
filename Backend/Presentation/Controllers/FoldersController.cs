using Backend.Application.Interfaces;
using Backend.Presentation.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoldersController : ControllerBase
{
    private readonly IFolderService _folderService;

    public FoldersController(IFolderService folderService)
    {
        _folderService = folderService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FolderDto>>> GetAll()
    {
        var folders = await _folderService.GetAllAsync();
        var folderDtos = BuildFolderTree(folders);
        return Ok(folderDtos);
    }

    [HttpPost]
    public async Task<ActionResult<FolderDto>> Create([FromBody] CreateFolderRequestDto request)
    {
        try
        {
            var folder = await _folderService.CreateAsync(request.Name, request.ParentId);
            
            return Ok(new FolderDto
            {
                Id = folder.Id,
                Name = folder.Name,
                ParentId = folder.ParentId,
                Children = new List<FolderDto>()
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
        var success = await _folderService.DeleteAsync(id);
        
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    private List<FolderDto> BuildFolderTree(List<Backend.Domain.Models.Folder> folders)
    {
        var folderMap = new Dictionary<string, FolderDto>();

        // Create DTOs for all folders
        foreach (var folder in folders)
        {
            folderMap[folder.Id] = new FolderDto
            {
                Id = folder.Id,
                Name = folder.Name,
                ParentId = folder.ParentId,
                Children = new List<FolderDto>()
            };
        }

        var roots = new List<FolderDto>();

        // Build tree structure
        foreach (var folder in folders)
        {
            var dto = folderMap[folder.Id];
            
            if (folder.ParentId == null)
            {
                roots.Add(dto);
            }
            else if (folderMap.ContainsKey(folder.ParentId))
            {
                folderMap[folder.ParentId].Children.Add(dto);
            }
        }

        return roots;
    }
}

