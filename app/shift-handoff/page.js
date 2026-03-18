"use client";
import { useState, useEffect } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", danger: "#C53030", green: "#22c55e",
  orange: "#F59E0B", gold: "#C49B2A",
};

const SHIFTS = [
  {
    id: "day-mar18", shift: "Day Shift", date: "March 18, 2026", time: "7:00 AM — 3:00 PM",
    supervisor: "Shea Bailey", crew: 22, status: "completed",
    summary: "Solid day across all cottages. One behavioral incident at Cedar Ridge (resolved, no restraint). New intake at Bethany House 3 — woman and two children fleeing DV. All med passes on time. TLP youth SM and JC both at work on time.",
    sections: [
      {
        title: "Cottage Updates", icon: "🏠", items: [
          { text: "Oak Hill: Quiet day. RH adjusting well — engaged in group activity for first time. MT passed math test (big milestone).", status: "good" },
          { text: "Cedar Ridge: MC had verbal altercation with BT at 11 AM. De-escalated without restraint. Separated for 30-min cool-down. Counselor notified.", status: "warning" },
          { text: "Jane's House: All TLP girls managing routines independently. DR practiced grocery shopping with budget — stayed under $40.", status: "good" },
          { text: "Elm Cottage: TB's 6-month QRTP review is 10 days overdue. MUST be scheduled this week.", status: "danger" },
        ],
      },
      {
        title: "Safety & Incidents", icon: "🛡️", items: [
          { text: "MC/BT verbal altercation at Cedar Ridge — de-escalated successfully. Incident report filed by James Young.", status: "warning" },
          { text: "All medication passes completed on time across all cottages. Zero discrepancies.", status: "good" },
          { text: "Building safety walk completed: Chelsea Main campus — no issues found.", status: "good" },
        ],
      },
      {
        title: "Women & Children", icon: "💜", items: [
          { text: "NEW INTAKE: Woman + 2 children (ages 4, 7) admitted to Bethany House 3. Fleeing DV — husband arrested then released on bond. Sherry Gulsby completed intake.", status: "warning" },
          { text: "Hannah Home 2: Keisha W. had two apartment viewings — strong options near her work. Transition planning on track.", status: "good" },
          { text: "Ashley D. (Hannah Home 1): Move-in date confirmed April 1. Transition planning meeting completed.", status: "good" },
        ],
      },
      {
        title: "Personnel", icon: "👥", items: [
          { text: "New relief staff member (Tasha Davis) completed Day 1 orientation — shadowing at Oak Hill tomorrow.", status: "info" },
          { text: "Reminder: Mark & Sarah Collins (Oak Hill houseparents) on scheduled respite this weekend. Relief couple covering.", status: "info" },
          { text: "Monthly supervision logs: 3 of 6 supervisors have completed March logs. Remaining 3 due by March 25.", status: "warning" },
        ],
      },
      {
        title: "Action Items for Evening/Night", icon: "📋", items: [
          { text: "PRIORITY: Schedule TB's 6-month QRTP review — 10 days overdue. Contact Dr. Monroe's office first thing AM.", status: "danger" },
          { text: "Extra check-ins for new intake at Bethany House 3 — children may be unsettled first night.", status: "warning" },
          { text: "MC at Cedar Ridge needs monitoring tonight. Two incidents this week. Counselor session scheduled for tomorrow.", status: "warning" },
          { text: "RH at Oak Hill: extra bedtime check-in (still adjusting, day 8). Homesick pattern continues evenings.", status: "info" },
        ],
      },
    ],
  },
  {
    id: "night-mar17", shift: "Night Shift", date: "March 17, 2026", time: "11:00 PM — 7:00 AM",
    supervisor: "Kevin Marshall", crew: 8, status: "completed",
    summary: "Quiet night. One youth at Oak Hill (RH) needed extra support around midnight — missing family. Sat with him until he fell asleep. All cottages secure by 11:30 PM. No incidents.",
    sections: [
      {
        title: "Cottage Updates", icon: "🏠", items: [
          { text: "Oak Hill: RH woke up crying at midnight. Staff sat with him on the porch for 20 minutes. Settled back to sleep by 12:30.", status: "warning" },
          { text: "Cedar Ridge: All youth asleep by 10:30. Quiet night.", status: "good" },
          { text: "Jane's House: LW studying for college exam until 11:45 PM. All others asleep by 10.", status: "good" },
          { text: "Elm Cottage: EG (new to TLP) called previous foster family before bed — seemed comforted. Asleep by 10:15.", status: "info" },
        ],
      },
      {
        title: "Safety", icon: "🛡️", items: [
          { text: "No incidents reported overnight.", status: "good" },
          { text: "All buildings secured. Perimeter check completed at 11:30 PM and 3:00 AM.", status: "good" },
          { text: "Overnight medication pass completed at 10 PM — zero issues.", status: "good" },
        ],
      },
      {
        title: "Action Items for Day Shift", icon: "📋", items: [
          { text: "RH at Oak Hill needs extra morning attention — rough night. Consider calling DHR caseworker about scheduling phone call with mom.", status: "warning" },
          { text: "EG at Elm Cottage: watch for regression behaviors — transition from Moderate is still fresh.", status: "info" },
        ],
      },
    ],
  },
  {
    id: "day-mar17", shift: "Day Shift", date: "March 17, 2026", time: "7:00 AM — 3:00 PM",
    supervisor: "Shea Bailey", crew: 22, status: "completed",
    summary: "Strong day. Maria R. passed her first GED practice test in math — staff celebrated with her. AJ's discharge planning meeting went well. Equine therapy session at Stables went smoothly. Monthly fire drill completed across Chelsea campus.",
    sections: [
      {
        title: "Cottage Updates", icon: "🏠", items: [
          { text: "Oak Hill: Good day all around. DB engaged in school today (refused yesterday). MT had scheduled call with mom.", status: "good" },
          { text: "Cedar Ridge: AJ had discharge planning meeting with caseworker. Emotional but positive. 6 months of progress paying off.", status: "good" },
          { text: "Jane's House: NB cooked spaghetti for the house. Everyone helped clean up. Great teamwork.", status: "good" },
        ],
      },
      {
        title: "Women & Children", icon: "💜", items: [
          { text: "Maria R. (Bethany House 3) passed her first GED practice test in math. Cried happy tears. Major milestone — staff celebrated.", status: "good" },
          { text: "Child 1 of Maria R. (age 7) had rough day at school — got in a fight. Maria handled it calmly using parenting class techniques.", status: "warning" },
          { text: "Keisha W. (Hannah Home 2) hit 90-day employment milestone. Celebrated by taking kids to the park.", status: "good" },
        ],
      },
      {
        title: "Safety", icon: "🛡️", items: [
          { text: "Monthly fire drill completed: Chelsea Main campus. All cottages evacuated in under 4 minutes. No issues.", status: "good" },
          { text: "Equine therapy session at King's Home Stables — 6 youth attended. Positive engagement. Zero behavioral concerns.", status: "good" },
        ],
      },
    ],
  },
];

const STATUS_STYLE = {
  good: { color: C.green, bg: "rgba(34,197,94,0.06)", icon: "\u2713" },
  warning: { color: C.orange, bg: "rgba(245,158,11,0.06)", icon: "\u26A0" },
  danger: { color: C.danger, bg: "rgba(197,48,48,0.06)", icon: "!" },
  info: { color: "#6495ED", bg: "rgba(100,149,237,0.06)", icon: "i" },
};

export default function ShiftHandoffPage() {
  const [shifts, setShifts] = useState(SHIFTS);
  const [expandedId, setExpandedId] = useState(SHIFTS[0].id);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 30000);
    Promise.all([
      fetch("/api/data?table=shifts&order=start_time&asc=false&limit=10", { signal: ctrl.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => ({ source: "demo" })),
      fetch("/api/data?table=shift_handoffs&order=generated_at&asc=false&limit=10", { signal: ctrl.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => ({ source: "demo" })),
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
            supervisor: s.supervisor_name || "Unknown", crew: s.crew_count || 0, status: s.status || "completed",
            summary: handoff?.summary || s.notes || "No handoff summary available.",
            sections: sections.length > 0 ? sections : [{ title: "Notes", icon: "\uD83D\uDCCB", items: [{ text: handoff?.summary || s.notes || "No details recorded.", status: "info" }] }],
          };
        });
        setShifts(live);
        if (live.length) setExpandedId(live[0].id);
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
  }, []);

  const speakHandoff = (shift) => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const lines = [`Shift handoff for ${shift.shift}, ${shift.date}.`, shift.summary,
      ...shift.sections.flatMap(s => [`${s.title}:`, ...s.items.map(i => i.text)])];
    const utterance = new SpeechSynthesisUtterance(lines.join(". "));
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Shift Handoff</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>24/7 Care Continuity</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: C.textMuted }}>Auto-generated briefings from every RHONDA action during the shift. Listen or read — nothing falls through the cracks between shifts.</p>
        </div>

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
                    border: `1px solid ${isExpanded ? C.accent : C.borderLight}`,
                    borderBottom: isExpanded ? `1px solid ${C.borderLight}` : undefined,
                    padding: "18px 22px", cursor: "pointer",
                    boxShadow: isExpanded ? `0 0 0 3px ${C.accentLight}` : "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{shift.shift}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{shift.date} — {shift.time} — Supervisor: {shift.supervisor} — {shift.crew} staff</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {dangerCount > 0 && <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(197,48,48,0.08)", color: C.danger }}>{dangerCount} critical</span>}
                      {warningCount > 0 && <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(245,158,11,0.08)", color: C.orange }}>{warningCount} attention</span>}
                      <span style={{ fontSize: 18, color: C.textMuted, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>&#9662;</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ background: C.surface, borderRadius: "0 0 14px 14px", borderLeft: `1px solid ${C.accent}`, borderRight: `1px solid ${C.accent}`, borderBottom: `1px solid ${C.accent}`, padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div style={{ flex: 1, padding: "14px 18px", borderRadius: 10, background: C.accentLight, border: `1px solid rgba(59,119,187,0.2)`, fontSize: 13, lineHeight: 1.6, color: C.text }}>
                        <strong style={{ color: C.accent }}>Summary:</strong> {shift.summary}
                      </div>
                      <button onClick={() => speakHandoff(shift)}
                        style={{ marginLeft: 12, width: 48, height: 48, borderRadius: "50%", border: "none", background: speaking ? C.danger : C.accent, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {speaking ? "\u23F8" : "\uD83D\uDD0A"}
                      </button>
                    </div>

                    {shift.sections.map((section, si) => (
                      <div key={si} style={{ marginBottom: si < shift.sections.length - 1 ? 16 : 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{section.icon}</span> {section.title}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {section.items.map((item, ii) => {
                            const st = STATUS_STYLE[item.status] || STATUS_STYLE.info;
                            return (
                              <div key={ii} style={{ padding: "10px 14px", borderRadius: 8, background: st.bg, borderLeft: `3px solid ${st.color}`, fontSize: 13, lineHeight: 1.5, color: C.text }}>
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
