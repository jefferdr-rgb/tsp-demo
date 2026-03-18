"use client";
import { useState, useEffect } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#0D1B2A", accent: "#1B4D8F",
  accentLight: "rgba(27,77,143,0.12)", accentGlow: "rgba(27,77,143,0.25)",
  red: "#C4352A", green: "#22c55e", orange: "#F59E0B", border: "#d6d1c4",
  text: "#1a2332", textMuted: "#5a6678", gold: "#c49b2a",
};

// MTA Distributors demo data — 65K SKUs, Honda engines + 200 product lines
const PULSE_DATA = {
  date: "March 18, 2026",
  warehouses: [
    {
      name: "Nashville (HQ)", skus: 42800, fillRate: 96.2, ordersToday: 187,
      alerts: [
        { type: "stockout", text: "Honda GX390 engines — 0 in stock, 23 backorder. Next shipment: Mar 22", severity: "high" },
        { type: "velocity", text: "Multiquip generators up 340% WoW — Florida rental companies stocking for hurricane season", severity: "medium" },
      ],
      topMovers: [
        { sku: "GX200-QXE2", name: "Honda GX200 Engine", qty: 34, trend: "up" },
        { sku: "MVH-150GH", name: "Multiquip Plate Compactor", qty: 28, trend: "up" },
        { sku: "WT20X-T", name: "Honda Trash Pump", qty: 22, trend: "flat" },
      ],
    },
    {
      name: "Corona, CA", skus: 22200, fillRate: 93.8, ordersToday: 94,
      alerts: [
        { type: "velocity", text: "Wacker Neuson rammers spiking — 3 new rental companies onboarded in SoCal this month", severity: "medium" },
        { type: "seasonal", text: "Garden/landscape equipment orders 3 weeks ahead of normal — warm winter in Southwest", severity: "low" },
      ],
      topMovers: [
        { sku: "WN-BS60-4S", name: "Wacker Neuson Rammer", qty: 19, trend: "up" },
        { sku: "GX160-QH", name: "Honda GX160 Engine", qty: 17, trend: "flat" },
        { sku: "EB3000CK2A", name: "Honda Generator EB3000", qty: 15, trend: "up" },
      ],
    },
  ],
  ttgLocations: [
    { name: "Knoxville", techUtil: 87, openROs: 42, partsOnOrder: 18, todayAppts: 14 },
    { name: "Chattanooga", techUtil: 91, openROs: 38, partsOnOrder: 12, todayAppts: 11 },
    { name: "Morristown", techUtil: 78, openROs: 22, partsOnOrder: 8, todayAppts: 7 },
    { name: "Cookeville", techUtil: 82, openROs: 28, partsOnOrder: 14, todayAppts: 9 },
    { name: "Bristol", techUtil: 71, openROs: 19, partsOnOrder: 21, todayAppts: 6 },
  ],
  kpis: {
    mtaRevenueToday: 284600,
    ttgRevenueToday: 198400,
    avgTechUtil: 82,
    partsBackorder: 47,
    warrantyPending: 12,
  },
};

function formatCurrency(n) { return "$" + n.toLocaleString(); }

export default function DistributionPulsePage() {
  const [data] = useState(PULSE_DATA);
  const [activeTab, setActiveTab] = useState("overview"); // overview | mta | ttg

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/thompson-distribution" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>
          &larr; RHONDA Home
        </a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>
          Distribution Pulse
        </h1>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{data.date}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPI bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "MTA Revenue Today", value: formatCurrency(data.kpis.mtaRevenueToday), color: C.accent },
            { label: "TTG Revenue Today", value: formatCurrency(data.kpis.ttgRevenueToday), color: C.accent },
            { label: "Avg Tech Utilization", value: data.kpis.avgTechUtil + "%", color: data.kpis.avgTechUtil > 80 ? C.green : C.orange },
            { label: "Parts on Backorder", value: data.kpis.partsBackorder, color: data.kpis.partsBackorder > 30 ? C.red : C.orange },
            { label: "Warranty Claims Pending", value: data.kpis.warrantyPending, color: C.gold },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "mta", label: "MTA Distributors" },
            { id: "ttg", label: "Thompson Truck Group" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: activeTab === t.id ? C.accent : "transparent", color: activeTab === t.id ? "#fff" : C.textMuted }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {(activeTab === "overview" || activeTab === "mta") && (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 14px" }}>Morning Alerts</h2>
            {data.warehouses.flatMap(w => w.alerts.map(a => ({ ...a, warehouse: w.name }))).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, paddingLeft: 12,
                borderLeft: `3px solid ${a.severity === "high" ? C.red : a.severity === "medium" ? C.orange : C.accent}` }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>{a.warehouse}</span>
                  <div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{a.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MTA Warehouses */}
        {(activeTab === "overview" || activeTab === "mta") && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {data.warehouses.map((w, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>{w.name}</h3>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{w.skus.toLocaleString()} SKUs</span>
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: w.fillRate > 95 ? C.green : C.orange }}>{w.fillRate}%</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Fill Rate</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{w.ordersToday}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Orders Today</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>TOP MOVERS</div>
                {w.topMovers.map((m, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: j < w.topMovers.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div>
                      <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8 }}>{m.sku}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.qty}</span>
                      <span style={{ fontSize: 14, color: m.trend === "up" ? C.green : C.textMuted }}>
                        {m.trend === "up" ? "\u2191" : "\u2192"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* TTG Locations */}
        {(activeTab === "overview" || activeTab === "ttg") && (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 14px" }}>Thompson Truck Group — Service Locations</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Location", "Tech Util.", "Open ROs", "Parts on Order", "Today's Appts"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.ttgLocations.map((loc, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: C.text }}>{loc.name}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontWeight: 600, color: loc.techUtil > 85 ? C.green : loc.techUtil > 75 ? C.orange : C.red }}>
                          {loc.techUtil}%
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", color: C.text }}>{loc.openROs}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ color: loc.partsOnOrder > 15 ? C.red : C.text, fontWeight: loc.partsOnOrder > 15 ? 600 : 400 }}>
                          {loc.partsOnOrder}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", color: C.text }}>{loc.todayAppts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
