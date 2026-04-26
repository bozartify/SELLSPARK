# SellSpark — Architecture Deep Dive

## System Design Principles

1. **Edge-first** — every response that can be static or edge-computed is
2. **Quantum-safe by default** — PQC on all session tokens, no opt-in required
3. **AI-augmented, not AI-dependent** — platform works without AI keys; AI enhances
4. **Privacy-preserving** — differential privacy on all analytics, no raw user graphs
5. **Offline-capable** — service worker + IndexedDB for full offline creator dashboard
6. **Mobile-native** — Expo native app shares zero web code; platform-optimal UX

---

## Request Lifecycle

```
Browser / Mobile App
        │
        ▼
Cloudflare CDN + WAF
        │
        ▼
Vercel Edge Network (150+ PoPs)
        │
   ┌────┴────────────┐
   │                 │
Static Assets    Next.js Runtime
(CDN cache)          │
                 ┌───┴────────────────┐
                 │                    │
            Server Components    Edge Routes
            (RSC, no JS sent)   (/api/og, etc)
                 │
            Route Handlers
            (/api/v1/*, /api/stripe/*)
                 │
          ┌──────┴────────────┐
          │                   │
      Prisma ORM          Quantum Layer
      (PostgreSQL)        (in-process)
          │
      Supabase / Railway
```

---

## Data Flow — AI Store Generation

```
User input: "fitness coach named FitPro"
        │
        ▼
AIEngine.generateStore()
        │
   ┌────┴──────────────────────┐
   │                           │
VQC Niche Detection        Niche Template DB
(amplitude encoding)       (fitness, education,
(Hadamard mixing)           business, creative)
(softmax classification)
        │
        ▼
Niche = "fitness" (confidence: 87%)
        │
        ▼
Store Config Generation:
  - Colors: warm reds/oranges
  - Sections: hero, programs, testimonials, community, newsletter
  - Products: 12-week program ($197), 1:1 coaching ($500/mo), meal plan PDF ($29)
  - Copy: power words + CTA optimization
        │
        ▼
Returned to Onboarding Wizard (Step 3 preview)
        │
        ▼
Creator edits → publishes → /[slug] goes live
```

---

## Data Flow — Quantum-Safe Authentication

```
User enters credentials
        │
        ▼
Zero-Knowledge Prover (Schnorr)
  - Commit: R = g^r mod p
  - Challenge: c = H(R || email || nonce)
  - Response: s = r + c*x mod (p-1)
        │
        ▼
Kyber KEM session establishment
  - Server public key → encapsulate → shared secret
  - Hybrid: shared_secret → AES-256-GCM session key
        │
        ▼
Quantum-safe JWT token
  - Payload signed with HMAC-SHA512 + quantum entropy
  - Fingerprint: device hash + timing entropy
        │
        ▼
NextAuth session (7-day expiry)
        │
        ▼
Subsequent requests verified via Kyber session key
```

---

## Data Flow — Autonomous Agent Decision Loop

```
Business Event (e.g., conversion rate drops 15%)
        │
        ▼
Blackboard updated: { "conversionDrop": true }
        │
        ▼
Growth Agent reads blackboard
  - Goal: "Restore conversion rate"
  - decompose() → 4 subgoals
        │
        ▼
HTN Planning:
  1. Research: "Analyze funnel drop-off via PostHog"
  2. Draft: "Generate 3 A/B test variants for checkout CTA"
  3. Execute: "Launch Thompson Sampling experiment"
  4. Verify: "Monitor for 48h, auto-pick winner"
        │
        ▼
dispatch() calls tools: analytics → ab-testing → email
        │
        ▼
reflect() updates agent memory:
  - What worked: "Shortening CTA to 3 words +12% CTR"
  - Adjust: reinforce CTA-shortening tool weight
        │
        ▼
Blackboard updated: { "conversionRestored": true }
```

---

## Scaling Architecture

### Current (MVP → 10k creators)
```
Vercel (auto-scaling serverless)
PostgreSQL on Supabase (connection pooler: PgBouncer)
Cloudflare CDN for static assets
Single region: US-East
```

### Growth (10k → 100k creators)
```
Multi-region Vercel deployment
Read replicas on Supabase
Redis (Upstash) for rate limiting + session cache
Separate media CDN (Cloudflare R2)
Background jobs: Inngest or Trigger.dev
```

### Scale (100k+ creators)
```
Dedicated Kubernetes cluster
CockroachDB or PlanetScale for global distributed SQL
Temporal for durable workflow orchestration
gRPC microservices for AI inference
WASM edge runtime for quantum primitives
Dedicated HSM for key management
```

---

## Mobile Architecture (Expo)

```
Expo Router (file-based routing, same as Next.js App Router)
        │
   ┌────┴─────────────────────────────┐
   │                                  │
 iOS (SwiftUI bridge)         Android (Kotlin bridge)
 Face ID (LAContext)          Fingerprint (BiometricPrompt)
 APNs (push)                  FCM (push)
 Haptic Engine                Haptic Engine
        │                             │
        └──────────┬──────────────────┘
                   │
        Expo SDK (unified JS API)
                   │
        React Native bridge
                   │
        Shared Business Logic:
        - API calls to sellspark.com/api/v1
        - Zustand state (AsyncStorage persisted)
        - expo-secure-store for tokens
```

---

## PWA Architecture

```
Service Worker (public/sw.js)
        │
   ┌────┴──────────────────────────────┐
   │                                   │
Cache-first strategy            Network-first + cache
(static assets: JS, CSS, fonts) (pages, API responses)
        │                              │
   CacheStorage                  IndexedDB
   (versioned caches)            (offline queue)
        │
Push API (Web Push)
  - VAPID authentication
  - Background push via service worker
  - Notification click routing
```

---

## Frontend Performance Strategy

| Technique | Implementation |
|-----------|---------------|
| React Server Components | All page-level components |
| Static generation | 74/74 routes pre-rendered |
| Image optimization | Next.js `<Image>` with WebP/AVIF |
| Font optimization | Inter via next/font (no FOIT) |
| Code splitting | Automatic per-route by Turbopack |
| Prefetching | Next.js `<Link>` automatic |
| CSS | Tailwind JIT (zero unused CSS) |
| Animations | CSS keyframes > JS where possible |
| Service Worker | Cache-first for repeat visits |

---

## Quantum Module Integration Points

```
src/lib/quantum/
        │
        ├── crypto.ts ──────────► src/lib/auth.ts (session tokens)
        │                         src/app/api/stripe/webhook (request signing)
        │
        ├── advanced.ts ─────────► src/lib/store/index.ts (auth store)
        │                          Fraud detection on checkout
        │
        ├── neural.ts ──────────► src/lib/ai/engine.ts (VQC classification)
        │                          src/lib/ai/ab-testing.ts (bandits)
        │
        ├── grover.ts ──────────► src/lib/commerce/engine.ts (catalog search)
        │                          src/lib/ai/predictive.ts (forecasting)
        │
        ├── shor-holographic.ts ► src/lib/platform/edge-ai.ts (compression)
        │                          src/lib/platform/bci.ts (neural encoding)
        │
        └── teleport.ts ────────► src/app/api/intelligence/route.ts
                                   src/lib/platform/satellite.ts (QKD sessions)
```
