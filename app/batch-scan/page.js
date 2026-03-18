"use client";
import { useState, useRef } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// ── File → Claude image block ────────────────────────────────────────────────
function fileToImageBlock(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      const mediaType = file.type === "application/pdf" ? "application/pdf" : file.type.startsWith("image/") ? file.type : "image/jpeg";
      resolve({
        type: mediaType === "application/pdf" ? "document" : "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── XLSX export (matches RhondaShell pattern) ────────────────────────────────
async function downloadSpreadsheet(spreadsheetData) {
  const XLSX = (await import("xlsx-js-style")).default;
  const wb = XLSX.utils.book_new();

  for (const [sheetName, data] of Object.entries(spreadsheetData)) {
    const label = sheetName === "expenses" ? "Expense Report" : sheetName === "payables" ? "Accounts Payable" : sheetName;
    const rows = [data.headers, ...data.rows];
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Style headers
    data.headers.forEach((_, i) => {
      const addr = XLSX.utils.encode_cell({ r: 0, c: i });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2C3528" } },
          alignment: { horizontal: "center" },
        };
      }
    });

    // Alternate row colors
    data.rows.forEach((row, ri) => {
      row.forEach((_, ci) => {
        const addr = XLSX.utils.encode_cell({ r: ri + 1, c: ci });
        if (ws[addr]) {
          ws[addr].s = {
            fill: ri % 2 === 0 ? { fgColor: { rgb: "F4F1EA" } } : {},
            numFmt: typeof row[ci] === "number" ? (["Subtotal", "Tax", "Total"].includes(data.headers[ci]) ? "$#,##0.00" : "0") : undefined,
          };
        }
      });
    });

    // Totals row for financial columns
    const totalRowIdx = data.rows.length + 1;
    const totalHeaders = ["Subtotal", "Tax", "Total"];
    data.headers.forEach((h, ci) => {
      const addr = XLSX.utils.encode_cell({ r: totalRowIdx, c: ci });
      if (ci === 0) {
        ws[addr] = { v: "TOTAL", s: { font: { bold: true, color: { rgb: "C49B2A" } }, fill: { fgColor: { rgb: "2C3528" } } } };
      } else if (totalHeaders.includes(h)) {
        const colLetter = XLSX.utils.encode_col(ci);
        ws[addr] = {
          f: `SUM(${colLetter}2:${colLetter}${totalRowIdx})`,
          s: { font: { bold: true, color: { rgb: "C49B2A" } }, fill: { fgColor: { rgb: "2C3528" } }, numFmt: "$#,##0.00" },
        };
      } else {
        ws[addr] = { v: "", s: { fill: { fgColor: { rgb: "2C3528" } } } };
      }
    });

    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRowIdx, c: data.headers.length - 1 } });
    ws["!cols"] = data.headers.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RHONDA-Scan-Report-${new Date().toISOString().split("T")[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Result card for each processed document ─────────────────────────────────
function ResultCard({ result, index }) {
  const [expanded, setExpanded] = useState(false);
  const info = result.docTypeInfo || {};

  if (result.status === "error") {
    return (
      <div style={{ background: "rgba(192,57,43,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(192,57,43,0.2)", borderLeft: `4px solid ${C.danger}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>{result.fileName}</span>
          <span style={{ fontSize: 11, color: C.danger }}>Error: {result.error}</span>
        </div>
      </div>
    );
  }

  const data = result.extracted || {};
  const keyFields = Object.entries(data).filter(([k, v]) => v !== null && !Array.isArray(v) && k !== "notes" && k !== "raw_text");
  const arrayFields = Object.entries(data).filter(([k, v]) => Array.isArray(v) && v.length > 0);

  return (
    <div style={{
      background: C.surface, borderRadius: 10, padding: "14px 16px",
      border: `1px solid ${C.borderLight}`, borderLeft: `4px solid ${info.color || C.gold}`,
      transition: "all 0.15s",
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{info.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{result.fileName}</div>
            <div style={{ fontSize: 12, color: info.color, fontWeight: 600 }}>{info.label}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {data.total && (
            <span style={{ fontSize: 15, fontWeight: 700, color: C.chrome }}>
              ${typeof data.total === "number" ? data.total.toFixed(2) : data.total}
            </span>
          )}
          <span style={{ fontSize: 16, color: C.textMuted, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderLight}` }}>
          {/* Key fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
            {keyFields.map(([key, value]) => (
              <div key={key}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {key.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                  {typeof value === "number" && (key.includes("total") || key.includes("tax") || key.includes("subtotal") || key.includes("cost"))
                    ? `$${value.toFixed(2)}`
                    : String(value)}
                </div>
              </div>
            ))}
          </div>

          {/* Array fields (line items, steps, etc.) */}
          {arrayFields.map(([key, items]) => (
            <div key={key} style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                {key.replace(/_/g, " ")} ({items.length})
              </div>
              {items.map((item, i) => (
                <div key={i} style={{
                  background: C.bg, borderRadius: 6, padding: "8px 10px", marginBottom: 4,
                  fontSize: 12, color: C.text, lineHeight: 1.4,
                }}>
                  {typeof item === "string" ? item : Object.entries(item).map(([k, v]) => (
                    v ? <span key={k} style={{ marginRight: 12 }}><strong>{k.replace(/_/g, " ")}:</strong> {String(v)}</span> : null
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Notes */}
          {data.notes && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
              {data.notes}
            </div>
          )}

          {/* Raw text for SOPs and handwritten docs */}
          {data.raw_text && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                Transcribed Text
              </div>
              <div style={{ background: C.bg, borderRadius: 6, padding: 10, fontSize: 12, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {data.raw_text}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Summary bar ─────────────────────────────────────────────────────────────
function SummaryBar({ results }) {
  const successful = results.filter(r => r.status === "success");
  const typeCounts = {};
  successful.forEach(r => {
    typeCounts[r.docType] = (typeCounts[r.docType] || 0) + 1;
  });

  const totalSpend = successful
    .filter(r => r.docType === "receipt" || r.docType === "invoice")
    .reduce((sum, r) => sum + (r.extracted?.total || 0), 0);

  return (
    <div style={{
      background: C.chrome, borderRadius: 12, padding: "16px 20px", marginBottom: 16,
      border: `1px solid rgba(196,155,42,0.3)`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
          RHONDA processed {successful.length} document{successful.length !== 1 ? "s" : ""}
        </div>
        {totalSpend > 0 && (
          <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>
            ${totalSpend.toFixed(2)} total
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(typeCounts).map(([type, count]) => (
          <span key={type} style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
            background: "rgba(196,155,42,0.15)", color: C.gold,
          }}>
            {count} {type.replace(/_/g, " ")}{count > 1 ? "s" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function BatchScan() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" });
  const [results, setResults] = useState(null);
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  async function handleFiles(fileList) {
    const validFiles = Array.from(fileList).filter(f =>
      f.type.startsWith("image/") || f.type === "application/pdf"
    );
    if (validFiles.length === 0) return;
    setFiles(prev => [...prev, ...validFiles]);
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function processAll() {
    if (files.length === 0) return;
    setProcessing(true);
    setResults(null);
    setSpreadsheetData(null);

    try {
      // Convert all files to image blocks
      setProgress({ current: 0, total: files.length, stage: "Preparing documents..." });
      const documents = [];
      for (let i = 0; i < files.length; i++) {
        setProgress({ current: i + 1, total: files.length, stage: `Reading ${files[i].name}...` });
        const imageBlock = await fileToImageBlock(files[i]);
        documents.push({ imageBlock, fileName: files[i].name });
      }

      // Send to processor
      setProgress({ current: 0, total: files.length, stage: "RHONDA is analyzing your documents..." });
      const response = await fetch("/api/scan-processor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResults(data.results);
      setSpreadsheetData(data.spreadsheetData);
      setProgress({ current: data.results.length, total: data.results.length, stage: "Done!" });
    } catch (err) {
      setResults([{ fileName: "Error", status: "error", error: err.message, docType: "other", docTypeInfo: {} }]);
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove("drag-over");
    if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.add("drag-over");
  }

  function handleDragLeave(e) {
    e.preventDefault();
    dropRef.current?.classList.remove("drag-over");
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
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Batch Scanner</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Scan & Process Documents</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                Feed a stack — RHONDA classifies, extracts, and organizes everything
              </div>
            </div>
            <a href="/sunshine" style={{
              fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "8px 14px",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
            }}>Back to RHONDA</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Upload Zone */}
        {!results && (
          <>
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !processing && fileInputRef.current?.click()}
              style={{
                background: C.surface, border: `2px dashed ${files.length > 0 ? C.gold : C.border}`,
                borderRadius: 16, padding: "40px 20px", textAlign: "center", cursor: processing ? "default" : "pointer",
                transition: "all 0.2s", marginBottom: 20,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={e => handleFiles(e.target.files)}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {files.length > 0 ? "📄" : "📥"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                {files.length > 0 ? `${files.length} document${files.length !== 1 ? "s" : ""} ready` : "Drop scanned files here"}
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>
                {files.length > 0 ? "Drop more or click to add" : "PDF, JPG, PNG — from ScanSnap, phone camera, or any scanner"}
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && !processing && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {files.map((file, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: C.surface, borderRadius: 8, padding: "8px 14px",
                      border: `1px solid ${C.borderLight}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                        <span style={{ fontSize: 13, color: C.text }}>{file.name}</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{
                        background: "transparent", border: "none", color: C.textMuted, cursor: "pointer",
                        fontSize: 16, padding: "4px 8px",
                      }}>×</button>
                    </div>
                  ))}
                </div>

                <button onClick={processAll} style={{
                  width: "100%", padding: "14px 20px", marginTop: 16,
                  background: C.gold, color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 4px 20px ${C.goldGlow}`,
                }}>
                  Process {files.length} Document{files.length !== 1 ? "s" : ""} with RHONDA
                </button>
              </div>
            )}

            {/* Processing state */}
            {processing && (
              <div style={{
                background: C.surface, borderRadius: 12, padding: 24, textAlign: "center",
                border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, border: `3px solid ${C.borderLight}`, borderTop: `3px solid ${C.gold}`,
                  borderRadius: "50%", margin: "0 auto 16px",
                  animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                  {progress.stage}
                </div>
                {progress.total > 0 && (
                  <div style={{ fontSize: 13, color: C.textMuted }}>
                    {progress.current} of {progress.total}
                  </div>
                )}
                {/* Progress bar */}
                <div style={{
                  height: 4, background: C.borderLight, borderRadius: 2, marginTop: 16,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", background: C.gold, borderRadius: 2,
                    width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : "30%",
                    transition: "width 0.3s",
                  }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Results */}
        {results && (
          <>
            <SummaryBar results={results} />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {spreadsheetData && (
                <button onClick={() => downloadSpreadsheet(spreadsheetData)} style={{
                  flex: 1, padding: "12px 16px", background: C.green, color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>
                  Download Excel Report
                </button>
              )}
              <button onClick={() => { setResults(null); setSpreadsheetData(null); setFiles([]); }} style={{
                flex: spreadsheetData ? 0 : 1, padding: "12px 16px",
                background: C.surface, color: C.text,
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Scan More
              </button>
            </div>

            {/* Result cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((result, i) => (
                <ResultCard key={i} result={result} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 30, paddingBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>Powered by RHONDA — Tree Stand Partners</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .drag-over { border-color: ${C.gold} !important; background: ${C.goldLight} !important; }
      `}</style>
    </div>
  );
}
