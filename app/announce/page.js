"use client";
import { useState } from "react";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Espanol", flag: "🇲🇽" },
  { code: "vi", label: "Tieng Viet", flag: "🇻🇳" },
];

export default function AnnouncePage() {
  const [announcement, setAnnouncement] = useState("");
  const [selectedLangs, setSelectedLangs] = useState(["en", "es"]);
  const [translations, setTranslations] = useState({}); // { "es": "...", "vi": "..." }
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(null);

  const toggleLang = (code) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const translateAll = async () => {
    if (!announcement.trim()) return;
    setTranslating(true);
    setTranslations({});

    const targets = selectedLangs.filter(l => l !== "en");
    const results = {};

    await Promise.all(targets.map(async (lang) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: announcement.trim(),
            targetLang: lang,
            context: "a workplace announcement for manufacturing workers",
          }),
        });
        const data = await res.json();
        if (data.translated) results[lang] = data.translated;
      } catch {}
    }));

    setTranslations(results);
    setTranslating(false);
  };

  const copyTranslation = (lang, text) => {
    navigator.clipboard.writeText(text);
    setCopied(lang);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    const parts = [];
    if (selectedLangs.includes("en")) parts.push(`[English]\n${announcement}`);
    for (const lang of selectedLangs.filter(l => l !== "en")) {
      const langInfo = LANGUAGES.find(l => l.code === lang);
      if (translations[lang]) parts.push(`[${langInfo?.label}]\n${translations[lang]}`);
    }
    navigator.clipboard.writeText(parts.join("\n\n---\n\n"));
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
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
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Multilingual Announcements</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Broadcast Announcement</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Write once, translate to every language your workforce speaks.</p>
        </div>

        {/* Language picker */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => toggleLang(lang.code)}
              style={{
                padding: "8px 16px", borderRadius: 20,
                border: `1px solid ${selectedLangs.includes(lang.code) ? C.gold : C.border}`,
                background: selectedLangs.includes(lang.code) ? C.goldLight : C.surface,
                color: selectedLangs.includes(lang.code) ? C.gold : C.textMuted,
                fontWeight: selectedLangs.includes(lang.code) ? 700 : 400,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
            Announcement (English)
          </label>
          <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)}
            placeholder="Type your announcement here... Example: All employees must complete their forklift recertification by April 15. See your supervisor to schedule training."
            rows={5}
            style={{ width: "100%", padding: 16, borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, fontSize: 14, lineHeight: 1.6, color: C.text, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
            <button onClick={translateAll} disabled={translating || !announcement.trim() || selectedLangs.length < 2}
              style={{
                padding: "12px 32px", borderRadius: 10, border: "none",
                background: (!announcement.trim() || translating || selectedLangs.length < 2) ? C.border : C.gold,
                color: (!announcement.trim() || translating || selectedLangs.length < 2) ? C.textMuted : "#fff",
                fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8,
              }}>
              {translating ? (
                <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Translating...</>
              ) : "Translate All"}
            </button>
          </div>
        </div>

        {/* Translation results */}
        {(Object.keys(translations).length > 0 || (selectedLangs.includes("en") && announcement)) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 4, height: 20, background: C.gold, borderRadius: 2, display: "inline-block" }} />
                Translations
              </h2>
              {Object.keys(translations).length > 0 && (
                <button onClick={copyAll}
                  style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.gold}`, background: copied === "all" ? C.goldLight : C.surface, color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {copied === "all" ? "Copied All!" : "Copy All"}
                </button>
              )}
            </div>

            {selectedLangs.map(lang => {
              const langInfo = LANGUAGES.find(l => l.code === lang);
              const text = lang === "en" ? announcement : translations[lang];
              if (!text) return null;
              return (
                <div key={lang} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.borderLight}`, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{langInfo?.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.forest }}>{langInfo?.label}</span>
                    </div>
                    <button onClick={() => copyTranslation(lang, text)}
                      style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: copied === lang ? C.goldLight : "transparent", color: copied === lang ? C.gold : C.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {copied === lang ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: C.text, whiteSpace: "pre-wrap" }}>{text}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
