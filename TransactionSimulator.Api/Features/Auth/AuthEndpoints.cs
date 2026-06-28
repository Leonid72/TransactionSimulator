using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using TransactionSimulator.Api.Endpoints;
using TransactionSimulator.Core.Common;
using TransactionSimulator.Core.Contracts.Auth;
using TransactionSimulator.Core.Interfaces;

namespace TransactionSimulator.Api.Features.Auth;

public static class AuthEndpoints
{
    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth")
                           .AllowAnonymous()
                           .WithTags("Auth");

            group.MapPost("/register", RegisterHandler)
                 .WithSummary("Register a new user")
                 .WithDescription("""
                     Creates a new user account.

                     Password requirements:
                     - Minimum 8 characters
                     - At least one uppercase letter (A–Z)
                     - At least one lowercase letter (a–z)
                     - At least one digit (0–9)
                     """);

            group.MapPost("/login", LoginHandler)
                 .WithSummary("Login");
        }
    }

    public static async Task<Ok<ApiResponse<object>>> RegisterHandler(
        RegisterRequest request,
        IValidator<RegisterRequest> validator,
        IAuthService authService)
    {
        await validator.ValidateAndThrowAsync(request);
        var userId = await authService.RegisterAsync(request);
        return TypedResults.Ok(ApiResponse<object>.Success(new { UserId = userId }, "User registered"));
    }

    public static async Task<Ok<ApiResponse<LoginResponse>>> LoginHandler(
        LoginRequest request,
        IValidator<LoginRequest> validator,
        IAuthService authService)
    {
        await validator.ValidateAndThrowAsync(request);
        var result = await authService.LoginAsync(request);
        return TypedResults.Ok(ApiResponse<LoginResponse>.Success(result, "Authenticated"));
    }
}
