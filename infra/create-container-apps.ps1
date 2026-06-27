# ============================================================
# Create Container Apps — run AFTER push-images.ps1
# ============================================================

param(
    [string]$ResourceGroup = "transaction-simulator-rg",
    [string]$EnvName       = "transaction-simulator-env",
    [string]$AcrName       = "transactionsimulatoracr",
    [string]$SqlServerName = "transaction-sql-server",
    [string]$SqlDbName     = "TransactionSimulatorDb",
    [string]$SqlAdminUser  = "sqladmin",
    [string]$SqlAdminPass  = "TxSim@2026!",
    [string]$JwtKey        = "AZURE_PROD_JWT_KEY_CHANGE_ME_32_PLUS_CHARS"
)

$AcrLoginServer = az acr show --name $AcrName --query loginServer -o tsv
$AcrUsername    = az acr credential show --name $AcrName --query username -o tsv
$AcrPassword    = az acr credential show --name $AcrName --query "passwords[0].value" -o tsv
$SqlConnectionString = "Server=tcp:$SqlServerName.database.windows.net,1433;Database=$SqlDbName;User Id=$SqlAdminUser;Password=$SqlAdminPass;Encrypt=True;TrustServerCertificate=False;"

# ── API Container App ─────────────────────────────────────────
Write-Host "Creating API Container App..." -ForegroundColor Cyan
az containerapp create `
    --resource-group $ResourceGroup `
    --name "transaction-api" `
    --environment $EnvName `
    --image "$AcrLoginServer/transaction-api:latest" `
    --registry-server $AcrLoginServer `
    --registry-username $AcrUsername `
    --registry-password $AcrPassword `
    --target-port 8080 `
    --ingress external `
    --min-replicas 0 `
    --max-replicas 2 `
    --cpu 0.25 `
    --memory 0.5Gi `
    --env-vars `
        "ASPNETCORE_ENVIRONMENT=Production" `
        "ASPNETCORE_URLS=http://+:8080" `
        "Database__ApplyMigrationsOnStartup=true" `
        "ConnectionStrings__DefaultConnection=$SqlConnectionString" `
        "Jwt__Issuer=TransactionSimulator.Api" `
        "Jwt__Audience=TransactionSimulator.Client" `
        "Jwt__Key=$JwtKey" `
        "Jwt__ExpiresMinutes=60"

$ApiUrl = az containerapp show `
    --resource-group $ResourceGroup `
    --name "transaction-api" `
    --query properties.configuration.ingress.fqdn -o tsv

Write-Host "API: https://$ApiUrl" -ForegroundColor Green

# ── Client Container App ──────────────────────────────────────
Write-Host "`nCreating Client Container App..." -ForegroundColor Cyan
az containerapp create `
    --resource-group $ResourceGroup `
    --name "transaction-client" `
    --environment $EnvName `
    --image "$AcrLoginServer/transaction-client:latest" `
    --registry-server $AcrLoginServer `
    --registry-username $AcrUsername `
    --registry-password $AcrPassword `
    --target-port 80 `
    --ingress external `
    --min-replicas 0 `
    --max-replicas 2 `
    --cpu 0.25 `
    --memory 0.5Gi

$ClientUrl = az containerapp show `
    --resource-group $ResourceGroup `
    --name "transaction-client" `
    --query properties.configuration.ingress.fqdn -o tsv

Write-Host "Client: https://$ClientUrl" -ForegroundColor Green

# ── GitHub Actions credentials ────────────────────────────────
Write-Host "`nGenerating GitHub Actions secret..." -ForegroundColor Yellow
$SubscriptionId = az account show --query id -o tsv
az ad sp create-for-rbac `
    --name "transaction-simulator-github" `
    --role contributor `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup" `
    --json-auth

Write-Host "`n================================================" -ForegroundColor Yellow
Write-Host "Add JSON above to GitHub Secrets as:" -ForegroundColor Yellow
Write-Host "  AZURE_CREDENTIALS" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "`nAll done!" -ForegroundColor Green
Write-Host "  API:    https://$ApiUrl"
Write-Host "  Client: https://$ClientUrl"
