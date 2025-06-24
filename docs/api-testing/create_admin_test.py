import requests

BASE_URL = "http://localhost:8000"
EMAIL = "me@alarade.at"
PASSWORD = "admin123"

def print_result(title, response):
    print(f"\n=== {title} ===")
    print(f"Status: {response.status_code}")
    try:
        print("Response:", response.json())
    except Exception:
        print("Response:", response.text)
    print("Success" if response.ok else "Failed")

# 1. Register Admin (if not exists)
register_data = {
    "email": EMAIL,
    "username": "admin",
    "full_name": "Admin User",
    "password": PASSWORD
}
resp = requests.post(f"{BASE_URL}/auth/register/admin", json=register_data)
print_result("POST /auth/register/admin", resp)

# 2. Login after registration
login_data = {"email": EMAIL, "password": PASSWORD}
resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
print_result("POST /auth/login", resp)

token = None
if resp.ok and "data" in resp.json():
    data = resp.json()["data"]
    if "tokens" in data:
        token = data["tokens"].get("access_token")

# 3. Get Profile
if token:
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print_result("GET /auth/me", resp)
else:
    print("\nCannot test /auth/me: No token from login.")

# 4. Logout
if token:
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
    print_result("POST /auth/logout", resp)
else:
    print("\nCannot test /auth/logout: No token from login.") 