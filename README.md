# Render Pinger

A standalone Node.js service designed to be deployed on Vercel to keep Render free-tier services alive by pinging them at regular intervals.

## Features
- Supports multiple URLs via `RENDER_URLS` environment variable (comma-separated).
- Rotates User-Agents to avoid bot detection.
- Fast and lightweight (serverless).

## Setup
1. Deploy to Vercel.
2. Add environment variable `RENDER_URLS`.
3. Set up a cron job (using cron-job.org) to hit `/api/ping` every 10-14 minutes.
