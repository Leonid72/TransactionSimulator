FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TransactionSimulator.Api.csproj", "."]
RUN dotnet restore "TransactionSimulator.Api.csproj"
COPY . .
RUN dotnet build "TransactionSimulator.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TransactionSimulator.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TransactionSimulator.Api.dll"]
