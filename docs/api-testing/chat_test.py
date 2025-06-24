import requests
import json
import uuid

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

print("🚀 Testing Chat API...")

# First, create an agent to use in conversations
agent_data = {
    "name": "Chat Test Agent",
    "description": "Agent for testing chat functionality",
    "agent_type": "main",
    "model_provider": "openai",
    "model_name": "gpt-3.5-turbo",
    "system_prompt": "You are a helpful assistant.",
    "temperature": 0.7,
    "max_tokens": 1000
}
resp = requests.post(f"{BASE_URL}/agents", json=agent_data, headers=headers)
agent_id = None
if resp.ok and "data" in resp.json():
    data = resp.json()["data"]
    agent_id = data.get("agent_id") or data.get("id")
    print(f"🆔 Created Agent ID for testing: {agent_id}")

# 1. List Conversations (should be empty initially)
resp = requests.get(f"{BASE_URL}/chat/conversations", headers=headers)
print_result("GET /chat/conversations - List Conversations", resp)

# 2. Create Conversation
conversation_data = {
    "title": "Test Conversation",
    "agent_id": agent_id,
    "initial_message": "Hello, this is a test conversation"
}
resp = requests.post(f"{BASE_URL}/chat/conversations", json=conversation_data, headers=headers)
print_result("POST /chat/conversations - Create Conversation", resp)

conversation_id = None
if resp.ok and "data" in resp.json():
    data = resp.json()["data"]
    conversation_id = data.get("conversation_id") or data.get("id")
    print(f"🗨️ Created Conversation ID: {conversation_id}")

# 3. Get Conversation Details
if conversation_id:
    resp = requests.get(f"{BASE_URL}/chat/conversations/{conversation_id}", headers=headers)
    print_result(f"GET /chat/conversations/{conversation_id} - Get Conversation", resp)

# 4. Get Messages in Conversation
if conversation_id:
    resp = requests.get(f"{BASE_URL}/chat/conversations/{conversation_id}/messages", headers=headers)
    print_result(f"GET /chat/conversations/{conversation_id}/messages - Get Messages", resp)

# 5. Send Message to Conversation
if conversation_id:
    message_data = {
        "message": "How can you help me today?",
        "sender_type": "user"
    }
    resp = requests.post(f"{BASE_URL}/chat/conversations/{conversation_id}/messages", json=message_data, headers=headers)
    print_result(f"POST /chat/conversations/{conversation_id}/messages - Send Message", resp)

# 6. Get AI Response
if conversation_id:
    ai_request = {
        "message": "Tell me a joke",
        "agent_id": agent_id
    }
    resp = requests.post(f"{BASE_URL}/chat/conversations/{conversation_id}/ai-response", json=ai_request, headers=headers)
    print_result(f"POST /chat/conversations/{conversation_id}/ai-response - Get AI Response", resp)

# 7. Export Conversation (if available)
if conversation_id:
    resp = requests.post(f"{BASE_URL}/chat/conversations/{conversation_id}/export", headers=headers)
    print_result(f"POST /chat/conversations/{conversation_id}/export - Export Conversation", resp)

# 8. Delete Conversation
if conversation_id:
    resp = requests.delete(f"{BASE_URL}/chat/conversations/{conversation_id}", headers=headers)
    print_result(f"DELETE /chat/conversations/{conversation_id} - Delete Conversation", resp)

# Clean up: Delete test agent
if agent_id:
    requests.delete(f"{BASE_URL}/agents/{agent_id}", headers=headers)
    print(f"🧹 Cleaned up test agent {agent_id}")

print("\n🏁 Chat API testing completed!")
print("\n📋 Summary:")
print("🗨️ Conversation Management - Testing completed")
print("💬 Message Management - Testing completed")
print("🤖 AI Response Generation - Testing completed") 