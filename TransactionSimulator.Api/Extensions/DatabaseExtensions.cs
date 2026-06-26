using Microsoft.EntityFrameworkCore;
using TransactionSimulator.Api.Data;

namespace TransactionSimulator.Api.Extensions;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
        return services;
    }

    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        var apply = app.Configuration.GetValue("Database:ApplyMigrationsOnStartup", true);
        if (!apply) return;

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }
}
