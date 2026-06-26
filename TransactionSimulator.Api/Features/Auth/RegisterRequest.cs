namespace TransactionSimulator.Api.Features.Auth;

public record RegisterRequest(string Email, string Password, string? FullName = null);
