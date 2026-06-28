using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TransactionSimulator.Core.Contracts.Transactions;
using TransactionSimulator.Core.Entities;
using TransactionSimulator.Core.Interfaces;
using TransactionSimulator.Infrastructure.Data;

namespace TransactionSimulator.Api.Features.Transactions;

public class TransactionService(AppDbContext dbContext) : ITransactionService
{
    private const int BankingStart = 8;
    private const int BankingEnd   = 18;

    public async Task<TransactionResponse> SubmitAsync(SubmitTransactionRequest request, ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User identity is missing");

        var cardHolder = user.FindFirstValue(ClaimTypes.Name)
                         ?? user.FindFirstValue(ClaimTypes.Email)
                         ?? string.Empty;

        var withinHours = request.Hour >= BankingStart && request.Hour < BankingEnd;

        var transaction = new Transaction
        {
            UserId          = userId,
            CardHolder      = cardHolder,
            Region          = request.Region,
            Hour            = request.Hour,
            Minute          = request.Minute,
            SubmittedAtUtc  = DateTime.UtcNow,
            Status          = withinHours ? TransactionStatus.Approved : TransactionStatus.Rejected,
            RejectionReason = withinHours
                ? null
                : $"Submitted at {request.Hour:D2}:{request.Minute:D2} local time in {request.Region}. Banking hours: {BankingStart:D2}:00–{BankingEnd:D2}:00.",
        };

        dbContext.Transactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        return MapToResponse(transaction);
    }

    public async Task<List<TransactionResponse>> GetApprovedAsync(ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User identity is missing");

        return await dbContext.Transactions
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.Status == TransactionStatus.Approved)
            .OrderByDescending(x => x.SubmittedAtUtc)
            .Select(x => new TransactionResponse
            {
                Id              = x.Id,
                CardHolder      = x.CardHolder,
                Region          = x.Region,
                LocalTime       = $"{x.Hour:D2}:{x.Minute:D2}",
                Status          = x.Status.ToString(),
                RejectionReason = x.RejectionReason,
                SubmittedAtUtc  = x.SubmittedAtUtc,
            })
            .ToListAsync();
    }

    private static TransactionResponse MapToResponse(Transaction t) => new()
    {
        Id              = t.Id,
        CardHolder      = t.CardHolder,
        Region          = t.Region,
        LocalTime       = $"{t.Hour:D2}:{t.Minute:D2}",
        Status          = t.Status.ToString(),
        RejectionReason = t.RejectionReason,
        SubmittedAtUtc  = t.SubmittedAtUtc,
    };
}
