# ============================================================
# Build and push Docker images to ACR
# Run this AFTER azure-setup.ps1
# ============================================================

param(
    [string]$AcrName = "transactionsimulatoracr"
)

$AcrLoginServer = az acr show --name $AcrName --query loginServer -o tsv
Write-Host "ACR: $AcrLoginServer" -ForegroundColor Cyan

Write-Host "`nLogging in to ACR..." -ForegroundColor Cyan
az acr login --name $AcrName

Write-Host "`nBuilding API image..." -ForegroundColor Cyan
docker build -t "$AcrLoginServer/transaction-api:latest" "D:\Projects\TransactionSimulator\TransactionSimulator.Api"

Write-Host "`nBuilding Client image..." -ForegroundColor Cyan
docker build -t "$AcrLoginServer/transaction-client:latest" "D:\Projects\TransactionSimulator\TransactionSimulator.Client"

Write-Host "`nPushing images to ACR..." -ForegroundColor Cyan
docker push "$AcrLoginServer/transaction-api:latest"
docker push "$AcrLoginServer/transaction-client:latest"

Write-Host "`nImages pushed successfully!" -ForegroundColor Green
Write-Host "  $AcrLoginServer/transaction-api:latest"
Write-Host "  $AcrLoginServer/transaction-client:latest"
