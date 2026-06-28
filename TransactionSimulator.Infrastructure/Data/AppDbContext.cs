using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TransactionSimulator.Core.Entities;

namespace TransactionSimulator.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole, string>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<ApplicationLog> ApplicationLogs => Set<ApplicationLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Region).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20)
                  .IsRequired();
            entity.Property(x => x.CardHolder).HasMaxLength(200).IsRequired();
            entity.Property(x => x.UserId).IsRequired();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ApplicationLog>(entity =>
        {
            entity.ToTable("ApplicationLogs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Level).HasMaxLength(20).IsRequired();
            entity.Property(x => x.Message).HasMaxLength(2000).IsRequired();
        });
    }
}
