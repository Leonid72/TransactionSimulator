# Shva.TransactionSimulator.Api

Vertical Slice API for transaction simulation with ASP.NET Core Identity, EF Core, JWT authentication, FluentValidation, and global error handling.

## Implemented Requirements

- `IdentityUser` integration through `AppUser : IdentityUser`
- EF Core context based on `IdentityDbContext<AppUser, IdentityRole, string>`
- JWT generation and validation with claims/roles from database
- FluentValidation for auth and transaction request models
- Protected transaction endpoints via authorization
- Global exception middleware with unified `ApiResponse<T>` shape
- Endpoint extension methods (`IEndpointRouteBuilder`) for clean route mapping
- Environment-based configuration for local and cloud deployments

## Project Structure

- `Features/Auth`: register/login endpoints, models, validators, auth service
- `Features/Transactions`: submit/get-approved endpoints, models, validators, approval service
- `Data`: EF Core DbContext and entities
- `Common`: response contract, JWT options, error middleware

## Local Run

1. Update JWT key (`Jwt:Key`) with a strong secret.
2. Choose DB provider:
    - SQLite: use `appsettings.Sqlite.json` or keep `Database:Provider=Sqlite` in `appsettings.json`
    - SQL Server: set `Database:Provider=SqlServer` and update `ConnectionStrings:DefaultConnection`
3. Run migrations and start app.

The app also applies pending migrations automatically on startup when `Database:ApplyMigrationsOnStartup=true`.

### SQLite Commands

```bash
dotnet restore
dotnet ef migrations add InitialSqlite --output-dir Data/Migrations
dotnet ef database update
dotnet run
```

### SQL Server Commands

```bash
dotnet restore
dotnet ef migrations add InitialSqlServer --output-dir Data/Migrations
dotnet ef database update
dotnet run
```

## Cloud Configuration (Azure App Service / AWS App Runner)

Use environment variables instead of hardcoded secrets.

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`
- `Jwt__ExpiresMinutes`
- `ASPNETCORE_ENVIRONMENT=Production`

Apply schema changes in CI/CD or startup job:

```bash
dotnet ef database update
```

## Frontend JWT Security Guidance

Preferred strategy:

- Store refresh token in HttpOnly + Secure cookie
- Keep short-lived access token in memory (for SPA) or HttpOnly cookie for server-rendered clients
- Send token via `Authorization: Bearer <token>` for API calls
- Enforce HTTPS and strict CORS allowlist
- Avoid storing JWT in `localStorage` when possible

## Unified Response Contract

All handlers and middleware return:

```csharp
public class ApiResponse<T>
{
    public bool IsSuccessful { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string? TraceId { get; set; }
}
```
