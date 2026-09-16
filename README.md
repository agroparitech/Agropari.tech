# Agropari

Agropari is an AI-assisted crop health management application for farmers, agronomists, and agricultural officials.

## Requirements

- Node.js 18 or later
- npm
- A Gemini API key for AI image analysis (optional; the app uses a local fallback when it is not configured)

## Install

```powershell
npm.cmd install
```

PowerShell may block `npm.ps1` because of the local execution policy. Use `npm.cmd` commands as shown above, or run the commands from Command Prompt.

## Environment variables

Create a `.env` file in the project root when external services are needed:

```env
GEMINI_API_KEY=your_gemini_api_key
KINDWISE_API_KEY=your_kindwise_api_key
PORT=3000
HOST=127.0.0.1
VITE_API_URL=
FRONTEND_URL=
```

The Gemini and Kindwise keys are optional. Set `VITE_API_URL` to the public URL of the separately hosted Express API when deploying the frontend to Cloudflare Pages. Set `FRONTEND_URL` on the API host to the Cloudflare Pages origin. Leave both empty for local development. Never commit `.env` or production secrets.

## Development

Start the Express API and Vite frontend together:

```powershell
npm.cmd run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

The API health check is available at:

```text
GET http://127.0.0.1:3000/api/health
```

## Crop analysis API

The crop analysis endpoint accepts JSON `POST` requests:

```text
POST /api/analyze-crop
Content-Type: application/json
```

Example request:

```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "cropName": "Tomato",
  "cropVariety": "Standard",
  "growthStage": "Vegetative",
  "farmerName": "Local Farmer",
  "farmerPhone": "+91 9800000000",
  "location": {
    "latitude": 20.0,
    "longitude": 73.8,
    "accuracy": 20,
    "district": "Nashik"
  }
}
```

Successful requests return HTTP `201` with `success: true` and the created `case` object. The JSON body limit is 25 MB.

## Production build

Build the frontend and Node API bundle:

```powershell
npm.cmd run build
npm.cmd start
```

Run the checks independently:

```powershell
npm.cmd run build:client
npm.cmd run build:server
npm.cmd run lint
```

## Cloudflare Pages

The frontend can be deployed to Cloudflare Pages:

```powershell
npm.cmd run build:client
npm.cmd run deploy:cloudflare
```

The project includes `wrangler.toml` with `dist` as the Pages output directory.

Cloudflare Pages hosts the Vite frontend only. The current `/api/*` routes run in the Express Node server and therefore need a separate Node-compatible host. Set `VITE_API_URL` to that API host before building Pages. If the API is temporarily unavailable, crop analysis displays a low-confidence local screening result instead of showing a network popup; API-backed persistence and AI analysis still require the API host.

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm.cmd run dev` | Start the full local Express and Vite app |
| `npm.cmd run build` | Build the frontend and Node API bundle |
| `npm.cmd run build:client` | Build the Vite frontend into `dist` |
| `npm.cmd run build:server` | Bundle the Express server as `dist/server.cjs` |
| `npm.cmd start` | Start the production Node server |
| `npm.cmd run preview` | Preview the Vite frontend build |
| `npm.cmd run lint` | Run the TypeScript checker |
| `npm.cmd run deploy:cloudflare` | Deploy `dist` to Cloudflare Pages |
