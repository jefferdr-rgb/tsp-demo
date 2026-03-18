"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", forest: "#2c3528", green: "#4a6540",
  border: "#d6d1c4", borderLight: "#e8e3d9", text: "#2c3528",
  textMuted: "#7a7462", danger: "#c0392b", dangerBg: "rgba(192,57,43,0.08)",
};

function md(text) {
  if (!text) return "";
  return text
    .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;color:#2c3528;margin:20px 0 8px">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;color:#c49b2a;margin:16px 0 6px;text-transform:uppercase;letter-spacing:0.5px">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:700;color:#2c3528;margin:12px 0 4px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- \[ \] (.+)$/gm, '<label style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;font-size:13px;color:#2c3528"><input type="checkbox" style="margin-top:2px;accent-color:#c49b2a"> <span>$1</span></label>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;font-size:13px;color:#2c3528;margin-left:16px">$1</li>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d6d1c4;margin:12px 0">')
    .replace(/⚠️/g, '<span style="color:#c0392b">⚠️</span>')
    .replace(/\[VERIFY\]/g, '<span style="background:#fff3cd;color:#856404;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:600">VERIFY</span>')
    .replace(/\n\n/g, "<br>")
    .replace(/\n/g, "\n");
}

// ── Language config ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Espanol", flag: "🇲🇽" },
  { code: "vi", label: "Tieng Viet", flag: "🇻🇳" },
];

// ── Demo asset data (localStorage-backed for prototype) ─────────────────────
function getAssets() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("rhonda_assets") || "{}"); } catch { return {}; }
}

// ── Pre-loaded demo assets ──────────────────────────────────────────────────
const DEMO_ASSETS = {
  "demo-extruder-01": {
    id: "demo-extruder-01",
    name: "Kibble Extruder #1",
    location: "Production Floor — Line A",
    type: "Equipment",
    department: "Production",
    createdAt: "2026-03-10",
    sop: `# SOP: Kibble Extruder Startup Procedure
**Department:** Production
**Effective Date:** March 10, 2026
**Version:** 1.0 — Generated from worker interview

---

## Purpose
Ensure safe and consistent startup of Kibble Extruder #1 to maintain product quality and operator safety.

## Scope
Applies to all extruder operators on Line A, all shifts.

## Required PPE
- Safety glasses
- Heat-resistant gloves
- Steel-toe boots
- Hearing protection

## Tools & Materials
- Extruder control panel
- Temperature probe
- Startup checklist clipboard
- Raw material batch ticket

## Procedure

### Step 1: Pre-Startup Safety Check
Inspect the extruder barrel, die plate, and knife assembly for damage or residual material from previous run. Ensure all guards are in place.

### Step 2: Verify Raw Materials
Confirm batch ticket matches the production schedule. Check moisture content of incoming mix — must be between 22-28%.

### Step 3: Set Temperature Zones
Set barrel zone 1 to 80°C, zone 2 to 110°C, zone 3 to 135°C. Allow 15 minutes for zones to reach target ±3°C.

### Step 4: Start Conditioner
Engage the conditioner at low speed. Gradually introduce raw material. Monitor steam injection pressure at 2.5-3.0 bar.

### Step 5: Engage Extruder Screw
Start extruder screw at 150 RPM. Slowly increase to operating speed of 350 RPM over 5 minutes. ⚠️ Never exceed 400 RPM.

### Step 6: Verify Output Quality
Collect sample at die exit. Check kibble diameter (8-10mm), density, and color. Compare to reference sample posted at station.

### Step 7: Confirm Steady State
Once output is consistent for 3 consecutive minutes, log startup time on batch record and notify QA for first-piece inspection.

## Safety Warnings
⚠️ Extruder barrel exceeds 135°C — always wear heat-resistant gloves when near barrel
⚠️ Never reach into die area while screw is rotating
⚠️ Emergency stop button is on the left side of the control panel — know its location

## Quality Checkpoints
- [ ] Moisture content of raw mix: 22-28%
- [ ] Temperature zones within ±3°C of target
- [ ] Steam pressure: 2.5-3.0 bar
- [ ] Screw speed: 350 RPM (max 400)
- [ ] Kibble diameter: 8-10mm
- [ ] First-piece inspection by QA

---

## Daily Checklist Version

- [ ] Step 1: Safety check — barrel, die, knife, guards
- [ ] Step 2: Verify batch ticket and moisture (22-28%)
- [ ] Step 3: Set temps — 80°C / 110°C / 135°C — wait 15 min
- [ ] Step 4: Start conditioner, introduce material, steam 2.5-3.0 bar
- [ ] Step 5: Screw to 150 RPM → ramp to 350 RPM over 5 min
- [ ] Step 6: Sample check — diameter, density, color
- [ ] Step 7: Log startup, notify QA

---
*Generated by RHONDA from worker interview on March 10, 2026. Review and approve before use.*`,
    maintenance: [
      { date: "2026-03-15", type: "Preventive", note: "Replaced die plate gasket. Barrel inspection — no wear detected.", by: "Mike T." },
      { date: "2026-03-08", type: "Corrective", note: "Knife assembly misalignment causing irregular kibble shape. Realigned and torqued to spec.", by: "Carlos R." },
      { date: "2026-02-20", type: "Preventive", note: "Scheduled lubrication of screw bearings. Oil analysis within spec.", by: "Mike T." },
      { date: "2026-02-01", type: "Preventive", note: "Full barrel inspection. Zone 2 heater band showing wear — ordered replacement.", by: "Mike T." },
    ],
    issues: [
      { status: "open", note: "Zone 2 heater band approaching end of life — replacement on order (ETA March 25)", reported: "2026-02-01" },
      { status: "resolved", note: "Knife assembly vibration at >380 RPM — resolved with realignment 3/8", reported: "2026-03-05" },
    ],
  },
};

export default function AssetPage() {
  const params = useParams();
  const id = params.id;
  const [asset, setAsset] = useState(null);
  const [activeTab, setActiveTab] = useState("sop");
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [translatedSops, setTranslatedSops] = useState({}); // { "es": "...", "vi": "..." }

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language?.split("-")[0] || "en";
    const supported = LANGUAGES.find(l => l.code === browserLang);
    if (supported && supported.code !== "en") {
      setCurrentLang(supported.code);
    }
  }, []);

  useEffect(() => {
    if (DEMO_ASSETS[id]) {
      setAsset(DEMO_ASSETS[id]);
    } else {
      const assets = getAssets();
      if (assets[id]) setAsset(assets[id]);
    }
    setLoading(false);
  }, [id]);

  // Auto-translate when language changes
  useEffect(() => {
    if (!asset?.sop || currentLang === "en") return;
    if (translatedSops[currentLang]) return; // already cached

    // Check localStorage cache
    const cacheKey = `sop_${id}_${currentLang}`;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslatedSops(prev => ({ ...prev, [currentLang]: cached }));
        return;
      }
    }

    // Fetch translation
    setTranslating(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: asset.sop,
        targetLang: currentLang,
        context: "a Standard Operating Procedure (SOP) for manufacturing equipment",
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.translated) {
          setTranslatedSops(prev => ({ ...prev, [currentLang]: data.translated }));
          // Cache in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(cacheKey, data.translated);
          }
        }
      })
      .catch(() => {})
      .finally(() => setTranslating(false));
  }, [currentLang, asset, id, translatedSops]);

  const displaySop = currentLang === "en" ? asset?.sop : (translatedSops[currentLang] || asset?.sop);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.textMuted, fontSize: 14 }}>Loading...</div>
    </div>
  );

  if (!asset) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>Asset Not Found</div>
      <div style={{ color: C.textMuted, fontSize: 14 }}>No asset registered with ID: {id}</div>
      <a href="/asset-manager" style={{ color: C.gold, fontSize: 14, textDecoration: "none", marginTop: 8 }}>Go to Asset Manager →</a>
    </div>
  );

  const tabs = [
    { key: "sop", label: "SOP", icon: "📋" },
    { key: "maintenance", label: "Maintenance", icon: "🔧" },
    { key: "issues", label: "Issues", icon: "⚠️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 20px", borderBottom: `3px solid ${C.gold}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/asset-manager" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                ← Assets
              </a>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>|</span>
              <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>RHONDA Asset</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>|</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{asset.department || "General"}</span>
            </div>
            <a href="/sunshine" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              RHONDA Home
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{asset.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{asset.location}</div>
              {asset.type && (
                <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 600, background: "rgba(196,155,42,0.2)", color: C.gold, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.5 }}>{asset.type}</span>
              )}
            </div>
            {/* Action links */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <a href={`/incident-report?asset=${id}&location=${encodeURIComponent(asset.location)}&equipment=${encodeURIComponent(asset.name)}`}
                style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: C.danger, padding: "5px 12px", borderRadius: 6, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                ⚠ Report Issue
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 0 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ flex: 1, padding: "12px 8px", border: "none", cursor: "pointer", background: activeTab === tab.key ? C.goldLight : "transparent", borderBottom: activeTab === tab.key ? `3px solid ${C.gold}` : "3px solid transparent", color: activeTab === tab.key ? C.gold : C.textMuted, fontWeight: activeTab === tab.key ? 700 : 500, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}>
              <span>{tab.icon}</span> {tab.label}
              {tab.key === "issues" && asset.issues?.filter(i => i.status === "open").length > 0 && (
                <span style={{ background: C.danger, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px", minWidth: 16, textAlign: "center" }}>
                  {asset.issues.filter(i => i.status === "open").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>

        {/* SOP Tab */}
        {activeTab === "sop" && (
          <div>
            {/* Language Selector */}
            {asset.sop && (
              <div style={{ display: "flex", gap: 6, marginBottom: 16, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginRight: 4 }}>Language:</span>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => setCurrentLang(lang.code)}
                    style={{
                      padding: "5px 12px", borderRadius: 20, border: `1px solid ${currentLang === lang.code ? C.gold : C.border}`,
                      background: currentLang === lang.code ? C.goldLight : C.surface,
                      color: currentLang === lang.code ? C.gold : C.textMuted,
                      fontWeight: currentLang === lang.code ? 700 : 400, fontSize: 12,
                      cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                    <span>{lang.flag}</span> {lang.label}
                  </button>
                ))}
              </div>
            )}

            {asset.sop ? (
              <div>
                {/* Translation loading state */}
                {translating && (
                  <div style={{ textAlign: "center", padding: "16px 0 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: 16, height: 16, border: `2px solid ${C.borderLight}`, borderTop: `2px solid ${C.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontSize: 13, color: C.textMuted }}>Translating to {LANGUAGES.find(l => l.code === currentLang)?.label}...</span>
                  </div>
                )}
                <div
                  style={{
                    background: C.surface, borderRadius: 10, padding: "20px 18px",
                    border: `1px solid ${C.borderLight}`, fontSize: 13, lineHeight: 1.6, color: C.text,
                    opacity: translating ? 0.5 : 1, transition: "opacity 0.3s",
                  }}
                  dangerouslySetInnerHTML={{ __html: md(displaySop) }}
                />
              </div>
            ) : (
              <div style={{ background: C.surface, borderRadius: 10, padding: 40, textAlign: "center", border: `1px solid ${C.borderLight}` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>No SOP Linked</div>
                <div style={{ color: C.textMuted, fontSize: 13 }}>Use the SOP Generator to create one, then link it to this asset.</div>
              </div>
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {asset.maintenance && asset.maintenance.length > 0 ? asset.maintenance.map((m, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.borderLight}`, borderLeft: `4px solid ${m.type === "Corrective" ? C.danger : C.gold}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: m.type === "Corrective" ? C.danger : C.green, textTransform: "uppercase" }}>{m.type}</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{m.date}</span>
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{m.note}</div>
                {m.by && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Performed by: {m.by}</div>}
              </div>
            )) : (
              <div style={{ background: C.surface, borderRadius: 10, padding: 40, textAlign: "center", border: `1px solid ${C.borderLight}` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
                <div style={{ fontWeight: 700, color: C.text }}>No Maintenance Records</div>
              </div>
            )}
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === "issues" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {asset.issues && asset.issues.length > 0 ? asset.issues.map((issue, i) => (
              <div key={i} style={{ background: issue.status === "open" ? C.dangerBg : C.surface, borderRadius: 10, padding: "14px 16px", border: `1px solid ${issue.status === "open" ? "rgba(192,57,43,0.2)" : C.borderLight}`, borderLeft: `4px solid ${issue.status === "open" ? C.danger : C.green}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: issue.status === "open" ? C.danger : C.green, background: issue.status === "open" ? "rgba(192,57,43,0.1)" : "rgba(74,101,64,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                    {issue.status === "open" ? "⚠ Open" : "✓ Resolved"}
                  </span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>Reported: {issue.reported}</span>
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{issue.note}</div>
              </div>
            )) : (
              <div style={{ background: C.surface, borderRadius: 10, padding: 40, textAlign: "center", border: `1px solid ${C.borderLight}` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, color: C.text }}>No Known Issues</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 30, paddingBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>Powered by RHONDA — Tree Stand Partners</div>
          {asset.createdAt && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Asset registered: {asset.createdAt}</div>}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
