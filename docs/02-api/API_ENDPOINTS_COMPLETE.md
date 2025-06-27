# 🔌 API ENDPOINTS - COMPLETE REFERENCE

*Complete API Documentation for DPRO AI Agent System*

**Base URL:** `http://localhost:8000`  
**API Version:** v1  
**Framework:** FastAPI  
**Authentication:** JWT Token-based  
**Last Updated:** 2025-01-22  

---

## 📊 API OVERVIEW

### System Status
✅ **FULLY OPERATIONAL** - All critical endpoints working  
🔐 **Authentication:** JWT Token with 24-hour expiration  
📝 **Documentation:** Auto-generated at `/docs` and `/redoc`  
⚡ **Response Time:** <200ms average  

### Endpoint Distribution
```
🔐 Authentication:      6 endpoints
🤖 AI Agents:          8 endpoints  
👶 Child Agents:       5 endpoints
📋 Boards:             12 endpoints
⚙️ Workflows:          10 endpoints
💬 Chat:               6 endpoints
👤 Users:              3 endpoints
📊 Logs:               8 endpoints
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### Base Route: `/api/v1/auth`

#### 1. System Status Check
```http
GET /api/v1/auth/system/status
```
**Purpose:** Check if system is properly initialized  
**Authentication:** None required  
**Response:**
```json
{
  "success": true,
  "system_initialized": true,
  "admin_registered": false,
  "version": "3.0.0",
  "database_status": "connected"
}
```

#### 2. Admin Setup (One-time only)
```http
POST /api/v1/auth/setup/admin
```
**Purpose:** Create first admin user  
**Authentication:** None required  
**Request Body:**
```json
{
  "email": "admin@example.com",
  "username": "admin", 
  "full_name": "Administrator",
  "password": "securePassword123"
}
```

#### 3. User Login
```http
POST /api/v1/auth/login
```
**Purpose:** Authenticate and get JWT token  
**Authentication:** None required  
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "is_admin": true
  }
}
```

#### 4. User Logout
```http
POST /api/v1/auth/logout
```
**Purpose:** Invalidate current session  
**Authentication:** Bearer token required  

#### 5. Get Current User
```http
GET /api/v1/auth/me  
```
**Purpose:** Get authenticated user info  
**Authentication:** Bearer token required  

#### 6. List All Users (Admin Only)
```http
GET /api/v1/auth/admin/users
```
**Purpose:** Get all users (admin only)  
**Authentication:** Bearer token + admin privileges  

---

## 🤖 AI AGENTS ENDPOINTS

### Base Route: `/api/v1/agents`

#### 1. List All Main Agents
```http
GET /api/v1/agents
```
**Purpose:** Get all main agents (not child agents)  
**Authentication:** Bearer token required  
**Response:**
```json
{
  "success": true,
  "message": "Found 3 main agents",
  "data": [
    {
      "id": 1,
      "name": "GPT-4 Assistant",
      "description": "Advanced AI assistant powered by GPT-4",
      "type": "main",
      "model_provider": "openai", 
      "model_name": "gpt-4",
      "is_active": true,
      "created_at": "2025-01-22T10:00:00Z"
    }
  ]
}
```

#### 2. Get Specific Agent
```http
GET /api/v1/agents/{agent_id}
```
**Purpose:** Get detailed agent information  
**Authentication:** Bearer token required  

#### 3. Create New Agent
```http
POST /api/v1/agents
```
**Purpose:** Create new main agent  
**Authentication:** Bearer token required  
**Request Body:**
```json
{
  "name": "My Custom Agent",
  "description": "Custom AI assistant",
  "model_provider": "openai",
  "model_name": "gpt-4",
  "system_prompt": "You are a helpful assistant...",
  "temperature": 0.7,
  "max_tokens": 2048,
  "api_key": "sk-proj-..."
}
```

#### 4. Update Agent
```http
PUT /api/v1/agents/{agent_id}
```
**Purpose:** Update existing agent  
**Authentication:** Bearer token required  

#### 5. Delete Agent  
```http
DELETE /api/v1/agents/{agent_id}
```
**Purpose:** Soft delete agent (set is_active = false)  
**Authentication:** Bearer token required  

#### 6. Test Agent
```http
POST /api/v1/agents/{agent_id}/test
```
**Purpose:** Send test message to agent  
**Authentication:** Bearer token required  
**Request Body:**
```json
{
  "message": "Hello, please introduce yourself"
}
```

#### 7. Get Agent Settings
```http
GET /api/v1/agents/{agent_id}/settings
```
**Purpose:** Get agent configuration  
**Authentication:** Bearer token required  

#### 8. Legacy Compatibility
```http
GET /api/v1/agents/list/main
GET /api/v1/agents/main
```
**Purpose:** Legacy endpoint redirects  

---

## 👶 CHILD AGENTS ENDPOINTS

### Base Route: `/api/v1/child-agents`

#### 1. List Child Agents
```http
GET /api/v1/child-agents
```
**Purpose:** Get all child agents with parent info  
**Authentication:** Bearer token required  

#### 2. Create Child Agent
```http
POST /api/v1/child-agents
```
**Purpose:** Create specialized child agent  
**Authentication:** Bearer token required  
**Request Body:**
```json
{
  "name": "Code Review Specialist", 
  "description": "Specialized in code review",
  "parentAgentId": 1,
  "capabilities": ["code_review", "bug_detection"],
  "systemPrompt": "You are a specialized code reviewer..."
}
```

#### 3. Get Child Agent Details
```http
GET /api/v1/child-agents/{agent_id}
```

#### 4. Update Child Agent
```http
PUT /api/v1/child-agents/{agent_id}
```

#### 5. Test Child Agent
```http
POST /api/v1/child-agents/{agent_id}/test
```

---

## 📋 BOARDS ENDPOINTS

### Base Route: `/api/v1/boards`

#### Workflow Board Management
- `GET /api/v1/boards` - List all boards
- `POST /api/v1/boards` - Create new board  
- `GET /api/v1/boards/{board_id}` - Get board details
- `PUT /api/v1/boards/{board_id}` - Update board
- `DELETE /api/v1/boards/{board_id}` - Delete board
- `POST /api/v1/boards/{board_id}/execute` - Execute workflow
- `GET /api/v1/boards/{board_id}/analytics` - Board analytics

---

## ⚙️ WORKFLOWS ENDPOINTS

### Base Route: `/api/v1/workflows`

#### Process Automation
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `POST /api/v1/workflows/{id}/execute` - Run workflow
- `GET /api/v1/workflows/{id}/status` - Execution status
- `GET /api/v1/workflows/{id}/analytics` - Performance metrics

---

## 💬 CHAT ENDPOINTS

### Base Route: `/api/v1/chat`

#### Conversation Management
- `GET /api/v1/chat/conversations` - List conversations
- `POST /api/v1/chat/conversations` - New conversation
- `POST /api/v1/chat/conversations/{id}/messages` - Send message
- `GET /api/v1/chat/conversations/{id}/messages` - Message history
- `DELETE /api/v1/chat/conversations/{id}` - Delete conversation
- `GET/POST /api/v1/chat/settings` - Chat preferences

---

## 👤 USER MANAGEMENT ENDPOINTS

### Base Route: `/api/v1/users`

#### User Operations
- `GET /api/v1/users` - List users (admin only)
- `GET /api/v1/users/{user_id}` - User details
- `PUT /api/v1/users/{user_id}` - Update user

---

## 📊 LOGS ENDPOINTS  

### Base Route: `/api/v1/logs`

#### System Monitoring (Admin Only)
- `GET /api/v1/logs` - System logs
- `GET /api/v1/logs/errors` - Error logs
- `GET /api/v1/logs/api` - API request logs
- `DELETE /api/v1/logs` - Clear old logs
- `GET /api/v1/logs/download` - Download logs
- `GET/POST /api/v1/logs/settings` - Log configuration
- `GET /api/v1/logs/health` - System health
- `GET /api/v1/logs/metrics` - Performance metrics

---

## 🛠️ STANDARD RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "timestamp": "2025-01-22T10:30:00Z", 
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-01-22T10:30:00Z",
  "error": "Detailed error information",
  "status_code": 400
}
```

---

## 🔒 AUTHENTICATION

### JWT Token Usage
Protected endpoints require JWT token:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Details
- **Expires:** 24 hours after login
- **Algorithm:** HS256
- **Claims:** user_id, username, email, is_admin
- **Refresh:** Re-login required

### Permission Levels
- **Public:** No authentication
- **User:** Valid JWT token
- **Admin:** JWT token + admin privileges

---

## ⚡ PERFORMANCE & LIMITS

### Response Times
- Authentication: ~50ms
- Agent Operations: ~100ms  
- Database Queries: ~20ms
- File Operations: ~200ms

### Rate Limits
- Standard Users: 100 req/min
- Admin Users: 500 req/min
- Heavy Operations: 10 req/min

---

## 🔧 DEVELOPMENT TOOLS

### Interactive Documentation
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`  
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

### Example cURL Commands
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# List agents
curl -X GET http://localhost:8000/api/v1/agents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 API STATUS

**API Health:** ✅ EXCELLENT  
**Total Endpoints:** 58+ endpoints  
**Service Modules:** 8 active services  
**Authentication:** ✅ Secure JWT  
**Documentation:** ✅ Complete  
**Testing Ready:** ✅ Yes  

---

*This document provides complete API reference for DPRO AI Agent system. Update with any API changes.* 