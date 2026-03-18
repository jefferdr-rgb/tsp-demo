"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

// ISP lifecycle: Intake → 30-Day Assessment → ISP Development → 90-Day Reviews → Discharge Planning
const PLANS = [
  {
    id: "ISP-2026-041", initials: "MT", age: 15, cottage: "Oak Hill", program: "Moderate",
    admitDate: "2026-01-08", caseworker: "Dana Phillips, Jefferson Co. DHR",
    phase: "active", nextReview: "2026-04-08", reviewType: "90-Day Review",
    goals: [
      { area: "Behavioral Health", goal: "Reduce verbal aggression incidents to <2 per month", baseline: "8 incidents/month at intake", current: "3 incidents in March", status: "progressing", progress: 70 },
      { area: "Education", goal: "Improve math grade to B or above", baseline: "D average at intake", current: "B+ as of March 12", status: "met", progress: 100 },
      { area: "Family Engagement", goal: "Participate in biweekly supervised visits with mother", baseline: "No family contact 6 months prior", current: "6 visits completed, mother attending parenting classes", status: "progressing", progress: 60 },
      { area: "Life Skills", goal: "Complete Level 2 independent living skills checklist", baseline: "Level 1 at intake", current: "4 of 8 Level 2 competencies demonstrated", status: "progressing", progress: 50 },
      { area: "Trauma Recovery", goal: "Complete Phase 1 TF-CBT protocol", baseline: "PTSD screening positive at intake", current: "Stabilization phase complete, beginning trauma narrative", status: "progressing", progress: 45 },
    ],
    team: [
      { role: "Primary Counselor", name: "Dr. Sarah Mitchell" },
      { role: "Houseparents", name: "Mark & Sarah Collins" },
      { role: "DHR Caseworker", name: "Dana Phillips" },
      { role: "Education Liaison", name: "Kim Roberts" },
      { role: "Psychiatrist", name: "Dr. James Patel" },
    ],
  },
  {
    id: "ISP-2026-047", initials: "JW", age: 14, cottage: "Cedar Ridge", program: "Moderate",
    admitDate: "2026-02-12", caseworker: "Tamara Wilson, Shelby Co. DHR",
    phase: "assessment", nextReview: "2026-03-26", reviewType: "30-Day Assessment Due",
    goals: [
      { area: "Behavioral Health", goal: "Assessment in progress — establishing baseline", baseline: "Pending", current: "Initial observations: adjustment behaviors, testing boundaries", status: "assessing", progress: 0 },
      { area: "Education", goal: "Assessment in progress", baseline: "Pending school records transfer", current: "Enrolled at Chelsea Middle, attending daily", status: "assessing", progress: 0 },
      { area: "Trauma Recovery", goal: "Complete trauma screening and begin treatment planning", baseline: "History of neglect and physical abuse per referral", current: "CANS assessment scheduled March 20", status: "assessing", progress: 20 },
    ],
    team: [
      { role: "Primary Counselor", name: "Dr. Angela Wright" },
      { role: "Houseparents", name: "James & Patricia Young" },
      { role: "DHR Caseworker", name: "Tamara Wilson" },
    ],
  },
  {
    id: "ISP-2025-022", initials: "KS", age: 16, cottage: "Willow Bend", program: "Moderate → Discharge",
    admitDate: "2025-07-14", caseworker: "Tamara Wilson, Shelby Co. DHR",
    phase: "discharge", nextReview: "2026-04-01", reviewType: "Discharge Planning Conference",
    goals: [
      { area: "Behavioral Health", goal: "Maintain Level 4 behavioral status for 90+ days", baseline: "Level 1 at intake", current: "Level 4 sustained 14 weeks", status: "met", progress: 100 },
      { area: "Education", goal: "Maintain 3.0+ GPA", baseline: "1.8 GPA at intake", current: "3.1 GPA, perfect attendance since October", status: "met", progress: 100 },
      { area: "Trauma Recovery", goal: "Complete full TF-CBT protocol", baseline: "Complex trauma history", current: "24 sessions completed, transitioned to maintenance", status: "met", progress: 100 },
      { area: "Permanency", goal: "Identify and transition to permanent placement", baseline: "TPR completed Oct 2025", current: "TFC family matched (Thompson), 6 visits completed", status: "progressing", progress: 80 },
      { area: "Aftercare", goal: "Establish community-based support network", baseline: "N/A", current: "Outpatient therapist identified, school transfer in process", status: "progressing", progress: 60 },
    ],
    team: [
      { role: "Primary Counselor", name: "Dr. Sarah Mitchell" },
      { role: "Houseparents", name: "James & Patricia Young" },
      { role: "DHR Caseworker", name: "Tamara Wilson" },
      { role: "TFC Coordinator", name: "Rachel Simmons" },
      { role: "Education Liaison", name: "Kim Roberts" },
    ],
  },
];

const PHASE_LABELS = {
  assessment: { label: "30-Day Assessment", color: C.orange, bg: "rgba(245,158,11,0.1)" },
  active: { label: "Active ISP", color: C.accent, bg: C.accentLight },
  discharge: { label: "Discharge Planning", color: C.purple, bg: "rgba(124,58,237,0.1)" },
};

const STATUS_COLORS = { met: C.green, progressing: C.accent, assessing: C.orange, "at-risk": C.red };

export default function ServicePlanBuilderPage() {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].id);
  const plan = PLANS.find(p => p.id === selectedPlan);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Service Plan Builder</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>Individualized Service Plans</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Plan selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {PLANS.map(p => {
            const ph = PHASE_LABELS[p.phase];
            const metCount = p.goals.filter(g => g.status === "met").length;
            return (
              <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${selectedPlan === p.id ? C.accent : C.border}`, padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{p.initials}</span>
                  <span style={{ padding: "3px 10px", borderRadius: 6, background: ph.bg, color: ph.color, fontSize: 11, fontWeight: 600 }}>{ph.label}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>Age {p.age} &middot; {p.cottage} &middot; {p.program}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{p.goals.length} goals &middot; {metCount} met</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: p.reviewType.includes("Due") ? C.red : C.accent, marginTop: 6 }}>{p.reviewType}: {p.nextReview}</div>
              </div>
            );
          })}
        </div>

        {plan && (
          <>
            {/* Plan header */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{plan.initials} — Individualized Service Plan</h2>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{plan.id} &middot; Age {plan.age} &middot; {plan.cottage} ({plan.program}) &middot; Admitted {plan.admitDate}</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>Caseworker: {plan.caseworker}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Export PDF</button>
                  <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Goal</button>
                </div>
              </div>
            </div>

            {/* Goals */}
            {plan.goals.map((g, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <span style={{ padding: "2px 8px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 700, marginRight: 8 }}>{g.area}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{g.goal}</span>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: STATUS_COLORS[g.status], background: `${STATUS_COLORS[g.status]}15`, textTransform: "capitalize" }}>{g.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: "#fdfcf8", border: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 4 }}>BASELINE</div>
                    <div style={{ fontSize: 13, color: C.text }}>{g.baseline}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: "#fdfcf8", border: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 4 }}>CURRENT STATUS</div>
                    <div style={{ fontSize: 13, color: C.text }}>{g.current}</div>
                  </div>
                </div>
                {g.progress > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.borderLight }}>
                      <div style={{ width: `${g.progress}%`, height: "100%", borderRadius: 3, background: STATUS_COLORS[g.status], transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[g.status] }}>{g.progress}%</span>
                  </div>
                )}
              </div>
            ))}

            {/* Treatment team */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginTop: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>Treatment Team</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {plan.team.map((t, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 2 }}>{t.role}</div>
                    <div style={{ fontSize: 13, color: C.text }}>{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
