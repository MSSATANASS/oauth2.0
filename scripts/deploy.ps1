# Automated Deployment Script
# Usage: ./scripts/deploy.ps1 [-Environment <production|preview>] [-SkipPipeline]

param (
    [string]$Environment = "preview",
    [switch]$SkipPipeline = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " DEPLOY STEP: $Message" -ForegroundColor Cyan
    Write-Host "========================================================`n"
}

# 1. Run Pipeline
if (-not $SkipPipeline) {
    Write-Step "Running CI Pipeline Pre-Deployment"
    ./scripts/pipeline.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Pipeline failed. Aborting deployment." -ForegroundColor Red
        exit 1
    }
}

# 2. Check Vercel CLI
Write-Step "Checking Vercel CLI"
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Vercel CLI not found." -ForegroundColor Red
    Write-Host "Please install it via: npm install -g vercel"
    Write-Host "Then run 'vercel login' to authenticate."
    exit 1
}

# 3. Deploy
Write-Step "Deploying to $Environment"

$deployArgs = @()
if ($Environment -eq "production") {
    $deployArgs += "--prod"
}

try {
    # Using Invoke-Expression or direct call
    Write-Host "Running: vercel $deployArgs"
    vercel $deployArgs
    
    if ($?) {
        Write-Host "`nDeployment initiated successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    exit 1
}