# RHONDA — api/

## What lives here
`chat.js` — thin Anthropic API proxy. Receives the full request body from the frontend and forwards it to Anthropic. Returns the response as-is.

## Why it exists
Keeps `ANTHROPIC_API_KEY` server-side. The frontend never touches the key directly.

## Rules
- Do not add logic here. Tile context, system prompts, and message history are all assembled in `src/App.jsx` before the request arrives.
- This file should stay ~18 lines. If you're adding logic here, you're in the wrong file.
- Future: when RHONDA→LEO pipeline is built, a second route (`/api/leo-update`) will live here for pushing parsed data to LEO's KV store.
