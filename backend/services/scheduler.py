import asyncio
import logging
from datetime import datetime
from typing import Dict, Optional
from .system_monitor_service import SystemMonitorService

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.system_monitor = SystemMonitorService()
        self.is_running = False
        self.last_metrics: Optional[Dict] = None
        self._task = None

    async def start(self):
        """Start the scheduler"""
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._run_scheduler())
            logger.info("Scheduler started")

    async def stop(self):
        """Stop the scheduler"""
        if self.is_running:
            self.is_running = False
            if self._task:
                self._task.cancel()
                try:
                    await self._task
                except asyncio.CancelledError:
                    pass
            logger.info("Scheduler stopped")

    async def _run_scheduler(self):
        """Run scheduled tasks"""
        while self.is_running:
            try:
                # Collect system metrics every hour
                self.last_metrics = self.system_monitor.get_system_metrics()
                logger.info(f"System metrics collected at {datetime.now().isoformat()}")
                
                # Wait for 1 hour before next collection
                await asyncio.sleep(3600)  # 3600 seconds = 1 hour
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler: {str(e)}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying

    def get_latest_metrics(self) -> Optional[Dict]:
        """Get the most recent metrics"""
        if not self.last_metrics:
            # If no metrics in memory, try to get from log file
            return self.system_monitor.get_last_metrics()
        return self.last_metrics

    def get_metrics_history(self, hours: int = 24) -> list:
        """Get metrics history for the specified number of hours"""
        return self.system_monitor.get_metrics_history(hours) 