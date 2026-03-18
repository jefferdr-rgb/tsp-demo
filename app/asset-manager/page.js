"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const DEPARTMENTS = ["Production", "Quality", "Warehouse", "Maintenance", "Shipping", "Safety"];
const ASSET_TYPES = ["Equipment", "Station", "Area", "Tool", "Vehicle", "Storage"];

// ── QR Code generator (pure SVG, no dependencies) ───────────────────────────
// Uses Google Charts API for QR generation as image
function qrUrl(data, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=2c3528&bgcolor=f4f1ea&margin=2`;
}

function getAssets() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("rhonda_assets") || "{}"); } catch { return {}; }
}
function saveAssets(assets) {
  localStorage.setItem("rhonda_assets", JSON.stringify(assets));
}

// ── Demo asset (always available) ───────────────────────────────────────────
const DEMO_ASSET = {
  id: "demo-extruder-01",
  name: "Kibble Extruder #1",
  location: "Production Floor — Line A",
  type: "Equipment",
  department: "Production",
  createdAt: "2026-03-10",
  isDemo: true,
};

// ── Setup Guide Data ──────────────────────────────────────────────────────
const SETUP_GUIDE = {
  printing: {
    title: "QR Label Printing",
    icon: "🏷️",
    tips: [
      { label: "Label Size", detail: "Use 2\" × 2\" minimum — workers scan from arm's length, not inches away" },
      { label: "Label Material", detail: "Polyester labels (not paper) — waterproof, oil-resistant, won't peel in heat" },
      { label: "Print Type", detail: "Thermal transfer printers (uses ribbon) last years. Thermal direct (no ribbon) fades in months with heat/sunlight" },
      { label: "Human-Readable", detail: "Always include asset name + ID below the QR code — if the code gets scratched, workers can still type it in" },
      { label: "Laminate", detail: "If using non-laminated labels, add overlaminate — one wipe with degreaser destroys unprotected ink" },
      { label: "Placement", detail: "Eye level, operator side, away from heat sources and chemical splash zones" },
    ],
  },
  printers: {
    title: "Recommended Printers",
    icon: "🖨️",
    tiers: [
      { name: "Getting Started", printer: "Brother QL-820NWB", price: "~$200", labels: "Avery 6576 polyester", best: "Under 50 assets, WiFi + Bluetooth printing" },
      { name: "Industrial", printer: "Brady M211", price: "~$250", labels: "Brady B-593 polyester", best: "50-500 assets, built for maintenance teams" },
      { name: "High Volume", printer: "Zebra ZD421", price: "~$400+", labels: "Custom polyester rolls", best: "500+ assets, thermal transfer workhorse" },
    ],
  },
  hardware: {
    title: "Hardware Your Team Needs",
    icon: "📱",
    categories: [
      {
        name: "Essential (Day 1)",
        items: [
          { device: "Smartphones or Tablets", why: "Every RHONDA feature works on mobile — camera, mic, QR scanning all built in", rec: "Workers' existing phones work. For shared stations: iPad 10th gen ($329) or Samsung Galaxy Tab A9+ ($219)" },
          { device: "Ruggedized Cases", why: "Factory floors destroy unprotected devices", rec: "OtterBox Defender ($40-60) or Griffin Survivor ($30-50) — drop-proof, dust-proof" },
          { device: "WiFi / Cellular Coverage", why: "RHONDA is cloud-based — needs internet for AI features", rec: "Ensure WiFi covers production floor. Offline mode works for basic access" },
        ],
      },
      {
        name: "QR & Asset Tracking",
        items: [
          { device: "Label Printer", why: "Print durable QR stickers for every machine, station, and area", rec: "See printer recommendations above — Brady M211 is the sweet spot for most plants" },
          { device: "Durable Label Stock", why: "Paper labels won't survive grease, chemicals, or temperature swings", rec: "Brady B-593 polyester or Avery 6576 — rated for industrial environments" },
        ],
      },
      {
        name: "Communication & Safety",
        items: [
          { device: "Bluetooth Speaker / PA System", why: "Voice Broadcast feature announces in multiple languages across the floor", rec: "JBL Flip 6 ($100) for small areas. Existing PA system integration for full facility" },
          { device: "Tablet Stands / Wall Mounts", why: "Shared RHONDA stations at key areas — shift handoff, incident reporting, SOP lookup", rec: "RAM Mounts Tab-Tite ($40-80) — locking, adjustable, theft-deterrent" },
        ],
      },
      {
        name: "Coming Soon — Predictive Maintenance",
        items: [
          { device: "IoT Sensor Kit", why: "Temperature, vibration, and pressure monitoring for AI-driven failure prediction", rec: "Details coming Q3 2026 — RHONDA will integrate with standard industrial IoT protocols" },
        ],
      },
    ],
  },
};

export default function AssetManager() {
  const [assets, setAssets] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState("printing");
  const [form, setForm] = useState({ name: "", location: "", type: "Equipment", department: "Production" });
  const printRef = useRef(null);

  useEffect(() => { setAssets(getAssets()); }, []);

  const allAssets = { [DEMO_ASSET.id]: DEMO_ASSET, ...assets };

  function createAsset() {
    if (!form.name.trim()) return;
    const id = "asset-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newAsset = {
      id,
      name: form.name.trim(),
      location: form.location.trim(),
      type: form.type,
      department: form.department,
      createdAt: new Date().toISOString().split("T")[0],
      sop: null,
      maintenance: [],
      issues: [],
    };
    const updated = { ...assets, [id]: newAsset };
    saveAssets(updated);
    setAssets(updated);
    setForm({ name: "", location: "", type: "Equipment", department: "Production" });
    setShowForm(false);
    setShowQR(id);
  }

  function deleteAsset(id) {
    const updated = { ...assets };
    delete updated[id];
    saveAssets(updated);
    setAssets(updated);
    if (showQR === id) setShowQR(null);
  }

  function getAssetUrl(id) {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/asset/${id}`;
  }

  function printQR(id) {
    const asset = allAssets[id];
    const url = getAssetUrl(id);
    const w = window.open("", "_blank", "width=400,height=600");
    w.document.write(`
      <html><head><title>QR - ${asset.name}</title>
      <style>
        body { font-family: -apple-system, sans-serif; text-align: center; padding: 40px 20px; background: #f4f1ea; }
        .label { border: 2px solid #2c3528; border-radius: 12px; padding: 24px; background: #fff; max-width: 280px; margin: 0 auto; }
        h1 { font-size: 14px; color: #2c3528; margin: 0 0 4px; }
        h2 { font-size: 20px; color: #2c3528; margin: 0 0 4px; font-weight: 800; }
        .loc { font-size: 12px; color: #7a7462; margin-bottom: 16px; }
        img { width: 200px; height: 200px; margin: 0 auto 12px; display: block; }
        .tag { display: inline-block; background: #2c3528; color: #c49b2a; font-size: 10px; font-weight: 700;
               padding: 3px 10px; border-radius: 4px; letter-spacing: 1px; margin-bottom: 12px; }
        .foot { font-size: 9px; color: #7a7462; margin-top: 12px; }
        @media print { body { padding: 0; background: #fff; } }
      </style></head><body>
      <div class="label">
        <div class="tag">RHONDA ASSET</div>
        <h2>${asset.name}</h2>
        <div class="loc">${asset.location || asset.department || ""}</div>
        <img src="${qrUrl(url, 400)}" alt="QR Code" />
        <h1>Scan for SOP & Maintenance</h1>
        <div class="foot">Tree Stand Partners — treestandpartners.com</div>
      </div>
      <script>setTimeout(()=>{window.print()},800)</script>
      </body></html>
    `);
    w.document.close();
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 20px", borderBottom: `3px solid ${C.gold}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1 }}>RHONDA</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>|</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Asset Manager</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>QR Asset Tags</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                Create assets, generate QR codes, link SOPs
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/sop-generator" style={{
                fontSize: 12, color: C.gold, textDecoration: "none", padding: "8px 14px",
                border: `1px solid rgba(196,155,42,0.3)`, borderRadius: 6,
              }}>SOP Generator</a>
              <a href="/sunshine" style={{
                fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "8px 14px",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
              }}>Back to RHONDA</a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* QR Modal */}
        {showQR && allAssets[showQR] && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }} onClick={() => setShowQR(null)}>
            <div style={{
              background: C.surface, borderRadius: 16, padding: 32, maxWidth: 360,
              width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }} onClick={e => e.stopPropagation()}>
              <div style={{
                display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 1,
                color: C.gold, background: C.chrome, padding: "4px 12px", borderRadius: 4, marginBottom: 16,
              }}>RHONDA ASSET</div>

              <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                {allAssets[showQR].name}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
                {allAssets[showQR].location || allAssets[showQR].department}
              </div>

              <div style={{
                background: C.bg, borderRadius: 12, padding: 20, marginBottom: 20,
                border: `1px solid ${C.border}`,
              }}>
                <img
                  src={qrUrl(getAssetUrl(showQR), 400)}
                  alt="QR Code"
                  style={{ width: 200, height: 200, display: "block", margin: "0 auto" }}
                />
              </div>

              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>
                Scan to view SOP, maintenance history, and known issues
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => printQR(showQR)} style={{
                  flex: 1, padding: "10px 16px", background: C.chrome, color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Print Label</button>
                <button onClick={() => {
                  navigator.clipboard?.writeText(getAssetUrl(showQR));
                }} style={{
                  flex: 1, padding: "10px 16px", background: C.goldLight, color: C.gold,
                  border: `1px solid ${C.gold}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>Copy Link</button>
              </div>

              <a href={`/asset/${showQR}`} target="_blank" style={{
                display: "block", marginTop: 12, fontSize: 12, color: C.gold, textDecoration: "none",
              }}>Preview asset page →</a>
            </div>
          </div>
        )}

        {/* Create Asset Form */}
        {showForm ? (
          <div style={{
            background: C.surface, borderRadius: 12, padding: 24, marginBottom: 24,
            border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Register New Asset</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Asset Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g., Kibble Extruder #2, Packaging Line B"
                  style={{
                    width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
                    fontSize: 14, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                  placeholder="e.g., Production Floor — Line A"
                  style={{
                    width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
                    fontSize: 14, color: C.text, background: C.bg, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    style={{
                      width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
                      fontSize: 14, color: C.text, background: C.bg, outline: "none",
                    }}
                  >
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({...form, department: e.target.value})}
                    style={{
                      width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
                      fontSize: 14, color: C.text, background: C.bg, outline: "none",
                    }}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={createAsset} style={{
                flex: 1, padding: "12px 20px", background: C.gold, color: "#fff", border: "none",
                borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>Create & Generate QR</button>
              <button onClick={() => setShowForm(false)} style={{
                padding: "12px 20px", background: "transparent", color: C.textMuted,
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer",
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} style={{
            width: "100%", padding: "16px 20px", background: C.surface, border: `2px dashed ${C.border}`,
            borderRadius: 12, fontSize: 14, fontWeight: 600, color: C.gold, cursor: "pointer",
            marginBottom: 24, transition: "all 0.15s",
          }}>
            + Register New Asset
          </button>
        )}

        {/* How It Works (when no custom assets) */}
        {Object.keys(assets).length === 0 && !showForm && (
          <div style={{
            background: C.goldLight, borderRadius: 12, padding: "20px 24px", marginBottom: 24,
            border: `1px solid rgba(196,155,42,0.2)`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>How It Works</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { num: "1", title: "Register Asset", desc: "Name it, set location and department" },
                { num: "2", title: "Print QR Code", desc: "Stick it on the machine, station, or area" },
                { num: "3", title: "Scan & Access", desc: "Worker scans → SOP, maintenance, known issues" },
              ].map(s => (
                <div key={s.num} style={{ flex: "1 1 150px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>{s.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup & Hardware Guide */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowGuide(!showGuide)} style={{
            width: "100%", padding: "14px 20px", background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: showGuide ? "12px 12px 0 0" : 12, fontSize: 14, fontWeight: 600, color: C.text,
            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
            transition: "all 0.15s",
          }}>
            <span>Setup & Hardware Guide</span>
            <span style={{ fontSize: 18, color: C.textMuted, transform: showGuide ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
          </button>

          {showGuide && (
            <div style={{
              background: C.surface, borderRadius: "0 0 12px 12px", borderTop: "none",
              border: `1px solid ${C.border}`, borderTopColor: C.borderLight,
              overflow: "hidden",
            }}>
              {/* Guide Tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${C.borderLight}` }}>
                {[
                  { key: "printing", label: SETUP_GUIDE.printing.icon + " Printing Tips" },
                  { key: "printers", label: SETUP_GUIDE.printers.icon + " Printers" },
                  { key: "hardware", label: SETUP_GUIDE.hardware.icon + " Hardware" },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setGuideTab(tab.key)} style={{
                    flex: 1, padding: "10px 8px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: guideTab === tab.key ? C.goldLight : "transparent",
                    color: guideTab === tab.key ? C.gold : C.textMuted,
                    borderBottom: guideTab === tab.key ? `2px solid ${C.gold}` : "2px solid transparent",
                  }}>{tab.label}</button>
                ))}
              </div>

              <div style={{ padding: "16px 20px" }}>
                {/* Printing Tips Tab */}
                {guideTab === "printing" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {SETUP_GUIDE.printing.tips.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 12, background: C.goldLight,
                          color: C.gold, fontSize: 12, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                        }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tip.label}</div>
                          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{tip.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Printers Tab */}
                {guideTab === "printers" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {SETUP_GUIDE.printers.tiers.map((tier, i) => (
                      <div key={i} style={{
                        background: C.bg, borderRadius: 10, padding: "14px 16px",
                        border: `1px solid ${C.borderLight}`,
                        borderLeft: `4px solid ${i === 1 ? C.gold : C.border}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tier.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.gold }}>{tier.price}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.chrome }}>{tier.printer}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Labels: {tier.labels}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>Best for: {tier.best}</div>
                        {i === 1 && (
                          <div style={{
                            marginTop: 8, fontSize: 10, fontWeight: 700, color: C.gold,
                            background: C.goldLight, display: "inline-block", padding: "2px 8px", borderRadius: 4,
                            letterSpacing: 0.5,
                          }}>RECOMMENDED</div>
                        )}
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic", marginTop: 4 }}>
                      TSP can source and configure these printers as part of your RHONDA deployment.
                    </div>
                  </div>
                )}

                {/* Hardware Tab */}
                {guideTab === "hardware" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {SETUP_GUIDE.hardware.categories.map((cat, i) => (
                      <div key={i}>
                        <div style={{
                          fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase",
                          letterSpacing: 0.8, marginBottom: 8,
                          borderBottom: `1px solid ${C.borderLight}`, paddingBottom: 4,
                        }}>{cat.name}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {cat.items.map((item, j) => (
                            <div key={j} style={{
                              background: C.bg, borderRadius: 8, padding: "12px 14px",
                              border: `1px solid ${C.borderLight}`,
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{item.device}</div>
                              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4, marginBottom: 4 }}>{item.why}</div>
                              <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{item.rec}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: C.textMuted, fontStyle: "italic" }}>
                      TSP provides complete hardware kits tailored to your facility size and environment.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Asset List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.values(allAssets).map(asset => (
            <div key={asset.id} style={{
              background: C.surface, borderRadius: 12, padding: "16px 18px",
              border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 14,
              transition: "all 0.15s",
            }}>
              {/* QR Thumbnail */}
              <div style={{
                width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                background: C.bg, border: `1px solid ${C.border}`, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <img src={qrUrl(getAssetUrl(asset.id), 120)} alt="QR" style={{ width: 48, height: 48 }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{asset.name}</div>
                  {asset.isDemo && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: C.gold, background: C.goldLight,
                      padding: "2px 6px", borderRadius: 3, letterSpacing: 0.5,
                    }}>DEMO</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  {asset.location || asset.department} · {asset.type}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setShowQR(asset.id)} style={{
                  padding: "8px 12px", background: C.chrome, color: C.gold, border: "none",
                  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>QR Code</button>
                <a href={`/asset/${asset.id}`} target="_blank" style={{
                  padding: "8px 12px", background: C.goldLight, color: C.gold,
                  border: `1px solid rgba(196,155,42,0.3)`, borderRadius: 6, fontSize: 12,
                  fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center",
                }}>View</a>
                {!asset.isDemo && (
                  <button onClick={() => deleteAsset(asset.id)} style={{
                    padding: "8px 10px", background: "transparent", color: C.textMuted,
                    border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, cursor: "pointer",
                  }}>×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 30, paddingBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>Powered by RHONDA — Tree Stand Partners</div>
        </div>
      </div>
    </div>
  );
}
