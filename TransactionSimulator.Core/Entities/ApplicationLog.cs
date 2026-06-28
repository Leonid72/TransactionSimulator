namespace TransactionSimulator.Core.Entities;

public class ApplicationLog
{
    public long Id { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? TraceId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
