"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// Demo worker data with streaks and ROI
const WORKERS = [
  {
    id: 1, name: "Jim Rivera", dept: "Production", role: "Senior Operator", avatar: "JR", color: "#8E6B3E",
    safetyStreak: 142, personalBest: 142, incidentFreeZone: "Line A",
    weeklyStats: { sopsCreated: 2, incidentsReported: 1, complianceScans: 3, bountiesClaimed: 1, shiftsCompleted: 5 },
    roi: 4850, roiBreakdown: { sopValue: 2400, safetyValue: 1200, complianceValue: 1250 },
    badges: ["🏆 Top Contributor", "🔥 142-Day Streak", "📋 SOP Master"],
    trend: "up",
  },
  {
    id: 2, name: "Mary Chen", dept: "Quality", role: "QA Lead", avatar: "MC", color: "#4a6540",
    safetyStreak: 89, personalBest: 120, incidentFreeZone: "QC Lab",
    weeklyStats: { sopsCreated: 1, incidentsReported: 0, complianceScans: 8, bountiesClaimed: 0, shiftsCompleted: 5 },
    roi: 6200, roiBreakdown: { sopValue: 1200, safetyValue: 0, complianceValue: 5000 },
    badges: ["✅ Compliance Champion", "🔬 QC Expert"],
    trend: "up",
  },
  {
    id: 3, name: "Carlos Vega", dept: "Maintenance", role: "Maintenance Lead", avatar: "CV", color: "#6495ED",
    safetyStreak: 67, personalBest: 95, incidentFreeZone: "Maintenance Shop",
    weeklyStats: { sopsCreated: 1, incidentsReported: 2, complianceScans: 1, bountiesClaimed: 2, shiftsCompleted: 5 },
    roi: 8400, roiBreakdown: { sopValue: 1200, safetyValue: 3200, complianceValue: 4000 },
    badges: ["⚙️ Equipment Whisperer", "💰 Bounty Hunter"],
    trend: "stable",
  },
  {
    id: 4, name: "Maria Santos", dept: "Packaging", role: "Line Worker (New)", avatar: "MS", color: "#E67E22",
    safetyStreak: 3, personalBest: 3, incidentFreeZone: "Packaging",
    weeklyStats: { sopsCreated: 0, incidentsReported: 0, complianceScans: 0, bountiesClaimed: 0, shiftsCompleted: 2 },
    roi: 0, roiBreakdown: { sopValue: 0, safetyValue: 0, complianceValue: 0 },
    badges: ["🌱 New Hire"],
    trend: "new",
  },
  {
    id: 5, name: "Diane Atkins", dept: "Safety", role: "Safety Coordinator", avatar: "DA", color: "#8E44AD",
    safetyStreak: 210, personalBest: 210, incidentFreeZone: "Facility-Wide",
    weeklyStats: { sopsCreated: 0, incidentsReported: 3, complianceScans: 12, bountiesClaimed: 0, shiftsCompleted: 5 },
    roi: 14200, roiBreakdown: { sopValue: 0, safetyValue: 8700, complianceValue: 5500 },
    badges: ["🛡️ Safety Guardian", "🔥 210-Day Record", "👀 Eagle Eye"],
    trend: "up",
  },
];

// Team streaks
const ZONE_STREAKS = [
  { zone: "QC Lab", streak: 320, icon: "🔬", color: C.green },
  { zone: "Break Room", streak: 245, icon: "☕", color: "#6495ED" },
  { zone: "Production Line A", streak: 142, icon: "🏭", color: C.gold },
  { zone: "Maintenance Shop", streak: 67, icon: "⚙️", color: "#E67E22" },
  { zone: "Packaging", streak: 31, icon: "📦", color: "#8E44AD" },
  { zone: "Warehouse", streak: 4, icon: "📦", color: C.danger },
  { zone: "Loading Dock", streak: 18, icon: "🚛", color: C.textMuted },
  { zone: "Chemical Storage", streak: 52, icon: "⚗️", color: "#27AE60" },
];

function StreakFire({ days }) {
  if (days >= 200) return <span style={{ fontSize: 28 }}>🔥🔥🔥</span>;
  if (days >= 100) return <span style={{ fontSize: 24 }}>🔥🔥</span>;
  if (days >= 30) return <span style={{ fontSize: 20 }}>🔥</span>;
  if (days >= 7) return <span style={{ fontSize: 16 }}>✨</span>;
  return <span style={{ fontSize: 16 }}>🌱</span>;
}

function ProgressRing({ value, max, size = 60, color }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}15`} strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

export default function ScorecardPage() {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [view, setView] = useState("workers"); // workers | zones

  const totalROI = WORKERS.reduce((sum, w) => sum + w.roi, 0);
  const avgStreak = Math.round(WORKERS.reduce((sum, w) => sum + w.safetyStreak, 0) / WORKERS.length);
  const longestStreak = Math.max(...WORKERS.map(w => w.safetyStreak));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Scorecard & Streaks</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Weekly Scorecard</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Personal ROI cards + safety streaks. Every worker sees their impact.</p>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Team ROI This Week", value: `$${totalROI.toLocaleString()}`, color: C.green },
            { label: "Avg Safety Streak", value: `${avgStreak} days`, color: C.gold },
            { label: "Longest Streak", value: `${longestStreak} days`, color: C.forest },
            { label: "Active Workers", value: WORKERS.length, color: C.forest },
          ].map((card, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 12px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, width: "fit-content", border: `1px solid ${C.borderLight}` }}>
          {[{ id: "workers", label: "Worker Scorecards" }, { id: "zones", label: "Zone Streaks" }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: view === v.id ? C.gold : "transparent",
                color: view === v.id ? "#fff" : C.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
              {v.label}
            </button>
          ))}
        </div>

        {view === "workers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {WORKERS.map(worker => {
              const isSelected = selectedWorker === worker.id;
              const streakColor = worker.safetyStreak >= 100 ? C.green : worker.safetyStreak >= 30 ? C.gold : worker.safetyStreak >= 7 ? "#E67E22" : C.textMuted;
              return (
                <div key={worker.id}>
                  <div onClick={() => setSelectedWorker(isSelected ? null : worker.id)}
                    style={{
                      background: C.surface, borderRadius: isSelected ? "14px 14px 0 0" : 14,
                      border: `1px solid ${isSelected ? C.gold : C.borderLight}`,
                      padding: "16px 20px", cursor: "pointer",
                      boxShadow: isSelected ? `0 0 0 3px ${C.goldGlow}` : "none",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%", background: `${worker.color}15`,
                        border: `2px solid ${worker.color}40`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: worker.color, flexShrink: 0,
                      }}>
                        {worker.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.forest }}>{worker.name}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{worker.dept} — {worker.role}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                          {worker.badges.map((b, i) => (
                            <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: C.bg, color: C.textMuted, border: `1px solid ${C.borderLight}` }}>{b}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <StreakFire days={worker.safetyStreak} />
                        <div style={{ fontSize: 20, fontWeight: 800, color: streakColor }}>{worker.safetyStreak}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>day streak</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>+${worker.roi.toLocaleString()}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>weekly ROI</div>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      background: C.surface, borderRadius: "0 0 14px 14px",
                      borderLeft: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, borderBottom: `1px solid ${C.gold}`,
                      padding: "0 20px 20px",
                    }}>
                      <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 16 }}>
                        {/* Weekly activity */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
                          {[
                            { label: "SOPs", value: worker.weeklyStats.sopsCreated, max: 3 },
                            { label: "Incidents", value: worker.weeklyStats.incidentsReported, max: 5 },
                            { label: "Scans", value: worker.weeklyStats.complianceScans, max: 12 },
                            { label: "Bounties", value: worker.weeklyStats.bountiesClaimed, max: 3 },
                            { label: "Shifts", value: worker.weeklyStats.shiftsCompleted, max: 5 },
                          ].map((stat, i) => (
                            <div key={i} style={{ textAlign: "center", position: "relative" }}>
                              <div style={{ position: "relative", display: "inline-block" }}>
                                <ProgressRing value={stat.value} max={stat.max} size={50} color={C.gold} />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)", fontSize: 14, fontWeight: 800, color: C.forest }}>
                                  {stat.value}
                                </div>
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, marginTop: 4 }}>{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* ROI breakdown */}
                        {worker.roi > 0 && (
                          <div style={{ display: "flex", gap: 8 }}>
                            {Object.entries(worker.roiBreakdown).filter(([, v]) => v > 0).map(([key, val]) => (
                              <div key={key} style={{
                                flex: 1, padding: "10px 12px", borderRadius: 8, background: C.bg, textAlign: "center",
                              }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "capitalize" }}>
                                  {key.replace("Value", "")}
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: C.green, marginTop: 2 }}>${val.toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Streak info */}
                        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: `${streakColor}08`, border: `1px solid ${streakColor}20`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: C.text }}>
                            <strong style={{ color: streakColor }}>Safety streak:</strong> {worker.safetyStreak} days incident-free in {worker.incidentFreeZone}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>Personal best: {worker.personalBest} days</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === "zones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ZONE_STREAKS.sort((a, b) => b.streak - a.streak).map((zone, i) => {
              const streakColor = zone.streak >= 200 ? C.green : zone.streak >= 100 ? C.gold : zone.streak >= 30 ? "#E67E22" : zone.streak < 7 ? C.danger : C.textMuted;
              const barWidth = Math.min((zone.streak / 365) * 100, 100);
              return (
                <div key={zone.zone} style={{
                  background: C.surface, borderRadius: 12, border: `1px solid ${C.borderLight}`,
                  padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{zone.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.forest }}>{zone.zone}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <StreakFire days={zone.streak} />
                      <span style={{ fontSize: 22, fontWeight: 800, color: streakColor, marginLeft: 6 }}>{zone.streak}</span>
                      <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>days</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: `${streakColor}15`, overflow: "hidden" }}>
                    <div style={{
                      width: `${barWidth}%`, height: "100%", borderRadius: 3,
                      background: `linear-gradient(90deg, ${streakColor}80, ${streakColor})`,
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              );
            })}

            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
              Zone streaks measure consecutive incident-free days per area.<br />
              When a streak breaks, RHONDA analyzes patterns and suggests preventive actions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
