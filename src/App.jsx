import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════
// DESIGN SYSTEM (G-Squared palette)
// ══════════════════════════════════════════════════
const T = {
  bg: "#f4f1ea",
  bgAlt: "#edeae2",
  surface: "#ffffff",
  surfaceHover: "#faf8f3",
  surfaceActive: "#f0ede5",
  border: "#d6d1c4",
  borderLight: "#c4bfb2",
  gold: "#c49b2a",
  goldLight: "#d4a843",
  goldDim: "rgba(196, 155, 42, 0.1)",
  goldBorder: "rgba(196, 155, 42, 0.3)",
  green: "#4a6540",
  greenDim: "rgba(74, 101, 64, 0.1)",
  red: "#C53030",
  redDim: "rgba(197, 48, 48, 0.08)",
  beige: "#2c3528",
  beigeMuted: "#5a6352",
  beigeDim: "#8a9b7a",
  text: "#2c3528",
  textMuted: "#6b705c",
  textDim: "#8a9b7a",
};

// ══════════════════════════════════════════════════
// SYSTEM PROMPT
// ══════════════════════════════════════════════════
const SYSTEM_PROMPT = `You are Rhonda, the AI office manager for this business. You help with emails, data organization, document summaries, customer replies, scheduling, and any other business task. You are warm, professional, and efficient. Keep responses concise and action-oriented. When drafting emails, match a professional but friendly tone. When organizing data, be thorough. When summarizing documents, flag key dates, amounts, and anything unusual.`;

// ══════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════
const Icons = {
  email: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  data: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  docs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  customers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ai: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  copy: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  download: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ══════════════════════════════════════════════════
// SHEETS EXPORT UTILITIES
// ══════════════════════════════════════════════════

function extractTableRows(text) {
  const lines = text.split("\n");

  // 1. Markdown table (| Col | Col |)
  const mdRows = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("|") || !t.endsWith("|")) continue;
    if (/^\|[\s\-:|]+\|/.test(t) && /^[\|\s\-:]+$/.test(t)) continue; // separator row
    const cells = t.split("|").slice(1, -1).map(c => c.trim());
    if (cells.some(c => c)) mdRows.push(cells);
  }
  if (mdRows.length > 1) return mdRows;

  // 2. CSV (multiple lines with commas)
  const csvLines = lines.filter(l => {
    const t = l.trim();
    return t && t.includes(",") && !t.startsWith("#") && !t.startsWith("//");
  });
  if (csvLines.length > 1) {
    return csvLines.map(line => {
      const cells = [];
      let cur = "", inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
        else { cur += ch; }
      }
      cells.push(cur.trim());
      return cells;
    });
  }

  return null;
}

function rowsToTSV(rows) {
  return rows.map(r => r.join("\t")).join("\n");
}

async function downloadXLSX(rows, filename = "rhonda-data.xlsx") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Auto-size columns
  if (rows[0]) {
    ws["!cols"] = rows[0].map((_, ci) => ({
      wch: Math.min(60, Math.max(10, ...rows.map(r => String(r[ci] ?? "").length)))
    }));
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "RHONDA Data");
  XLSX.writeFile(wb, filename);
}

// ══════════════════════════════════════════════════
// FILE FORMAT SUPPORT
// ══════════════════════════════════════════════════

async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const truncate = (text, max = 10000) =>
    text.length > max
      ? text.slice(0, max) + `\n\n[Truncated — showing first ${max.toLocaleString()} of ${text.length.toLocaleString()} characters]`
      : text;

  if (["txt", "md", "json", "csv", "html", "xml"].includes(ext)) {
    const text = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(file);
    });
    return truncate(text);
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return truncate(result.value || "(No readable text found in document)");
  }

  if (["xlsx", "xls"].includes(ext)) {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    let out = "";
    for (const name of wb.SheetNames) {
      out += `\n### Sheet: ${name}\n`;
      out += XLSX.utils.sheet_to_csv(wb.Sheets[name]);
    }
    return truncate(out.trim() || "(No data found in spreadsheet)");
  }

  if (ext === "pptx") {
    const { default: JSZip } = await import("jszip");
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const slideFiles = Object.keys(zip.files)
      .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort((a, b) => parseInt(a.match(/(\d+)/)[1]) - parseInt(b.match(/(\d+)/)[1]));
    let out = "";
    for (const s of slideFiles) {
      const xml = await zip.files[s].async("text");
      const texts = [...xml.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g)].map(m => m[1].trim()).filter(Boolean);
      if (texts.length) out += `\nSlide ${s.match(/(\d+)/)[1]}: ${texts.join(" ")}\n`;
    }
    return truncate(out.trim() || "(No readable text found in presentation)");
  }

  if (ext === "pdf") {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let out = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const t = content.items.map(i => i.str).join(" ");
        if (t.trim()) out += `\nPage ${p}:\n${t}\n`;
      }
      return truncate(out.trim() || "(No readable text found in PDF)");
    } catch {
      return `[PDF: "${file.name}" — could not extract text. Try exporting as .docx or .txt.]`;
    }
  }

  if (ext === "doc") {
    return `[Legacy .doc file: "${file.name}" — please save as .docx for best results.]`;
  }

  try {
    const text = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(file);
    });
    return truncate(text);
  } catch {
    return `[File: "${file.name}" — format not supported. Try Word, Excel, PowerPoint, PDF, or CSV.]`;
  }
}

// ══════════════════════════════════════════════════
// TASK DEFINITIONS
// ══════════════════════════════════════════════════
const TASKS = [
  { id: "email", label: "Email", icon: Icons.email, color: T.gold, description: "Draft, read, and send emails", placeholder: "What email do you need?\n\nExample: \"Write a follow-up to a customer about their recent installation\"", systemExtra: "The user needs an email drafted. Write a professional, warm email. Include a subject line. Keep it concise." },
  { id: "data", label: "Sheets", icon: Icons.data, color: T.green, description: "Organize job data and spreadsheets", placeholder: "What data do you need organized?\n\nExample: \"Organize last month's jobs by type and add revenue totals\"", systemExtra: "Help organize business data. CRITICAL: whenever you present tabular data, ALWAYS format it as a markdown table using | pipe | characters | like this |, with a separator row (|---|---|). This is required so the user can export directly to Google Sheets or Excel. After the table, provide a brief insight or summary." },
  { id: "docs", label: "Drive", icon: Icons.docs, color: "#6495ED", description: "Find and summarize documents", placeholder: "What document do you need?\n\nExample: \"Summarize this vendor contract and flag anything unusual\"", systemExtra: "Summarize documents in plain English. Flag key dates, dollar amounts, action items, and anything unusual." },
  { id: "calendar", label: "Calendar", icon: Icons.calendar, color: "#E8C96A", description: "Manage events and scheduling", placeholder: "What do you need with the calendar?\n\nExample: \"Find an open slot next Tuesday for a job estimate\"", systemExtra: "Help manage the calendar. Confirm details before creating events." },
  { id: "customers", label: "Customers", icon: Icons.customers, color: T.beigeMuted, description: "Handle customer questions and responses", placeholder: "Paste the customer message or describe the situation...\n\nExample: \"A customer says our quote is too high — help me respond\"", systemExtra: "Draft professional, solution-oriented customer responses. Be confident but never defensive." },
  { id: "rhonda", label: "Ask RHONDA", icon: Icons.ai, color: T.gold, description: "General questions — anything you need", placeholder: "Ask RHONDA anything...\n\nExample: \"Help me write a job posting\" or \"What should I include in a bid proposal?\"", systemExtra: "General question. Be helpful, direct, and practical.", goldLabel: true },
];

// ══════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════
export default function Dashboard() {
  const [activeTask, setActiveTask] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date());
  const [totalMessages, setTotalMessages] = useState(0);
  const [gated, setGated] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [chatDragOver, setChatDragOver] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const MAX_MESSAGES = 5;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleCopyForSheets = async (content, idx) => {
    const rows = extractTableRows(content);
    await navigator.clipboard.writeText(rows ? rowsToTSV(rows) : content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDownloadXLSX = async (content) => {
    const rows = extractTableRows(content) || content.split("\n").filter(Boolean).map(l => [l]);
    await downloadXLSX(rows);
  };

  const handleFileDrop = async (taskId, files) => {
    if (!files || !files.length) return;
    const file = files[0];
    setActiveTask(taskId); setMessages([]); setError(""); setParsing(true);
    try {
      const content = await parseFile(file);
      setInput(`I'm sharing a file: "${file.name}"\n\n${content}`);
    } catch {
      setInput(`I'm sharing a file: "${file.name}" — please help me work with this.`);
    } finally { setParsing(false); }
  };

  const handleChatFileDrop = async (files) => {
    if (!files || !files.length) return;
    const file = files[0];
    setParsing(true);
    try {
      const content = await parseFile(file);
      setInput(prev => (prev ? prev + "\n\n" : "") + `File: "${file.name}"\n\n${content}`);
    } catch {
      setInput(prev => (prev ? prev + "\n\n" : "") + `File: "${file.name}"`);
    } finally { setParsing(false); }
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    if (totalMessages >= MAX_MESSAGES) { setGated(true); return; }
    setLoading(true); setError("");
    const task = TASKS.find(t => t.id === activeTask);
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(""); setTotalMessages(prev => prev + 1);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: SYSTEM_PROMPT + "\n\n" + (task?.systemExtra || ""),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error.message); }
      else {
        const text = (data.content || []).filter(i => i.type === "text").map(i => i.text).join("\n");
        setMessages([...newMessages, { role: "assistant", content: text || "Done. Anything else?" }]);
        if (totalMessages >= MAX_MESSAGES - 1) setTimeout(() => setGated(true), 2000);
      }
    } catch { setError("Could not connect to RHONDA. Check your connection."); }
    setLoading(false);
  };

  const task = TASKS.find(t => t.id === activeTask);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Outfit', sans-serif", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet" />

      {/* ══════ DEMO BANNER ══════ */}
      <div style={{ background: "linear-gradient(135deg, #2c3528, #1e2a1c)", padding: "10px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, borderBottom: `1px solid ${T.gold}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#f4f1ea", letterSpacing: "0.04em" }}>
            LIVE DEMO — Try <span style={{ color: T.gold, fontWeight: 800 }}>RHONDA</span> right now
          </span>
        </div>
        <div style={{ fontSize: 11, color: T.textDim }}>|</div>
        <span style={{ fontSize: 11, color: "#8a9b7a" }}>{MAX_MESSAGES - totalMessages} of {MAX_MESSAGES} free messages remaining</span>
        <a href="https://treestandpartners.com" target="_blank" style={{ fontSize: 10, fontWeight: 700, color: T.gold, textDecoration: "none", padding: "4px 12px", border: `1px solid ${T.gold}44`, borderRadius: 4, letterSpacing: "0.06em" }}>LEARN MORE →</a>
      </div>

      {/* ══════ GATED SCREEN ══════ */}
      {gated && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,26,20,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "48px 44px", maxWidth: 480, width: "90%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", animation: "fadeIn 0.4s ease" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${T.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 8px 24px rgba(196,155,42,0.3)` }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2c3528", margin: "0 0 8px" }}><span style={{ color: T.gold }}>RHONDA</span> is ready to work full-time</h2>
            <p style={{ fontSize: 14, color: "#6b705c", lineHeight: 1.7, margin: "0 0 28px" }}>You just experienced what your team could have every single day — an AI office manager who drafts emails, organizes data, and handles the tasks you hate. Let's set her up for your business.</p>
            <a href="tel:2567105689" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 8, background: "#2c3528", color: "#f4f1ea", textDecoration: "none", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", boxShadow: "0 4px 12px rgba(44,53,40,0.2)" }}>Call (256) 710-5689</a>
            <p style={{ fontSize: 13, color: "#8a9b7a", margin: "16px 0 0" }}>or email <span style={{ color: "#2c3528", fontWeight: 600 }}>info@treestandpartners.com</span></p>
            <div style={{ height: 1, background: "#e8e4da", margin: "24px 0 16px" }} />
            <p style={{ fontSize: 12, color: "#8a9b7a" }}>Free 15-minute consultation · $500 setup · $250/month · No contracts</p>
            <button onClick={() => setGated(false)} style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#c4bfb2", textDecoration: "underline" }}>Back to demo</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ══════ SIDEBAR ══════ */}
        <div style={{ width: 240, background: "#2c3528", borderRight: `1px solid #3a4a35`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "22px 18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px rgba(212,168,67,0.2)` }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="#0B1A14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="16" y1="7" x2="16" y2="25"/><polyline points="10,17 16,10 22,17"/><polyline points="12,22 16,17 20,22"/><line x1="11" y1="25" x2="21" y2="25"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f4f1ea", letterSpacing: "0.02em" }}>Your Company</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.gold, letterSpacing: "0.14em", textTransform: "uppercase" }}>AI Dashboard</div>
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "#3a4a35", margin: "0 14px" }} />
          <div style={{ padding: "12px 8px", flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7e6a", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 10px", marginBottom: 4 }}>Tools</div>
            {TASKS.map(t => {
              const isActive = activeTask === t.id;
              return (
                <div key={t.id} onClick={() => { setActiveTask(t.id); setMessages([]); setInput(""); setError(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: isActive ? "rgba(196,155,42,0.15)" : "transparent", color: isActive ? T.gold : "#8a9b7a", transition: "all 0.2s", marginBottom: 1, position: "relative" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 2, background: T.gold }} />}
                  <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.icon}</div>
                  <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400 }}>{t.id === "rhonda" ? <span>Ask <span style={{ color: "#c49b2a", fontWeight: 700 }}>RHONDA</span></span> : t.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "14px 18px", borderTop: `1px solid #3a4a35` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ECDC4", boxShadow: `0 0 8px #4ECDC4`, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: "#6b7e6a", fontWeight: 500 }}>Powered by <span style={{ color: "#c49b2a", fontWeight: 700 }}>RHONDA</span> AI</span>
            </div>
          </div>
        </div>

        {/* ══════ MAIN CONTENT ══════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Top Bar */}
          <div style={{ height: 56, background: "#ffffff", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
            <div style={{ fontSize: 13, color: T.textMuted }}>
              {task ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span onClick={() => { setActiveTask(null); setMessages([]); }} style={{ cursor: "pointer" }}>Dashboard</span>
                  <span style={{ color: T.textDim }}>→</span>
                  <span style={{ color: T.gold, fontWeight: 600 }}>{task.label}</span>
                </span>
              ) : "Dashboard"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: T.textDim, cursor: "pointer" }}>{Icons.search}</div>
              <div style={{ color: T.textDim, cursor: "pointer", position: "relative" }}>
                {Icons.bell}
                <div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: T.red, border: `2px solid #ffffff` }} />
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.surfaceHover}, ${T.surfaceActive})`, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: T.beigeMuted, cursor: "pointer" }}>YC</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

            {/* ══════ DASHBOARD HOME ══════ */}
            {!activeTask && (
              <div style={{ maxWidth: 900, animation: "fadeIn 0.4s ease" }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: T.beige, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{greeting()}</h1>
                <p style={{ fontSize: 14, color: T.textMuted, margin: "0 0 6px", fontWeight: 300 }}>
                  <span style={{ color: T.gold, fontWeight: 700 }}>RHONDA</span> is ready. What do you need help with?{" "}
                  <span style={{ color: T.textDim, fontSize: 12 }}>Drag a file onto any tile to get started.</span>
                </p>
                <p style={{ fontSize: 11, color: T.textDim, margin: "0 0 24px" }}>
                  Supports: Word · Excel · PowerPoint · PDF · CSV · Google Docs · Google Sheets · Google Slides
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 32 }}>
                  {TASKS.map((t, i) => {
                    const isDrop = dragOver === t.id;
                    return (
                      <div key={t.id}
                        onClick={() => { setActiveTask(t.id); setMessages([]); setInput(""); setError(""); }}
                        onDragOver={e => { e.preventDefault(); setDragOver(t.id); }}
                        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                        onDrop={e => { e.preventDefault(); setDragOver(null); handleFileDrop(t.id, e.dataTransfer.files); }}
                        style={{ background: isDrop ? T.goldDim : T.surface, border: `${isDrop ? 2 : 1}px solid ${isDrop ? T.gold : T.border}`, borderRadius: 12, padding: isDrop ? "21px 19px" : "22px 20px", cursor: "pointer", transition: "all 0.2s", animation: `fadeIn 0.4s ease ${i * 0.05}s both`, transform: isDrop ? "translateY(-3px) scale(1.01)" : "translateY(0)", boxShadow: isDrop ? `0 12px 32px rgba(196,155,42,0.2)` : "none" }}
                        onMouseEnter={e => { if (!isDrop) { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2)`; } }}
                        onMouseLeave={e => { if (!isDrop) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: isDrop ? T.goldDim : (t.id === "rhonda" ? T.goldDim : T.surfaceHover), border: `1px solid ${isDrop || t.id === "rhonda" ? T.goldBorder : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: isDrop ? T.gold : t.color, marginBottom: 14, transition: "all 0.2s" }}>
                          {isDrop ? Icons.upload : t.icon}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.beige, marginBottom: 5 }}>{t.id === "rhonda" ? <span>Ask <span style={{ color: T.gold }}>RHONDA</span></span> : t.label}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{t.description}</div>
                        <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: T.gold }}>{isDrop ? "Drop to upload →" : "Open →"}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                  {[{ label: "Tasks Today", value: "—", color: T.gold }, { label: "Emails Drafted", value: "—", color: T.green }, { label: "Docs Summarized", value: "—", color: "#6495ED" }, { label: "Time Saved", value: "—", color: T.beigeMuted }].map((s, i) => (
                    <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ TASK / CHAT VIEW ══════ */}
            {activeTask && task && (
              <div style={{ maxWidth: 780, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: task.id === "rhonda" ? T.goldDim : T.surfaceHover, border: `1px solid ${task.id === "rhonda" ? T.goldBorder : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: task.color }}>{task.icon}</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.beige }}>{task.id === "rhonda" ? <span>Ask <span style={{ color: T.gold }}>RHONDA</span></span> : task.label}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textMuted }}>{task.description}</p>
                  </div>
                </div>

                {/* Chat */}
                <div
                  style={{ background: chatDragOver ? T.goldDim : T.surface, border: `${chatDragOver ? 2 : 1}px solid ${chatDragOver ? T.gold : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s" }}
                  onDragOver={e => { e.preventDefault(); setChatDragOver(true); }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setChatDragOver(false); }}
                  onDrop={e => { e.preventDefault(); setChatDragOver(false); handleChatFileDrop(e.dataTransfer.files); }}
                >
                  <div style={{ minHeight: 300, maxHeight: 500, overflow: "auto", padding: 20 }}>
                    {messages.length === 0 && !loading && !parsing && (
                      <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.goldDim, border: `1px solid ${T.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, margin: "0 auto 16px" }}>{chatDragOver ? Icons.upload : task.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: T.textMuted, marginBottom: 6 }}>
                          {chatDragOver ? <span style={{ color: T.gold, fontWeight: 700 }}>Drop your file here</span> : task.id === "rhonda" ? <span>Ask <span style={{ color: T.gold, fontWeight: 700 }}>RHONDA</span> anything</span> : <span>Ask <span style={{ color: T.gold, fontWeight: 700 }}>RHONDA</span> about {task.label.toLowerCase()}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: T.textDim, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                          {chatDragOver ? "Release to load the file into this conversation." : <span>Type your request, or <span style={{ color: T.gold }}>drag a file</span> — Word, Excel, PowerPoint, PDF, CSV supported.{activeTask === "data" && " Results can be exported directly to Google Sheets or Excel."}</span>}
                        </div>
                      </div>
                    )}

                    {parsing && (
                      <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: `bounce 1.2s ease ${d * 0.15}s infinite` }} />)}</div>
                          Reading file...
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <div key={i} style={{ marginBottom: 14, animation: "fadeIn 0.3s ease" }}>
                        <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                          {msg.role === "assistant" && (
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1A14" strokeWidth="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
                            </div>
                          )}
                          <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? T.goldDim : T.surfaceHover, border: `1px solid ${msg.role === "user" ? T.goldBorder : T.border}`, color: T.text, fontSize: 13.5, lineHeight: 1.65, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                            {msg.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: T.gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>RHONDA</div>}
                            {msg.content}
                          </div>
                        </div>

                        {/* ── Sheets export actions (Sheets tile, assistant messages only) ── */}
                        {msg.role === "assistant" && activeTask === "data" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, marginLeft: 36 }}>
                            <button
                              onClick={() => handleCopyForSheets(msg.content, i)}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: copiedIdx === i ? T.greenDim : T.surface, color: copiedIdx === i ? T.green : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                            >
                              {copiedIdx === i ? Icons.check : Icons.copy}
                              {copiedIdx === i ? "Copied!" : "Copy for Sheets"}
                            </button>
                            <button
                              onClick={() => handleDownloadXLSX(msg.content)}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.surface, color: T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.color = T.text; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                            >
                              {Icons.download}
                              Download .xlsx
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.gold}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1A14" strokeWidth="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
                        </div>
                        <div style={{ padding: "10px 16px", borderRadius: 14, background: T.surfaceHover, display: "flex", gap: 5 }}>
                          {[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: `bounce 1.2s ease ${d * 0.15}s infinite` }} />)}
                        </div>
                      </div>
                    )}

                    {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: T.redDim, border: `1px solid rgba(224,90,90,0.2)`, fontSize: 12, color: T.red, marginTop: 6 }}>⚠️ {error}</div>}
                  </div>

                  {/* Input */}
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 18px", display: "flex", alignItems: "flex-end", gap: 10, background: T.bgAlt }}>
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      placeholder={messages.length === 0 ? task.placeholder.split("\n")[0] : "Type your follow-up, or drag a file here..."}
                      rows={2}
                      style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "'Outfit', sans-serif", color: T.text, resize: "none", outline: "none", lineHeight: 1.5 }}
                      onFocus={e => e.target.style.borderColor = T.borderLight}
                      onBlur={e => e.target.style.borderColor = T.border}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    />
                    <button onClick={handleSubmit} disabled={loading || parsing || !input.trim()}
                      style={{ background: loading || parsing || !input.trim() ? T.surface : `linear-gradient(135deg, ${T.gold}, #B8912E)`, border: "none", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || parsing || !input.trim() ? "default" : "pointer", color: loading || parsing || !input.trim() ? T.textDim : T.bg, flexShrink: 0 }}>{Icons.send}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea::placeholder { color: ${T.textDim}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}
