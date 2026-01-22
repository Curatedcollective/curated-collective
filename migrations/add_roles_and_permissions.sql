-- Add roles and permissions tables
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(50) DEFAULT 'purple',
  icon VARCHAR(50) DEFAULT 'shield',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by VARCHAR NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  context TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create unique partial index to prevent duplicate active role assignments
-- This allows the same role to be assigned multiple times if inactive (for history)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_role 
ON user_roles (user_id, role_id) 
WHERE is_active = true;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

CREATE TABLE IF NOT EXISTS role_invites (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_invites_code ON role_invites(code);
CREATE INDEX IF NOT EXISTS idx_role_invites_is_active ON role_invites(is_active);

CREATE TABLE IF NOT EXISTS role_audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  performed_by VARCHAR NOT NULL,
  target_user_id VARCHAR,
  role_id INTEGER,
  previous_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON role_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON role_audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON role_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_role_id ON role_audit_logs(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON role_audit_logs(created_at DESC);
