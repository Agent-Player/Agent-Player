-- Migration 040: Skills System
-- Marketplace for installing and managing Claude Skills from multiple sources

-- Skill sources (platforms like Anthropic, LobeHub, etc.)
CREATE TABLE IF NOT EXISTS skill_sources (
  id TEXT PRIMARY KEY DEFAULT ('src_' || lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('github', 'api', 'local')),
  repo_url TEXT, -- For GitHub sources: 'anthropics/skills'
  api_url TEXT, -- For API sources
  is_enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0, -- Higher priority = searched first
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Installed skills
CREATE TABLE IF NOT EXISTS installed_skills (
  id TEXT PRIMARY KEY DEFAULT ('skill_' || lower(hex(randomblob(16)))),
  source_id TEXT NOT NULL,
  skill_name TEXT NOT NULL, -- e.g., 'pdf-extractor'
  display_name TEXT, -- Human-readable name
  description TEXT,
  category TEXT, -- 'creative', 'development', 'enterprise', 'document'
  file_path TEXT NOT NULL, -- Local path to SKILL.md
  metadata TEXT, -- JSON: author, version, tags, etc.
  is_enabled INTEGER DEFAULT 1,
  install_date TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used TEXT,
  usage_count INTEGER DEFAULT 0,
  FOREIGN KEY (source_id) REFERENCES skill_sources(id) ON DELETE CASCADE,
  UNIQUE(source_id, skill_name)
);

-- Skill usage tracking (for analytics)
CREATE TABLE IF NOT EXISTS skill_usage_log (
  id TEXT PRIMARY KEY DEFAULT ('log_' || lower(hex(randomblob(16)))),
  skill_id TEXT NOT NULL,
  user_id TEXT,
  agent_id TEXT,
  used_at TEXT DEFAULT CURRENT_TIMESTAMP,
  session_context TEXT, -- What was the user trying to do?
  success INTEGER, -- 1 = success, 0 = failed
  FOREIGN KEY (skill_id) REFERENCES installed_skills(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_installed_skills_source ON installed_skills(source_id);
CREATE INDEX IF NOT EXISTS idx_installed_skills_category ON installed_skills(category);
CREATE INDEX IF NOT EXISTS idx_installed_skills_enabled ON installed_skills(is_enabled);
CREATE INDEX IF NOT EXISTS idx_skill_usage_log_skill ON skill_usage_log(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_usage_log_user ON skill_usage_log(user_id);

-- Insert default Anthropic source
INSERT INTO skill_sources (name, type, repo_url, is_enabled, priority)
VALUES ('Anthropic Official', 'github', 'anthropics/skills', 1, 100);

-- Insert placeholder for future sources
INSERT INTO skill_sources (name, type, repo_url, is_enabled, priority)
VALUES ('LobeHub', 'api', 'https://lobehub.com/api/skills', 0, 50);

INSERT INTO skill_sources (name, type, repo_url, is_enabled, priority)
VALUES ('SkillsMP', 'api', 'https://skillsmp.com/api/skills', 0, 30);
