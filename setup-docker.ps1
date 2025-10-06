# Acquisitions App - Docker Setup Script for Windows
# This script helps you set up and run the dockerized application with Neon database

param(
    [string]$Environment = "dev",
    [string]$Action = "setup",
    [switch]$Help,
    [switch]$Clean,
    [switch]$Rebuild
)

# Color functions for better output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Step { param($Message) Write-Host "`n==> $Message" -ForegroundColor Magenta }

# Help function
function Show-Help {
    Write-Host @"

Acquisitions Docker Setup Script
================================

Usage: .\setup-docker.ps1 [OPTIONS]

Options:
  -Environment <env>    Target environment: 'dev' or 'prod' (default: dev)
  -Action <action>      Action to perform: 'setup', 'start', 'stop', 'logs', 'status' (default: setup)
  -Clean               Clean Docker resources before starting
  -Rebuild             Force rebuild of Docker images
  -Help                Show this help message

Actions:
  setup                Complete setup and start the environment
  start                Start the Docker environment
  stop                 Stop the Docker environment
  logs                 Show container logs
  status               Show container status
  reset                Reset everything (stop, clean, rebuild, start)

Examples:
  .\setup-docker.ps1                           # Setup development environment
  .\setup-docker.ps1 -Environment prod         # Setup production environment
  .\setup-docker.ps1 -Action start             # Start development environment
  .\setup-docker.ps1 -Action logs              # Show logs
  .\setup-docker.ps1 -Clean -Rebuild           # Clean rebuild
  .\setup-docker.ps1 -Environment prod -Action start -Rebuild

"@ -ForegroundColor White
}

# Check if Docker is installed and running
function Test-Docker {
    Write-Step "Checking Docker installation..."
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Docker not found"
        }
        Write-Success "✓ Docker found: $dockerVersion"
        
        $composeVersion = docker-compose --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            # Try docker compose (newer syntax)
            $composeVersion = docker compose version 2>$null
            if ($LASTEXITCODE -ne 0) {
                throw "Docker Compose not found"
            }
        }
        Write-Success "✓ Docker Compose found: $composeVersion"
        
        # Test Docker daemon
        docker info | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Docker daemon not running"
        }
        Write-Success "✓ Docker daemon is running"
        
        return $true
    }
    catch {
        Write-Error "✗ Docker check failed: $($_.Exception.Message)"
        Write-Warning "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        return $false
    }
}

# Check if required files exist
function Test-RequiredFiles {
    Write-Step "Checking required files..."
    
    $requiredFiles = @(
        "Dockerfile",
        "docker-compose.dev.yml",
        "docker-compose.prod.yml",
        ".env.development",
        ".env.production",
        "package.json"
    )
    
    $missing = @()
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "✓ Found: $file"
        } else {
            Write-Error "✗ Missing: $file"
            $missing += $file
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required files. Please ensure all Docker configuration files are present."
        return $false
    }
    
    return $true
}

# Validate environment configuration
function Test-EnvironmentConfig {
    param([string]$env)
    
    Write-Step "Validating $env environment configuration..."
    
    $envFile = ".env.$env"
    if (!(Test-Path $envFile)) {
        Write-Error "✗ Environment file not found: $envFile"
        return $false
    }
    
    $envContent = Get-Content $envFile -Raw
    
    if ($env -eq "development") {
        $requiredVars = @("NEON_API_KEY", "NEON_PROJECT_ID", "DATABASE_URL")
        foreach ($var in $requiredVars) {
            if ($envContent -match "$var\s*=\s*your_.*_here" -or $envContent -match "$var\s*=\s*$") {
                Write-Warning "⚠ Please update $var in $envFile"
            } else {
                Write-Success "✓ $var is configured"
            }
        }
    }
    
    if ($env -eq "production") {
        if ($envContent -match "JWT_SECRET\s*=\s*your_production_jwt_secret_key_here") {
            Write-Warning "⚠ Please update JWT_SECRET in $envFile with a secure production secret"
        }
    }
    
    return $true
}

# Clean Docker resources
function Invoke-DockerClean {
    Write-Step "Cleaning Docker resources..."
    
    try {
        # Stop and remove containers
        docker-compose -f "docker-compose.$Environment.yml" down --remove-orphans 2>$null
        
        # Remove unused images, containers, and networks
        docker system prune -f | Out-Null
        docker volume prune -f | Out-Null
        
        Write-Success "✓ Docker resources cleaned"
    }
    catch {
        Write-Warning "⚠ Some cleanup operations may have failed (this is usually normal)"
    }
}

# Build and start the environment
function Start-Environment {
    param([string]$env)
    
    Write-Step "Starting $env environment..."
    
    $composeFile = "docker-compose.$env.yml"
    $envFile = ".env.$env"
    
    try {
        # Copy environment file
        Copy-Item $envFile ".env" -Force
        Write-Info "Using configuration from $envFile"
        
        # Build and start services
        $buildFlag = if ($Rebuild) { "--build" } else { "" }
        $detachFlag = if ($env -eq "prod") { "-d" } else { "" }
        
        $command = "docker-compose -f $composeFile up $buildFlag $detachFlag"
        Write-Info "Executing: $command"
        
        if ($env -eq "dev") {
            Write-Info "Starting development environment with hot reload..."
            Write-Info "The application will be available at: http://localhost:3000"
            Write-Info "Press Ctrl+C to stop the development server"
        }
        
        Invoke-Expression $command
        
        if ($env -eq "prod" -and $LASTEXITCODE -eq 0) {
            Write-Success "✓ Production environment started successfully"
            Write-Info "Application available at: http://localhost:3000"
        }
    }
    catch {
        Write-Error "✗ Failed to start environment: $($_.Exception.Message)"
        exit 1
    }
}

# Stop the environment
function Stop-Environment {
    param([string]$env)
    
    Write-Step "Stopping $env environment..."
    
    try {
        docker-compose -f "docker-compose.$env.yml" down
        Write-Success "✓ Environment stopped"
    }
    catch {
        Write-Error "✗ Failed to stop environment: $($_.Exception.Message)"
    }
}

# Show container logs
function Show-Logs {
    param([string]$env)
    
    Write-Step "Showing logs for $env environment..."
    
    try {
        docker-compose -f "docker-compose.$env.yml" logs -f
    }
    catch {
        Write-Error "✗ Failed to show logs: $($_.Exception.Message)"
    }
}

# Show container status
function Show-Status {
    param([string]$env)
    
    Write-Step "Container status for $env environment..."
    
    try {
        docker-compose -f "docker-compose.$env.yml" ps
        Write-Host "`nDocker system info:"
        docker system df
    }
    catch {
        Write-Error "✗ Failed to show status: $($_.Exception.Message)"
    }
}

# Main setup function
function Invoke-Setup {
    param([string]$env)
    
    Write-Host @"

🐳 Acquisitions Docker Setup
=============================
Environment: $env
Action: $Action
Clean: $Clean
Rebuild: $Rebuild

"@ -ForegroundColor Cyan

    # Pre-checks
    if (!(Test-Docker)) { exit 1 }
    if (!(Test-RequiredFiles)) { exit 1 }
    if (!(Test-EnvironmentConfig $env)) { exit 1 }
    
    # Clean if requested
    if ($Clean) {
        Invoke-DockerClean
    }
    
    # Perform action
    switch ($Action.ToLower()) {
        "setup" {
            Start-Environment $env
        }
        "start" {
            Start-Environment $env
        }
        "stop" {
            Stop-Environment $env
        }
        "logs" {
            Show-Logs $env
        }
        "status" {
            Show-Status $env
        }
        "reset" {
            Stop-Environment $env
            Invoke-DockerClean
            Start-Environment $env
        }
        default {
            Write-Error "Unknown action: $Action"
            Show-Help
            exit 1
        }
    }
}

# Main script execution
if ($Help) {
    Show-Help
    exit 0
}

# Validate environment parameter
if ($Environment -notin @("dev", "development", "prod", "production")) {
    Write-Error "Invalid environment: $Environment. Use 'dev' or 'prod'"
    exit 1
}

# Normalize environment name
if ($Environment -eq "development") { $Environment = "dev" }
if ($Environment -eq "production") { $Environment = "prod" }

# Run setup
try {
    Invoke-Setup $Environment
}
catch {
    Write-Error "Setup failed: $($_.Exception.Message)"
    exit 1
}