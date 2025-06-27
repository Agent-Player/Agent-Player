# Complete Database Schema Documentation
*Comprehensive Reference Guide for Dpro AI Agent Database*

Generated on: `2025-06-22`
Database Location: `backend/dpro_agent.db`
Database Type: SQLite

## Table of Contents

1. [Database Overview](#database-overview)
2. [User Management](#user-management)
3. [Authentication & Licensing](#authentication--licensing)
4. [Chat System](#chat-system)
5. [Agent Management](#agent-management)
6. [Board & Workflow System](#board--workflow-system)
7. [Task Management](#task-management)
8. [Marketplace & Tools](#marketplace--tools)
9. [Analytics & Logging](#analytics--logging)
10. [Data Relationships](#data-relationships)
11. [Indexes & Performance](#indexes--performance)
12. [Usage Patterns](#usage-patterns)

---

## Database Overview

The Dpro AI Agent database contains **21 main tables** organized into 8 functional areas:

- **User Management**: 6 tables (users, profiles, preferences, etc.)
- **Chat System**: 4 tables (conversations, messages, enhanced versions)
- **Agent Management**: 3 tables (agents, configurations, child agents)
- **Authentication**: 2 tables (sessions, licenses)
- **Workflows**: 2 tables (boards, workflows)
- **Tasks**: 2 tables (tasks, assignments)
- **Tools**: 1 table (marketplace tools)
- **Analytics**: 1 table (system logs)

**Total Records**: 55+ active records across all tables

---

## User Management

### 1. `users` Table
**Purpose**: Core user account information
**Records**: 3 users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique user identifier |
| username | TEXT | UNIQUE, NOT NULL | User login name |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| is_active | BOOLEAN | DEFAULT 1 | Account active status |
| is_admin | BOOLEAN | DEFAULT 0 | Admin privileges flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last profile update |

**Sample Records**:
```
ID: 1, Username: admin, Email: admin@dpro.com, Active: Yes, Admin: Yes
ID: 2, Username: testuser, Email: test@example.com, Active: Yes, Admin: No
ID: 3, Username: demo, Email: demo@dpro.com, Active: Yes, Admin: No
```

### 2. `user_profiles` Table
**Purpose**: Extended user profile information
**Records**: 3 profiles

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| avatar_url | TEXT | Profile picture URL |
| bio | TEXT | User biography |
| location | TEXT | User location |
| website | TEXT | Personal/company website |
| phone | TEXT | Contact phone number |
| date_of_birth | DATE | Birth date |
| created_at | TIMESTAMP | Profile creation time |
| updated_at | TIMESTAMP | Last update time |

### 3. `user_preferences` Table
**Purpose**: User application settings and preferences
**Records**: 3 preference sets

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| theme | TEXT | UI theme (light/dark) |
| language | TEXT | Interface language |
| timezone | TEXT | User timezone |
| notifications_enabled | BOOLEAN | Email notifications |
| privacy_level | TEXT | Privacy settings |
| dashboard_layout | TEXT | Dashboard configuration |
| created_at | TIMESTAMP | Settings creation time |
| updated_at | TIMESTAMP | Last settings update |

### 4. `user_activity` Table
**Purpose**: Track user activity and login sessions
**Records**: Multiple activity logs

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| activity_type | TEXT | Type of activity |
| activity_data | TEXT | JSON activity details |
| ip_address | TEXT | User IP address |
| user_agent | TEXT | Browser information |
| created_at | TIMESTAMP | Activity timestamp |

---

## Authentication & Licensing

### 5. `user_sessions` Table
**Purpose**: Manage active user sessions and authentication tokens
**Records**: Session tracking data

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| session_token | TEXT | Unique session identifier |
| expires_at | TIMESTAMP | Session expiration time |
| is_active | BOOLEAN | Session status |
| created_at | TIMESTAMP | Session start time |

### 6. `licenses` Table
**Purpose**: Software licensing and subscription management
**Records**: License information

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| license_key | TEXT | License activation key |
| license_type | TEXT | License tier/type |
| status | TEXT | License status |
| expires_at | TIMESTAMP | License expiration |
| created_at | TIMESTAMP | License creation time |

---

## Chat System

### 7. `conversations` Table
**Purpose**: Standard chat conversations
**Records**: 17 conversations

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| agent_id | INTEGER | FK to agents.id |
| title | TEXT | Conversation title |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Usage**: Main conversation container for user-agent interactions

### 8. `messages` Table
**Purpose**: Individual chat messages
**Records**: 32 messages

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| conversation_id | INTEGER | FK to conversations.id |
| user_id | INTEGER | FK to users.id |
| message | TEXT | Message content |
| message_type | TEXT | Message type (text/system/etc) |
| created_at | TIMESTAMP | Message timestamp |

**Usage**: Stores all chat messages with conversation threading

### 9. `enhanced_conversations` Table
**Purpose**: Advanced conversation features with UUID support
**Records**: 2 enhanced conversations

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY (UUID) |
| user_id | INTEGER | FK to users.id |
| title | TEXT | Conversation title |
| description | TEXT | Detailed description |
| conversation_type | TEXT | Type classification |
| primary_agent_id | INTEGER | Main agent FK |
| participating_agents | TEXT | JSON array of agent IDs |
| tags | TEXT | JSON array of tags |
| is_pinned | BOOLEAN | Favorite/pinned status |
| message_count | INTEGER | Total message count |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last activity time |

**Usage**: Extended conversations with metadata and multi-agent support

### 10. `enhanced_messages` Table
**Purpose**: Advanced message features
**Records**: 4 enhanced messages

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY (UUID) |
| conversation_id | TEXT | FK to enhanced_conversations.id |
| user_id | INTEGER | FK to users.id |
| agent_id | INTEGER | FK to agents.id (optional) |
| content | TEXT | Message content |
| message_type | TEXT | Message classification |
| metadata | TEXT | JSON metadata |
| created_at | TIMESTAMP | Message timestamp |

**Usage**: Rich messages with metadata support

---

## Agent Management

### 11. `agents` Table
**Purpose**: AI agent definitions and configurations
**Records**: 8 agents

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | TEXT | Agent display name |
| description | TEXT | Agent description |
| type | TEXT | Agent type/category |
| config | TEXT | JSON configuration |
| is_active | BOOLEAN | Agent status |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Sample Agents**:
- Workflow Assistant (automation)
- API Connector (integration)
- Logic Designer (programming)
- Data Analyst (analytics)

### 12. `agent_configurations` Table
**Purpose**: Detailed agent settings and parameters
**Records**: Configuration data

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| agent_id | INTEGER | FK to agents.id |
| config_key | TEXT | Configuration parameter |
| config_value | TEXT | Parameter value |
| created_at | TIMESTAMP | Configuration time |

### 13. `child_agents` Table
**Purpose**: Specialized sub-agents for specific tasks
**Records**: Child agent definitions

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| parent_agent_id | INTEGER | FK to agents.id |
| name | TEXT | Child agent name |
| capabilities | TEXT | JSON capabilities array |
| memory_summary | TEXT | Agent memory/context |
| status | TEXT | Agent status |
| created_at | TIMESTAMP | Creation time |

---

## Board & Workflow System

### 14. `boards` Table
**Purpose**: Visual workflow boards
**Records**: Board definitions

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| name | TEXT | Board name |
| description | TEXT | Board description |
| board_data | TEXT | JSON board configuration |
| is_active | BOOLEAN | Board status |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### 15. `workflows` Table
**Purpose**: Executable workflow definitions
**Records**: Workflow data

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| board_id | INTEGER | FK to boards.id |
| user_id | INTEGER | FK to users.id |
| name | TEXT | Workflow name |
| workflow_data | TEXT | JSON workflow definition |
| status | TEXT | Workflow status |
| created_at | TIMESTAMP | Creation time |

---

## Task Management

### 16. `tasks` Table
**Purpose**: Task and project management
**Records**: Task definitions

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK to users.id |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | Task status |
| priority | TEXT | Task priority |
| due_date | DATE | Task deadline |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### 17. `task_assignments` Table
**Purpose**: Task assignment to users/agents
**Records**: Assignment tracking

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| task_id | INTEGER | FK to tasks.id |
| user_id | INTEGER | FK to users.id (optional) |
| agent_id | INTEGER | FK to agents.id (optional) |
| assigned_at | TIMESTAMP | Assignment time |

---

## Marketplace & Tools

### 18. `marketplace_tools` Table
**Purpose**: Available tools and plugins
**Records**: Tool catalog

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | TEXT | Tool name |
| description | TEXT | Tool description |
| category | TEXT | Tool category |
| version | TEXT | Tool version |
| config | TEXT | JSON configuration |
| is_active | BOOLEAN | Tool availability |
| created_at | TIMESTAMP | Addition time |

---

## Analytics & Logging

### 19. `system_logs` Table
**Purpose**: System activity and error logging
**Records**: Log entries

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| log_level | TEXT | Log severity |
| source | TEXT | Log source |
| message | TEXT | Log message |
| metadata | TEXT | JSON additional data |
| created_at | TIMESTAMP | Log timestamp |

---

## Data Relationships

### Primary Relationships

```
users (1) -----> (M) conversations
users (1) -----> (M) messages
users (1) -----> (1) user_profiles
users (1) -----> (1) user_preferences
users (1) -----> (M) user_activity
users (1) -----> (M) user_sessions
users (1) -----> (M) licenses
users (1) -----> (M) boards
users (1) -----> (M) workflows
users (1) -----> (M) tasks

agents (1) -----> (M) conversations
agents (1) -----> (M) enhanced_conversations
agents (1) -----> (M) enhanced_messages
agents (1) -----> (M) agent_configurations
agents (1) -----> (M) child_agents

conversations (1) -----> (M) messages
enhanced_conversations (1) -----> (M) enhanced_messages

boards (1) -----> (M) workflows
tasks (1) -----> (M) task_assignments
```

### Foreign Key Constraints

- All foreign keys maintain referential integrity
- Cascade delete configured for dependent records
- Index optimization on FK columns

---

## Indexes & Performance

### Automatic Indexes
- Primary key indexes on all tables
- Unique constraints on email, username
- Foreign key indexes

### Recommended Custom Indexes
```sql
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at);
CREATE INDEX idx_enhanced_messages_conversation ON enhanced_messages(conversation_id);
CREATE INEX idx_user_activity_user_created ON user_activity(user_id, created_at);
```

---

## Usage Patterns

### Chat System Usage
- **Standard Chat**: Uses `conversations` + `messages` tables
- **Enhanced Chat**: Uses `enhanced_conversations` + `enhanced_messages`
- **Multi-Agent Support**: Enhanced system supports multiple agents per conversation
- **Message Threading**: Conversation ID links messages together

### User Management
- **Profile System**: Core user data + extended profile + preferences
- **Activity Tracking**: All user actions logged in user_activity
- **Session Management**: Active sessions tracked for security

### Agent System
- **Parent-Child Hierarchy**: Main agents can have specialized child agents
- **Configuration System**: Flexible config storage in JSON format
- **Capability Mapping**: Child agents have specific capabilities

### Board System
- **Visual Workflows**: Boards contain visual workflow representations
- **Executable Workflows**: Workflows contain runnable process definitions
- **User Ownership**: Each board/workflow belongs to a specific user

---

## Development Guidelines

### Adding New Tables
1. Follow the existing naming convention (lowercase, underscores)
2. Include standard audit fields (created_at, updated_at)
3. Use appropriate foreign key constraints
4. Add indexes for performance

### Schema Updates
1. Use migration scripts for schema changes
2. Maintain backward compatibility when possible
3. Update this documentation after changes
4. Test foreign key constraints thoroughly

### Data Access Patterns
1. Use transactions for multi-table operations
2. Implement proper error handling for FK violations
3. Consider pagination for large result sets
4. Use appropriate indexes for query optimization

---

## Backup & Maintenance

### Backup Strategy
- Regular SQLite database file backups
- Export critical data to JSON format
- Version control for schema changes

### Maintenance Tasks
- Regular VACUUM operations for optimization
- Monitor table sizes and growth patterns
- Clean up expired sessions and old logs
- Verify foreign key integrity

---

*This documentation serves as the authoritative reference for the Dpro AI Agent database schema. Update this file whenever schema changes are made to maintain accuracy.* 