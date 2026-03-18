"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
  purple: "#7C3AED",
};

const DISCHARGE_CASES = [
  {
    id: "DC-2026-008", initials: "AJ", age: 16, cottage: "Cedar Ridge",
    admitDate: "2025-07-15", targetDischarge: "2026-04-15", daysToDischarge: 28,
    permanencyGoal: "Therapeutic Foster Care",
    placement: { type: "TFC Family", name: "Brian & Michelle Thompson", location: "Shelby County", status: "confirmed" },
    checklist: [
      { item: "Treatment goals met", status: "complete", date: "2026-03-01" },
      { item: "TFC family identified and approved", status: "complete", date: "2026-02-15" },
      { item: "Weekend visits completed (minimum 3)", status: "complete", date: "2026-03-10", note: "6 visits + 2 extended stays completed" },
      { item: "School enrollment transfer initiated", status: "in-progress", date: null, note: "Transfer paperwork submitted to new district" },
      { item: "Outpatient therapist identified", status: "complete", date: "2026-03-05", note: "Dr. Sarah Chen — accepts Medicaid" },
      { item: "Medication transfer arranged", status: "in-progress", date: null, note: "Psychiatrist referral sent, waiting for appointment" },
      { item: "Court approval for placement change", status: "pending", date: null, note: "Hearing scheduled 2026-03-28" },
      { item: "QRTP aftercare plan filed", status: "pending", date: null },
      { item: "Personal belongings inventory", status: "pending", date: null },
      { item: "Goodbye ceremony planned", status: "pending", date: null },
    ],
    aftercare: {
      plan: "6-month QRTP aftercare monitoring per Family First Act requirements",
      contacts: [
        { month: 1, date: "2026-05-15", type: "Home visit", status: "scheduled" },
        { month: 2, date: "2026-06-15", type: "Phone check-in", status: "scheduled" },
        { month: 3, date: "2026-07-15", type: "Home visit", status: "scheduled" },
        { month: 4, date: "2026-08-15", type: "Phone check-in", status: "not-scheduled" },
        { month: 5, date: "2026-09-15", type: "Home visit", status: "not-scheduled" },
        { month: 6, date: "2026-10-15", type: "Final review", status: "not-scheduled" },
      ],
    },
  },
  {
    id: "DC-2026-011", initials: "PL", age: 19, cottage: "Elm Cottage",
    admitDate: "2025-02-10", targetDischarge: "2026-05-01", daysToDischarge: 44,
    permanencyGoal: "Independent Living",
    placement: { type: "Apartment", name: "Riverwalk Apartments, Pelham", location: "Shelby County", status: "application-submitted" },
    checklist: [
      { item: "Independent living skills assessment passed", status: "complete", date: "2026-02-20" },
      { item: "Employment verified (30+ hrs/week for 90+ days)", status: "complete", date: "2026-03-10", note: "Auto shop — full-time, excellent reviews" },
      { item: "Savings goal met ($1,500 minimum)", status: "complete", date: "2026-03-01", note: "$2,100 saved" },
      { item: "Apartment identified and application submitted", status: "in-progress", date: null, note: "Application submitted March 14, awaiting approval" },
      { item: "Budget plan reviewed and approved", status: "complete", date: "2026-03-08" },
      { item: "Community support network documented", status: "in-progress", date: null, note: "Church connection established, need to identify backup contacts" },
      { item: "Healthcare transition (Medicaid continuation)", status: "pending", date: null },
      { item: "QRTP aftercare plan filed", status: "pending", date: null },
      { item: "Life skills final assessment", status: "pending", date: null },
    ],
    aftercare: {
      plan: "6-month aftercare with decreasing contact frequency — monthly for 3 months, then quarterly",
      contacts: [
        { month: 1, date: "2026-06-01", type: "Home visit", status: "not-scheduled" },
        { month: 2, date: "2026-07-01", type: "Phone check-in", status: "not-scheduled" },
        { month: 3, date: "2026-08-01", type: "Home visit", status: "not-scheduled" },
        { month: 6, date: "2026-11-01", type: "Final review", status: "not-scheduled" },
      ],
    },
  },
];

export default function DischargePlannerPage() {
  const [selectedCase, setSelectedCase] = useState(DISCHARGE_CASES[0].id);
  const dc = DISCHARGE_CASES.find(c => c.id === selectedCase);

  const completePct = dc ? Math.round((dc.checklist.filter(c => c.status === "complete").length / dc.checklist.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Discharge Planner</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(124,58,237,0.15)", color: "#C4B5FD", fontSize: 11, fontWeight: 700 }}>Transition & Aftercare</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Case selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {DISCHARGE_CASES.map(c => (
            <div key={c.id} onClick={() => setSelectedCase(c.id)}
              style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${selectedCase === c.id ? C.accent : C.border}`, padding: 20, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{c.initials}</span>
                  <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 8 }}>Age {c.age} &middot; {c.cottage}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: c.daysToDischarge <= 14 ? C.red : c.daysToDischarge <= 30 ? C.orange : C.accent }}>
                  {c.daysToDischarge}d
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.permanencyGoal}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Target: {c.targetDischarge} &middot; {c.placement.type}</div>
            </div>
          ))}
        </div>

        {dc && (
          <>
            {/* Overview */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{dc.initials} — Discharge Plan</h2>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Goal: {dc.permanencyGoal} &middot; Target: {dc.targetDischarge} &middot; {dc.daysToDischarge} days remaining</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: completePct >= 80 ? C.green : completePct >= 50 ? C.orange : C.red }}>{completePct}%</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Checklist Complete</div>
                </div>
              </div>
              <div style={{ padding: 16, background: C.accentLight, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6 }}>PLACEMENT</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{dc.placement.name}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>{dc.placement.type} &middot; {dc.placement.location} &middot; Status: <span style={{ fontWeight: 600, color: dc.placement.status === "confirmed" ? C.green : C.orange }}>{dc.placement.status.replace("-", " ")}</span></div>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Discharge Checklist</h3>
              {dc.checklist.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                    background: item.status === "complete" ? "rgba(34,197,94,0.1)" : item.status === "in-progress" ? "rgba(59,119,187,0.1)" : C.borderLight,
                    color: item.status === "complete" ? C.green : item.status === "in-progress" ? C.accent : C.textMuted,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {item.status === "complete" ? "\u2713" : item.status === "in-progress" ? "\u2022" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.item}</div>
                    {item.note && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{item.note}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: item.status === "complete" ? C.green : C.textMuted, flexShrink: 0 }}>
                    {item.date || (item.status === "pending" ? "Pending" : "In Progress")}
                  </div>
                </div>
              ))}
            </div>

            {/* Aftercare timeline */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: C.text }}>QRTP Aftercare Schedule</h3>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>{dc.aftercare.plan}</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${dc.aftercare.contacts.length}, 1fr)`, gap: 8 }}>
                {dc.aftercare.contacts.map((contact, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.borderLight}`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>Month {contact.month}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{contact.type}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{contact.date}</div>
                    <div style={{ fontSize: 10, marginTop: 4, fontWeight: 600, color: contact.status === "scheduled" ? C.green : C.textMuted }}>
                      {contact.status === "scheduled" ? "Scheduled" : "Not Yet Scheduled"}
                    </div>
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
