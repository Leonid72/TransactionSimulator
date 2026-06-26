namespace TransactionSimulator.Api.Features.Transactions;

public class TransactionResponse
{
    public Guid Id { get; set; }
    public string CardHolder { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public string LocalTime { get; set; } = string.Empty;
    public DateTime SubmittedAtUtc { get; set; }
}
