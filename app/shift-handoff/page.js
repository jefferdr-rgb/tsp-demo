"use client";
import { useState, useEffect } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const SHIFTS = [
  {
    id: "day-mar17", shift: "Day Shift", date: "March 17, 2026", time: "6:00 AM — 2:00 PM",
    supervisor: "Mike Torres", crew: 12, status: "completed",
    summary: "Strong production day. Line A ran at 94% efficiency. Minor packaging sealer issue resolved by Carlos at 10:30 AM. All safety checks completed on time.",
    sections: [
      {
        title: "Production", icon: "🏭", items: [
          { text: "Line A: 47,200 lbs kibble produced (target: 46,000) — 102.6% of goal", status: "good" },
          { text: "Line B: 38,100 lbs produced (target: 40,000) — 95.3% of goal. Slow start due to ingredient staging delay.", status: "warning" },
          { text: "Batch 2026-0317-A passed QC — all specs within range", status: "good" },
          { text: "New Nurture Farms recipe test batch scheduled for tomorrow AM", status: "info" },
        ],
      },
      {
        title: "Safety & Incidents", icon: "🛡️", items: [
          { text: "NEAR MISS: Wet floor near Line A wash station at 9:15 AM. Cleaned immediately, cone placed. Report filed.", status: "warning" },
          { text: "Chemical storage scan completed — all items properly labeled and stored", status: "good" },
          { text: "Fire extinguisher monthly check: all 12 units passed", status: "good" },
        ],
      },
      {
        title: "Equipment", icon: "⚙️", items: [
          { text: "Packaging Sealer #3: seal temperature running 8°F high. Carlos adjusted at 10:30 AM. Monitor closely.", status: "warning" },
          { text: "Conveyor #7 belt tension still declining — maintenance ticket open (MT-2026-089)", status: "danger" },
          { text: "Extruder #1 running normally. Die pressure at 44 PSI.", status: "good" },
        ],
      },
      {
        title: "Personnel", icon: "👥", items: [
          { text: "Maria Santos completed Day 2 of onboarding — shadowing on packaging line tomorrow", status: "info" },
          { text: "Jim Rivera captured SOP for extruder startup (Bounty #12 — submitted for review)", status: "good" },
          { text: "Reminder: Diane Atkins on PTO Thursday & Friday this week", status: "info" },
        ],
      },
      {
        title: "Action Items for Next Shift", icon: "📋", items: [
          { text: "PRIORITY: Check Conveyor #7 belt tension before starting Line B", status: "danger" },
          { text: "Monitor Packaging Sealer #3 temperature — if it drifts above 305°F, shut down and call Carlos", status: "warning" },
          { text: "Stage ingredients for Nurture Farms test batch (see batch sheet in QC Lab)", status: "info" },
          { text: "Maria Santos needs PPE locker assignment — see HR folder", status: "info" },
        ],
      },
    ],
  },
  {
    id: "night-mar16", shift: "Night Shift", date: "March 16, 2026", time: "10:00 PM — 6:00 AM",
    supervisor: "Angela Park", crew: 8, status: "completed",
    summary: "Quiet night. Line A ran standard overnight batch. No incidents. Conveyor #7 showing continued belt degradation — flagged for day shift maintenance review.",
    sections: [
      {
        title: "Production", icon: "🏭", items: [
          { text: "Line A overnight batch: 28,400 lbs (target: 28,000) — on track", status: "good" },
          { text: "Line B: not running (maintenance window)", status: "info" },
        ],
      },
      {
        title: "Safety & Incidents", icon: "🛡️", items: [
          { text: "No incidents reported", status: "good" },
          { text: "Nightly perimeter check completed — all doors secured", status: "good" },
        ],
      },
      {
        title: "Equipment", icon: "⚙️", items: [
          { text: "Conveyor #7: alignment reading 2.3° off-center (was 2.1° yesterday). Trend is worsening.", status: "danger" },
          { text: "All other equipment running normally", status: "good" },
        ],
      },
      {
        title: "Action Items for Next Shift", icon: "📋", items: [
          { text: "Conveyor #7 needs immediate attention — alignment degrading daily", status: "danger" },
          { text: "Restock break room supplies (coffee, water) — ran out at 3 AM", status: "info" },
        ],
      },
    ],
  },
  {
    id: "day-mar16", shift: "Day Shift", date: "March 16, 2026", time: "6:00 AM — 2:00 PM",
    supervisor: "Mike Torres", crew: 12, status: "completed",
    summary: "Good day overall. Compliance scan of chemical storage found one issue (now resolved). New hire Maria Santos started onboarding. Forklift near-miss in warehouse — retraining scheduled.",
    sections: [
      {
        title: "Production", icon: "🏭", items: [
          { text: "Line A: 45,800 lbs (target: 46,000) — 99.6%", status: "good" },
          { text: "Line B: 39,200 lbs (target: 40,000) — 98%", status: "good" },
        ],
      },
      {
        title: "Safety & Incidents", icon: "🛡️", items: [
          { text: "NEAR MISS: Forklift FL-04 nearly struck pedestrian at warehouse blind corner. Root cause: no spotter, poor sightlines.", status: "danger" },
          { text: "Corrective action: mirror installation ordered for blind corner. Forklift operator retraining scheduled.", status: "warning" },
          { text: "Compliance scan of chemical storage: incompatible chemicals stored adjacent. Moved immediately.", status: "warning" },
        ],
      },
      {
        title: "Personnel", icon: "👥", items: [
          { text: "Maria Santos started Day 1 — completed safety orientation and facility tour", status: "good" },
          { text: "2 bounties completed: forklift inspection SOP and allergen changeover procedure", status: "good" },
        ],
      },
    ],
  },
];

const STATUS_STYLE = {
  good: { color: C.green, bg: "rgba(74,101,64,0.06)", icon: "✓" },
  warning: { color: "#b87a00", bg: "rgba(230,160,30,0.06)", icon: "⚠" },
  danger: { color: C.danger, bg: "rgba(192,57,43,0.06)", icon: "!" },
  info: { color: "#6495ED", bg: "rgba(100,149,237,0.06)", icon: "i" },
};

export default function ShiftHandoffPage() {
  const [shifts, setShifts] = useState(SHIFTS);
  const [expandedId, setExpandedId] = useState(SHIFTS[0].id);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/data?table=shifts&order=start_time&asc=false&limit=10").then(r => r.json()),
      fetch("/api/data?table=shift_handoffs&order=generated_at&asc=false&limit=10").then(r => r.json()),
    ])
      .then(([shiftData, handoffData]) => {
        if (shiftData.source === "demo" || !shiftData.data?.length) return;
        const handoffs = handoffData.data || [];

        const live = shiftData.data.map((s, i) => {
          const handoff = handoffs.find(h => h.shift_id === s.id);
          const sections = handoff?.sections || [];
          return {
            id: s.id || `shift-${i}`,
            shift: s.shift_name || s.shift_type || "Shift",
            date: new Date(s.start_time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            time: `${new Date(s.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} — ${new Date(s.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
            supervisor: s.supervisor_name || "Unknown",
            crew: s.crew_count || 0,
            status: s.status || "completed",
            summary: handoff?.summary || s.notes || "No handoff summary available.",
            sections: sections.length > 0 ? sections : [{
              title: "Notes", icon: "📋",
              items: [{ text: handoff?.summary || s.notes || "No details recorded.", status: "info" }],
            }],
          };
        });
        setShifts(live);
        if (live.length) setExpandedId(live[0].id);
      })
      .catch(() => {});
  }, []);

  const speakHandoff = (shift) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const lines = [
      `Shift handoff for ${shift.shift}, ${shift.date}.`,
      shift.summary,
      ...shift.sections.flatMap(s => [
        `${s.title}:`,
        ...s.items.map(i => i.text),
      ]),
    ];

    const utterance = new SpeechSynthesisUtterance(lines.join(". "));
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Shift Handoff</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Smart Shift Handoff</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Auto-generated briefings from every RHONDA action during the shift. Listen or read.</p>
        </div>

        {/* Shift list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shifts.map(shift => {
            const isExpanded = expandedId === shift.id;
            const dangerCount = shift.sections.flatMap(s => s.items).filter(i => i.status === "danger").length;
            const warningCount = shift.sections.flatMap(s => s.items).filter(i => i.status === "warning").length;
            return (
              <div key={shift.id}>
                <div onClick={() => setExpandedId(isExpanded ? null : shift.id)}
                  style={{
                    background: C.surface, borderRadius: isExpanded ? "14px 14px 0 0" : 14,
                    border: `1px solid ${isExpanded ? C.gold : C.borderLight}`,
                    borderBottom: isExpanded ? `1px solid ${C.borderLight}` : undefined,
                    padding: "18px 22px", cursor: "pointer",
                    boxShadow: isExpanded ? `0 0 0 3px ${C.goldGlow}` : "none",
                    transition: "all 0.2s ease",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.forest }}>{shift.shift}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{shift.date} — {shift.time} — Supervisor: {shift.supervisor} — {shift.crew} crew</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {dangerCount > 0 && (
                        <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(192,57,43,0.08)", color: C.danger }}>
                          {dangerCount} critical
                        </span>
                      )}
                      {warningCount > 0 && (
                        <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(230,160,30,0.08)", color: "#b87a00" }}>
                          {warningCount} warning
                        </span>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    background: C.surface, borderRadius: "0 0 14px 14px",
                    borderLeft: `1px solid ${C.gold}`, borderRight: `1px solid ${C.gold}`, borderBottom: `1px solid ${C.gold}`,
                    padding: "20px 22px",
                  }}>
                    {/* Summary + audio */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div style={{
                        flex: 1, padding: "14px 18px", borderRadius: 10, background: C.goldLight,
                        border: `1px solid rgba(196,155,42,0.2)`, fontSize: 13, lineHeight: 1.6, color: C.text,
                      }}>
                        <strong style={{ color: C.gold }}>Summary:</strong> {shift.summary}
                      </div>
                      <button onClick={() => speakHandoff(shift)}
                        style={{
                          marginLeft: 12, width: 48, height: 48, borderRadius: "50%", border: "none",
                          background: speaking ? C.danger : C.gold,
                          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, boxShadow: `0 2px 8px ${speaking ? "rgba(192,57,43,0.3)" : C.goldGlow}`,
                        }}>
                        {speaking ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Sections */}
                    {shift.sections.map((section, si) => (
                      <div key={si} style={{ marginBottom: si < shift.sections.length - 1 ? 16 : 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.forest, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{section.icon}</span> {section.title}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {section.items.map((item, ii) => {
                            const st = STATUS_STYLE[item.status] || STATUS_STYLE.info;
                            return (
                              <div key={ii} style={{
                                padding: "10px 14px", borderRadius: 8, background: st.bg,
                                borderLeft: `3px solid ${st.color}`, fontSize: 13, lineHeight: 1.5, color: C.text,
                              }}>
                                {item.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
