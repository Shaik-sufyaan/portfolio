# Portfolio — Shaik Sufyaan

Personal portfolio site built with Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4, and shadcn/ui components.

## Run locally

Requires Node.js 18+ and [pnpm](https://pnpm.io) (`npm i -g pnpm`).

```bash
pnpm install   # download dependencies
pnpm dev       # start dev server at http://localhost:3000
```

Production build:

```bash
pnpm build     # create optimized production build
pnpm start     # serve the production build
```

## Deploy to Vercel

Option 1 — GitHub (recommended):

1. Push this repo to GitHub (already at `Shaik-sufyaan/portfolio`).
2. Go to [vercel.com/new](https://vercel.com/new), import the repository.
3. Vercel auto-detects Next.js and pnpm — no settings needed. Click **Deploy**.

Every push to `main` will then auto-deploy.

Option 2 — Vercel CLI:

```bash
npm i -g vercel
vercel         # preview deploy
vercel --prod  # production deploy
```
