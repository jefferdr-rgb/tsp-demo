"use client";
import { useState, useRef, useCallback } from "react";
import { useVoiceInput } from "../_lib/useVoiceInput";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const LANGUAGES = [
  { code: "en", bcp: "en-US", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", bcp: "es-MX", label: "Espa\u00f1ol", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "vi", bcp: "vi-VN", label: "Ti\u1EBFng Vi\u1EC7t", flag: "\u{1F1FB}\u{1F1F3}" },
];

export default function VoiceBroadcastPage() {
  const voice = useVoiceInput({ lang: "en-US" });
  const [manualText, setManualText] = useState("");
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [speaking, setSpeaking] = useState(null);
  const [mode, setMode] = useState("voice"); // voice | text
  const synthRef = useRef(null);

  const sourceText = mode === "voice" ? voice.transcript : manualText;

  const broadcastAll = async () => {
    if (!sourceText.trim()) return;
    setTranslating(true);
    setTranslations({});

    const targets = ["es", "vi"];
    const results = { en: sourceText.trim() };

    await Promise.all(targets.map(async (lang) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: sourceText.trim(),
            targetLang: lang,
            context: "a live voice broadcast from a supervisor to factory floor workers",
          }),
        });
        const data = await res.json();
        if (data.translated) results[lang] = data.translated;
      } catch {}
    }));

    setTranslations(results);
    setTranslating(false);
  };

  const speakText = useCallback((langCode, text) => {
    if (synthRef.current) {
      window.speechSynthesis.cancel();
      synthRef.current = null;
    }
    if (speaking === langCode) {
      setSpeaking(null);
      return;
    }

    const lang = LANGUAGES.find(l => l.code === langCode);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang?.bcp || "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => { setSpeaking(null); synthRef.current = null; };
    utterance.onerror = () => { setSpeaking(null); synthRef.current = null; };

    synthRef.current = utterance;
    setSpeaking(langCode);
    window.speechSynthesis.speak(utterance);
  }, [speaking]);

  const speakAll = useCallback(() => {
    if (!translations || Object.keys(translations).length === 0) return;

    const langs = ["en", "es", "vi"].filter(l => translations[l]);
    let i = 0;

    const speakNext = () => {
      if (i >= langs.length) { setSpeaking(null); return; }
      const langCode = langs[i];
      const lang = LANGUAGES.find(l => l.code === langCode);
      const utterance = new SpeechSynthesisUtterance(translations[langCode]);
      utterance.lang = lang?.bcp || "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => { i++; setTimeout(speakNext, 600); };
      utterance.onerror = () => { i++; setTimeout(speakNext, 600); };
      setSpeaking(langCode);
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [translations]);

  const hasTranslations = Object.keys(translations).length > 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Voice Broadcast</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Live Voice Broadcast</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Speak once. Every worker hears it in their language.</p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 24, background: C.surface, borderRadius: 10, padding: 4, width: "fit-content", margin: "0 auto 24px", border: `1px solid ${C.borderLight}` }}>
          {[{ id: "voice", label: "Voice" }, { id: "text", label: "Type" }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: mode === m.id ? C.gold : "transparent",
                color: mode === m.id ? "#fff" : C.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 32, marginBottom: 24, textAlign: "center" }}>
          {mode === "voice" ? (
            <div>
              {/* Big record button */}
              <button
                onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
                style={{
                  width: 120, height: 120, borderRadius: "50%", border: "none",
                  background: voice.isRecording
                    ? `radial-gradient(circle, ${C.danger} 0%, #a03020 100%)`
                    : `radial-gradient(circle, ${C.gold} 0%, #a07820 100%)`,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: voice.isRecording
                    ? `0 0 0 8px rgba(192,57,43,0.15), 0 0 40px rgba(192,57,43,0.2)`
                    : `0 0 0 8px ${C.goldGlow}, 0 4px 20px rgba(0,0,0,0.1)`,
                  transition: "all 0.3s ease",
                  animation: voice.isRecording ? "pulse 1.5s ease-in-out infinite" : "none",
                }}>
                {voice.isRecording ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>

              <div style={{ fontSize: 13, color: voice.isRecording ? C.danger : C.textMuted, fontWeight: 600, marginBottom: 12 }}>
                {voice.isRecording ? `Recording... ${voice.recordingTime}s` : "Tap to speak your announcement"}
              </div>

              {/* Transcript display */}
              {(voice.transcript || voice.interimText) && (
                <div style={{ background: C.bg, borderRadius: 10, padding: 16, textAlign: "left", minHeight: 60, border: `1px solid ${C.borderLight}` }}>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>
                    {voice.transcript}
                    {voice.interimText && <span style={{ color: C.textMuted, fontStyle: "italic" }}> {voice.interimText}</span>}
                  </div>
                </div>
              )}

              {voice.error && <div style={{ marginTop: 8, fontSize: 12, color: C.danger }}>{voice.error}</div>}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8, textAlign: "left" }}>
                Announcement (English)
              </label>
              <textarea value={manualText} onChange={e => setManualText(e.target.value)}
                placeholder="Type your announcement..."
                rows={4}
                style={{ width: "100%", padding: 16, borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, fontSize: 14, lineHeight: 1.6, color: C.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* Broadcast button */}
          <button onClick={broadcastAll} disabled={translating || !sourceText.trim()}
            style={{
              marginTop: 20, padding: "14px 40px", borderRadius: 12, border: "none",
              background: (!sourceText.trim() || translating) ? C.border : `linear-gradient(135deg, ${C.gold} 0%, #d4a843 100%)`,
              color: (!sourceText.trim() || translating) ? C.textMuted : "#fff",
              fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              boxShadow: sourceText.trim() && !translating ? `0 4px 16px ${C.goldGlow}` : "none",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}>
            {translating ? (
              <><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Broadcasting...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>Broadcast to All Languages</>
            )}
          </button>
        </div>

        {/* Translation results with audio playback */}
        {hasTranslations && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.forest, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 24, background: C.gold, borderRadius: 2, display: "inline-block" }} />
                Broadcast Ready
              </h2>
              <button onClick={speakAll}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: `linear-gradient(135deg, ${C.forest} 0%, #3a5430 100%)`,
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 2px 12px rgba(44,53,40,0.3)",
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play All Languages
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {LANGUAGES.map(lang => {
                const text = translations[lang.code];
                if (!text) return null;
                const isPlaying = speaking === lang.code;

                return (
                  <div key={lang.code}
                    style={{
                      background: C.surface, borderRadius: 14,
                      border: `1px solid ${isPlaying ? C.gold : C.borderLight}`,
                      padding: "18px 22px",
                      boxShadow: isPlaying ? `0 0 0 3px ${C.goldGlow}` : "none",
                      transition: "all 0.3s ease",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{lang.flag}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.forest }}>{lang.label}</span>
                        {isPlaying && (
                          <span style={{
                            display: "inline-flex", gap: 2, alignItems: "flex-end", height: 14,
                          }}>
                            {[0, 1, 2, 3].map(i => (
                              <span key={i} style={{
                                width: 3, background: C.gold, borderRadius: 1,
                                animation: `bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                              }} />
                            ))}
                          </span>
                        )}
                      </div>
                      <button onClick={() => speakText(lang.code, text)}
                        style={{
                          width: 40, height: 40, borderRadius: "50%", border: "none",
                          background: isPlaying ? C.danger : C.gold,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: `0 2px 8px ${isPlaying ? "rgba(192,57,43,0.3)" : C.goldGlow}`,
                          transition: "all 0.2s ease",
                        }}>
                        {isPlaying ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        )}
                      </button>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 8px rgba(192,57,43,0.15), 0 0 40px rgba(192,57,43,0.2); } 50% { box-shadow: 0 0 0 16px rgba(192,57,43,0.08), 0 0 60px rgba(192,57,43,0.15); } }
        @keyframes bar { from { height: 4px; } to { height: 14px; } }
      `}</style>
    </div>
  );
}
