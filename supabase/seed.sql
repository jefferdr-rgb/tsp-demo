-- ============================================================================
-- RHONDA — Sunshine Mills Seed Data (placeholder UUIDs, not secrets)
-- Run after migration to populate demo data for the April 2 presentation.
-- All UUIDs below are zeroed-out placeholder/example values for demo seeding.
-- ============================================================================

-- ── Organization ──────────────────────────────────────────────────────────

INSERT INTO organizations (id, slug, name, industry, config) VALUES
  ('00000000-0000-0000-0000-000000000001', 'sunshine-mills', 'Sunshine Mills', 'pet-food-manufacturing',
   '{"accent": "#C8872A", "chrome": "#3A2A1A", "languages": ["en", "es", "vi"]}'::jsonb);

-- ── Workers ───────────────────────────────────────────────────────────────

INSERT INTO workers (id, org_id, name, role, department, hire_date, language, avatar_initials, avatar_color, years_experience) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Jim Rivera', 'Senior Operator', 'Production', '2004-03-15', 'en', 'JR', '#8E6B3E', 22),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Mary Chen', 'QA Lead', 'Quality', '2008-06-01', 'en', 'MC', '#4a6540', 18),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Carlos Vega', 'Maintenance Lead', 'Maintenance', '2011-09-20', 'es', 'CV', '#6495ED', 15),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Diane Atkins', 'Safety Coordinator', 'Safety', '2006-01-10', 'en', 'DA', '#8E44AD', 20),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Maria Santos', 'Packaging Operator', 'Packaging', '2026-03-15', 'es', 'MS', '#E67E22', 0),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'Mike Torres', 'Shift Supervisor', 'Production', '2015-04-01', 'en', 'MT', '#2c3528', 11),
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', 'Angela Park', 'Night Shift Supervisor', 'Production', '2017-08-15', 'en', 'AP', '#c49b2a', 9),
  ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000001', 'Nguyen Thi Lan', 'Quality Inspector', 'Quality', '2024-01-08', 'vi', 'NL', '#27AE60', 2),
  ('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000001', 'James Wilson', 'Warehouse Supervisor', 'Warehouse', '2021-11-15', 'en', 'JW', '#3498DB', 5),
  ('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000001', 'Roberto Mendez', 'Forklift Operator', 'Warehouse', '2022-05-01', 'es', 'RM', '#E74C3C', 4),
  ('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000001', 'Sarah Mitchell', 'HR Coordinator', 'Admin', '2019-02-01', 'en', 'SM', '#F39C12', 7),
  ('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000001', 'David Kim', 'Line Operator', 'Production', '2023-07-15', 'en', 'DK', '#1ABC9C', 3);

-- ── Assets / Equipment ────────────────────────────────────────────────────

INSERT INTO assets (id, org_id, name, asset_type, model, location, department, qr_code, installed_date, health_score, health_trend, hours_runtime, last_service_date, next_service_date, known_issues, related_sops) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'Kibble Extruder #1', 'Equipment', 'Wenger X-200', 'Production Floor — Line A', 'Production', 'EQ-EXT-001', '2019-06-15', 87, 'stable', 4200, '2026-02-28', '2026-04-12', ARRAY['Die wear increases after 3 months — adjust pressure to 44-46 PSI', 'Moisture below 12% causes auger jams in winter'], ARRAY['Extruder Startup Procedure', 'Extruder Emergency Shutdown', 'Die Changeover']),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'Packaging Sealer #3', 'Equipment', 'Bosch SVE-2600', 'Packaging', 'Packaging', 'EQ-SEL-003', '2021-03-10', 64, 'declining', 3100, '2026-03-10', '2026-03-22', ARRAY['Heating element degradation — monitor temp', 'Film tension roller: most rejects are tension not sealer'], ARRAY['Sealer Startup', 'Film Roll Change', 'Seal Quality Check']),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'Conveyor Belt #7', 'Equipment', 'Hytrol EZLogic', 'Production Floor — Line B', 'Production', 'EQ-CNV-007', '2018-09-01', 43, 'critical', 6800, '2026-01-20', '2026-03-15', ARRAY['Belt alignment 2.3 deg off — worsening daily', 'Motor overheating due to misalignment', 'Grease bearings every 500 hours not 1000'], ARRAY['Conveyor Belt Inspection', 'Belt Tension Adjustment']),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'Mixer/Blender #2', 'Equipment', 'Marion MX-400', 'Batch Prep', 'Production', 'EQ-MIX-002', '2020-01-15', 91, 'stable', 2800, '2026-01-15', '2026-05-01', ARRAY[]::text[], ARRAY['Mixer Operation', 'Allergen Changeover']),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001', 'Forklift FL-04', 'Vehicle', 'Toyota 8FGU25', 'Warehouse', 'Warehouse', 'VH-FLT-004', '2020-06-01', 72, 'declining', 6100, '2026-02-15', '2026-03-25', ARRAY['Battery capacity declining faster than expected'], ARRAY['Forklift Daily Inspection', 'Battery Charging Procedure']),
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000001', 'Palletizer #1', 'Equipment', 'Fanuc M-410iC', 'Packaging', 'Packaging', 'EQ-PAL-001', '2022-08-01', 95, 'stable', 1800, '2026-03-01', '2026-06-01', ARRAY[]::text[], ARRAY['Palletizer Operation', 'Jam Clearing']);

-- ── Bounties ──────────────────────────────────────────────────────────────

INSERT INTO bounties (id, org_id, title, description, department, amount_cents, complexity, acceptance_criteria, posted_by, expires_at, status) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'Document Allergen Changeover Procedure', 'We need a complete SOP for switching production lines between allergen-containing and allergen-free recipes.', 'Production', 7500, 'complex', 'Must include cleaning verification steps, testing protocol, and documentation requirements', '00000000-0000-0000-0001-000000000006', '2026-03-31 23:59:59+00', 'open'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'Forklift Pre-Shift Inspection Checklist', 'Standard daily inspection procedure for all forklifts.', 'Warehouse', 2500, 'simple', 'Cover all OSHA-required checkpoints. Include photo examples of pass/fail conditions.', '00000000-0000-0000-0001-000000000009', '2026-03-28 23:59:59+00', 'claimed'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'Packaging Line Startup Sequence', 'Step-by-step startup for the packaging line including sealer warmup and film loading.', 'Packaging', 5000, 'standard', 'Must cover sealer temperature verification and film tension check', '00000000-0000-0000-0001-000000000006', '2026-04-05 23:59:59+00', 'open'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'Chemical Spill Response', 'Emergency procedure for chemical spills in production and storage areas.', 'Safety', 10000, 'complex', 'Must reference specific chemicals used on-site. Include PPE requirements and notification chain.', '00000000-0000-0000-0001-000000000004', '2026-04-10 23:59:59+00', 'open'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'Kibble Quality Visual Inspection Guide', 'How to visually inspect kibble for defects — color, size, smell, texture.', 'Quality', 5000, 'standard', 'Include photo examples of good vs defective product. Cover all product lines.', '00000000-0000-0000-0001-000000000002', '2026-03-30 23:59:59+00', 'submitted'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000001', 'Extruder Die Changeover', 'Procedure for swapping dies on the kibble extruder including pressure calibration.', 'Production', 7500, 'complex', 'Must include die pressure settings for new vs worn dies (Jim Rivera knowledge).', '00000000-0000-0000-0001-000000000006', '2026-03-25 23:59:59+00', 'approved'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000001', 'New Employee Safety Orientation Walkthrough', 'Guided walkthrough of all safety stations, exits, and emergency equipment.', 'Safety', 5000, 'standard', 'Must cover all 3 buildings. Include photos of each safety station.', '00000000-0000-0000-0001-000000000004', '2026-04-15 23:59:59+00', 'open'),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0000-000000000001', 'Batch Record Documentation', 'How to properly fill out batch production records for FDA compliance.', 'Quality', 5000, 'standard', 'Must reference current batch record form. Include common mistakes to avoid.', '00000000-0000-0000-0001-000000000002', '2026-04-05 23:59:59+00', 'open');

-- ── Bounty Claims ─────────────────────────────────────────────────────────

INSERT INTO bounty_claims (id, bounty_id, worker_id, deadline, status) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000010', now() + interval '48 hours', 'active'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0001-000000000002', now() - interval '24 hours', 'submitted'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000001', now() - interval '72 hours', 'submitted');

-- ── Bounty Reviews ────────────────────────────────────────────────────────

INSERT INTO bounty_reviews (claim_id, review_type, score, feedback, passed) VALUES
  ('00000000-0000-0000-0004-000000000002', 'ai_prescreen', 82, 'Good coverage of visual indicators. Could add more detail on smell-based detection.', true),
  ('00000000-0000-0000-0004-000000000003', 'ai_prescreen', 91, 'Excellent detail on pressure calibration. Includes veteran knowledge about die wear.', true),
  ('00000000-0000-0000-0004-000000000003', 'peer_review', 88, 'Accurate and thorough. Confirmed die pressure tip is correct. — Carlos Vega', true),
  ('00000000-0000-0000-0004-000000000003', 'supervisor_approval', 95, 'Approved. This captures exactly what we needed. Adding to official SOP library.', true);

-- ── Bounty Payouts ────────────────────────────────────────────────────────

INSERT INTO bounty_payouts (claim_id, worker_id, amount_cents, payout_type, status) VALUES
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000001', 7500, 'bounty', 'paid'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0001-000000000003', 1000, 'peer_review', 'paid');

-- ── Safety Streaks ────────────────────────────────────────────────────────

INSERT INTO safety_streaks (org_id, entity_type, entity_id, entity_name, current_streak, personal_best) VALUES
  ('00000000-0000-0000-0000-000000000001', 'worker', '00000000-0000-0000-0001-000000000001', 'Jim Rivera', 142, 142),
  ('00000000-0000-0000-0000-000000000001', 'worker', '00000000-0000-0000-0001-000000000002', 'Mary Chen', 89, 120),
  ('00000000-0000-0000-0000-000000000001', 'worker', '00000000-0000-0000-0001-000000000003', 'Carlos Vega', 67, 95),
  ('00000000-0000-0000-0000-000000000001', 'worker', '00000000-0000-0000-0001-000000000004', 'Diane Atkins', 210, 210),
  ('00000000-0000-0000-0000-000000000001', 'worker', '00000000-0000-0000-0001-000000000005', 'Maria Santos', 3, 3),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'qclab', 'QC Lab', 320, 320),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'breakroom', 'Break Room', 245, 245),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'lineA', 'Production Line A', 142, 142),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'maintenance', 'Maintenance Shop', 67, 67),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'packaging', 'Packaging', 31, 31),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'warehouse', 'Warehouse', 4, 18),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'loading', 'Loading Dock', 18, 42),
  ('00000000-0000-0000-0000-000000000001', 'zone', 'chemical', 'Chemical Storage', 52, 52);

-- ── Veteran Knowledge ─────────────────────────────────────────────────────

INSERT INTO veteran_knowledge (org_id, veteran_id, question, answer, tags, upvotes, is_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Why does the extruder jam during winter?', 'The moisture content in the raw mix drops below 12% when the warehouse is cold. The auger can''t push dry mix through. I always check the moisture meter first thing in the morning November through February. If it''s under 12%, I add 2-3% water to the mix before we start.', ARRAY['extruder', 'winter', 'moisture', 'troubleshooting'], 23, true),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'How do you spot bad kibble before the lab catches it?', 'Color tells you everything. Good kibble is uniform brown — no dark spots, no pale patches. If you see a greenish tint, that''s a fat oxidation problem and the batch is going bad. Also smell it. Fresh kibble smells slightly nutty. If it smells sour or like old oil, pull it.', ARRAY['quality', 'kibble', 'visual-inspection', 'smell-test'], 31, true),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'What''s the trick to the packaging sealer when it starts rejecting?', '90% of the time it''s not the sealer — it''s the film tension. Everyone calls maintenance but all you need to do is check the tension roller on the left side. There''s a small Allen bolt. Quarter turn clockwise usually fixes it.', ARRAY['packaging', 'sealer', 'film-tension', 'quick-fix'], 45, true),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'What''s the most commonly missed safety check?', 'The chemical storage secondary containment. People check the labels, check the SDS sheets, but nobody looks at the drip pans under the containers. If a drip pan is full of residue, that means something leaked and nobody noticed.', ARRAY['safety', 'chemical-storage', 'OSHA', 'inspection'], 18, true),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'How do you get the extruder to make consistent kibble size?', 'Die pressure is the secret. The manual says 38-42 PSI but that''s for new dies. After about 3 months the dies wear and you need to bump it to 44-46 PSI to get the same size. Also, the first 15 minutes of each run always makes oversized kibble because the die is cold.', ARRAY['extruder', 'die-pressure', 'kibble-size', 'efficiency'], 27, true),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'What maintenance task saves the most money?', 'Greasing the conveyor bearings every 500 hours instead of every 1,000 like the manual says. We went through 6 bearing failures in one year before I figured this out. Each failure was $3,000 in parts and 2 hours of downtime during production.', ARRAY['conveyor', 'bearings', 'preventive-maintenance', 'cost-savings'], 38, true);

-- ── ROI Events (last 7 days) ─────────────────────────────────────────────

INSERT INTO roi_events (org_id, worker_id, category, label, savings_cents, unit, source_feature) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'sop', 'SOP Created: Extruder Startup', 120000, 'training cost avoided', 'sop-generator'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'incident', 'Near-Miss Caught: Wet Floor B-Wing', 850000, 'avg injury claim avoided', 'incident-report'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'compliance', 'Compliance Scan: Chemical Storage', 420000, 'OSHA fine prevented', 'compliance-scan'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000011', 'onboard', 'New Hire Onboarded: Maria Santos', 95000, 'HR processing saved', 'onboard'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'sop', 'SOP Created: Packaging Line QC', 120000, 'training cost avoided', 'sop-generator'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006', 'translate', 'Safety Alert Broadcast: 3 Languages', 35000, 'interpreter cost avoided', 'voice-broadcast'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'incident', 'Hazard Reported: Loose Guard Rail', 1200000, 'potential OSHA citation', 'incident-report'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'compliance', 'Audit Package Generated: FDA Ready', 650000, 'consultant fee avoided', 'audit-package'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'sop', 'SOP Created: Forklift Inspection', 120000, 'training cost avoided', 'sop-generator'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'teach', 'Tribal Knowledge Captured: Jim Rivera', 1500000, 'institutional knowledge preserved', 'ask-veteran'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'incident', 'Equipment Issue Flagged: Conveyor #3', 320000, 'unplanned downtime avoided', 'equipment-whisperer'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006', 'translate', 'Onboarding Docs: Vietnamese', 35000, 'translation service avoided', 'voice-broadcast'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'compliance', 'Expired Cert Caught: Fire Extinguisher', 280000, 'citation avoided', 'compliance-scan'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'sop', 'SOP Created: Allergen Changeover', 120000, 'training cost avoided', 'sop-generator'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'incident', 'Batch Hold Triggered: Aflatoxin Check', 4500000, 'recall cost avoided', 'aflatoxin-response');

-- ── Knowledge Gaps (AI-suggested bounty topics) ──────────────────────────

INSERT INTO knowledge_gaps (org_id, topic, reason, suggested_amount_cents, priority, has_bounty) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Allergen Changeover Procedure', 'High incident frequency — 3 near-misses in 90 days', 7500, 'high', true),
  ('00000000-0000-0000-0000-000000000001', 'Night Shift Emergency Procedures', 'Single-expert risk — only Angela Park knows the full procedure', 10000, 'critical', false),
  ('00000000-0000-0000-0000-000000000001', 'Ingredient Receiving Inspection', 'Training time is 3x industry average for new QC staff', 5000, 'high', false),
  ('00000000-0000-0000-0000-000000000001', 'Waste Manifest Documentation', 'Environmental compliance gap — last audit flagged this', 5000, 'medium', false),
  ('00000000-0000-0000-0000-000000000001', 'Conveyor Belt Replacement', 'Only Carlos knows the full procedure — single-expert risk', 7500, 'critical', false);

-- ── Incidents (90 days of safety data for heat map) ─────────────────────

INSERT INTO incidents (org_id, reporter_id, zone, zone_name, incident_type, severity, description, status, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'lineA', 'Production Line A', 'slip', 'Medium', 'Worker slipped on spilled oil near extruder', 'resolved', '2026-03-15 09:15:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'lineA', 'Production Line A', 'equipment', 'High', 'Guard rail loose on conveyor — near miss', 'resolved', '2026-03-12 14:30:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000005', 'lineA', 'Production Line A', 'ergonomic', 'Low', 'Repetitive strain complaint — bag lifting', 'open', '2026-03-08 11:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'lineA', 'Production Line A', 'slip', 'Medium', 'Wet floor near wash station', 'resolved', '2026-02-28 08:45:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006', 'lineA', 'Production Line A', 'equipment', 'Critical', 'Extruder pressure spike — emergency shutdown', 'resolved', '2026-02-15 10:20:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000008', 'lineB', 'Production Line B', 'chemical', 'High', 'Sanitizer splash — inadequate PPE', 'open', '2026-03-14 13:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'lineB', 'Production Line B', 'slip', 'Low', 'Minor spill near ingredient hopper', 'resolved', '2026-03-01 07:30:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000005', 'packaging', 'Packaging', 'ergonomic', 'Medium', 'Back strain from repetitive box lifting', 'open', '2026-03-10 15:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'packaging', 'Packaging', 'equipment', 'High', 'Sealer malfunction — hot surface contact near-miss', 'resolved', '2026-02-20 09:45:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000010', 'warehouse', 'Warehouse', 'vehicle', 'Critical', 'Forklift near-miss with pedestrian at blind corner', 'open', '2026-03-13 11:30:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000009', 'warehouse', 'Warehouse', 'fall', 'High', 'Stack of pallets shifted — worker jumped clear', 'resolved', '2026-02-25 16:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'chemical', 'Chemical Storage', 'chemical', 'Critical', 'Incompatible chemicals stored adjacent — caught during scan', 'resolved', '2026-03-11 10:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'chemical', 'Chemical Storage', 'chemical', 'High', 'Missing SDS sheet for new cleaning agent', 'resolved', '2026-02-18 14:15:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000010', 'loading', 'Loading Dock', 'vehicle', 'Medium', 'Truck backed in without spotter', 'resolved', '2026-03-09 06:30:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000009', 'loading', 'Loading Dock', 'fall', 'Low', 'Trip hazard — loose dock plate', 'resolved', '2026-03-02 12:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'batchprep', 'Batch Prep', 'chemical', 'Medium', 'Ingredient dust exposure — mask not worn', 'resolved', '2026-03-07 08:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'maintenance', 'Maintenance Shop', 'equipment', 'High', 'Lockout/tagout procedure skipped — caught by supervisor', 'resolved', '2026-03-05 09:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'lineA', 'Production Line A', 'slip', 'Medium', 'Water leak from cooling system', 'resolved', '2026-01-20 07:00:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006', 'lineA', 'Production Line A', 'equipment', 'Low', 'Missing safety label on electrical panel', 'resolved', '2026-01-10 10:30:00+00'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000009', 'warehouse', 'Warehouse', 'ergonomic', 'Medium', 'Heavy lift without assistance — policy reminder issued', 'resolved', '2026-01-15 14:00:00+00');

-- ── Shifts & Handoffs ───────────────────────────────────────────────────

INSERT INTO shifts (id, org_id, shift_name, supervisor_id, crew_count, start_time, end_time, status) VALUES
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0000-000000000001', 'Day Shift', '00000000-0000-0000-0001-000000000006', 12, '2026-03-17 06:00:00+00', '2026-03-17 14:00:00+00', 'completed'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0000-000000000001', 'Night Shift', '00000000-0000-0000-0001-000000000007', 8, '2026-03-16 22:00:00+00', '2026-03-17 06:00:00+00', 'completed'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000001', 'Day Shift', '00000000-0000-0000-0001-000000000006', 12, '2026-03-16 06:00:00+00', '2026-03-16 14:00:00+00', 'completed');

INSERT INTO shift_handoffs (shift_id, org_id, summary, sections) VALUES
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0000-000000000001',
   'Strong production day. Line A ran at 94% efficiency. Minor packaging sealer issue resolved by Carlos at 10:30 AM. All safety checks completed on time.',
   '[{"title":"Production","icon":"🏭","items":[{"text":"Line A: 47,200 lbs kibble produced (target: 46,000) — 102.6% of goal","status":"good"},{"text":"Line B: 38,100 lbs produced (target: 40,000) — 95.3% of goal. Slow start due to ingredient staging delay.","status":"warning"},{"text":"Batch 2026-0317-A passed QC — all specs within range","status":"good"}]},{"title":"Safety & Incidents","icon":"🛡️","items":[{"text":"NEAR MISS: Wet floor near Line A wash station at 9:15 AM. Cleaned immediately, cone placed.","status":"warning"},{"text":"Chemical storage scan completed — all items properly labeled","status":"good"},{"text":"Fire extinguisher monthly check: all 12 units passed","status":"good"}]},{"title":"Equipment","icon":"⚙️","items":[{"text":"Packaging Sealer #3: seal temperature running 8°F high. Carlos adjusted at 10:30 AM.","status":"warning"},{"text":"Conveyor #7 belt tension still declining — maintenance ticket open","status":"danger"},{"text":"Extruder #1 running normally. Die pressure at 44 PSI.","status":"good"}]},{"title":"Action Items for Next Shift","icon":"📋","items":[{"text":"PRIORITY: Check Conveyor #7 belt tension before starting Line B","status":"danger"},{"text":"Monitor Packaging Sealer #3 temperature — if above 305°F, shut down","status":"warning"},{"text":"Stage ingredients for Nurture Farms test batch","status":"info"}]}]'::jsonb),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0000-000000000001',
   'Quiet night. Line A ran standard overnight batch. No incidents. Conveyor #7 showing continued belt degradation.',
   '[{"title":"Production","icon":"🏭","items":[{"text":"Line A overnight batch: 28,400 lbs (target: 28,000) — on track","status":"good"},{"text":"Line B: not running (maintenance window)","status":"info"}]},{"title":"Safety & Incidents","icon":"🛡️","items":[{"text":"No incidents reported","status":"good"},{"text":"Nightly perimeter check completed — all doors secured","status":"good"}]},{"title":"Equipment","icon":"⚙️","items":[{"text":"Conveyor #7: alignment reading 2.3° off-center. Trend is worsening.","status":"danger"},{"text":"All other equipment running normally","status":"good"}]},{"title":"Action Items","icon":"📋","items":[{"text":"Conveyor #7 needs immediate attention — alignment degrading daily","status":"danger"},{"text":"Restock break room supplies — ran out at 3 AM","status":"info"}]}]'::jsonb),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000001',
   'Good day overall. Compliance scan found one issue (resolved). New hire Maria Santos started. Forklift near-miss — retraining scheduled.',
   '[{"title":"Production","icon":"🏭","items":[{"text":"Line A: 45,800 lbs (target: 46,000) — 99.6%","status":"good"},{"text":"Line B: 39,200 lbs (target: 40,000) — 98%","status":"good"}]},{"title":"Safety & Incidents","icon":"🛡️","items":[{"text":"NEAR MISS: Forklift FL-04 nearly struck pedestrian at warehouse blind corner.","status":"danger"},{"text":"Corrective action: mirror installation ordered. Operator retraining scheduled.","status":"warning"},{"text":"Compliance scan: incompatible chemicals stored adjacent. Moved immediately.","status":"warning"}]},{"title":"Personnel","icon":"👥","items":[{"text":"Maria Santos started Day 1 — completed safety orientation and facility tour","status":"good"},{"text":"2 bounties completed: forklift inspection SOP and allergen changeover","status":"good"}]}]'::jsonb);
