import sqlite3
import os
import hashlib
from datetime import datetime

# Database path
db_path = "backend/data/database.db"

# Create the directory if it doesn't exist
os.makedirs("backend/data", exist_ok=True)

def hash_password(password: str) -> str:
    """Simple password hashing (for testing only)"""
    return hashlib.sha256(password.encode()).hexdigest()

try:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("Creating database tables...")
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Agents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        agent_type TEXT DEFAULT 'main',
        model_provider TEXT DEFAULT 'openai',
        model_name TEXT DEFAULT 'gpt-3.5-turbo',
        system_prompt TEXT,
        temperature REAL DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 1000,
        api_key TEXT,
        parent_agent_id INTEGER,
        user_id INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_agent_id) REFERENCES agents(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # Conversations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        agent_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
    """)
    
    # Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        content TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        agent_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
    """)
    
    # Activity logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # User sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    conn.commit()
    print("✅ All tables created successfully!")
    
    # Check if admin user already exists
    cursor.execute("SELECT * FROM users WHERE email = 'me@alarade.at'")
    existing_user = cursor.fetchone()
    
    if not existing_user:
        # Create admin user
        password_hash = hash_password("admin123456")
        cursor.execute("""
        INSERT INTO users (email, username, full_name, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        """, ("me@alarade.at", "admin", "Admin User", password_hash, "admin", 1))
        
        conn.commit()
        print("✅ Admin user created successfully!")
        print("Email: me@alarade.at")
        print("Password: admin123456")
    else:
        print("✅ Admin user already exists!")
    
    # Verify admin user
    cursor.execute("SELECT * FROM users WHERE email = 'me@alarade.at'")
    admin = cursor.fetchone()
    if admin:
        print(f"✅ Admin verification: ID={admin['id']}, Email={admin['email']}, Role={admin['role']}")
    
    conn.close()
    print("✅ Database initialization completed!")
    
except Exception as e:
    print(f"❌ Database error: {e}") 