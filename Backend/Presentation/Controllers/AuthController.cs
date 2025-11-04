using Backend.Application.Interfaces;
using Backend.Presentation.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request.Username, request.Password);
        
        if (result == null)
        {
            return Unauthorized(new { message = "ユーザー名またはパスワードが正しくありません" });
        }

        var (user, token) = result.Value;
        
        return Ok(new LoginResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Token = token
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public ActionResult Logout()
    {
        // In JWT, logout is typically handled client-side by removing the token
        return Ok(new { message = "Successfully logged out" });
    }

    [HttpGet("user")]
    [Authorize]
    public async Task<ActionResult<UserResponseDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username
        });
    }
}

