"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// Demo ROI events — each represents a real dollar-saving action RHONDA enabled
const DEMO_EVENTS = [
  { id: 1, category: "sop", label: "SOP Created: Extruder Startup", savings: 1200, unit: "training cost avoided", time: "2 hours ago", icon: "📋" },
  { id: 2, category: "incident", label: "Near-Miss Caught: Wet Floor B-Wing", savings: 8500, unit: "avg injury claim avoided", time: "3 hours ago", icon: "🛡️" },
  { id: 3, category: "compliance", label: "Compliance Scan: Chemical Storage", savings: 4200, unit: "OSHA fine prevented", time: "5 hours ago", icon: "✅" },
  { id: 4, category: "onboard", label: "New Hire Onboarded: Maria Santos", savings: 950, unit: "HR processing saved", time: "Yesterday", icon: "👤" },
  { id: 5, category: "sop", label: "SOP Created: Packaging Line QC", savings: 1200, unit: "training cost avoided", time: "Yesterday", icon: "📋" },
  { id: 6, category: "translate", label: "Safety Alert Broadcast: 3 Languages", savings: 350, unit: "interpreter cost avoided", time: "Yesterday", icon: "🔊" },
  { id: 7, category: "incident", label: "Hazard Reported: Loose Guard Rail", savings: 12000, unit: "potential OSHA citation", time: "2 days ago", icon: "🛡️" },
  { id: 8, category: "compliance", label: "Audit Package Generated: FDA Ready", savings: 6500, unit: "consultant fee avoided", time: "2 days ago", icon: "✅" },
  { id: 9, category: "sop", label: "SOP Created: Forklift Inspection", savings: 1200, unit: "training cost avoided", time: "3 days ago", icon: "📋" },
  { id: 10, category: "teach", label: "Tribal Knowledge Captured: Jim Rivera", savings: 15000, unit: "institutional knowledge preserved", time: "3 days ago", icon: "🧠" },
  { id: 11, category: "incident", label: "Equipment Issue Flagged: Conveyor #3", savings: 3200, unit: "unplanned downtime avoided", time: "4 days ago", icon: "🛡️" },
  { id: 12, category: "translate", label: "Onboarding Docs: Vietnamese", savings: 350, unit: "translation service avoided", time: "5 days ago", icon: "🔊" },
  { id: 13, category: "compliance", label: "Expired Cert Caught: Fire Extinguisher", savings: 2800, unit: "citation avoided", time: "6 days ago", icon: "✅" },
  { id: 14, category: "sop", label: "SOP Created: Allergen Changeover", savings: 1200, unit: "training cost avoided", time: "1 week ago", icon: "📋" },
  { id: 15, category: "incident", label: "Batch Hold Triggered: Aflatoxin Check", savings: 45000, unit: "recall cost avoided", time: "1 week ago", icon: "🛡️" },
];

const CATEGORY_COLORS = {
  sop: { bg: "rgba(196,155,42,0.08)", border: "rgba(196,155,42,0.25)", color: C.gold },
  incident: { bg: "rgba(192,57,43,0.06)", border: "rgba(192,57,43,0.2)", color: C.danger },
  compliance: { bg: "rgba(74,101,64,0.06)", border: "rgba(74,101,64,0.2)", color: C.green },
  onboard: { bg: "rgba(100,149,237,0.06)", border: "rgba(100,149,237,0.2)", color: "#6495ED" },
  translate: { bg: "rgba(142,68,173,0.06)", border: "rgba(142,68,173,0.2)", color: "#8E44AD" },
  teach: { bg: "rgba(196,155,42,0.08)", border: "rgba(196,155,42,0.25)", color: C.gold },
};

function AnimatedCounter({ target, duration = 2000 }) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{current.toLocaleString()}</>;
}

export default function ROITickerPage() {
  const [events] = useState(DEMO_EVENTS);
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const totalSavings = events.reduce((sum, e) => sum + e.savings, 0);
  const categorySums = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.savings;
    return acc;
  }, {});

  const filtered = selectedCategory === "all" ? events : events.filter(e => e.category === selectedCategory);

  const categories = [
    { id: "all", label: "All", count: events.length },
    { id: "incident", label: "Safety", count: events.filter(e => e.category === "incident").length },
    { id: "compliance", label: "Compliance", count: events.filter(e => e.category === "compliance").length },
    { id: "sop", label: "SOPs", count: events.filter(e => e.category === "sop").length },
    { id: "teach", label: "Knowledge", count: events.filter(e => e.category === "teach").length },
    { id: "onboard", label: "Onboarding", count: events.filter(e => e.category === "onboard").length },
    { id: "translate", label: "Translation", count: events.filter(e => e.category === "translate").length },
  ];

  // Monthly projection
  const daysOfData = 7;
  const monthlyProjection = Math.round((totalSavings / daysOfData) * 30);
  const annualProjection = monthlyProjection * 12;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>ROI Dashboard</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Hero number */}
        <div style={{
          textAlign: "center", marginBottom: 32, padding: "40px 32px",
          background: `linear-gradient(135deg, ${C.chrome} 0%, #3a5430 100%)`,
          borderRadius: 20, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 30% 50%, rgba(196,155,42,0.08) 0%, transparent 60%)` }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
              Total Value Generated — Last 7 Days
            </div>
            <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
              $<AnimatedCounter target={totalSavings} duration={2500} />
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              across {events.length} RHONDA-powered actions
            </div>
          </div>
        </div>

        {/* Projection cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Monthly Projection", value: monthlyProjection },
            { label: "Annual Projection", value: annualProjection },
            { label: "Cost per Employee/mo", value: Math.round(annualProjection / 12 / 900), prefix: "", suffix: " saved" },
          ].map((card, i) => (
            <div key={i} style={{
              background: C.surface, borderRadius: 14, padding: "20px 16px", textAlign: "center",
              border: `1px solid ${C.borderLight}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.forest }}>
                ${card.value.toLocaleString()}{card.suffix || ""}
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Savings by Category
          </div>
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", height: 32 }}>
            {Object.entries(categorySums).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
              const pct = (amount / totalSavings) * 100;
              const catColor = CATEGORY_COLORS[cat]?.color || C.gold;
              return (
                <div key={cat} style={{
                  width: `${pct}%`, background: catColor, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff", minWidth: pct > 8 ? "auto" : 0,
                  transition: "width 0.5s ease",
                }} title={`${cat}: $${amount.toLocaleString()} (${Math.round(pct)}%)`}>
                  {pct > 12 ? `${cat} ${Math.round(pct)}%` : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {categories.filter(c => c.count > 0).map(c => (
            <button key={c.id} onClick={() => { setSelectedCategory(c.id); setVisibleCount(5); }}
              style={{
                padding: "6px 14px", borderRadius: 16, fontSize: 12, fontWeight: 600,
                border: `1px solid ${selectedCategory === c.id ? C.gold : C.borderLight}`,
                background: selectedCategory === c.id ? C.goldLight : C.surface,
                color: selectedCategory === c.id ? C.gold : C.textMuted,
                cursor: "pointer", fontFamily: "inherit",
              }}>
              {c.label} ({c.count})
            </button>
          ))}
        </div>

        {/* Event feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, visibleCount).map((event, i) => {
            const cat = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.sop;
            return (
              <div key={event.id} style={{
                background: C.surface, borderRadius: 12, border: `1px solid ${C.borderLight}`,
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: cat.bg,
                  border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>
                  {event.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{event.label}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{event.unit} — {event.time}</div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: C.green,
                  background: "rgba(74,101,64,0.06)", padding: "6px 14px", borderRadius: 8,
                }}>
                  +${event.savings.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {visibleCount < filtered.length && (
          <button onClick={() => setVisibleCount(v => v + 5)}
            style={{
              display: "block", margin: "16px auto 0", padding: "10px 24px", borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted,
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
            Show More ({filtered.length - visibleCount} remaining)
          </button>
        )}

        {/* Bottom note */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          ROI calculations based on industry benchmarks: avg OSHA citation $4,200, avg injury claim $8,500,<br />
          training cost per SOP $1,200, interpreter $350/session, consultant $6,500/audit.
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
