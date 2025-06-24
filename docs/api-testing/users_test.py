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

print("🚀 Testing Users API...")

# 1. Get User Profile
resp = requests.get(f"{BASE_URL}/users/profile", headers=headers)
print_result("GET /users/profile - Get User Profile", resp)

# 2. Update User Profile
profile_data = {
    "full_name": "Updated Admin User",
    "bio": "This is a test bio for the admin user"
}
resp = requests.put(f"{BASE_URL}/users/profile", json=profile_data, headers=headers)
print_result("PUT /users/profile - Update Profile", resp)

# 3. Get User Settings
resp = requests.get(f"{BASE_URL}/users/settings", headers=headers)
print_result("GET /users/settings - Get User Settings", resp)

# 4. Update User Settings
settings_data = {
    "theme": "dark",
    "notifications_enabled": True,
    "language": "en"
}
resp = requests.put(f"{BASE_URL}/users/settings", json=settings_data, headers=headers)
print_result("PUT /users/settings - Update Settings", resp)

# 5. Get User Activity
resp = requests.get(f"{BASE_URL}/users/activity", headers=headers)
print_result("GET /users/activity - Get User Activity", resp)

# 6. Get User Notifications
resp = requests.get(f"{BASE_URL}/users/notifications", headers=headers)
print_result("GET /users/notifications - Get Notifications", resp)

# 7. Admin: Get All Users (if admin)
resp = requests.get(f"{BASE_URL}/users/admin/all", headers=headers)
print_result("GET /users/admin/all - Get All Users (Admin)", resp)

# 8. Admin: Get User Analytics (if admin)
resp = requests.get(f"{BASE_URL}/users/admin/analytics", headers=headers)
print_result("GET /users/admin/analytics - Get User Analytics (Admin)", resp)

print("\n🏁 Users API testing completed!")
print("\n📋 Summary:")
print("👤 User Profile Management - Testing completed")
print("⚙️ User Settings - Testing completed")
print("📊 User Activity & Notifications - Testing completed")
print("👨‍💼 Admin Features - Testing completed") 