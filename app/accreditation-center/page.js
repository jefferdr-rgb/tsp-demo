"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A",
};

// COA Standards with realistic Kings Home readiness data
const STANDARDS = [
  {
    code: "GOV", name: "Governance", icon: "🏛️",
    ready: 14, total: 18, status: "on-track",
    criteria: [
      { id: "GOV 1", name: "Board Structure & Composition", status: "met", evidence: 3 },
      { id: "GOV 2", name: "Board Responsibilities & Oversight", status: "met", evidence: 4 },
      { id: "GOV 3", name: "Strategic Planning", status: "met", evidence: 2 },
      { id: "GOV 4", name: "Organizational Structure", status: "met", evidence: 2 },
      { id: "GOV 5", name: "Conflict of Interest Policies", status: "met", evidence: 3 },
      { id: "GOV 6", name: "DEI Infrastructure", status: "gap", evidence: 0, note: "Policy drafted but not board-approved" },
      { id: "GOV 7", name: "CEO Evaluation", status: "met", evidence: 2 },
      { id: "GOV 8", name: "Stakeholder Input", status: "gap", evidence: 1, note: "Need documented family feedback process" },
    ],
  },
  {
    code: "HR", name: "Human Resources", icon: "👥",
    ready: 20, total: 24, status: "on-track",
    criteria: [
      { id: "HR 1", name: "Recruitment & Selection", status: "met", evidence: 4 },
      { id: "HR 2", name: "Background Checks", status: "met", evidence: 5 },
      { id: "HR 3", name: "Staff Qualifications", status: "met", evidence: 3 },
      { id: "HR 4", name: "Orientation & Training", status: "met", evidence: 4 },
      { id: "HR 5", name: "Supervision", status: "gap", evidence: 1, note: "Supervision logs incomplete for 3 staff" },
      { id: "HR 6", name: "Performance Evaluation", status: "met", evidence: 3 },
      { id: "HR 7", name: "Personnel Records", status: "met", evidence: 2 },
      { id: "HR 8", name: "Trauma-Informed Staff Support", status: "gap", evidence: 0, note: "Need documented secondary trauma prevention program" },
    ],
  },
  {
    code: "FIN", name: "Financial Management", icon: "💰",
    ready: 10, total: 12, status: "on-track",
    criteria: [
      { id: "FIN 1", name: "Budgeting Process", status: "met", evidence: 3 },
      { id: "FIN 2", name: "Financial Controls", status: "met", evidence: 4 },
      { id: "FIN 3", name: "Audited Financial Statements", status: "met", evidence: 2 },
      { id: "FIN 4", name: "Insurance Coverage", status: "met", evidence: 2 },
      { id: "FIN 5", name: "Fee Practices & Funding", status: "gap", evidence: 1, note: "Grant compliance documentation needs consolidation" },
    ],
  },
  {
    code: "PQI", name: "Performance & Quality Improvement", icon: "📊",
    ready: 6, total: 16, status: "at-risk",
    criteria: [
      { id: "PQI 1", name: "PQI Plan", status: "met", evidence: 2 },
      { id: "PQI 2", name: "Data Collection System", status: "gap", evidence: 1, note: "Data collected but not systematically — mostly in spreadsheets" },
      { id: "PQI 3", name: "Outcome Measurement", status: "gap", evidence: 0, note: "No formal logic model or outcome framework" },
      { id: "PQI 4", name: "Case Record Reviews", status: "met", evidence: 2 },
      { id: "PQI 5", name: "Stakeholder Satisfaction", status: "gap", evidence: 0, note: "No systematic satisfaction survey process" },
      { id: "PQI 6", name: "Quality Improvement Cycles", status: "gap", evidence: 0, note: "No documented PDCA/improvement cycles" },
      { id: "PQI 7", name: "Data-Driven Decision Making", status: "gap", evidence: 0, note: "Decisions made but not documented with data support" },
      { id: "PQI 8", name: "Annual PQI Report", status: "gap", evidence: 1, note: "Last report was 2 years ago" },
    ],
  },
  {
    code: "RPM", name: "Risk Prevention & Management", icon: "⚠️",
    ready: 11, total: 14, status: "on-track",
    criteria: [
      { id: "RPM 1", name: "Emergency Preparedness", status: "met", evidence: 4 },
      { id: "RPM 2", name: "Incident Reporting System", status: "met", evidence: 3 },
      { id: "RPM 3", name: "Safety Protocols", status: "met", evidence: 3 },
      { id: "RPM 4", name: "Critical Incident Review", status: "gap", evidence: 1, note: "Reviews happen but documentation is informal" },
      { id: "RPM 5", name: "Environmental Safety", status: "met", evidence: 2 },
      { id: "RPM 6", name: "Medication Management", status: "gap", evidence: 1, note: "Policies exist but last audit was 14 months ago" },
    ],
  },
  {
    code: "RTX", name: "Residential Treatment", icon: "🏠",
    ready: 12, total: 20, status: "needs-work",
    criteria: [
      { id: "RTX 1", name: "Trauma-Informed Treatment Model", status: "met", evidence: 3 },
      { id: "RTX 2", name: "Individualized Service Plans", status: "met", evidence: 2 },
      { id: "RTX 3", name: "Family Engagement", status: "gap", evidence: 1, note: "Engagement happens but not systematically documented" },
      { id: "RTX 4", name: "Noncoercive Environment", status: "met", evidence: 3 },
      { id: "RTX 5", name: "Restraint Reduction", status: "met", evidence: 4 },
      { id: "RTX 6", name: "Discharge Planning", status: "gap", evidence: 1, note: "Plans exist but aftercare follow-up not tracked" },
      { id: "RTX 7", name: "Youth Skill Development", status: "met", evidence: 2 },
      { id: "RTX 8", name: "Education Support", status: "gap", evidence: 0, note: "No documented education partnership agreements" },
      { id: "RTX 9", name: "Health & Wellness", status: "met", evidence: 2 },
      { id: "RTX 10", name: "Transition & Aftercare", status: "gap", evidence: 0, note: "No formal aftercare tracking system" },
    ],
  },
];

function pct(ready, total) { return Math.round((ready / total) * 100); }

export default function AccreditationCenterPage() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all"); // all | gap | met

  const totalReady = STANDARDS.reduce((s, d) => s + d.ready, 0);
  const totalCriteria = STANDARDS.reduce((s, d) => s + d.total, 0);
  const overallPct = pct(totalReady, totalCriteria);
  const totalGaps = STANDARDS.reduce((s, d) => s + d.criteria.filter(c => c.status === "gap").length, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Accreditation Command Center</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(196,155,42,0.15)", color: C.gold, fontSize: 11, fontWeight: 700 }}>COA / Social Current</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Overall readiness */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Overall Accreditation Readiness</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: overallPct > 80 ? C.green : overallPct > 60 ? C.orange : C.red, lineHeight: 1 }}>{overallPct}%</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginTop: 8 }}>{totalReady} of {totalCriteria} criteria met &middot; <span style={{ color: C.red, fontWeight: 600 }}>{totalGaps} gaps to close</span></div>
          <div style={{ width: "100%", maxWidth: 500, height: 10, borderRadius: 5, background: C.borderLight, margin: "16px auto 0" }}>
            <div style={{ width: `${overallPct}%`, height: "100%", borderRadius: 5, background: overallPct > 80 ? C.green : overallPct > 60 ? C.orange : C.red, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Standard cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {STANDARDS.map(std => {
            const p = pct(std.ready, std.total);
            const gaps = std.criteria.filter(c => c.status === "gap").length;
            return (
              <div key={std.code} onClick={() => setExpanded(expanded === std.code ? null : std.code)}
                style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${expanded === std.code ? C.accent : C.border}`, padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{std.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{std.code}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{std.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: p > 80 ? C.green : p > 60 ? C.orange : C.red }}>{p}%</div>
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.borderLight }}>
                  <div style={{ width: `${p}%`, height: "100%", borderRadius: 3, background: p > 80 ? C.green : p > 60 ? C.orange : C.red }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
                  <span style={{ color: C.textMuted }}>{std.ready}/{std.total} criteria</span>
                  {gaps > 0 && <span style={{ color: C.red, fontWeight: 600 }}>{gaps} gap{gaps > 1 ? "s" : ""}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded detail */}
        {expanded && (() => {
          const std = STANDARDS.find(s => s.code === expanded);
          if (!std) return null;
          const filtered = filter === "all" ? std.criteria : std.criteria.filter(c => c.status === filter);
          return (
            <div style={{ background: C.surface, borderRadius: 14, border: `1.5px solid ${C.accent}`, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{std.icon} {std.code} — {std.name}</h2>
                <div style={{ display: "flex", gap: 4 }}>
                  {["all", "gap", "met"].map(f => (
                    <button key={f} onClick={e => { e.stopPropagation(); setFilter(f); }}
                      style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${filter === f ? C.accent : C.border}`, background: filter === f ? C.accentLight : "transparent", color: filter === f ? C.accent : C.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                      {f === "all" ? "All" : f === "gap" ? "Gaps Only" : "Met"}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.map(cr => (
                <div key={cr.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                    background: cr.status === "met" ? "rgba(34,197,94,0.1)" : "rgba(197,48,48,0.1)",
                    color: cr.status === "met" ? C.green : C.red, fontSize: 14, fontWeight: 700,
                  }}>
                    {cr.status === "met" ? "\u2713" : "!"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{cr.id}: {cr.name}</div>
                    {cr.note && <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{cr.note}</div>}
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{cr.evidence} evidence document{cr.evidence !== 1 ? "s" : ""} uploaded</div>
                  </div>
                  {cr.status === "gap" && (
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(197,48,48,0.08)", color: C.red, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>Action Needed</span>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Priority gaps summary */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.red }}>Priority Gaps — Close These First</h2>
          {STANDARDS.flatMap(std => std.criteria.filter(c => c.status === "gap").map(c => ({ ...c, stdCode: std.code, stdName: std.name }))).map((gap, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
              <span style={{ padding: "2px 8px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{gap.stdCode}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{gap.id}: {gap.name}</span>
                {gap.note && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{gap.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
