using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TransactionSimulator.Core.Common;
using TransactionSimulator.Core.Contracts.Auth;
using TransactionSimulator.Core.Entities;
using TransactionSimulator.Core.Interfaces;

namespace TransactionSimulator.Api.Features.Auth;

public class AuthService(
    UserManager<AppUser> userManager,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    public async Task<string> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            throw new InvalidOperationException("User already exists");

        var user = new AppUser { UserName = request.Email, Email = request.Email };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var message = string.Join("; ", createResult.Errors.Select(x => x.Description));
            throw new InvalidOperationException(message);
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
            await userManager.AddClaimAsync(user, new Claim(ClaimTypes.Name, request.FullName));

        return user.Id;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            throw new UnauthorizedAccessException("Invalid credentials");

        if (!await userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedAccessException("Invalid credentials");

        var now = DateTime.UtcNow;
        var expiresAtUtc = now.AddMinutes(jwtOptions.Value.ExpiresMinutes);
        var token = await GenerateJwtTokenAsync(user, now, expiresAtUtc);

        return new LoginResponse
        {
            AccessToken  = token,
            ExpiresAtUtc = expiresAtUtc,
            UserId       = user.Id,
            Email        = user.Email ?? string.Empty
        };
    }

    private async Task<string> GenerateJwtTokenAsync(AppUser user, DateTime issuedAtUtc, DateTime expiresAtUtc)
    {
        var userClaims = await userManager.GetClaimsAsync(user);
        var userRoles  = await userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(userClaims);
        claims.AddRange(userRoles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Value.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var jwt = new JwtSecurityToken(
            issuer:            jwtOptions.Value.Issuer,
            audience:          jwtOptions.Value.Audience,
            claims:            claims,
            notBefore:         issuedAtUtc,
            expires:           expiresAtUtc,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}
