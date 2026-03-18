import { getSupabase } from "../../../_lib/supabase";

// ── Compliance Alert Sweep ───────────────────────────────────────────────────
// Scans certs, inspections, training for issues. Returns structured alerts.

// Demo data imported inline to keep this self-contained
const DEMO_ALERTS = [
  {
    id: "alert-001",
    type: "cert_expired",
    severity: "critical",
    title: "Forklift cert expired — Mike Thompson",
    detail: "Forklift Operator certification expired 2026-03-01. Mike cannot operate forklifts until recertified.",
    employee: "Mike Thompson",
    department: "Maintenance",
    deadline: "2026-03-01",
    action: "Schedule recertification immediately",
  },
  {
    id: "alert-002",
    type: "cert_expiring",
    severity: "warning",
    title: "Forklift cert expires in 24 days — Carlos Rodriguez",
    detail: "Forklift Operator certification expires 2026-04-10. Schedule renewal before expiry.",
    employee: "Carlos Rodriguez",
    department: "Production",
    deadline: "2026-04-10",
    action: "Schedule forklift recertification",
  },
  {
    id: "alert-003",
    type: "cert_expiring",
    severity: "warning",
    title: "Lockout/Tagout cert expires in 29 days — Mike Thompson",
    detail: "Lockout/Tagout certification expires 2026-04-15.",
    employee: "Mike Thompson",
    department: "Maintenance",
    deadline: "2026-04-15",
    action: "Schedule LOTO recertification",
  },
  {
    id: "alert-004",
    type: "cert_expiring",
    severity: "warning",
    title: "Food Safety cert expires soon — Maria Santos",
    detail: "Food Safety (PCQI) certification expires 2026-03-25.",
    employee: "Maria Santos",
    department: "Packaging",
    deadline: "2026-03-25",
    action: "Schedule PCQI renewal",
  },
  {
    id: "alert-005",
    type: "inspection_overdue",
    severity: "critical",
    title: "Fire extinguisher inspection overdue — Line A",
    detail: "Production Floor — Line A fire extinguisher inspection was due 2026-03-15. 2 days overdue.",
    area: "Production Floor — Line A",
    deadline: "2026-03-15",
    action: "Complete fire extinguisher inspection today",
  },
  {
    id: "alert-006",
    type: "inspection_overdue",
    severity: "critical",
    title: "Emergency exit inspection overdue — Packaging",
    detail: "Packaging Line B emergency exit inspection was due 2026-03-10. 7 days overdue.",
    area: "Packaging Line B",
    deadline: "2026-03-10",
    action: "Complete emergency exit inspection",
  },
  {
    id: "alert-007",
    type: "training_incomplete",
    severity: "warning",
    title: "Incomplete training — Maria Santos",
    detail: "New Hire Safety Orientation assigned 2024-08-01, still not completed (7+ months overdue).",
    employee: "Maria Santos",
    department: "Packaging",
    deadline: "2024-08-01",
    action: "Complete safety orientation immediately",
  },
  {
    id: "alert-008",
    type: "training_incomplete",
    severity: "info",
    title: "Pending training — Carlos Rodriguez",
    detail: "Lockout/Tagout Refresher assigned 2026-03-01, not yet completed.",
    employee: "Carlos Rodriguez",
    department: "Production",
    deadline: "2026-03-01",
    action: "Complete LOTO refresher training",
  },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientKey = searchParams.get("client_key") || "sunshine-mills";

  const supabase = getSupabase();

  // Demo mode
  if (!supabase) {
    const critical = DEMO_ALERTS.filter(a => a.severity === "critical").length;
    const warning = DEMO_ALERTS.filter(a => a.severity === "warning").length;
    const info = DEMO_ALERTS.filter(a => a.severity === "info").length;

    return Response.json({
      alerts: DEMO_ALERTS,
      summary: {
        total: DEMO_ALERTS.length,
        critical,
        warning,
        info,
        byType: {
          cert_expired: DEMO_ALERTS.filter(a => a.type === "cert_expired").length,
          cert_expiring: DEMO_ALERTS.filter(a => a.type === "cert_expiring").length,
          inspection_overdue: DEMO_ALERTS.filter(a => a.type === "inspection_overdue").length,
          training_incomplete: DEMO_ALERTS.filter(a => a.type === "training_incomplete").length,
        },
      },
      source: "demo",
    });
  }

  // Supabase mode — run sweep queries
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const alerts = [];

  // Expired certs
  const { data: expiredCerts } = await supabase
    .from("certifications")
    .select("*, employees(name, department)")
    .eq("client_key", clientKey)
    .lt("expires", today);

  for (const c of expiredCerts || []) {
    alerts.push({
      type: "cert_expired",
      severity: "critical",
      title: `${c.cert_type} expired — ${c.employees?.name}`,
      detail: `Expired ${c.expires}.`,
      employee: c.employees?.name,
      department: c.employees?.department,
      deadline: c.expires,
      action: "Schedule recertification immediately",
    });
  }

  // Expiring certs (within 30 days)
  const { data: expiringCerts } = await supabase
    .from("certifications")
    .select("*, employees(name, department)")
    .eq("client_key", clientKey)
    .gte("expires", today)
    .lte("expires", in30Days);

  for (const c of expiringCerts || []) {
    const daysLeft = Math.ceil((new Date(c.expires) - now) / (1000 * 60 * 60 * 24));
    alerts.push({
      type: "cert_expiring",
      severity: "warning",
      title: `${c.cert_type} expires in ${daysLeft} days — ${c.employees?.name}`,
      detail: `Expires ${c.expires}.`,
      employee: c.employees?.name,
      department: c.employees?.department,
      deadline: c.expires,
      action: `Schedule ${c.cert_type} renewal`,
    });
  }

  // Overdue inspections
  const { data: overdueInsp } = await supabase
    .from("inspections")
    .select("*")
    .eq("client_key", clientKey)
    .lt("next_due", today);

  for (const i of overdueInsp || []) {
    alerts.push({
      type: "inspection_overdue",
      severity: "critical",
      title: `${i.type} inspection overdue — ${i.area}`,
      detail: `Due ${i.next_due}.`,
      area: i.area,
      deadline: i.next_due,
      action: `Complete ${i.type} inspection`,
    });
  }

  // Incomplete training
  const { data: incompleteTraining } = await supabase
    .from("training_records")
    .select("*, employees(name, department)")
    .eq("client_key", clientKey)
    .is("completed", null);

  for (const t of incompleteTraining || []) {
    alerts.push({
      type: "training_incomplete",
      severity: "warning",
      title: `Incomplete training — ${t.employees?.name}`,
      detail: `${t.course} assigned ${t.assigned}, not yet completed.`,
      employee: t.employees?.name,
      department: t.employees?.department,
      deadline: t.assigned,
      action: `Complete ${t.course}`,
    });
  }

  const critical = alerts.filter(a => a.severity === "critical").length;
  const warning = alerts.filter(a => a.severity === "warning").length;
  const info = alerts.filter(a => a.severity === "info").length;

  return Response.json({
    alerts,
    summary: {
      total: alerts.length,
      critical,
      warning,
      info,
      byType: {
        cert_expired: alerts.filter(a => a.type === "cert_expired").length,
        cert_expiring: alerts.filter(a => a.type === "cert_expiring").length,
        inspection_overdue: alerts.filter(a => a.type === "inspection_overdue").length,
        training_incomplete: alerts.filter(a => a.type === "training_incomplete").length,
      },
    },
  });
}
