"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const EQUIPMENT = [
  {
    id: 1, name: "Kibble Extruder #1", location: "Line A",
    health: 87, trend: "stable", nextService: "Apr 12, 2026",
    metrics: { temperature: { value: "182°F", status: "normal" }, vibration: { value: "2.1mm/s", status: "normal" }, runtime: { value: "4,200 hrs", status: "normal" }, pressure: { value: "42 PSI", status: "normal" } },
    history: [92, 90, 89, 88, 87, 87],
    prediction: "No issues expected. Scheduled bearing replacement in 6 weeks.",
    costSaved: 0,
  },
  {
    id: 2, name: "Packaging Sealer #3", location: "Packaging",
    health: 64, trend: "declining", nextService: "Mar 22, 2026",
    metrics: { sealTemp: { value: "298°F", status: "warning" }, rejectRate: { value: "3.2%", status: "warning" }, cycleTime: { value: "1.8s", status: "normal" }, pressure: { value: "55 PSI", status: "normal" } },
    history: [85, 78, 74, 70, 67, 64],
    prediction: "Heating element degradation detected. Recommend replacement within 2 weeks to avoid unplanned downtime. Estimated failure window: Mar 28 - Apr 5.",
    costSaved: 12000,
  },
  {
    id: 3, name: "Conveyor Belt #7", location: "Line B",
    health: 43, trend: "critical", nextService: "OVERDUE",
    metrics: { beltTension: { value: "Low", status: "critical" }, motorTemp: { value: "195°F", status: "warning" }, speed: { value: "28 ft/min", status: "normal" }, alignment: { value: "2.3° off", status: "critical" } },
    history: [72, 65, 58, 52, 47, 43],
    prediction: "Belt failure likely within 5-7 days. Motor overheating due to misalignment. Immediate maintenance recommended. Unplanned failure cost: $18,000+ (4hr downtime + emergency parts).",
    costSaved: 18000,
  },
  {
    id: 4, name: "Mixer/Blender #2", location: "Batch Prep",
    health: 91, trend: "stable", nextService: "May 1, 2026",
    metrics: { motorAmps: { value: "42A", status: "normal" }, bladeWear: { value: "8%", status: "normal" }, runtime: { value: "2,800 hrs", status: "normal" }, oilLevel: { value: "Full", status: "normal" } },
    history: [93, 92, 92, 91, 91, 91],
    prediction: "Excellent condition. Current maintenance schedule is adequate.",
    costSaved: 0,
  },
  {
    id: 5, name: "Forklift FL-04", location: "Warehouse",
    health: 72, trend: "declining", nextService: "Mar 25, 2026",
    metrics: { battery: { value: "68%", status: "warning" }, hydraulics: { value: "Normal", status: "normal" }, tireWear: { value: "40%", status: "normal" }, hours: { value: "6,100 hrs", status: "normal" } },
    history: [88, 84, 80, 77, 74, 72],
    prediction: "Battery capacity declining faster than expected. Order replacement battery now — lead time is 10 days. Current battery may not last through April.",
    costSaved: 3500,
  },
];

function HealthBar({ value, size = "large" }) {
  const color = value >= 80 ? C.green : value >= 60 ? "#b87a00" : C.danger;
  const height = size === "large" ? 10 : 6;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height, background: `${color}15`, borderRadius: height, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: height, transition: "width 1s ease" }} />
      </div>
      <span style={{ fontSize: size === "large" ? 18 : 13, fontWeight: 800, color, minWidth: 40, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function SparkLine({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data) - 5;
  const range = max - min || 1;
  const w = 120, h = 36;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * h} r="2.5" fill={i === data.length - 1 ? color : "transparent"} stroke={i === data.length - 1 ? color : "transparent"} />
      ))}
    </svg>
  );
}

export default function PredictiveMaintenancePage() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = EQUIPMENT.find(e => e.id === selectedId);

  const avgHealth = Math.round(EQUIPMENT.reduce((s, e) => s + e.health, 0) / EQUIPMENT.length);
  const criticalCount = EQUIPMENT.filter(e => e.health < 60).length;
  const warningCount = EQUIPMENT.filter(e => e.health >= 60 && e.health < 80).length;
  const totalSaved = EQUIPMENT.reduce((s, e) => s + e.costSaved, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Predictive Maintenance</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(196,155,42,0.15)", color: C.gold, fontSize: 11, fontWeight: 700 }}>COMING Q3 2026</span>
          <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Predictive Maintenance</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>AI monitors equipment health and predicts failures before they happen.</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Fleet Health", value: `${avgHealth}%`, color: avgHealth >= 80 ? C.green : "#b87a00" },
            { label: "Critical", value: criticalCount, color: criticalCount > 0 ? C.danger : C.green },
            { label: "Warning", value: warningCount, color: warningCount > 0 ? "#b87a00" : C.green },
            { label: "Downtime Avoided", value: `$${totalSaved.toLocaleString()}`, color: C.green },
          ].map((card, i) => (
            <div key={i} style={{
              background: C.surface, borderRadius: 14, padding: "18px 16px", textAlign: "center",
              border: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Equipment list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EQUIPMENT.map(eq => {
            const healthColor = eq.health >= 80 ? C.green : eq.health >= 60 ? "#b87a00" : C.danger;
            const isSelected = selectedId === eq.id;
            return (
              <div key={eq.id}>
                <div onClick={() => setSelectedId(isSelected ? null : eq.id)}
                  style={{
                    background: C.surface, borderRadius: 14, padding: "18px 22px",
                    border: `1px solid ${isSelected ? C.gold : C.borderLight}`,
                    cursor: "pointer", transition: "all 0.2s ease",
                    boxShadow: isSelected ? `0 0 0 3px ${C.goldGlow}` : "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: `${healthColor}12`,
                      border: `2px solid ${healthColor}30`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 800, color: healthColor,
                    }}>
                      {eq.health}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{eq.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{eq.location} — Next service: {eq.nextService}</div>
                    </div>
                    <SparkLine data={eq.history} color={healthColor} />
                    <div style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: eq.trend === "stable" ? "rgba(74,101,64,0.08)" : eq.trend === "declining" ? "rgba(230,160,30,0.08)" : "rgba(192,57,43,0.08)",
                      color: eq.trend === "stable" ? C.green : eq.trend === "declining" ? "#b87a00" : C.danger,
                      textTransform: "uppercase",
                    }}>
                      {eq.trend}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div style={{
                    background: C.surface, borderRadius: "0 0 14px 14px", padding: "0 22px 22px",
                    borderLeft: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, borderBottom: `1px solid ${C.gold}`,
                    marginTop: -2,
                  }}>
                    <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 18 }}>
                      {/* Metrics grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                        {Object.entries(eq.metrics).map(([key, m]) => (
                          <div key={key} style={{
                            padding: "10px 14px", borderRadius: 8, background: C.bg,
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}>
                            <span style={{ fontSize: 12, color: C.textMuted, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</span>
                            <span style={{
                              fontSize: 13, fontWeight: 700,
                              color: m.status === "normal" ? C.green : m.status === "warning" ? "#b87a00" : C.danger,
                            }}>
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* AI prediction */}
                      <div style={{
                        padding: "14px 18px", borderRadius: 10,
                        background: eq.health < 60 ? "rgba(192,57,43,0.06)" : eq.health < 80 ? "rgba(230,160,30,0.06)" : "rgba(74,101,64,0.06)",
                        border: `1px solid ${eq.health < 60 ? "rgba(192,57,43,0.15)" : eq.health < 80 ? "rgba(230,160,30,0.15)" : "rgba(74,101,64,0.15)"}`,
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                          AI Prediction
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text }}>{eq.prediction}</div>
                      </div>

                      {eq.costSaved > 0 && (
                        <div style={{ marginTop: 12, textAlign: "center", fontSize: 13, color: C.green, fontWeight: 700 }}>
                          Predicted savings from early intervention: ${eq.costSaved.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Vision note */}
        <div style={{
          marginTop: 32, textAlign: "center", padding: "24px 32px", borderRadius: 16,
          background: `linear-gradient(135deg, ${C.goldLight} 0%, rgba(196,155,42,0.04) 100%)`,
          border: `1px solid rgba(196,155,42,0.2)`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 6 }}>Coming Q3 2026</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            Live sensor integration, real-time anomaly detection, and automated work order generation.
            Currently showing AI predictions based on historical maintenance data and inspection patterns.
          </div>
        </div>
      </div>
    </div>
  );
}
