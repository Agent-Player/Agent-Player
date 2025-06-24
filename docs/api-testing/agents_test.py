import requests
import json

BASE_URL = "http://localhost:8000"
EMAIL = "me@alarade.at"
PASSWORD = "admin123456"

def print_result(title, response):
    print(f"\n=== {title} ===")
    print(f"Status: {response.status_code}")
    try:
        response_data = response.json()
        print("Response:", json.dumps(response_data, indent=2))
    except Exception:
        print("Response:", response.text)
    print("✅ Success" if response.ok else "❌ Failed")

def get_auth_token():
    """Get authentication token"""
    login_data = {"email": EMAIL, "password": PASSWORD}
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.ok and "data" in resp.json():
        data = resp.json()["data"]
        if "tokens" in data:
            return data["tokens"].get("access_token")
    return None

# Get auth token
token = get_auth_token()
if not token:
    print("❌ Failed to get authentication token!")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

print("🚀 Testing Agents API with authentication...")

# 1. Create Agent
agent_data = {
    "name": "Test Customer Service Agent",
    "description": "A test agent for handling customer service inquiries",
    "agent_type": "main",
    "model_provider": "openai",
    "model_name": "gpt-3.5-turbo",
    "system_prompt": "You are a helpful customer service assistant.",
    "temperature": 0.7,
    "max_tokens": 1000
}
resp = requests.post(f"{BASE_URL}/agents", json=agent_data, headers=headers)
print_result("POST /agents - Create Agent", resp)

agent_id = None
if resp.ok and "data" in resp.json():
    data = resp.json()["data"]
    agent_id = data.get("agent_id") or data.get("id")
    print(f"🆔 Created Agent ID: {agent_id}")

# 2. List Agents
resp = requests.get(f"{BASE_URL}/agents", headers=headers)
print_result("GET /agents - List Agents", resp)

# 3. Get Agent Details (if agent was created)
if agent_id:
    resp = requests.get(f"{BASE_URL}/agents/{agent_id}", headers=headers)
    print_result(f"GET /agents/{agent_id} - Get Agent Details", resp)

# 4. Update Agent (if agent was created)
if agent_id:
    update_data = {
        "name": "Updated Customer Service Agent",
        "description": "An updated test agent with new capabilities",
        "temperature": 0.8
    }
    resp = requests.put(f"{BASE_URL}/agents/{agent_id}", json=update_data, headers=headers)
    print_result(f"PUT /agents/{agent_id} - Update Agent", resp)

# 5. Test Agent (if agent was created)
if agent_id:
    test_data = {
        "message": "Hello, I need help with my order",
        "include_system_prompt": True
    }
    resp = requests.post(f"{BASE_URL}/agents/{agent_id}/test", json=test_data, headers=headers)
    print_result(f"POST /agents/{agent_id}/test - Test Agent", resp)

# 6. Get Agent Analytics (if agent was created)
if agent_id:
    resp = requests.get(f"{BASE_URL}/agents/{agent_id}/analytics", headers=headers)
    print_result(f"GET /agents/{agent_id}/analytics - Agent Analytics", resp)

# 7. Clone Agent (if agent was created)
if agent_id:
    clone_data = {
        "name": "Cloned Customer Service Agent",
        "description": "A cloned version of the test agent"
    }
    resp = requests.post(f"{BASE_URL}/agents/{agent_id}/clone", json=clone_data, headers=headers)
    print_result(f"POST /agents/{agent_id}/clone - Clone Agent", resp)

# 8. Deactivate Agent (if agent was created)
if agent_id:
    resp = requests.put(f"{BASE_URL}/agents/{agent_id}/deactivate", headers=headers)
    print_result(f"PUT /agents/{agent_id}/deactivate - Deactivate Agent", resp)

# 9. Activate Agent (if agent was created)
if agent_id:
    resp = requests.put(f"{BASE_URL}/agents/{agent_id}/activate", headers=headers)
    print_result(f"PUT /agents/{agent_id}/activate - Activate Agent", resp)

# 10. Delete Agent (if agent was created)
if agent_id:
    resp = requests.delete(f"{BASE_URL}/agents/{agent_id}", headers=headers)
    print_result(f"DELETE /agents/{agent_id} - Delete Agent", resp)
else:
    print("\n❌ No agent ID available for testing update/delete operations")

print("\n🏁 Agents API testing completed!") 