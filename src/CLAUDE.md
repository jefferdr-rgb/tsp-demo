# src/ — RHONDA Frontend

## What this is

Single-file React/Vite SPA. `App.jsx` is the entire frontend — all tiles, all state, all UI. `main.jsx` is the entry point only (do not touch).

## Architecture

One file by design. RHONDA is a demo product. Splitting into components adds complexity with no benefit at this stage. Keep it single-file until there is a concrete reason to split.

## Token rules — locked, do not change without explicit instruction

| Rule | Value | Why |
|------|-------|-----|
| Model | `claude-haiku-4-5-20251001` | ~80% cheaper than Sonnet, sufficient for staff tasks |
| max_tokens | 700 | Prevents runaway responses |
| History sent | Last 4 messages only (`HISTORY_LIMIT = 4`) | Controls cost per call |
| File truncation | None (removed) | Truncated context = wrong answers = costs more than tokens saved |
| System prompts | Short and direct | Every token in the prompt costs |

**Never switch to Sonnet without explicit approval.** Never increase max_tokens above 700 without explicit approval.

## Six tiles

| Tile ID | Label | Color | Purpose |
|---------|-------|-------|---------|
| `email` | Email | Gold `#c49b2a` | Draft, read, send emails |
| `data` | Sheets | Green `#4a6540` | Organize spreadsheets and job data |
| `docs` | Drive | Blue `#6495ED` | Find and summarize documents |
| `calendar` | Calendar | Yellow `#E8C96A` | Manage events and scheduling |
| `customers` | Customers | Muted green | Handle customer questions |
| `rhonda` | Ask RHONDA | Gold | General questions — anything |

## File parsing — libraries in use

| Format | Library | Notes |
|--------|---------|-------|
| .docx | mammoth | |
| .xlsx / .xls | xlsx-js-style | NOT plain `xlsx` — styled export required |
| .pptx | jszip | Manual XML extraction |
| .pdf | pdfjs-dist | |

**Do not swap xlsx-js-style for xlsx.** The export feature requires bold headers, alternating rows, borders, and auto-filter. Plain `xlsx` cannot produce this.

## Export (Sheets tile)

Styled `.xlsx` export via `xlsx-js-style`. Bold header row, alternating row fills, borders on all cells, auto-filter on headers. This is a locked design — do not simplify.

## Drag-and-drop

Supported on both the dashboard tile cards and inside the chat window. Both drop zones must remain functional after any UI changes.

## Design system

All colors live in the `T` object at the top of `App.jsx`. Never hardcode hex values elsewhere.

| Token | Value | Use |
|-------|-------|-----|
| `T.bg` | `#f4f1ea` | Page background |
| `T.gold` | `#c49b2a` | Primary accent, CTAs |
| `T.green` | `#4a6540` | Sheets tile |
| `T.text` | `#2c3528` | Body text (dark forest green — not black) |
| `T.border` | `#d6d1c4` | All borders |
| `T.red` | `#C53030` | Errors and alerts |

## API calls

All Claude API calls go through `/api/chat` (Vercel serverless function). Never call `api.anthropic.com` directly from the frontend — the API key is server-side only.

## What's NOT built yet (do not attempt without instruction)

- Auth (Google/Microsoft OAuth) — Phase 2
- Real file integrations (Drive, Gmail) — Phase 4
- Standing Orders (scheduled AI tasks) — Phase 3a — next feature
- Company-wide context layer (conductor model) — future

## Deployment

Push to `main` → Vercel auto-deploys → live at demo.treestandpartners.com within ~60 seconds.
`git user.email` must be `jefferdr@gmail.com` for Vercel to recognize the push.
