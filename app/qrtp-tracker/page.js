"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

// QRTP requires: independent assessment within 30 days, judicial review within 60 days,
// 24/7 clinical staffing, documented trauma-informed model, 6-month aftercare tracking
const QRTP_YOUTH = [
  {
    id: "YP-2026-041", name: "Marcus T.", age: 15, program: "Moderate", cottage: "Oak Hill",
    admitDate: "2026-01-08", referralSource: "Jefferson County DHR",
    assessment: { status: "complete", dueDate: "2026-02-07", completedDate: "2026-02-04", assessor: "Dr. Lisa Monroe (Independent)", recommendation: "QRTP placement appropriate — trauma history, behavioral needs exceed foster care capacity" },
    judicialReview: { status: "complete", dueDate: "2026-03-09", completedDate: "2026-03-06", judge: "Judge Harwell, Family Court", outcome: "Placement approved, 90-day review ordered" },
    nextReview: { type: "90-Day Ongoing", dueDate: "2026-06-04", status: "upcoming" },
    treatmentPlan: true, clinicalStaffing: true, aftercare: "not-applicable",
  },
  {
    id: "YP-2026-047", name: "Jaylen W.", age: 14, program: "Moderate", cottage: "Cedar Ridge",
    admitDate: "2026-02-12", referralSource: "Shelby County DHR",
    assessment: { status: "complete", dueDate: "2026-03-14", completedDate: "2026-03-10", assessor: "Dr. Lisa Monroe (Independent)", recommendation: "QRTP appropriate — significant behavioral and mental health needs" },
    judicialReview: { status: "due-soon", dueDate: "2026-04-13", completedDate: null, judge: null, outcome: null },
    nextReview: null,
    treatmentPlan: true, clinicalStaffing: true, aftercare: "not-applicable",
  },
  {
    id: "YP-2026-052", name: "Destiny R.", age: 16, program: "TLP", cottage: "Jane's House",
    admitDate: "2026-02-24", referralSource: "Blount County DHR",
    assessment: { status: "due-soon", dueDate: "2026-03-26", completedDate: null, assessor: null, recommendation: null },
    judicialReview: { status: "pending", dueDate: "2026-04-25", completedDate: null, judge: null, outcome: null },
    nextReview: null,
    treatmentPlan: true, clinicalStaffing: true, aftercare: "not-applicable",
  },
  {
    id: "YP-2026-038", name: "Andre M.", age: 17, program: "Moderate", cottage: "Maple House",
    admitDate: "2025-12-15", referralSource: "Tuscaloosa County DHR",
    assessment: { status: "complete", dueDate: "2026-01-14", completedDate: "2026-01-12", assessor: "Dr. Lisa Monroe (Independent)", recommendation: "QRTP appropriate" },
    judicialReview: { status: "complete", dueDate: "2026-02-13", completedDate: "2026-02-10", judge: "Judge Martinez, Family Court", outcome: "Placement approved" },
    nextReview: { type: "90-Day Ongoing", dueDate: "2026-05-10", status: "upcoming" },
    treatmentPlan: true, clinicalStaffing: true, aftercare: "not-applicable",
  },
  {
    id: "YP-2025-029", name: "Tyler B.", age: 17, program: "TLP", cottage: "Elm Cottage",
    admitDate: "2025-09-02", referralSource: "Jefferson County DHR",
    assessment: { status: "complete", dueDate: "2025-10-02", completedDate: "2025-09-28", assessor: "Dr. James Hart (Independent)", recommendation: "QRTP appropriate — transitioning to TLP" },
    judicialReview: { status: "complete", dueDate: "2025-11-01", completedDate: "2025-10-29", judge: "Judge Harwell, Family Court", outcome: "Continued placement approved" },
    nextReview: { type: "6-Month Review", dueDate: "2026-03-28", status: "overdue" },
    treatmentPlan: true, clinicalStaffing: true, aftercare: "not-applicable",
  },
  {
    id: "YP-2025-022", name: "Kayla S.", age: 16, program: "Moderate", cottage: "Willow Bend",
    admitDate: "2025-07-14", referralSource: "Shelby County DHR",
    assessment: { status: "complete", dueDate: "2025-08-13", completedDate: "2025-08-11", assessor: "Dr. Lisa Monroe (Independent)", recommendation: "QRTP appropriate" },
    judicialReview: { status: "complete", dueDate: "2025-09-12", completedDate: "2025-09-10", judge: "Judge Harwell, Family Court", outcome: "Continued placement" },
    nextReview: { type: "Discharge Planning", dueDate: "2026-04-01", status: "upcoming" },
    treatmentPlan: true, clinicalStaffing: true,
    aftercare: "planning",
    dischargeTarget: "2026-04-15",
  },
];

function daysUntil(dateStr) {
  const d = new Date(dateStr);
  const now = new Date("2026-03-18");
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function statusBadge(status, dueDate) {
  if (status === "complete") return { label: "Complete", color: C.green, bg: "rgba(34,197,94,0.1)" };
  if (status === "overdue") return { label: "OVERDUE", color: C.red, bg: "rgba(197,48,48,0.1)" };
  if (status === "due-soon") {
    const days = daysUntil(dueDate);
    if (days < 0) return { label: "OVERDUE", color: C.red, bg: "rgba(197,48,48,0.1)" };
    if (days <= 7) return { label: `${days}d left`, color: C.red, bg: "rgba(197,48,48,0.1)" };
    if (days <= 14) return { label: `${days}d left`, color: C.orange, bg: "rgba(245,158,11,0.1)" };
    return { label: `${days}d left`, color: C.blue, bg: "rgba(59,130,246,0.1)" };
  }
  if (status === "pending") return { label: "Pending", color: C.textMuted, bg: C.borderLight };
  if (status === "upcoming") {
    const days = daysUntil(dueDate);
    if (days < 0) return { label: "OVERDUE", color: C.red, bg: "rgba(197,48,48,0.1)" };
    if (days <= 14) return { label: `Due in ${days}d`, color: C.orange, bg: "rgba(245,158,11,0.1)" };
    return { label: `Due in ${days}d`, color: C.blue, bg: "rgba(59,130,246,0.1)" };
  }
  if (status === "planning") return { label: "Planning", color: C.purple, bg: "rgba(124,58,237,0.1)" };
  return { label: status, color: C.textMuted, bg: C.borderLight };
}

export default function QRTPTrackerPage() {
  const [selectedYouth, setSelectedYouth] = useState(null);
  const [filter, setFilter] = useState("all"); // all | action-needed | on-track

  const overdueCount = QRTP_YOUTH.filter(y => {
    const aOver = y.assessment.status === "due-soon" && daysUntil(y.assessment.dueDate) < 0;
    const jOver = y.judicialReview.status === "due-soon" && daysUntil(y.judicialReview.dueDate) < 0;
    const rOver = y.nextReview?.status === "overdue" || (y.nextReview?.dueDate && daysUntil(y.nextReview.dueDate) < 0);
    return aOver || jOver || rOver;
  }).length;

  const dueSoonCount = QRTP_YOUTH.filter(y => {
    const aDue = y.assessment.status === "due-soon" && daysUntil(y.assessment.dueDate) >= 0 && daysUntil(y.assessment.dueDate) <= 14;
    const jDue = y.judicialReview.status === "due-soon" && daysUntil(y.judicialReview.dueDate) >= 0 && daysUntil(y.judicialReview.dueDate) <= 14;
    const rDue = y.nextReview?.status === "upcoming" && daysUntil(y.nextReview.dueDate) >= 0 && daysUntil(y.nextReview.dueDate) <= 14;
    return aDue || jDue || rDue;
  }).length;

  const filtered = filter === "all" ? QRTP_YOUTH
    : filter === "action-needed" ? QRTP_YOUTH.filter(y => {
        const hasAction = y.assessment.status !== "complete" || y.judicialReview.status !== "complete" || y.nextReview?.status === "overdue" || (y.nextReview?.dueDate && daysUntil(y.nextReview.dueDate) < 0);
        return hasAction;
      })
    : QRTP_YOUTH.filter(y => y.assessment.status === "complete" && y.judicialReview.status === "complete" && (!y.nextReview || y.nextReview.status !== "overdue"));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>QRTP Compliance Tracker</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(197,48,48,0.15)", color: "#F87171", fontSize: 11, fontWeight: 700 }}>Family First Act</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Explainer */}
        <div style={{ background: "rgba(197,48,48,0.04)", borderRadius: 12, border: `1px solid rgba(197,48,48,0.15)`, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 6 }}>Why This Matters</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
            The Family First Prevention Services Act requires every youth in congregate care to have QRTP status to maintain Title IV-E federal reimbursement.
            Missing a deadline means lost funding. RHONDA tracks every milestone — 30-day independent assessments, 60-day judicial reviews,
            ongoing reviews, and discharge aftercare — so nothing falls through the cracks.
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Active QRTP Youth", value: QRTP_YOUTH.length, color: C.accent },
            { label: "Overdue Actions", value: overdueCount, color: overdueCount > 0 ? C.red : C.green },
            { label: "Due Within 14 Days", value: dueSoonCount, color: dueSoonCount > 0 ? C.orange : C.green },
            { label: "Compliance Rate", value: `${Math.round(((QRTP_YOUTH.length - overdueCount) / QRTP_YOUTH.length) * 100)}%`, color: overdueCount === 0 ? C.green : C.orange },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { id: "all", label: "All Youth" },
            { id: "action-needed", label: "Action Needed" },
            { id: "on-track", label: "On Track" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: filter === f.id ? C.accent : "transparent", color: filter === f.id ? "#fff" : C.textMuted }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Youth cards */}
        {filtered.map(y => {
          const isOpen = selectedYouth === y.id;
          const aBadge = statusBadge(y.assessment.status, y.assessment.dueDate);
          const jBadge = statusBadge(y.judicialReview.status, y.judicialReview.dueDate);
          return (
            <div key={y.id} style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${isOpen ? C.accent : C.border}`, marginBottom: 12, overflow: "hidden" }}>
              <div onClick={() => setSelectedYouth(isOpen ? null : y.id)}
                style={{ padding: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{y.name}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Age {y.age}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 600 }}>{y.program}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{y.cottage}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    {y.id} &middot; Admitted {y.admitDate} &middot; {y.referralSource}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ textAlign: "center", padding: "6px 12px", borderRadius: 6, background: aBadge.bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: aBadge.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assessment</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: aBadge.color }}>{aBadge.label}</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "6px 12px", borderRadius: 6, background: jBadge.bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: jBadge.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>Judicial</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: jBadge.color }}>{jBadge.label}</div>
                  </div>
                  {y.nextReview && (() => {
                    const nBadge = statusBadge(y.nextReview.status, y.nextReview.dueDate);
                    return (
                      <div style={{ textAlign: "center", padding: "6px 12px", borderRadius: 6, background: nBadge.bg }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: nBadge.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Review</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: nBadge.color }}>{nBadge.label}</div>
                      </div>
                    );
                  })()}
                </div>
                <span style={{ fontSize: 18, color: C.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>&#9662;</span>
              </div>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Assessment detail */}
                    <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 10 }}>30-Day Independent Assessment</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Due: {y.assessment.dueDate}</div>
                      {y.assessment.completedDate && <div style={{ fontSize: 12, color: C.green, marginBottom: 4 }}>Completed: {y.assessment.completedDate}</div>}
                      {y.assessment.assessor && <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>Assessor: {y.assessment.assessor}</div>}
                      {y.assessment.recommendation && <div style={{ fontSize: 12, color: C.text, marginTop: 8, padding: 10, background: C.accentLight, borderRadius: 6 }}>&ldquo;{y.assessment.recommendation}&rdquo;</div>}
                      {!y.assessment.completedDate && (
                        <button style={{ marginTop: 10, padding: "8px 14px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          Schedule Assessment
                        </button>
                      )}
                    </div>

                    {/* Judicial review detail */}
                    <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 10 }}>60-Day Judicial Review</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Due: {y.judicialReview.dueDate}</div>
                      {y.judicialReview.completedDate && <div style={{ fontSize: 12, color: C.green, marginBottom: 4 }}>Completed: {y.judicialReview.completedDate}</div>}
                      {y.judicialReview.judge && <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{y.judicialReview.judge}</div>}
                      {y.judicialReview.outcome && <div style={{ fontSize: 12, color: C.text, marginTop: 8, padding: 10, background: "rgba(59,130,246,0.08)", borderRadius: 6 }}>Outcome: {y.judicialReview.outcome}</div>}
                      {!y.judicialReview.completedDate && y.assessment.status === "complete" && (
                        <button style={{ marginTop: 10, padding: "8px 14px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          Generate Court Report
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compliance checklist */}
                  <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>QRTP Compliance Checklist</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[
                        { label: "Independent Assessment", met: y.assessment.status === "complete" },
                        { label: "Judicial Review", met: y.judicialReview.status === "complete" },
                        { label: "Trauma-Informed Treatment Plan", met: y.treatmentPlan },
                        { label: "24/7 Clinical Staffing", met: y.clinicalStaffing },
                        { label: "Aftercare Plan (6-mo)", met: y.aftercare === "planning" || y.aftercare === "active" },
                        { label: "Discharge Planning", met: !!y.dischargeTarget },
                      ].map((item, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: item.met ? "rgba(34,197,94,0.06)" : "rgba(197,48,48,0.04)" }}>
                          <span style={{ fontSize: 14, color: item.met ? C.green : C.red }}>{item.met ? "\u2713" : "\u2717"}</span>
                          <span style={{ fontSize: 12, color: item.met ? C.text : C.red }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Timeline / upcoming deadlines */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginTop: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Upcoming Deadlines</h2>
          {(() => {
            const deadlines = QRTP_YOUTH.flatMap(y => {
              const items = [];
              if (y.assessment.status !== "complete") items.push({ youth: y.name, type: "30-Day Assessment", date: y.assessment.dueDate, id: y.id });
              if (y.judicialReview.status !== "complete") items.push({ youth: y.name, type: "60-Day Judicial Review", date: y.judicialReview.dueDate, id: y.id });
              if (y.nextReview?.dueDate) items.push({ youth: y.name, type: y.nextReview.type, date: y.nextReview.dueDate, id: y.id });
              if (y.dischargeTarget) items.push({ youth: y.name, type: "Target Discharge", date: y.dischargeTarget, id: y.id });
              return items;
            }).sort((a, b) => new Date(a.date) - new Date(b.date));

            return deadlines.map((dl, i) => {
              const days = daysUntil(dl.date);
              const isOverdue = days < 0;
              const isUrgent = days >= 0 && days <= 7;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <span style={{
                    width: 70, textAlign: "center", padding: "4px 0", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: isOverdue ? "rgba(197,48,48,0.1)" : isUrgent ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.06)",
                    color: isOverdue ? C.red : isUrgent ? C.orange : C.blue,
                  }}>
                    {isOverdue ? `${Math.abs(days)}d late` : `${days}d`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{dl.youth}</span>
                    <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 8 }}>{dl.type}</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{dl.date}</span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
