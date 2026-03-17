# Observable Agent Steps

## What
Replace RHONDA's blank 3-dot spinner with animated status steps that show what she's doing in real-time. Each task type gets its own step sequence. Steps progress on timers calibrated to actual response times. Builds user trust — Manus proved this pattern works.

## How
- Add `STEP_SEQUENCES` map — keyed by task ID (`email`, `data`, `docs`, `teach`, `rhonda`, `customers`, `calendar`), each an array of `{ label, delay }` objects
- Add `agentStep` state (string) alongside existing `loading` state
- On `setLoading(true)`: start a step timer chain that walks through the sequence, updating `agentStep` at each delay
- On `setLoading(false)`: flash final "Done" step briefly, then clear
- Replace the 3-dot bounce div (lines 941-950) with a status step component: RHONDA icon + animated text + subtle pulse
- Add a CSS fade transition between steps (opacity + translateY)
- Also replace SOP generating spinner (lines 970-976) with its own step sequence
- All changes in `RhondaShell.jsx` — no new files, no API changes

## Edges
- Response arrives before all steps shown → skip to "Done" immediately
- Response arrives very fast (<500ms) → show at least first step briefly
- File parsing already has its own "Reading file..." state — don't conflict
- Step text must be short (max ~30 chars) to fit mobile
- SOP generation is slower (~10-15s) — needs more steps with longer delays

## Done when
- [ ] Every task type shows its own step sequence instead of dots
- [ ] Steps animate smoothly (fade in/out, no flicker)
- [ ] Fast responses still feel natural (no jarring skip)
- [ ] SOP generation shows step progress
- [ ] No regressions — error states, file parsing, gating still work
