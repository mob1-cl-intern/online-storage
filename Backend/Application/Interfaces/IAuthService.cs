using Backend.Domain.Models;

namespace Backend.Application.Interfaces;

public interface IAuthService
{
    Task<(User user, string token)?> LoginAsync(string username, string password);
    Task<User?> GetUserByIdAsync(string userId);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

