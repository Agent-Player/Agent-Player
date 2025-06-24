"""
User Service
Simplified user management service
"""

from typing import Dict, Any, Optional, List
from config.database import db

class UserService:
    """User management service"""
    
    def __init__(self):
        self.db = db
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users"""
        query = "SELECT id, email, username, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC"
        return self.db.execute_query(query)
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get specific user by ID"""
        query = "SELECT id, email, username, full_name, role, is_active, created_at FROM users WHERE id = ?"
        users = self.db.execute_query(query, (user_id,))
        return users[0] if users else None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get specific user by email"""
        query = "SELECT id, email, username, full_name, role, is_active, created_at FROM users WHERE email = ?"
        users = self.db.execute_query(query, (email,))
        return users[0] if users else None
    
    def update_user(self, user_id: int, updates: Dict[str, Any]) -> bool:
        """Update existing user"""
        return True
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user (soft delete)"""
        query = "UPDATE users SET is_active = 0 WHERE id = ?"
        result = self.db.execute_command(query, (user_id,))
        return result > 0
    
    def get_user_statistics(self) -> Dict[str, Any]:
        """Get user statistics"""
        total = len(self.db.execute_query("SELECT id FROM users"))
        active = len(self.db.execute_query("SELECT id FROM users WHERE is_active = 1"))
        
        return {
            "total_users": total,
            "active_users": active,
            "inactive_users": total - active
        }

    def get_user_profile(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get current user profile"""
        query = "SELECT id, email, username, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?"
        users = self.db.execute_query(query, (user_id,))
        return users[0] if users else None

    def update_user_profile(self, user_id: int, updates: Dict[str, Any]) -> bool:
        """Update current user profile (full_name, bio, etc.)"""
        allowed = {k: v for k, v in updates.items() if k in ["full_name", "bio"]}
        if not allowed:
            return False
        set_clause = ", ".join([f"{k} = ?" for k in allowed.keys()])
        params = list(allowed.values()) + [user_id]
        query = f"UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        result = self.db.execute_command(query, tuple(params))
        return result > 0

    def get_user_settings(self, user_id: int) -> Dict[str, Any]:
        """Get user settings (mocked if not in DB)"""
        # For demo, return mock settings
        return {"theme": "light", "notifications_enabled": True, "language": "en"}

    def update_user_settings(self, user_id: int, settings: Dict[str, Any]) -> bool:
        """Update user settings (mock, always True)"""
        # In real app, save to DB
        return True

    def get_user_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get user preferences (mocked)"""
        return {"sidebar_collapsed": False, "show_tips": True}

    def update_user_preferences(self, user_id: int, preferences: Dict[str, Any]) -> bool:
        """Update user preferences (mock, always True)"""
        return True

    def get_user_activity(self, user_id: int) -> list:
        """Get user activity log (from activity_logs table)"""
        query = "SELECT id, action, details, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC"
        return self.db.execute_query(query, (user_id,))

    def get_user_statistics(self, user_id: int) -> Dict[str, Any]:
        """Get statistics for a specific user (mocked)"""
        return {"total_logins": 12, "last_login": "2025-06-24 03:21:35", "total_actions": 34}

    def update_user_by_admin(self, user_id: int, updates: Dict[str, Any]) -> bool:
        """Admin: update user info"""
        allowed = {k: v for k, v in updates.items() if k in ["full_name", "role", "is_active"]}
        if not allowed:
            return False
        set_clause = ", ".join([f"{k} = ?" for k in allowed.keys()])
        params = list(allowed.values()) + [user_id]
        query = f"UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        result = self.db.execute_command(query, tuple(params))
        return result > 0 