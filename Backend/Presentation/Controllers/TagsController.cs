using Backend.Application.Interfaces;
using Backend.Presentation.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TagsController : ControllerBase
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TagDto>>> GetAll()
    {
        var tags = await _tagService.GetAllAsync();
        
        var tagDtos = tags.Select(t => new TagDto
        {
            Id = t.Id,
            Name = t.Name,
            Color = t.Color
        }).ToList();

        return Ok(tagDtos);
    }

    [HttpPost]
    public async Task<ActionResult<TagDto>> Create([FromBody] CreateTagRequestDto request)
    {
        var tag = await _tagService.CreateAsync(request.Name, request.Color);
        
        return Ok(new TagDto
        {
            Id = tag.Id,
            Name = tag.Name,
            Color = tag.Color
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TagDto>> Update(string id, [FromBody] UpdateTagRequestDto request)
    {
        var tag = await _tagService.UpdateAsync(id, request.Name, request.Color);
        
        if (tag == null)
        {
            return NotFound();
        }

        return Ok(new TagDto
        {
            Id = tag.Id,
            Name = tag.Name,
            Color = tag.Color
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _tagService.DeleteAsync(id);
        
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}

