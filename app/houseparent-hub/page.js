"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2F2A", accent: "#2E7D6F",
  accentLight: "rgba(46,125,111,0.1)", red: "#C53030", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", gold: "#C49B2A", blue: "#3B82F6",
};

// Kings Home cottages with live-in houseparent couples
const COTTAGES = [
  {
    name: "Oak Hill", campus: "Chelsea Main", program: "Moderate", capacity: 8, current: 7,
    houseparents: "Mark & Sarah Collins",
    residents: [
      { initials: "MT", age: 15, stayDays: 70, mood: "stable", note: "Good week — passed math test. Call with mom scheduled Thursday." },
      { initials: "JW", age: 14, stayDays: 34, mood: "improving", note: "Adjusted to routine. Started equine therapy Tuesdays." },
      { initials: "KD", age: 16, stayDays: 112, mood: "stable", note: "Job skills class going well. ISP review next week." },
      { initials: "RH", age: 13, stayDays: 8, mood: "adjusting", note: "New admit. Homesick. Extra check-ins at bedtime." },
      { initials: "AM", age: 17, stayDays: 203, mood: "stable", note: "TLP transition discussion started. Strong candidate." },
      { initials: "DB", age: 15, stayDays: 91, mood: "struggling", note: "Refused school Monday. Meeting with counselor Wednesday." },
      { initials: "CP", age: 14, stayDays: 55, mood: "improving", note: "De-escalation techniques working. Zero incidents this month." },
    ],
    recentLogs: [
      { time: "7:15 AM", type: "routine", text: "All youth up and ready for school. Breakfast completed. Meds distributed." },
      { time: "3:45 PM", type: "note", text: "RH had a rough afternoon — missing family. Sat with him on the porch for 20 mins. Seemed better after." },
      { time: "6:00 PM", type: "routine", text: "Dinner. Homework hour. DB refused homework — redirected to reading instead." },
      { time: "9:30 PM", type: "routine", text: "All youth in rooms. Lights out at 10. Quiet evening." },
    ],
    alerts: [],
  },
  {
    name: "Cedar Ridge", campus: "Chelsea Main", program: "Moderate", capacity: 8, current: 8,
    houseparents: "James & Patricia Young",
    residents: [
      { initials: "JW2", age: 14, stayDays: 28, mood: "adjusting", note: "New to program. Testing boundaries — normal." },
      { initials: "TS", age: 15, stayDays: 145, mood: "stable", note: "Basketball team. Grades improving." },
      { initials: "LM", age: 16, stayDays: 88, mood: "stable", note: "Working at Prodigal Pottery on weekends." },
      { initials: "RW", age: 13, stayDays: 62, mood: "improving", note: "First successful home visit last weekend." },
      { initials: "BT", age: 15, stayDays: 177, mood: "stable", note: "ISP goals on track. Family engagement increasing." },
      { initials: "MC", age: 14, stayDays: 41, mood: "struggling", note: "Two behavioral incidents this week. Added counseling session." },
      { initials: "AJ", age: 16, stayDays: 210, mood: "stable", note: "Discharge planning initiated. Foster family identified." },
      { initials: "DK", age: 15, stayDays: 95, mood: "improving", note: "Started garden therapy. Positive response." },
    ],
    recentLogs: [
      { time: "6:30 AM", type: "routine", text: "Wake up. JW2 slow to get moving — needed two prompts." },
      { time: "11:00 AM", type: "incident", text: "MC verbal altercation with BT. De-escalated without restraint. Separated for 30 min cool-down." },
      { time: "4:00 PM", type: "note", text: "AJ had discharge planning meeting with caseworker. Emotional but positive." },
      { time: "8:00 PM", type: "routine", text: "Movie night as reward for good week. All youth participated." },
    ],
    alerts: [{ type: "attention", text: "MC — two incidents this week. Monitor closely. Counselor notified." }],
  },
  {
    name: "Jane's House", campus: "Chelsea Main", program: "TLP Girls", capacity: 8, current: 5,
    houseparents: "Angela & David Price",
    residents: [
      { initials: "DR", age: 16, stayDays: 22, mood: "adjusting", note: "New to TLP. Learning independent living skills." },
      { initials: "SM", age: 18, stayDays: 310, mood: "stable", note: "Working part-time at Chick-fil-A. Saving for apartment deposit." },
      { initials: "KJ", age: 17, stayDays: 188, mood: "stable", note: "GED prep going well. Test scheduled April." },
      { initials: "LW", age: 19, stayDays: 425, mood: "stable", note: "Community college classes started. Budget management strong." },
      { initials: "NB", age: 17, stayDays: 95, mood: "improving", note: "Cooking skills improving. Made dinner for the house last Thursday." },
    ],
    recentLogs: [
      { time: "7:00 AM", type: "routine", text: "SM and LW self-managed morning routine. Others needed reminders." },
      { time: "2:00 PM", type: "note", text: "DR practiced grocery shopping with budget. Stayed under $40 for the week." },
      { time: "5:30 PM", type: "note", text: "NB cooked spaghetti for the house. Everyone helped clean up." },
      { time: "10:00 PM", type: "routine", text: "House quiet. LW studying for exam. SM doing laundry." },
    ],
    alerts: [],
  },
  {
    name: "Elm Cottage", campus: "Chelsea Main", program: "TLP Boys", capacity: 8, current: 6,
    houseparents: "Robert & Linda Foster",
    residents: [
      { initials: "TB", age: 17, stayDays: 198, mood: "stable", note: "6-month QRTP review overdue — needs scheduling." },
      { initials: "JC", age: 18, stayDays: 340, mood: "stable", note: "Employed at auto shop. Excellent attendance." },
      { initials: "WM", age: 16, stayDays: 78, mood: "improving", note: "Started driver's ed. Motivated." },
      { initials: "PL", age: 19, stayDays: 400, mood: "stable", note: "Apartment application submitted. Discharge planning active." },
      { initials: "RM", age: 17, stayDays: 122, mood: "stable", note: "Internship at King's Home Stables. Loves it." },
      { initials: "EG", age: 16, stayDays: 45, mood: "adjusting", note: "Transitioning from Moderate program. Some regression expected." },
    ],
    recentLogs: [
      { time: "6:45 AM", type: "routine", text: "JC and PL left for work by 7. Others to school." },
      { time: "3:00 PM", type: "note", text: "RM back from Stables internship. Taught a new resident how to groom a horse." },
      { time: "7:00 PM", type: "note", text: "Budget night. PL showed others his apartment savings spreadsheet. Peer modeling." },
      { time: "9:00 PM", type: "routine", text: "All in. EG called previous foster family — seemed comforted." },
    ],
    alerts: [{ type: "deadline", text: "TB — 6-month QRTP review 10 days overdue. Schedule immediately." }],
  },
];

const MOOD_COLORS = {
  stable: C.green, improving: C.blue, adjusting: C.orange, struggling: C.red,
};

export default function HouseparentHubPage() {
  const [selectedCottage, setSelectedCottage] = useState(COTTAGES[0].name);
  const cottage = COTTAGES.find(c => c.name === selectedCottage);

  const totalResidents = COTTAGES.reduce((s, c) => s + c.current, 0);
  const totalCapacity = COTTAGES.reduce((s, c) => s + c.capacity, 0);
  const alertCount = COTTAGES.reduce((s, c) => s + c.alerts.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Houseparent Hub</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(46,125,111,0.15)", color: "#7BCDB8", fontSize: 11, fontWeight: 700 }}>Daily Care Operations</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Residents", value: totalResidents, color: C.accent },
            { label: "Capacity", value: `${totalResidents}/${totalCapacity}`, color: C.text },
            { label: "Cottages Active", value: COTTAGES.length, color: C.blue },
            { label: "Alerts", value: alertCount, color: alertCount > 0 ? C.red : C.green },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Cottage selector */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${COTTAGES.length}, 1fr)`, gap: 8, marginBottom: 20 }}>
          {COTTAGES.map(c => (
            <button key={c.name} onClick={() => setSelectedCottage(c.name)}
              style={{
                padding: "12px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                border: `1.5px solid ${selectedCottage === c.name ? C.accent : C.border}`,
                background: selectedCottage === c.name ? C.accentLight : C.surface,
              }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{c.program} &middot; {c.current}/{c.capacity}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{c.houseparents}</div>
              {c.alerts.length > 0 && <div style={{ fontSize: 11, color: C.red, fontWeight: 700, marginTop: 4 }}>{c.alerts.length} alert{c.alerts.length > 1 ? "s" : ""}</div>}
            </button>
          ))}
        </div>

        {cottage && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Residents */}
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>
                Residents ({cottage.current})
              </h3>
              {cottage.residents.map((r, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 700,
                    }}>{r.initials}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Age {r.age}</span>
                      <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>Day {r.stayDays}</span>
                    </div>
                    <span style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                      color: MOOD_COLORS[r.mood], background: `${MOOD_COLORS[r.mood]}15`,
                    }}>{r.mood}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginLeft: 42, lineHeight: 1.5 }}>{r.note}</div>
                </div>
              ))}
            </div>

            {/* Daily Log + Alerts */}
            <div>
              {/* Alerts */}
              {cottage.alerts.length > 0 && (
                <div style={{ background: "rgba(197,48,48,0.04)", borderRadius: 12, border: `1px solid rgba(197,48,48,0.15)`, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>Alerts</div>
                  {cottage.alerts.map((a, i) => (
                    <div key={i} style={{ fontSize: 13, color: C.text, padding: "6px 0" }}>{a.text}</div>
                  ))}
                </div>
              )}

              {/* Daily log */}
              <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Today's Log</h3>
                  <button style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    + Add Entry
                  </button>
                </div>
                {cottage.recentLogs.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, width: 60, flexShrink: 0 }}>{log.time}</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, flexShrink: 0, height: "fit-content",
                      background: log.type === "incident" ? "rgba(197,48,48,0.1)" : log.type === "note" ? "rgba(59,130,246,0.08)" : C.borderLight,
                      color: log.type === "incident" ? C.red : log.type === "note" ? C.blue : C.textMuted,
                      textTransform: "uppercase",
                    }}>{log.type}</span>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{log.text}</div>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20, marginTop: 16 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: C.text }}>Cottage Stats</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Program: <span style={{ color: C.text, fontWeight: 600 }}>{cottage.program}</span></div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Campus: <span style={{ color: C.text, fontWeight: 600 }}>{cottage.campus}</span></div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Occupancy: <span style={{ color: C.text, fontWeight: 600 }}>{cottage.current}/{cottage.capacity}</span></div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Houseparents: <span style={{ color: C.text, fontWeight: 600 }}>{cottage.houseparents}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
