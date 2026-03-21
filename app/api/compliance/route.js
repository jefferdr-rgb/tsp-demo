// app/api/compliance/route.js
import { getSupabase } from "../../_lib/supabase";
import { requireAuth } from "../../_lib/api-auth";
import { sanitizeRecord } from "../../_lib/sanitize";

const ORG_ID = "00000000-0000-0000-0000-000000000001"; // demo placeholder org

const VALID_COMPLIANCE_TABLES = new Set([
  "compliance_scans",
  "certifications",
  "audit_packages",
  "inspections",
]);

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

  if (!table || !record) {
    return Response.json({ error: "Missing table or record" }, { status: 400 });
  }

  if (!VALID_COMPLIANCE_TABLES.has(table)) {
    return Response.json({ error: "Invalid table" }, { status: 400 });
  }

  // H-3: strip prototype-pollution keys from record
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

  // M-2: enforce org_id server-side — client record cannot supply or override it
  safeRecord.org_id = ORG_ID;

  const { data, error } = await supabase
    .from(table)
    .insert(safeRecord)
    .select()
    .single();

  if (error) {
    console.error("[compliance] Insert failed:", error.message);
    return Response.json({ error: "Write failed" }, { status: 500 });
  }

  return Response.json({ data });
}
