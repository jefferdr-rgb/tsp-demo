"use client";
import { useState, useRef, Suspense } from "react";
import { useToolClient } from "../_lib/useToolClient";

// ── Markdown-to-HTML ────────────────────────────────────────────────────────
function md(text, accent, chrome) {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, `<h3 style="font-size:14px;font-weight:700;color:${chrome};margin:14px 0 4px">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:17px;font-weight:700;color:${accent};margin:20px 0 6px;text-transform:uppercase;letter-spacing:0.5px">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:22px;font-weight:700;color:${chrome};margin:24px 0 8px">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, `<li style="margin:3px 0;font-size:13px;color:${chrome};margin-left:16px">$1</li>`)
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d6d1c4;margin:16px 0">')
    .replace(/\n\n/g, "<br>")
    .replace(/\n/g, "\n");
}

const PLANTS = [
  { id: "redBay", name: "Red Bay, AL", capacity: 750000, flagship: true },
  { id: "tupelo", name: "Tupelo, MS", capacity: 400000 },
  { id: "dublin", name: "Dublin, GA", capacity: 350000 },
  { id: "greenville", name: "Greenville, NC", capacity: 300000 },
  { id: "halifax", name: "Halifax, VA", capacity: 280000 },
  { id: "elkhart", name: "Elkhart, IN", capacity: 250000 },
  { id: "joplin", name: "Joplin, MO", capacity: 220000 },
];

const DOWNTIME_REASONS = ["Mechanical", "Changeover", "Quality Hold", "Ingredient Shortage", "Scheduled Maintenance", "Electrical", "Staffing", "Other"];
const SHIFTS = ["Day (6A-6P)", "Night (6P-6A)", "Split"];

const emptyPlantData = () => ({
  dailyOutput: "",
  lineEfficiency: "",
  downtimeHours: "",
  downtimeReason: "",
  productRunning: "",
  shift: "Day (6A-6P)",
});

function ProductionPulseContent() {
  const { client, colors } = useToolClient();
  const C = colors;

  const [plantData, setPlantData] = useState(
    Object.fromEntries(PLANTS.map((p) => [p.id, emptyPlantData()]))
  );
  const [activePlant, setActivePlant] = useState("redBay");
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const briefingRef = useRef(null);

  const updatePlant = (plantId, field, value) => {
    setPlantData((prev) => ({
      ...prev,
      [plantId]: { ...prev[plantId], [field]: value },
    }));
  };

  const filledPlants = PLANTS.filter((p) => {
    const d = plantData[p.id];
    return d.dailyOutput || d.lineEfficiency;
  });

  const totalOutput = PLANTS.reduce((sum, p) => sum + (parseFloat(plantData[p.id].dailyOutput) || 0), 0);
  const avgEfficiency = (() => {
    const filled = PLANTS.filter((p) => plantData[p.id].lineEfficiency);
    if (filled.length === 0) return 0;
    return (filled.reduce((sum, p) => sum + parseFloat(plantData[p.id].lineEfficiency), 0) / filled.length).toFixed(1);
  })();
  const totalDowntime = PLANTS.reduce((sum, p) => sum + (parseFloat(plantData[p.id].downtimeHours) || 0), 0);

  const generateBriefing = async () => {
    if (filledPlants.length === 0) {
      setError("Enter data for at least one plant.");
      return;
    }
    setLoading(true);
    setError("");
    setBriefing("");

    try {
      const systemPrompt = `You are RHONDA, an AI production operations assistant for ${client.name}. ${client.systemContext}

You generate daily production briefings for the CEO and plant managers. Be concise, data-driven, and flag anything that needs executive attention. Think like a COO — what would the leadership team need to know at 7 AM?`;

      const plantSummaries = PLANTS.map((p) => {
        const d = plantData[p.id];
        if (!d.dailyOutput && !d.lineEfficiency) return null;
        return `${p.name}${p.flagship ? " (Flagship)" : ""}:
  - Daily Output: ${d.dailyOutput ? d.dailyOutput + " lbs" : "Not reported"}
  - Capacity: ${p.capacity.toLocaleString()} lbs/day
  - Utilization: ${d.dailyOutput ? ((parseFloat(d.dailyOutput) / p.capacity) * 100).toFixed(1) + "%" : "—"}
  - Line Efficiency: ${d.lineEfficiency ? d.lineEfficiency + "%" : "Not reported"}
  - Downtime: ${d.downtimeHours ? d.downtimeHours + " hrs" : "None reported"} ${d.downtimeReason ? `(${d.downtimeReason})` : ""}
  - Product Running: ${d.productRunning || "Not specified"}
  - Shift: ${d.shift}`;
      }).filter(Boolean).join("\n\n");

      const promptText = `Generate a MORNING PRODUCTION BRIEFING for ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}:

PLANT DATA:
${plantSummaries}

NETWORK TOTALS:
- Total Output: ${totalOutput.toLocaleString()} lbs
- Total Network Capacity: ${PLANTS.reduce((s, p) => s + p.capacity, 0).toLocaleString()} lbs/day
- Average Line Efficiency: ${avgEfficiency}%
- Total Downtime: ${totalDowntime} hours

Generate:

## EXECUTIVE SUMMARY
3-4 bullet executive summary. Lead with the headline number.

## PLANT-BY-PLANT STATUS
For each plant with data, give a 2-line status. Flag plants running below 80% efficiency or 70% capacity utilization in RED.

## PRODUCTION CONCERNS
Any downtime, low efficiency, or capacity issues that need attention today.

## NETWORK OPTIMIZATION
Are we balanced across plants? Any recommendations to shift production?

## TODAY'S PRIORITIES
Top 3 action items for the production leadership team.`;

      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{ role: "user", content: [{ type: "text", text: promptText }] }],
          system: systemPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `API error: ${res.status}`);
      setBriefing(data.content?.[0]?.text || "No briefing generated.");
      setTimeout(() => briefingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const current = plantData[activePlant];
  const activePlantInfo = PLANTS.find((p) => p.id === activePlant);
  const utilPct = current.dailyOutput ? ((parseFloat(current.dailyOutput) / activePlantInfo.capacity) * 100).toFixed(1) : null;
  const isLowEff = current.lineEfficiency && parseFloat(current.lineEfficiency) < 80;
  const isLowUtil = utilPct && parseFloat(utilPct) < 70;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Production Pulse</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{client.name}</span>
          <a href={client.backHref} style={{ color: C.accent, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>Production Pulse</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Multi-plant production visibility. Enter data, generate the morning briefing.</p>
        </div>

        {/* KPI Summary Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Output", value: totalOutput > 0 ? `${(totalOutput / 1000).toFixed(0)}K lbs` : "—", color: C.accent },
            { label: "Avg Efficiency", value: avgEfficiency > 0 ? `${avgEfficiency}%` : "—", color: parseFloat(avgEfficiency) >= 85 ? "#4a6540" : parseFloat(avgEfficiency) >= 75 ? "#b8860b" : C.danger },
            { label: "Total Downtime", value: totalDowntime > 0 ? `${totalDowntime} hrs` : "0 hrs", color: totalDowntime > 8 ? C.danger : totalDowntime > 4 ? "#b8860b" : "#4a6540" },
            { label: "Plants Reporting", value: `${filledPlants.length} / ${PLANTS.length}`, color: C.accent },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Plant Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {PLANTS.map((p) => {
            const d = plantData[p.id];
            const hasDt = d.dailyOutput || d.lineEfficiency;
            const eff = parseFloat(d.lineEfficiency);
            let dotColor = "transparent";
            if (hasDt) dotColor = eff >= 85 ? "#4a6540" : eff >= 75 ? "#b8860b" : eff ? C.danger : C.accent;

            return (
              <button key={p.id} onClick={() => setActivePlant(p.id)}
                style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${activePlant === p.id ? C.accent : C.border}`, background: activePlant === p.id ? C.accentLight : C.surface, color: activePlant === p.id ? C.accent : C.textMuted, fontWeight: activePlant === p.id ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
                {hasDt && <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor }} />}
                {p.name}
                {p.flagship && <span style={{ fontSize: 10, opacity: 0.6 }}>HQ</span>}
              </button>
            );
          })}
        </div>

        {/* Active Plant Form */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24, position: "relative", overflow: "hidden" }}>
          {(isLowEff || isLowUtil) && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.danger }} />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>{activePlantInfo.name}</h2>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Capacity: {activePlantInfo.capacity.toLocaleString()} lbs/day{activePlantInfo.flagship ? " — Flagship Plant" : ""}</div>
            </div>
            {utilPct && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: parseFloat(utilPct) >= 80 ? "#4a6540" : parseFloat(utilPct) >= 60 ? "#b8860b" : C.danger }}>{utilPct}%</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Capacity Utilization</div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Daily Output (lbs)</label>
              <input type="text" value={current.dailyOutput} onChange={(e) => updatePlant(activePlant, "dailyOutput", e.target.value)} placeholder={`Target: ${activePlantInfo.capacity.toLocaleString()}`} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Line Efficiency %</label>
              <input type="text" value={current.lineEfficiency} onChange={(e) => updatePlant(activePlant, "lineEfficiency", e.target.value)} placeholder="e.g. 87" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${isLowEff ? C.danger : C.border}`, background: isLowEff ? C.dangerBg : C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Downtime Hours</label>
              <input type="text" value={current.downtimeHours} onChange={(e) => updatePlant(activePlant, "downtimeHours", e.target.value)} placeholder="e.g. 2.5" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Downtime Reason</label>
              <select value={current.downtimeReason} onChange={(e) => updatePlant(activePlant, "downtimeReason", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}>
                <option value="">None / N/A</option>
                {DOWNTIME_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Product Running</label>
              <input type="text" value={current.productRunning} onChange={(e) => updatePlant(activePlant, "productRunning", e.target.value)} placeholder="e.g. Evolve Classic Chicken 30lb" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Shift</label>
              <select value={current.shift} onChange={(e) => updatePlant(activePlant, "shift", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}>
                {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Generate Briefing */}
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 8, background: C.dangerBg, color: C.danger, fontSize: 13 }}>{error}</div>
        )}

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button onClick={generateBriefing} disabled={loading || filledPlants.length === 0}
            style={{ padding: "14px 44px", borderRadius: 10, border: "none", background: loading || filledPlants.length === 0 ? C.border : C.accent, color: loading || filledPlants.length === 0 ? C.textMuted : "#fff", fontSize: 16, fontWeight: 700, cursor: loading || filledPlants.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8 }}>
            {loading ? (
              <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Generating Briefing...</>
            ) : "Generate Morning Briefing"}
          </button>
        </div>

        {/* Briefing Output */}
        {(briefing || loading) && (
          <div ref={briefingRef} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.accent, borderRadius: 2, display: "inline-block" }} />
                Morning Production Briefing
              </h2>
              {briefing && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(briefing); setShowCopied(true); setTimeout(() => setShowCopied(false), 2000); }}
                    style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: showCopied ? C.accentLight : C.surface, color: showCopied ? C.accent : C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    {showCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 40px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 1.7, fontSize: 14, color: C.text }}>
              {loading && !briefing ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted }}>
                  <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>RHONDA is assembling the morning briefing...</div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: md(briefing, C.accent, C.text) }} />
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

export default function ProductionPulsePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f4f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif", color: "#7a7462" }}>Loading...</div>}>
      <ProductionPulseContent />
    </Suspense>
  );
}
