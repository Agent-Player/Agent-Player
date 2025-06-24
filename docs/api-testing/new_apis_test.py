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
        # Only print first few lines for large responses
        if len(str(response_data)) > 500:
            print("Response: (Large response - truncated)")
        else:
            print("Response:", json.dumps(response_data, indent=2))
    except Exception:
        print("Response:", response.text[:200] + "..." if len(response.text) > 200 else response.text)
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

print("🚀 Testing New APIs (Licensing, Training Lab, Marketplace, Workflows, Tasks)...")

# =============== LICENSING API ===============
print("\n🔐 Testing LICENSING API...")

resp = requests.get(f"{BASE_URL}/licensing/status", headers=headers)
print_result("GET /licensing/status", resp)

resp = requests.get(f"{BASE_URL}/licensing/environment-check", headers=headers)
print_result("GET /licensing/environment-check", resp)

resp = requests.get(f"{BASE_URL}/licensing/features", headers=headers)
print_result("GET /licensing/features", resp)

# =============== TRAINING LAB API ===============
print("\n🧪 Testing TRAINING LAB API...")

resp = requests.get(f"{BASE_URL}/training-lab/workspaces", headers=headers)
print_result("GET /training-lab/workspaces", resp)

resp = requests.get(f"{BASE_URL}/training-lab/templates", headers=headers)
print_result("GET /training-lab/templates", resp)

resp = requests.get(f"{BASE_URL}/training-lab/analytics", headers=headers)
print_result("GET /training-lab/analytics", resp)

# =============== MARKETPLACE API ===============
print("\n🛒 Testing MARKETPLACE API...")

resp = requests.get(f"{BASE_URL}/marketplace/items", headers=headers)
print_result("GET /marketplace/items", resp)

resp = requests.get(f"{BASE_URL}/marketplace/categories", headers=headers)
print_result("GET /marketplace/categories", resp)

resp = requests.get(f"{BASE_URL}/marketplace/featured", headers=headers)
print_result("GET /marketplace/featured", resp)

# =============== WORKFLOWS API ===============
print("\n⚡ Testing WORKFLOWS API...")

resp = requests.get(f"{BASE_URL}/workflows", headers=headers)
print_result("GET /workflows", resp)

resp = requests.get(f"{BASE_URL}/workflows/templates", headers=headers)
print_result("GET /workflows/templates", resp)

resp = requests.get(f"{BASE_URL}/workflows/analytics", headers=headers)
print_result("GET /workflows/analytics", resp)

# =============== TASKS API ===============
print("\n✅ Testing TASKS API...")

resp = requests.get(f"{BASE_URL}/tasks", headers=headers)
print_result("GET /tasks", resp)

resp = requests.get(f"{BASE_URL}/tasks/my-tasks", headers=headers)
print_result("GET /tasks/my-tasks", resp)

resp = requests.get(f"{BASE_URL}/tasks/analytics", headers=headers)
print_result("GET /tasks/analytics", resp)

print("\n🏁 New APIs testing completed!")
print("\n📋 Summary:")
print("🔐 Licensing API - Quick tested")
print("🧪 Training Lab API - Quick tested")
print("🛒 Marketplace API - Quick tested")
print("⚡ Workflows API - Quick tested")
print("✅ Tasks API - Quick tested") 