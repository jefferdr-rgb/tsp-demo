"use client";
import { useState } from "react";
import { useVoiceInput } from "../_lib/useVoiceInput";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#0D1B2A", accent: "#1B4D8F",
  accentLight: "rgba(27,77,143,0.12)", accentGlow: "rgba(27,77,143,0.25)",
  red: "#C4352A", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2332", textMuted: "#5a6678", gold: "#c49b2a",
};

// Demo: 3 real acquisitions from John's history
const ACQUISITIONS = [
  {
    id: "lee-smith", name: "Lee-Smith (Bristol, VA)", acquired: "Feb 2025", status: "integrating",
    progress: 62, totalTasks: 47, completedTasks: 29,
    phases: [
      { name: "Legal & Financial Close", status: "done", tasks: 8, done: 8 },
      { name: "IT & Systems Merge", status: "active", tasks: 12, done: 7 },
      { name: "Parts Inventory Unification", status: "active", tasks: 9, done: 5 },
      { name: "Staff Cross-Training", status: "active", tasks: 10, done: 6 },
      { name: "Customer Migration", status: "pending", tasks: 8, done: 3 },
    ],
    blockers: [
      "DBS migration stalled — waiting on International dealer code transfer (3 weeks overdue)",
      "2 senior techs undecided on staying — retention bonuses not yet approved",
    ],
    lessons: [
      "Parts catalog merge took 3x longer than Landmark — Lee-Smith had 15 years of custom part numbers",
      "Customer notification letter worked better than email (87% open vs 23%)",
    ],
  },
  {
    id: "landmark", name: "Landmark Trucks (Cookeville, TN)", acquired: "2022", status: "complete",
    progress: 100, totalTasks: 42, completedTasks: 42,
    phases: [
      { name: "Legal & Financial Close", status: "done", tasks: 7, done: 7 },
      { name: "IT & Systems Merge", status: "done", tasks: 10, done: 10 },
      { name: "Parts Inventory Unification", status: "done", tasks: 8, done: 8 },
      { name: "Staff Cross-Training", status: "done", tasks: 9, done: 9 },
      { name: "Customer Migration", status: "done", tasks: 8, done: 8 },
    ],
    blockers: [],
    lessons: [
      "Kept GM for 6 months as transition manager — smoothest handoff of the three",
      "International parts numbering system had to be rebuilt from scratch — 3 month delay",
      "Cookeville techs adapted to our warranty process faster when paired with Knoxville mentors",
    ],
  },
  {
    id: "tru-power", name: "Tru-Power (Corona, CA)", acquired: "2020", status: "complete",
    progress: 100, totalTasks: 38, completedTasks: 38,
    phases: [
      { name: "Legal & Financial Close", status: "done", tasks: 6, done: 6 },
      { name: "IT & Systems Merge", status: "done", tasks: 9, done: 9 },
      { name: "Parts Inventory Unification", status: "done", tasks: 7, done: 7 },
      { name: "Staff Cross-Training", status: "done", tasks: 8, done: 8 },
      { name: "Customer Migration", status: "done", tasks: 8, done: 8 },
    ],
    blockers: [],
    lessons: [
      "West coast distribution required separate shipping contracts — don't assume national pricing applies",
      "Honda dealer certification transfer took 4 months, not the expected 6 weeks",
      "Tru-Power's CRM data was mostly in spreadsheets — budget 2 months for data cleanup next time",
    ],
  },
];

export default function AcquisitionIntegratorPage() {
  const voice = useVoiceInput({ lang: "en-US" });
  const [selected, setSelected] = useState(ACQUISITIONS[0]);
  const [askInput, setAskInput] = useState("");
  const [askResult, setAskResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("dashboard"); // dashboard | playbook

  async function handleAsk() {
    const q = askInput.trim();
    if (!q || loading) return;
    setLoading(true);
    setAskResult(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("/api/rhonda", {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: `You are RHONDA's Acquisition Integrator for Thompson Distribution. You help John Thompson integrate newly acquired dealerships. You have context on 3 acquisitions: Tru-Power (2020, Corona CA — MTA), Landmark Trucks (2022, Cookeville TN), Lee-Smith (Feb 2025, Bristol VA — currently integrating). Reference lessons learned from past acquisitions when answering. Be specific and practical.`,
          messages: [{ role: "user", content: q }],
        }),
      });
      clearTimeout(timeout);
      const data = await res.json();
      setAskResult(data.content?.[0]?.text || data.error?.message || "No response");
    } catch (err) {
      setAskResult(`Error: ${err.name === "AbortError" ? "Request timed out" : err.message}`);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/thompson-distribution" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>
          &larr; RHONDA Home
        </a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>
          Acquisition Integrator
        </h1>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        {/* Acquisition selector */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {ACQUISITIONS.map(a => (
            <button key={a.id} onClick={() => setSelected(a)}
              style={{
                padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${selected.id === a.id ? C.accent : C.border}`,
                background: selected.id === a.id ? C.accentLight : C.surface, cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 4, minWidth: 200,
              }}>
              <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{a.name}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>
                Acquired {a.acquired} &middot; {a.status === "integrating" ? `${a.progress}% complete` : "Complete"}
              </span>
              {a.status === "integrating" && (
                <div style={{ width: "100%", height: 4, borderRadius: 2, background: C.borderLight, marginTop: 4 }}>
                  <div style={{ width: `${a.progress}%`, height: "100%", borderRadius: 2, background: a.progress < 80 ? C.red : C.accent }} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Phase tracker */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 16px" }}>
            Integration Phases — {selected.name}
          </h2>
          {selected.phases.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: p.status === "done" ? "#22c55e" : p.status === "active" ? C.accent : C.borderLight,
                color: p.status === "pending" ? C.textMuted : "#fff",
              }}>
                {p.status === "done" ? "\u2713" : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{p.done}/{p.tasks} tasks</div>
              </div>
              <div style={{ width: 120, height: 6, borderRadius: 3, background: C.borderLight }}>
                <div style={{ width: `${(p.done / p.tasks) * 100}%`, height: "100%", borderRadius: 3, background: p.status === "done" ? "#22c55e" : C.accent }} />
              </div>
            </div>
          ))}
        </div>

        {/* Blockers + Lessons side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.red, margin: "0 0 12px" }}>
              Blockers ({selected.blockers.length})
            </h3>
            {selected.blockers.length === 0
              ? <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>No active blockers</p>
              : selected.blockers.map((b, i) => (
                <div key={i} style={{ fontSize: 13, color: C.text, marginBottom: 8, paddingLeft: 12, borderLeft: `3px solid ${C.red}` }}>{b}</div>
              ))
            }
          </div>
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.gold, margin: "0 0 12px" }}>
              Lessons Learned ({selected.lessons.length})
            </h3>
            {selected.lessons.map((l, i) => (
              <div key={i} style={{ fontSize: 13, color: C.text, marginBottom: 8, paddingLeft: 12, borderLeft: `3px solid ${C.gold}` }}>{l}</div>
            ))}
          </div>
        </div>

        {/* Ask RHONDA about integrations */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: C.accent, margin: "0 0 12px" }}>
            Ask RHONDA About Integrations
          </h3>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 12px" }}>
            &quot;What went wrong with parts migration at Landmark?&quot; &middot; &quot;Create a 90-day checklist for Lee-Smith&quot; &middot; &quot;How long did IT merge take last time?&quot;
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={askInput} onChange={e => setAskInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAsk()}
              placeholder="Ask about any acquisition..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, background: C.bg, color: C.text }}
            />
            <button onClick={() => { if (voice.listening) { voice.stop(); setAskInput(prev => prev + " " + (voice.transcript || "")); } else { voice.start(); } }}
              style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${voice.listening ? C.red : C.border}`, background: voice.listening ? "rgba(196,53,42,0.1)" : C.surface, cursor: "pointer", fontSize: 18 }}>
              {voice.listening ? "\u23F9" : "\uD83C\uDF99\uFE0F"}
            </button>
            <button onClick={handleAsk} disabled={loading || !askInput.trim()}
              style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", cursor: loading ? "wait" : "pointer", fontWeight: 600, fontSize: 14, opacity: loading || !askInput.trim() ? 0.5 : 1 }}>
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>
          {askResult && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: C.bg, fontSize: 14, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {askResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
