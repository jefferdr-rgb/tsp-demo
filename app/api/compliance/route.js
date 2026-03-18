import { getSupabase } from "../../_lib/supabase";

// ── Demo data (used when Supabase is not configured) ─────────────────────────
const DEMO_DATA = {
  employees: [
    { id: "emp-001", name: "Carlos Rodriguez", role: "Extruder Operator", department: "Production", hire_date: "2023-06-15", language: "es", client_key: "sunshine-mills" },
    { id: "emp-002", name: "Nguyen Thi Lan", role: "Quality Inspector", department: "Quality", hire_date: "2024-01-08", language: "vi", client_key: "sunshine-mills" },
    { id: "emp-003", name: "Mike Thompson", role: "Maintenance Lead", department: "Maintenance", hire_date: "2020-03-22", language: "en", client_key: "sunshine-mills" },
    { id: "emp-004", name: "Maria Santos", role: "Packaging Operator", department: "Packaging", hire_date: "2024-08-01", language: "es", client_key: "sunshine-mills" },
    { id: "emp-005", name: "James Wilson", role: "Warehouse Supervisor", department: "Warehouse", hire_date: "2021-11-15", language: "en", client_key: "sunshine-mills" },
  ],
  certifications: [
    { id: "cert-001", employee_id: "emp-001", cert_type: "Forklift Operator", issued: "2025-04-10", expires: "2026-04-10", status: "expiring_soon", client_key: "sunshine-mills" },
    { id: "cert-002", employee_id: "emp-003", cert_type: "Forklift Operator", issued: "2025-03-01", expires: "2026-03-01", status: "expired", client_key: "sunshine-mills" },
    { id: "cert-003", employee_id: "emp-005", cert_type: "Forklift Operator", issued: "2025-06-15", expires: "2026-06-15", status: "active", client_key: "sunshine-mills" },
    { id: "cert-004", employee_id: "emp-001", cert_type: "HAZMAT Handler", issued: "2025-09-01", expires: "2026-09-01", status: "active", client_key: "sunshine-mills" },
    { id: "cert-005", employee_id: "emp-002", cert_type: "Food Safety (PCQI)", issued: "2024-12-01", expires: "2026-12-01", status: "active", client_key: "sunshine-mills" },
    { id: "cert-006", employee_id: "emp-003", cert_type: "Lockout/Tagout", issued: "2025-01-15", expires: "2026-04-15", status: "expiring_soon", client_key: "sunshine-mills" },
    { id: "cert-007", employee_id: "emp-004", cert_type: "Food Safety (PCQI)", issued: "2025-02-01", expires: "2026-03-25", status: "expiring_soon", client_key: "sunshine-mills" },
    { id: "cert-008", employee_id: "emp-005", cert_type: "OSHA 30-Hour", issued: "2024-06-01", expires: "2027-06-01", status: "active", client_key: "sunshine-mills" },
  ],
  inspections: [
    { id: "insp-001", area: "Production Floor — Line A", type: "Fire Extinguisher", last_inspection: "2026-02-15", next_due: "2026-03-15", status: "overdue", client_key: "sunshine-mills" },
    { id: "insp-002", area: "Warehouse Bay 3", type: "Forklift Safety", last_inspection: "2026-03-01", next_due: "2026-04-01", status: "upcoming", client_key: "sunshine-mills" },
    { id: "insp-003", area: "Packaging Line B", type: "Emergency Exit", last_inspection: "2026-01-10", next_due: "2026-03-10", status: "overdue", client_key: "sunshine-mills" },
  ],
  training_records: [
    { id: "tr-001", employee_id: "emp-004", course: "New Hire Safety Orientation", assigned: "2024-08-01", completed: null, status: "incomplete", client_key: "sunshine-mills" },
    { id: "tr-002", employee_id: "emp-004", course: "GMP — Good Manufacturing Practices", assigned: "2024-08-01", completed: "2024-08-10", status: "complete", client_key: "sunshine-mills" },
    { id: "tr-003", employee_id: "emp-001", course: "Lockout/Tagout Refresher", assigned: "2026-03-01", completed: null, status: "incomplete", client_key: "sunshine-mills" },
    { id: "tr-004", employee_id: "emp-002", course: "Allergen Awareness", assigned: "2026-02-15", completed: "2026-02-20", status: "complete", client_key: "sunshine-mills" },
  ],
  incident_reports: [],
  compliance_alerts: [],
};

// Merge employee names into records for demo display
function enrichDemoData(table, data) {
  if (["certifications", "training_records"].includes(table)) {
    return data.map(r => {
      const emp = DEMO_DATA.employees.find(e => e.id === r.employee_id);
      return { ...r, employee_name: emp?.name || "Unknown" };
    });
  }
  return data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const clientKey = searchParams.get("client_key") || "sunshine-mills";

  if (!table) {
    return Response.json({ error: "Missing 'table' parameter" }, { status: 400 });
  }

  const validTables = ["employees", "certifications", "inspections", "training_records", "incident_reports", "compliance_alerts"];
  if (!validTables.includes(table)) {
    return Response.json({ error: `Invalid table. Valid: ${validTables.join(", ")}` }, { status: 400 });
  }

  const supabase = getSupabase();

  // Demo mode — return hardcoded data
  if (!supabase) {
    const data = DEMO_DATA[table]?.filter(r => r.client_key === clientKey) || [];
    return Response.json({ data: enrichDemoData(table, data), source: "demo" });
  }

  // Supabase mode
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("client_key", clientKey)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(request) {
  const body = await request.json();
  const { table, record } = body;

  if (!table || !record) {
    return Response.json({ error: "Missing 'table' or 'record'" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Demo mode — just acknowledge
  if (!supabase) {
    return Response.json({ data: { ...record, id: `demo-${Date.now()}` }, source: "demo" });
  }

  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}
