using FluentValidation;
using TransactionSimulator.Api.Common;
using TransactionSimulator.Api.Data;
using TransactionSimulator.Api.Endpoints;
using TransactionSimulator.Api.Extensions;
using TransactionSimulator.Api.Features.Auth;
using TransactionSimulator.Api.Features.Transactions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddEndpoints();

var app = builder.Build();

await app.ApplyMigrationsAsync();

app.UseMiddleware<ErrorHandlingMiddleware>();

var showSwagger = app.Environment.IsDevelopment()
                  || app.Environment.IsEnvironment("Docker");

if (showSwagger)
    app.UseSwaggerWithUI();

app.UseHttpsRedirection();
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", async (AppDbContext db) =>
{
    var dbHealthy = await db.Database.CanConnectAsync();

    return dbHealthy
        ? Results.Ok(ApiResponse<object>.Success(new
        {
            Status    = "Healthy",
            Database  = "Connected",
            Timestamp = DateTime.UtcNow
        }, "Service is healthy"))
        : Results.Json(ApiResponse<object>.Success(new
        {
            Status    = "Unhealthy",
            Database  = "Disconnected",
            Timestamp = DateTime.UtcNow
        }, "Database unavailable"), statusCode: 503);
})
.AllowAnonymous()
.WithTags("Health")
.WithSummary("Health check")
.WithDescription("Returns service and database status.")
.Produces<ApiResponse<object>>(200)
.Produces<ApiResponse<object>>(503);

app.MapEndpoints();

app.Run();
