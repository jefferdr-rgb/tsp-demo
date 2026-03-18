import { getSupabase } from "../../_lib/supabase";

// ── Unified data API ─────────────────────────────────────────────────────────
// GET /api/data?table=bounties&org=sunshine-mills&status=open
// POST /api/data  { table, record }
//
// Reads from Supabase when available, returns { data, source: "supabase" | "demo" }

const ORG_ID = "00000000-0000-0000-0000-000000000001"; // placeholder demo org UUID

const VALID_TABLES = [
  "organizations", "workers", "assets",
  "bounties", "bounty_claims", "bounty_reviews", "bounty_payouts", "knowledge_gaps",
  "safety_streaks", "veteran_knowledge", "roi_events",
  "incidents", "sops", "teaching_sessions",
  "compliance_scans", "certifications", "inspections", "training_records",
  "shifts", "shift_handoffs", "maintenance_logs", "broadcasts",
  "usage_events", "scorecards", "defect_inspections", "equipment_diagnoses",
  "audit_packages",
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const status = searchParams.get("status");
  const dept = searchParams.get("department");
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  // Tables with non-standard timestamp columns
  const ORDER_DEFAULTS = {
    safety_streaks: "updated_at",
    shift_handoffs: "generated_at",
    organizations: "id",
  };
  const orderBy = searchParams.get("order") || ORDER_DEFAULTS[table] || "created_at";
  const asc = searchParams.get("asc") === "true";

  if (!table || !VALID_TABLES.includes(table)) {
    return Response.json({ error: `Invalid table. Valid: ${VALID_TABLES.join(", ")}` }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ data: [], source: "demo" });
  }

  let query = supabase.from(table).select("*");

  // org scoping (skip for org table itself)
  if (table !== "organizations") {
    // Tables that use org_id directly
    const orgTables = [
      "workers", "assets", "bounties", "knowledge_gaps", "safety_streaks",
      "veteran_knowledge", "roi_events", "incidents", "sops", "teaching_sessions",
      "compliance_scans", "certifications", "inspections", "training_records",
      "shifts", "shift_handoffs", "maintenance_logs", "broadcasts",
      "usage_events", "scorecards", "audit_packages",
    ];
    if (orgTables.includes(table)) {
      query = query.eq("org_id", ORG_ID);
    }
  }

  if (status) query = query.eq("status", status);
  if (dept) query = query.eq("department", dept);

  query = query.order(orderBy, { ascending: asc }).limit(limit);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, source: "supabase" });
}

export async function POST(request) {
  const body = await request.json();
  const { table, record } = body;

  if (!table || !record || !VALID_TABLES.includes(table)) {
    return Response.json({ error: "Missing or invalid 'table' or 'record'" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ data: { ...record, id: `demo-${Date.now()}` }, source: "demo" });
  }

  // Auto-inject org_id for tables that need it
  if (!record.org_id) {
    record.org_id = ORG_ID;
  }

  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, source: "supabase" });
}
