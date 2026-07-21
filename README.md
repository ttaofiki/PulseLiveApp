# PulseLive

A lightweight live audience polling and Q&A app. A presenter creates a poll or Q&A session, the audience joins from their phones by scanning a QR code — no login required — and results update on screen in real time as responses come in.

## Features

- **Dashboard** — all polls as cards with status (Draft/Live/Closed) and response counts
- **Create poll** — Multiple Choice (2–6 options) or Q&A
- **Poll management** — QR code + shareable link, open/close voting, live results, reset results
- **Present view** — full-screen, high-contrast projector view with live results and a QR code in the corner
- **Audience vote page** — mobile-first, no account needed; tap to vote or submit/upvote questions
- **Real-time everywhere** — votes, questions, upvotes, and poll status changes update instantly on every connected screen via Supabase Realtime

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [React Router](https://reactrouter.com/) for navigation
- [Supabase](https://supabase.com/) (Postgres + Realtime) as the backend
- [qrcode.react](https://github.com/zpao/qrcode.react) for QR code generation

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. To test the audience vote page from a phone on the same network, run `npm run dev -- --host` and use your machine's LAN address instead of `localhost` when scanning the QR code.

### Environment variables

Create a `.env` file in the project root (see `.env.example`):

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Both are read from your Supabase project's API settings. Neither is committed to the repo.

### Database schema

The app expects these tables to already exist in Supabase (it does not create or migrate them):

```
polls(id, title, question, type['choice'|'qa'], status['draft'|'live'|'closed'], created_at)
options(id, poll_id, option_text, display_order)
votes(id, poll_id, option_id, created_at)
questions(id, poll_id, question_text, upvotes, created_at)
```

Realtime must be enabled on these tables in Supabase (**Database → Replication**) for live updates to work across screens.

## Deployment

Deployed on [Vercel](https://vercel.com/), connected to this GitHub repo for automatic deploys on push to `main`.

- `vercel.json` adds a SPA rewrite so client-side routes (`/vote/:id`, `/poll/:id`, etc.) work on direct load and refresh.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be set as environment variables in the Vercel project settings — Vite bakes them into the build at build time, so adding or changing them requires a new deployment to take effect.

## Project structure

```
src/
  components/   Reusable UI: BarChart, QuestionList, QrCodeBlock, StatusBadge, Header
  hooks/        Supabase data hooks with built-in Realtime subscriptions
  lib/          Supabase client
  pages/        Dashboard, CreatePoll, PollManagement, Present, Vote
  types.ts      Shared types matching the database schema
```

## Constraints

- No presenter login or accounts — poll management is open to anyone with the link
- No AI/chatbot features, no email, payments, or file uploads
- "Already voted" / "already upvoted" is tracked per-browser via `localStorage`, not server-enforced
