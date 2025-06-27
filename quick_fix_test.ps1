# Quick fix test

# Login
$loginData = @{
    email = "me@alarade.at"
    password = "admin123456"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $authResponse.data.access_token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create simple local agent
$agentData = @{
    name = "Quick Fix Test Agent"
    description = "Testing the Ollama fix"
    agent_type = "main"
    model_provider = "openai"
    model_name = "gpt-4"
    system_prompt = "You are helpful"
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
    }
} | ConvertTo-Json

Write-Host "Creating agent..." -ForegroundColor Yellow
$createResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents" -Method POST -Body $agentData -Headers $headers

Write-Host "Agent ID: $($createResponse.data.id)" -ForegroundColor Green

# Test it
$testData = @{
    test_message = "What is 1+1?"
} | ConvertTo-Json

Write-Host "Testing agent..." -ForegroundColor Yellow
$testResponse = Invoke-RestMethod -Uri "http://localhost:8000/agents/$($createResponse.data.id)/test" -Method POST -Body $testData -Headers $headers

Write-Host "Response:" -ForegroundColor Green
Write-Host $testResponse.test_results.agent_response

if ($testResponse.test_results.agent_response -like "*REAL OLLAMA RESPONSE*") {
    Write-Host "SUCCESS!" -ForegroundColor Green
} else {
    Write-Host "Still mock response" -ForegroundColor Yellow
} 