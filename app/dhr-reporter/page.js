"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

const COUNTIES = ["Jefferson", "Shelby", "Blount", "Tuscaloosa"];

const MONTHLY_DATA = {
  month: "March 2026",
  submissionDeadline: "2026-04-10",
  status: "in-progress",
  census: {
    youthStart: 84, admissions: 3, discharges: 1, youthEnd: 86,
    avgDaily: 85.2,
    byProgram: [
      { program: "Basic", count: 8, capacity: 8 },
      { program: "Moderate", count: 66, capacity: 68 },
      { program: "TLP", count: 11, capacity: 19 },
      { program: "DYS (Westover)", count: 1, capacity: 12 },
    ],
    byCottage: [
      { name: "Oak Hill", campus: "Chelsea", count: 7, capacity: 8 },
      { name: "Cedar Ridge", campus: "Chelsea", count: 8, capacity: 8 },
      { name: "Maple House", campus: "Chelsea", count: 8, capacity: 8 },
      { name: "Willow Bend", campus: "Chelsea", count: 7, capacity: 8 },
      { name: "Pine Lodge", campus: "Chelsea", count: 8, capacity: 8 },
      { name: "Birch Hall", campus: "Chelsea", count: 8, capacity: 8 },
      { name: "Elm Cottage", campus: "Chelsea", count: 6, capacity: 8 },
      { name: "Jane's House", campus: "Chelsea", count: 5, capacity: 8 },
      { name: "Westover Home 1", campus: "Westover", count: 1, capacity: 8 },
    ],
    byCounty: [
      { county: "Jefferson", count: 38 },
      { county: "Shelby", count: 24 },
      { county: "Tuscaloosa", count: 14 },
      { county: "Blount", count: 6 },
      { county: "Other AL Counties", count: 4 },
    ],
  },
  incidents: {
    total: 7,
    byType: [
      { type: "Verbal Aggression", count: 3 },
      { type: "Physical Aggression (no injury)", count: 2 },
      { type: "Runaway Attempt", count: 1 },
      { type: "Property Damage", count: 1 },
    ],
    restraints: { total: 1, prone: 0, avgDuration: "4 minutes" },
  },
  disbursement: {
    totalDays: 2641,
    dailyRate: "$135.00",
    totalClaim: "$356,535.00",
    byCounty: [
      { county: "Jefferson", days: 1178, amount: "$159,030.00" },
      { county: "Shelby", days: 744, amount: "$100,440.00" },
      { county: "Tuscaloosa", days: 434, amount: "$58,590.00" },
      { county: "Blount", days: 186, amount: "$25,110.00" },
      { county: "Other", days: 99, amount: "$13,365.00" },
    ],
  },
  reportSections: [
    { name: "Monthly Census Report", status: "complete", auto: true },
    { name: "Incident Summary", status: "complete", auto: true },
    { name: "Restraint Report", status: "complete", auto: true },
    { name: "Disbursement Claim", status: "complete", auto: true },
    { name: "QRTP Status Updates", status: "complete", auto: true },
    { name: "Service Plan Reviews (due this month)", status: "in-progress", auto: false },
    { name: "Discharge Summaries", status: "in-progress", auto: false },
    { name: "Supervisor Sign-Off", status: "pending", auto: false },
  ],
};

export default function DHRReporterPage() {
  const [tab, setTab] = useState("overview"); // overview | census | incidents | financial

  const autoComplete = MONTHLY_DATA.reportSections.filter(s => s.status === "complete").length;
  const totalSections = MONTHLY_DATA.reportSections.length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>DHR Reporter</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>Alabama DHR Compliance</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{MONTHLY_DATA.month} — Monthly DHR Report</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Submission deadline: <span style={{ fontWeight: 600, color: C.orange }}>{MONTHLY_DATA.submissionDeadline}</span></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: autoComplete === totalSections ? C.green : C.orange }}>{autoComplete}/{totalSections}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Sections Ready</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {MONTHLY_DATA.reportSections.map((sec, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span style={{ fontSize: 14, color: sec.status === "complete" ? C.green : sec.status === "in-progress" ? C.orange : C.textMuted }}>
                  {sec.status === "complete" ? "\u2713" : sec.status === "in-progress" ? "\u2022" : "\u25CB"}
                </span>
                <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{sec.name}</span>
                {sec.auto && <span style={{ padding: "2px 6px", borderRadius: 4, background: C.accentLight, color: C.accent, fontSize: 10, fontWeight: 700 }}>Auto-Generated</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Generate Full Report
            </button>
            <button style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Export PDF
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { id: "overview", label: "Census" },
            { id: "incidents", label: "Incidents" },
            { id: "financial", label: "Disbursement" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: tab === t.id ? C.accent : "transparent", color: tab === t.id ? "#fff" : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            {/* Census summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Start of Month", value: MONTHLY_DATA.census.youthStart },
                { label: "Admissions", value: MONTHLY_DATA.census.admissions, color: C.green },
                { label: "Discharges", value: MONTHLY_DATA.census.discharges, color: C.orange },
                { label: "End of Month", value: MONTHLY_DATA.census.youthEnd },
              ].map((k, i) => (
                <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: k.color || C.text }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* By program */}
              <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>Census by Program</h3>
                {MONTHLY_DATA.census.byProgram.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{p.program}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{p.count}</span>
                    <span style={{ fontSize: 12, color: C.textMuted }}>/ {p.capacity}</span>
                  </div>
                ))}
              </div>

              {/* By county */}
              <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>Census by Referring County</h3>
                {MONTHLY_DATA.census.byCounty.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{c.county}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "incidents" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: C.text }}>Incidents This Month</h3>
              <div style={{ fontSize: 32, fontWeight: 800, color: MONTHLY_DATA.incidents.total <= 5 ? C.green : C.orange, margin: "8px 0" }}>{MONTHLY_DATA.incidents.total}</div>
              {MONTHLY_DATA.incidents.byType.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <span style={{ fontSize: 13, color: C.text }}>{t.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.count}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: C.text }}>Restraint Report</h3>
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <div style={{ padding: 14, borderRadius: 8, background: MONTHLY_DATA.incidents.restraints.total === 0 ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)", border: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>TOTAL RESTRAINTS</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: MONTHLY_DATA.incidents.restraints.total === 0 ? C.green : C.orange }}>{MONTHLY_DATA.incidents.restraints.total}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: "rgba(34,197,94,0.06)", border: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>PRONE RESTRAINTS</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.green }}>{MONTHLY_DATA.incidents.restraints.prone}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, border: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>AVG DURATION</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{MONTHLY_DATA.incidents.restraints.avgDuration}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "financial" && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Monthly Disbursement Claim</h3>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.green }}>{MONTHLY_DATA.disbursement.totalClaim}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{MONTHLY_DATA.disbursement.totalDays} resident-days @ {MONTHLY_DATA.disbursement.dailyRate}/day</div>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: `2px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.textMuted }}>County</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: `2px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.textMuted }}>Resident-Days</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: `2px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.textMuted }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY_DATA.disbursement.byCounty.map((c, i) => (
                  <tr key={i}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 14, fontWeight: 600, color: C.text }}>{c.county}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 14, color: C.text, textAlign: "right" }}>{c.days.toLocaleString()}</td>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 14, fontWeight: 700, color: C.green, textAlign: "right" }}>{c.amount}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: "12px", fontSize: 14, fontWeight: 800, color: C.text }}>TOTAL</td>
                  <td style={{ padding: "12px", fontSize: 14, fontWeight: 800, color: C.text, textAlign: "right" }}>{MONTHLY_DATA.disbursement.totalDays.toLocaleString()}</td>
                  <td style={{ padding: "12px", fontSize: 14, fontWeight: 800, color: C.green, textAlign: "right" }}>{MONTHLY_DATA.disbursement.totalClaim}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
