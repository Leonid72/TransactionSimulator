using Microsoft.AspNetCore.Identity;

namespace TransactionSimulator.Api.Data.Entities;

public class AppUser : IdentityUser
{
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
