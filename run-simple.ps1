# Simple Agent Player Management Script
param([string]$Command = "help")

Write-Host ""
Write-Host "Agent Player Management Tool" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

switch ($Command.ToLower()) {
    "help" {
        Write-Host ""
        Write-Host "Available Commands:" -ForegroundColor Yellow
        Write-Host "  update-rules     - Update project rules"
        Write-Host "  run-backend      - Start backend server"  
        Write-Host "  run-frontend     - Start frontend server"
        Write-Host "  install-deps     - Install dependencies"
        Write-Host "  status           - Show project status"
        Write-Host "  organize-rules   - Create rules directories"
        Write-Host ""
    }
    
    "update-rules" {
        Write-Host "Updating rules..." -ForegroundColor Blue
        python backend/core/rules_tracker.py
        Write-Host "Rules updated!" -ForegroundColor Green
    }
    
    "run-backend" {
        Write-Host "Starting backend server..." -ForegroundColor Blue
        Set-Location backend
        python main.py
        Set-Location ..
    }
    
    "run-frontend" {
        Write-Host "Starting frontend server..." -ForegroundColor Blue
        Set-Location frontend
        npm run dev
        Set-Location ..
    }
    
    "install-deps" {
        Write-Host "Installing Python dependencies..." -ForegroundColor Blue
        pip install -r backend/requirements.txt
        Write-Host "Installing Node.js dependencies..." -ForegroundColor Blue
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Host "Dependencies installed!" -ForegroundColor Green
    }
    
    "organize-rules" {
        Write-Host "Creating rules directories..." -ForegroundColor Blue
        $dirs = @(
            ".cursor/rules/01-core",
            ".cursor/rules/02-backend", 
            ".cursor/rules/03-frontend",
            ".cursor/rules/11-agent-player-specific",
            ".cursor/rules/12-tasks"
        )
        foreach ($dir in $dirs) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Created: $dir" -ForegroundColor Gray
        }
        Write-Host "Rules directories created!" -ForegroundColor Green
    }
    
    "status" {
        Write-Host ""
        Write-Host "Project Status:" -ForegroundColor Green
        Write-Host "Backend files:" (Get-ChildItem -Path "backend" -Filter "*.py" -Recurse).Count
        Write-Host "Frontend files:" (Get-ChildItem -Path "frontend/src" -Filter "*.ts*" -Recurse).Count
        Write-Host ""
        
        try {
            Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 | Out-Null
            Write-Host "Backend: Running" -ForegroundColor Green
        } catch {
            Write-Host "Backend: Not running" -ForegroundColor Red
        }
        
        try {
            Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 | Out-Null
            Write-Host "Frontend: Running" -ForegroundColor Green
        } catch {
            Write-Host "Frontend: Not running" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use: .\run-simple.ps1 help" -ForegroundColor Yellow
    }
} 