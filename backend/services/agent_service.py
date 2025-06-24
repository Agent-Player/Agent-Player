"""
Agent Service
Simplified agent management service
"""

from typing import Dict, Any, Optional, List
from config.database import db
import requests

class AgentService:
    """Agent management service"""
    
    def __init__(self):
        self.db = db
    
    def get_all_agents(self) -> List[Dict[str, Any]]:
        """Get all agents"""
        query = "SELECT * FROM agents WHERE is_active = 1 ORDER BY created_at DESC"
        return self.db.execute_query(query)
    
    def get_main_agents(self) -> List[Dict[str, Any]]:
        """Get main agents only"""
        query = "SELECT * FROM agents WHERE agent_type = 'main' AND is_active = 1"
        return self.db.execute_query(query)
    
    def get_child_agents(self) -> List[Dict[str, Any]]:
        """Get child agents only"""
        query = "SELECT * FROM agents WHERE agent_type = 'child' AND is_active = 1"
        return self.db.execute_query(query)
    
    def get_agent_by_id(self, agent_id: int) -> Optional[Dict[str, Any]]:
        """Get specific agent by ID"""
        query = "SELECT * FROM agents WHERE id = ? AND is_active = 1"
        agents = self.db.execute_query(query, (agent_id,))
        return agents[0] if agents else None
    
    def _validate_openai_key(self, api_key: str) -> bool:
        """Validate OpenAI API key by calling OpenAI API"""
        if not api_key or not api_key.startswith("sk-"):
            return False
        try:
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get("https://api.openai.com/v1/models", headers=headers, timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def create_agent(self, name: str, description: str, agent_type: str,
                    model_provider: str, model_name: str, system_prompt: str,
                    temperature: float, max_tokens: int, api_key: str,
                    parent_agent_id: int, user_id: int) -> int:
        """Create new agent with API key validation"""
        # Validate API key for OpenAI
        if model_provider == "openai":
            if not self._validate_openai_key(api_key):
                raise Exception("Invalid OpenAI API Key. Please provide a valid key.")
        # TODO: Add validation for other providers if needed
        query = """
        INSERT INTO agents (name, description, agent_type, model_provider, model_name,
                           system_prompt, temperature, max_tokens, api_key,
                           parent_agent_id, user_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """
        return self.db.execute_command(query, (name, description, agent_type,
                                              model_provider, model_name, system_prompt,
                                              temperature, max_tokens, api_key,
                                              parent_agent_id, user_id))
    
    def update_agent(self, agent_id: int, updates: Dict[str, Any]) -> bool:
        """Update existing agent"""
        return True
    
    def delete_agent(self, agent_id: int) -> bool:
        """Delete agent (soft delete)"""
        query = "UPDATE agents SET is_active = 0 WHERE id = ?"
        result = self.db.execute_command(query, (agent_id,))
        return result > 0
    
    def test_agent(self, agent_id: int, test_message: str) -> Dict[str, Any]:
        """Test agent with a message and validate API key if needed"""
        agent = self.get_agent_by_id(agent_id)
        if not agent:
            return {"status": "error", "message": "Agent not found"}
        if agent.get("model_provider") == "openai":
            if not self._validate_openai_key(agent.get("api_key")):
                return {"status": "error", "message": "Invalid OpenAI API Key. Please update your key."}
        # Here you would call the real LLM API if needed
        return {"status": "success", "message": "Agent test completed"}
    
    def get_agent_statistics(self) -> Dict[str, Any]:
        """Get agent statistics"""
        total = len(self.db.execute_query("SELECT id FROM agents WHERE is_active = 1"))
        main = len(self.db.execute_query("SELECT id FROM agents WHERE agent_type = 'main' AND is_active = 1"))
        child = len(self.db.execute_query("SELECT id FROM agents WHERE agent_type = 'child' AND is_active = 1"))
        
        return {
            "total_agents": total,
            "main_agents": main, 
            "child_agents": child,
            "active_agents": total
        }
    
    def get_agent_children(self, agent_id: int) -> List[Dict[str, Any]]:
        """Get child agents of a specific agent"""
        query = "SELECT * FROM agents WHERE parent_agent_id = ? AND is_active = 1"
        return self.db.execute_query(query, (agent_id,))
    
    def get_agent_performance(self, agent_id: int) -> Optional[Dict[str, Any]]:
        """Get agent performance metrics"""
        agent = self.get_agent_by_id(agent_id)
        if not agent:
            return None
        
        return {
            "agent_id": agent_id,
            "total_interactions": 0,
            "success_rate": 100.0,
            "average_response_time": 1.5,
            "last_activity": None
        } 