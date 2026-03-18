"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

// Women & Children program — tracking each family's journey from crisis to independence
const FAMILIES = [
  {
    id: "WC-2026-041", name: "Maria R.", children: 2, childAges: [4, 7],
    cottage: "Bethany House 3", admitDate: "2025-10-15", daysInProgram: 154,
    phase: "stabilization", // crisis → stabilization → growth → transition → independent
    milestones: [
      { area: "Housing", goal: "Secure stable long-term housing", status: "in-progress", progress: 30, notes: "Waitlisted for Section 8. Exploring rapid re-housing options." },
      { area: "Employment", goal: "Obtain employment (20+ hrs/week)", status: "in-progress", progress: 45, notes: "Completed Goodwill job training program. Two interviews scheduled this week." },
      { area: "Education", goal: "Enroll in GED program", status: "met", progress: 100, notes: "Enrolled at Jefferson State. Attending evening classes 3x/week." },
      { area: "Counseling", goal: "Complete 12 individual counseling sessions", status: "in-progress", progress: 67, notes: "8 of 12 sessions completed. Processing trauma, building coping strategies." },
      { area: "Legal", goal: "Obtain protective order and file for divorce", status: "met", progress: 100, notes: "Protective order granted Dec 2025. Divorce filing completed with Legal Aid." },
      { area: "Parenting", goal: "Complete parenting skills course", status: "in-progress", progress: 50, notes: "6 of 12 sessions attended. Strong participation." },
      { area: "Financial", goal: "Open savings account and begin budgeting", status: "met", progress: 100, notes: "Account opened. $340 saved to date. Budgets weekly with financial coach." },
    ],
    childProgress: [
      { age: 7, name: "Child 1", notes: "Enrolled in 2nd grade at local school. Counseling weekly — processing anger. Grades improving." },
      { age: 4, name: "Child 2", notes: "In Kings Home childcare during mom's programming. Speech therapy referral in progress." },
    ],
    recentNotes: [
      { date: "Mar 17", note: "Maria had a strong week. Job interviews at Dollar General and a local restaurant. Practiced interview skills in group." },
      { date: "Mar 12", note: "Child 1 had a rough day at school — got in a fight. Maria handled it calmly, used techniques from parenting class." },
      { date: "Mar 5", note: "Maria passed her first GED practice test in math. Cried happy tears. Big milestone." },
    ],
  },
  {
    id: "WC-2026-038", name: "Keisha W.", children: 3, childAges: [2, 5, 8],
    cottage: "Hannah Home 2", admitDate: "2025-09-01", daysInProgram: 198,
    phase: "growth",
    milestones: [
      { area: "Housing", goal: "Secure stable long-term housing", status: "in-progress", progress: 60, notes: "Approved for rapid re-housing voucher. Apartment search active." },
      { area: "Employment", goal: "Obtain full-time employment", status: "met", progress: 100, notes: "Hired at UAB hospital cafeteria — full-time, benefits eligible after 90 days." },
      { area: "Education", goal: "Obtain GED", status: "met", progress: 100, notes: "GED completed January 2026! Exploring CNA program next." },
      { area: "Counseling", goal: "Complete trauma recovery program", status: "in-progress", progress: 75, notes: "9 of 12 sessions complete. Therapist notes significant progress." },
      { area: "Legal", goal: "Finalize custody arrangement", status: "in-progress", progress: 40, notes: "Attorney working on permanent custody modification. Court date pending." },
      { area: "Childcare", goal: "Arrange stable childcare for transition", status: "in-progress", progress: 50, notes: "Oldest enrolled in after-school program. DHR childcare subsidy approved for younger two." },
      { area: "Transportation", goal: "Obtain reliable transportation", status: "met", progress: 100, notes: "Donated vehicle through partner church. License current." },
    ],
    childProgress: [
      { age: 8, name: "Child 1", notes: "3rd grade, reading at grade level. Art therapy helping with anxiety. After-school program going well." },
      { age: 5, name: "Child 2", notes: "Started Head Start this month. Adjusting well. No behavioral concerns." },
      { age: 2, name: "Child 3", notes: "Meeting developmental milestones. In Kings Home childcare during work hours." },
    ],
    recentNotes: [
      { date: "Mar 16", note: "Keisha started apartment viewings this weekend. Found two strong options near her work." },
      { date: "Mar 10", note: "90-day employment milestone! Keisha celebrated by taking kids to the park." },
      { date: "Mar 3", note: "Keisha is mentoring newer residents informally. Great leadership emerging." },
    ],
  },
  {
    id: "WC-2025-029", name: "Ashley D.", children: 2, childAges: [6, 9],
    cottage: "Hannah Home 1", admitDate: "2025-06-10", daysInProgram: 281,
    phase: "transition",
    milestones: [
      { area: "Housing", goal: "Secure independent housing", status: "met", progress: 100, notes: "Apartment secured through Habitat for Humanity partnership. Move-in date: April 1." },
      { area: "Employment", goal: "Maintain full-time employment 6+ months", status: "met", progress: 100, notes: "Administrative assistant at a law firm. 7 months continuous. Strong performance reviews." },
      { area: "Education", goal: "Begin college or vocational program", status: "in-progress", progress: 30, notes: "Accepted to Jeff State paralegal program. Starting fall 2026." },
      { area: "Counseling", goal: "Complete counseling and transition to community provider", status: "met", progress: 100, notes: "Kings Home counseling complete. Outpatient therapist identified and first appointment set." },
      { area: "Financial", goal: "Build 3-month emergency fund", status: "in-progress", progress: 80, notes: "$2,400 of $3,000 goal saved. On track for April." },
      { area: "Support Network", goal: "Establish community connections", status: "met", progress: 100, notes: "Active in church small group. Kids in scouts and soccer. Strong neighborhood connections." },
    ],
    childProgress: [
      { age: 9, name: "Child 1", notes: "4th grade honor roll. Thriving. Wants to be a veterinarian." },
      { age: 6, name: "Child 2", notes: "1st grade. Happy and social. No longer wetting the bed (resolved after 3 months of counseling)." },
    ],
    recentNotes: [
      { date: "Mar 15", note: "Transition planning meeting completed. Ashley is READY. Move-in April 1. This is a success story." },
      { date: "Mar 8", note: "Ashley wrote a letter to Kings Home staff thanking them. Read it at house meeting — not a dry eye." },
    ],
  },
];

const PHASE_CONFIG = {
  crisis: { label: "Crisis", color: C.red, step: 1 },
  stabilization: { label: "Stabilization", color: C.orange, step: 2 },
  growth: { label: "Growth", color: C.accent, step: 3 },
  transition: { label: "Transition", color: C.purple, step: 4 },
  independent: { label: "Independent", color: C.green, step: 5 },
};

export default function ProgressTrackerPage() {
  const [selectedFamily, setSelectedFamily] = useState(FAMILIES[0].id);
  const family = FAMILIES.find(f => f.id === selectedFamily);
  const phase = family ? PHASE_CONFIG[family.phase] : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Progress Tracker</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(124,58,237,0.15)", color: "#C4B5FD", fontSize: 11, fontWeight: 700 }}>Women & Children</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Family selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {FAMILIES.map(f => {
            const ph = PHASE_CONFIG[f.phase];
            const metCount = f.milestones.filter(m => m.status === "met").length;
            const overallPct = Math.round(f.milestones.reduce((s, m) => s + m.progress, 0) / f.milestones.length);
            return (
              <div key={f.id} onClick={() => setSelectedFamily(f.id)}
                style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${selectedFamily === f.id ? C.accent : C.border}`, padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{f.name}</span>
                  <span style={{ padding: "3px 10px", borderRadius: 6, background: ph.color + "15", color: ph.color, fontSize: 11, fontWeight: 600 }}>{ph.label}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{f.children} children &middot; {f.cottage} &middot; Day {f.daysInProgram}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: C.borderLight }}>
                    <div style={{ width: `${overallPct}%`, height: "100%", borderRadius: 3, background: ph.color }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ph.color }}>{overallPct}%</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{metCount}/{f.milestones.length} milestones met</div>
              </div>
            );
          })}
        </div>

        {family && (
          <>
            {/* Phase journey */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {Object.entries(PHASE_CONFIG).map(([key, ph], i) => {
                  const isActive = key === family.phase;
                  const isPast = ph.step < phase.step;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                          background: isActive ? ph.color : isPast ? C.green : C.borderLight,
                          color: isActive || isPast ? "#fff" : C.textMuted, fontSize: 14, fontWeight: 700,
                        }}>
                          {isPast ? "\u2713" : ph.step}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? ph.color : C.textMuted, marginTop: 6 }}>{ph.label}</div>
                      </div>
                      {i < 4 && <div style={{ height: 2, flex: 1, background: isPast ? C.green : C.borderLight, margin: "0 -8px", marginBottom: 20 }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Milestones — {family.name}</h3>
              {family.milestones.map((m, i) => (
                <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 700 }}>{m.area}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{m.goal}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.status === "met" ? C.green : C.accent }}>{m.status === "met" ? "Met" : `${m.progress}%`}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: C.borderLight }}>
                      <div style={{ width: `${m.progress}%`, height: "100%", borderRadius: 3, background: m.status === "met" ? C.green : C.accent }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{m.notes}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Children */}
              <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>Children's Progress</h3>
                {family.childProgress.map((child, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Age {child.age}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{child.notes}</div>
                  </div>
                ))}
              </div>

              {/* Recent notes */}
              <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>Recent Notes</h3>
                {family.recentNotes.map((n, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 4 }}>{n.date}</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{n.note}</div>
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
