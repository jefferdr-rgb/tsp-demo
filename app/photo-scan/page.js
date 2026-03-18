"use client";
import { useState, useRef } from "react";
import { useImageCapture } from "../_lib/useImageCapture";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

export default function PhotoScanPage() {
  const image = useImageCapture();
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const processImage = async () => {
    if (!image.contentBlock) return;
    setProcessing(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: `You are RHONDA, an AI office manager. A worker has photographed a physical document, form, whiteboard, clipboard, delivery ticket, sign-in sheet, or other paper record.

Your job: DIGITIZE it into clean, structured, editable data.

RULES:
- Extract ALL text visible in the image
- If it's a table/form/checklist: format as a markdown table
- If it's a whiteboard: organize into sections/bullet points
- If it's a sign-in sheet: format as a table with columns
- If it's handwritten: do your best to read it, mark uncertain words with [?]
- If it's a delivery ticket: extract vendor, items, quantities, PO number
- Preserve numbers, dates, and measurements exactly
- Add a brief "Document Type:" header identifying what this is
${context ? `\nAdditional context from the user: "${context}"` : ""}`,
          messages: [{
            role: "user",
            content: [
              image.contentBlock,
              { type: "text", text: context ? `Context: ${context}\n\nPlease digitize this document.` : "Please digitize this document into structured, editable data." },
            ],
          }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b => b.text).join("\n") || "Could not process image.";
      setResult(text);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    // Try to extract table data for CSV
    const lines = result.split("\n");
    const tableRows = lines.filter(l => l.trim().startsWith("|") && l.trim().endsWith("|"));
    let csvContent = result;
    if (tableRows.length > 1) {
      csvContent = tableRows
        .filter(l => !/^\|[\s\-:|]+\|$/.test(l.trim()))
        .map(l => l.split("|").slice(1, -1).map(c => `"${c.trim()}"`).join(","))
        .join("\n");
    }
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rhonda-scan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Photo Scanner</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Photo-to-Digital</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Photograph any paper document. RHONDA digitizes it.</p>
        </div>

        {/* Capture area */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, marginBottom: 24, textAlign: "center" }}>
          {image.preview ? (
            <div>
              <img src={image.preview} alt="Captured" style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Retake
                </button>
                <button onClick={image.clear}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: C.goldLight, border: `1px solid ${C.gold}33`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => image.captureImage({ camera: true })}
                  style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  Take Photo
                </button>
                <button onClick={() => image.captureImage()}
                  style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Upload File
                </button>
              </div>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 16, lineHeight: 1.5 }}>
                Whiteboard, clipboard, sign-in sheet, delivery ticket, handwritten form — anything paper.
              </p>
            </div>
          )}

          {image.error && (
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 12 }}>{image.error}</div>
          )}
        </div>

        {/* Context input */}
        {image.preview && (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
              Context (optional)
            </label>
            <input value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g., 'This is a daily production log' or 'Delivery ticket from feed supplier'"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.borderLight}`, background: C.bg, fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <button onClick={processImage} disabled={processing}
                style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: processing ? C.border : C.gold, color: processing ? C.textMuted : "#fff", fontSize: 15, fontWeight: 600, cursor: processing ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                {processing ? (
                  <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Digitizing...</>
                ) : "Digitize Document"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 13, marginBottom: 24 }}>{error}</div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.gold, borderRadius: 2, display: "inline-block" }} />
                Digitized Data
              </h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyResult}
                  style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: copied ? C.goldLight : C.surface, color: copied ? C.gold : C.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={downloadCSV}
                  style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.gold}`, background: C.goldLight, color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Download CSV
                </button>
              </div>
            </div>
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 24px", fontSize: 13, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>
              {result}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
