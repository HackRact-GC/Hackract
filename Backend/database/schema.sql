
-- Hackract Database Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Mock auth schema for local development (simulating Supabase)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
    -- Returns a nil UUID by default.
    -- In a real application, this would return the authenticated user's ID.
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql;

-- Enums & Types
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE pentest_status AS ENUM ('planning', 'scheduled', 'in_progress', 'paused', 'reporting', 'closed');
CREATE TYPE finding_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE finding_status AS ENUM ('open', 'verified', 'fixed', 'reopened', 'false_positive', 'accepted_risk');
CREATE TYPE node_type AS ENUM ('root', 'host', 'service', 'vulnerability', 'note', 'evidence');
CREATE TYPE agreement_type AS ENUM ('terms_of_service', 'nda', 'rules_of_engagement');

-- Identity & Access Management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    handle CITEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    status user_status DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 0,
    totp_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug CITEXT UNIQUE NOT NULL,
    domain TEXT,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Legal & Compliance
CREATE TABLE legal_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL,
    type agreement_type NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agreement_id UUID REFERENCES legal_agreements(id) ON DELETE RESTRICT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    context_id UUID
);

-- Pentest Operations
CREATE TABLE pentests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status pentest_status DEFAULT 'planning',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    lead_pentester_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pentest_collaborators (
    pentest_id UUID REFERENCES pentests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'collaborator',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (pentest_id, user_id)
);

CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pentest_id UUID REFERENCES pentests(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES workflow_nodes(id) ON DELETE SET NULL,
    type node_type NOT NULL,
    title TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

CREATE TABLE workflow_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pentest_id UUID REFERENCES pentests(id) ON DELETE CASCADE,
    source_node_id UUID REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_node_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT,
    data JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT
);

-- Vulnerability Management
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pentest_id UUID REFERENCES pentests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity finding_severity DEFAULT 'low',
    status finding_status DEFAULT 'open',
    cvss_score NUMERIC(3,1),
    affected_asset TEXT,
    remediation TEXT,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finding_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finding_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES finding_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI & Automation
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    capabilities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tool_executions (
    id UUID DEFAULT uuid_generate_v4(),
    pentest_id UUID REFERENCES pentests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES ai_agents(id),
    tool_name TEXT NOT NULL,
    command TEXT NOT NULL,
    output TEXT,
    status TEXT DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (id, started_at)
) PARTITION BY RANGE (started_at);

CREATE TABLE tool_executions_y2025m11 PARTITION OF tool_executions
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE tool_executions_y2025m12 PARTITION OF tool_executions
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Audit & Logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID,
    user_id UUID,
    action TEXT NOT NULL,
    target_resource TEXT,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workflow_nodes_data ON workflow_nodes USING GIN (data);
CREATE INDEX idx_audit_logs_details ON audit_logs USING GIN (details);
CREATE INDEX idx_findings_title_trgm ON findings (title);
CREATE INDEX idx_nodes_pentest ON workflow_nodes(pentest_id);
CREATE INDEX idx_findings_pentest ON findings(pentest_id);
CREATE INDEX idx_tool_exec_pentest ON tool_executions(pentest_id);

-- Security (RLS)
-- Ensure auth schema exists (in case script is run partially)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE pentests ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY pentest_access_policy ON pentests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = pentests.organization_id
            AND om.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM pentest_collaborators pc
            WHERE pc.pentest_id = pentests.id
            AND pc.user_id = auth.uid()
        )
    );

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orgs_modtime BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pentests_modtime BEFORE UPDATE ON pentests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_nodes_modtime BEFORE UPDATE ON workflow_nodes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION version_workflow_node()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO workflow_node_versions (node_id, version, title, data, changed_by, changed_at, change_reason)
        VALUES (OLD.id, OLD.version, OLD.title, OLD.data, NEW.created_by, NOW(), 'update');
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER version_nodes_trigger BEFORE UPDATE ON workflow_nodes FOR EACH ROW EXECUTE PROCEDURE version_workflow_node();
