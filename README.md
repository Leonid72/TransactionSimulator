# Transaction Simulator

A full-stack web application that simulates banking transaction approvals based on regional banking hours.

---

## How It Works

A transaction is **Approved** if the submitted time falls within standard banking hours **(08:00–18:00)** of the selected region. Otherwise it is **Rejected**.

The user selects a region and provides a local time (hour and minute) — the backend checks whether that time falls within banking hours for that country.

---

## Tech Stack

### Backend — `TransactionSimulator.Api`
| Technology | Purpose |
|---|---|
| .NET 8 Minimal API | REST API framework |
| ASP.NET Core Identity | User registration & password hashing |
| JWT Bearer | Stateless authentication tokens |
| Entity Framework Core 8 | ORM / database access |
| SQL Server (MSSQL) | Relational database |
| FluentValidation | Request validation |
| Swashbuckle / Swagger | Interactive API documentation |
| Docker | Containerization |

### Frontend — `TransactionSimulator.Client`
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool / dev server |
| Axios | HTTP client with interceptors |
| Nginx | Static file server + reverse proxy |

---

## Project Structure

```
TransactionSimulator/
├── docker-compose.yml                        # Orchestrates API + SQL Server + Client
├── .gitignore
├── .dockerignore
│
├── TransactionSimulator.Api/                 # .NET 8 Backend
│   ├── Dockerfile
│   ├── Program.cs                            # App entry point, DI, middleware pipeline
│   ├── appsettings.json                      # Base configuration
│   ├── appsettings.Development.json          # Dev overrides (JWT, CORS, logging)
│   ├── appsettings.Production.json           # Production overrides
│   │
│   ├── Common/                               # Cross-cutting concerns
│   │   ├── ApiResponse.cs                    # Unified response wrapper ApiResponse<T>
│   │   ├── ErrorHandlingMiddleware.cs        # Global exception handler + DB logging
│   │   ├── JwtOptions.cs                     # JWT configuration model
│   │   └── RegionTimezones.cs                # IANA / Windows timezone resolver
│   │
│   ├── Data/                                 # Data access layer
│   │   ├── AppDbContext.cs                   # EF Core DbContext
│   │   ├── AppDbContextFactory.cs            # Design-time factory for migrations
│   │   ├── Entities/
│   │   │   ├── AppUser.cs                    # Identity user (extends IdentityUser)
│   │   │   ├── Transaction.cs                # Transaction entity
│   │   │   ├── TransactionStatus.cs          # Enum: Approved / Rejected
│   │   │   └── ApplicationLog.cs             # Error log entity
│   │   └── Migrations/                       # EF Core auto-generated migrations
│   │
│   ├── Endpoints/                            # IEndpoint infrastructure
│   │   ├── IEndpoint.cs                      # Interface: void MapEndpoint(app)
│   │   └── EndpointExtensions.cs             # Scans assembly, registers all IEndpoints
│   │
│   ├── Extensions/                           # Service registration extension methods
│   │   ├── DatabaseExtensions.cs             # AddDatabase / ApplyMigrationsAsync
│   │   ├── IdentityExtensions.cs             # AddIdentityServices (Identity + JWT via IOptions)
│   │   ├── SwaggerExtensions.cs              # AddSwaggerWithJwt / UseSwaggerWithUI
│   │   ├── CorsExtensions.cs                 # AddCorsPolicy (env-based origins)
│   │   └── SubmitTransactionSchemaFilter.cs  # Swagger region dropdown (ISchemaFilter)
│   │
│   └── Features/                             # Vertical slice architecture
│       ├── Auth/
│       │   ├── IAuthService.cs
│       │   ├── AuthService.cs                # Register, Login, JWT generation
│       │   ├── AuthEndpoints.cs              # POST /api/auth/register & /login
│       │   ├── LoginRequest.cs
│       │   ├── LoginResponse.cs
│       │   ├── RegisterRequest.cs
│       │   ├── LoginRequestValidator.cs
│       │   └── RegisterRequestValidator.cs
│       └── Transactions/
│           ├── ITransactionService.cs
│           ├── TransactionService.cs         # Banking hours business logic
│           ├── TransactionsEndpoints.cs      # POST /submit & GET /approved
│           ├── SubmitTransactionRequest.cs
│           ├── SubmitTransactionRequestValidator.cs
│           └── TransactionResponse.cs
│
└── TransactionSimulator.Client/              # React Frontend
    ├── Dockerfile                            # Multi-stage: Node build + Nginx serve
    ├── nginx.conf                            # Nginx config: static files + API proxy
    ├── src/
    │   ├── App.tsx                           # Route guard: Auth vs Main
    │   ├── main.tsx                          # React entry point
    │   ├── types/
    │   │   └── index.ts                      # TypeScript interfaces
    │   ├── api/
    │   │   ├── client.ts                     # Axios instance + interceptors
    │   │   ├── auth.ts                       # login / register API calls
    │   │   └── transactions.ts               # submit / getApproved API calls
    │   ├── context/
    │   │   ├── AuthContext.tsx               # JWT token state + localStorage
    │   │   └── LanguageContext.tsx           # i18n (English / Hebrew)
    │   ├── i18n/
    │   │   ├── en.ts                         # English translations
    │   │   └── he.ts                         # Hebrew translations
    │   ├── pages/
    │   │   ├── AuthPage/                     # Login / Register page
    │   │   └── MainPage/                     # Transaction simulator page
    │   └── components/
    │       ├── Header/                       # App header with logout
    │       ├── ShvaLogo/                     # Logo component
    │       ├── TimePicker/                   # Hour & minute selector
    │       ├── CountrySearch/                # Region selector with search
    │       ├── SimulatorSection/             # Submit transaction form
    │       ├── ApprovedTransactions/         # Approved results cards
    │       └── Toast/                        # Auto-close notifications
    └── package.json
```

---

## Backend — Patterns & Best Practices

### Vertical Slice Architecture
Each feature (Auth, Transactions) is self-contained in its own folder with its own endpoint, service, request/response models and validators. No shared layers that span features.

### IEndpoint Pattern
Instead of a single large `Program.cs` with all routes, each feature registers its own endpoints:
```csharp
public static class AuthEndpoints
{
    public class Endpoint : IEndpoint           // discovered automatically by DI scan
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth").AllowAnonymous().WithTags("Auth");
            group.MapPost("/register", RegisterHandler);
            group.MapPost("/login", LoginHandler);
        }
    }

    public static async Task<Ok<ApiResponse<object>>> RegisterHandler(...) { }
    public static async Task<Ok<ApiResponse<LoginResponse>>> LoginHandler(...) { }
}
```
`EndpointExtensions.AddEndpoints()` scans the assembly and registers all `IEndpoint` implementations via DI.

### Interface + Service Pattern
```csharp
// DI registration
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

// Endpoints depend on interfaces, not concrete classes
public static async Task Handler(ITransactionService transactionService, ...) { }
```

### TypedResults over Results
```csharp
// Returns Ok<ApiResponse<T>> — Swagger infers the response type automatically
// No need for .Produces<T>() annotations
public static async Task<Ok<ApiResponse<TransactionResponse>>> Handler(...)
    => TypedResults.Ok(ApiResponse<TransactionResponse>.Success(response, "..."));
```

### Unified Response Wrapper
All endpoints return the same shape:
```json
{
  "isSuccessful": true,
  "data": { ... },
  "message": "Transaction Approved."
}
```
Errors include `traceId` for correlation:
```json
{
  "isSuccessful": false,
  "message": "Validation failed",
  "traceId": "00-7335a4bea003..."
}
```

### Global Error Handling Middleware
`ErrorHandlingMiddleware` catches all exceptions and:
- Maps exception types to HTTP status codes (`ValidationException` → 422, `UnauthorizedAccessException` → 401, etc.)
- Logs errors to `ApplicationLogs` table in the DB (fire-and-forget with `ILogger` fallback if DB is down)
- Returns consistent `ApiResponse<object>` with `traceId`

### FluentValidation
Request validation is separated from handlers:
```csharp
// Validator — separate class
public class SubmitTransactionRequestValidator : AbstractValidator<SubmitTransactionRequest>
{
    public SubmitTransactionRequestValidator()
    {
        RuleFor(x => x.Region)
            .NotEmpty()
            .Must(r => RegionTimezones.Resolve(r) is not null)
            .WithMessage("Region must be one of: Israel, France, USA...");

        RuleFor(x => x.Hour).InclusiveBetween(0, 23);
        RuleFor(x => x.Minute).InclusiveBetween(0, 59);
    }
}

// Handler — one line validation
await validator.ValidateAndThrowAsync(request); // throws ValidationException if invalid
```

### IOptions Pattern for JWT
JWT configuration is injected via `IOptions<JwtOptions>` — not read directly from `IConfiguration`:
```csharp
services.Configure<JwtOptions>(configuration.GetSection("Jwt"));

services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((bearerOptions, jwtOptions) =>
    {
        bearerOptions.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwtOptions.Value.Issuer,
            // ...
        };
    });
```

### Extension Methods — Clean Program.cs
All service registrations are moved to extension methods:
```csharp
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddEndpoints();
```

### Record Types for Requests
```csharp
public record SubmitTransactionRequest(string Region, int Hour, int Minute);
public record LoginRequest(string Email, string Password);
```
Immutable, value equality, concise syntax — fully supported by FluentValidation.

---

## Frontend — Architecture

### JWT Storage
JWT token is stored in **`localStorage`**:

```typescript
// AuthContext.tsx
const signIn = (data: AuthData) => {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('userEmail', data.email);
  localStorage.setItem('userId', data.userId);
  setAuthData(data);
};
```

On app load, `AuthContext` initializes from `localStorage` — the user stays logged in after page refresh.

### Axios Interceptors
`src/api/client.ts` configures a single Axios instance with two interceptors:

**Request interceptor** — attaches JWT token to every request:
```typescript
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Response interceptor** — handles expired/invalid tokens:
```typescript
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/');
    // Auto-logout on 401 only for protected routes (not login/register)
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('accessToken');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);
```

### API Layer
All HTTP calls are centralized in `src/api/`:
```typescript
// auth.ts
export const login = (email: string, password: string) =>
  client.post<ApiResponse<AuthData>>('/auth/login', { email, password });

// transactions.ts
export const submitTransaction = (payload: SubmitRequest) =>
  client.post<ApiResponse<Transaction>>('/transactions/submit', payload);

export const getApprovedTransactions = () =>
  client.get<ApiResponse<Transaction[]>>('/transactions/approved');
```

### Route Guard
`App.tsx` acts as a route guard — renders either the auth page or main page based on auth state:
```typescript
export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainPage /> : <AuthPage />;
}
```

### Nginx — Reverse Proxy
In Docker, the React app is served by **Nginx** on port `3000`. Nginx proxies all `/api/` requests to the backend container:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    # Proxy /api/* → backend API container
    location /api/ {
        proxy_pass http://transaction-api:8080/api/;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }

    # SPA fallback — React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

This means the React client calls `/api/transactions/submit` (relative) — Nginx forwards it to `http://transaction-api:8080/api/transactions/submit`. No CORS issues in Docker since both client and API share the same origin from the browser's perspective.

### i18n — Multi-language
The app supports **English** and **Hebrew** via `LanguageContext`:
- Translations in `src/i18n/en.ts` and `src/i18n/he.ts`
- RTL layout support for Hebrew

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT token |

### Transactions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/transactions/submit` | JWT | Submit a transaction simulation |
| GET | `/api/transactions/approved` | JWT | Get approved transactions |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Service and database connectivity status |

---

### Register Request
```json
{
  "email": "user@example.com",
  "password": "Password1",
  "fullName": "John Doe"
}
```

**Password requirements:**
- Minimum 8 characters
- At least one uppercase letter (A–Z)
- At least one lowercase letter (a–z)
- At least one digit (0–9)

### Transaction Request
```json
{
  "region": "Israel",
  "hour": 14,
  "minute": 30
}
```

### Supported Regions
`Israel`, `France`, `USA`, `Japan`, `UK`, `Germany`, `India`

### Banking Hours
`08:00 – 18:00` local time of the selected region

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download) *(local development only)*
- [Node.js 18+](https://nodejs.org/) *(local development only)*

---

### Option 1 — Docker (Recommended)

Runs everything: SQL Server + API + Client

```bash
git clone https://github.com/Leonid72/TransactionSimulator.git
cd TransactionSimulator

docker-compose up -d
```

| Service | URL |
|---|---|
| React Client | http://localhost:3000 |
| API Swagger | http://localhost:8080/swagger/index.html |
| SQL Server | localhost:1433 |

To stop:
```bash
docker-compose down
```

---

### Option 2 — Local Development

#### 1. Start SQL Server via Docker
```bash
docker-compose up -d sqlserver
```

#### 2. Run the API
```bash
cd TransactionSimulator.Api
dotnet restore
dotnet run
```
- API: `https://localhost:7217`
- Swagger: `https://localhost:7217/swagger/index.html`

#### 3. Run the React Client
```bash
cd TransactionSimulator.Client
npm install
npm run dev
```
- Client: `http://localhost:5173`

---

## Configuration

### `appsettings.json`
```json
{
  "Database": {
    "ApplyMigrationsOnStartup": true
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=TransactionSimulatorDb;User Id=sa;Password=Admin123!;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "TransactionSimulator.Api",
    "Audience": "TransactionSimulator.Client",
    "Key": "YOUR_SECRET_KEY_32_CHARS_MINIMUM",
    "ExpiresMinutes": 60
  },
  "Cors": {
    "AllowedOrigins": []
  }
}
```

### Docker Environment Variables
Configured in `docker-compose.yml`:
- `ASPNETCORE_ENVIRONMENT` — `Docker`
- `ASPNETCORE_URLS` — `http://+:8080`
- `ConnectionStrings__DefaultConnection` — SQL Server connection string
- `Jwt__Key` — JWT signing key
- `Jwt__ExpiresMinutes` — Token expiry in minutes

---

## Database

- **Provider:** SQL Server (MSSQL)
- **Migrations:** Applied automatically on startup
- **Tables:** `AspNetUsers`, `AspNetUserClaims`, `Transactions`, `ApplicationLogs`

To create a new migration manually:
```bash
cd TransactionSimulator.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```
