# SellSpark API Reference

Base URL: `https://sellspark.com/api`  
Authentication: Bearer token in `Authorization` header  
Content-Type: `application/json`

---

## Authentication

All `/api/v1/*` endpoints require authentication.

```bash
curl https://sellspark.com/api/v1/products \
  -H "Authorization: Bearer live_your_api_key_here"
```

---

## AI Engine — `/api/ai/generate`

**POST** `/api/ai/generate`

### Request Body

```json
{
  "action": "generate-store",
  "payload": { "niche": "fitness", "name": "FitPro" }
}
```

### Available Actions

| action | payload | response |
|--------|---------|---------|
| `generate-store` | `{ niche, name }` | Complete store config |
| `optimize-content` | `{ text }` | Optimized copy + suggestions |
| `suggest-pricing` | `{ product, competitors[] }` | Pricing recommendation |
| `analyze-revenue` | `{ revenue[], dates[] }` | Trend + forecast |
| `analyze-sentiment` | `{ text }` | Positive/negative/neutral score |
| `generate-product-description` | `{ name, type, price }` | Sales copy |
| `generate-email-sequence` | `{ niche, product }` | 7-email drip sequence |
| `moderate-content` | `{ text }` | Safe/flagged + reason |
| `translate` | `{ text, target }` | Translated text |

### Example: Generate Store

```bash
curl -X POST https://sellspark.com/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate-store",
    "payload": { "niche": "fitness", "name": "FitPro Academy" }
  }'
```

```json
{
  "store": {
    "name": "FitPro Academy",
    "niche": "fitness",
    "colors": { "primary": "#ef4444", "secondary": "#f97316" },
    "sections": ["hero", "products", "testimonials", "newsletter"],
    "products": [
      { "name": "12-Week Transformation", "price": 197, "type": "course" },
      { "name": "1:1 Coaching", "price": 500, "type": "coaching" }
    ]
  }
}
```

---

## Intelligence API — `/api/intelligence`

**POST** `/api/intelligence`

### Actions

| action | payload | response |
|--------|---------|---------|
| `classify-creator` | `{ features: number[] }` | `{ label, confidence, distribution }` |
| `embed` | `{ text: string }` | `{ vector: number[] }` |
| `similarity` | `{ a: string, b: string }` | `{ similarity: number }` |
| `voice-intent` | `{ transcript: string }` | `{ intent, entities, confidence }` |
| `mint-receipt` | `{ owner, content, chain, metadata }` | NFT receipt object |
| `merkle-root` | `{ leaves: string[] }` | `{ root: string }` |

---

## Products — `/api/v1/products`

### GET `/api/v1/products`

List products with optional filters.

**Query params:**
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 100)
- `type` — filter by ProductType
- `storeId` — filter by store

```bash
curl "https://sellspark.com/api/v1/products?page=1&limit=10&type=course" \
  -H "Authorization: Bearer live_..."
```

```json
{
  "data": [
    {
      "id": "prod_abc123",
      "name": "12-Week Transformation",
      "price": 197,
      "type": "course",
      "active": true
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 42, "pages": 5 }
}
```

### POST `/api/v1/products`

Create a new product.

```json
{
  "name": "My Course",
  "description": "Transform your life",
  "price": 197,
  "type": "course",
  "storeId": "store_xyz"
}
```

---

## Analytics — `/api/v1/analytics`

### GET `/api/v1/analytics`

**Query params:**
- `storeId` — required
- `period` — `7d` | `30d` | `90d` (default: `30d`)
- `metric` — `revenue` | `visitors` | `orders` | `conversions`

```bash
curl "https://sellspark.com/api/v1/analytics?storeId=store_xyz&period=30d" \
  -H "Authorization: Bearer live_..."
```

```json
{
  "timeseries": [
    { "date": "2026-03-17", "revenue": 340, "visitors": 124, "orders": 4 }
  ],
  "totals": { "revenue": 12480, "visitors": 3820, "orders": 284, "conversionRate": 7.4 }
}
```

---

## Stripe — Checkout

### POST `/api/stripe/checkout`

Create a checkout session.

```json
{
  "productId": "prod_abc123",
  "successUrl": "https://yourstore.com/success",
  "cancelUrl": "https://yourstore.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_live_...",
  "url": "https://checkout.stripe.com/pay/cs_live_..."
}
```

---

## Stripe — Subscriptions

### POST `/api/stripe/subscription`

Create a creator subscription.

```json
{
  "plan": "pro",
  "userId": "user_abc"
}
```

Plans: `starter` (free) · `pro` ($29/mo) · `business` ($79/mo)

---

## Stripe — Connect

### POST `/api/stripe/connect`

Create a Stripe Connect express account for creator payouts.

```json
{
  "userId": "user_abc",
  "email": "creator@example.com"
}
```

**Response:**
```json
{
  "accountId": "acct_...",
  "onboardingUrl": "https://connect.stripe.com/..."
}
```

---

## Push Notifications — `/api/mobile/push`

### POST `/api/mobile/push`

**Actions:**

```json
{ "action": "subscribe", "subscription": { /* PushSubscription object */ } }
{ "action": "unsubscribe", "endpoint": "https://..." }
{ "action": "send", "userId": "user_abc", "title": "New sale!", "body": "$49" }
```

---

## Dynamic OG Images — `/api/og`

### GET `/api/og?title=My+Store&niche=fitness`

Returns a 1200×630 PNG image for Open Graph.

**Query params:**
- `title` — store or page title
- `niche` — creator niche (affects background)

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request — missing or invalid parameters |
| 401 | Unauthorized — invalid or missing API key |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited — slow down |
| 500 | Internal error — check status.sellspark.com |

---

## Rate Limits

| Plan | Requests/min | Requests/day |
|------|-------------|-------------|
| Free | 10 | 100 |
| Pro | 100 | 10,000 |
| Business | 500 | 100,000 |
| Enterprise | Custom | Custom |

---

## SDKs

### JavaScript / TypeScript

```bash
npm install @sellspark/sdk
```

```typescript
import { SellSpark } from '@sellspark/sdk';

const client = new SellSpark({ apiKey: 'live_...' });

const products = await client.products.list({ limit: 10 });
const store = await client.ai.generateStore({ niche: 'fitness', name: 'FitPro' });
```

### Python

```bash
pip install sellspark
```

```python
from sellspark import SellSpark

client = SellSpark(api_key="live_...")
products = client.products.list(limit=10)
```

### cURL

```bash
export SELLSPARK_KEY="live_..."

curl https://sellspark.com/api/v1/products \
  -H "Authorization: Bearer $SELLSPARK_KEY"
```
