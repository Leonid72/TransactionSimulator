namespace TransactionSimulator.Api.Data.Entities;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public string CardHolder { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Region { get; set; } = string.Empty;
    public TransactionStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime LocalTime { get; set; }

    public AppUser? User { get; set; }
}
