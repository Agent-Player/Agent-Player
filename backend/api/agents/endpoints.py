"""
Agents API Endpoints
All agent management related routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional
from models.agent import (
    AgentCreateRequest, AgentUpdateRequest, AgentTestRequest,
    AgentListResponse, AgentDetailResponse, AgentTestResponse, 
    AgentStatsResponse, ChildAgentCreateRequest
)
from models.shared import SuccessResponse
from core.dependencies import get_current_user, get_optional_user
from services.agent_service import AgentService
from config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize router and service
router = APIRouter(tags=["Agents"])
agent_service = AgentService()

@router.get("", response_model=SuccessResponse)
async def get_all_agents(
    agent_type: Optional[str] = Query(None, pattern="^(main|child)$"),
    current_user: Optional[Dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all agents with optional filtering"""
    try:
        if agent_type == "main":
            agents = await agent_service.get_main_agents(db)
        elif agent_type == "child":
            agents = await agent_service.get_child_agents(db)
        else:
            agents = await agent_service.get_all_agents(db)
        
        return SuccessResponse(
            message=f"Found {len(agents)} agents",
            data={"agents": agents, "total": len(agents)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/main", response_model=SuccessResponse)
async def get_main_agents(db: AsyncSession = Depends(get_db)):
    """Get main agents only"""
    try:
        agents = await agent_service.get_main_agents(db)
        return SuccessResponse(
            message=f"Found {len(agents)} main agents",
            data={"agents": agents, "total": len(agents)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/child", response_model=SuccessResponse)
async def get_child_agents(db: AsyncSession = Depends(get_db)):
    """Get child agents only"""
    try:
        agents = await agent_service.get_child_agents(db)
        return SuccessResponse(
            message=f"Found {len(agents)} child agents",
            data={"agents": agents, "total": len(agents)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}", response_model=SuccessResponse)
async def get_agent_by_id(agent_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific agent by ID"""
    try:
        agent = await agent_service.get_agent_by_id(db, agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return SuccessResponse(
            message="Agent found",
            data=agent
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=SuccessResponse)
async def create_agent(
    request: AgentCreateRequest,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new agent"""
    try:
        # Set user_id from current user
        request.user_id = current_user["user_id"]
        
        agent_id = await agent_service.create_agent(
            db=db,
            name=request.name,
            description=request.description,
            agent_type=request.agent_type,
            model_provider=request.model_provider,
            model_name=request.model_name,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            api_key=request.api_key,
            parent_agent_id=request.parent_agent_id,
            user_id=request.user_id,
            is_local_model=request.is_local_model,
            local_config=request.local_config.dict() if request.local_config else None
        )
        
        return SuccessResponse(
            message="Agent created successfully",
            data={"agent_id": agent_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/child", response_model=SuccessResponse)
async def create_child_agent(
    request: AgentCreateRequest,  # Use regular AgentCreateRequest instead
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new child agent"""
    try:
        # Set user_id from current user
        request.user_id = current_user["user_id"]
        
        # Force agent_type to child
        agent_id = await agent_service.create_agent(
            db=db,
            name=request.name,
            description=request.description or "Child agent",
            agent_type="child",  # Force child type
            model_provider=request.model_provider,
            model_name=request.model_name,
            system_prompt=request.system_prompt or "You are a helpful child agent.",
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            api_key=request.api_key,
            parent_agent_id=request.parent_agent_id,  # This can be None initially
            user_id=request.user_id,
            is_local_model=request.is_local_model,
            local_config=request.local_config.dict() if request.local_config else None
        )
        
        return SuccessResponse(
            message="Child agent created successfully",
            data={"agent_id": agent_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agent_id}", response_model=SuccessResponse)
async def update_agent(
    agent_id: int, 
    request: AgentUpdateRequest,
    current_user: Optional[Dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    """Update existing agent"""
    try:
        # Convert request to dict and handle local_config properly
        update_data = request.dict(exclude_unset=True)
        
        # Convert local_config from Pydantic model to dict if present
        if 'local_config' in update_data and update_data['local_config'] is not None:
            if hasattr(update_data['local_config'], 'dict'):
                update_data['local_config'] = update_data['local_config'].dict()
        
        success = await agent_service.update_agent(db, agent_id, update_data)
        if not success:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return SuccessResponse(
            message="Agent updated successfully",
            data={"agent_id": agent_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{agent_id}", response_model=SuccessResponse)
async def delete_agent(
    agent_id: int,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete agent"""
    try:
        success = await agent_service.delete_agent(db, agent_id)
        if not success:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return SuccessResponse(
            message="Agent deleted successfully",
            data={"agent_id": agent_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{agent_id}/test", response_model=SuccessResponse)
async def test_agent(
    agent_id: int, 
    request: AgentTestRequest,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Test agent with a message"""
    try:
        result = await agent_service.test_agent(db, agent_id, request.message)
        
        # Check if there was an error
        if result.get("status") == "error":
            return SuccessResponse(
                success=False,
                message=result.get("message", "Agent test failed"),
                data=None
            )
        
        # Transform the result to match frontend expectations
        test_data = result.get("test_results", {})
        agent_info = result.get("agent_info", {})
        performance = result.get("performance", {})
        
        formatted_data = {
            "agent_name": agent_info.get("name", "Unknown Agent"),
            "model": f"{agent_info.get('model_provider', 'unknown')}/{agent_info.get('model_name', 'unknown')}",
            "user_message": test_data.get("user_message", request.message),
            "ai_response": test_data.get("agent_response", "No response generated"),
            "response_time": test_data.get("response_time", "0s"),
            "usage": {
                "total_tokens": performance.get("estimated_tokens", 0),
                "prompt_tokens": len(request.message.split()) if request.message else 0,
                "completion_tokens": performance.get("estimated_tokens", 0) - (len(request.message.split()) if request.message else 0)
            }
        }
        
        return SuccessResponse(
            success=True,
            message="Agent test completed successfully",
            data=formatted_data
        )
    except Exception as e:
        return SuccessResponse(
            success=False,
            message=f"Agent test failed: {str(e)}",
            data=None
        )

@router.get("/{agent_id}/children", response_model=SuccessResponse)
async def get_agent_children(agent_id: int, db: AsyncSession = Depends(get_db)):
    """Get child agents of a specific agent"""
    try:
        children = await agent_service.get_agent_children(db, agent_id)
        return SuccessResponse(
            message=f"Found {len(children)} child agents",
            data={"children": children, "total": len(children)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics/overview", response_model=SuccessResponse)
async def get_agent_statistics(db: AsyncSession = Depends(get_db)):
    """Get agent statistics"""
    try:
        stats = await agent_service.get_agent_statistics(db)
        return SuccessResponse(
            message="Statistics retrieved",
            data=stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}/performance", response_model=SuccessResponse)
async def get_agent_performance(agent_id: int, db: AsyncSession = Depends(get_db)):
    """Get agent performance metrics"""
    try:
        performance = await agent_service.get_agent_performance(db, agent_id)
        if not performance:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return SuccessResponse(
            message="Performance metrics retrieved",
            data=performance
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}/analytics", response_model=SuccessResponse)
async def get_agent_analytics(agent_id: int):
    """Get analytics for a specific agent (mock)"""
    try:
        return SuccessResponse(
            message="Agent analytics fetched successfully",
            data={
                "usage_count": 123,
                "average_response_time": 1.2,
                "success_rate": 0.97,
                "last_used": "2025-06-24T03:56:00Z"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{agent_id}/clone", response_model=SuccessResponse)
async def clone_agent(agent_id: int, current_user: Dict = Depends(get_current_user)):
    """Clone an agent (mock)"""
    try:
        new_agent_id = agent_id + 1000  # mock new id
        return SuccessResponse(
            message="Agent cloned successfully",
            data={"agent_id": new_agent_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agent_id}/activate", response_model=SuccessResponse)
async def activate_agent(agent_id: int, current_user: Dict = Depends(get_current_user)):
    """Activate an agent (mock)"""
    try:
        return SuccessResponse(
            message="Agent activated successfully",
            data={"agent_id": agent_id, "is_active": True}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{agent_id}/deactivate", response_model=SuccessResponse)
async def deactivate_agent(agent_id: int, current_user: Dict = Depends(get_current_user)):
    """Deactivate an agent (mock)"""
    try:
        return SuccessResponse(
            message="Agent deactivated successfully",
            data={"agent_id": agent_id, "is_active": False}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 