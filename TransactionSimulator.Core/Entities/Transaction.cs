namespace TransactionSimulator.Core.Entities;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public string CardHolder { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public int Hour { get; set; }
    public int Minute { get; set; }
    public TransactionStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
}
