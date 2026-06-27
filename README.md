# Transaction Simulator

A full-stack web application that simulates banking transaction approvals based on regional banking hours.

---

## How It Works

A transaction is **Approved** if the submitted time falls within standard banking hours **(08:00–18:00)** of the selected region. Otherwise it is **Rejected**.

The user selects a region and provides a local time — the backend validates whether that time is within banking hours for that country.

---

## Tech Stack

### Backend — `TransactionSimulator.Api`
| Technology | Purpose |
|---|---|
| .NET 8 Minimal API | REST API framework |
| ASP.NET Core Identity | User registration & password management |
| JWT Bearer | Authentication tokens |
| Entity Framework Core 8 | ORM / database access |
| SQL Server (MSSQL) | Database |
| FluentValidation | Request validation |
| Swashbuckle / Swagger | API documentation |
| Docker | Containerization |

### Frontend — `TransactionSimulator.Client`
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool / dev server |
| Axios | HTTP client |

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
│   ├── Program.cs                            # App entry point, DI, middleware
│   ├── appsettings.json                      # Base configuration
│   ├── appsettings.Development.json          # Dev overrides (JWT, CORS, logging)
│   │
│   ├── Common/                               # Cross-cutting concerns
│   │   ├── ApiResponse.cs                    # Unified response wrapper
│   │   ├── ErrorHandlingMiddleware.cs        # Global exception handler + DB logging
│   │   ├── JwtOptions.cs                     # JWT configuration model
│   │   └── RegionTimezones.cs                # IANA / Windows timezone resolver
│   │
│   ├── Data/                                 # Data access layer
│   │   ├── AppDbContext.cs                   # EF Core DbContext
│   │   ├── AppDbContextFactory.cs            # Design-time factory for migrations
│   │   ├── Entities/
│   │   │   ├── AppUser.cs                    # Identity user
│   │   │   ├── Transaction.cs                # Transaction entity
│   │   │   ├── TransactionStatus.cs          # Enum: Approved / Rejected
│   │   │   └── ApplicationLog.cs             # Error log entity
│   │   └── Migrations/                       # EF Core migrations
│   │
│   ├── Endpoints/                            # IEndpoint infrastructure
│   │   ├── IEndpoint.cs
│   │   └── EndpointExtensions.cs             # AddEndpoints / MapEndpoints
│   │
│   ├── Extensions/                           # Service registration extensions
│   │   ├── DatabaseExtensions.cs             # AddDatabase / ApplyMigrationsAsync
│   │   ├── IdentityExtensions.cs             # AddIdentityServices (Identity + JWT)
│   │   ├── SwaggerExtensions.cs              # AddSwaggerWithJwt / UseSwaggerWithUI
│   │   ├── CorsExtensions.cs                 # AddCorsPolicy
│   │   └── SubmitTransactionSchemaFilter.cs  # Swagger dropdowns for region
│   │
│   └── Features/                             # Vertical slice features
│       ├── Auth/
│       │   ├── IAuthService.cs
│       │   ├── AuthService.cs                # Register, Login, JWT generation
│       │   ├── AuthEndpoints.cs              # POST /api/auth/register & /login
│       │   ├── LoginRequest.cs / LoginResponse.cs
│       │   ├── RegisterRequest.cs
│       │   ├── LoginRequestValidator.cs
│       │   └── RegisterRequestValidator.cs
│       └── Transactions/
│           ├── ITransactionService.cs
│           ├── TransactionService.cs         # Banking hours logic
│           ├── TransactionsEndpoints.cs      # POST /submit & GET /approved
│           ├── SubmitTransactionRequest.cs
│           ├── SubmitTransactionRequestValidator.cs
│           └── TransactionResponse.cs
│
└── TransactionSimulator.Client/              # React Frontend
    ├── Dockerfile
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── context/
    │   │   ├── AuthContext.tsx               # JWT token management
    │   │   └── LanguageContext.tsx           # i18n support
    │   ├── pages/
    │   │   ├── AuthPage/                     # Login / Register
    │   │   └── MainPage/                     # Transaction simulator
    │   └── components/
    │       ├── Header/
    │       ├── TimePicker/                   # Hour & minute selector
    │       ├── CountrySearch/                # Region selector
    │       ├── SimulatorSection/             # Submit transaction form
    │       ├── ApprovedTransactions/         # Display approved results
    │       └── Toast/                        # Notifications
    └── package.json
```

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
| GET | `/health` | Public | Service and database status |

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
| API Swagger | http://localhost:8080/swagger |
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
API runs on: `https://localhost:7217`
Swagger: `https://localhost:7217/swagger`

#### 3. Run the React Client
```bash
cd TransactionSimulator.Client
npm install
npm run dev
```
Client runs on: `http://localhost:5173`

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
  }
}
```

### Docker Environment Variables
Configured in `docker-compose.yml`:
- `ASPNETCORE_ENVIRONMENT` — `Docker`
- `ConnectionStrings__DefaultConnection` — SQL Server connection
- `Jwt__Key` — JWT signing key
- `ASPNETCORE_URLS` — `http://+:8080`

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
