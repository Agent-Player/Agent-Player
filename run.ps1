# Agent Player PowerShell Management Script
# Windows equivalent of Makefile for Agent Player project

param(
    [string]$Command = "help"
)

function Show-Help {
    Write-Host ""
    Write-Host "🚀 Agent Player Development Commands" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Rules Management:" -ForegroundColor Yellow
    Write-Host "  ./run.ps1 update-rules     - Update rules with current code structure"
    Write-Host "  ./run.ps1 validate-rules   - Validate that all endpoints are documented"
    Write-Host "  ./run.ps1 organize-rules   - Organize rules into directory structure"
    Write-Host ""
    Write-Host "Development Servers:" -ForegroundColor Yellow
    Write-Host "  ./run.ps1 run-backend      - Start Python FastAPI backend server"
    Write-Host "  ./run.ps1 run-frontend     - Start React frontend development server"
    Write-Host "  ./run.ps1 run-both         - Start both backend and frontend"
    Write-Host ""
    Write-Host "Setup & Installation:" -ForegroundColor Yellow
    Write-Host "  ./run.ps1 install-deps     - Install all dependencies (Python + Node.js)"
    Write-Host "  ./run.ps1 setup-env        - Setup complete development environment"
    Write-Host ""
    Write-Host "Code Quality:" -ForegroundColor Yellow
    Write-Host "  ./run.ps1 test-backend     - Run backend tests"
    Write-Host "  ./run.ps1 test-frontend    - Run frontend tests"
    Write-Host "  ./run.ps1 lint-check       - Check code formatting"
    Write-Host ""
    Write-Host "Database:" -ForegroundColor Yellow
    Write-Host "  ./run.ps1 db-init          - Initialize database"
    Write-Host "  ./run.ps1 db-reset         - Reset database (WARNING: deletes data)"
    Write-Host ""
    Write-Host "Project Status:" -ForegroundColor Yellow
    Write-Host "  ./run.ps1 status           - Show project status and statistics"
    Write-Host "  ./run.ps1 clean            - Clean temporary files and logs"
    Write-Host ""
}

function Update-Rules {
    Write-Host "🔄 Updating rules with current code structure..." -ForegroundColor Blue
    python backend/core/rules_tracker.py
    Write-Host "✅ Rules updated successfully!" -ForegroundColor Green
}

function Validate-Rules {
    Write-Host "🔍 Validating rules completeness..." -ForegroundColor Blue
    python -c "from backend.core.rules_tracker import RulesTracker; tracker = RulesTracker(); tracker.run_full_scan()"
    Write-Host "✅ Rules validation complete!" -ForegroundColor Green
}

function Organize-Rules {
    Write-Host "📁 Organizing rules into directory structure..." -ForegroundColor Blue
    
    # Create rules directories
    $rulesDirs = @(
        ".cursor/rules/01-core",
        ".cursor/rules/02-backend", 
        ".cursor/rules/03-frontend",
        ".cursor/rules/04-database",
        ".cursor/rules/05-api",
        ".cursor/rules/06-security",
        ".cursor/rules/07-performance",
        ".cursor/rules/08-testing",
        ".cursor/rules/09-deployment",
        ".cursor/rules/10-maintenance",
        ".cursor/rules/11-agent-player-specific",
        ".cursor/rules/12-tasks",
        ".cursor/rules/13-git-management"
    )
    
    foreach ($dir in $rulesDirs) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Gray
        }
    }
    
    Write-Host "✅ Rules directories organized!" -ForegroundColor Green
}

function Start-Backend {
    Write-Host "🚀 Starting Agent Player backend server..." -ForegroundColor Blue
    Set-Location backend
    python main.py
    Set-Location ..
}

function Start-Frontend {
    Write-Host "🚀 Starting Agent Player frontend development server..." -ForegroundColor Blue
    Set-Location frontend
    npm run dev
    Set-Location ..
}

function Start-Both {
    Write-Host "🚀 Starting both backend and frontend servers..." -ForegroundColor Blue
    
    # Start backend in background
    Start-Job -ScriptBlock {
        Set-Location $using:PWD/backend
        python main.py
    } -Name "Backend"
    
    Write-Host "✅ Backend started in background" -ForegroundColor Green
    
    # Wait a moment then start frontend
    Start-Sleep -Seconds 3
    
    Write-Host "🚀 Starting frontend..." -ForegroundColor Blue
    Set-Location frontend
    npm run dev
    Set-Location ..
}

function Install-Dependencies {
    Write-Host "📦 Installing all dependencies..." -ForegroundColor Blue
    
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    if (Test-Path "backend/requirements.txt") {
        pip install -r backend/requirements.txt
        Write-Host "✅ Python dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "❌ backend/requirements.txt not found!" -ForegroundColor Red
    }
    
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    if (Test-Path "frontend/package.json") {
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Host "✅ Node.js dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "❌ frontend/package.json not found!" -ForegroundColor Red
    }
}

function Setup-Environment {
    Write-Host "⚙️ Setting up complete development environment..." -ForegroundColor Blue
    
    Organize-Rules
    Install-Dependencies
    
    Write-Host ""
    Write-Host "🎉 Development environment ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. ./run.ps1 run-backend    - Start backend server" 
    Write-Host "2. ./run.ps1 run-frontend   - Start frontend server"
    Write-Host "3. ./run.ps1 update-rules   - Keep rules synchronized"
    Write-Host ""
}

function Test-Backend {
    Write-Host "🧪 Running backend tests..." -ForegroundColor Blue
    Set-Location backend
    python -m pytest tests/ -v
    Set-Location ..
}

function Test-Frontend {
    Write-Host "🧪 Running frontend tests..." -ForegroundColor Blue
    Set-Location frontend
    npm test
    Set-Location ..
}

function Check-Linting {
    Write-Host "🔍 Checking code formatting..." -ForegroundColor Blue
    
    Write-Host "Checking backend code..." -ForegroundColor Yellow
    Set-Location backend
    python -m flake8 . --max-line-length=100 --exclude=migrations
    Set-Location ..
    
    Write-Host "Checking frontend code..." -ForegroundColor Yellow
    Set-Location frontend
    npm run lint
    Set-Location ..
}

function Initialize-Database {
    Write-Host "🗄️ Initializing database..." -ForegroundColor Blue
    Set-Location backend
    python init_database.py
    Set-Location ..
    Write-Host "✅ Database initialized!" -ForegroundColor Green
}

function Reset-Database {
    $confirmation = Read-Host "⚠️ This will delete all data! Are you sure? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Write-Host "🗄️ Resetting database..." -ForegroundColor Blue
        Set-Location backend
        python init_database.py --reset
        Set-Location ..
        Write-Host "✅ Database reset complete!" -ForegroundColor Green
    } else {
        Write-Host "❌ Database reset cancelled." -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host ""
    Write-Host "📊 Agent Player Project Status" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    Write-Host ""
    
    # Count backend files
    $backendFiles = (Get-ChildItem -Path "backend" -Filter "*.py" -Recurse).Count
    Write-Host "📁 Backend Python files: $backendFiles" -ForegroundColor Yellow
    
    # Count frontend files
    $frontendFiles = (Get-ChildItem -Path "frontend/src" -Filter "*.ts*" -Recurse).Count
    Write-Host "📁 Frontend TypeScript files: $frontendFiles" -ForegroundColor Yellow
    
    # Count API endpoints (approximate)
    $apiFiles = Get-ChildItem -Path "backend/api" -Filter "*.py" -Recurse
    $endpointCount = 0
    foreach ($file in $apiFiles) {
        $content = Get-Content $file.FullName -Raw
        $endpointCount += ([regex]::Matches($content, "@router\.")).Count
    }
    Write-Host "🔧 API Endpoints: $endpointCount" -ForegroundColor Yellow
    
    # Count rules files
    if (Test-Path ".cursor/rules") {
        $rulesFiles = (Get-ChildItem -Path ".cursor/rules" -Filter "*.mdc" -Recurse).Count
        Write-Host "📋 Rules files: $rulesFiles" -ForegroundColor Yellow
    } else {
        Write-Host "📋 Rules files: 0 (not organized yet)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔧 Services Status:" -ForegroundColor Green
    
    # Check if backend is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Backend: Running (Port 8000)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend: Not running" -ForegroundColor Red
    }
    
    # Check if frontend is running  
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Frontend: Running (Port 5173)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Frontend: Not running" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Clean-Project {
    Write-Host "🧹 Cleaning temporary files and logs..." -ForegroundColor Blue
    
    # Clean backend logs
    if (Test-Path "backend/logs") {
        Get-ChildItem -Path "backend/logs" -Filter "*.log.*" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force
    }
    
    # Clean Python cache
    Get-ChildItem -Path "." -Recurse -Directory -Name "__pycache__" | Remove-Item -Recurse -Force
    
    # Clean node_modules if needed (uncomment if needed)
    # Remove-Item -Path "frontend/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
}

# Main script execution
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "update-rules" { Update-Rules }
    "validate-rules" { Validate-Rules }
    "organize-rules" { Organize-Rules }
    "run-backend" { Start-Backend }
    "run-frontend" { Start-Frontend }
    "run-both" { Start-Both }
    "install-deps" { Install-Dependencies }
    "setup-env" { Setup-Environment }
    "test-backend" { Test-Backend }
    "test-frontend" { Test-Frontend }
    "lint-check" { Check-Linting }
    "db-init" { Initialize-Database }
    "db-reset" { Reset-Database }
    "status" { Show-Status }
    "clean" { Clean-Project }
    default { 
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
} 