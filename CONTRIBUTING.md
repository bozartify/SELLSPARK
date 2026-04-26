# Contributing to SellSpark

Welcome! SellSpark is a fast-moving codebase. This guide covers everything you need to contribute effectively.

---

## Quick Start

```bash
git clone https://github.com/sellspark/creator-os
cd creator-os
cp .env.example .env.local
# Fill in .env.local with your dev keys
npm install
npx prisma migrate dev
npm run dev
```

App is live at `http://localhost:3000`.

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Vercel |
| `develop` | Integration branch |
| `feat/xxx` | New features |
| `fix/xxx` | Bug fixes |
| `chore/xxx` | Deps, config, docs |

**Never push directly to `main`.**

---

## Commit Convention

```
feat: add DNA cold storage codec
fix: correct Kyber KEM polynomial bounds
docs: update API endpoint table
chore: bump Stripe to 2026-03-25.dahlia
test: add Thompson sampling coverage
```

---

## Code Standards

- **TypeScript strict mode** — zero `any`, zero `// @ts-ignore`
- **0 lint errors** before PR
- Every new `src/lib/` module must export a typed public API
- Every new dashboard page must include a `<h1>` and metadata
- New API routes must handle error cases and return typed JSON

---

## Testing Checklist (before PR)

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run build` — ✓ Compiled successfully
- [ ] All new pages render without console errors
- [ ] Mobile: tested on Expo Go (iOS + Android)
- [ ] PWA: Lighthouse score ≥ 95

---

## Adding a New Dashboard Page

1. Create `src/app/dashboard/your-page/page.tsx`
2. Add `'use client';` if using React hooks
3. Use `<Card>`, `<Badge>`, `<Button>` from `@/components/ui/`
4. Add the route to the sidebar in `src/app/dashboard/layout.tsx`
5. Add to `sitemap.ts` if publicly accessible

---

## Adding a New Lib Module

1. Create `src/lib/platform/your-module.ts`
2. Export all types and functions explicitly
3. No default exports in lib modules — named only
4. Document with JSDoc block at top of file
5. No Node.js-only APIs unless in `server` subdirectory

---

## Quantum Module Guidelines

All quantum modules must:
- Use `quantumRNG.getFloat()` — never `Math.random()` for security primitives
- Be pure TypeScript — no WASM required
- Export a `// SECURITY NOTE:` JSDoc explaining the threat model
- Be safe for both edge runtime and Node.js

---

## Pull Request Template

```markdown
## What
Brief description of the change.

## Why
The problem being solved.

## How
Implementation approach.

## Tested
- [ ] TypeScript clean
- [ ] Production build passes
- [ ] Manual test on web
- [ ] Manual test on mobile (if UI change)

## Screenshots
(if UI change)
```

---

## Security Vulnerabilities

**Do NOT open a public GitHub issue.**  
Email: security@sellspark.com  
PGP key: available at /security
