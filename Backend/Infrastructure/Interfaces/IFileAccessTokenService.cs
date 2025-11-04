namespace Backend.Infrastructure.Interfaces;

public interface IFileAccessTokenService
{
    string GenerateAccessToken(string fileId, string userId);
    bool ValidateAccessToken(string token, string fileId);
}

