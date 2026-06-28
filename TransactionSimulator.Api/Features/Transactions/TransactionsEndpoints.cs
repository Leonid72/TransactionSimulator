using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using TransactionSimulator.Api.Endpoints;
using TransactionSimulator.Core.Common;
using TransactionSimulator.Core.Contracts.Transactions;
using TransactionSimulator.Core.Interfaces;

namespace TransactionSimulator.Api.Features.Transactions;

public static class TransactionsEndpoints
{
    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/transactions")
                           .RequireAuthorization()
                           .WithTags("Transactions");

            group.MapPost("/submit", SubmitHandler)
                 .WithSummary("Submit a transaction");

            group.MapGet("/approved", GetApprovedHandler)
                 .WithName("GetApprovedTransactions")
                 .WithSummary("Get approved transactions")
                 .WithDescription("Returns only Approved transactions to display in the bottom cards.");
        }
    }

    public static async Task<Ok<ApiResponse<TransactionResponse>>> SubmitHandler(
        SubmitTransactionRequest request,
        IValidator<SubmitTransactionRequest> validator,
        ITransactionService transactionService,
        ClaimsPrincipal user)
    {
        await validator.ValidateAndThrowAsync(request);

        var response = await transactionService.SubmitAsync(request, user);

        return TypedResults.Ok(ApiResponse<TransactionResponse>.Success(
            response, $"Transaction {response.Status}."));
    }

    public static async Task<Ok<ApiResponse<List<TransactionResponse>>>> GetApprovedHandler(
        ITransactionService transactionService,
        ClaimsPrincipal user)
    {
        var rows = await transactionService.GetApprovedAsync(user);

        var message = rows.Count == 0
            ? "No approved transactions found."
            : $"{rows.Count} approved transaction(s) found.";

        return TypedResults.Ok(ApiResponse<List<TransactionResponse>>.Success(rows, message));
    }
}
