# Local CI Pipeline Script
# Usage: ./scripts/pipeline.ps1 [-InstallDeps] [-SkipTests]

param (
    [switch]$InstallDeps = $false,
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " STEP: $Message" -ForegroundColor Cyan
    Write-Host "========================================================`n"
}

function Write-Success {
    param([string]$Message)
    Write-Host "`n[SUCCESS] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "`n[ERROR] $Message" -ForegroundColor Red
    exit 1
}

# 1. Environment Check
Write-Step "Checking Environment"
Write-Host "Node Version: $(node -v)"
Write-Host "NPM Version: $(npm -v)"

# 2. Dependencies
if ($InstallDeps) {
    Write-Step "Installing Dependencies (Clean Install)"
    try {
        npm ci
        Write-Success "Dependencies installed."
    } catch {
        Write-ErrorMsg "Dependency installation failed."
    }
} else {
    Write-Host "Skipping dependency install (use -InstallDeps to force)."
}

# 3. Linting
Write-Step "Running Linter"
try {
    npm run lint
    Write-Success "Linting passed."
} catch {
    Write-ErrorMsg "Linting failed. Please fix code style issues."
}

# 4. Testing
if (-not $SkipTests) {
    Write-Step "Running Tests (Unit & Integration)"
    # Set mock env vars for testing
    $env:NEXT_PUBLIC_SUPABASE_URL="https://mock.supabase.co"
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="mock-anon-key"
    $env:SUPABASE_SERVICE_ROLE_KEY="mock-service-role-key"
    
    try {
        npm test
        Write-Success "Tests passed."
    } catch {
        Write-ErrorMsg "Tests failed."
    }
}

# 5. Build
Write-Step "Building Application"
try {
    npm run build
    Write-Success "Build successful."
} catch {
    Write-ErrorMsg "Build failed."
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " PIPELINE COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "========================================================`n"
exit 0