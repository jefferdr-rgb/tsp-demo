"use client";
import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════
// THEME BUILDER — pure function, no mutation
// ══════════════════════════════════════════════════
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function buildTheme(config = {}) {
  const accent = config.accent || "#c49b2a";
  const accentSecondary = config.accentSecondary || "#4a6540";
  const brand = "#c49b2a"; // TSP/RHONDA gold — always fixed

  return {
    bg: "#f4f1ea",
    bgAlt: "#edeae2",
    surface: "#ffffff",
    surfaceHover: "#faf8f3",
    surfaceActive: "#f0ede5",
    border: "#d6d1c4",
    borderLight: "#c4bfb2",
    // RHONDA brand — never changes
    brand,
    brandDim: rgba(brand, 0.1),
    brandBorder: rgba(brand, 0.3),
    brandBg08: rgba(brand, 0.08),
    brandBg15: rgba(brand, 0.15),
    brandGlow12: `0 4px 20px ${rgba(brand, 0.12)}`,
    brandGlow25: `0 12px 36px ${rgba(brand, 0.25)}`,
    // Client accent — changes per template
    gold: accent,
    goldLight: rgba(accent, 0.7),
    goldDim: rgba(accent, 0.1),
    goldBorder: rgba(accent, 0.3),
    goldBg08: rgba(accent, 0.08),
    goldBg15: rgba(accent, 0.15),
    goldGlow12: `0 4px 20px ${rgba(accent, 0.12)}`,
    goldGlow25: `0 12px 36px ${rgba(accent, 0.25)}`,
    green: accentSecondary,
    greenDim: rgba(accentSecondary, 0.1),
    greenBorder: rgba(accentSecondary, 0.3),
    greenBg08: rgba(accentSecondary, 0.08),
    greenBg15: rgba(accentSecondary, 0.15),
    greenGlow12: `0 4px 20px ${rgba(accentSecondary, 0.12)}`,
    greenGlow25: `0 12px 36px ${rgba(accentSecondary, 0.25)}`,
    red: "#C53030",
    redDim: "rgba(197, 48, 48, 0.08)",
    beige: "#2c3528",
    beigeMuted: "#5a6352",
    beigeDim: "#8a9b7a",
    text: "#2c3528",
    textMuted: "#6b705c",
    textDim: "#8a9b7a",
  };
}

// ══════════════════════════════════════════════════
// SYSTEM PROMPTS
// ══════════════════════════════════════════════════
const BASE_SYSTEM_PROMPT = `You are Rhonda, the AI office manager for this business. You help with emails, data organization, document summaries, customer replies, scheduling, and any other business task. Be warm, professional, and concise.`;

const BASE_TEACH_PROMPT = `You are RHONDA in learning mode. A staff member is teaching you their job. Your ONLY goal is to understand what they do, how they do it, what they need to know, and what "done right" looks like.

RULES:
- Be a great interviewer. Ask one follow-up question at a time — never a list.
- After they describe a task, ask: "What knowledge or skills does that require?"
- After they explain the skill, ask: "How do you know when it's done right? What's the standard?"
- If they mention something going wrong, ask: "What usually causes that? What happens next?"
- Keep it conversational. You're a curious coworker learning the ropes, not filling out a form.
- Acknowledge what they say before asking the next question: "Got it — so the PO has to match the invoice before you can approve it."
- Never try to help them do the task. You're learning, not assisting.
- Never summarize everything back in a long list. Just keep the conversation flowing naturally.
- After 5-6 exchanges, gently check: "Is there another part of your role you want to walk me through, or should we pick up here next time?"
- Be warm. They're doing you a favor by teaching you.`;

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
  teach: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
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
    if (/^\|[\s\-:|]+\|/.test(t) && /^[\|\s\-:]+$/.test(t)) continue;
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
  const XLSX = await import("xlsx-js-style");

  const HEADER = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { patternType: "solid", fgColor: { rgb: "2C3528" } },
    border: {
      top: { style: "thin", color: { rgb: "AAAAAA" } },
      bottom: { style: "thin", color: { rgb: "AAAAAA" } },
      left: { style: "thin", color: { rgb: "AAAAAA" } },
      right: { style: "thin", color: { rgb: "AAAAAA" } },
    },
    alignment: { vertical: "center", wrapText: true },
  };
  const ROW_EVEN = {
    fill: { patternType: "solid", fgColor: { rgb: "F4F1EA" } },
    border: {
      top: { style: "thin", color: { rgb: "D6D1C4" } },
      bottom: { style: "thin", color: { rgb: "D6D1C4" } },
      left: { style: "thin", color: { rgb: "D6D1C4" } },
      right: { style: "thin", color: { rgb: "D6D1C4" } },
    },
    alignment: { vertical: "center", wrapText: true },
  };
  const ROW_ODD = {
    fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
    border: {
      top: { style: "thin", color: { rgb: "D6D1C4" } },
      bottom: { style: "thin", color: { rgb: "D6D1C4" } },
      left: { style: "thin", color: { rgb: "D6D1C4" } },
      right: { style: "thin", color: { rgb: "D6D1C4" } },
    },
    alignment: { vertical: "center", wrapText: true },
  };

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[ref]) ws[ref] = { v: "", t: "s" };
      ws[ref].s = R === 0 ? HEADER : (R % 2 === 1 ? ROW_EVEN : ROW_ODD);
    }
  }
  if (rows[0]) {
    ws["!cols"] = rows[0].map((_, ci) => ({
      wch: Math.min(60, Math.max(12, ...rows.map(r => String(r[ci] ?? "").length)))
    }));
  }
  ws["!rows"] = rows.map((_, ri) => ({ hpx: ri === 0 ? 24 : 20 }));
  if (rows.length > 1) ws["!autofilter"] = { ref: ws["!ref"] };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "RHONDA Data");
  XLSX.writeFile(wb, filename);
}

// ══════════════════════════════════════════════════
// EMAIL UTILITIES
// ══════════════════════════════════════════════════

function extractEmailSubject(text) {
  const match = text.match(/^Subject:\s*(.+)$/im);
  return match ? match[1].trim() : null;
}

function extractEmailBody(text) {
  return text.replace(/^Subject:.*(\r?\n)?/im, "").replace(/^\r?\n/, "").trim();
}

// ══════════════════════════════════════════════════
// FILE FORMAT SUPPORT
// ══════════════════════════════════════════════════

async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const truncate = (text, max = Infinity) =>
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
    const XLSX = await import("xlsx-js-style");
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
// TASK DEFINITIONS — derived from theme + config
// ══════════════════════════════════════════════════
function getTasks(T, config = {}) {
  const overrides = config.tiles || {};

  const base = [
    { id: "email", label: "Email", icon: Icons.email, color: T.gold, description: "Draft, read, and send emails", placeholder: "What email do you need?\n\nExample: \"Write a follow-up to a customer about their recent installation\"", systemExtra: "Draft a professional, warm email. Include a subject line. Be concise." },
    { id: "data", label: "Sheets", icon: Icons.data, color: T.green, description: "Organize job data and spreadsheets", placeholder: "What data do you need organized?\n\nExample: \"Organize last month's jobs by type and add revenue totals\"", systemExtra: "Organize business data. ALWAYS format tabular data as a markdown table using | pipe | characters | with a separator row (|---|---|) so the user can export to Google Sheets or Excel." },
    { id: "docs", label: "Drive", icon: Icons.docs, color: "#6495ED", description: "Find and summarize documents", placeholder: "What document do you need?\n\nExample: \"Summarize this vendor contract and flag anything unusual\"", systemExtra: "Summarize in plain English. Flag key dates, dollar amounts, action items, and anything unusual." },
    { id: "calendar", label: "Calendar", icon: Icons.calendar, color: "#E8C96A", description: "Manage events and scheduling", placeholder: "What do you need with the calendar?\n\nExample: \"Find an open slot next Tuesday for a job estimate\"", systemExtra: "Help manage the calendar. Confirm details before creating events." },
    { id: "customers", label: "Customers", icon: Icons.customers, color: T.beigeMuted, description: "Handle customer questions and responses", placeholder: "Paste the customer message or describe the situation...\n\nExample: \"A customer says our quote is too high — help me respond\"", systemExtra: "Draft professional, solution-oriented customer responses. Be confident but never defensive." },
    { id: "teach", label: "Teach RHONDA", icon: Icons.teach, color: T.green, description: "Teach me your job — I'll learn the tasks, skills, and standards", placeholder: "Hit your mic key and tell me what you're working on.\n\nOr type: \"Let me walk you through how I process orders\" or \"I want to teach you about my daily routine\"", systemExtra: "", goldLabel: true, useTeachPrompt: true },
    { id: "rhonda", label: "Ask RHONDA", icon: Icons.ai, color: T.gold, description: "General questions — anything you need", placeholder: "Ask RHONDA anything...\n\nExample: \"Help me write a job posting\" or \"What should I include in a bid proposal?\"", systemExtra: "Be helpful, direct, and practical.", goldLabel: true },
    { id: "leo", label: "Send to LEO", icon: Icons.data, color: T.gold, description: "Push spreadsheet data to your LEO dashboard", placeholder: "", systemExtra: "" },
  ];

  return base
    .map(t => {
      const o = overrides[t.id];
      if (!o) return t;
      if (o.hidden) return null;
      return { ...t, ...o, icon: t.icon }; // never override icon from config
    })
    .filter(Boolean);
}

// Only send the last N messages to the API to avoid re-sending large file content
const HISTORY_LIMIT = 4;

// ══════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════
export default function RhondaShell({ config = {} }) {
  const T = buildTheme(config);
  const TASKS = getTasks(T, config);
  const MAX_MESSAGES = config.demo?.maxMessages ?? 5;
  const companyName = config.companyName || "Your Company";
  const clientKey = config.clientKey || "demo";

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
  const [copiedKey, setCopiedKey] = useState(null);
  const [fileDoc, setFileDoc] = useState(null);

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

  const handleCopyForSheets = async (content, idx, tableData) => {
    const rows = tableData
      ? [tableData.headers, ...tableData.rows]
      : extractTableRows(content);
    await navigator.clipboard.writeText(rows ? rowsToTSV(rows) : content);
    setCopiedKey(`sheets-${idx}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadXLSX = async (content, tableData) => {
    const rows = tableData
      ? [tableData.headers, ...tableData.rows]
      : (extractTableRows(content) || content.split("\n").filter(Boolean).map(l => [l]));
    await downloadXLSX(rows);
  };

  const handleCopyEmail = async (type, content, idx) => {
    let text = content;
    if (type === "subject") {
      text = extractEmailSubject(content) || content;
    } else if (type === "body") {
      text = extractEmailBody(content);
    }
    await navigator.clipboard.writeText(text);
    setCopiedKey(`email-${type}-${idx}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileDrop = async (taskId, files) => {
    if (!files || !files.length) return;
    const file = files[0];
    setActiveTask(taskId); setMessages([]); setError(""); setFileDoc(null); setParsing(true);
    try {
      const content = await parseFile(file);
      if (taskId === "leo") {
        setParsing(false);
        setMessages([{ role: "assistant", content: `Sending "${file.name}" to LEO…` }]);
        try {
          const res = await fetch("/api/leo-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientKey,
              rawData: content,
            }),
          });
          if (res.ok) {
            setMessages([{ role: "assistant", content: `✓ "${file.name}" sent to LEO. Your dashboard metrics have been updated.` }]);
          } else {
            setMessages([{ role: "assistant", content: `Could not reach LEO — check your connection and try again.` }]);
          }
        } catch {
          setMessages([{ role: "assistant", content: `Could not reach LEO — check your connection and try again.` }]);
        }
        return;
      }
      if (taskId === "docs") {
        setFileDoc({ name: file.name, content });
        setInput(`Summarize "${file.name}" and flag key dates, dollar amounts, and action items.`);
      } else {
        setInput(`I'm sharing a file: "${file.name}"\n\n${content}`);
      }
    } catch {
      setInput(`I'm sharing a file: "${file.name}" — please help me work with this.`);
    } finally { setParsing(false); }
  };

  const handleChatFileDrop = async (files) => {
    if (!files || !files.length) return;
    const file = files[0];
    if (activeTask === "leo") { handleFileDrop("leo", [file]); return; }
    setParsing(true);
    try {
      const content = await parseFile(file);
      if (activeTask === "docs") {
        setFileDoc({ name: file.name, content });
        setInput(prev => (prev ? prev + "\n\n" : "") + `"${file.name}" loaded — what would you like to know?`);
      } else {
        setInput(prev => (prev ? prev + "\n\n" : "") + `File: "${file.name}"\n\n${content}`);
      }
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

    const docForApi = fileDoc;
    if (fileDoc) setFileDoc(null);
    const userContent = (activeTask === "docs" && docForApi)
      ? [
          { type: "document", source: { type: "text", data: docForApi.content }, title: docForApi.name, citations: { enabled: true } },
          { type: "text", text: input },
        ]
      : input;

    const sheetsTools = activeTask === "data" ? {
      tools: [{
        name: "format_as_table",
        description: "Format the organized data as a structured table with headers and rows",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Brief explanation of what was organized" },
            headers: { type: "array", items: { type: "string" } },
            rows: { type: "array", items: { type: "array", items: { type: "string" } } },
          },
          required: ["summary", "headers", "rows"],
        },
      }],
      tool_choice: { type: "tool", name: "format_as_table" },
    } : {};

    try {
      const historyMsgs = messages.slice(-(HISTORY_LIMIT - 1)).map(m => ({ role: m.role, content: m.content }));
      const apiMessages = [...historyMsgs, { role: "user", content: userContent }];
      const isTeach = activeTask === "teach";

      // Build system prompt with optional preamble from config
      const preamble = isTeach ? (config.teachPreamble || "") : (config.systemPreamble || "");
      const basePrompt = isTeach ? BASE_TEACH_PROMPT : BASE_SYSTEM_PROMPT + (task?.systemExtra ? "\n\n" + task.systemExtra : "");
      const systemPrompt = preamble ? preamble + "\n\n" + basePrompt : basePrompt;

      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: isTeach ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
          max_tokens: isTeach ? 400 : 700,
          system: systemPrompt,
          messages: isTeach ? [...messages.slice(-8).map(m => ({ role: m.role, content: m.content })), { role: "user", content: input }] : apiMessages,
          ...sheetsTools,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error.message); }
      else {
        const textBlocks = (data.content || []).filter(b => b.type === "text");
        const text = textBlocks.map(b => b.text).join("\n").trim();
        const citations = textBlocks.flatMap(b => b.citations || []).filter(c => c.cited_text);
        const toolResult = (data.content || []).find(b => b.type === "tool_use" && b.name === "format_as_table");
        const tableData = toolResult?.input || null;
        setMessages([...newMessages, {
          role: "assistant",
          content: tableData?.summary || text || "Done. Anything else?",
          citations: citations.length > 0 ? citations : null,
          tableData,
        }]);
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
      {config.demo?.gatedCTA !== false && (
        <div style={{ background: "linear-gradient(135deg, #2c3528, #1e2a1c)", padding: "10px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, borderBottom: `1px solid ${T.brand}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.brand, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f4f1ea", letterSpacing: "0.04em" }}>
              LIVE DEMO — Try <span style={{ color: T.brand, fontWeight: 800 }}>RHONDA</span> right now
            </span>
          </div>
          <div style={{ fontSize: 11, color: T.textDim }}>|</div>
          <span style={{ fontSize: 11, color: "#8a9b7a" }}>{MAX_MESSAGES - totalMessages} of {MAX_MESSAGES} free messages remaining</span>
          <a href="https://treestandpartners.com" target="_blank" style={{ fontSize: 10, fontWeight: 700, color: T.brand, textDecoration: "none", padding: "4px 12px", border: `1px solid ${T.brand}44`, borderRadius: 4, letterSpacing: "0.06em" }}>LEARN MORE →</a>
        </div>
      )}

      {/* ══════ GATED SCREEN ══════ */}
      {gated && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,26,20,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "48px 44px", maxWidth: 480, width: "90%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", animation: "fadeIn 0.4s ease" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${T.brand}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: T.brandGlow25 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2c3528", margin: "0 0 8px" }}><span style={{ color: T.brand }}>RHONDA</span> is ready to work full-time</h2>
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
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.brand}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px rgba(212,168,67,0.2)` }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="#0B1A14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="16" y1="7" x2="16" y2="25"/><polyline points="10,17 16,10 22,17"/><polyline points="12,22 16,17 20,22"/><line x1="11" y1="25" x2="21" y2="25"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f4f1ea", letterSpacing: "0.02em" }}>{companyName}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.brand, letterSpacing: "0.14em", textTransform: "uppercase" }}>AI Dashboard</div>
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "#3a4a35", margin: "0 14px" }} />
          <div style={{ padding: "12px 8px", flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7e6a", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 10px", marginBottom: 4 }}>Tools</div>
            {TASKS.map(t => {
              const isActive = activeTask === t.id;
              return (
                <div key={t.id} onClick={() => { setActiveTask(t.id); setMessages([]); setInput(""); setError(""); setFileDoc(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: isActive ? T.goldBg15 : "transparent", color: isActive ? T.gold : "#8a9b7a", transition: "all 0.2s", marginBottom: 1, position: "relative" }}
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
                  <span onClick={() => { setActiveTask(null); setMessages([]); setFileDoc(null); }} style={{ cursor: "pointer" }}>Dashboard</span>
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
                  <span style={{ color: T.brand, fontWeight: 700 }}>RHONDA</span> is ready. What do you need help with?{" "}
                  <span style={{ color: T.textDim, fontSize: 12 }}>Drag a file onto any tile to get started.</span>
                </p>
                <p style={{ fontSize: 11, color: T.textDim, margin: "0 0 24px" }}>
                  Supports: Word · Excel · PowerPoint · PDF · CSV · Google Docs · Google Sheets · Google Slides
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 32 }}>
                  {TASKS.map((t, i) => {
                    const isDrop = dragOver === t.id;
                    const isPremium = t.id === "teach" || t.id === "rhonda";
                    const isTeachTile = t.id === "teach";
                    const isRhondaTile = t.id === "rhonda";
                    const premiumColor = isTeachTile ? T.brand : isRhondaTile ? T.green : null;
                    const premiumBg = isTeachTile
                      ? `linear-gradient(135deg, ${T.brandBg08} 0%, ${T.brandBg15} 100%)`
                      : isRhondaTile
                      ? `linear-gradient(135deg, ${T.greenBg08} 0%, ${T.greenBg15} 100%)`
                      : null;
                    const premiumBorder = isTeachTile ? T.brandBorder : isRhondaTile ? T.greenBorder : null;
                    const premiumGlow = isTeachTile
                      ? T.brandGlow12
                      : isRhondaTile
                      ? T.greenGlow12
                      : "none";
                    const premiumHoverGlow = isTeachTile
                      ? T.brandGlow25
                      : isRhondaTile
                      ? T.greenGlow25
                      : "0 8px 24px rgba(0,0,0,0.2)";
                    return (
                      <div key={t.id}
                        onClick={() => { setActiveTask(t.id); setMessages([]); setInput(""); setError(""); setFileDoc(null); }}
                        onDragOver={e => { e.preventDefault(); setDragOver(t.id); }}
                        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                        onDrop={e => { e.preventDefault(); setDragOver(null); handleFileDrop(t.id, e.dataTransfer.files); }}
                        style={{ background: isDrop ? T.goldDim : isPremium ? premiumBg : T.surface, border: `${isDrop || isPremium ? 2 : 1}px solid ${isDrop ? T.gold : isPremium ? premiumBorder : T.border}`, borderRadius: isPremium ? 14 : 12, padding: isDrop ? "21px 19px" : isPremium ? "21px 19px" : "22px 20px", cursor: "pointer", transition: "all 0.25s ease", animation: `fadeIn 0.4s ease ${i * 0.05}s both`, transform: isDrop ? "translateY(-3px) scale(1.01)" : "translateY(0)", boxShadow: isDrop ? `0 12px 32px rgba(196,155,42,0.2)` : premiumGlow, position: "relative", overflow: "hidden" }}
                        onMouseEnter={e => { if (!isDrop) { e.currentTarget.style.borderColor = isPremium ? (premiumColor || T.borderLight) : T.borderLight; e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = premiumHoverGlow; } }}
                        onMouseLeave={e => { if (!isDrop) { e.currentTarget.style.borderColor = isPremium ? premiumBorder : T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isPremium ? premiumGlow : "none"; } }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: isDrop ? T.brandDim : isPremium ? (isTeachTile ? T.brandBg15 : T.greenBg15) : T.surfaceHover, border: `1px solid ${isDrop ? T.brandBorder : isPremium ? premiumBorder : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: isDrop ? T.brand : t.color, marginBottom: 14, transition: "all 0.2s" }}>
                          {isDrop ? Icons.upload : t.icon}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.beige, marginBottom: 5 }}>
                          {isTeachTile ? <span>Teach <span style={{ color: T.brand }}>RHONDA</span></span> : isRhondaTile ? <span>Ask <span style={{ color: T.green }}>RHONDA</span></span> : t.label}
                        </div>
                        <div style={{ fontSize: 12, color: isPremium ? T.text : T.textMuted, lineHeight: 1.5 }}>{t.description}</div>
                        <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: isPremium ? premiumColor : T.gold }}>{isDrop ? "Drop to upload →" : "Open →"}</div>
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
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: task.id === "teach" ? T.brandBg15 : task.id === "rhonda" ? T.greenBg15 : T.surfaceHover, border: `1px solid ${task.id === "teach" ? T.brandBorder : task.id === "rhonda" ? T.greenBorder : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: task.color }}>{task.icon}</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.beige }}>{task.id === "teach" ? <span>Teach <span style={{ color: T.brand }}>RHONDA</span></span> : task.id === "rhonda" ? <span>Ask <span style={{ color: T.green }}>RHONDA</span></span> : task.label}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textMuted }}>{task.description}</p>
                  </div>
                </div>

                {/* LEO tile — dedicated drop zone, no chat */}
                {activeTask === "leo" && (
                  <div
                    style={{ background: chatDragOver ? T.goldDim : T.surface, border: `${chatDragOver ? 2 : 1}px solid ${chatDragOver ? T.gold : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s", cursor: "default" }}
                    onDragOver={e => { e.preventDefault(); setChatDragOver(true); }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setChatDragOver(false); }}
                    onDrop={e => { e.preventDefault(); setChatDragOver(false); handleChatFileDrop(e.dataTransfer.files); }}
                  >
                    <div style={{ minHeight: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
                      {parsing ? (
                        <div style={{ fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand, animation: `bounce 1.2s ease ${d*0.15}s infinite` }} />)}</div>
                          Pushing to LEO…
                        </div>
                      ) : messages.length > 0 ? (
                        <div style={{ fontSize: 14, color: messages[0]?.content?.startsWith("✓") ? T.green : T.red, fontWeight: 600 }}>{messages[0]?.content}</div>
                      ) : (
                        <>
                          <div style={{ width: 56, height: 56, borderRadius: 14, background: chatDragOver ? T.gold : T.goldDim, border: `1px solid ${T.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: chatDragOver ? T.bg : T.gold, marginBottom: 18, transition: "all 0.2s", fontSize: 22 }}>
                            {chatDragOver ? Icons.upload : Icons.data}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: T.beige, marginBottom: 8 }}>
                            {chatDragOver ? "Drop to push to LEO" : "Drop your spreadsheet here"}
                          </div>
                          <div style={{ fontSize: 13, color: T.textMuted, maxWidth: 340, lineHeight: 1.6 }}>
                            Excel or CSV — Claude will extract your KPIs and update your <span style={{ color: T.gold }}>LEO dashboard</span> live.
                          </div>
                          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg, ${T.brand}, #B8912E)`, color: T.bg, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              Push to LEO
                              <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => { if (e.target.files?.length) handleFileDrop("leo", e.target.files); }} />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Chat */}
                {activeTask !== "leo" && <div
                  style={{ background: chatDragOver ? T.goldDim : T.surface, border: `${chatDragOver ? 2 : 1}px solid ${chatDragOver ? T.gold : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s" }}
                  onDragOver={e => { e.preventDefault(); setChatDragOver(true); }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setChatDragOver(false); }}
                  onDrop={e => { e.preventDefault(); setChatDragOver(false); handleChatFileDrop(e.dataTransfer.files); }}
                >
                  <div style={{ minHeight: 300, maxHeight: 500, overflow: "auto", padding: 20 }}>
                    {messages.length === 0 && !loading && !parsing && (
                      <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: task.id === "teach" ? T.brandBg15 : task.id === "rhonda" ? T.greenBg15 : T.brandDim, border: `1px solid ${task.id === "teach" ? T.brandBorder : task.id === "rhonda" ? T.greenBorder : T.brandBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: task.id === "teach" ? T.brand : task.id === "rhonda" ? T.green : T.brand, margin: "0 auto 16px" }}>{chatDragOver ? Icons.upload : task.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: T.textMuted, marginBottom: 6 }}>
                          {chatDragOver ? <span style={{ color: T.brand, fontWeight: 700 }}>Drop your file here</span> : task.id === "teach" ? <span>Teach <span style={{ color: T.brand, fontWeight: 700 }}>RHONDA</span> your job</span> : task.id === "rhonda" ? <span>Ask <span style={{ color: T.green, fontWeight: 700 }}>RHONDA</span> anything</span> : <span>Ask <span style={{ color: T.brand, fontWeight: 700 }}>RHONDA</span> about {task.label.toLowerCase()}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: T.textDim, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                          {chatDragOver ? "Release to load the file into this conversation." : <span>Type your request, or <span style={{ color: T.gold }}>drag a file</span> — Word, Excel, PowerPoint, PDF, CSV supported.{activeTask === "data" && " Results can be exported directly to Google Sheets or Excel."}</span>}
                        </div>
                      </div>
                    )}

                    {parsing && (
                      <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand, animation: `bounce 1.2s ease ${d * 0.15}s infinite` }} />)}</div>
                          Reading file...
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <div key={i} style={{ marginBottom: 14, animation: "fadeIn 0.3s ease" }}>
                        <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                          {msg.role === "assistant" && (
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.brand}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1A14" strokeWidth="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
                            </div>
                          )}
                          <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? T.goldDim : T.surfaceHover, border: `1px solid ${msg.role === "user" ? T.goldBorder : T.border}`, color: T.text, fontSize: 13.5, lineHeight: 1.65, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                            {msg.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: T.brand, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>RHONDA</div>}
                            {msg.content}
                            {/* Structured table (Sheets task) */}
                            {msg.tableData && (
                              <div style={{ marginTop: 12, overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                  <thead>
                                    <tr>{msg.tableData.headers.map((h, hi) => (
                                      <th key={hi} style={{ padding: "6px 10px", background: T.beige, color: "#f4f1ea", fontWeight: 700, textAlign: "left", fontSize: 11, borderBottom: `2px solid ${T.borderLight}`, whiteSpace: "nowrap" }}>{h}</th>
                                    ))}</tr>
                                  </thead>
                                  <tbody>{msg.tableData.rows.map((row, ri) => (
                                    <tr key={ri} style={{ background: ri % 2 === 0 ? T.bgAlt : T.surface }}>
                                      {row.map((cell, ci) => (
                                        <td key={ci} style={{ padding: "5px 10px", borderBottom: `1px solid ${T.border}`, color: T.text, fontSize: 12 }}>{cell}</td>
                                      ))}
                                    </tr>
                                  ))}</tbody>
                                </table>
                              </div>
                            )}
                            {/* Citations (Drive task) */}
                            {msg.citations && (
                              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: T.brand, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Sources</div>
                                {msg.citations.slice(0, 4).map((c, ci) => (
                                  <div key={ci} style={{ fontSize: 11, color: T.textMuted, padding: "5px 8px", borderLeft: `2px solid ${T.goldBorder}`, marginBottom: 4, background: T.bgAlt, borderRadius: "0 4px 4px 0" }}>
                                    <span style={{ fontWeight: 600, color: T.textDim, display: "block", marginBottom: 2 }}>{c.document_title}</span>
                                    {`"${c.cited_text.slice(0, 130)}${c.cited_text.length > 130 ? "…" : ""}"`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ── Email copy actions ── */}
                        {msg.role === "assistant" && activeTask === "email" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, marginLeft: 36, flexWrap: "wrap" }}>
                            {[
                              { type: "subject", label: "Copy Subject" },
                              { type: "body",    label: "Copy Body"    },
                              { type: "all",     label: "Copy All"     },
                            ].map(({ type, label }) => {
                              const key = `email-${type}-${i}`;
                              const copied = copiedKey === key;
                              return (
                                <button key={type}
                                  onClick={() => handleCopyEmail(type, msg.content, i)}
                                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: copied ? T.greenDim : T.surface, color: copied ? T.green : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                                  onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.color = T.text; } }}
                                  onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; } }}
                                >
                                  {copied ? Icons.check : Icons.copy}
                                  {copied ? "Copied!" : label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* ── Sheets export actions ── */}
                        {msg.role === "assistant" && activeTask === "data" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, marginLeft: 36 }}>
                            <button
                              onClick={() => handleCopyForSheets(msg.content, i, msg.tableData)}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: copiedKey === `sheets-${i}` ? T.greenDim : T.surface, color: copiedKey === `sheets-${i}` ? T.green : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                            >
                              {copiedKey === `sheets-${i}` ? Icons.check : Icons.copy}
                              {copiedKey === `sheets-${i}` ? "Copied!" : "Copy for Sheets"}
                            </button>
                            <button
                              onClick={() => handleDownloadXLSX(msg.content, msg.tableData)}
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
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.brand}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1A14" strokeWidth="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
                        </div>
                        <div style={{ padding: "10px 16px", borderRadius: 14, background: T.surfaceHover, display: "flex", gap: 5 }}>
                          {[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: T.brand, animation: `bounce 1.2s ease ${d * 0.15}s infinite` }} />)}
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
                </div>}
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
