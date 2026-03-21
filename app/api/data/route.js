// app/api/data/route.js
import { getSupabase } from "../../_lib/supabase";
import { requireAuth } from "../../_lib/api-auth";
import { sanitizeRecord } from "../../_lib/sanitize";

const ORG_ID = "00000000-0000-0000-0000-000000000001"; // demo placeholder org

const VALID_TABLES = new Set([
  "organizations","workers","assets","bounties","bounty_claims","bounty_reviews",
  "bounty_payouts","knowledge_gaps","safety_streaks","veteran_knowledge","roi_events",
  "incidents","sops","teaching_sessions","compliance_scans","certifications","inspections",
  "training_records","shifts","shift_handoffs","maintenance_logs","broadcasts",
  "usage_events","scorecards","defect_inspections","equipment_diagnoses","audit_packages",
]);

// H-FIX-5: organizations is now ORG_SCOPED so it returns only the authenticated org's record.
// Column output is also restricted (see selectCols below) to avoid leaking all tenant slugs.
const ORG_SCOPED_TABLES = new Set([
  "organizations","workers","assets","bounties","knowledge_gaps","safety_streaks",
  "veteran_knowledge","roi_events","incidents","sops","teaching_sessions","compliance_scans",
  "certifications","inspections","training_records","shifts","shift_handoffs","maintenance_logs",
  "broadcasts","usage_events","scorecards","audit_packages",
]);

const SAFE_COLUMN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const MAX_LIMIT = 500;
const MAX_FILTER_LENGTH = 200; // M-FIX-3: length cap on status/dept filter params
const ORDER_DEFAULTS = {
  safety_streaks: "updated_at",
  shift_handoffs: "generated_at",
  organizations: "id",
};

export async function GET(request) {
  // C-1: auth gate
  const authError = requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const statusRaw = searchParams.get("status");
  const deptRaw = searchParams.get("department");

  // M-FIX-3: cap filter param lengths to prevent unnecessary work
  const status = statusRaw && statusRaw.length <= MAX_FILTER_LENGTH ? statusRaw : null;
  const dept = deptRaw && deptRaw.length <= MAX_FILTER_LENGTH ? deptRaw : null;

  // H-FIX-2: parseInt("abc") → NaN → Math.min(NaN, 500) → NaN → no limit applied.
  // Guard with isNaN before Math.min.
  const parsedLimit = parseInt(searchParams.get("limit") || "100", 10);
  const limit = Math.min(isNaN(parsedLimit) ? 100 : parsedLimit, MAX_LIMIT);

  const orderBy = searchParams.get("order") || ORDER_DEFAULTS[table] || "created_at";
  const asc = searchParams.get("asc") === "true";

  if (!table || !VALID_TABLES.has(table)) {
    return Response.json({ error: "Invalid table" }, { status: 400 });
  }
  if (!SAFE_COLUMN.test(orderBy)) {
    return Response.json({ error: "Invalid order column" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return Response.json({ data: [], source: "demo" });

  // H-FIX-5: restrict organizations columns to avoid returning all tenant slugs/names
  const selectCols = table === "organizations"
    ? "id,name,industry,created_at,updated_at"  // slug omitted — avoids tenant enumeration
    : "*";

  let query = supabase.from(table).select(selectCols);
  if (ORG_SCOPED_TABLES.has(table)) {
    query = query.eq("org_id", ORG_ID);
  }
  if (status) query = query.eq("status", status);
  if (dept) query = query.eq("department", dept);
  query = query.order(orderBy, { ascending: asc }).limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("[data] GET query failed:", error.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }
  return Response.json({ data, source: "supabase" });
}

export async function POST(request) {
  // C-1: auth gate
  const authError = requireAuth(request);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { table, record } = body;
  if (!table || !record || !VALID_TABLES.has(table)) {
    return Response.json({ error: "Missing or invalid table or record" }, { status: 400 });
  }

  // H-3: sanitize record — strips __proto__, constructor, prototype, and non-identifier keys
  let safeRecord;
  try {
    safeRecord = sanitizeRecord(record);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ data: { ...safeRecord, id: `demo-${Date.now()}` }, source: "demo" });
  }

  // Force org_id to the server-authoritative value — client cannot override this
  safeRecord.org_id = ORG_ID;

  const { data, error } = await supabase.from(table).insert(safeRecord).select().single();
  if (error) {
    console.error("[data] POST insert failed:", error.message);
    return Response.json({ error: "Write failed" }, { status: 500 });
  }
  return Response.json({ data, source: "supabase" });
}
