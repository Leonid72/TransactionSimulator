using TransactionSimulator.Core.Contracts.Auth;

namespace TransactionSimulator.Core.Interfaces;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
