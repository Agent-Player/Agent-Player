# Simple Ollama Test

Write-Host "Testing Ollama integration..." -ForegroundColor Cyan

# Check Ollama
Write-Host "Checking Ollama..." -ForegroundColor Yellow
$result = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET
Write-Host "Ollama status: $($result.StatusCode)" -ForegroundColor Green

# Get models
$models = ($result.Content | ConvertFrom-Json).models
Write-Host "Available models:"
foreach ($model in $models) {
    Write-Host "  - $($model.name)"
}

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "me@alarade.at"
    password = "admin123456"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $authResponse.data.access_token
Write-Host "Login successful" -ForegroundColor Green

# Create headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get agents
Write-Host "Getting agents..." -ForegroundColor Yellow
$agentsResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents" -Method GET -Headers $headers
$agents = $agentsResponse.data

# Find local agents
$localAgents = @()
foreach ($agent in $agents) {
    if ($agent.is_local_model -eq $true) {
        $localAgents += $agent
    }
}

Write-Host "Found $($localAgents.Count) local agents" -ForegroundColor Blue

if ($localAgents.Count -gt 0) {
    $agent = $localAgents[0]
    Write-Host "Testing agent: $($agent.name)" -ForegroundColor Blue
    
    # Test agent
    $testData = @{
        test_message = "What is 1+1?"
    } | ConvertTo-Json
    
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents/$($agent.id)/test" -Method POST -Body $testData -Headers $headers
    
    Write-Host "Response:"
    Write-Host $testResponse.test_results.agent_response -ForegroundColor Green
    
    if ($testResponse.test_results.agent_response -like "*REAL OLLAMA RESPONSE*") {
        Write-Host "SUCCESS: Real response!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Mock response" -ForegroundColor Yellow
    }
} else {
    Write-Host "No local agents found" -ForegroundColor Yellow
}

Write-Host "Test completed" -ForegroundColor Cyan 