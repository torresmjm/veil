# Veil

Veil is a retail-focused smart financial platform for cryptocurrency users. This repository keeps the existing React and Vite application intact and establishes a maintainable base for future portfolio tracking, market intelligence, trading, automation, and DeFi management.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. The landing page is `/`; the current application overview is available at `/#app`. Other prototype screens use hash routes such as `/#wallet` and `/#trade`.

Create a production build with `npm run build`, or preview it with `npm run preview`.

## Project structure

```text
src/
  assets/       Brand and wallet icon assets
  lib/          Browser-safe configuration and pure financial calculations
  App.tsx       Existing application shell and hash-based routes
  main.tsx      React entry point and global stylesheet imports
  styles.css    Existing Veil visual system
  tailwind.css  Tailwind theme and utility layers (no preflight reset)
```

TypeScript strict mode is enabled. The existing `App.tsx` retains its pre-existing `@ts-nocheck` during this foundation pass; new library modules are strictly checked, and the legacy screen can be migrated incrementally. Tailwind CSS v4 is configured through its Vite plugin. Its preflight reset is omitted to preserve the current interface styles. shadcn/ui is not initialized yet; its component setup is better done when the app moves to reusable React components, rather than layering it over the current HTML-template views.

## Environment variables and secrets

`.env.example` documents the browser-safe `VITE_PUBLIC_API_BASE_URL` and a future server-only `DATABASE_URL`. Vite exposes variables prefixed with `VITE_` to browser code, so never put credentials, private API keys, or database URLs in a `VITE_` variable. The database variable is a placeholder only; this foundation does not connect to PostgreSQL or include a backend.

Do not commit `.env.local` or other files containing real secrets.

## Current scope

The landing and application routes are prototype screens. Market information uses public Binance spot data. When connected, a wallet is queried read-only for its native asset balance and a curated set of ERC-20 balances on Ethereum, Arbitrum One, and Base. Other EVM networks show the native balance only. This list does not discover arbitrary tokens. Veil does not request signatures or submit transactions; deposit, withdrawal, trade, and exchange actions remain simulated. There is no persistence or automation backend.
