"""
Chat Service
Simplified chat and conversation management service
"""

from typing import Dict, Any, Optional, List
from config.database import db

class ChatService:
    """Chat management service (with in-memory mock for testing)"""
    # In-memory storage for mock/testing
    _conversations: Dict[str, Dict[str, Any]] = {}
    _messages: Dict[str, List[Dict[str, Any]]] = {}
    _conversation_counter: int = 1
    _message_counter: int = 1

    def __init__(self):
        self.db = db
    
    def get_user_conversations(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """Get user conversations"""
        # In-memory mock
        conversations = [conv for conv in self._conversations.values() if conv["user_id"] == user_id and conv["is_active"]]
        conversations.sort(key=lambda c: c["updated_at"], reverse=True)
        return conversations[offset:offset+limit]
    
    def get_user_conversations_count(self, user_id: int) -> int:
        """Get total count of user conversations"""
        return len([conv for conv in self._conversations.values() if conv["user_id"] == user_id and conv["is_active"]])
    
    def create_conversation(self, title: str, user_id: int, agent_id: Optional[int] = None) -> str:
        """Create new conversation"""
        conversation_id = str(self._conversation_counter)
        self._conversation_counter += 1
        conversation = {
            "id": conversation_id,
            "title": title,
            "user_id": user_id,
            "agent_id": agent_id,
            "is_active": True,
            "created_at": "2025-06-24 03:56:00",
            "updated_at": "2025-06-24 03:56:00"
        }
        self._conversations[conversation_id] = conversation
        self._messages[conversation_id] = []
        return conversation_id
    
    def get_conversation_by_id(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get specific conversation by ID"""
        conv = self._conversations.get(conversation_id)
        if conv and conv["is_active"]:
            return conv
        return None
    
    def update_conversation(self, conversation_id: str, updates: Dict[str, Any]) -> bool:
        """Update existing conversation"""
        conv = self._conversations.get(conversation_id)
        if not conv or not conv["is_active"]:
            return False
        conv.update(updates)
        conv["updated_at"] = "2025-06-24 03:56:00"
        return True
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete conversation (soft delete)"""
        conv = self._conversations.get(conversation_id)
        if not conv or not conv["is_active"]:
            return False
        conv["is_active"] = False
        return True
    
    def get_conversation_messages(self, conversation_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get messages for a conversation"""
        msgs = self._messages.get(conversation_id, [])
        return msgs[offset:offset+limit]
    
    def get_conversation_messages_count(self, conversation_id: str) -> int:
        """Get total count of messages in conversation"""
        return len(self._messages.get(conversation_id, []))
    
    async def add_message_to_conversation(self, conversation_id: str, message: str, sender_type: str = "user", agent_id: Optional[int] = None) -> Dict[str, Any]:
        """Add message to conversation"""
        msg = {
            "id": self._message_counter,
            "conversation_id": conversation_id,
            "message": message,
            "sender_type": sender_type,
            "agent_id": agent_id,
            "is_active": True,
            "created_at": "2025-06-24 03:56:00"
        }
        self._message_counter += 1
        self._messages.setdefault(conversation_id, []).append(msg)
        return {"message_id": msg["id"], "status": "success"}
    
    async def generate_ai_response(self, conversation_id: str, message: str, agent_id: Optional[int] = None, conversation_history: Optional[List] = None, include_context: bool = True) -> Dict[str, Any]:
        """Generate AI response for a message"""
        return {
            "response": "This is a mock AI response",
            "agent_id": agent_id,
            "processing_time": 1.5,
            "status": "success"
        }
    
    def get_user_chat_analytics(self, user_id: int) -> Dict[str, Any]:
        """Get chat analytics for user"""
        conversations = self.db.execute_query("SELECT COUNT(*) as count FROM conversations WHERE user_id = ? AND is_active = 1", (user_id,))
        messages = self.db.execute_query("SELECT COUNT(*) as count FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.user_id = ? AND m.is_active = 1", (user_id,))
        
        return {
            "total_conversations": conversations[0]['count'] if conversations else 0,
            "total_messages": messages[0]['count'] if messages else 0,
            "active_conversations": conversations[0]['count'] if conversations else 0,
            "average_messages_per_conversation": 0.0,
            "most_used_agents": [],
            "recent_activity": []
        }
    
    def get_global_chat_analytics(self) -> Dict[str, Any]:
        """Get global chat analytics"""
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "active_conversations": 0,
            "average_messages_per_conversation": 0.0,
            "most_used_agents": [],
            "recent_activity": []
        }
    
    def search_user_messages(self, user_id: int, query: str, conversation_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Search messages for user"""
        return [] 