"""
System API Endpoints
Author: Agent Player Development Team
Description: System health monitoring and metrics
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from datetime import datetime

from services.scheduler import SchedulerService
from services.system_monitor_service import SystemMonitorService

router = APIRouter(tags=["System"])

# Initialize services
system_monitor = SystemMonitorService()
scheduler = SchedulerService()

@router.on_event("startup")
async def startup_event():
    """Start the scheduler on application startup"""
    await scheduler.start()

@router.on_event("shutdown")
async def shutdown_event():
    """Stop the scheduler on application shutdown"""
    await scheduler.stop()

@router.get("/health")
async def get_system_health():
    """
    Get current system health metrics.
    If metrics were collected in the last hour, returns cached metrics.
    Otherwise, collects new metrics.
    """
    try:
        # Try to get latest metrics from scheduler
        metrics = scheduler.get_latest_metrics()
        
        # If no metrics available, collect new ones
        if not metrics:
            metrics = system_monitor.get_system_metrics()
            
        return {
            "success": True,
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get system metrics: {str(e)}"
        )

@router.get("/health/history")
async def get_system_health_history(hours: Optional[int] = 24):
    """Get system health metrics history"""
    try:
        metrics = scheduler.get_metrics_history(hours)
        return {
            "success": True,
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get metrics history: {str(e)}"
        )

@router.post("/health/collect")
async def collect_system_metrics():
    """
    Force collection of new system metrics.
    This endpoint can be used to manually trigger metrics collection.
    """
    try:
        metrics = system_monitor.get_system_metrics()
        return {
            "success": True,
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to collect system metrics: {str(e)}"
        )

@router.get("/metrics")
async def get_system_metrics():
    """
    Get current system metrics.
    If metrics were collected in the last hour, returns cached metrics.
    Otherwise, collects new metrics.
    """
    try:
        # Try to get latest metrics from scheduler
        metrics = scheduler.get_latest_metrics()
        
        # If no metrics available, collect new ones
        if not metrics:
            metrics = system_monitor.get_system_metrics()
            
        return {
            "success": True,
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get system metrics: {str(e)}"
        ) 