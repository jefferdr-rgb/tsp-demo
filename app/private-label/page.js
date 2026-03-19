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

const CUSTOMERS = [
  { id: "aldi", name: "Aldi", brand: "Heart to Tail", color: "#00457C" },
  { id: "lidl", name: "Lidl", brand: "Orlando", color: "#0050AA" },
  { id: "walmart", name: "Walmart", brand: "Ol' Roy / Special Kitty", color: "#0071DC" },
  { id: "target", name: "Target", brand: "Kindfull", color: "#CC0000" },
  { id: "national", name: "Undisclosed National", brand: "Store Brand", color: "#666666" },
];

const SPEC_CHECKLIST = [
  { id: "packaging", label: "Packaging Specs", desc: "Bag material, printing, closure, weights" },
  { id: "labeling", label: "Labeling Compliance", desc: "AAFCO statement, nutritional adequacy, feeding guidelines" },
  { id: "nutritional", label: "Nutritional Panel", desc: "Guaranteed analysis, calorie statement, ingredient list" },
  { id: "allergen", label: "Allergen Statement", desc: "Cross-contact allergen declarations" },
  { id: "lotcoding", label: "Lot Coding", desc: "Date format, lot code placement, best-by dating" },
  { id: "shelflife", label: "Shelf Life", desc: "Minimum shelf life at ship, stability testing" },
];

const ORDER_STATUSES = ["In Production", "Pending QA Release", "QA Approved", "Shipped"];

function PrivateLabelContent() {
  const { client, colors } = useToolClient();
  const C = colors;

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [specChecks, setSpecChecks] = useState(
    Object.fromEntries(SPEC_CHECKLIST.map((s) => [s.id, false]))
  );

  // Order form
  const [orderProduct, setOrderProduct] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [orderShipDate, setOrderShipDate] = useState("");
  const [orderDest, setOrderDest] = useState("");

  // Orders list
  const [orders, setOrders] = useState([]);

  // AI output
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const outputRef = useRef(null);

  const customer = CUSTOMERS.find((c) => c.id === selectedCustomer);
  const checkedCount = Object.values(specChecks).filter(Boolean).length;
  const allChecked = checkedCount === SPEC_CHECKLIST.length;

  const toggleSpec = (id) => {
    setSpecChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addOrder = () => {
    if (!orderProduct || !orderQty || !selectedCustomer) {
      setError("Select a customer and fill in product/quantity.");
      return;
    }
    setOrders((prev) => [...prev, {
      id: Date.now(),
      customer: customer?.name || "Unknown",
      brand: customer?.brand || "",
      product: orderProduct,
      quantity: orderQty,
      shipDate: orderShipDate,
      destination: orderDest,
      status: "In Production",
    }]);
    setOrderProduct("");
    setOrderQty("");
    setOrderShipDate("");
    setOrderDest("");
    setError("");
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const runComplianceCheck = async () => {
    if (!selectedCustomer) {
      setError("Select a customer first.");
      return;
    }
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const systemPrompt = `You are RHONDA, an AI private label compliance assistant for ${client.name}. ${client.systemContext}

You help manage private label retailer relationships — ensuring spec compliance, order tracking, and regulatory alignment. You know AAFCO labeling requirements, FDA pet food regulations, retailer private label programs, and SQF audit requirements for co-manufacturing.`;

      const specStatus = SPEC_CHECKLIST.map((s) =>
        `- ${s.label}: ${specChecks[s.id] ? "CONFIRMED" : "NOT CONFIRMED"}`
      ).join("\n");

      const orderSummary = orders.length > 0
        ? orders.map((o) => `- ${o.customer} (${o.brand}): ${o.product} — ${o.quantity} — Ship: ${o.shipDate || "TBD"} — Status: ${o.status}`).join("\n")
        : "No orders entered.";

      const promptText = `PRIVATE LABEL COMPLIANCE CHECK for ${customer.name} (${customer.brand})

SPEC COMPLIANCE STATUS:
${specStatus}

CURRENT ORDERS:
${orderSummary}

Generate:

## COMPLIANCE ASSESSMENT
Review each spec area. For items NOT CONFIRMED, explain what's needed and the risk of shipping without confirmation.

## RETAILER-SPECIFIC REQUIREMENTS
What unique requirements does ${customer.name} typically have for private label pet food? Cover:
- Packaging standards
- Quality audit requirements (BRC, SQF, or proprietary)
- Labeling format preferences
- Shipping and logistics requirements
- Vendor scorecard criteria

## ORDER STATUS REVIEW
For any active orders, flag potential issues with timeline, QA holds, or capacity constraints.

## ACTION ITEMS
Prioritized checklist of what needs to happen before the next shipment.

## RISK ASSESSMENT
What could go wrong? Rate each risk area: Low / Medium / High.`;

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
      setOutput(data.content?.[0]?.text || "No output generated.");
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ORDER_STATUS_COLORS = {
    "In Production": { bg: "rgba(196,155,42,0.12)", color: "#b8860b", border: "#c49b2a" },
    "Pending QA Release": { bg: "rgba(192,57,43,0.08)", color: "#c0392b", border: "#c0392b" },
    "QA Approved": { bg: "rgba(74,101,64,0.08)", color: "#4a6540", border: "#4a6540" },
    "Shipped": { bg: "rgba(44,53,40,0.08)", color: "#2c3528", border: "#2c3528" },
  };

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
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Private Label Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{client.name}</span>
          <a href={client.backHref} style={{ color: C.accent, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>Private Label Portal</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Retailer spec compliance and order management for private label customers.</p>
        </div>

        {/* Customer Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>Select Customer</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CUSTOMERS.map((c) => (
              <button key={c.id} onClick={() => setSelectedCustomer(selectedCustomer === c.id ? "" : c.id)}
                style={{ padding: "12px 20px", borderRadius: 12, border: `2px solid ${selectedCustomer === c.id ? c.color : C.border}`, background: selectedCustomer === c.id ? `${c.color}10` : C.surface, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left", minWidth: 160 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: selectedCustomer === c.id ? c.color : C.text }}>{c.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{c.brand}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedCustomer && (
          <>
            {/* Spec Compliance Checklist */}
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 18, background: customer?.color || C.accent, borderRadius: 2, display: "inline-block" }} />
                  Spec Compliance — {customer?.name}
                </h2>
                <div style={{ fontSize: 13, fontWeight: 600, color: allChecked ? "#4a6540" : "#b8860b" }}>
                  {checkedCount}/{SPEC_CHECKLIST.length} confirmed
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", background: allChecked ? "#4a6540" : C.accent, borderRadius: 2, width: `${(checkedCount / SPEC_CHECKLIST.length) * 100}%`, transition: "width 0.3s" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SPEC_CHECKLIST.map((s) => {
                  const checked = specChecks[s.id];
                  return (
                    <div key={s.id} onClick={() => toggleSpec(s.id)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 10, border: `1px solid ${checked ? "#4a6540" : C.border}`, background: checked ? "rgba(74,101,64,0.04)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? "#4a6540" : C.border}`, background: checked ? "#4a6540" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        {checked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: checked ? "#4a6540" : C.text }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Entry */}
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 18, background: C.accent, borderRadius: 2, display: "inline-block" }} />
                Add Order
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Product</label>
                  <input type="text" value={orderProduct} onChange={(e) => setOrderProduct(e.target.value)} placeholder="e.g. Adult Chicken & Rice 40lb" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Quantity</label>
                  <input type="text" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} placeholder="e.g. 42,000 bags" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Ship Date</label>
                  <input type="date" value={orderShipDate} onChange={(e) => setOrderShipDate(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>Destination</label>
                  <input type="text" value={orderDest} onChange={(e) => setOrderDest(e.target.value)} placeholder="e.g. Aldi DC — Greencastle, IN" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <button onClick={addOrder} style={{ marginTop: 16, padding: "10px 28px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Add Order
              </button>
            </div>

            {/* Orders Board */}
            {orders.length > 0 && (
              <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 24 }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Order Status Board ({orders.length})</h2>
                </div>
                {orders.map((o) => {
                  const sc = ORDER_STATUS_COLORS[o.status];
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{o.product}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                          {o.customer} ({o.brand}) — {o.quantity}{o.destination ? ` — ${o.destination}` : ""}
                        </div>
                      </div>
                      {o.shipDate && <div style={{ fontSize: 12, color: C.textMuted, marginRight: 16 }}>Ship: {o.shipDate}</div>}
                      <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compliance Check Button */}
            {error && (
              <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 8, background: C.dangerBg, color: C.danger, fontSize: 13 }}>{error}</div>
            )}

            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <button onClick={runComplianceCheck} disabled={loading}
                style={{ padding: "14px 44px", borderRadius: 10, border: "none", background: loading ? C.border : customer?.color || C.accent, color: loading ? C.textMuted : "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {loading ? (
                  <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Running Compliance Check...</>
                ) : `Compliance Check — ${customer?.name}`}
              </button>
            </div>
          </>
        )}

        {/* AI Output */}
        {(output || loading) && (
          <div ref={outputRef} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: customer?.color || C.accent, borderRadius: 2, display: "inline-block" }} />
                Compliance Report — {customer?.name}
              </h2>
              {output && (
                <button onClick={() => { navigator.clipboard.writeText(output); setShowCopied(true); setTimeout(() => setShowCopied(false), 2000); }}
                  style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: showCopied ? C.accentLight : C.surface, color: showCopied ? C.accent : C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  {showCopied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 40px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", lineHeight: 1.7, fontSize: 14, color: C.text }}>
              {loading && !output ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted }}>
                  <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${customer?.color || C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>RHONDA is reviewing {customer?.name} compliance requirements...</div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: md(output, C.accent, C.text) }} />
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedCustomer && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 8 }}>
            {[
              { num: "1", title: "Select Customer", desc: "Choose the retailer whose private label order you're managing." },
              { num: "2", title: "Confirm Specs", desc: "Check off each compliance area as specs are verified and approved." },
              { num: "3", title: "Run Compliance", desc: "RHONDA reviews everything and generates a compliance report with action items." },
            ].map((s) => (
              <div key={s.num} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "24px 20px", textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accentLight, color: C.accent, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{s.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

export default function PrivateLabelPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f4f1ea", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif", color: "#7a7462" }}>Loading...</div>}>
      <PrivateLabelContent />
    </Suspense>
  );
}
