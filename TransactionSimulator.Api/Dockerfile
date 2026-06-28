FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for all 3 projects
COPY ["TransactionSimulator.Api/TransactionSimulator.Api.csproj", "TransactionSimulator.Api/"]
COPY ["TransactionSimulator.Core/TransactionSimulator.Core.csproj", "TransactionSimulator.Core/"]
COPY ["TransactionSimulator.Infrastructure/TransactionSimulator.Infrastructure.csproj", "TransactionSimulator.Infrastructure/"]

RUN dotnet restore "TransactionSimulator.Api/TransactionSimulator.Api.csproj"

# Copy all source code
COPY . .

RUN dotnet publish "TransactionSimulator.Api/TransactionSimulator.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TransactionSimulator.Api.dll"]
