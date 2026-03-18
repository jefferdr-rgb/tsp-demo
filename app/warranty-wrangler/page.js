"use client";
import { useState } from "react";

const C = {
  bg: "#2A2A2A", surface: "#333333", chrome: "#1A1A1A", accent: "#C9A84C",
  red: "#E05555", green: "#4ADE80", orange: "#FBBF24", border: "#444444",
  borderLight: "#3D3D3D", text: "#f5f5f5", textMuted: "rgba(255,255,255,0.55)", gold: "#C9A84C",
};

const BRANDS = {
  international: { name: "International", color: "#C4352A" },
  ford: { name: "Ford", color: "#003478" },
  isuzu: { name: "Isuzu", color: "#E60012" },
};

const WARRANTY_CLAIMS = [
  { id: "WC-2026-0147", brand: "international", ro: "RO-88412", vin: "...F8J7K2", vehicle: "2023 LT 625", location: "Knoxville",
    issue: "DPF regeneration failure — sensor fault code SPN 3226", laborHrs: 4.2, parts: 1840, status: "ready",
    deadline: "Mar 22, 2026", confidence: 94, autoFilled: ["VIN decode", "TSB cross-match", "labor guide lookup"] },
  { id: "WC-2026-0148", brand: "ford", ro: "RO-88415", vin: "...E9H3M1", vehicle: "2024 F-750", location: "Chattanooga",
    issue: "Transmission hesitation at low RPM — TCM software update required", laborHrs: 1.5, parts: 0, status: "ready",
    deadline: "Mar 25, 2026", confidence: 88, autoFilled: ["VIN decode", "Ford OASIS match", "labor time"] },
  { id: "WC-2026-0149", brand: "isuzu", ro: "RO-88401", vin: "...G4N6P8", vehicle: "2022 NPR-HD", location: "Morristown",
    issue: "DEF quality sensor intermittent — freeze-thaw cycling damage", laborHrs: 2.8, parts: 620, status: "needs-review",
    deadline: "Mar 20, 2026", confidence: 71, autoFilled: ["VIN decode", "labor guide lookup"], missing: ["Isuzu warranty pre-auth — needs dealer code entry"] },
  { id: "WC-2026-0143", brand: "international", ro: "RO-88390", vin: "...D2K8L5", vehicle: "2023 HV 507", location: "Bristol",
    issue: "Coolant leak at EGR cooler gasket — known issue per TSB SI-2265", laborHrs: 6.0, parts: 340, status: "submitted",
    deadline: "Mar 18, 2026", confidence: 97, autoFilled: ["VIN decode", "TSB cross-match", "labor guide lookup", "Navistar portal submit"] },
  { id: "WC-2026-0140", brand: "ford", ro: "RO-88378", vin: "...B7J1N4", vehicle: "2024 F-650", location: "Cookeville",
    issue: "A/C compressor failure at 8,200 miles", laborHrs: 3.5, parts: 1200, status: "paid",
    deadline: "Paid Mar 14", confidence: 100, autoFilled: ["Full auto-process"], paidAmount: 1637.50 },
];

const STATS = { pending: 3, submitted: 1, paid: 1, totalRecovered: 48750, avgProcessTime: "2.1 days", autoRate: 67 };

export default function WarrantyWranglerPage() {
  const [filter, setFilter] = useState("all");
  const claims = filter === "all" ? WARRANTY_CLAIMS : WARRANTY_CLAIMS.filter(c => c.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/thompson-distribution" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Warranty Wrangler</h1>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Recovered This Month", value: "$" + STATS.totalRecovered.toLocaleString(), color: C.green },
            { label: "Claims Ready to Submit", value: STATS.pending, color: C.orange },
            { label: "Avg Process Time", value: STATS.avgProcessTime, color: C.accent },
            { label: "Auto-Fill Rate", value: STATS.autoRate + "%", color: C.accent },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Claims" },
            { id: "ready", label: "Ready to Submit" },
            { id: "needs-review", label: "Needs Review" },
            { id: "submitted", label: "Submitted" },
            { id: "paid", label: "Paid" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${filter === f.id ? C.accent : C.border}`,
                background: filter === f.id ? C.accent : C.surface, color: filter === f.id ? "#fff" : C.textMuted,
                cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Claims */}
        {claims.map(c => (
          <div key={c.id} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ padding: "3px 8px", borderRadius: 4, background: BRANDS[c.brand]?.color, color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  {BRANDS[c.brand]?.name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.id}</span>
                <span style={{ fontSize: 12, color: C.textMuted }}>{c.ro}</span>
              </div>
              <span style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: c.status === "paid" ? "rgba(34,197,94,0.1)" : c.status === "ready" ? "rgba(27,77,143,0.1)" : c.status === "submitted" ? "rgba(196,155,42,0.1)" : "rgba(245,158,11,0.1)",
                color: c.status === "paid" ? C.green : c.status === "ready" ? C.accent : c.status === "submitted" ? C.gold : C.orange,
              }}>
                {c.status === "ready" ? "Ready to Submit" : c.status === "needs-review" ? "Needs Review" : c.status === "submitted" ? "Submitted" : "Paid"}
              </span>
            </div>
            <div style={{ fontSize: 14, color: C.text, marginBottom: 8 }}>
              <strong>{c.vehicle}</strong> &middot; {c.location} &middot; VIN {c.vin}
            </div>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>{c.issue}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
              <span>Labor: {c.laborHrs}h</span>
              <span>Parts: ${c.parts.toLocaleString()}</span>
              {c.paidAmount && <span style={{ color: C.green, fontWeight: 600 }}>Paid: ${c.paidAmount.toLocaleString()}</span>}
              <span>Deadline: {c.deadline}</span>
              <span>Confidence: <span style={{ fontWeight: 600, color: c.confidence > 90 ? C.green : c.confidence > 75 ? C.accent : C.orange }}>{c.confidence}%</span></span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {c.autoFilled.map((af, i) => (
                <span key={i} style={{ padding: "3px 8px", borderRadius: 4, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 11, color: C.green }}>
                  {af}
                </span>
              ))}
              {c.missing?.map((m, i) => (
                <span key={i} style={{ padding: "3px 8px", borderRadius: 4, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 11, color: C.orange }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
