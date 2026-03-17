"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// ── TSP Colors ──────────────────────────────────────────────────────────────
const C = {
  bg: "#f4f1ea",
  surface: "#ffffff",
  chrome: "#2c3528",
  gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)",
  goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528",
  green: "#4a6540",
  border: "#d6d1c4",
  borderLight: "#e8e3d9",
  text: "#2c3528",
  textMuted: "#7a7462",
  danger: "#c0392b",
  dangerBg: "rgba(192,57,43,0.08)",
};

// ── Markdown-to-HTML (simple, no dependencies) ─────────────────────────────
function md(text) {
  if (!text) return "";
  return text
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;color:#2c3528;margin:24px 0 8px">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:700;color:#c49b2a;margin:20px 0 6px;text-transform:uppercase;letter-spacing:0.5px">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;color:#2c3528;margin:14px 0 4px">$1</h3>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<p style="font-weight:700;color:#2c3528;margin:4px 0">$1</p>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- \[ \] (.+)$/gm, '<label style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;font-size:13px;color:#2c3528"><input type="checkbox" style="margin-top:2px;accent-color:#c49b2a"> <span>$1</span></label>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;font-size:13px;color:#2c3528;margin-left:16px">$1</li>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d6d1c4;margin:16px 0">')
    .replace(/⚠️/g, '<span style="color:#c0392b">⚠️</span>')
    .replace(/\[VERIFY\]/g, '<span style="background:#fff3cd;color:#856404;padding:1px 6px;border-radius:3px;font-size:11px;font-weight:600">VERIFY</span>')
    .replace(/\n\n/g, "<br>")
    .replace(/\n/g, "\n");
}

export default function SOPGenerator() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [sopOutput, setSopOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const outputRef = useRef(null);

  // ── Check Web Speech API support ──────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSpeechSupported(false);
  }, []);

  // ── Voice Recording ───────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    setError("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported. Use Chrome or Safari.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = transcript;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + t;
          setTranscript(finalTranscript);
        } else {
          interim += t;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return; // ignore silence
      setError(`Mic error: ${event.error}. Check browser permissions.`);
      setIsRecording(false);
      clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      // Auto-restart if still recording (browser stops after ~60s of silence)
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  }, [transcript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null; // prevent auto-restart
      r.stop();
    }
    setIsRecording(false);
    setInterimText("");
    clearInterval(timerRef.current);
  }, []);

  // ── Generate SOP ──────────────────────────────────────────────────────────
  const generateSOP = async () => {
    if (!transcript.trim()) {
      setError("No transcript to generate from. Record a description first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSopOutput("");

    try {
      const res = await fetch("/api/sop-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          companyName: "Sunshine Mills",
          department: department || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `API error: ${res.status}`);
      }

      const text = data.content?.[0]?.text || "No output generated.";
      setSopOutput(text);

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Copy / Download ───────────────────────────────────────────────────────
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sopOutput);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const title = sopOutput.match(/^# SOP: (.+)$/m)?.[1] || "procedure";
    const filename = `SOP_${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    const blob = new Blob([sopOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setTranscript("");
    setInterimText("");
    setSopOutput("");
    setError("");
    setRecordingTime(0);
    setDepartment("");
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>SOP Generator</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Sunshine Mills</span>
          <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>
            Voice-to-SOP Generator
          </h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>
            Describe a procedure. RHONDA writes the SOP.
          </p>
        </div>

        {/* Department selector */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
          {["Production", "Quality", "Warehouse", "Maintenance", "Shipping", "Safety"].map((d) => (
            <button
              key={d}
              onClick={() => setDepartment(department === d ? "" : d)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: `1px solid ${department === d ? C.gold : C.border}`,
                background: department === d ? C.goldLight : C.surface,
                color: department === d ? C.gold : C.textMuted,
                fontWeight: department === d ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* ── Recording Panel ─────────────────────────────────────────────── */}
        <div
          style={{
            background: C.surface,
            borderRadius: 16,
            border: `1px solid ${isRecording ? C.gold : C.border}`,
            boxShadow: isRecording ? `0 0 24px ${C.goldGlow}` : "0 2px 8px rgba(0,0,0,0.04)",
            padding: 32,
            marginBottom: 24,
            transition: "all 0.3s",
          }}
        >
          {/* Mic Button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {!speechSupported ? (
              <div style={{ color: C.danger, fontSize: 14, textAlign: "center" }}>
                Speech recognition requires Chrome or Safari.
                <br />
                <span style={{ fontSize: 12, color: C.textMuted }}>You can also type in the box below.</span>
              </div>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: "none",
                  background: isRecording ? C.danger : C.gold,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                  boxShadow: isRecording
                    ? `0 0 0 8px ${C.dangerBg}, 0 0 32px rgba(192,57,43,0.3)`
                    : `0 4px 16px ${C.goldGlow}`,
                  animation: isRecording ? "pulse 1.5s ease-in-out infinite" : "none",
                }}
              >
                {isRecording ? (
                  /* Stop icon */
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: "#fff" }} />
                ) : (
                  /* Mic icon */
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                )}
              </button>
            )}

            {isRecording && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.danger, fontWeight: 600 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.danger, animation: "pulse 1s infinite" }} />
                Recording — {formatTime(recordingTime)}
              </div>
            )}

            {!isRecording && !transcript && (
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0, textAlign: "center" }}>
                Tap the mic and describe how the procedure works.
                <br />
                Speak naturally — RHONDA will organize it.
              </p>
            )}
          </div>

          {/* Transcript Area */}
          {(transcript || interimText || !speechSupported) && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Transcript
                </label>
                {transcript && (
                  <button
                    onClick={() => { setTranscript(""); setInterimText(""); }}
                    style={{ fontSize: 11, color: C.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={transcript + (interimText ? (transcript ? " " : "") + interimText : "")}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Or type the procedure description here..."
                style={{
                  width: "100%",
                  minHeight: 120,
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${C.borderLight}`,
                  background: C.bg,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: C.text,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {interimText && (
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                  Listening...
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, background: C.dangerBg, color: C.danger, fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center" }}>
            <button
              onClick={generateSOP}
              disabled={isGenerating || !transcript.trim()}
              style={{
                padding: "12px 32px",
                borderRadius: 10,
                border: "none",
                background: (!transcript.trim() || isGenerating) ? C.border : C.gold,
                color: (!transcript.trim() || isGenerating) ? C.textMuted : "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: (!transcript.trim() || isGenerating) ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Generating SOP...
                </>
              ) : (
                "Generate SOP"
              )}
            </button>

            {(transcript || sopOutput) && (
              <button
                onClick={resetAll}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  color: C.textMuted,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Start Over
              </button>
            )}
          </div>
        </div>

        {/* ── SOP Output ──────────────────────────────────────────────────── */}
        {(sopOutput || isGenerating) && (
          <div ref={outputRef} style={{ marginBottom: 48 }}>
            {/* Output Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.gold, borderRadius: 2, display: "inline-block" }} />
                Generated SOP
              </h2>
              {sopOutput && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: `1px solid ${C.border}`,
                      background: showCopied ? C.goldLight : C.surface,
                      color: showCopied ? C.gold : C.textMuted,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 500,
                    }}
                  >
                    {showCopied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: `1px solid ${C.gold}`,
                      background: C.goldLight,
                      color: C.gold,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    Download .md
                  </button>
                </div>
              )}
            </div>

            {/* SOP Document */}
            <div
              style={{
                background: C.surface,
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                padding: "32px 40px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                lineHeight: 1.7,
                fontSize: 14,
                color: C.text,
              }}
            >
              {isGenerating && !sopOutput ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted }}>
                  <div style={{ width: 32, height: 32, border: `3px solid ${C.borderLight}`, borderTop: `3px solid ${C.gold}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>RHONDA is writing your SOP...</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>This takes about 10-15 seconds</div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: md(sopOutput) }} />
              )}
            </div>
          </div>
        )}

        {/* ── How It Works (shown when empty) ─────────────────────────────── */}
        {!sopOutput && !isGenerating && !transcript && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
            {[
              { num: "1", title: "Speak", desc: "Tap the mic and describe the procedure naturally. No script needed." },
              { num: "2", title: "Generate", desc: "RHONDA converts your description into a formatted, compliant SOP." },
              { num: "3", title: "Use", desc: "Download, print, or push to your quality management system." },
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  background: C.surface,
                  borderRadius: 12,
                  border: `1px solid ${C.borderLight}`,
                  padding: "24px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.goldLight, color: C.gold, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.forest, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Animations ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.7 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
