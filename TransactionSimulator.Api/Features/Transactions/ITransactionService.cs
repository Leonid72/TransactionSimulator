using System.Security.Claims;

namespace TransactionSimulator.Api.Features.Transactions;

public interface ITransactionService
{
    Task<TransactionResponse> SubmitAsync(SubmitTransactionRequest request, ClaimsPrincipal user);
    Task<List<TransactionResponse>> GetApprovedAsync(ClaimsPrincipal user);
}
