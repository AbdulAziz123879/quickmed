# QuickMed Backend

A tiny Express server that proxies the AI prescription reader to Anthropic's API.
The frontend never sees or holds the API key — only this server does.

## Why this exists

The React app calls `POST /api/prescription/read` on this server instead of calling
`api.anthropic.com` directly. That's required for running the app anywhere outside of
a Claude Artifact preview, since a real API key has to live on a server, not in
browser code.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and add your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at https://console.anthropic.com/settings/keys — requires an Anthropic
account with billing set up, since API usage is billed separately from a
claude.ai subscription.

## Run it

```bash
npm start
```

You should see:

```
QuickMed backend listening on http://localhost:5000
```

Check it's alive:

```bash
curl http://localhost:5000/api/health
# {"ok":true,"hasApiKey":true}
```

## API

### `POST /api/prescription/read`

Request body:
```json
{
  "base64": "<base64-encoded file bytes, no data: prefix>",
  "mediaType": "image/jpeg",
  "isPdf": false
}
```

Success response:
```json
{ "medicines": ["Paracetamol 650mg", "Metformin"] }
```

Error response:
```json
{ "error": "human readable message" }
```

## Connecting the frontend

In `App.jsx`, `API_BASE_URL` near the top of the file controls where the frontend
sends this request. By default it's set to `http://localhost:5000` for local
development. Update it to your deployed backend's URL in production, e.g.:

```js
const API_BASE_URL = "https://api.yourdomain.com";
```

If you serve the frontend and backend from the same domain (e.g. behind a single
reverse proxy), you can instead set `API_BASE_URL` to an empty string `""` and
keep the request paths relative (`/api/prescription/read`).

## Deploying

Any Node host works (Render, Railway, Fly.io, a VPS, etc.). Just make sure:
- Node 18+ (for built-in `fetch`)
- `ANTHROPIC_API_KEY` is set as an environment variable on the host
- The frontend's `API_BASE_URL` points at wherever this ends up running
- CORS is already enabled for all origins here (`cors()` with no options) — tighten
  this to your actual frontend domain before going to production.
