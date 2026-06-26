using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TransactionSimulator.Api.Common;
using TransactionSimulator.Api.Data;
using TransactionSimulator.Api.Data.Entities;

namespace TransactionSimulator.Api.Features.Transactions;

public class TransactionService(AppDbContext dbContext) : ITransactionService
{
    private const int BankingStart = 8;
    private const int BankingEnd   = 18;

    public async Task<TransactionResponse> SubmitAsync(
        SubmitTransactionRequest request,
        ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User identity is missing");

        var cardHolder = user.FindFirstValue(ClaimTypes.Name)
                         ?? user.FindFirstValue(ClaimTypes.Email)
                         ?? string.Empty;

        var tz       = RegionTimezones.Resolve(request.Region)!;
        var utcNow   = DateTime.UtcNow;
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, tz);

        var withinHours = localNow.Hour >= BankingStart && localNow.Hour < BankingEnd;

        var transaction = new Transaction
        {
            UserId          = userId,
            CardHolder      = cardHolder,
            Amount          = request.Amount,
            Currency        = request.Currency.ToUpperInvariant(),
            Region          = request.Region,
            SubmittedAtUtc  = utcNow,
            LocalTime       = localNow,
            Status          = withinHours ? TransactionStatus.Approved : TransactionStatus.Rejected,
            RejectionReason = withinHours
                ? null
                : $"Submitted at {localNow:HH:mm} local time in {request.Region}. Banking hours: {BankingStart:D2}:00–{BankingEnd:D2}:00.",
        };

        dbContext.Transactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        return MapToResponse(transaction, localNow);
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
                Amount          = x.Amount,
                Currency        = x.Currency,
                Region          = x.Region,
                Status          = x.Status.ToString(),
                RejectionReason = x.RejectionReason,
                LocalTime       = x.LocalTime.ToString("yyyy-MM-dd HH:mm:ss"),
                SubmittedAtUtc  = x.SubmittedAtUtc,
            })
            .ToListAsync();
    }

    private static TransactionResponse MapToResponse(Transaction transaction, DateTime localNow) =>
        new()
        {
            Id              = transaction.Id,
            CardHolder      = transaction.CardHolder,
            Amount          = transaction.Amount,
            Currency        = transaction.Currency,
            Region          = transaction.Region,
            Status          = transaction.Status.ToString(),
            RejectionReason = transaction.RejectionReason,
            LocalTime       = localNow.ToString("yyyy-MM-dd HH:mm:ss"),
            SubmittedAtUtc  = transaction.SubmittedAtUtc,
        };
}
