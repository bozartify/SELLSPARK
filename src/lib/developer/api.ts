/**
 * Developer Platform — Public REST API & SDK
 *
 * Enables third-party developers to:
 * - Access store data via REST API
 * - Build custom integrations
 * - Embed SellSpark widgets on external sites
 * - Create custom AI tools programmatically
 * - Access analytics data
 * - Manage products & orders via API
 *
 * Authentication: API Key + HMAC signature
 * Rate Limiting: Quantum-jittered token bucket
 * Versioning: /api/v1/
 */

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  key: string;         // sk_live_xxx or sk_test_xxx
  secret: string;      // for HMAC signing
  permissions: APIPermission[];
  rateLimit: number;   // requests per minute
  lastUsed: string | null;
  createdAt: string;
  active: boolean;
}

export type APIPermission =
  | 'store:read' | 'store:write'
  | 'products:read' | 'products:write'
  | 'orders:read' | 'orders:write'
  | 'customers:read' | 'customers:write'
  | 'analytics:read'
  | 'ai-tools:read' | 'ai-tools:write' | 'ai-tools:execute'
  | 'webhooks:manage'
  | 'files:upload';

export const API_PERMISSION_GROUPS = {
  'Read Only': ['store:read', 'products:read', 'orders:read', 'customers:read', 'analytics:read', 'ai-tools:read'],
  'Full Access': ['store:read', 'store:write', 'products:read', 'products:write', 'orders:read', 'orders:write', 'customers:read', 'customers:write', 'analytics:read', 'ai-tools:read', 'ai-tools:write', 'ai-tools:execute', 'webhooks:manage', 'files:upload'],
  'Products & Orders': ['products:read', 'products:write', 'orders:read', 'orders:write'],
  'Analytics Only': ['analytics:read'],
} as const;

// ─── API Key Generation ─────────────────────────────────────────────────────
export function generateAPIKey(mode: 'live' | 'test' = 'live'): { key: string; secret: string } {
  const prefix = mode === 'live' ? 'sk_live_' : 'sk_test_';
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = prefix + Array.from(bytes).map(b => b.toString(36)).join('').slice(0, 40);

  const secretBytes = new Uint8Array(48);
  crypto.getRandomValues(secretBytes);
  const secret = 'whsec_' + Array.from(secretBytes).map(b => b.toString(36)).join('').slice(0, 48);

  return { key, secret };
}

// ─── API Response Types ─────────────────────────────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

// ─── API Endpoint Definitions ───────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Store
  'GET /api/v1/store': { permission: 'store:read', description: 'Get store details' },
  'PATCH /api/v1/store': { permission: 'store:write', description: 'Update store settings' },

  // Products
  'GET /api/v1/products': { permission: 'products:read', description: 'List all products' },
  'POST /api/v1/products': { permission: 'products:write', description: 'Create a product' },
  'GET /api/v1/products/:id': { permission: 'products:read', description: 'Get product by ID' },
  'PATCH /api/v1/products/:id': { permission: 'products:write', description: 'Update a product' },
  'DELETE /api/v1/products/:id': { permission: 'products:write', description: 'Delete a product' },

  // Orders
  'GET /api/v1/orders': { permission: 'orders:read', description: 'List all orders' },
  'GET /api/v1/orders/:id': { permission: 'orders:read', description: 'Get order by ID' },
  'POST /api/v1/orders/:id/refund': { permission: 'orders:write', description: 'Refund an order' },

  // Customers
  'GET /api/v1/customers': { permission: 'customers:read', description: 'List customers' },
  'GET /api/v1/customers/:id': { permission: 'customers:read', description: 'Get customer by ID' },

  // Analytics
  'GET /api/v1/analytics/revenue': { permission: 'analytics:read', description: 'Revenue analytics' },
  'GET /api/v1/analytics/visitors': { permission: 'analytics:read', description: 'Visitor analytics' },
  'GET /api/v1/analytics/conversions': { permission: 'analytics:read', description: 'Conversion data' },

  // AI Tools
  'GET /api/v1/ai-tools': { permission: 'ai-tools:read', description: 'List AI tools' },
  'POST /api/v1/ai-tools': { permission: 'ai-tools:write', description: 'Create an AI tool' },
  'POST /api/v1/ai-tools/:id/execute': { permission: 'ai-tools:execute', description: 'Execute AI tool' },

  // Webhooks
  'GET /api/v1/webhooks': { permission: 'webhooks:manage', description: 'List webhooks' },
  'POST /api/v1/webhooks': { permission: 'webhooks:manage', description: 'Create a webhook' },
  'DELETE /api/v1/webhooks/:id': { permission: 'webhooks:manage', description: 'Delete a webhook' },
} as const;

// ─── Embeddable Widget Config ───────────────────────────────────────────────
export interface WidgetConfig {
  type: 'product-card' | 'buy-button' | 'checkout' | 'storefront' | 'ai-tool';
  storeSlug: string;
  productId?: string;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  borderRadius: number;
  showBranding: boolean;
}

export function generateWidgetEmbed(config: WidgetConfig): string {
  const params = new URLSearchParams({
    type: config.type,
    store: config.storeSlug,
    ...(config.productId && { product: config.productId }),
    theme: config.theme,
    color: config.primaryColor,
    radius: config.borderRadius.toString(),
    branding: config.showBranding.toString(),
  });

  return `<!-- SellSpark Widget -->
<div id="sellspark-widget" data-config="${params.toString()}"></div>
<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://sellspark.com'}/embed.js" async></script>`;
}

// ─── SDK Code Snippets ──────────────────────────────────────────────────────
export const SDK_EXAMPLES = {
  javascript: `import SellSpark from '@sellspark/sdk';

const client = new SellSpark({ apiKey: 'sk_live_xxx' });

// List products
const products = await client.products.list();

// Create an order
const order = await client.orders.create({
  productId: 'prod_xxx',
  customerEmail: 'customer@example.com',
});

// Execute AI tool
const result = await client.aiTools.execute('tool_xxx', {
  input: 'Generate a meal plan for weight loss',
});`,

  python: `from sellspark import SellSpark

client = SellSpark(api_key="sk_live_xxx")

# List products
products = client.products.list()

# Create an order
order = client.orders.create(
    product_id="prod_xxx",
    customer_email="customer@example.com",
)

# Execute AI tool
result = client.ai_tools.execute("tool_xxx", {
    "input": "Generate a meal plan for weight loss"
})`,

  curl: `# List products
curl -X GET https://api.sellspark.com/v1/products \\
  -H "Authorization: Bearer sk_live_xxx"

# Create an order
curl -X POST https://api.sellspark.com/v1/orders \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"productId": "prod_xxx", "customerEmail": "customer@example.com"}'`,
};
