# OwlEats demo

OwlEats is a personalized, automated text and web notification system for Rice Dining. This repository currently contains the concept demo for a personalized menu preview and SMS experience. The app attempts a server-side scrape of the configured Rice Dining source once per hour and falls back to synthetic menu data when the source is blocked or has no structured menu payload. It does not send texts or authenticate users yet.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This is a standard Next.js app, so no special Vercel adapter is required:

1. Create a GitHub repository and push this folder.
2. Import the repository in Vercel.
3. Keep the detected framework as **Next.js** and deploy with the default build settings.
4. Add environment variables only when real integrations are introduced.

## Recommended build sequence

1. Validate the demo flow with students and Housing & Dining stakeholders.
2. Confirm Rice Dining's current menu feed and set `RICE_DINING_SOURCE_URL` if it differs from the public homepage.
3. Add authentication and preference persistence.
4. Add Twilio behind a server-side API route with opt-in, unsubscribe, rate limiting, and delivery logs.
5. Add an admin event calendar and scheduled jobs.
6. Add analytics and pilot reporting.

## Menu source

The `/api/menu` route fetches `RICE_DINING_SOURCE_URL` (default: `https://dining.rice.edu/`) from the server, never from the browser. It expects a JSON script payload containing menu rows with `meal`, `servery`/`location`, and `menu`/`items` fields. The route returns `live: false` and demo data with a warning when Rice blocks the request or the response format changes.

For local testing with an approved feed:

```bash
$env:RICE_DINING_SOURCE_URL="https://approved-menu-feed.example/api"
npm run dev
```
