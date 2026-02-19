# Shayari Web Experience MVP

This folder contains a runnable MVP for turning **Shayari (NHE-01)** into a web-based, voice-capable experience.

## What this MVP includes

- Browser chat UI with persistent on-page conversation state.
- Voice input (Web Speech API, browser dependent).
- Voice output (Speech Synthesis API).
- Animated avatar orb state changes while listening/speaking.
- Node server + Gemini API integration for responses.
- Safety / identity disclosure system prompt.

## Run locally

```bash
cd apps/shayari-web
export GEMINI_API_KEY="your_api_key"
export GEMINI_MODEL="gemini-1.5-flash" # optional
node server.js
```

Then open: `http://localhost:8787`

## Production notes

- Put this behind a reverse proxy (Nginx / Cloudflare / Vercel Edge function equivalent).
- Store your API key only server-side.
- Add authentication + rate limits before public launch.
- Add moderation layer for user input and model output.

## Suggested next upgrades

1. Replace static orb with a full avatar (Live2D, Ready Player Me, or custom rig).
2. Add low-latency streaming text + TTS for natural conversation feel.
3. Add memory service (Redis/Postgres/vector DB) for returning users.
4. Add consent banner + privacy policy acknowledgement.
<<<<<<< codex/create-interactive-web-experience-for-shayari-tctk0q

## Complete testing walkthrough

If you want full beginner-friendly setup + testing steps (including where to run commands and troubleshooting), use:

- `apps/shayari-web/TESTING_GUIDE.md`

=======
>>>>>>> main
