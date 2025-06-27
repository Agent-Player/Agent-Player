#!/usr/bin/env pwsh

# Quick Ollama Integration Test
# Tests if the agent service correctly detects and uses available Ollama models

Write-Host "🧪 Quick Ollama Integration Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Check if Ollama is running
Write-Host "`n1️⃣ Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $models = ($response.Content | ConvertFrom-Json).models
        Write-Host "✅ Ollama is running" -ForegroundColor Green
        Write-Host "📦 Available models:" -ForegroundColor Blue
        foreach ($model in $models) {
            Write-Host "   - $($model.name)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Ollama is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start Ollama with: ollama serve" -ForegroundColor Yellow
    exit 1
}

# Step 2: Test backend agent service
Write-Host "`n2️⃣ Testing backend integration..." -ForegroundColor Yellow

# First get an auth token
Write-Host "Getting auth token..." -ForegroundColor Blue
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

# Create test agent with local model
Write-Host "Creating test agent with local model..." -ForegroundColor Blue
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$agentData = @{
    name = "Test Ollama Agent"
    description = "Test agent for Ollama integration"
    agent_type = "main"
    model_provider = "openai"
    model_name = "gpt-4"
    system_prompt = "You are a helpful AI assistant."
    temperature = 0.7
    max_tokens = 2048
    api_key = ""
    parent_agent_id = $null
    user_id = 1
    is_local_model = $true
    local_config = @{
        host = "localhost"
        port = 11434
        endpoint = "/v1/chat/completions"
        model_name = "llama3"
    }
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents" -Method POST -Body $agentData -Headers $headers
    $agentId = $createResponse.data.id
    Write-Host "✅ Test agent created with ID: $agentId" -ForegroundColor Green
} catch {
    Write-Host "❌ Agent creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test the agent with a simple question
Write-Host "Testing agent with message: '1+1=?'..." -ForegroundColor Blue
$testData = @{
    test_message = "1+1=?"
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents/$agentId/test" -Method POST -Body $testData -Headers $headers
    
    Write-Host "`n📋 Test Results:" -ForegroundColor Cyan
    Write-Host "Status: $($testResponse.status)" -ForegroundColor White
    Write-Host "Agent: $($testResponse.agent_info.name)" -ForegroundColor White
    Write-Host "Model: $($testResponse.agent_info.model_provider)/$($testResponse.agent_info.model_name)" -ForegroundColor White
    Write-Host "Response Time: $($testResponse.test_results.response_time)" -ForegroundColor White
    Write-Host "`n🤖 Agent Response:" -ForegroundColor Green
    Write-Host $testResponse.test_results.agent_response -ForegroundColor White
    
    # Check if it's a real response
    if ($testResponse.test_results.agent_response -like "*REAL OLLAMA RESPONSE*") {
        Write-Host "`n✅ SUCCESS: Real Ollama response detected!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  WARNING: This might be a mock response" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Agent test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# Cleanup: Delete the test agent
Write-Host "`n3️⃣ Cleaning up..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:8000/agents/$agentId" -Method DELETE -Headers $headers | Out-Null
    Write-Host "✅ Test agent deleted" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not delete test agent (ID: $agentId)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Cyan 