-- Migration 042: User custom animations (Mixamo FBX / GLB uploads)
CREATE TABLE IF NOT EXISTS user_animations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Custom Animation',
  filename TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'glb',
  category TEXT NOT NULL DEFAULT 'custom',
  local_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_animations_user ON user_animations(user_id);
