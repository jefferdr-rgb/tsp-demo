# RHONDA — Current State
*Last updated: 2026-03-14*

## What's Built and Working

### Core Product
- **React + Vite SPA** — single file `src/App.jsx`, deployed on Vercel, auto-deploys on push to main
- **Live URL:** `https://demo.treestandpartners.com`
- **API proxy:** `api/chat.js` serverless function — API key is server-side only, never exposed to browser
- **Model:** `claude-haiku-4-5-20251001` — max_tokens: 700, history: last 4 messages only (`HISTORY_LIMIT = 4`)

### Six Dashboard Tiles (all working)
| Tile | ID | Color | Purpose |
|------|----|-------|---------|
| Email | `email` | Gold | Draft, read, send emails |
| Sheets | `data` | Green | Organize data, export to xlsx |
| Drive | `docs` | Blue | Summarize documents |
| Calendar | `calendar` | Light gold | Manage events and scheduling |
| Customers | `customers` | Muted | Customer responses |
| Ask RHONDA | `rhonda` | Gold | General AI assistant |

### File Handling (all working)
- **docx** — mammoth (raw text extraction)
- **xlsx / xls** — xlsx-js-style (parse + styled export)
- **pptx** — jszip (slide text extraction)
- **pdf** — pdfjs-dist (page-by-page text)
- **Truncation:** 3,000 chars max before sending to Claude
- **Drag-and-drop:** supported on dashboard tiles AND inside chat window

### Sheets Export (working)
- Library: `xlsx-js-style` (NOT `xlsx` — do not swap)
- Styled output: bold header row, alternating row colors, borders, auto-filter
- Auto-detects markdown tables and CSV in Claude response
- Export triggers: "Copy as TSV" or "Download .xlsx" buttons in chat

### Design System
- **Palette:** `T.*` object at top of App.jsx — TSP cream/green/gold
- Key colors: bg `#f4f1ea`, green `#2c3528`, gold `#c49b2a`
- All colors reference `T.*` — never hardcode hex values

### Token Optimization (always apply)
- Model: haiku (not Sonnet — ~80% cheaper)
- max_tokens: 700
- History: last 4 messages only
- File truncation: 3,000 chars
- System prompts: short and direct

## What's In Progress / Partially Built
- **Auth (Clerk)** — installed in the stack, not yet enforced. Users can access without login.
- **Nango data connections** — configured, not yet wired to live client data

## What's NOT Built Yet
- **RHONDA → LEO data pipeline** — xlsx drag-drop → Claude parses intent → POST to `/api/leo/update` → KV write → LEO dashboard reads live data. Architecture fully designed. Build after Clerk auth confirmed.
- **Standing Orders** — scheduled automation (Vercel Cron + KV + Resend). Designed in RHONDA_Architecture.md. Not started.
- **Google OAuth / Microsoft OAuth** — Phase 2. Not started.
- **Per-client branding** — currently generic "Your Company." Each client needs their own Vercel deployment with env vars.
- **Playwright E2E tests** — not written yet

## Known Issues / Watch Points
- **`pitch.html`** in `public/` — static marketing/pitch page served at `demo.treestandpartners.com/pitch.html`
- **File truncation is aggressive** — 3,000 chars is intentional for token cost but may miss content in large files. Don't raise this limit without re-evaluating token costs.
- **HISTORY_LIMIT = 4** — intentional cost control. Raising it increases cost per message significantly.
- **Sheets tile** uses tool_use (function calling) for structured JSON output — different API path than other tiles. Don't break this pattern.

## Key Files
| File | Purpose |
|------|---------|
| `src/App.jsx` | Entire RHONDA UI + all tile logic — single file by design |
| `api/chat.js` | Serverless API proxy to Anthropic — keep key server-side |
| `public/pitch.html` | Static pitch/marketing page |
| `vite.config.js` | Vite build config |
| `RHONDA_Architecture.md` | Full system design, roadmap, agent library |

## Deployment
```bash
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys in ~90 seconds
# git user.email must be jefferdr@gmail.com for auto-deploy to trigger
```

## Environment Variables Required
- `ANTHROPIC_API_KEY` — server-side only, never use `VITE_` prefix
- Clerk keys (when auth is enforced)
- Nango keys (when data connections go live)
