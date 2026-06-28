using System.Security.Claims;
using TransactionSimulator.Core.Contracts.Transactions;

namespace TransactionSimulator.Core.Interfaces;

public interface ITransactionService
{
    Task<TransactionResponse> SubmitAsync(SubmitTransactionRequest request, ClaimsPrincipal user);
    Task<List<TransactionResponse>> GetApprovedAsync(ClaimsPrincipal user);
}
