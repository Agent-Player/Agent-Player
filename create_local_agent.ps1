# Create Local Agent with Ollama

Write-Host "Creating local agent with Ollama..." -ForegroundColor Cyan

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "me@alarade.at"
    password = "admin123456"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $authResponse.data.access_token
Write-Host "Login successful" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Get available models from Ollama
Write-Host "Getting Ollama models..." -ForegroundColor Yellow
$ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET
$models = ($ollamaResponse.Content | ConvertFrom-Json).models

Write-Host "Available models:" -ForegroundColor Blue
foreach ($model in $models) {
    Write-Host "  - $($model.name)" -ForegroundColor White
}

# Use first available model
$firstModel = $models[0].name
$modelName = $firstModel.Split(':')[0]  # Remove :latest suffix
Write-Host "Using model: $modelName" -ForegroundColor Green

# Create agent
Write-Host "Creating agent..." -ForegroundColor Yellow
$agentData = @{
    name = "Ollama localhost Agent"
    description = "Local AI agent using Ollama"
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
        model_name = $modelName
    }
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents" -Method POST -Body $agentData -Headers $headers
$agentId = $createResponse.data.id
Write-Host "Agent created with ID: $agentId" -ForegroundColor Green

# Test the agent
Write-Host "Testing agent..." -ForegroundColor Yellow
$testData = @{
    test_message = "Hello! What is 1+1? Please answer briefly."
} | ConvertTo-Json

$testResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents/$agentId/test" -Method POST -Body $testData -Headers $headers

Write-Host "`nTest Results:" -ForegroundColor Cyan
Write-Host "Status: $($testResponse.status)" -ForegroundColor White
Write-Host "Agent: $($testResponse.agent_info.name)" -ForegroundColor White
Write-Host "Model: $($testResponse.agent_info.model_provider)/$($testResponse.agent_info.model_name)" -ForegroundColor White
Write-Host "Response Time: $($testResponse.test_results.response_time)" -ForegroundColor White

Write-Host "`nAgent Response:" -ForegroundColor Green
Write-Host $testResponse.test_results.agent_response -ForegroundColor White

if ($testResponse.test_results.agent_response -like "*REAL OLLAMA RESPONSE*") {
    Write-Host "`nSUCCESS: Real Ollama response detected!" -ForegroundColor Green
    Write-Host "The agent is working correctly with Ollama!" -ForegroundColor Green
} else {
    Write-Host "`nWARNING: This appears to be a mock response" -ForegroundColor Yellow
    Write-Host "Check backend logs for debug information" -ForegroundColor Yellow
}

Write-Host "`nAgent ID: $agentId" -ForegroundColor Cyan
Write-Host "You can now test this agent from the frontend!" -ForegroundColor Blue 