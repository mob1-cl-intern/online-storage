using Backend.Domain.Models;

namespace Backend.Infrastructure.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    string? ValidateToken(string token);
}

