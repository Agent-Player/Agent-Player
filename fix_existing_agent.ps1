#!/usr/bin/env pwsh

# Fix Existing Agent Configuration
# Updates agent's local_config to use correct Ollama model

Write-Host "🔧 Fix Existing Agent Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Get authentication token
Write-Host "`n🔑 Getting authentication token..." -ForegroundColor Yellow
$loginData = @{
    email = "me@alarade.at"
    password = "admin123456"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $authResponse.data.access_token
    Write-Host "✅ Authentication successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get list of agents
Write-Host "`n📋 Getting list of agents..." -ForegroundColor Yellow
try {
    $agentsResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents" -Method GET -Headers $headers
    $agents = $agentsResponse.data
    
    # Find local agents (agents with is_local_model = true)
    $localAgents = $agents | Where-Object { $_.is_local_model -eq $true }
    
    if ($localAgents.Count -eq 0) {
        Write-Host "⚠️  No local agents found" -ForegroundColor Yellow
        Write-Host "Create a new agent and set it as local model" -ForegroundColor Blue
        exit 0
    }
    
    Write-Host "📦 Found $($localAgents.Count) local agent(s):" -ForegroundColor Blue
    foreach ($agent in $localAgents) {
        Write-Host "   - ID: $($agent.id), Name: $($agent.name)" -ForegroundColor White
        if ($agent.local_config) {
            Write-Host "     Current model: $($agent.local_config.model_name)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Failed to get agents: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Ask user which agent to fix
if ($localAgents.Count -eq 1) {
    $selectedAgent = $localAgents[0]
    Write-Host "`n🎯 Auto-selecting agent: $($selectedAgent.name)" -ForegroundColor Green
} else {
    Write-Host "`n🤔 Which agent do you want to fix? Enter agent ID:" -ForegroundColor Yellow
    $agentId = Read-Host "Agent ID"
    $selectedAgent = $localAgents | Where-Object { $_.id -eq [int]$agentId }
    
    if (-not $selectedAgent) {
        Write-Host "❌ Agent not found or not a local agent" -ForegroundColor Red
        exit 1
    }
}

# Get available Ollama models
Write-Host "`n🔍 Checking available Ollama models..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $models = ($response.Content | ConvertFrom-Json).models
        Write-Host "✅ Available models:" -ForegroundColor Green
        foreach ($model in $models) {
            Write-Host "   - $($model.name)" -ForegroundColor White
        }
        
        # Use first available model (usually llama3:latest)
        $firstModel = $models[0].name
        $modelName = $firstModel.Split(':')[0]  # Remove :latest suffix
        Write-Host "🎯 Will use model: $modelName" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ Cannot connect to Ollama. Using default 'llama3'" -ForegroundColor Yellow
    $modelName = "llama3"
}

# Update agent configuration
Write-Host "`n🔧 Updating agent configuration..." -ForegroundColor Yellow

$updateData = @{
    local_config = @{
        host = "localhost"
        port = 11434
        endpoint = "/v1/chat/completions"
        model_name = $modelName
    }
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents/$($selectedAgent.id)" -Method PUT -Body $updateData -Headers $headers
    Write-Host "✅ Agent configuration updated successfully!" -ForegroundColor Green
    Write-Host "🎯 Model name set to: $modelName" -ForegroundColor Blue
} catch {
    Write-Host "❌ Failed to update agent: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test the updated agent
Write-Host "`n🧪 Testing updated agent..." -ForegroundColor Yellow
$testData = @{
    test_message = "What is 1+1? Answer briefly."
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents/$($selectedAgent.id)/test" -Method POST -Body $testData -Headers $headers
    
    Write-Host "`n📋 Test Results:" -ForegroundColor Cyan
    Write-Host "Status: $($testResponse.status)" -ForegroundColor White
    Write-Host "Agent: $($testResponse.agent_info.name)" -ForegroundColor White
    Write-Host "Response Time: $($testResponse.test_results.response_time)" -ForegroundColor White
    Write-Host "`n🤖 Agent Response:" -ForegroundColor Green
    Write-Host $testResponse.test_results.agent_response -ForegroundColor White
    
    # Check if it's a real response
    if ($testResponse.test_results.agent_response -like "*REAL OLLAMA RESPONSE*") {
        Write-Host "`n🎉 SUCCESS: Real Ollama response detected!" -ForegroundColor Green
        Write-Host "The agent is now working correctly with Ollama!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Still getting mock response. Check debug logs in backend." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Agent test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Configuration update completed!" -ForegroundColor Cyan 