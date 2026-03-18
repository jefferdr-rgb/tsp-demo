"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

// PQI outcome areas with measurement data
const OUTCOME_AREAS = [
  {
    name: "Youth Permanency", metric: "% placed in permanent homes within 12 months",
    target: 75, current: 68, prior: 62, trend: "improving",
    dataPoints: [
      { month: "Oct", value: 62 }, { month: "Nov", value: 64 }, { month: "Dec", value: 63 },
      { month: "Jan", value: 66 }, { month: "Feb", value: 67 }, { month: "Mar", value: 68 },
    ],
  },
  {
    name: "Educational Achievement", metric: "% youth at or above grade level",
    target: 60, current: 52, prior: 48, trend: "improving",
    dataPoints: [
      { month: "Oct", value: 48 }, { month: "Nov", value: 49 }, { month: "Dec", value: 50 },
      { month: "Jan", value: 50 }, { month: "Feb", value: 51 }, { month: "Mar", value: 52 },
    ],
  },
  {
    name: "Behavioral Incidents", metric: "Critical incidents per 100 resident-days",
    target: 2.0, current: 2.8, prior: 3.4, trend: "improving", lowerBetter: true,
    dataPoints: [
      { month: "Oct", value: 3.4 }, { month: "Nov", value: 3.2 }, { month: "Dec", value: 3.1 },
      { month: "Jan", value: 3.0 }, { month: "Feb", value: 2.9 }, { month: "Mar", value: 2.8 },
    ],
  },
  {
    name: "Staff Retention", metric: "Annual retention rate — direct care staff",
    target: 80, current: 72, prior: 65, trend: "improving",
    dataPoints: [
      { month: "Oct", value: 65 }, { month: "Nov", value: 66 }, { month: "Dec", value: 68 },
      { month: "Jan", value: 69 }, { month: "Feb", value: 71 }, { month: "Mar", value: 72 },
    ],
  },
  {
    name: "Family Engagement", metric: "% families with monthly contact documented",
    target: 90, current: 61, prior: 55, trend: "improving",
    dataPoints: [
      { month: "Oct", value: 55 }, { month: "Nov", value: 56 }, { month: "Dec", value: 58 },
      { month: "Jan", value: 59 }, { month: "Feb", value: 60 }, { month: "Mar", value: 61 },
    ],
  },
  {
    name: "Stakeholder Satisfaction", metric: "Overall satisfaction score (staff + families)",
    target: 85, current: 0, prior: 0, trend: "no-data",
    dataPoints: [],
  },
];

// Improvement cycles (PDCA)
const IMPROVEMENT_CYCLES = [
  {
    id: 1, area: "Restraint Reduction", phase: "act", startDate: "Jan 2026",
    plan: "Implement de-escalation training refresh for all direct care staff",
    doWhat: "8-hour training completed by 14 of 18 staff. New de-escalation checklist posted in all cottages.",
    check: "Restraint incidents dropped 23% (Jan-Mar vs Oct-Dec). Zero prone restraints in February.",
    act: "Standardize checklist across all shifts. Add to new hire orientation. Next review: June 2026.",
  },
  {
    id: 2, area: "Documentation Timeliness", phase: "check", startDate: "Feb 2026",
    plan: "Reduce average service plan completion time from 14 days to 7 days after intake",
    doWhat: "Created service plan template in RHONDA. Auto-populates intake data. Assigned plan-writer role to senior counselors.",
    check: "Tracking in progress — current average is 9.2 days (down from 14). Need 2 more months of data.",
    act: "",
  },
  {
    id: 3, area: "Staff Supervision", phase: "do", startDate: "Mar 2026",
    plan: "Ensure 100% of direct care staff receive documented monthly supervision",
    doWhat: "Supervision log template created. Calendar reminders set for all supervisors. 3 of 6 supervisors logging consistently.",
    check: "",
    act: "",
  },
];

const PHASES = { plan: { label: "Plan", color: C.blue }, do: { label: "Do", color: C.orange }, check: { label: "Check", color: C.accent }, act: { label: "Act", color: C.green } };

function MiniChart({ dataPoints, target, lowerBetter }) {
  if (!dataPoints.length) return <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>No data collected yet</div>;
  const max = Math.max(target, ...dataPoints.map(d => d.value)) * 1.15;
  const h = 60, w = 200;
  const points = dataPoints.map((d, i) => `${(i / (dataPoints.length - 1)) * w},${h - (d.value / max) * h}`).join(" ");
  const targetY = h - (target / max) * h;
  return (
    <svg width={w} height={h + 16} style={{ overflow: "visible" }}>
      <line x1={0} y1={targetY} x2={w} y2={targetY} stroke={C.accent} strokeWidth={1} strokeDasharray="4,3" />
      <text x={w + 4} y={targetY + 4} fontSize={9} fill={C.accent}>Target</text>
      <polyline points={points} fill="none" stroke={C.gold} strokeWidth={2} />
      {dataPoints.map((d, i) => (
        <g key={i}>
          <circle cx={(i / (dataPoints.length - 1)) * w} cy={h - (d.value / max) * h} r={3} fill={C.gold} />
          <text x={(i / (dataPoints.length - 1)) * w} y={h + 12} fontSize={8} fill={C.textMuted} textAnchor="middle">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

export default function PQIDashboardPage() {
  const [view, setView] = useState("outcomes"); // outcomes | cycles | report

  const metTarget = OUTCOME_AREAS.filter(o => !o.lowerBetter ? o.current >= o.target : o.current <= o.target).length;
  const noData = OUTCOME_AREAS.filter(o => o.trend === "no-data").length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>PQI Dashboard</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(46,125,111,0.15)", color: "#7BCDB8", fontSize: 11, fontWeight: 700 }}>Performance & Quality Improvement</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Outcomes Tracked", value: OUTCOME_AREAS.length, color: C.accent },
            { label: "Meeting Target", value: metTarget, color: metTarget > 3 ? C.green : C.orange },
            { label: "Active Improvement Cycles", value: IMPROVEMENT_CYCLES.length, color: C.blue },
            { label: "Needing Data", value: noData, color: noData > 0 ? C.red : C.green },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { id: "outcomes", label: "Outcome Tracking" },
            { id: "cycles", label: "Improvement Cycles (PDCA)" },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: view === t.id ? C.accent : "transparent", color: view === t.id ? "#fff" : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Outcomes */}
        {view === "outcomes" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {OUTCOME_AREAS.map((o, i) => {
              const onTrack = o.trend === "no-data" ? false : !o.lowerBetter ? o.current >= o.target : o.current <= o.target;
              const improving = o.trend === "improving";
              return (
                <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${o.trend === "no-data" ? C.red : C.border}`, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{o.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{o.metric}</div>
                    </div>
                    {o.trend !== "no-data" ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: onTrack ? C.green : improving ? C.orange : C.red }}>
                          {o.current}{typeof o.target === "number" && o.target > 10 ? "%" : ""}
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Target: {o.target}{typeof o.target === "number" && o.target > 10 ? "%" : ""}</div>
                      </div>
                    ) : (
                      <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(197,48,48,0.08)", color: C.red, fontSize: 11, fontWeight: 600 }}>No Data</span>
                    )}
                  </div>
                  <MiniChart dataPoints={o.dataPoints} target={o.target} lowerBetter={o.lowerBetter} />
                  {o.trend !== "no-data" && (
                    <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 12 }}>
                      <span style={{ color: improving ? C.green : C.red }}>
                        {improving ? "\u2191" : "\u2193"} {o.lowerBetter
                          ? (o.prior - o.current).toFixed(1)
                          : (o.current - o.prior)} from prior period
                      </span>
                      <span style={{ color: onTrack ? C.green : C.orange, fontWeight: 600 }}>{onTrack ? "On Target" : "Below Target"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Improvement Cycles */}
        {view === "cycles" && (
          <div>
            {IMPROVEMENT_CYCLES.map(cycle => (
              <div key={cycle.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{cycle.area}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>Started {cycle.startDate}</div>
                  </div>
                  <span style={{ padding: "5px 14px", borderRadius: 8, background: PHASES[cycle.phase].color, color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    {PHASES[cycle.phase].label} Phase
                  </span>
                </div>
                {/* PDCA steps */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {["plan", "do", "check", "act"].map(phase => {
                    const content = cycle[phase === "do" ? "doWhat" : phase];
                    const isActive = phase === cycle.phase;
                    const isPast = ["plan", "do", "check", "act"].indexOf(phase) < ["plan", "do", "check", "act"].indexOf(cycle.phase);
                    return (
                      <div key={phase} style={{
                        padding: 14, borderRadius: 8,
                        border: `1.5px solid ${isActive ? PHASES[phase].color : isPast ? "rgba(34,197,94,0.3)" : C.borderLight}`,
                        background: isActive ? `${PHASES[phase].color}08` : "transparent",
                        opacity: !content && !isActive ? 0.5 : 1,
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: PHASES[phase].color, textTransform: "uppercase", marginBottom: 6 }}>{PHASES[phase].label}</div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                          {content || <span style={{ color: C.textMuted, fontStyle: "italic" }}>Pending</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
