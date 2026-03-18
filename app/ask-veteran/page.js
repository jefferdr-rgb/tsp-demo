"use client";
import { useState, useEffect, useRef } from "react";
import { useVoiceInput } from "../_lib/useVoiceInput";

const C = {
  bg: "#f4f1ea", surface: "#ffffff", chrome: "#2c3528", gold: "#c49b2a",
  goldLight: "rgba(196,155,42,0.12)", goldGlow: "rgba(196,155,42,0.25)",
  forest: "#2c3528", green: "#4a6540", border: "#d6d1c4", borderLight: "#e8e3d9",
  text: "#2c3528", textMuted: "#7a7462", danger: "#c0392b",
};

// Demo veteran knowledge base — attributed tribal wisdom
const VETERANS = [
  { id: "jim", name: "Jim Rivera", role: "Senior Operator — Line A", years: 22, avatar: "JR", color: "#8E6B3E", contributions: 14 },
  { id: "mary", name: "Mary Chen", role: "QA Lead", years: 18, avatar: "MC", color: "#4a6540", contributions: 9 },
  { id: "carlos", name: "Carlos Vega", role: "Maintenance Lead", years: 15, avatar: "CV", color: "#6495ED", contributions: 11 },
  { id: "diane", name: "Diane Atkins", role: "Safety Coordinator", years: 20, avatar: "DA", color: "#8E44AD", contributions: 7 },
];

const KNOWLEDGE_ENTRIES = [
  {
    id: 1, veteran: "jim", question: "Why does the extruder jam during winter?",
    answer: "The moisture content in the raw mix drops below 12% when the warehouse is cold. The auger can't push dry mix through. I always check the moisture meter first thing in the morning November through February. If it's under 12%, I add 2-3% water to the mix before we start. Took me 5 years to figure that out.",
    tags: ["extruder", "winter", "moisture", "troubleshooting"], upvotes: 23, verified: true,
  },
  {
    id: 2, veteran: "mary", question: "How do you spot bad kibble before the lab catches it?",
    answer: "Color tells you everything. Good kibble is uniform brown — no dark spots, no pale patches. If you see a greenish tint, that's a fat oxidation problem and the batch is going bad. Also smell it. Fresh kibble smells slightly nutty. If it smells sour or like old oil, pull it. The lab takes 20 minutes. Your nose takes 2 seconds.",
    tags: ["quality", "kibble", "visual-inspection", "smell-test"], upvotes: 31, verified: true,
  },
  {
    id: 3, veteran: "carlos", question: "What's the trick to the packaging sealer when it starts rejecting?",
    answer: "90% of the time it's not the sealer — it's the film tension. Everyone calls maintenance but all you need to do is check the tension roller on the left side. There's a small Allen bolt. Quarter turn clockwise usually fixes it. If that doesn't work, check if the film roll is loaded off-center. I've saved probably 200 hours of downtime with that one trick.",
    tags: ["packaging", "sealer", "film-tension", "quick-fix"], upvotes: 45, verified: true,
  },
  {
    id: 4, veteran: "diane", question: "What's the most commonly missed safety check?",
    answer: "The chemical storage secondary containment. People check the labels, check the SDS sheets, but nobody looks at the drip pans under the containers. If a drip pan is full of residue, that means something leaked and nobody noticed. That's a real OSHA citation waiting to happen. I walk chemical storage every Monday morning and check every single drip pan.",
    tags: ["safety", "chemical-storage", "OSHA", "inspection"], upvotes: 18, verified: true,
  },
  {
    id: 5, veteran: "jim", question: "How do you get the extruder to make consistent kibble size?",
    answer: "Die pressure is the secret. The manual says 38-42 PSI but that's for new dies. After about 3 months the dies wear and you need to bump it to 44-46 PSI to get the same size. Nobody tells you that. Also, the first 15 minutes of each run always makes oversized kibble because the die is cold. We used to waste that but now I run the first batch through the reclaim hopper.",
    tags: ["extruder", "die-pressure", "kibble-size", "efficiency"], upvotes: 27, verified: true,
  },
  {
    id: 6, veteran: "carlos", question: "What maintenance task saves the most money?",
    answer: "Greasing the conveyor bearings every 500 hours instead of every 1,000 like the manual says. We went through 6 bearing failures in one year before I figured this out. Each failure was $3,000 in parts and 2 hours of downtime during production. Now we haven't replaced a bearing in 3 years. The extra grease costs maybe $200 a year.",
    tags: ["conveyor", "bearings", "preventive-maintenance", "cost-savings"], upvotes: 38, verified: true,
  },
];

export default function AskVeteranPage() {
  const voice = useVoiceInput({ lang: "en-US" });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState("browse"); // browse | ask
  const [selectedTag, setSelectedTag] = useState(null);
  const resultRef = useRef(null);
  const [veterans, setVeterans] = useState(VETERANS);
  const [knowledgeEntries, setKnowledgeEntries] = useState(KNOWLEDGE_ENTRIES);

  useEffect(() => {
    Promise.all([
      fetch("/api/data?table=veteran_knowledge&order=upvotes&asc=false").then(r => r.json()),
      fetch("/api/data?table=workers&order=name&asc=true").then(r => r.json()),
    ])
      .then(([vkData, wData]) => {
        if (vkData.source === "demo" || !vkData.data?.length) return;
        const workerMap = {};
        (wData.data || []).forEach(w => { workerMap[w.id] = w; });

        // Build veterans list from workers who contributed knowledge
        const vetIds = [...new Set(vkData.data.map(e => e.veteran_id))];
        const liveVets = vetIds.map(id => {
          const w = workerMap[id];
          if (!w) return null;
          const contribs = vkData.data.filter(e => e.veteran_id === id).length;
          return {
            id: w.id,
            name: w.name,
            role: `${w.role} — ${w.department}`,
            years: w.years_experience || 0,
            avatar: w.avatar_initials || w.name.split(" ").map(n => n[0]).join(""),
            color: w.avatar_color || "#8E6B3E",
            contributions: contribs,
          };
        }).filter(Boolean);
        if (liveVets.length) setVeterans(liveVets);

        const liveEntries = vkData.data.map((e, i) => ({
          id: e.id || i,
          veteran: e.veteran_id,
          question: e.question,
          answer: e.answer,
          tags: e.tags || [],
          upvotes: e.upvotes || 0,
          verified: e.is_verified ?? true,
        }));
        setKnowledgeEntries(liveEntries);
      })
      .catch(() => {});
  }, []);

  const allTags = [...new Set(knowledgeEntries.flatMap(e => e.tags))].sort();

  const filteredEntries = selectedTag
    ? knowledgeEntries.filter(e => e.tags.includes(selectedTag))
    : knowledgeEntries;

  const searchText = mode === "ask" ? voice.transcript : query;

  const askQuestion = async () => {
    if (!searchText.trim()) return;
    setSearching(true);
    setSearchResults(null);

    try {
      const res = await fetch("/api/rhonda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: `You are RHONDA's "Ask the Veteran" system. You have access to tribal knowledge contributed by experienced workers at Sunshine Mills pet food factory.

Here is the knowledge base:
${knowledgeEntries.map(e => {
  const vet = veterans.find(v => v.id === e.veteran);
  return `---\nExpert: ${vet?.name} (${vet?.role}, ${vet?.years} years)\nQ: ${e.question}\nA: ${e.answer}\nTags: ${e.tags.join(", ")}\n`;
}).join("\n")}

When answering:
1. Search the knowledge base for relevant entries
2. Attribute answers to the specific veteran who shared the knowledge
3. If multiple veterans have relevant knowledge, combine their insights
4. If no veteran knowledge is directly relevant, say so and provide your best general guidance
5. Always credit the source: "According to [Name] ([years] years experience)..."

RESPOND WITH VALID JSON:
{
  "answer": "Your synthesized answer with veteran attribution",
  "sources": [{"name": "Veteran Name", "role": "Their Role", "years": N, "relevance": "Why their knowledge applies"}],
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "related_tags": ["relevant", "tags"],
  "follow_up": "A suggested follow-up question"
}`,
          messages: [{ role: "user", content: searchText.trim() }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const rawText = data.content?.map(b => b.text).join("") || "";
      const jsonStr = rawText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      setSearchResults(JSON.parse(jsonStr));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch {
      setSearchResults({ answer: "Sorry, I couldn't search the knowledge base right now. Try browsing the entries below.", sources: [], confidence: "LOW", related_tags: [], follow_up: null });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: C.chrome, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.chrome }}>R</span>
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>RHONDA</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Ask the Veteran</div>
          </div>
        </div>
        <a href="/sunshine" style={{ color: C.gold, fontSize: 12, textDecoration: "none" }}>Back to RHONDA</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.forest, margin: 0 }}>Ask the Veteran</h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>Decades of expertise from your most experienced workers — always available, always attributed.</p>
        </div>

        {/* Veteran profiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {veterans.map(v => (
            <div key={v.id} style={{
              background: C.surface, borderRadius: 14, padding: "16px 12px", textAlign: "center",
              border: `1px solid ${C.borderLight}`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: `${v.color}15`,
                border: `2px solid ${v.color}40`, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px", fontSize: 16, fontWeight: 700, color: v.color,
              }}>
                {v.avatar}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{v.years} years</div>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, marginTop: 4 }}>{v.contributions} tips shared</div>
            </div>
          ))}
        </div>

        {/* Search/Ask */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.bg, borderRadius: 10, padding: 4, width: "fit-content" }}>
            {[{ id: "browse", label: "Browse" }, { id: "ask", label: "Ask a Question" }].map(m => (
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

          {mode === "ask" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Type your question... e.g. 'Why does the extruder jam?'"
                  onKeyDown={e => e.key === "Enter" && askQuestion()}
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.borderLight}`,
                    background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", outline: "none",
                  }}
                />
                <button onClick={askQuestion} disabled={searching || !query.trim()}
                  style={{
                    padding: "12px 24px", borderRadius: 10, border: "none",
                    background: (!query.trim() || searching) ? C.border : C.gold,
                    color: (!query.trim() || searching) ? C.textMuted : "#fff",
                    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {searching ? "Searching..." : "Ask"}
                </button>
              </div>

              {/* Voice option */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: `1px solid ${voice.isRecording ? C.danger : C.borderLight}`,
                    background: voice.isRecording ? "rgba(192,57,43,0.08)" : C.surface,
                    color: voice.isRecording ? C.danger : C.textMuted,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: voice.isRecording ? C.danger : C.textMuted, animation: voice.isRecording ? "pulse 1s infinite" : "none" }} />
                  {voice.isRecording ? `Recording... ${voice.recordingTime}s` : "Or ask by voice"}
                </button>
                {voice.transcript && !query && (
                  <button onClick={() => { setQuery(voice.transcript); }}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.gold}`, background: C.goldLight, color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
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
                style={{
                  padding: "5px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${!selectedTag ? C.gold : C.borderLight}`,
                  background: !selectedTag ? C.goldLight : C.surface,
                  color: !selectedTag ? C.gold : C.textMuted,
                }}>
                All ({knowledgeEntries.length})
              </button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  style={{
                    padding: "5px 12px", borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${selectedTag === tag ? C.gold : C.borderLight}`,
                    background: selectedTag === tag ? C.goldLight : C.surface,
                    color: selectedTag === tag ? C.gold : C.textMuted,
                  }}>
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI search result */}
        {searchResults && (
          <div ref={resultRef} style={{
            background: C.surface, borderRadius: 16, border: `1px solid ${C.gold}`,
            padding: 24, marginBottom: 24, boxShadow: `0 0 0 3px ${C.goldGlow}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              AI Answer — sourced from veteran knowledge
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, marginBottom: 16 }}>{searchResults.answer}</div>

            {searchResults.sources?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {searchResults.sources.map((s, i) => (
                  <div key={i} style={{
                    padding: "8px 14px", borderRadius: 10, background: C.bg, border: `1px solid ${C.borderLight}`,
                    fontSize: 12,
                  }}>
                    <strong style={{ color: C.forest }}>{s.name}</strong>
                    <span style={{ color: C.textMuted }}> — {s.role} ({s.years} yrs)</span>
                  </div>
                ))}
              </div>
            )}

            {searchResults.follow_up && (
              <button onClick={() => { setQuery(searchResults.follow_up); }}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.borderLight}`,
                  background: C.bg, color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>
                Follow up: {searchResults.follow_up}
              </button>
            )}
          </div>
        )}

        {/* Knowledge entries */}
        {mode === "browse" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredEntries.map(entry => {
              const vet = VETERANS.find(v => v.id === entry.veteran);
              return (
                <div key={entry.id} style={{
                  background: C.surface, borderRadius: 14, border: `1px solid ${C.borderLight}`, padding: "20px 22px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: `${vet?.color}15`,
                      border: `2px solid ${vet?.color}40`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: vet?.color, flexShrink: 0,
                    }}>
                      {vet?.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.forest }}>{vet?.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{vet?.role} — {vet?.years} years</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: C.gold, fontSize: 12, fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={C.gold}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {entry.upvotes}
                    </div>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{entry.question}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{entry.answer}</div>

                  <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                    {entry.tags.map(tag => (
                      <span key={tag} onClick={() => setSelectedTag(tag)}
                        style={{
                          padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                          background: C.bg, color: C.textMuted, cursor: "pointer",
                          border: `1px solid ${C.borderLight}`,
                        }}>
                        {tag}
                      </span>
                    ))}
                    {entry.verified && (
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: "rgba(74,101,64,0.08)", color: C.green, border: `1px solid rgba(74,101,64,0.2)` }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
