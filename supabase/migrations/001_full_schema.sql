-- ============================================================================
-- RHONDA — Complete Database Schema
-- One migration to rule them all. Covers every feature.
-- Multi-tenant from day one (organization_id on every table).
-- ============================================================================

-- ── CORE ENTITIES ──────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,             -- 'sunshine-mills', 'senators-coaches'
  name TEXT NOT NULL,                     -- 'Sunshine Mills'
  industry TEXT,                          -- 'pet-food-manufacturing'
  config JSONB DEFAULT '{}'::jsonb,       -- accent color, languages, tile overrides
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  role TEXT,                              -- 'Senior Operator', 'QA Lead'
  department TEXT,                        -- 'Production', 'Quality', 'Maintenance'
  hire_date DATE,
  language TEXT DEFAULT 'en',             -- preferred language code
  avatar_initials TEXT,                   -- 'JR', 'MC'
  avatar_color TEXT,                      -- hex color for avatar ring
  years_experience INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workers_org ON workers(org_id);
CREATE INDEX idx_workers_dept ON workers(org_id, department);

-- ── ASSETS / EQUIPMENT ────────────────────────────────────────────────────

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,                     -- 'Kibble Extruder #1'
  asset_type TEXT,                        -- 'Equipment', 'Area', 'Vehicle'
  model TEXT,                             -- 'Wenger X-200'
  location TEXT,                          -- 'Production Floor — Line A'
  department TEXT,
  qr_code TEXT,                           -- QR code identifier
  installed_date DATE,
  health_score INTEGER DEFAULT 100,       -- 0-100
  health_trend TEXT DEFAULT 'stable',     -- 'stable', 'declining', 'critical'
  hours_runtime INTEGER DEFAULT 0,
  last_service_date DATE,
  next_service_date DATE,
  known_issues TEXT[],                    -- veteran tips, known quirks
  related_sops TEXT[],                    -- SOP names linked to this asset
  metadata JSONB DEFAULT '{}'::jsonb,     -- sensor data, specs, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assets_org ON assets(org_id);
CREATE INDEX idx_assets_qr ON assets(qr_code);

-- ── KNOWLEDGE CAPTURE ─────────────────────────────────────────────────────

CREATE TABLE teaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  worker_id UUID REFERENCES workers(id),
  transcript TEXT,                        -- voice transcript
  department TEXT,
  language TEXT DEFAULT 'en',
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending',          -- 'pending', 'processed', 'archived'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_teaching_org ON teaching_sessions(org_id);

CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  department TEXT,
  content TEXT NOT NULL,                  -- markdown SOP content
  version INTEGER DEFAULT 1,
  source_type TEXT DEFAULT 'manual',      -- 'manual', 'voice', 'bounty', 'ai-generated'
  source_session_id UUID REFERENCES teaching_sessions(id),
  source_bounty_id UUID,                 -- filled in after bounties table exists
  author_id UUID REFERENCES workers(id),
  language TEXT DEFAULT 'en',
  translations JSONB DEFAULT '{}'::jsonb, -- {"es": "...", "vi": "..."}
  usage_count INTEGER DEFAULT 0,          -- how many times referenced/viewed
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sops_org ON sops(org_id);
CREATE INDEX idx_sops_dept ON sops(org_id, department);

CREATE TABLE veteran_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  veteran_id UUID NOT NULL REFERENCES workers(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_veteran_org ON veteran_knowledge(org_id);

-- ── BOUNTY SYSTEM ─────────────────────────────────────────────────────────

CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,                    -- 'Document Extruder Startup Procedure'
  description TEXT,
  department TEXT,
  amount_cents INTEGER NOT NULL,          -- $50 = 5000
  complexity TEXT DEFAULT 'standard',     -- 'simple', 'standard', 'complex'
  acceptance_criteria TEXT,
  suggested_by TEXT DEFAULT 'manager',    -- 'manager', 'ai-gap-engine'
  related_gap_id UUID,
  posted_by UUID REFERENCES workers(id),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open',             -- 'open', 'claimed', 'submitted', 'approved', 'paid', 'expired'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bounties_org ON bounties(org_id);
CREATE INDEX idx_bounties_status ON bounties(org_id, status);

CREATE TABLE bounty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID NOT NULL REFERENCES bounties(id),
  worker_id UUID NOT NULL REFERENCES workers(id),
  claimed_at TIMESTAMPTZ DEFAULT now(),
  deadline TIMESTAMPTZ,                   -- 48hr window
  status TEXT DEFAULT 'active',           -- 'active', 'submitted', 'expired', 'withdrawn'
  submission_session_id UUID REFERENCES teaching_sessions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_claims_bounty ON bounty_claims(bounty_id);
CREATE INDEX idx_claims_worker ON bounty_claims(worker_id);

CREATE TABLE bounty_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES bounty_claims(id),
  review_type TEXT NOT NULL,              -- 'ai_prescreen', 'peer_review', 'supervisor_approval'
  reviewer_id UUID REFERENCES workers(id), -- null for AI
  score INTEGER,                          -- 0-100
  feedback TEXT,
  passed BOOLEAN,
  review_amount_cents INTEGER DEFAULT 0,  -- peer reviewer pay
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_claim ON bounty_reviews(claim_id);

CREATE TABLE bounty_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES bounty_claims(id),
  worker_id UUID NOT NULL REFERENCES workers(id),
  amount_cents INTEGER NOT NULL,
  payout_type TEXT DEFAULT 'bounty',      -- 'bounty', 'peer_review', 'usage_bonus'
  status TEXT DEFAULT 'pending',          -- 'pending', 'approved', 'paid'
  payroll_batch TEXT,                     -- payroll export batch ID
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payouts_worker ON bounty_payouts(worker_id);

CREATE TABLE knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  topic TEXT NOT NULL,
  reason TEXT,                            -- 'incident frequency', 'training time', 'single-expert risk'
  suggested_amount_cents INTEGER,
  priority TEXT DEFAULT 'medium',         -- 'low', 'medium', 'high', 'critical'
  has_bounty BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gaps_org ON knowledge_gaps(org_id);

-- ── SAFETY & COMPLIANCE ──────────────────────────────────────────────────

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  reporter_id UUID REFERENCES workers(id),
  zone TEXT,                              -- 'lineA', 'warehouse', 'chemical'
  zone_name TEXT,                         -- 'Production Line A'
  incident_type TEXT,                     -- 'slip', 'equipment', 'chemical', etc.
  severity TEXT DEFAULT 'Low',            -- 'Low', 'Medium', 'High', 'Critical'
  description TEXT NOT NULL,
  image_url TEXT,
  structured_report JSONB,               -- AI-generated structured report
  status TEXT DEFAULT 'open',             -- 'open', 'investigating', 'resolved'
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_incidents_org ON incidents(org_id);
CREATE INDEX idx_incidents_zone ON incidents(org_id, zone);
CREATE INDEX idx_incidents_date ON incidents(org_id, created_at);

CREATE TABLE compliance_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  scanner_id UUID REFERENCES workers(id),
  area_type TEXT,                         -- 'Production Floor', 'Chemical Storage', etc.
  image_url TEXT,
  overall_rating TEXT,                    -- 'CRITICAL', 'WARNING', 'PASS'
  findings JSONB,                         -- array of findings from AI
  compliant_items TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scans_org ON compliance_scans(org_id);

CREATE TABLE compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  alert_type TEXT NOT NULL,               -- 'expired_cert', 'overdue_inspection', etc.
  severity TEXT DEFAULT 'warning',
  title TEXT NOT NULL,
  description TEXT,
  related_entity_type TEXT,               -- 'worker', 'asset', 'inspection'
  related_entity_id UUID,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alerts_org ON compliance_alerts(org_id);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  worker_id UUID NOT NULL REFERENCES workers(id),
  cert_type TEXT NOT NULL,                -- 'Forklift Operator', 'PCQI', 'HAZMAT'
  issued_date DATE,
  expires_date DATE,
  status TEXT DEFAULT 'active',           -- 'active', 'expiring_soon', 'expired'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certs_org ON certifications(org_id);
CREATE INDEX idx_certs_worker ON certifications(worker_id);
CREATE INDEX idx_certs_expires ON certifications(expires_date);

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  area TEXT NOT NULL,
  inspection_type TEXT NOT NULL,
  last_inspection DATE,
  next_due DATE,
  status TEXT DEFAULT 'upcoming',         -- 'upcoming', 'overdue', 'completed'
  inspector_id UUID REFERENCES workers(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inspections_org ON inspections(org_id);
CREATE INDEX idx_inspections_due ON inspections(next_due);

CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  worker_id UUID NOT NULL REFERENCES workers(id),
  course TEXT NOT NULL,
  assigned_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'incomplete',       -- 'incomplete', 'complete'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_training_org ON training_records(org_id);
CREATE INDEX idx_training_worker ON training_records(worker_id);

CREATE TABLE audit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  generated_by UUID REFERENCES workers(id),
  sections JSONB NOT NULL,                -- snapshot of all audit sections + status
  total_pages INTEGER,
  completeness_pct INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audits_org ON audit_packages(org_id);

-- ── SAFETY STREAKS ────────────────────────────────────────────────────────

CREATE TABLE safety_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  entity_type TEXT NOT NULL,              -- 'worker', 'zone'
  entity_id TEXT NOT NULL,                -- worker UUID or zone slug
  entity_name TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  personal_best INTEGER DEFAULT 0,
  last_incident_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_streaks_org ON safety_streaks(org_id);
CREATE UNIQUE INDEX idx_streaks_entity ON safety_streaks(org_id, entity_type, entity_id);

-- ── OPERATIONS ────────────────────────────────────────────────────────────

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  shift_name TEXT NOT NULL,               -- 'Day Shift', 'Night Shift'
  supervisor_id UUID REFERENCES workers(id),
  crew_count INTEGER,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active',           -- 'active', 'completed'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shifts_org ON shifts(org_id);

CREATE TABLE shift_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  summary TEXT,                           -- AI-generated summary
  sections JSONB,                         -- structured handoff sections
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_handoffs_org ON shift_handoffs(org_id);

CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  log_type TEXT NOT NULL,                 -- 'Preventive', 'Repair', 'Emergency'
  description TEXT NOT NULL,
  technician_id UUID REFERENCES workers(id),
  technician_name TEXT,                   -- for external techs
  parts_used TEXT[],
  downtime_hours NUMERIC(5,1),
  cost_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_maint_org ON maintenance_logs(org_id);
CREATE INDEX idx_maint_asset ON maintenance_logs(asset_id);

CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sender_id UUID REFERENCES workers(id),
  source_text TEXT NOT NULL,              -- original English text
  translations JSONB DEFAULT '{}'::jsonb, -- {"es": "...", "vi": "..."}
  broadcast_type TEXT DEFAULT 'announcement', -- 'announcement', 'safety_alert', 'shift_update'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_broadcasts_org ON broadcasts(org_id);

-- ── ANALYTICS & ENGAGEMENT ───────────────────────────────────────────────

CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  worker_id UUID REFERENCES workers(id),
  event_type TEXT NOT NULL,               -- 'sop_created', 'incident_reported', 'scan_completed', etc.
  feature TEXT NOT NULL,                  -- 'sop-generator', 'incident-report', 'compliance-scan', etc.
  metadata JSONB DEFAULT '{}'::jsonb,     -- event-specific data
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_org ON usage_events(org_id);
CREATE INDEX idx_usage_worker ON usage_events(org_id, worker_id);
CREATE INDEX idx_usage_date ON usage_events(org_id, created_at);
CREATE INDEX idx_usage_type ON usage_events(org_id, event_type);

CREATE TABLE roi_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  worker_id UUID REFERENCES workers(id),
  category TEXT NOT NULL,                 -- 'sop', 'incident', 'compliance', 'onboard', 'translate', 'teach'
  label TEXT NOT NULL,                    -- 'SOP Created: Extruder Startup'
  savings_cents INTEGER NOT NULL,         -- dollar value in cents
  unit TEXT,                              -- 'training cost avoided', 'OSHA fine prevented'
  source_feature TEXT,                    -- which feature generated this
  source_entity_id UUID,                 -- ID of the SOP/incident/scan that generated value
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_roi_org ON roi_events(org_id);
CREATE INDEX idx_roi_date ON roi_events(org_id, created_at);
CREATE INDEX idx_roi_category ON roi_events(org_id, category);

CREATE TABLE scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  worker_id UUID NOT NULL REFERENCES workers(id),
  week_start DATE NOT NULL,
  sops_created INTEGER DEFAULT 0,
  incidents_reported INTEGER DEFAULT 0,
  compliance_scans INTEGER DEFAULT 0,
  bounties_claimed INTEGER DEFAULT 0,
  bounties_completed INTEGER DEFAULT 0,
  shifts_completed INTEGER DEFAULT 0,
  roi_cents INTEGER DEFAULT 0,
  badges TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scorecards_org ON scorecards(org_id);
CREATE UNIQUE INDEX idx_scorecards_worker_week ON scorecards(worker_id, week_start);

-- ── DEFECT INSPECTIONS ───────────────────────────────────────────────────

CREATE TABLE defect_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  inspector_id UUID REFERENCES workers(id),
  product_type TEXT,
  image_url TEXT,
  verdict TEXT,                           -- 'PASS', 'MARGINAL', 'REJECT'
  confidence TEXT,
  findings JSONB,                         -- defects array from AI
  quality_metrics JSONB,
  batch_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_defects_org ON defect_inspections(org_id);

-- ── EQUIPMENT DIAGNOSTICS ────────────────────────────────────────────────

CREATE TABLE equipment_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  reporter_id UUID REFERENCES workers(id),
  symptom_text TEXT,
  image_url TEXT,
  diagnosis JSONB NOT NULL,               -- full AI diagnosis result
  severity TEXT,
  urgency TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diagnoses_org ON equipment_diagnoses(org_id);
CREATE INDEX idx_diagnoses_asset ON equipment_diagnoses(asset_id);

-- ── UPDATED_AT TRIGGER ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bounties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY (enable, policies added when auth is wired) ──────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE veteran_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE defect_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_diagnoses ENABLE ROW LEVEL SECURITY;

-- Temporary: allow service role full access (demo mode, pre-auth)
-- These policies will be tightened when Clerk auth is wired
CREATE POLICY "service_role_all" ON organizations FOR ALL USING (true);
CREATE POLICY "service_role_all" ON workers FOR ALL USING (true);
CREATE POLICY "service_role_all" ON assets FOR ALL USING (true);
CREATE POLICY "service_role_all" ON teaching_sessions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON sops FOR ALL USING (true);
CREATE POLICY "service_role_all" ON veteran_knowledge FOR ALL USING (true);
CREATE POLICY "service_role_all" ON bounties FOR ALL USING (true);
CREATE POLICY "service_role_all" ON bounty_claims FOR ALL USING (true);
CREATE POLICY "service_role_all" ON bounty_reviews FOR ALL USING (true);
CREATE POLICY "service_role_all" ON bounty_payouts FOR ALL USING (true);
CREATE POLICY "service_role_all" ON knowledge_gaps FOR ALL USING (true);
CREATE POLICY "service_role_all" ON incidents FOR ALL USING (true);
CREATE POLICY "service_role_all" ON compliance_scans FOR ALL USING (true);
CREATE POLICY "service_role_all" ON compliance_alerts FOR ALL USING (true);
CREATE POLICY "service_role_all" ON certifications FOR ALL USING (true);
CREATE POLICY "service_role_all" ON inspections FOR ALL USING (true);
CREATE POLICY "service_role_all" ON training_records FOR ALL USING (true);
CREATE POLICY "service_role_all" ON audit_packages FOR ALL USING (true);
CREATE POLICY "service_role_all" ON safety_streaks FOR ALL USING (true);
CREATE POLICY "service_role_all" ON shifts FOR ALL USING (true);
CREATE POLICY "service_role_all" ON shift_handoffs FOR ALL USING (true);
CREATE POLICY "service_role_all" ON maintenance_logs FOR ALL USING (true);
CREATE POLICY "service_role_all" ON broadcasts FOR ALL USING (true);
CREATE POLICY "service_role_all" ON usage_events FOR ALL USING (true);
CREATE POLICY "service_role_all" ON roi_events FOR ALL USING (true);
CREATE POLICY "service_role_all" ON scorecards FOR ALL USING (true);
CREATE POLICY "service_role_all" ON defect_inspections FOR ALL USING (true);
CREATE POLICY "service_role_all" ON equipment_diagnoses FOR ALL USING (true);
