# Shayari Web Experience - Start to Finish Testing Guide

This guide is for first-time setup. It explains exactly **where** to run commands and **how** to verify each feature.

---

## 1) Prerequisites (install these first)

1. **Git** (to clone/open repo).
2. **Node.js 18+** (Node 20 LTS recommended).
   - Check with:
     ```bash
     node -v
     ```
3. **A Gemini API key** (from Google AI Studio / your Gemini setup).
4. A modern browser (Chrome/Edge recommended for voice input support).

---

## 2) Open terminal in the correct folder

You must run commands from inside this repository.

If you already have the repo:

```bash
cd /workspace/nhe-01-project-shayari
```

If you cloned elsewhere, `cd` to that repo path instead.

Verify you're in the right place:

```bash
pwd
```

You should see a path ending with `nhe-01-project-shayari`.

---

## 3) Go to the web app folder

From repo root:

```bash
cd apps/shayari-web
```

Verify files exist:

```bash
ls
```

You should see: `server.js`, `README.md`, `TESTING_GUIDE.md`, `public/`.

---

## 4) Set environment variable (required for chat replies)

### macOS / Linux (bash/zsh)

```bash
export GEMINI_API_KEY="paste_your_real_key_here"
export GEMINI_MODEL="gemini-1.5-flash"
```

### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="paste_your_real_key_here"
$env:GEMINI_MODEL="gemini-1.5-flash"
```

### Windows CMD

```cmd
set GEMINI_API_KEY=paste_your_real_key_here
set GEMINI_MODEL=gemini-1.5-flash
```

> `GEMINI_MODEL` is optional. If omitted, default is `gemini-1.5-flash`.

---

## 5) Start server

From `apps/shayari-web`:

```bash
node server.js
```

Expected terminal output:

```text
Shayari web server running on http://localhost:8787
```

Keep this terminal running.

---

## 6) Open app in browser

Open:

```text
http://localhost:8787
```

Expected UI:
- Avatar orb panel.
- Disclosure text.
- Chat message area.
- Input + Send button.
- `🎙️ Listen` and `🔊 Speak replies` buttons.

---

## 7) Test checklist (full)

## A. Health endpoint test

Open a **second terminal** (leave server terminal running), then:

```bash
curl -s http://localhost:8787/health
```

Expected response:

```json
{"ok":true,"model":"gemini-1.5-flash"}
```

(If you set another model, it may show that model name.)

## B. Text chat test

In browser chat box:
1. Type: `Hi Shayari, introduce yourself in 2 lines.`
2. Click **Send**.
3. Confirm:
   - Your bubble appears on the right.
   - Shayari reply appears on the left.

## C. Voice output (text-to-speech) test

1. Ensure button shows `🔊 Speak replies` (not muted).
2. Send a chat message.
3. Confirm voice playback starts for reply.

If not audible:
- Check browser tab is not muted.
- Check OS output device volume.

## D. Voice input (speech recognition) test

1. Click **🎙️ Listen**.
2. Allow microphone permission if prompted.
3. Say a short line clearly.
4. Confirm spoken text gets sent and a reply appears.

If you see "Voice input is not supported", use Chrome/Edge.

## E. Error handling test (missing API key)

1. Stop server (`Ctrl + C`).
2. Unset key:

macOS/Linux:
```bash
unset GEMINI_API_KEY
```

PowerShell:
```powershell
Remove-Item Env:GEMINI_API_KEY
```

CMD:
```cmd
set GEMINI_API_KEY=
```

3. Restart server with `node server.js`.
4. Send message in browser.
5. Expected: assistant shows connection/config error (backend returns key-missing error).

---

## 8) Common issues and fixes

- **`node: command not found`**
  - Install Node.js 18+ and reopen terminal.

- **Server starts, but browser blank/404**
  - Ensure you ran command from `apps/shayari-web`.

- **`Gemini API error`**
  - Key invalid / quota exceeded / model access issue.
  - Recheck key and model value.

- **Microphone not working**
  - Grant browser mic permission.
  - Test on Chrome/Edge.

- **Port already in use (8787)**
  - Stop conflicting process or run with another port:
    ```bash
    PORT=8790 node server.js
    ```
  - Then open `http://localhost:8790`.

---

## 9) Quick smoke test commands (copy/paste)

From `apps/shayari-web`:

```bash
node --check server.js
node --check public/app.js
export GEMINI_API_KEY="paste_key"
node server.js
```

In second terminal:

```bash
curl -s http://localhost:8787/health
```

---

## 10) When you're done

In server terminal, press:

```text
Ctrl + C
```

That stops the app.
