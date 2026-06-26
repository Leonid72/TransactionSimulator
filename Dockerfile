FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TransactionSimulator.Api/TransactionSimulator.Api.csproj", "TransactionSimulator.Api/"]
RUN dotnet restore "TransactionSimulator.Api/TransactionSimulator.Api.csproj"
COPY . .
WORKDIR "/src/TransactionSimulator.Api"
RUN dotnet build "TransactionSimulator.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TransactionSimulator.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TransactionSimulator.Api.dll"]
