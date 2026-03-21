// app/api/compliance/alerts/route.js
import { getSupabase } from "../../../_lib/supabase";
import { requireAuth, VALID_CLIENTS } from "../../../_lib/api-auth";

export async function GET(request) {
  // C-1: auth gate — unauthenticated callers cannot reach any client data
  const authError = requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const clientKey = searchParams.get("client_key");

  // C-2: clientKey must be in the server-side allowlist.
  // NOTE: This prevents unknown clients but does not prevent lateral movement
  // between known clients — a caller with the shared secret can request any
  // valid client's alerts. True tenant isolation requires per-tenant auth.
  if (!clientKey || !VALID_CLIENTS.has(clientKey)) {
    return Response.json({ error: "Invalid or missing client_key" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ data: [], source: "demo" });
  }

  const { data, error } = await supabase
    .from("compliance_scans")
    .select("id, client_key, alert_type, severity, message, created_at, resolved_at")
    .eq("client_key", clientKey)
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[compliance/alerts] Query failed:", error.message);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  return Response.json({ data, source: "supabase" });
}
