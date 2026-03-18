"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#0D1B2A", accent: "#1B4D8F",
  red: "#C4352A", green: "#22c55e", orange: "#F59E0B", border: "#d6d1c4",
  borderLight: "#e8e3d9", text: "#1a2332", textMuted: "#5a6678", gold: "#c49b2a",
};

// Demo fleet data — customer-facing portal view
const FLEET_CUSTOMERS = [
  {
    name: "Southeastern Freight Lines", trucks: 12, avgUptime: 94.2,
    vehicles: [
      { unit: "SEF-1042", model: "2023 International LT 625", miles: 187400, health: 92, nextPM: "Mar 25, 2026", nextPMType: "B Service", dotInspection: "Apr 10, 2026", status: "active", alerts: [] },
      { unit: "SEF-1043", model: "2022 International LT 625", miles: 241000, health: 78, nextPM: "Mar 19, 2026", nextPMType: "A Service", dotInspection: "Mar 30, 2026", status: "pm-due", alerts: ["PM overdue by 1 day", "DOT annual inspection in 12 days"] },
      { unit: "SEF-1088", model: "2024 International HV 507", miles: 52300, health: 97, nextPM: "Apr 15, 2026", nextPMType: "A Service", dotInspection: "Sep 2, 2026", status: "active", alerts: [] },
      { unit: "SEF-1091", model: "2021 International LT 625", miles: 312000, health: 61, nextPM: "In Shop", nextPMType: "DPF Regen + Turbo Inspect", dotInspection: "May 1, 2026", status: "in-shop", alerts: ["In shop — Knoxville. ETA: Mar 20"] },
    ],
  },
  {
    name: "Tennessee Valley Concrete", trucks: 6, avgUptime: 88.5,
    vehicles: [
      { unit: "TVC-301", model: "2023 International HV 507", miles: 94200, health: 85, nextPM: "Mar 28, 2026", nextPMType: "A Service", dotInspection: "Jun 15, 2026", status: "active", alerts: [] },
      { unit: "TVC-305", model: "2024 International HX 520", miles: 41000, health: 95, nextPM: "Apr 20, 2026", nextPMType: "A Service", dotInspection: "Aug 1, 2026", status: "active", alerts: [] },
      { unit: "TVC-308", model: "2022 International HV 507", miles: 168000, health: 72, nextPM: "Mar 22, 2026", nextPMType: "C Service", dotInspection: "Apr 5, 2026", status: "pm-due", alerts: ["DOT annual inspection in 18 days — book now"] },
    ],
  },
];

function HealthBadge({ health }) {
  const color = health > 85 ? C.green : health > 70 ? C.orange : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 40, height: 6, borderRadius: 3, background: C.borderLight }}>
        <div style={{ width: `${health}%`, height: "100%", borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{health}%</span>
    </div>
  );
}

function StatusDot({ status }) {
  const map = { active: { color: C.green, label: "Active" }, "pm-due": { color: C.orange, label: "PM Due" }, "in-shop": { color: C.red, label: "In Shop" } };
  const s = map[status] || map.active;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: s.color }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

export default function FleetUptimePage() {
  const [selectedCustomer, setSelectedCustomer] = useState(FLEET_CUSTOMERS[0]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/thompson-distribution" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Fleet Uptime Advisor</h1>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Customer selector */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {FLEET_CUSTOMERS.map(c => (
            <button key={c.name} onClick={() => setSelectedCustomer(c)}
              style={{
                padding: "14px 20px", borderRadius: 10, border: `1.5px solid ${selectedCustomer.name === c.name ? C.accent : C.border}`,
                background: selectedCustomer.name === c.name ? "rgba(27,77,143,0.06)" : C.surface, cursor: "pointer", textAlign: "left", minWidth: 220,
              }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                {c.trucks} trucks &middot; {c.avgUptime}% uptime
              </div>
            </button>
          ))}
        </div>

        {/* Fleet summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Fleet Uptime", value: selectedCustomer.avgUptime + "%", color: selectedCustomer.avgUptime > 90 ? C.green : C.orange },
            { label: "Active", value: selectedCustomer.vehicles.filter(v => v.status === "active").length, color: C.green },
            { label: "PM Due", value: selectedCustomer.vehicles.filter(v => v.status === "pm-due").length, color: C.orange },
            { label: "In Shop", value: selectedCustomer.vehicles.filter(v => v.status === "in-shop").length, color: C.red },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Vehicle cards */}
        {selectedCustomer.vehicles.map(v => (
          <div key={v.unit} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${v.alerts.length > 0 ? C.orange : C.border}`, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{v.unit}</span>
                <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 10 }}>{v.model}</span>
              </div>
              <StatusDot status={v.status} />
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Health</div>
                <HealthBadge health={v.health} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Miles</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v.miles.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Next PM</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: v.status === "pm-due" ? C.orange : C.text }}>{v.nextPM}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{v.nextPMType}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted }}>DOT Inspection</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v.dotInspection}</div>
              </div>
            </div>
            {v.alerts.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {v.alerts.map((a, i) => (
                  <span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: C.orange }}>
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
