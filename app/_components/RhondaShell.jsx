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

function darken(hex, amount = 0.15) {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 - amount;
  return `#${Math.round(r*f).toString(16).padStart(2,"0")}${Math.round(g*f).toString(16).padStart(2,"0")}${Math.round(b*f).toString(16).padStart(2,"0")}`;
}

// WCAG relative luminance — picks white or black text for max contrast
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function contrastText(bgHex) { return luminance(bgHex) > 0.4 ? "#1a1a1a" : "#f5f5f5"; }
function contrastMuted(bgHex) { return luminance(bgHex) > 0.4 ? "#6b705c" : "rgba(255,255,255,0.55)"; }
function contrastDim(bgHex) { return luminance(bgHex) > 0.4 ? "#8a9b7a" : "rgba(255,255,255,0.35)"; }

function buildTheme(config = {}) {
  const accent = config.accent || "#c49b2a";
  const accentSecondary = config.accentSecondary || "#4a6540";
  const brand = "#c49b2a"; // TSP/RHONDA gold — always fixed
  const chrome = config.chrome || "#2c3528"; // sidebar/banner bg
  const chromeBorder = darken(chrome, -0.15);  // slightly lighter for borders
  // Configurable backgrounds — defaults to warm beige
  const bg = config.bg || "#f4f1ea";
  const surface = config.surface || "#ffffff";
  const border = config.border || "#d6d1c4";
  const borderLight = config.borderLight || darken(border, -0.1);

  return {
    chrome,
    chromeBorder,
    chromeDark: darken(chrome, 0.2),
    bg,
    bgAlt: config.bgAlt || darken(bg, -0.03),
    surface,
    surfaceHover: config.surfaceHover || darken(surface, -0.02),
    surfaceActive: config.surfaceActive || darken(surface, 0.03),
    border,
    borderLight,
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
    // Chrome-derived (for Ask RHONDA tile — matches sidebar)
    chromeBg08: rgba(chrome, 0.08),
    chromeBg15: rgba(chrome, 0.15),
    chromeBorder30: rgba(chrome, 0.3),
    chromeGlow12: `0 4px 20px ${rgba(chrome, 0.12)}`,
    chromeGlow25: `0 12px 36px ${rgba(chrome, 0.25)}`,
    red: "#C53030",
    redDim: "rgba(197, 48, 48, 0.08)",
    // Auto-contrast text — adapts to bg luminance
    beige: contrastText(bg),
    beigeMuted: contrastMuted(bg),
    beigeDim: contrastDim(bg),
    text: contrastText(bg),
    textMuted: contrastMuted(bg),
    textDim: contrastDim(bg),
    // Surface-contrast text — for cards/modals on surface bg
    textOnSurface: contrastText(surface),
    textMutedOnSurface: contrastMuted(surface),
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
  camera: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  globe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  mic: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/></svg>,
  clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
};

// ══════════════════════════════════════════════════
// POWER TOOLS — standalone feature pages (default set)
// Clients can override via config.powerTools
// ══════════════════════════════════════════════════
const DEFAULT_POWER_TOOLS = [
  { category: "Safety", emoji: "🛡️", items: [
    { label: "Safety Heat Map", href: "/safety-map", desc: "See where hazards cluster" },
    { label: "Incident Report", href: "/incident-report", desc: "Voice-powered reporting" },
    { label: "Shift Handoff", href: "/shift-handoff", desc: "Auto-generated briefings" },
  ]},
  { category: "Knowledge", emoji: "🧠", items: [
    { label: "Ask the Veteran", href: "/ask-veteran", desc: "Decades of expertise on tap" },
    { label: "Bounty Board", href: "/bounty-board", desc: "Get paid to document what you know" },
    { label: "SOP Generator", href: "/sop-generator", desc: "Turn talk into procedures" },
  ]},
  { category: "Operations", emoji: "⚙️", items: [
    { label: "Batch Scanner", href: "/batch-scan", desc: "Feed a stack, RHONDA does the rest" },
    { label: "Scorecard", href: "/scorecard", desc: "Personal ROI + safety streaks" },
    { label: "ROI Dashboard", href: "/roi-ticker", desc: "Every dollar RHONDA saves" },
    { label: "Predictive Maintenance", href: "/predictive-maintenance", desc: "Fix it before it breaks" },
    { label: "Asset Manager", href: "/asset-manager", desc: "Track every machine" },
  ]},
  { category: "Quality", emoji: "✅", items: [
    { label: "Compliance Scan", href: "/compliance-scan", desc: "Certs, inspections, training" },
    { label: "Defect Inspector", href: "/defect-inspector", desc: "AI-powered visual QC" },
    { label: "Audit Package", href: "/audit-package", desc: "One-click audit bundles" },
  ]},
  { category: "People", emoji: "👥", items: [
    { label: "Onboard", href: "/onboard", desc: "New hire in 5 minutes" },
    { label: "Voice Broadcast", href: "/voice-broadcast", desc: "Announcements to every phone" },
    { label: "Equipment Whisperer", href: "/equipment-whisperer", desc: "Diagnose any machine" },
  ]},
];

// ══════════════════════════════════════════════════
// STEP SEQUENCES — maps task IDs to animated progress labels
// ══════════════════════════════════════════════════
const STEP_SEQUENCES = {
  email:     [{ label: "Reading your request…", delay: 0 }, { label: "Drafting email…", delay: 1200 }, { label: "Polishing tone…", delay: 2800 }],
  data:      [{ label: "Parsing your data…", delay: 0 }, { label: "Organizing columns…", delay: 1400 }, { label: "Building table…", delay: 3000 }],
  docs:      [{ label: "Reading document…", delay: 0 }, { label: "Finding key sections…", delay: 1500 }, { label: "Summarizing…", delay: 3200 }],
  calendar:  [{ label: "Checking schedule…", delay: 0 }, { label: "Finding availability…", delay: 1200 }],
  customers: [{ label: "Reading context…", delay: 0 }, { label: "Drafting reply…", delay: 1200 }, { label: "Reviewing tone…", delay: 2600 }],
  teach:     [{ label: "Reviewing your answer…", delay: 0 }, { label: "Preparing follow-up…", delay: 1000 }],
  rhonda:    [{ label: "Thinking…", delay: 0 }, { label: "Working on it…", delay: 1500 }],
  leo:       [{ label: "Preparing data for LEO…", delay: 0 }, { label: "Sending…", delay: 1200 }],
  sop:       [{ label: "Reading transcript…", delay: 0 }, { label: "Identifying steps…", delay: 2000 }, { label: "Writing safety checks…", delay: 5000 }, { label: "Formatting SOP…", delay: 8000 }, { label: "Final review…", delay: 11000 }],
  photo:     [{ label: "Analyzing image…", delay: 0 }, { label: "Extracting text…", delay: 1500 }, { label: "Structuring data…", delay: 3500 }],
  compliance:[{ label: "Checking compliance data…", delay: 0 }, { label: "Scanning alerts…", delay: 1200 }],
  incident:  [{ label: "Processing report…", delay: 0 }, { label: "Classifying severity…", delay: 1500 }, { label: "Generating document…", delay: 3000 }],
  onboard:   [{ label: "Reading ID…", delay: 0 }, { label: "Extracting fields…", delay: 1500 }, { label: "Building form…", delay: 3000 }],
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

// Convert 0-based column index to Excel letter (0=A, 25=Z, 26=AA, etc.)
function encodeCol(c) {
  let s = "";
  c++;
  while (c > 0) { c--; s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26); }
  return s;
}

// Auto-detect formulas from parsed rows (totals, averages, subtotals)
function detectFormulas(rows) {
  if (!rows || rows.length < 3) return null;
  const formulas = [];
  for (let r = 1; r < rows.length; r++) {
    const label = String(rows[r][0] || "").toLowerCase().trim();
    const isTotal = /^(total|sum|subtotal|grand total)s?$/i.test(label) || label.includes("total");
    const isAvg = /^(average|avg|mean)$/i.test(label) || label.includes("average");
    if (!isTotal && !isAvg) continue;
    for (let c = 1; c < rows[r].length; c++) {
      const val = String(rows[r][c] || "").replace(/[$,%\s]/g, "");
      if (!val || isNaN(parseFloat(val))) continue;
      const col = encodeCol(c);
      const dataStart = 2; // Excel row 2 (after header)
      const dataEnd = r; // rows before this summary row (r is 0-indexed in data, +1 for header = r+1, but we want row before = r)
      const fn = isAvg ? "AVERAGE" : "SUM";
      formulas.push({ row: r - 1, col: c, formula: `=${fn}(${col}${dataStart}:${col}${dataEnd})` });
    }
  }
  return formulas.length > 0 ? formulas : null;
}

async function downloadXLSX(rows, filename = "rhonda-data.xlsx", tableData = null) {
  const XLSX = await import("xlsx-js-style");

  const thinBorderLight = { style: "thin", color: { rgb: "D6D1C4" } };
  const thinBorderDark = { style: "thin", color: { rgb: "AAAAAA" } };
  const baseBorder = { top: thinBorderLight, bottom: thinBorderLight, left: thinBorderLight, right: thinBorderLight };
  const baseAlign = { vertical: "center", wrapText: true };

  const HEADER = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { patternType: "solid", fgColor: { rgb: "2C3528" } },
    border: { top: thinBorderDark, bottom: thinBorderDark, left: thinBorderDark, right: thinBorderDark },
    alignment: baseAlign,
  };
  const ROW_EVEN = { fill: { patternType: "solid", fgColor: { rgb: "F4F1EA" } }, border: baseBorder, alignment: baseAlign };
  const ROW_ODD = { fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } }, border: baseBorder, alignment: baseAlign };

  // Financial model cell type styles (merged with row styles)
  const CELL_INPUT = { font: { color: { rgb: "0000CC" } } }; // blue = user inputs
  const CELL_ASSUMPTION = { fill: { patternType: "solid", fgColor: { rgb: "FFFDE7" } } }; // light yellow
  const CELL_FORMULA = { font: { color: { rgb: "2C3528" } } }; // dark = calculated

  const isFinancial = tableData?.isFinancialModel === true;
  const formulas = tableData?.formulas || detectFormulas(rows);
  const cellTypes = tableData?.cellTypes;

  // Build lookup maps
  const formulaMap = {};
  if (formulas) {
    for (const f of formulas) formulaMap[`${f.row},${f.col}`] = f.formula;
  }
  const typeMap = {};
  if (cellTypes) {
    for (const ct of cellTypes) typeMap[`${ct.row},${ct.col}`] = ct.type;
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[ref]) ws[ref] = { v: "", t: "s" };

      // Base style (header vs alternating rows)
      let style = R === 0 ? { ...HEADER } : (R % 2 === 1 ? { ...ROW_EVEN } : { ...ROW_ODD });

      if (R > 0) {
        const dataRow = R - 1; // 0-indexed data row (excluding header)
        const key = `${dataRow},${C}`;

        // Apply formula if present
        const formula = formulaMap[key];
        if (formula) {
          const rawFormula = formula.startsWith("=") ? formula.slice(1) : formula;
          const numVal = parseFloat(String(ws[ref].v || "0").replace(/[$,%\s]/g, ""));
          ws[ref] = { f: rawFormula, v: isNaN(numVal) ? 0 : numVal, t: "n" };
        }

        // Apply cell type styling for financial models
        if (isFinancial) {
          const cellType = typeMap[key] || (formula ? "formula" : null);
          if (cellType === "input") {
            style = { ...style, font: { ...style.font, ...CELL_INPUT.font } };
          } else if (cellType === "assumption") {
            style = { ...style, fill: CELL_ASSUMPTION.fill, font: { ...style.font, bold: true } };
          } else if (cellType === "formula") {
            style = { ...style, font: { ...style.font, ...CELL_FORMULA.font } };
          }
        }

        // Number formatting — detect currency, percentage, plain numbers
        const val = String(ws[ref].v ?? ws[ref].f ?? "");
        const origVal = String(rows[R]?.[C] ?? "");
        if (origVal.includes("$") || origVal.includes("USD")) {
          style.numFmt = '$#,##0.00;($#,##0.00);"-"';
          if (ws[ref].t === "s") {
            const n = parseFloat(origVal.replace(/[$,\s]/g, ""));
            if (!isNaN(n)) { ws[ref].v = n; ws[ref].t = "n"; }
          }
        } else if (origVal.includes("%")) {
          style.numFmt = "0.0%";
          if (ws[ref].t === "s") {
            const n = parseFloat(origVal.replace(/[%,\s]/g, ""));
            if (!isNaN(n)) { ws[ref].v = n / 100; ws[ref].t = "n"; }
          }
        } else if (ws[ref].t === "s" && !formula) {
          const cleaned = String(rows[R]?.[C] ?? "").replace(/[,\s]/g, "");
          const n = parseFloat(cleaned);
          if (!isNaN(n) && cleaned === String(n).replace(/[,\s]/g, "") || /^-?[\d,]+\.?\d*$/.test(cleaned)) {
            ws[ref].v = n; ws[ref].t = "n";
            style.numFmt = "#,##0;(#,##0)";
          }
        }
      }

      ws[ref].s = style;
    }
  }

  // Column widths
  if (rows[0]) {
    ws["!cols"] = rows[0].map((_, ci) => ({
      wch: Math.min(60, Math.max(12, ...rows.map(r => String(r[ci] ?? "").length)))
    }));
  }
  // Row heights
  ws["!rows"] = rows.map((_, ri) => ({ hpx: ri === 0 ? 24 : 20 }));
  // Auto-filter
  if (rows.length > 1) ws["!autofilter"] = { ref: ws["!ref"] };
  // Freeze header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isFinancial ? "Financial Model" : "RHONDA Data");
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

// Check if file is an image (including iPhone HEIC)
function isImageFile(file) {
  if (file.type && file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "bmp", "tiff", "tif"].includes(ext);
}

// Convert image to base64 JPEG (resized for Claude vision, max 1568px)
async function imageToBase64(file) {
  return new Promise((resolve) => {
    // For HEIC or any image, use canvas to convert to JPEG
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxDim = 1568;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      resolve(dataUrl.split(",")[1]); // strip data:image/jpeg;base64, prefix
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const truncate = (text, max = Infinity) =>
    text.length > max
      ? text.slice(0, max) + `\n\n[Truncated — showing first ${max.toLocaleString()} of ${text.length.toLocaleString()} characters]`
      : text;

  // Images are handled separately via vision — return a marker
  if (isImageFile(file)) {
    return `[IMAGE: ${file.name}]`;
  }

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
    { id: "data", label: "Sheets", icon: Icons.data, color: T.green, description: "Organize job data and spreadsheets", placeholder: "What data do you need organized?\n\nExample: \"Organize last month's jobs by type and add revenue totals\"", systemExtra: "Organize business data into structured tables. When the data involves calculations (totals, subtotals, averages, growth rates, margins, etc.), include Excel formulas in the formulas array using standard Excel formula syntax (=SUM, =AVERAGE, =B2*C2, etc.) with cell references where row 1 is the header and data starts at row 2. For financial models (projections, budgets, P&Ls, scenarios), set isFinancialModel: true and annotate cells with cellTypes: 'input' for user-changeable values, 'assumption' for key assumptions, 'formula' for calculated cells." },
    { id: "docs", label: "Drive", icon: Icons.docs, color: "#6495ED", description: "Find and summarize documents", placeholder: "What document do you need?\n\nExample: \"Summarize this vendor contract and flag anything unusual\"", systemExtra: "Summarize in plain English. Flag key dates, dollar amounts, action items, and anything unusual." },
    { id: "calendar", label: "Calendar", icon: Icons.calendar, color: "#E8C96A", description: "Manage events and scheduling", placeholder: "What do you need with the calendar?\n\nExample: \"Find an open slot next Tuesday for a job estimate\"", systemExtra: "Help manage the calendar. Confirm details before creating events." },
    { id: "customers", label: "Customers", icon: Icons.customers, color: T.beigeMuted, description: "Handle customer questions and responses", placeholder: "Paste the customer message or describe the situation...\n\nExample: \"A customer says our quote is too high — help me respond\"", systemExtra: "Draft professional, solution-oriented customer responses. Be confident but never defensive." },
    { id: "photo", label: "Scan", icon: Icons.camera, color: "#8B5CF6", description: "Photograph any document — RHONDA digitizes it", placeholder: "Take a photo of a whiteboard, form, clipboard, or any paper document.\n\nRHONDA will extract and structure all the data.", systemExtra: "A worker has photographed a physical document. Digitize it into clean, structured, editable data. If it contains a table, format as markdown table. Preserve all numbers and measurements exactly.", isVision: true },
    { id: "compliance", label: "Compliance", icon: Icons.shield, color: T.red, description: "Cert expirations, overdue inspections, training gaps", placeholder: "Ask about compliance status, certifications, inspections, or training...\n\nExample: \"Which certs expire this month?\" or \"Show me overdue inspections\"", systemExtra: "You have access to compliance data including employee certifications, inspections, and training records. Help the user understand their compliance status and take action on alerts." },
    { id: "teach", label: "Teach RHONDA", icon: Icons.teach, color: T.green, description: "Teach me your job — I'll learn the tasks, skills, and standards", placeholder: "Hit your mic key and tell me what you're working on.\n\nOr type: \"Let me walk you through how I process orders\" or \"I want to teach you about my daily routine\"", systemExtra: "", goldLabel: true, useTeachPrompt: true },
    { id: "rhonda", label: "Ask RHONDA", icon: Icons.ai, color: T.chrome, description: "General questions — anything you need", placeholder: "Ask RHONDA anything...\n\nExample: \"Help me write a job posting\" or \"What should I include in a bid proposal?\"", systemExtra: "Be helpful, direct, and practical.", goldLabel: true },
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
  const POWER_TOOLS = config.powerTools || DEFAULT_POWER_TOOLS;
  const MAX_MESSAGES = config.demo?.maxMessages ?? 5;
  const companyName = config.companyName || "Your Company";
  const clientKey = config.clientKey || "demo";

  const [activeTask, setActiveTask] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentStep, setAgentStep] = useState("");
  const [sopStep, setSopStep] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date());
  const [totalMessages, setTotalMessages] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("rhonda_demo_msgs") || "0", 10);
    }
    return 0;
  });
  const [gated, setGated] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [chatDragOver, setChatDragOver] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [fileDoc, setFileDoc] = useState(null);
  const [sopOutput, setSopOutput] = useState("");
  const [sopGenerating, setSopGenerating] = useState(false);
  const [sopCopied, setSopCopied] = useState(false);
  const [complianceAlerts, setComplianceAlerts] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageData, setImageData] = useState(null); // base64 for vision/scan

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rhonda_demo_msgs", String(totalMessages));
    }
  }, [totalMessages]);

  // Fetch compliance alerts on mount
  useEffect(() => {
    fetch(`/api/compliance/alerts?client_key=${clientKey}`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to load alerts");
        return r.json();
      })
      .then(data => setComplianceAlerts(data))
      .catch(() => setComplianceAlerts({ alerts: [], error: true }));
  }, [clientKey]);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const startStepTimer = (taskId, setter) => {
    const steps = STEP_SEQUENCES[taskId] || STEP_SEQUENCES.rhonda;
    const timeouts = [];
    steps.forEach(({ label, delay }) => {
      timeouts.push(setTimeout(() => setter(label), delay));
    });
    return () => timeouts.forEach(clearTimeout);
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
    await downloadXLSX(rows, "rhonda-data.xlsx", tableData);
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

  // ── SOP Generation from Teach RHONDA interview ──
  const generateSOP = async () => {
    if (messages.length < 4) return;
    setSopGenerating(true); setSopOutput("");
    const cleanupSopSteps = startStepTimer("sop", setSopStep);
    const transcript = messages
      .map(m => `${m.role === "user" ? "Worker" : "RHONDA"}: ${m.content}`)
      .join("\n\n");
    try {
      const res = await fetch("/api/sop-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          companyName,
          department: "",
          fromInterview: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `API error: ${res.status}`);
      setSopOutput(data.content?.[0]?.text || "No output generated.");
    } catch (err) {
      setError(`SOP generation failed: ${err.message}`);
      setSopOutput("");
      cleanupSopSteps();
      setSopStep("");
      setSopGenerating(false);
      return;
    }
    cleanupSopSteps();
    setSopStep("Done ✓");
    setTimeout(() => { setSopStep(""); setSopGenerating(false); }, 400);
  };

  const copySOP = () => {
    navigator.clipboard.writeText(sopOutput);
    setSopCopied(true);
    setTimeout(() => setSopCopied(false), 2000);
  };

  const downloadSOP = () => {
    const title = sopOutput.match(/^# SOP: (.+)$/m)?.[1] || "procedure";
    const filename = `SOP_${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    const blob = new Blob([sopOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDrop = async (taskId, files) => {
    if (!files || !files.length) return;
    const file = files[0];
    setActiveTask(taskId); setMessages([]); setError(""); setFileDoc(null); setImageData(null); setParsing(true);
    try {
      // Handle image files — convert to base64 for vision
      if (isImageFile(file)) {
        const b64 = await imageToBase64(file);
        if (b64) {
          setImageData(b64);
          setInput(`Digitize this photo: "${file.name}"`);
          setParsing(false);
          // Auto-switch to photo/scan task if not already there
          if (taskId !== "photo") setActiveTask("photo");
          return;
        }
      }
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
    // Handle image files in chat
    if (isImageFile(file)) {
      const b64 = await imageToBase64(file);
      if (b64) {
        setImageData(b64);
        setInput(`Digitize this photo: "${file.name}"`);
        return;
      }
    }
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
    const cleanupSteps = startStepTimer(activeTask, setAgentStep);
    const task = TASKS.find(t => t.id === activeTask);
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(""); setTotalMessages(prev => prev + 1);

    const docForApi = fileDoc;
    if (fileDoc) setFileDoc(null);
    const imgForApi = imageData;
    if (imageData) setImageData(null);
    const userContent = imgForApi
      ? [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imgForApi } },
          { type: "text", text: input },
        ]
      : (activeTask === "docs" && docForApi)
      ? [
          { type: "document", source: { type: "text", data: docForApi.content }, title: docForApi.name, citations: { enabled: true } },
          { type: "text", text: input },
        ]
      : input;

    const sheetsTools = activeTask === "data" ? {
      tools: [{
        name: "format_as_table",
        description: "Format the organized data as a structured table with headers, rows, and optional Excel formulas for calculated cells",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Brief explanation of what was organized" },
            headers: { type: "array", items: { type: "string" } },
            rows: { type: "array", items: { type: "array", items: { type: "string" } } },
            formulas: {
              type: "array",
              description: "Excel formulas for calculated cells. Each entry: row (0-indexed data row, not header), col (0-indexed), formula (e.g. '=SUM(B2:B5)'). Row 1 in Excel is the header; data starts at row 2.",
              items: {
                type: "object",
                properties: {
                  row: { type: "integer", description: "0-indexed data row (0 = first data row, not header)" },
                  col: { type: "integer", description: "0-indexed column" },
                  formula: { type: "string", description: "Excel formula like =SUM(B2:B10) or =C2*D2" },
                },
                required: ["row", "col", "formula"],
              },
            },
            cellTypes: {
              type: "array",
              description: "For financial models: annotate cells as 'input' (blue, user-changeable), 'assumption' (yellow, key assumptions), or 'formula' (calculated). Same row/col indexing as formulas.",
              items: {
                type: "object",
                properties: {
                  row: { type: "integer" },
                  col: { type: "integer" },
                  type: { type: "string", enum: ["input", "assumption", "formula"] },
                },
                required: ["row", "col", "type"],
              },
            },
            isFinancialModel: {
              type: "boolean",
              description: "Set true for financial models (projections, budgets, P&Ls) to enable professional financial formatting with color-coded inputs vs formulas.",
            },
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

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: (isTeach || imgForApi) ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
          max_tokens: isTeach ? 400 : 700,
          system: systemPrompt,
          messages: isTeach ? [...messages.slice(-8).map(m => ({ role: m.role, content: m.content })), { role: "user", content: input }] : apiMessages,
          ...sheetsTools,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      let data;
      try { data = await res.json(); } catch { throw new Error("Invalid response from server"); }
      if (data.error) { setError(data.error.message || "API error"); }
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
    } catch (err) {
      if (err.name === "AbortError") setError("Request timed out. Please try again.");
      else setError(err.message || "Could not connect to RHONDA. Check your connection.");
    }
    cleanupSteps();
    setAgentStep("Done ✓");
    setTimeout(() => { setAgentStep(""); setLoading(false); }, 400);
  };

  const task = TASKS.find(t => t.id === activeTask);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Outfit', sans-serif", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet" />

      {/* ══════ DEMO BANNER ══════ */}
      {config.demo?.gatedCTA !== false && (
        <div style={{ background: `linear-gradient(135deg, ${T.chrome}, ${T.chromeDark})`, padding: "10px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, borderBottom: `1px solid ${T.brand}33` }}>
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

        {/* ══════ MOBILE SIDEBAR BACKDROP ══════ */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 98, display: "none" }} className="sidebar-backdrop" />
        )}

        {/* ══════ SIDEBAR ══════ */}
        <div className="rhonda-sidebar" style={{ width: 240, background: T.chrome, borderRight: `1px solid ${T.chromeBorder}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
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
          <div style={{ height: 1, background: T.chromeBorder, margin: "0 14px" }} />
          <div style={{ padding: "12px 8px", flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7e6a", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 10px", marginBottom: 4 }}>Tools</div>
            {TASKS.map(t => {
              const isActive = activeTask === t.id;
              return (
                <div key={t.id} onClick={() => { setActiveTask(t.id); setMessages([]); setInput(""); setError(""); setFileDoc(null); setSopOutput(""); setSopGenerating(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: isActive ? T.goldBg15 : "transparent", color: isActive ? T.gold : "#8a9b7a", transition: "all 0.2s", marginBottom: 1, position: "relative" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 2, background: T.gold }} />}
                  <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.icon}</div>
                  <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400 }}>{t.id === "rhonda" ? <span>Ask <span style={{ color: T.chrome, fontWeight: 700 }}>RHONDA</span></span> : t.label}</span>
                </div>
              );
            })}
            <div style={{ height: 1, background: T.chromeBorder, margin: "10px 6px" }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: T.brand, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 10px", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚡</span> Power Tools
            </div>
            {POWER_TOOLS.map(cat => (
              <div key={cat.category}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#5a6a55", padding: "5px 10px 2px", letterSpacing: "0.06em" }}>{cat.emoji} {cat.category}</div>
                {cat.items.map(item => (
                  <a key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 18px", borderRadius: 8, cursor: "pointer", color: "#8a9b7a", textDecoration: "none", fontSize: 11.5, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = T.gold; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8a9b7a"; }}
                  >{item.label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.chromeBorder}` }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, color: T.textMuted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ fontSize: 13, color: T.textMuted }}>
              {task ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span onClick={() => { setActiveTask(null); setMessages([]); setFileDoc(null); }} style={{ cursor: "pointer" }}>Dashboard</span>
                  <span style={{ color: T.textDim }}>→</span>
                  <span style={{ color: T.gold, fontWeight: 600 }}>{task.label}</span>
                </span>
              ) : "Dashboard"}
            </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: T.textDim, cursor: "pointer" }}>{Icons.search}</div>
              <div onClick={() => { setActiveTask("compliance"); setMessages([]); setInput(""); setError(""); }} style={{ color: T.textDim, cursor: "pointer", position: "relative" }}>
                {Icons.bell}
                {complianceAlerts?.summary?.total > 0 && (
                  <div style={{ position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: T.red, border: `2px solid #ffffff`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", padding: "0 3px" }}>
                    {complianceAlerts.summary.total}
                  </div>
                )}
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
                    const premiumColor = isTeachTile ? T.brand : isRhondaTile ? T.chrome : null;
                    const premiumBg = isTeachTile
                      ? `linear-gradient(135deg, ${T.brandBg08} 0%, ${T.brandBg15} 100%)`
                      : isRhondaTile
                      ? `linear-gradient(135deg, ${T.chromeBg08} 0%, ${T.chromeBg15} 100%)`
                      : null;
                    const premiumBorder = isTeachTile ? T.brandBorder : isRhondaTile ? T.chromeBorder30 : null;
                    const premiumGlow = isTeachTile
                      ? T.brandGlow12
                      : isRhondaTile
                      ? T.chromeGlow12
                      : "none";
                    const premiumHoverGlow = isTeachTile
                      ? T.brandGlow25
                      : isRhondaTile
                      ? T.chromeGlow25
                      : "0 8px 24px rgba(0,0,0,0.2)";
                    return (
                      <div key={t.id}
                        onClick={() => { setActiveTask(t.id); setMessages([]); setInput(""); setError(""); setFileDoc(null); setSopOutput(""); setSopGenerating(false); }}
                        onDragOver={e => { e.preventDefault(); setDragOver(t.id); }}
                        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                        onDrop={e => { e.preventDefault(); setDragOver(null); handleFileDrop(t.id, e.dataTransfer.files); }}
                        style={{ background: isDrop ? T.goldDim : isPremium ? premiumBg : T.surface, border: `${isDrop || isPremium ? 2 : 1}px solid ${isDrop ? T.gold : isPremium ? premiumBorder : T.border}`, borderRadius: isPremium ? 14 : 12, padding: isDrop ? "21px 19px" : isPremium ? "21px 19px" : "22px 20px", cursor: "pointer", transition: "all 0.25s ease", animation: `fadeIn 0.4s ease ${i * 0.05}s both`, transform: isDrop ? "translateY(-3px) scale(1.01)" : "translateY(0)", boxShadow: isDrop ? `0 12px 32px rgba(196,155,42,0.2)` : premiumGlow, position: "relative", overflow: "hidden" }}
                        onMouseEnter={e => { if (!isDrop) { e.currentTarget.style.borderColor = isPremium ? (premiumColor || T.borderLight) : T.borderLight; e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = premiumHoverGlow; } }}
                        onMouseLeave={e => { if (!isDrop) { e.currentTarget.style.borderColor = isPremium ? premiumBorder : T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isPremium ? premiumGlow : "none"; } }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: isDrop ? T.brandDim : isPremium ? (isTeachTile ? T.brandBg15 : T.chromeBg15) : T.surfaceHover, border: `1px solid ${isDrop ? T.brandBorder : isPremium ? premiumBorder : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: isDrop ? T.brand : t.color, marginBottom: 14, transition: "all 0.2s" }}>
                          {isDrop ? Icons.upload : t.icon}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.beige, marginBottom: 5 }}>
                          {isTeachTile ? <span>Teach <span style={{ color: T.brand }}>RHONDA</span></span> : isRhondaTile ? <span>Ask <span style={{ color: T.chrome }}>RHONDA</span></span> : t.label}
                        </div>
                        <div style={{ fontSize: 12, color: isPremium ? T.text : T.textMuted, lineHeight: 1.5 }}>{t.description}</div>
                        <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: isPremium ? premiumColor : T.gold }}>{isDrop ? "Drop to upload →" : "Open →"}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Compliance Alert Banner */}
                {complianceAlerts?.summary?.total > 0 && (
                  <div onClick={() => { setActiveTask("compliance"); setMessages([]); setInput(""); setError(""); }}
                    style={{ background: complianceAlerts.summary.critical > 0 ? T.redDim : T.goldDim, border: `1px solid ${complianceAlerts.summary.critical > 0 ? "rgba(197,48,48,0.2)" : T.goldBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: complianceAlerts.summary.critical > 0 ? T.red : T.gold, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                        {complianceAlerts.summary.total}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.beige }}>Compliance Alerts</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>
                          {complianceAlerts.summary.critical > 0 && <span style={{ color: T.red, fontWeight: 600 }}>{complianceAlerts.summary.critical} critical</span>}
                          {complianceAlerts.summary.critical > 0 && complianceAlerts.summary.warning > 0 && " · "}
                          {complianceAlerts.summary.warning > 0 && `${complianceAlerts.summary.warning} warnings`}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.gold }}>View →</span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                  {[
                    { label: "Alerts", value: complianceAlerts?.summary?.total ?? "—", color: complianceAlerts?.summary?.critical > 0 ? T.red : T.gold },
                    { label: "Certs Expiring", value: complianceAlerts?.summary?.byType?.cert_expiring ?? "—", color: T.gold },
                    { label: "Overdue", value: (complianceAlerts?.summary?.byType?.cert_expired ?? 0) + (complianceAlerts?.summary?.byType?.inspection_overdue ?? 0) || "—", color: T.red },
                    { label: "Training Gaps", value: complianceAlerts?.summary?.byType?.training_incomplete ?? "—", color: T.green },
                  ].map((s, i) => (
                    <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* ══════ POWER TOOLS (desktop only — mobile uses hamburger sidebar) ══════ */}
                <div className="power-tools-grid" style={{ marginTop: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>⚡</span>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: T.beige, margin: 0 }}>Power Tools</h2>
                  </div>
                  <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px" }}>The tools that make you the one everyone calls.</p>
                  {POWER_TOOLS.map((cat, ci) => (
                    <div key={cat.category} style={{ marginBottom: 20, animation: `fadeIn 0.4s ease ${0.1 + ci * 0.08}s both` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{cat.emoji}</span> {cat.category}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                        {cat.items.map((item, ii) => (
                          <a key={item.href} href={item.href}
                            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", textDecoration: "none", cursor: "pointer", transition: "all 0.25s ease", animation: `fadeIn 0.3s ease ${0.15 + ci * 0.08 + ii * 0.04}s both` }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = T.goldGlow12; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.beige, marginBottom: 3 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{item.desc}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ TASK / CHAT VIEW ══════ */}
            {activeTask && task && (
              <div style={{ maxWidth: 780, margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: task.id === "teach" ? T.brandBg15 : task.id === "rhonda" ? T.chromeBg15 : T.surfaceHover, border: `1px solid ${task.id === "teach" ? T.brandBorder : task.id === "rhonda" ? T.chromeBorder30 : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: task.color }}>{task.icon}</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.beige }}>{task.id === "teach" ? <span>Teach <span style={{ color: T.brand }}>RHONDA</span></span> : task.id === "rhonda" ? <span>Ask <span style={{ color: T.chrome }}>RHONDA</span></span> : task.label}</h2>
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
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: task.id === "teach" ? T.brandBg15 : task.id === "rhonda" ? T.chromeBg15 : T.brandDim, border: `1px solid ${task.id === "teach" ? T.brandBorder : task.id === "rhonda" ? T.chromeBorder30 : T.brandBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: task.id === "teach" ? T.brand : task.id === "rhonda" ? T.chrome : T.brand, margin: "0 auto 16px" }}>{chatDragOver ? Icons.upload : task.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: T.textMuted, marginBottom: 6 }}>
                          {chatDragOver ? <span style={{ color: T.brand, fontWeight: 700 }}>Drop your file here</span> : task.id === "teach" ? <span>Teach <span style={{ color: T.brand, fontWeight: 700 }}>RHONDA</span> your job</span> : task.id === "rhonda" ? <span>Ask <span style={{ color: T.chrome, fontWeight: 700 }}>RHONDA</span> anything</span> : <span>Ask <span style={{ color: T.brand, fontWeight: 700 }}>RHONDA</span> about {task.label.toLowerCase()}</span>}
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

                    {loading && agentStep && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.brand}, #B8912E)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1A14" strokeWidth="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
                        </div>
                        <div key={agentStep} style={{ padding: "10px 16px", borderRadius: 14, background: T.surfaceHover, fontSize: 13, color: T.textMuted, fontWeight: 500, animation: "stepFadeIn 0.3s ease" }}>
                          {agentStep}
                        </div>
                      </div>
                    )}
                    {loading && !agentStep && (
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

                    {/* ── Generate SOP button (Teach mode, 4+ messages) ── */}
                    {activeTask === "teach" && messages.filter(m => m.role === "user").length >= 2 && !sopOutput && !sopGenerating && (
                      <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                        <button onClick={generateSOP}
                          style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${T.brandBorder}`, background: T.brandBg15, color: T.brand, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.brandBg15; e.currentTarget.style.boxShadow = T.brandGlow12; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          Generate SOP from this interview
                        </button>
                        <div style={{ fontSize: 11, color: T.textDim, marginTop: 6 }}>Creates a formatted Standard Operating Procedure from the conversation above</div>
                      </div>
                    )}

                    {/* ── SOP generating spinner ── */}
                    {sopGenerating && sopStep && (
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.brand}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                        <div key={sopStep} style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, animation: "stepFadeIn 0.3s ease" }}>{sopStep}</div>
                        <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>This takes about 10-15 seconds</div>
                      </div>
                    )}

                    {/* ── SOP Output ── */}
                    {sopOutput && (
                      <div style={{ margin: "16px 0 8px", padding: 20, background: T.bgAlt, borderRadius: 12, border: `1px solid ${T.brandBorder}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.brand, letterSpacing: "0.1em", textTransform: "uppercase" }}>Generated SOP</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={copySOP}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: sopCopied ? T.greenDim : T.surface, color: sopCopied ? T.green : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              {sopCopied ? Icons.check : Icons.copy}
                              {sopCopied ? "Copied!" : "Copy"}
                            </button>
                            <button onClick={downloadSOP}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.brandBorder}`, background: T.brandBg15, color: T.brand, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              {Icons.download}
                              Download .md
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap", fontFamily: "'Outfit', sans-serif" }}>{sopOutput}</div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 18px", background: T.bgAlt }}>
                    {imageData && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 10px", background: T.goldDim, borderRadius: 8, fontSize: 12, color: T.gold }}>
                        {Icons.camera} <span>Photo ready to scan</span>
                        <button onClick={() => setImageData(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.textDim, fontSize: 14 }}>✕</button>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                      <label style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: imageData ? T.gold : T.textDim, flexShrink: 0, transition: "all 0.2s" }}>
                        {Icons.camera}
                        <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const b64 = await imageToBase64(file);
                          if (b64) {
                            setImageData(b64);
                            if (!input.trim()) setInput(`Digitize this photo: "${file.name}"`);
                            if (activeTask !== "photo") setActiveTask("photo");
                          }
                          e.target.value = "";
                        }} />
                      </label>
                      <textarea value={input} onChange={e => setInput(e.target.value)}
                        placeholder={messages.length === 0 ? task.placeholder.split("\n")[0] : "Type your follow-up, or drag a file here..."}
                        rows={2}
                        style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "'Outfit', sans-serif", color: T.text, resize: "none", outline: "none", lineHeight: 1.5 }}
                        onFocus={e => e.target.style.borderColor = T.borderLight}
                        onBlur={e => e.target.style.borderColor = T.border}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                      />
                      <button onClick={handleSubmit} disabled={loading || parsing || (!input.trim() && !imageData)}
                        style={{ background: loading || parsing || (!input.trim() && !imageData) ? T.surface : `linear-gradient(135deg, ${T.gold}, #B8912E)`, border: "none", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: loading || parsing || (!input.trim() && !imageData) ? "default" : "pointer", color: loading || parsing || (!input.trim() && !imageData) ? T.textDim : T.bg, flexShrink: 0 }}>{Icons.send}</button>
                    </div>
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
        @keyframes stepFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea::placeholder { color: ${T.textDim}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        @media (max-width: 768px) {
          .rhonda-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            z-index: 99 !important;
            transform: translateX(${sidebarOpen ? "0" : "-100%"}) !important;
            transition: transform 0.25s ease !important;
            box-shadow: ${sidebarOpen ? "4px 0 24px rgba(0,0,0,0.3)" : "none"} !important;
            overflow-y: auto !important;
          }
          .sidebar-backdrop {
            display: block !important;
          }
          .sidebar-toggle {
            display: block !important;
          }
          .power-tools-grid {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
