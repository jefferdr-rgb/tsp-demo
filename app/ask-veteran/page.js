"use client";
import { useState, useEffect, useRef } from "react";
import { useVoiceInput } from "../_lib/useVoiceInput";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#1A2440", accent: "#3B77BB",
  accentLight: "rgba(59,119,187,0.1)", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#1a2a25", textMuted: "#5a6e65", green: "#22c55e", gold: "#C49B2A",
  danger: "#C53030",
};

const VETERANS = [
  { id: "pat", name: "Pat Henderson", role: "Houseparent — 21 years", years: 21, avatar: "PH", color: "#3B77BB", contributions: 12 },
  { id: "sherry", name: "Sherry Gulsby", role: "Intake Coordinator — 16 years", years: 16, avatar: "SG", color: "#7C3AED", contributions: 8 },
  { id: "dr-mitchell", name: "Dr. Sarah Mitchell", role: "Clinical Director — 14 years", years: 14, avatar: "SM", color: "#2E7D6F", contributions: 10 },
  { id: "kevin", name: "Kevin Marshall", role: "Night Supervisor — 18 years", years: 18, avatar: "KM", color: "#C49B2A", contributions: 9 },
];

const KNOWLEDGE_ENTRIES = [
  {
    id: 1, veteran: "pat", question: "How do you handle a new youth's first night?",
    answer: "The first night sets the tone for everything. I keep it low-key — no big introductions, no group activities. I show them their room, let them pick which bed, show them where the bathroom is. I sit with them and just talk. Not about why they're here. About normal stuff — what music do you like, do you follow any sports, what's your favorite food. I make sure they know where I sleep and that I'm here all night. I always leave the hallway light on. Most kids who've been through what ours have been through are afraid of the dark. After 21 years, I can tell you: a kid who feels safe on night one will trust you on day two.",
    tags: ["new-admission", "first-night", "trust-building", "houseparent"], upvotes: 47, verified: true,
  },
  {
    id: 2, veteran: "sherry", question: "What's the most important thing during a DV intake?",
    answer: "Safety first, paperwork second. Always. When a woman comes through our door with her children, she's been through the worst day of her life — or the bravest. I get her and the kids settled before I touch a single form. Food, water, a quiet room. Kids need crayons and something to do. Then I ask: 'Are you safe right now? Does anyone know you're here?' Those two questions tell me everything I need to know about urgency. The 9-section intake form can wait an hour. Her feeling safe cannot.",
    tags: ["intake", "domestic-violence", "women-children", "safety-first"], upvotes: 52, verified: true,
  },
  {
    id: 3, veteran: "dr-mitchell", question: "How do you know when a youth is ready to step down from residential?",
    answer: "It's not about the absence of bad behavior — it's about the presence of good coping. I look for three things: Can they name their triggers? Can they ask for help before they escalate? Can they repair a relationship after a conflict? If a youth can do all three consistently for 90 days, they're ready. The behavioral points system tells you about compliance. These three questions tell you about healing. I've seen kids with perfect behavior scores who weren't ready, and kids with recent incidents who were — because the incident ended with them self-correcting for the first time.",
    tags: ["discharge-readiness", "clinical", "assessment", "coping-skills"], upvotes: 38, verified: true,
  },
  {
    id: 4, veteran: "kevin", question: "What's the hardest part of overnight shifts with traumatized kids?",
    answer: "Nightmares. Not theirs — I mean knowing what to do about them. A kid screaming at 2 AM isn't having a bad dream. They're reliving something. Never shake them awake. Sit near them, speak softly, maybe hum. Let them come out of it on their own. When they wake up, don't ask what they dreamed about. Say 'You're safe. You're at Kings Home. I'm Kevin and I'm right here.' Ground them in the present. Some nights I sit outside a kid's door for an hour just so they can hear someone breathing. It works. After 18 years of nights, I've learned that being present is the intervention.",
    tags: ["overnight", "nightmares", "trauma-response", "grounding"], upvotes: 61, verified: true,
  },
  {
    id: 5, veteran: "pat", question: "What do you do when a youth refuses to go to school?",
    answer: "First rule: don't make it a power struggle. If you say 'you're going to school' and they say 'no,' now you're in a battle nobody wins. Instead I say 'Hey, rough morning? What's going on?' Half the time it's not about school at all — they had a bad phone call with family, they're being bullied, they didn't sleep. Address the real thing. If they truly can't go, I let them stay but we have a deal: they do schoolwork in the cottage and we talk about what's making school hard. I've had kids who refused school for a week and then went back strong because we fixed the real problem instead of forcing attendance.",
    tags: ["school-refusal", "behavior", "houseparent", "problem-solving"], upvotes: 34, verified: true,
  },
  {
    id: 6, veteran: "dr-mitchell", question: "How do you prevent staff burnout in residential care?",
    answer: "You can't prevent it — you can only catch it early. I watch for three signs: when a staff member starts talking about kids as problems instead of people, when they stop asking questions in supervision, and when they start calling in sick on Mondays. Those are the canaries. When I see them, I don't write anyone up. I sit down and say 'How are you, really?' I've learned that the staff who burn out fastest are usually the ones who care the most. They give everything and forget to keep anything for themselves. We now do secondary trauma screening every quarter, and I remind every staff member: you cannot pour from an empty cup, and that's not a cliché — it's a clinical fact.",
    tags: ["burnout", "staff-wellness", "supervision", "secondary-trauma"], upvotes: 43, verified: true,
  },
];

export default function AskVeteranPage() {
  const voice = useVoiceInput({ lang: "en-US" });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState("browse");
  const [selectedTag, setSelectedTag] = useState(null);
  const resultRef = useRef(null);
  const [veterans, setVeterans] = useState(VETERANS);
  const [knowledgeEntries, setKnowledgeEntries] = useState(KNOWLEDGE_ENTRIES);

  useEffect(() => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 30000);
    Promise.all([
      fetch("/api/data?table=veteran_knowledge&order=upvotes&asc=false", { signal: ctrl.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => ({ source: "demo" })),
      fetch("/api/data?table=workers&order=name&asc=true", { signal: ctrl.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => ({ source: "demo" })),
    ])
      .then(([vkData, wData]) => {
        if (vkData.source === "demo" || !vkData.data?.length) return;
        const workerMap = {};
        (wData.data || []).forEach(w => { workerMap[w.id] = w; });
        const vetIds = [...new Set(vkData.data.map(e => e.veteran_id))];
        const liveVets = vetIds.map(id => {
          const w = workerMap[id];
          if (!w) return null;
          return { id: w.id, name: w.name, role: `${w.role} — ${w.department}`, years: w.years_experience || 0, avatar: w.avatar_initials || w.name.split(" ").map(n => n[0]).join(""), color: w.avatar_color || "#3B77BB", contributions: vkData.data.filter(e => e.veteran_id === id).length };
        }).filter(Boolean);
        if (liveVets.length) setVeterans(liveVets);
        setKnowledgeEntries(vkData.data.map((e, i) => ({ id: e.id || i, veteran: e.veteran_id, question: e.question, answer: e.answer, tags: e.tags || [], upvotes: e.upvotes || 0, verified: e.is_verified ?? true })));
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
  }, []);

  const allTags = [...new Set(knowledgeEntries.flatMap(e => e.tags))].sort();
  const filteredEntries = selectedTag ? knowledgeEntries.filter(e => e.tags.includes(selectedTag)) : knowledgeEntries;

  const askQuestion = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults(null);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch("/api/rhonda", {
        method: "POST", signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 2048,
          system: `You are RHONDA's "Ask the Veteran" system for Kings Home — a residential child welfare organization with 21 homes across 6 campuses serving abused youth, women fleeing domestic violence, and therapeutic foster care families. You have access to tribal knowledge contributed by experienced Kings Home staff.

Here is the knowledge base:
${knowledgeEntries.map(e => {
  const vet = veterans.find(v => v.id === e.veteran);
  return `---\nExpert: ${vet?.name} (${vet?.role}, ${vet?.years} years)\nQ: ${e.question}\nA: ${e.answer}\nTags: ${e.tags.join(", ")}\n`;
}).join("\n")}

When answering:
1. Search the knowledge base for relevant entries
2. Attribute answers to the specific veteran who shared the knowledge
3. If multiple veterans have relevant knowledge, combine their insights
4. If no veteran knowledge is directly relevant, say so and provide trauma-informed, best-practice guidance
5. Always credit the source: "According to [Name] ([years] years experience)..."
6. Be warm, practical, and specific — this advice will be used by real care staff with real children

RESPOND WITH VALID JSON:
{
  "answer": "Your synthesized answer with veteran attribution",
  "sources": [{"name": "Veteran Name", "role": "Their Role", "years": N, "relevance": "Why their knowledge applies"}],
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "related_tags": ["relevant", "tags"],
  "follow_up": "A suggested follow-up question"
}`,
          messages: [{ role: "user", content: query.trim() }],
        }),
      });
      if (!res.ok) throw new Error("API error");
      let data;
      try { data = await res.json(); } catch { throw new Error("Invalid response"); }
      if (data.error) throw new Error(data.error.message);
      const rawText = data.content?.map(b => b.text).join("") || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      setSearchResults(JSON.parse(jsonMatch ? jsonMatch[0] : rawText));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      setSearchResults({ answer: err.name === "AbortError" ? "Request timed out. Please try again." : "Sorry, I couldn't search the knowledge base right now. Try browsing the entries below.", sources: [], confidence: "LOW", related_tags: [], follow_up: null });
    } finally {
      setSearching(false);
      clearTimeout(timeout);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/kings-home" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>&larr; RHONDA Home</a>
        <div style={{ flex: 1 }} />
        <h1 style={{ color: "#fff", fontSize: 18, margin: 0, fontWeight: 600 }}>Ask the Veteran</h1>
        <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,119,187,0.15)", color: "#7FB3E0", fontSize: 11, fontWeight: 700 }}>50+ Years of Care Wisdom</span>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: C.textMuted }}>Decades of care expertise from Kings Home's most experienced staff — always available, always attributed.</p>
        </div>

        {/* Veteran profiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          {veterans.map(v => (
            <div key={v.id} style={{ background: C.surface, borderRadius: 14, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${v.color}15`, border: `2px solid ${v.color}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 16, fontWeight: 700, color: v.color }}>{v.avatar}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{v.years} years</div>
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 4 }}>{v.contributions} tips shared</div>
            </div>
          ))}
        </div>

        {/* Search/Ask */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.bg, borderRadius: 10, padding: 4, width: "fit-content" }}>
            {[{ id: "browse", label: "Browse" }, { id: "ask", label: "Ask a Question" }].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: mode === m.id ? C.accent : "transparent", color: mode === m.id ? "#fff" : C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === "ask" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Ask anything... e.g. 'How do I handle a youth who won't eat?'"
                  onKeyDown={e => e.key === "Enter" && askQuestion()}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, fontSize: 14, color: C.text, outline: "none" }} />
                <button onClick={askQuestion} disabled={searching || !query.trim()}
                  style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: (!query.trim() || searching) ? C.border : C.accent, color: (!query.trim() || searching) ? C.textMuted : "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  {searching ? "Searching..." : "Ask"}
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
                  style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${voice.isRecording ? C.danger : C.borderLight}`, background: voice.isRecording ? "rgba(197,48,48,0.08)" : C.surface, color: voice.isRecording ? C.danger : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: voice.isRecording ? C.danger : C.textMuted, animation: voice.isRecording ? "pulse 1s infinite" : "none" }} />
                  {voice.isRecording ? `Recording... ${voice.recordingTime}s` : "Or ask by voice"}
                </button>
                {voice.transcript && !query && (
                  <button onClick={() => setQuery(voice.transcript)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Use transcript
                  </button>
                )}
              </div>
              {voice.transcript && <div style={{ marginTop: 8, fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>"{voice.transcript}"</div>}
            </div>
          )}

          {mode === "browse" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button onClick={() => setSelectedTag(null)}
                style={{ padding: "5px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${!selectedTag ? C.accent : C.borderLight}`, background: !selectedTag ? C.accentLight : C.surface, color: !selectedTag ? C.accent : C.textMuted }}>
                All ({knowledgeEntries.length})
              </button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  style={{ padding: "5px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${selectedTag === tag ? C.accent : C.borderLight}`, background: selectedTag === tag ? C.accentLight : C.surface, color: selectedTag === tag ? C.accent : C.textMuted }}>
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI search result */}
        {searchResults && (
          <div ref={resultRef} style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.accent}`, padding: 24, marginBottom: 24, boxShadow: `0 0 0 3px ${C.accentLight}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>AI Answer — sourced from veteran knowledge</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, marginBottom: 16 }}>{searchResults.answer}</div>
            {searchResults.sources?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {searchResults.sources.map((s, i) => (
                  <div key={i} style={{ padding: "8px 14px", borderRadius: 10, background: C.bg, border: `1px solid ${C.borderLight}`, fontSize: 12 }}>
                    <strong style={{ color: C.text }}>{s.name}</strong>
                    <span style={{ color: C.textMuted }}> — {s.role} ({s.years} yrs)</span>
                  </div>
                ))}
              </div>
            )}
            {searchResults.follow_up && (
              <button onClick={() => setQuery(searchResults.follow_up)}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.borderLight}`, background: C.bg, color: C.textMuted, fontSize: 12, cursor: "pointer" }}>
                Follow up: {searchResults.follow_up}
              </button>
            )}
          </div>
        )}

        {/* Knowledge entries */}
        {mode === "browse" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredEntries.map(entry => {
              const vet = veterans.find(v => v.id === entry.veteran);
              return (
                <div key={entry.id} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${vet?.color}15`, border: `2px solid ${vet?.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: vet?.color, flexShrink: 0 }}>{vet?.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{vet?.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{vet?.role} — {vet?.years} years</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: C.gold, fontSize: 12, fontWeight: 600 }}>
                      <span style={{ color: C.gold }}>&#9733;</span> {entry.upvotes}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{entry.question}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{entry.answer}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                    {entry.tags.map(tag => (
                      <span key={tag} onClick={() => setSelectedTag(tag)}
                        style={{ padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: C.bg, color: C.textMuted, cursor: "pointer", border: `1px solid ${C.borderLight}` }}>
                        {tag}
                      </span>
                    ))}
                    {entry.verified && (
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: "rgba(34,197,94,0.08)", color: C.green, border: `1px solid rgba(34,197,94,0.2)` }}>{"\u2713"} Verified</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
