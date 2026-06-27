# ============================================================
# Azure Infrastructure Setup — Transaction Simulator
# Run once to provision all Azure resources
# ============================================================

param(
    [string]$SubscriptionId = "3a0d450e-e01d-477d-a656-8e781681633e",
    [string]$ResourceGroup  = "transaction-simulator-rg",
    [string]$Location       = "eastus",
    [string]$AcrName        = "transactionsimulatoracr",
    [string]$EnvName        = "transaction-simulator-env",
    [string]$SqlServerName  = "transaction-sql-server",
    [string]$SqlDbName      = "TransactionSimulatorDb",
    [string]$SqlAdminUser   = "sqladmin",
    [string]$SqlAdminPass   = "TxSim@2026!",
    [string]$JwtKey         = "AZURE_PROD_JWT_KEY_CHANGE_ME_32_PLUS_CHARS"
)

Write-Host "Setting subscription..." -ForegroundColor Cyan
az account set --subscription $SubscriptionId

# ── Resource Group ────────────────────────────────────────────
Write-Host "`nCreating Resource Group..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location

# ── Azure Container Registry ──────────────────────────────────
Write-Host "`nCreating Azure Container Registry (Basic)..." -ForegroundColor Cyan
az acr create `
    --resource-group $ResourceGroup `
    --name $AcrName `
    --sku Basic `
    --admin-enabled true

$AcrLoginServer = az acr show --name $AcrName --query loginServer -o tsv
$AcrUsername    = az acr credential show --name $AcrName --query username -o tsv
$AcrPassword    = az acr credential show --name $AcrName --query "passwords[0].value" -o tsv

Write-Host "ACR: $AcrLoginServer" -ForegroundColor Green

# ── Azure SQL Server + Database (Basic — cheapest ~$5/mo) ─────
Write-Host "`nCreating Azure SQL Server..." -ForegroundColor Cyan
az sql server create `
    --resource-group $ResourceGroup `
    --name $SqlServerName `
    --location $Location `
    --admin-user $SqlAdminUser `
    --admin-password $SqlAdminPass

Write-Host "Creating Azure SQL Database (Basic tier)..." -ForegroundColor Cyan
az sql db create `
    --resource-group $ResourceGroup `
    --server $SqlServerName `
    --name $SqlDbName `
    --edition Basic `
    --capacity 5

# Allow Azure services to access SQL Server
az sql server firewall-rule create `
    --resource-group $ResourceGroup `
    --server $SqlServerName `
    --name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

$SqlConnectionString = "Server=tcp:$SqlServerName.database.windows.net,1433;Database=$SqlDbName;User Id=$SqlAdminUser;Password=$SqlAdminPass;Encrypt=True;TrustServerCertificate=False;"
Write-Host "SQL Connection ready" -ForegroundColor Green

# ── Container Apps Environment ────────────────────────────────
Write-Host "`nCreating Container Apps Environment..." -ForegroundColor Cyan
az containerapp env create `
    --resource-group $ResourceGroup `
    --name $EnvName `
    --location $Location

# ── API Container App ─────────────────────────────────────────
Write-Host "`nCreating API Container App..." -ForegroundColor Cyan
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

Write-Host "API URL: https://$ApiUrl" -ForegroundColor Green

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

Write-Host "Client URL: https://$ClientUrl" -ForegroundColor Green

# ── GitHub Actions Secret ─────────────────────────────────────
Write-Host "`nGenerating Azure Credentials for GitHub Actions..." -ForegroundColor Cyan
az ad sp create-for-rbac `
    --name "transaction-simulator-github" `
    --role contributor `
    --scopes "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup" `
    --json-auth

Write-Host "`n============================================" -ForegroundColor Yellow
Write-Host "Copy the JSON above and add it to GitHub:" -ForegroundColor Yellow
Write-Host "Settings → Secrets → Actions → AZURE_CREDENTIALS" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

Write-Host "`nDone! Resources created:" -ForegroundColor Green
Write-Host "  ACR:    $AcrLoginServer"
Write-Host "  SQL:    $SqlServerName.database.windows.net"
Write-Host "  API:    https://$ApiUrl"
Write-Host "  Client: https://$ClientUrl"
