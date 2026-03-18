"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b", blue: "#2980b9",
};

// ── Demo data matching seed.sql ──────────────────────────────────────────────

const WORKERS = {
  w1: { id: "w1", name: "Jim Rivera", initials: "JR", color: "#8E6B3E", role: "Senior Operator", dept: "Production", exp: 22 },
  w2: { id: "w2", name: "Mary Chen", initials: "MC", color: "#4a6540", role: "QA Lead", dept: "Quality", exp: 18 },
  w3: { id: "w3", name: "Carlos Vega", initials: "CV", color: "#6495ED", role: "Maintenance Lead", dept: "Maintenance", exp: 15 },
  w4: { id: "w4", name: "Diane Atkins", initials: "DA", color: "#8E44AD", role: "Safety Coordinator", dept: "Safety", exp: 20 },
  w5: { id: "w5", name: "Maria Santos", initials: "MS", color: "#E67E22", role: "Packaging Operator", dept: "Packaging", exp: 0 },
  w6: { id: "w6", name: "Mike Torres", initials: "MT", color: "#2c3528", role: "Shift Supervisor", dept: "Production", exp: 11 },
  w7: { id: "w7", name: "Angela Park", initials: "AP", color: "#c49b2a", role: "Night Shift Supervisor", dept: "Production", exp: 9 },
  w10: { id: "w10", name: "Roberto Mendez", initials: "RM", color: "#E74C3C", role: "Forklift Operator", dept: "Warehouse", exp: 4 },
  w12: { id: "w12", name: "David Kim", initials: "DK", color: "#1ABC9C", role: "Line Operator", dept: "Production", exp: 3 },
};

const BOUNTIES = [
  {
    id: "b1", title: "Document Allergen Changeover Procedure", dept: "Production", amount: 75, complexity: "complex",
    description: "We need a complete SOP for switching production lines between allergen-containing and allergen-free recipes.",
    criteria: "Must include cleaning verification steps, testing protocol, and documentation requirements",
    postedBy: "w6", expiresIn: 14, status: "open",
  },
  {
    id: "b2", title: "Forklift Pre-Shift Inspection Checklist", dept: "Warehouse", amount: 25, complexity: "simple",
    description: "Standard daily inspection procedure for all forklifts.",
    criteria: "Cover all OSHA-required checkpoints. Include photo examples of pass/fail conditions.",
    postedBy: "w6", expiresIn: 11, status: "claimed", claimedBy: "w10", claimDeadline: "36 hrs",
  },
  {
    id: "b3", title: "Packaging Line Startup Sequence", dept: "Packaging", amount: 50, complexity: "standard",
    description: "Step-by-step startup for the packaging line including sealer warmup and film loading.",
    criteria: "Must cover sealer temperature verification and film tension check",
    postedBy: "w6", expiresIn: 19, status: "open",
  },
  {
    id: "b4", title: "Chemical Spill Response", dept: "Safety", amount: 100, complexity: "complex",
    description: "Emergency procedure for chemical spills in production and storage areas.",
    criteria: "Must reference specific chemicals used on-site. Include PPE requirements and notification chain.",
    postedBy: "w4", expiresIn: 24, status: "open",
  },
  {
    id: "b5", title: "Kibble Quality Visual Inspection Guide", dept: "Quality", amount: 50, complexity: "standard",
    description: "How to visually inspect kibble for defects — color, size, smell, texture.",
    criteria: "Include photo examples of good vs defective product. Cover all product lines.",
    postedBy: "w2", expiresIn: 13, status: "submitted", claimedBy: "w2",
    reviews: [
      { type: "ai_prescreen", score: 82, feedback: "Good coverage of visual indicators. Could add more detail on smell-based detection.", passed: true },
    ],
  },
  {
    id: "b6", title: "Extruder Die Changeover", dept: "Production", amount: 75, complexity: "complex",
    description: "Procedure for swapping dies on the kibble extruder including pressure calibration.",
    criteria: "Must include die pressure settings for new vs worn dies (Jim Rivera knowledge).",
    postedBy: "w6", expiresIn: -1, status: "approved", claimedBy: "w1",
    reviews: [
      { type: "ai_prescreen", score: 91, feedback: "Excellent detail on pressure calibration. Includes veteran knowledge about die wear.", passed: true },
      { type: "peer_review", score: 88, feedback: "Accurate and thorough. Confirmed die pressure tip is correct. — Carlos Vega", passed: true, reviewer: "w3" },
      { type: "supervisor_approval", score: 95, feedback: "Approved. This captures exactly what we needed. Adding to official SOP library.", passed: true, reviewer: "w6" },
    ],
    paidAmount: 75, paidTo: "w1",
  },
  {
    id: "b7", title: "New Employee Safety Orientation Walkthrough", dept: "Safety", amount: 50, complexity: "standard",
    description: "Guided walkthrough of all safety stations, exits, and emergency equipment.",
    criteria: "Must cover all 3 buildings. Include photos of each safety station.",
    postedBy: "w4", expiresIn: 29, status: "open",
  },
  {
    id: "b8", title: "Batch Record Documentation", dept: "Quality", amount: 50, complexity: "standard",
    description: "How to properly fill out batch production records for FDA compliance.",
    criteria: "Must reference current batch record form. Include common mistakes to avoid.",
    postedBy: "w2", expiresIn: 19, status: "open",
  },
];

const KNOWLEDGE_GAPS = [
  { topic: "Night Shift Emergency Procedures", reason: "Single-expert risk — only Angela Park knows the full procedure", priority: "critical", amount: 100, hasBounty: false },
  { topic: "Ingredient Receiving Inspection", reason: "Training time is 3x industry average for new QC staff", priority: "high", amount: 50, hasBounty: false },
  { topic: "Waste Manifest Documentation", reason: "Environmental compliance gap — last audit flagged this", priority: "medium", amount: 50, hasBounty: false },
  { topic: "Conveyor Belt Replacement", reason: "Only Carlos knows the full procedure — single-expert risk", priority: "critical", amount: 75, hasBounty: false },
];

const RECOGNITION_FEED = [
  { type: "usage", icon: "📋", text: "Jim Rivera's Extruder Startup SOP was used 23 times this month", time: "2 hours ago" },
  { type: "payout", icon: "💰", text: "Jim Rivera earned $75 for documenting Extruder Die Changeover", time: "Yesterday" },
  { type: "review", icon: "✅", text: "Carlos Vega completed peer review on Die Changeover — earned $10 review bonus", time: "Yesterday" },
  { type: "milestone", icon: "🏆", text: "Production Line A hit 80% documentation coverage — milestone bonus unlocked!", time: "2 days ago" },
  { type: "claim", icon: "🎯", text: "Roberto Mendez claimed Forklift Inspection bounty — 36 hours to submit", time: "3 days ago" },
  { type: "submit", icon: "📝", text: "Mary Chen submitted Kibble Quality Inspection Guide for review", time: "4 days ago" },
  { type: "level", icon: "⭐", text: "Jim Rivera reached Knowledge Expert level — 10+ bounties completed!", time: "1 week ago" },
];

// Coverage map data — documentation status by area
const COVERAGE_MAP = [
  { area: "Extruder Operations", documented: 6, total: 8, color: C.green },
  { area: "Packaging Line", documented: 3, total: 6, color: "#b87a00" },
  { area: "Quality Control", documented: 5, total: 7, color: C.green },
  { area: "Safety Procedures", documented: 4, total: 9, color: C.danger },
  { area: "Warehouse Ops", documented: 2, total: 5, color: C.danger },
  { area: "Maintenance", documented: 3, total: 5, color: "#b87a00" },
];

const COMPLEXITY_BADGE = {
  simple: { bg: "rgba(74,101,64,0.1)", color: C.green, label: "Simple" },
  standard: { bg: "rgba(184,122,0,0.1)", color: "#b87a00", label: "Standard" },
  complex: { bg: "rgba(196,155,42,0.15)", color: C.gold, label: "Complex" },
};

const STATUS_BADGE = {
  open: { bg: "rgba(74,101,64,0.08)", color: C.green, label: "Open" },
  claimed: { bg: "rgba(41,128,185,0.08)", color: C.blue, label: "Claimed" },
  submitted: { bg: "rgba(184,122,0,0.08)", color: "#b87a00", label: "In Review" },
  approved: { bg: "rgba(196,155,42,0.12)", color: C.gold, label: "Approved ✓" },
};

const PRIORITY_COLORS = {
  critical: C.danger,
  high: "#b87a00",
  medium: C.textMuted,
  low: C.border,
};

// ── Components ───────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ReviewPipeline({ reviews = [] }) {
  const stages = ["ai_prescreen", "peer_review", "supervisor_approval"];
  const stageLabels = { ai_prescreen: "AI Pre-Screen", peer_review: "Peer Review", supervisor_approval: "Supervisor" };
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 10 }}>
      {stages.map((stage, i) => {
        const review = reviews.find(r => r.type === stage);
        const done = review?.passed;
        const failed = review && !review.passed;
        const bg = done ? C.green : failed ? C.danger : C.borderLight;
        const color = done || failed ? "#fff" : C.textMuted;
        return (
          <div key={stage} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: bg, color, textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              {done ? "✓ " : ""}{stageLabels[stage]}
              {review && <span style={{ fontWeight: 400, marginLeft: 4 }}>{review.score}/100</span>}
            </div>
            {i < stages.length - 1 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={done ? C.green : C.border} strokeWidth="2">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CoverageBar({ area, documented, total, color }) {
  const pct = Math.round((documented / total) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{area}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}% <span style={{ fontWeight: 400, color: C.textMuted }}>({documented}/{total})</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.borderLight, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BountyBoardPage() {
  const [view, setView] = useState("board"); // board | coverage | gaps | feed
  const [filter, setFilter] = useState("all"); // all | open | claimed | submitted | approved
  const [deptFilter, setDeptFilter] = useState("all");
  const [expandedBounty, setExpandedBounty] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [claimed, setClaimed] = useState({});

  const departments = [...new Set(BOUNTIES.map(b => b.dept))];

  const filteredBounties = BOUNTIES.filter(b => {
    if (filter !== "all" && b.status !== filter) return false;
    if (deptFilter !== "all" && b.dept !== deptFilter) return false;
    return true;
  });

  const totalPool = BOUNTIES.filter(b => b.status === "open").reduce((s, b) => s + b.amount, 0);
  const totalPaid = BOUNTIES.filter(b => b.status === "approved").reduce((s, b) => s + (b.paidAmount || 0), 0);
  const openCount = BOUNTIES.filter(b => b.status === "open").length;
  const claimedCount = BOUNTIES.filter(b => b.status === "claimed").length;
  const overallCoverage = Math.round(COVERAGE_MAP.reduce((s, c) => s + c.documented, 0) / COVERAGE_MAP.reduce((s, c) => s + c.total, 0) * 100);

  const handleClaim = (bountyId) => {
    setClaimingId(bountyId);
    setTimeout(() => {
      setClaimed(prev => ({ ...prev, [bountyId]: true }));
      setClaimingId(null);
    }, 1500);
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
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Knowledge Bounty Board</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>

        {/* Title + stats */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Knowledge Bounty Board</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Get paid to document what you know. Every procedure captured makes the whole team stronger.</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Bounty Pool", value: `$${totalPool}`, color: C.gold },
            { label: "Open", value: openCount, color: C.green },
            { label: "In Progress", value: claimedCount, color: C.blue },
            { label: "Total Paid", value: `$${totalPaid}`, color: C.forest },
            { label: "Coverage", value: `${overallCoverage}%`, color: overallCoverage >= 70 ? C.green : "#b87a00" },
          ].map((card, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* View tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.borderLight}` }}>
          {[
            { id: "board", label: "🎯 Bounties", count: BOUNTIES.length },
            { id: "coverage", label: "📊 Coverage Map" },
            { id: "gaps", label: "🔴 Knowledge Gaps", count: KNOWLEDGE_GAPS.length },
            { id: "feed", label: "🏆 Recognition" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: view === tab.id ? C.gold : "transparent",
                color: view === tab.id ? "#fff" : C.textMuted,
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}>
              {tab.label}{tab.count != null && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* ═══ BOUNTIES VIEW ═══ */}
        {view === "board" && (
          <>
            {/* Filter row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["all", "open", "claimed", "submitted", "approved"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid ${filter === f ? C.gold : C.borderLight}`,
                      background: filter === f ? C.goldLight : C.surface,
                      color: filter === f ? C.gold : C.textMuted,
                      fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
                    }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                {["all", ...departments].map(d => (
                  <button key={d} onClick={() => setDeptFilter(d)}
                    style={{
                      padding: "6px 12px", borderRadius: 8, border: `1px solid ${deptFilter === d ? C.forest : C.borderLight}`,
                      background: deptFilter === d ? "rgba(44,53,40,0.06)" : C.surface,
                      color: deptFilter === d ? C.forest : C.textMuted,
                      fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Bounty cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredBounties.map(bounty => {
                const isExpanded = expandedBounty === bounty.id;
                const poster = WORKERS[bounty.postedBy];
                const claimer = bounty.claimedBy ? WORKERS[bounty.claimedBy] : null;
                const comp = COMPLEXITY_BADGE[bounty.complexity];
                const stat = STATUS_BADGE[bounty.status];
                const isClaimed = claimed[bounty.id];

                return (
                  <div key={bounty.id} style={{
                    background: C.surface, borderRadius: 14,
                    border: `1px solid ${isExpanded ? C.gold : C.borderLight}`,
                    overflow: "hidden", transition: "border-color 0.2s",
                  }}>
                    {/* Card header */}
                    <div onClick={() => setExpandedBounty(isExpanded ? null : bounty.id)}
                      style={{ padding: "16px 20px", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        {/* Amount badge */}
                        <div style={{
                          minWidth: 56, padding: "8px 4px", borderRadius: 10,
                          background: bounty.status === "approved" ? "rgba(74,101,64,0.08)" : C.goldLight,
                          textAlign: "center", flexShrink: 0,
                        }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: bounty.status === "approved" ? C.green : C.gold }}>${bounty.amount}</div>
                          <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>bounty</div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: C.forest }}>{bounty.title}</span>
                            <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, background: comp.bg, color: comp.color, textTransform: "uppercase" }}>
                              {comp.label}
                            </span>
                            <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, background: stat.bg, color: stat.color, textTransform: "uppercase" }}>
                              {stat.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                            {bounty.dept} • Posted by {poster?.name || "Manager"}
                            {bounty.expiresIn > 0 && <span> • {bounty.expiresIn} days left</span>}
                            {claimer && <span> • Claimed by {claimer.name}</span>}
                          </div>

                          {/* Review pipeline for submitted/approved */}
                          {bounty.reviews && <ReviewPipeline reviews={bounty.reviews} />}
                        </div>

                        {/* Expand arrow */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginTop: 4, flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.borderLight}` }}>
                        <div style={{ paddingTop: 16 }}>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 14 }}>{bounty.description}</div>

                          <div style={{
                            padding: "12px 14px", borderRadius: 10, background: "rgba(196,155,42,0.06)",
                            border: `1px solid ${C.goldLight}`, marginBottom: 14,
                          }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Acceptance Criteria</div>
                            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{bounty.criteria}</div>
                          </div>

                          {/* Review feedback */}
                          {bounty.reviews && bounty.reviews.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Review Feedback</div>
                              {bounty.reviews.map((review, ri) => {
                                const typeLabels = { ai_prescreen: "AI Pre-Screen", peer_review: "Peer Review", supervisor_approval: "Supervisor" };
                                const reviewer = review.reviewer ? WORKERS[review.reviewer] : null;
                                return (
                                  <div key={ri} style={{
                                    padding: "10px 14px", borderRadius: 8, marginBottom: 6,
                                    background: review.passed ? "rgba(74,101,64,0.04)" : "rgba(192,57,43,0.04)",
                                    border: `1px solid ${review.passed ? "rgba(74,101,64,0.1)" : "rgba(192,57,43,0.1)"}`,
                                  }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {reviewer && <Avatar initials={reviewer.initials} color={reviewer.color} size={20} />}
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.forest }}>{typeLabels[review.type]}</span>
                                      </div>
                                      <span style={{ fontSize: 13, fontWeight: 800, color: review.passed ? C.green : C.danger }}>{review.score}/100</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{review.feedback}</div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Payout info */}
                          {bounty.paidAmount && (
                            <div style={{
                              padding: "12px 14px", borderRadius: 10, background: "rgba(74,101,64,0.06)",
                              border: `1px solid rgba(74,101,64,0.15)`, marginBottom: 14,
                              display: "flex", alignItems: "center", gap: 10,
                            }}>
                              <span style={{ fontSize: 20 }}>💰</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>${bounty.paidAmount} paid to {WORKERS[bounty.paidTo]?.name}</div>
                                <div style={{ fontSize: 11, color: C.textMuted }}>SOP added to official library • $10 peer review bonus paid to Carlos Vega</div>
                              </div>
                            </div>
                          )}

                          {/* Claim button */}
                          {bounty.status === "open" && !isClaimed && (
                            <button onClick={(e) => { e.stopPropagation(); handleClaim(bounty.id); }}
                              disabled={claimingId === bounty.id}
                              style={{
                                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                                background: claimingId === bounty.id ? C.border : `linear-gradient(135deg, ${C.gold} 0%, #d4a843 100%)`,
                                color: claimingId === bounty.id ? C.textMuted : "#fff",
                                fontSize: 16, fontWeight: 700, cursor: claimingId === bounty.id ? "default" : "pointer",
                                fontFamily: "inherit", boxShadow: claimingId !== bounty.id ? `0 4px 16px ${C.goldGlow}` : "none",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.3s ease",
                              }}>
                              {claimingId === bounty.id ? (
                                <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Claiming...</>
                              ) : (
                                <>🎯 Claim This Bounty — 48 Hour Window</>
                              )}
                            </button>
                          )}
                          {isClaimed && (
                            <div style={{
                              width: "100%", padding: "14px", borderRadius: 12, textAlign: "center",
                              background: "rgba(74,101,64,0.08)", color: C.green, fontSize: 15, fontWeight: 700,
                            }}>
                              ✓ Bounty Claimed — 48 hours to submit your SOP via RHONDA Teach Mode
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredBounties.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontSize: 14 }}>
                  No bounties match the selected filters.
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ COVERAGE MAP VIEW ═══ */}
        {view === "coverage" && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: 0 }}>Documentation Coverage Map</h2>
                <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>Manager view — see where knowledge gaps exist across the facility</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: overallCoverage >= 70 ? C.green : "#b87a00" }}>{overallCoverage}%</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>Overall</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
              {[
                { color: C.green, label: "≥75% — Good" },
                { color: "#b87a00", label: "50-74% — Needs Work" },
                { color: C.danger, label: "<50% — Critical" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textMuted }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Coverage bars */}
            {COVERAGE_MAP.map((area, i) => (
              <CoverageBar key={i} {...area} />
            ))}

            {/* Callout */}
            <div style={{
              marginTop: 20, padding: "14px 16px", borderRadius: 10,
              background: "rgba(192,57,43,0.04)", border: "1px solid rgba(192,57,43,0.12)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, marginBottom: 4 }}>⚠️ Critical Gaps</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                Safety Procedures and Warehouse Ops are below 50% documentation. RHONDA has detected {KNOWLEDGE_GAPS.filter(g => g.priority === "critical").length} critical knowledge gaps with single-expert dependency risk.
                <a href="#" onClick={(e) => { e.preventDefault(); setView("gaps"); }} style={{ color: C.gold, fontWeight: 600, marginLeft: 4 }}>View Knowledge Gaps →</a>
              </div>
            </div>
          </div>
        )}

        {/* ═══ KNOWLEDGE GAPS VIEW ═══ */}
        {view === "gaps" && (
          <div>
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: "0 0 6px" }}>AI-Detected Knowledge Gaps</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
                RHONDA analyzes incident reports, training times, and single-expert dependencies to identify where knowledge is at risk. Each gap can become a bounty with one click.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {KNOWLEDGE_GAPS.map((gap, i) => (
                <div key={i} style={{
                  background: C.surface, borderRadius: 14, padding: "18px 20px",
                  border: `1px solid ${gap.priority === "critical" ? "rgba(192,57,43,0.2)" : C.borderLight}`,
                  borderLeft: `4px solid ${PRIORITY_COLORS[gap.priority]}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.forest }}>{gap.topic}</span>
                        <span style={{
                          padding: "2px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700,
                          background: `${PRIORITY_COLORS[gap.priority]}15`, color: PRIORITY_COLORS[gap.priority],
                          textTransform: "uppercase",
                        }}>
                          {gap.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{gap.reason}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>${gap.amount}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, textTransform: "uppercase" }}>suggested</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button style={{
                      padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.gold}`,
                      background: C.goldLight, color: C.gold, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      Create Bounty →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ RECOGNITION FEED VIEW ═══ */}
        {view === "feed" && (
          <div>
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: "0 0 6px" }}>Recognition Feed</h2>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
                Every contribution gets celebrated. No leaderboards — just milestones and success stories.
              </p>
            </div>

            {/* Top contributors spotlight */}
            <div style={{
              background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: 20, marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Knowledge Champions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { worker: WORKERS.w1, bounties: 10, earned: 475, level: "Knowledge Expert", emoji: "⭐" },
                  { worker: WORKERS.w3, bounties: 6, earned: 230, level: "Knowledge Builder", emoji: "🔧" },
                  { worker: WORKERS.w2, bounties: 4, earned: 150, level: "Knowledge Contributor", emoji: "📊" },
                ].map((champ, i) => (
                  <div key={i} style={{
                    padding: "16px 14px", borderRadius: 12, textAlign: "center",
                    background: i === 0 ? C.goldLight : C.bg, border: `1px solid ${i === 0 ? C.gold : C.borderLight}`,
                  }}>
                    <Avatar initials={champ.worker.initials} color={champ.worker.color} size={40} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.forest, marginTop: 8 }}>{champ.worker.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{champ.worker.role}</div>
                    <div style={{ fontSize: 16, marginTop: 8 }}>{champ.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginTop: 2 }}>{champ.level}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.forest }}>{champ.bounties}</div>
                        <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Bounties</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.green }}>${champ.earned}</div>
                        <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Earned</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {RECOGNITION_FEED.map((item, i) => (
                <div key={i} style={{
                  background: C.surface, borderRadius: 10, padding: "12px 16px",
                  border: `1px solid ${C.borderLight}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{item.text}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, flexShrink: 0, whiteSpace: "nowrap" }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          RHONDA's Knowledge Gap Engine continuously analyzes incidents, training times, and expert dependencies<br />
          to suggest bounties where documentation has the highest ROI.
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
