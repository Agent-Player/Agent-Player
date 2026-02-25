-- Migration 040: Multi-Tier Memory System
-- Three-tier memory architecture: Working → Experiential → Factual
-- Based on research: https://arxiv.org/abs/2512.13564
--
-- Note: The memories table columns (memory_layer, expiry_timestamp, consolidation_status,
-- importance_score, access_count, last_accessed_at) are already defined in the initial
-- CREATE TABLE in storage.ts. This migration only creates indexes and the consolidation log table.

-- Create index for efficient layer-based queries
CREATE INDEX IF NOT EXISTS idx_memories_layer ON memories(memory_layer);

-- Create index for expiry_timestamp (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_memories_expiry ON memories(expiry_timestamp) WHERE expiry_timestamp IS NOT NULL;

-- Create index for consolidation_status
CREATE INDEX IF NOT EXISTS idx_memories_consolidation ON memories(consolidation_status) WHERE memory_layer = 'experiential';

-- Create index for importance_score (for promotion queries)
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance_score);

-- Memory consolidation log table
CREATE TABLE IF NOT EXISTS memory_consolidation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_timestamp INTEGER NOT NULL,
  memories_consolidated INTEGER DEFAULT 0,
  memories_promoted INTEGER DEFAULT 0,
  memories_expired INTEGER DEFAULT 0,
  duration_ms INTEGER,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create index for consolidation log
CREATE INDEX IF NOT EXISTS idx_consolidation_log_timestamp ON memory_consolidation_log(run_timestamp);
