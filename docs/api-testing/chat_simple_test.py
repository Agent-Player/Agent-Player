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

print("🚀 Testing Basic Chat API...")

# 1. List Conversations (should be empty initially)
resp = requests.get(f"{BASE_URL}/chat/conversations", headers=headers)
print_result("GET /chat/conversations - List Conversations", resp)

# 2. Create Simple Conversation (without agent_id)
conversation_data = {
    "title": "Simple Test Conversation"
}
resp = requests.post(f"{BASE_URL}/chat/conversations", json=conversation_data, headers=headers)
print_result("POST /chat/conversations - Create Simple Conversation", resp)

# 3. List Conversations again (should have 1 now)
resp = requests.get(f"{BASE_URL}/chat/conversations", headers=headers)
print_result("GET /chat/conversations - List Conversations Again", resp)

# 4. Get Chat Analytics
resp = requests.get(f"{BASE_URL}/chat/analytics/dashboard", headers=headers)
print_result("GET /chat/analytics/dashboard - Get Analytics", resp)

# 5. Search messages (empty search)
resp = requests.get(f"{BASE_URL}/chat/search?query=test", headers=headers)
print_result("GET /chat/search - Search Messages", resp)

print("\n🏁 Basic Chat API testing completed!")
print("\n📋 Summary:")
print("✅ Basic conversation management tested")
print("✅ Analytics endpoint tested")
print("✅ Search endpoint tested") 