using Microsoft.AspNetCore.Identity;

namespace TransactionSimulator.Core.Entities;

public class AppUser : IdentityUser
{
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
