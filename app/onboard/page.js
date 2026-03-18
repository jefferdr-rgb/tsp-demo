"use client";
import { useState } from "react";
import { useVoiceInput } from "../_lib/useVoiceInput";
import { useImageCapture } from "../_lib/useImageCapture";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const FIELD_LABELS = {
  full_name: "Full Name",
  date_of_birth: "Date of Birth",
  address: "Address",
  id_number: "ID Number",
  id_expiration: "ID Expiration",
  id_state: "Issuing State",
  start_date: "Start Date",
  department: "Department",
  position: "Position",
  hourly_rate: "Hourly Rate",
  shift: "Shift",
  supervisor: "Supervisor",
  notes: "Notes",
};

export default function OnboardPage() {
  const voice = useVoiceInput({ lang: "en-US" });
  const image = useImageCapture();
  const [step, setStep] = useState(1); // 1=photo, 2=voice, 3=review
  const [employee, setEmployee] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const processOnboarding = async () => {
    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBlock: image.contentBlock || undefined,
          transcript: voice.transcript.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmployee(data.employee);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const updateField = (field, value) => {
    setEmployee(prev => ({ ...prev, [field]: value }));
  };

  const saveEmployee = async () => {
    try {
      await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "employees",
          record: {
            name: employee.full_name,
            role: employee.position,
            department: employee.department,
            hire_date: employee.start_date,
            language: "en",
            client_key: "sunshine-mills",
          },
        }),
      });
      setSaved(true);
    } catch {
      setError("Failed to save. Try again.");
    }
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
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Quick Onboard</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      {/* Progress */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 32px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", gap: 8, alignItems: "center" }}>
          {[
            { n: 1, label: "Photo ID" },
            { n: 2, label: "Voice Details" },
            { n: 3, label: "Review & Save" },
          ].map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: step >= s.n ? C.gold : C.bg,
                color: step >= s.n ? "#fff" : C.textMuted,
                fontWeight: 700, fontSize: 12,
                border: `2px solid ${step >= s.n ? C.gold : C.border}`,
              }}>{step > s.n ? "✓" : s.n}</div>
              <span style={{ fontSize: 12, fontWeight: step === s.n ? 700 : 400, color: step === s.n ? C.forest : C.textMuted }}>{s.label}</span>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.n ? C.gold : C.border, borderRadius: 1 }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>

        {/* Step 1: Photo ID */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.forest, margin: "0 0 8px" }}>Step 1: Photo the ID</h2>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Driver's license, state ID, or passport</p>

            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, marginBottom: 24 }}>
              {image.preview ? (
                <div>
                  <img src={image.preview} alt="ID" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 16 }} />
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => image.captureImage({ camera: true })} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Retake</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ width: 80, height: 80, borderRadius: 20, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 9h4l1-2h10l1 2h4"/></svg>
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button onClick={() => image.captureImage({ camera: true })}
                      style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Take Photo
                    </button>
                    <button onClick={() => image.captureImage()}
                      style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setStep(2)} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Skip — no photo</button>
              {image.preview && (
                <button onClick={() => setStep(2)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Next →</button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Voice Details */}
        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.forest, margin: "0 0 8px" }}>Step 2: Say the Details</h2>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>
              &quot;This is Juan Garcia, starts Monday, production line, $18/hour, day shift, reports to Mike.&quot;
            </p>

            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${voice.isRecording ? C.gold : C.border}`, boxShadow: voice.isRecording ? `0 0 24px ${C.goldGlow}` : "0 2px 8px rgba(0,0,0,0.04)", padding: 32, marginBottom: 24, transition: "all 0.3s" }}>
              {voice.supported && (
                <button onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
                  style={{ width: 96, height: 96, borderRadius: "50%", border: "none", background: voice.isRecording ? C.danger : C.gold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: voice.isRecording ? `0 0 0 8px rgba(192,57,43,0.08)` : `0 4px 16px ${C.goldGlow}`, animation: voice.isRecording ? "pulse 1.5s ease-in-out infinite" : "none" }}>
                  {voice.isRecording ? (
                    <div style={{ width: 28, height: 28, borderRadius: 4, background: "#fff" }} />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="17" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" /></svg>
                  )}
                </button>
              )}
              {voice.isRecording && (
                <div style={{ fontSize: 14, color: C.danger, fontWeight: 600, marginBottom: 8 }}>Recording — {formatTime(voice.recordingTime)}</div>
              )}
              {(voice.transcript || !voice.supported) && (
                <textarea value={voice.transcript + (voice.interimText ? " " + voice.interimText : "")}
                  onChange={e => voice.setTranscript(e.target.value)}
                  placeholder="Or type the details here..."
                  rows={3}
                  style={{ width: "100%", marginTop: 16, padding: 14, borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
              )}
            </div>

            {error && <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setStep(1)} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
              <button onClick={processOnboarding} disabled={processing || (!image.contentBlock && !voice.transcript.trim())}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: processing ? C.border : C.gold, color: processing ? C.textMuted : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                {processing ? (
                  <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Processing...</>
                ) : "Extract & Review →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Edit */}
        {step === 3 && employee && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.forest, margin: "0 0 8px", textAlign: "center" }}>Step 3: Review & Save</h2>
            <p style={{ fontSize: 14, color: C.textMuted, textAlign: "center", marginBottom: 24 }}>Edit any field, then save to RHONDA.</p>

            {saved ? (
              <div style={{ background: C.surface, borderRadius: 16, border: `2px solid ${C.green}`, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.forest, marginBottom: 8 }}>Employee Saved!</div>
                <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>{employee.full_name} has been added to RHONDA.</div>
                <button onClick={() => { setStep(1); setEmployee(null); setSaved(false); voice.resetTranscript(); image.clear(); }}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Onboard Another
                </button>
              </div>
            ) : (
              <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
                {Object.entries(FIELD_LABELS).map(([field, label]) => (
                  <div key={field} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <label style={{ width: 120, fontSize: 12, fontWeight: 600, color: C.textMuted, textAlign: "right", flexShrink: 0 }}>{label}</label>
                    <input value={employee[field] || ""} onChange={e => updateField(field, e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${employee[field] ? C.borderLight : "#F5B7B1"}`, background: employee[field] ? C.bg : "#FEF9E7", fontSize: 13, color: C.text, fontFamily: "inherit", outline: "none" }}
                    />
                  </div>
                ))}

                {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(192,57,43,0.08)", color: C.danger, fontSize: 12, marginTop: 12 }}>{error}</div>}

                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                  <button onClick={() => setStep(2)} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  <button onClick={saveEmployee}
                    style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.gold, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Save to RHONDA
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
