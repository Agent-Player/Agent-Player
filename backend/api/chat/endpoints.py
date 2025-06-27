"""
Chat API Endpoints
All chat and conversation related routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from models.chat import (
    ConversationCreate, ConversationUpdate, MessageCreate,
    ConversationListResponse, ConversationDetailResponse, MessageListResponse,
    ChatAnalyticsResponse, AIResponseRequest
)
from models.shared import SuccessResponse
from core.dependencies import get_current_user, get_optional_user, get_db
from services.chat_service import ChatService

# Initialize router and service
router = APIRouter(tags=["Chat"])
chat_service = ChatService()

# Conversation endpoints
@router.get("/conversations", response_model=SuccessResponse)
async def get_conversations(
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    """Get user conversations"""
    try:
        conversations = await chat_service.get_user_conversations(
            db=db,
            user_id=current_user["user_id"], 
            limit=limit, 
            offset=offset
        )
        total = await chat_service.get_user_conversations_count(db=db, user_id=current_user["user_id"])
        
        return SuccessResponse(
            message=f"Found {len(conversations)} conversations",
            data={
                "conversations": conversations,
                "total": total,
                "limit": limit,
                "offset": offset
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversations", response_model=SuccessResponse)
async def create_conversation(
    request: ConversationCreate,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new conversation"""
    try:
        # Set user_id from the authenticated user's session
        user_id = current_user["user_id"]
        
        conversation_id = await chat_service.create_conversation(
            db=db,
            title=request.title,
            user_id=user_id,
            agent_id=request.agent_id
        )
        
        return SuccessResponse(
            message="Conversation created successfully",
            data={"conversation_id": conversation_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}", response_model=SuccessResponse)
async def get_conversation(
    conversation_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific conversation"""
    try:
        conversation = await chat_service.get_conversation_by_id(db=db, conversation_id=conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Check if user owns this conversation
        if conversation["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return SuccessResponse(
            message="Conversation found",
            data=conversation
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/conversations/{conversation_id}", response_model=SuccessResponse)
async def update_conversation(
    conversation_id: str,
    request: ConversationUpdate,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update conversation"""
    try:
        # Check if user owns this conversation
        conversation = await chat_service.get_conversation_by_id(db=db, conversation_id=conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await chat_service.update_conversation(
            db=db,
            conversation_id=conversation_id,
            updates=request.dict(exclude_unset=True)
        )
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return SuccessResponse(
            message="Conversation updated successfully",
            data={"conversation_id": conversation_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}", response_model=SuccessResponse)
async def delete_conversation(
    conversation_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete conversation"""
    try:
        # Check if user owns this conversation
        conversation = await chat_service.get_conversation_by_id(db=db, conversation_id=conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await chat_service.delete_conversation(db=db, conversation_id=conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return SuccessResponse(
            message="Conversation deleted successfully",
            data={"conversation_id": conversation_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Message endpoints
@router.get("/conversations/{conversation_id}/messages", response_model=SuccessResponse)
async def get_conversation_messages(
    conversation_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0)
):
    """Get messages for a conversation"""
    try:
        # Check if user owns this conversation
        conversation = await chat_service.get_conversation_by_id(db=db, conversation_id=conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        messages = await chat_service.get_conversation_messages(
            db=db,
            conversation_id=conversation_id, 
            limit=limit, 
            offset=offset
        )
        total = await chat_service.get_conversation_messages_count(db=db, conversation_id=conversation_id)
        
        return SuccessResponse(
            message=f"Found {len(messages)} messages",
            data={
                "messages": messages,
                "total": total,
                "limit": limit,
                "offset": offset
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversations/{conversation_id}/messages", response_model=SuccessResponse)
async def add_message_to_conversation(
    conversation_id: str,
    request: MessageCreate,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add message to conversation"""
    try:
        # Check if user owns this conversation
        conversation = await chat_service.get_conversation_by_id(db=db, conversation_id=conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await chat_service.add_message_to_conversation(
            db=db,
            conversation_id=conversation_id,
            content=request.content,
            sender_type=request.sender_type,
            agent_id=request.agent_id
        )
        
        return SuccessResponse(
            message="Message added successfully",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversations/{conversation_id}/ai-response", response_model=SuccessResponse)
async def get_ai_response(
    conversation_id: str,
    request: AIResponseRequest,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI response for a message"""
    try:
        # Check if user owns this conversation
        conversation = await chat_service.get_conversation_by_id(db=db, conversation_id=conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await chat_service.generate_ai_response(
            db=db,
            conversation_id=conversation_id,
            message=request.message,
            agent_id=request.agent_id,
            conversation_history=request.conversation_history,
            include_context=request.include_context
        )
        
        return SuccessResponse(
            message="AI response generated",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@router.get("/analytics/dashboard", response_model=SuccessResponse)
async def get_chat_analytics(
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get chat analytics for current user"""
    try:
        analytics = await chat_service.get_user_chat_analytics(db=db, user_id=current_user["user_id"])
        return SuccessResponse(
            message="Analytics retrieved",
            data=analytics
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/global", response_model=SuccessResponse)
async def get_global_chat_analytics(
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get global chat analytics (admin only)"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        analytics = await chat_service.get_global_chat_analytics(db=db)
        return SuccessResponse(
            message="Global analytics retrieved",
            data=analytics
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search endpoints
@router.get("/search", response_model=SuccessResponse)
async def search_messages(
    query: str = Query(..., min_length=1, max_length=200),
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    conversation_id: Optional[str] = Query(None),
    limit: int = Query(default=20, ge=1, le=100)
):
    """Search messages"""
    try:
        results = await chat_service.search_user_messages(
            db=db,
            user_id=current_user["user_id"],
            query=query,
            conversation_id=conversation_id,
            limit=limit
        )
        
        return SuccessResponse(
            message=f"Found {len(results)} results",
            data={
                "results": results,
                "query": query,
                "total": len(results)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# SESSION MANAGEMENT ENDPOINTS

@router.post("/sessions", response_model=SuccessResponse)
async def create_chat_session(
    conversation_id: str,
    agent_id: Optional[int] = None,
    session_name: Optional[str] = None,
    session_type: str = "chat",
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        session = await session_service.create_session(
            user_id=current_user["user_id"],
            conversation_id=conversation_id,
            agent_id=agent_id,
            session_name=session_name,
            session_type=session_type
        )
        
        return SuccessResponse(
            message="Chat session created successfully",
            data={
                "session_id": session.id,
                "session_name": session.session_name,
                "conversation_id": session.conversation_id,
                "agent_id": session.agent_id,
                "status": session.status,
                "created_at": session.created_at.isoformat()
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions", response_model=SuccessResponse)
async def get_user_sessions(
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(None),
    session_type: Optional[str] = Query(None)
):
    """Get user's chat sessions"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        sessions = await session_service.get_user_sessions(
            user_id=current_user["user_id"],
            skip=skip,
            limit=limit,
            status=status,
            session_type=session_type
        )
        
        sessions_data = []
        for session in sessions:
            sessions_data.append({
                "session_id": session.id,
                "session_name": session.session_name,
                "conversation_id": session.conversation_id,
                "agent_id": session.agent_id,
                "session_type": session.session_type,
                "status": session.status,
                "start_time": session.start_time.isoformat() if session.start_time else None,
                "end_time": session.end_time.isoformat() if session.end_time else None,
                "last_activity": session.last_activity.isoformat() if session.last_activity else None,
                "total_duration": session.total_duration,
                "messages_count": session.messages_count,
                "tokens_used": session.tokens_used,
                "cost_incurred": session.cost_incurred,
                "created_at": session.created_at.isoformat()
            })
        
        return SuccessResponse(
            message=f"Found {len(sessions)} sessions",
            data={
                "sessions": sessions_data,
                "total": len(sessions_data),
                "skip": skip,
                "limit": limit
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}", response_model=SuccessResponse)
async def get_session_details(
    session_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific session details"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        session = await session_service.get_session(session_id, current_user["user_id"])
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SuccessResponse(
            message="Session found",
            data={
                "session_id": session.id,
                "session_name": session.session_name,
                "conversation_id": session.conversation_id,
                "agent_id": session.agent_id,
                "session_type": session.session_type,
                "status": session.status,
                "start_time": session.start_time.isoformat() if session.start_time else None,
                "end_time": session.end_time.isoformat() if session.end_time else None,
                "last_activity": session.last_activity.isoformat() if session.last_activity else None,
                "total_duration": session.total_duration,
                "messages_count": session.messages_count,
                "tokens_used": session.tokens_used,
                "cost_incurred": session.cost_incurred,
                "session_config": session.session_config,
                "context_data": session.context_data,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat()
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/sessions/{session_id}", response_model=SuccessResponse)
async def update_session(
    session_id: str,
    updates: Dict[str, Any],
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update session"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        session = await session_service.update_session(
            session_id=session_id,
            user_id=current_user["user_id"],
            updates=updates
        )
        
        return SuccessResponse(
            message="Session updated successfully",
            data={
                "session_id": session.id,
                "session_name": session.session_name,
                "status": session.status,
                "updated_at": session.updated_at.isoformat()
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/end", response_model=SuccessResponse)
async def end_session(
    session_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """End a chat session"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        session = await session_service.end_session(session_id, current_user["user_id"])
        
        return SuccessResponse(
            message="Session ended successfully",
            data={
                "session_id": session.id,
                "status": session.status,
                "total_duration": session.total_duration,
                "messages_count": session.messages_count,
                "tokens_used": session.tokens_used,
                "cost_incurred": session.cost_incurred,
                "end_time": session.end_time.isoformat() if session.end_time else None
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/history", response_model=SuccessResponse)
async def get_session_history(
    session_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200)
):
    """Get session history events"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        history = await session_service.get_session_history(
            session_id=session_id,
            user_id=current_user["user_id"],
            skip=skip,
            limit=limit
        )
        
        history_data = []
        for event in history:
            history_data.append({
                "id": event.id,
                "event_type": event.event_type,
                "event_data": event.event_data,
                "timestamp": event.timestamp.isoformat(),
                "duration": event.duration,
                "message_id": event.message_id,
                "agent_id": event.agent_id,
                "metadata": event.metadata
            })
        
        return SuccessResponse(
            message=f"Found {len(history)} history events",
            data={
                "history": history_data,
                "total": len(history_data),
                "skip": skip,
                "limit": limit
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/timeline", response_model=SuccessResponse)
async def get_session_timeline(
    session_id: str,
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed session timeline"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        timeline = await session_service.get_session_timeline(session_id, current_user["user_id"])
        
        return SuccessResponse(
            message="Session timeline retrieved",
            data=timeline
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/analytics", response_model=SuccessResponse)
async def get_session_analytics(
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    days: int = Query(default=30, ge=1, le=365)
):
    """Get session analytics for user"""
    try:
        from backend.services.session_service import SessionService
        session_service = SessionService(db)
        
        analytics = await session_service.get_session_analytics(
            user_id=current_user["user_id"],
            days=days
        )
        
        return SuccessResponse(
            message="Session analytics retrieved",
            data=analytics
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/search", response_model=SuccessResponse)
async def search_sessions(
    current_user: Dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    query: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    agent_id: Optional[int] = Query(None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100)
):
    """Search sessions with advanced filtering"""
    try:
        from backend.services.session_service import SessionService
        from datetime import datetime
        
        session_service = SessionService(db)
        
        # Parse dates if provided
        parsed_date_from = None
        parsed_date_to = None
        
        if date_from:
            try:
                parsed_date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_from format")
        
        if date_to:
            try:
                parsed_date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date_to format")
        
        sessions = await session_service.search_sessions(
            user_id=current_user["user_id"],
            query=query,
            date_from=parsed_date_from,
            date_to=parsed_date_to,
            agent_id=agent_id,
            skip=skip,
            limit=limit
        )
        
        sessions_data = []
        for session in sessions:
            sessions_data.append({
                "session_id": session.id,
                "session_name": session.session_name,
                "conversation_id": session.conversation_id,
                "agent_id": session.agent_id,
                "session_type": session.session_type,
                "status": session.status,
                "start_time": session.start_time.isoformat() if session.start_time else None,
                "last_activity": session.last_activity.isoformat() if session.last_activity else None,
                "total_duration": session.total_duration,
                "messages_count": session.messages_count,
                "tokens_used": session.tokens_used,
                "created_at": session.created_at.isoformat()
            })
        
        return SuccessResponse(
            message=f"Found {len(sessions)} sessions",
            data={
                "sessions": sessions_data,
                "total": len(sessions_data),
                "search_params": {
                    "query": query,
                    "date_from": date_from,
                    "date_to": date_to,
                    "agent_id": agent_id
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))