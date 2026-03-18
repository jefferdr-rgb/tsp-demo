"use client";
import { useState, useEffect, useMemo } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// Factory zones with coordinates (relative % positions on the floor plan)
const ZONES = [
  { id: "lineA", name: "Production Line A", x: 15, y: 25, w: 25, h: 20 },
  { id: "lineB", name: "Production Line B", x: 15, y: 55, w: 25, h: 20 },
  { id: "packaging", name: "Packaging", x: 48, y: 25, w: 20, h: 20 },
  { id: "warehouse", name: "Warehouse", x: 48, y: 55, w: 20, h: 20 },
  { id: "chemical", name: "Chemical Storage", x: 75, y: 25, w: 18, h: 15 },
  { id: "loading", name: "Loading Dock", x: 75, y: 55, w: 18, h: 15 },
  { id: "batchprep", name: "Batch Prep", x: 15, y: 80, w: 18, h: 14 },
  { id: "qclab", name: "QC Lab", x: 48, y: 80, w: 15, h: 14 },
  { id: "breakroom", name: "Break Room", x: 75, y: 80, w: 18, h: 14 },
  { id: "maintenance", name: "Maintenance Shop", x: 38, y: 5, w: 18, h: 14 },
];

// Demo incident data — 90 days
const DEMO_INCIDENTS = [
  { id: 1, zone: "lineA", type: "slip", severity: "Medium", date: "2026-03-15", desc: "Worker slipped on spilled oil near extruder", status: "resolved" },
  { id: 2, zone: "lineA", type: "equipment", severity: "High", date: "2026-03-12", desc: "Guard rail loose on conveyor — near miss", status: "resolved" },
  { id: 3, zone: "lineA", type: "ergonomic", severity: "Low", date: "2026-03-08", desc: "Repetitive strain complaint — bag lifting", status: "open" },
  { id: 4, zone: "lineA", type: "slip", severity: "Medium", date: "2026-02-28", desc: "Wet floor near wash station", status: "resolved" },
  { id: 5, zone: "lineA", type: "equipment", severity: "Critical", date: "2026-02-15", desc: "Extruder pressure spike — emergency shutdown", status: "resolved" },
  { id: 6, zone: "lineB", type: "chemical", severity: "High", date: "2026-03-14", desc: "Sanitizer splash — inadequate PPE", status: "open" },
  { id: 7, zone: "lineB", type: "slip", severity: "Low", date: "2026-03-01", desc: "Minor spill near ingredient hopper", status: "resolved" },
  { id: 8, zone: "packaging", type: "ergonomic", severity: "Medium", date: "2026-03-10", desc: "Back strain from repetitive box lifting", status: "open" },
  { id: 9, zone: "packaging", type: "equipment", severity: "High", date: "2026-02-20", desc: "Sealer malfunction — hot surface contact near-miss", status: "resolved" },
  { id: 10, zone: "warehouse", type: "vehicle", severity: "Critical", date: "2026-03-13", desc: "Forklift near-miss with pedestrian at blind corner", status: "open" },
  { id: 11, zone: "warehouse", type: "fall", severity: "High", date: "2026-02-25", desc: "Stack of pallets shifted — worker jumped clear", status: "resolved" },
  { id: 12, zone: "chemical", type: "chemical", severity: "Critical", date: "2026-03-11", desc: "Incompatible chemicals stored adjacent — caught during scan", status: "resolved" },
  { id: 13, zone: "chemical", type: "chemical", severity: "High", date: "2026-02-18", desc: "Missing SDS sheet for new cleaning agent", status: "resolved" },
  { id: 14, zone: "loading", type: "vehicle", severity: "Medium", date: "2026-03-09", desc: "Truck backed in without spotter", status: "resolved" },
  { id: 15, zone: "loading", type: "fall", severity: "Low", date: "2026-03-02", desc: "Trip hazard — loose dock plate", status: "resolved" },
  { id: 16, zone: "batchprep", type: "chemical", severity: "Medium", date: "2026-03-07", desc: "Ingredient dust exposure — mask not worn", status: "resolved" },
  { id: 17, zone: "maintenance", type: "equipment", severity: "High", date: "2026-03-05", desc: "Lockout/tagout procedure skipped — caught by supervisor", status: "resolved" },
  { id: 18, zone: "lineA", type: "slip", severity: "Medium", date: "2026-01-20", desc: "Water leak from cooling system", status: "resolved" },
  { id: 19, zone: "lineA", type: "equipment", severity: "Low", date: "2026-01-10", desc: "Missing safety label on electrical panel", status: "resolved" },
  { id: 20, zone: "warehouse", type: "ergonomic", severity: "Medium", date: "2026-01-15", desc: "Heavy lift without assistance — policy reminder issued", status: "resolved" },
];

const TYPE_LABELS = {
  slip: { label: "Slip/Trip/Fall", color: "#3498DB" },
  equipment: { label: "Equipment", color: "#E67E22" },
  chemical: { label: "Chemical", color: "#8E44AD" },
  ergonomic: { label: "Ergonomic", color: "#27AE60" },
  vehicle: { label: "Vehicle", color: "#E74C3C" },
  fall: { label: "Fall Hazard", color: "#F39C12" },
};

const SEVERITY_WEIGHT = { Low: 1, Medium: 2, High: 4, Critical: 8 };

function heatColor(score, max) {
  if (max === 0) return "rgba(74,101,64,0.08)";
  const pct = score / max;
  if (pct > 0.7) return "rgba(192,57,43,0.35)";
  if (pct > 0.4) return "rgba(230,160,30,0.3)";
  if (pct > 0.15) return "rgba(230,160,30,0.15)";
  return "rgba(74,101,64,0.08)";
}

export default function SafetyMapPage() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [timeRange, setTimeRange] = useState(90); // days
  const [typeFilter, setTypeFilter] = useState("all");
  const [incidents, setIncidents] = useState(DEMO_INCIDENTS);

  useEffect(() => {
    fetch("/api/data?table=incidents&order=created_at&asc=false&limit=200")
      .then(r => r.json())
      .then(data => {
        if (data.source === "demo" || !data.data?.length) return;
        const live = data.data.map((inc, i) => ({
          id: inc.id || i,
          zone: inc.zone || inc.location || "lineA",
          type: inc.incident_type || inc.type || "equipment",
          severity: inc.severity || "Medium",
          date: inc.incident_date || inc.created_at?.split("T")[0] || "",
          desc: inc.description || "",
          status: inc.status || "open",
        }));
        setIncidents(live);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    return incidents.filter(inc => {
      if (new Date(inc.date) < cutoff) return false;
      if (typeFilter !== "all" && inc.type !== typeFilter) return false;
      return true;
    });
  }, [timeRange, typeFilter]);

  const zoneScores = useMemo(() => {
    const scores = {};
    ZONES.forEach(z => { scores[z.id] = 0; });
    filtered.forEach(inc => {
      scores[inc.zone] = (scores[inc.zone] || 0) + (SEVERITY_WEIGHT[inc.severity] || 1);
    });
    return scores;
  }, [filtered]);

  const maxScore = Math.max(...Object.values(zoneScores), 1);
  const zoneIncidents = selectedZone ? filtered.filter(i => i.zone === selectedZone) : [];
  const selectedZoneData = ZONES.find(z => z.id === selectedZone);

  const totalIncidents = filtered.length;
  const openCount = filtered.filter(i => i.status === "open").length;
  const criticalCount = filtered.filter(i => i.severity === "Critical").length;
  const topZone = ZONES.reduce((best, z) => (zoneScores[z.id] > (zoneScores[best.id] || 0) ? z : best), ZONES[0]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Safety Heat Map</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Safety Heat Map</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Visual pattern analysis — see where hazards cluster before they become injuries.</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Total Incidents", value: totalIncidents, color: C.forest },
            { label: "Open", value: openCount, color: openCount > 0 ? "#b87a00" : C.green },
            { label: "Critical", value: criticalCount, color: criticalCount > 0 ? C.danger : C.green },
            { label: "Hottest Zone", value: topZone.name, color: C.danger, small: true },
          ].map((card, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 12px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: card.small ? 14 : 24, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ days: 30, label: "30d" }, { days: 60, label: "60d" }, { days: 90, label: "90d" }].map(t => (
              <button key={t.days} onClick={() => setTimeRange(t.days)}
                style={{
                  padding: "5px 14px", borderRadius: 14, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${timeRange === t.days ? C.gold : C.borderLight}`,
                  background: timeRange === t.days ? C.goldLight : C.surface,
                  color: timeRange === t.days ? C.gold : C.textMuted,
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button onClick={() => setTypeFilter("all")}
              style={{ padding: "5px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${typeFilter === "all" ? C.gold : C.borderLight}`, background: typeFilter === "all" ? C.goldLight : C.surface, color: typeFilter === "all" ? C.gold : C.textMuted }}>
              All Types
            </button>
            {Object.entries(TYPE_LABELS).map(([key, t]) => (
              <button key={key} onClick={() => setTypeFilter(typeFilter === key ? "all" : key)}
                style={{ padding: "5px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${typeFilter === key ? t.color : C.borderLight}`, background: typeFilter === key ? `${t.color}15` : C.surface, color: typeFilter === key ? t.color : C.textMuted }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Floor plan heat map */}
        <div style={{
          background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24,
          position: "relative",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Sunshine Mills — Facility Floor Plan
          </div>
          <div style={{ position: "relative", width: "100%", paddingBottom: "55%", background: C.bg, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
            {ZONES.map(zone => {
              const score = zoneScores[zone.id] || 0;
              const incCount = filtered.filter(i => i.zone === zone.id).length;
              const isSelected = selectedZone === zone.id;
              return (
                <div key={zone.id}
                  onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                  style={{
                    position: "absolute", left: `${zone.x}%`, top: `${zone.y}%`,
                    width: `${zone.w}%`, height: `${zone.h}%`,
                    background: heatColor(score, maxScore),
                    border: `2px solid ${isSelected ? C.gold : score > 0 ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)"}`,
                    borderRadius: 8, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease",
                    boxShadow: isSelected ? `0 0 0 3px ${C.goldGlow}` : "none",
                  }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text, textAlign: "center", lineHeight: 1.2 }}>{zone.name}</div>
                  {incCount > 0 && (
                    <div style={{
                      marginTop: 4, width: 22, height: 22, borderRadius: "50%",
                      background: score > maxScore * 0.7 ? C.danger : score > maxScore * 0.4 ? "#E67E22" : C.gold,
                      color: "#fff", fontSize: 11, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {incCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
            {[
              { label: "Low Risk", color: "rgba(74,101,64,0.15)" },
              { label: "Moderate", color: "rgba(230,160,30,0.3)" },
              { label: "High Risk", color: "rgba(192,57,43,0.35)" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: l.color, border: "1px solid rgba(0,0,0,0.08)" }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected zone detail */}
        {selectedZoneData && (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.gold}`, padding: 24, boxShadow: `0 0 0 3px ${C.goldGlow}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.gold, borderRadius: 2, display: "inline-block" }} />
                {selectedZoneData.name}
              </h2>
              <span style={{ fontSize: 13, color: C.textMuted }}>{zoneIncidents.length} incidents</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {zoneIncidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, color: C.green, fontSize: 14, fontWeight: 600 }}>
                  ✅ No incidents in this zone for the selected period
                </div>
              ) : (
                zoneIncidents.map(inc => {
                  const typeInfo = TYPE_LABELS[inc.type] || { label: inc.type, color: C.textMuted };
                  const sevColor = inc.severity === "Critical" ? C.danger : inc.severity === "High" ? "#E67E22" : inc.severity === "Medium" ? "#F39C12" : C.textMuted;
                  return (
                    <div key={inc.id} style={{
                      padding: "12px 16px", borderRadius: 10, background: C.bg,
                      borderLeft: `4px solid ${sevColor}`, display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{inc.desc}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                          {inc.date} — <span style={{ color: typeInfo.color, fontWeight: 600 }}>{typeInfo.label}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: sevColor, background: `${sevColor}12`, textTransform: "uppercase" }}>{inc.severity}</span>
                        <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: inc.status === "open" ? "#b87a00" : C.green, background: inc.status === "open" ? "rgba(230,160,30,0.08)" : "rgba(74,101,64,0.08)", textTransform: "uppercase" }}>{inc.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
