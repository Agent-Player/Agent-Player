import sqlite3
import bcrypt

# Database path
db_path = "backend/data/database.db"

def hash_password_bcrypt(password: str) -> str:
    """Hash password using bcrypt (same as in security.py)"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

try:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("Updating admin user with bcrypt password...")
    
    # Hash the password properly with bcrypt
    password_hash = hash_password_bcrypt("admin123456")
    
    # Update the admin user
    cursor.execute("""
    UPDATE users 
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE email = 'me@alarade.at'
    """, (password_hash,))
    
    conn.commit()
    
    # Print all users for debugging
    print("\nAll users in database:")
    cursor.execute("SELECT id, email, username, is_active, role FROM users")
    for row in cursor.fetchall():
        print(dict(row))
    
    # Verify the update
    cursor.execute("SELECT * FROM users WHERE email = 'me@alarade.at'")
    admin = cursor.fetchone()
    
    if admin:
        print(f"✅ Admin user updated successfully!")
        print(f"ID: {admin['id']}")
        print(f"Email: {admin['email']}")
        print(f"Username: {admin['username']}")
        print(f"Role: {admin['role']}")
        print(f"Password hash starts with: {admin['password_hash'][:20]}...")
    else:
        print("❌ Admin user not found!")
    
    conn.close()
    print("✅ Password update completed!")
    
except Exception as e:
    print(f"❌ Error: {e}") 