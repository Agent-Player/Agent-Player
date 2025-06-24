import requests
import json

BASE_URL = "http://localhost:8000/auth"

print("\n=== POST /auth/login (by email) ===")
login_data = {"email": "me@alarade.at", "password": "admin123456"}
r = requests.post(f"{BASE_URL}/login", json=login_data)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
if r.status_code == 200 and r.json().get("success"):
    print("Success\n")
    tokens = r.json()["data"].get("tokens", {})
    access_token = tokens.get("access_token")
else:
    print("Failed\n")
    print("\n=== POST /auth/login (by username) ===")
    login_data = {"email": "admin", "password": "admin123456"}
    r = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
    if r.status_code == 200 and r.json().get("success"):
        print("Success\n")
        tokens = r.json()["data"].get("tokens", {})
        access_token = tokens.get("access_token")
    else:
        print("Failed\n")
        access_token = None

if access_token:
    headers = {"Authorization": f"Bearer {access_token}"}
    print("=== GET /auth/me ===")
    r = requests.get(f"{BASE_URL}/me", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
    print("Success\n" if r.status_code == 200 else "Failed\n")

    print("=== POST /auth/logout ===")
    r = requests.post(f"{BASE_URL}/logout", headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
    print("Success\n" if r.status_code == 200 else "Failed\n")
else:
    print("Cannot test /auth/me: No token from login.\n")
    print("Cannot test /auth/logout: No token from login.\n") 