#!/usr/bin/env python3
import requests
import json
import sys

def debug_auth_issue():
    print("🚀 STARTING DEBUG SCRIPT")
    print("🔍 Debugging 401 Authentication Issue")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Step 1: Login
    print("\n📝 Step 1: Login")
    login_data = {"email": "me@alarade.at", "password": "admin123456"}
    
    try:
        print(f"   Sending request to: {base_url}/auth/login")
        response = requests.post(f"{base_url}/auth/login", json=login_data, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ Login failed: {response.text}")
            return
            
        result = response.json()
        print("   ✅ Login successful!")
        
        access_token = result.get("access_token")
        if not access_token:
            print("   ❌ No access_token in response!")
            print(f"   Full response: {json.dumps(result, indent=2)}")
            return
            
        print(f"   🔑 Token received (first 30 chars): {access_token[:30]}...")
        
    except requests.exceptions.ConnectionError as e:
        print(f"   ❌ Connection error: {e}")
        return
    except Exception as e:
        print(f"   ❌ Login exception: {e}")
        return
    
    # Step 2: Test /auth/me
    print(f"\n🔒 Step 2: Test /auth/me")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        print(f"   Sending request to: {base_url}/auth/me")
        response = requests.get(f"{base_url}/auth/me", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            user_info = response.json()
            print(f"   ✅ User authenticated: {user_info.get('email')}")
        else:
            print(f"   ❌ /auth/me failed: {response.text}")
            return
            
    except Exception as e:
        print(f"   ❌ /auth/me exception: {e}")
        return
    
    # Step 3: Get first agent
    print(f"\n🤖 Step 3: Get agents list")
    
    try:
        print(f"   Sending request to: {base_url}/agents")
        response = requests.get(f"{base_url}/agents", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            agents_data = response.json()
            agents = agents_data.get("data", {}).get("agents", [])
            
            if not agents:
                print("   ❌ No agents found!")
                return
                
            agent = agents[0]
            agent_id = agent["id"]
            agent_name = agent["name"]
            print(f"   ✅ Found agent: {agent_name} (ID: {agent_id})")
            
        else:
            print(f"   ❌ Agents list failed: {response.text}")
            return
            
    except Exception as e:
        print(f"   ❌ Agents list exception: {e}")
        return
    
    # Step 4: Test the agent (this should reproduce the 401 error)
    print(f"\n🧪 Step 4: Test agent {agent_id}")
    test_data = {"message": "Hello! This is a test."}
    
    try:
        # Print exactly what we're sending
        print(f"   URL: {base_url}/agents/{agent_id}/test")
        print(f"   Headers: {headers}")
        print(f"   Body: {json.dumps(test_data)}")
        
        response = requests.post(
            f"{base_url}/agents/{agent_id}/test", 
            json=test_data, 
            headers=headers,
            timeout=10
        )
        print(f"   Response Status: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            print("   ✅ Agent test successful!")
        else:
            print("   ❌ Agent test failed!")
            
    except Exception as e:
        print(f"   ❌ Agent test exception: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 DEBUG SCRIPT COMPLETED")

if __name__ == "__main__":
    try:
        debug_auth_issue()
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        sys.exit(1) 