#!/usr/bin/env python3
"""
Direct Test for Child Agent Creation
Tests the agent service directly without server
"""

import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import get_db
from services.agent_service import AgentService
from models.agent import ChildAgentCreateRequest

async def test_child_agent_direct():
    """Test child agent creation directly through service"""
    print("🤖 Testing Child Agent Creation (Direct)...")
    
    # Initialize service
    agent_service = AgentService()
    
    # Get database session
    db_gen = get_db()
    db = await db_gen.__anext__()
    
    try:
        # Test 1: List existing agents
        print("\n1. Listing existing agents...")
        all_agents = await agent_service.get_all_agents(db)
        print(f"   Total agents: {len(all_agents)}")
        
        main_agents = [a for a in all_agents if a.get('agent_type') == 'main']
        child_agents = [a for a in all_agents if a.get('agent_type') == 'child']
        
        print(f"   Main agents: {len(main_agents)}")
        print(f"   Child agents: {len(child_agents)}")
        
        if main_agents:
            print("   Main agents:")
            for agent in main_agents[:3]:
                print(f"     - ID: {agent['id']}, Name: {agent['name']}")
        
        # Test 2: Create child agent if main agent exists
        if main_agents:
            parent_id = main_agents[0]['id']
            print(f"\n2. Creating child agent with parent ID: {parent_id}")
            
            try:
                child_agent_id = await agent_service.create_agent(
                    db=db,
                    name="Test Child Agent Direct",
                    description="Child agent created via direct test",
                    agent_type="child",
                    model_provider="openai",
                    model_name="gpt-3.5-turbo",
                    system_prompt="You are a helpful child agent.",
                    temperature=0.7,
                    max_tokens=2000,
                    api_key="sk-test-key",
                    parent_agent_id=parent_id,
                    user_id=1
                )
                
                print(f"   ✅ Child agent created successfully! ID: {child_agent_id}")
                
                # Test 3: Verify child agent was created
                print("\n3. Verifying child agent...")
                child_agent = await agent_service.get_agent_by_id(db, child_agent_id)
                if child_agent:
                    print(f"   ✅ Child agent verified!")
                    print(f"   Name: {child_agent['name']}")
                    print(f"   Type: {child_agent['agent_type']}")
                    print(f"   Parent ID: {child_agent['parent_agent_id']}")
                else:
                    print("   ❌ Child agent not found after creation")
                
            except Exception as e:
                print(f"   ❌ Error creating child agent: {e}")
        else:
            print("\n2. ❌ No main agents found! Cannot create child agent.")
        
        # Test 4: List all agents again
        print("\n4. Final agent count...")
        all_agents_final = await agent_service.get_all_agents(db)
        main_agents_final = [a for a in all_agents_final if a.get('agent_type') == 'main']
        child_agents_final = [a for a in all_agents_final if a.get('agent_type') == 'child']
        
        print(f"   Total agents: {len(all_agents_final)}")
        print(f"   Main agents: {len(main_agents_final)}")
        print(f"   Child agents: {len(child_agents_final)}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await db.close()

def main():
    """Run the test"""
    asyncio.run(test_child_agent_direct())

if __name__ == "__main__":
    main() 