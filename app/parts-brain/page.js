"use client";
import { useState } from "react";
import { useVoiceInput } from "../_lib/useVoiceInput";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#0D1B2A", accent: "#1B4D8F",
  accentLight: "rgba(27,77,143,0.12)", red: "#C4352A", green: "#22c55e",
  orange: "#F59E0B", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2332", textMuted: "#5a6678", gold: "#c49b2a",
};

// OEM brand colors
const BRANDS = {
  international: { name: "International", color: "#C4352A", short: "INTL" },
  ford: { name: "Ford", color: "#003478", short: "FORD" },
  isuzu: { name: "Isuzu", color: "#E60012", short: "ISZ" },
};

// Demo cross-reference data
const DEMO_LOOKUPS = [
  {
    query: "air filter 2022 LT",
    results: [
      { brand: "international", partNum: "3698049C1", desc: "Air Filter Element — Primary", price: 68.50, stock: { Knoxville: 4, Chattanooga: 2, Morristown: 0, Cookeville: 1, Bristol: 3 }, warranty: "12 months / 15,000 miles", notes: "Supersedes 3698049C91. Direct fit LT Series 2020+." },
    ],
    crossRef: [
      { brand: "Donaldson", partNum: "P628326", price: 52.00, note: "Aftermarket equivalent — customer saves $16.50" },
      { brand: "Baldwin", partNum: "RS5710", price: 48.75, note: "Economy option — shorter warranty" },
    ],
  },
  {
    query: "brake pads F-750",
    results: [
      { brand: "ford", partNum: "HC3Z-2001-B", desc: "Brake Pad Set — Front", price: 142.00, stock: { Knoxville: 6, Chattanooga: 3, Morristown: 2, Cookeville: 0, Bristol: 1 }, warranty: "24 months / 24,000 miles", notes: "Fits F-650/F-750 2017+. Ceramic compound." },
    ],
    crossRef: [
      { brand: "Raybestos", partNum: "ATD1680M", price: 98.00, note: "Semi-metallic alternative" },
    ],
  },
];

export default function PartsBrainPage() {
  const voice = useVoiceInput({ lang: "en-US" });
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches] = useState(["GX390 starter motor", "NPR-HD alternator", "LT625 DPF filter"]);

  async function handleSearch() {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);

    // Check demo data first
    const demo = DEMO_LOOKUPS.find(d => q.toLowerCase().includes(d.query.split(" ")[0].toLowerCase()));
    if (demo) {
      setResult({ type: "demo", data: demo });
      setLoading(false);
      return;
    }

    // Fall through to AI for anything else
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("/api/rhonda", {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: `You are RHONDA's Multi-Brand Parts Brain for Thompson Truck Group. You help techs and parts staff find the right part across International, Ford, and Isuzu inventories. When asked about a part:
1. Identify the OEM and correct part number
2. Check if it's in stock (simulate with realistic data for 5 locations: Knoxville, Chattanooga, Morristown, Cookeville, Bristol)
3. Suggest cross-references from other OEMs or aftermarket
4. Note any superseded part numbers or known fitment issues
Be specific with part numbers, prices, and availability. Format clearly.`,
          messages: [{ role: "user", content: q }],
        }),
      });
      clearTimeout(timeout);
      const data = await res.json();
      setResult({ type: "ai", text: data.content?.[0]?.text || data.error?.message || "No response" });
    } catch (err) {
      setResult({ type: "ai", text: `Error: ${err.name === "AbortError" ? "Request timed out" : err.message}` });
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/thompson-distribution" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Multi-Brand Parts Brain</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.values(BRANDS).map(b => (
            <span key={b.short} style={{ padding: "3px 8px", borderRadius: 4, background: b.color, color: "#fff", fontSize: 10, fontWeight: 700 }}>{b.short}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {/* Search */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: C.text, margin: "0 0 4px", fontWeight: 600 }}>What part do you need?</p>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 14px" }}>
            Search by part number, description, or just describe what you need. Works across International, Ford, and Isuzu.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder='e.g. "air filter 2022 LT" or "brake pads F-750" or "NPR-HD starter"'
              style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, background: C.bg, color: C.text }}
            />
            <button onClick={() => { if (voice.listening) { voice.stop(); setQuery(prev => prev + " " + (voice.transcript || "")); } else { voice.start(); } }}
              style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${voice.listening ? C.red : C.border}`, background: voice.listening ? "rgba(196,53,42,0.1)" : C.surface, cursor: "pointer", fontSize: 18 }}>
              {voice.listening ? "\u23F9" : "\uD83C\uDF99\uFE0F"}
            </button>
            <button onClick={handleSearch} disabled={loading || !query.trim()}
              style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", cursor: loading ? "wait" : "pointer", fontWeight: 600, fontSize: 14, opacity: loading || !query.trim() ? 0.5 : 1 }}>
              {loading ? "Searching..." : "Find Part"}
            </button>
          </div>
          {!result && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => setQuery(s)}
                  style={{ padding: "6px 12px", borderRadius: 16, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.textMuted }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {result?.type === "demo" && (
          <>
            {result.data.results.map((r, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <span style={{ padding: "3px 8px", borderRadius: 4, background: BRANDS[r.brand]?.color || C.accent, color: "#fff", fontSize: 10, fontWeight: 700, marginRight: 8 }}>
                      {BRANDS[r.brand]?.name || r.brand}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{r.partNum}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>${r.price.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: 14, color: C.text, marginBottom: 8 }}>{r.desc}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{r.notes}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Warranty: {r.warranty}</div>

                {/* Stock by location */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>STOCK BY LOCATION</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.entries(r.stock).map(([loc, qty]) => (
                      <div key={loc} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${qty === 0 ? C.red : C.border}`, background: qty === 0 ? "rgba(196,53,42,0.06)" : C.bg }}>
                        <div style={{ fontSize: 11, color: C.textMuted }}>{loc}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: qty === 0 ? C.red : C.green }}>{qty}</div>
                      </div>
                    ))}
                  </div>
                  {Object.values(r.stock).some(v => v === 0) && Object.values(r.stock).some(v => v > 0) && (
                    <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.2)`, fontSize: 12, color: C.text }}>
                      Out of stock at {Object.entries(r.stock).filter(([,q]) => q === 0).map(([l]) => l).join(", ")} — transfer available from {Object.entries(r.stock).filter(([,q]) => q > 0).sort((a,b) => b[1]-a[1])[0][0]}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Cross-references */}
            {result.data.crossRef?.length > 0 && (
              <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.gold, margin: "0 0 12px" }}>Cross-References & Alternatives</h3>
                {result.data.crossRef.map((cr, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < result.data.crossRef.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{cr.brand} {cr.partNum}</span>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{cr.note}</div>
                    </div>
                    <span style={{ fontWeight: 600, color: C.green, fontSize: 14 }}>${cr.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {result?.type === "ai" && (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, fontSize: 14, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {result.text}
          </div>
        )}
      </div>
    </div>
  );
}
