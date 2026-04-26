'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

type ProductType = 'DIGITAL' | 'COURSE' | 'MEMBERSHIP' | 'BOOKING' | 'AI_TOOL';

interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  salesCount: number;
  published: boolean;
  image?: string;
}

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: '12-Week Transformation Program', type: 'COURSE', price: 97, salesCount: 142, published: true },
  { id: '2', name: 'AI Content Generator', type: 'AI_TOOL', price: 29, salesCount: 389, published: true },
  { id: '3', name: 'Monthly VIP Membership', type: 'MEMBERSHIP', price: 49, salesCount: 67, published: true },
  { id: '4', name: '1:1 Strategy Call', type: 'BOOKING', price: 150, salesCount: 28, published: true },
  { id: '5', name: 'Resource Pack: Templates & Guides', type: 'DIGITAL', price: 39, salesCount: 215, published: false },
];

const TYPE_COLORS: Record<ProductType, string> = {
  DIGITAL: 'secondary',
  COURSE: 'default',
  MEMBERSHIP: 'success',
  BOOKING: 'warning',
  AI_TOOL: 'destructive',
};

const TYPE_LABELS: Record<ProductType, string> = {
  DIGITAL: 'Digital',
  COURSE: 'Course',
  MEMBERSHIP: 'Membership',
  BOOKING: 'Booking',
  AI_TOOL: 'AI Tool',
};

export default function ProductsPage() {
  const [products] = useState<Product[]>(DEMO_PRODUCTS);
  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', type: 'DIGITAL' as ProductType, price: '' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products in your store</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Add Product'}
        </Button>
      </div>

      {/* Create Product Form */}
      {showCreate && (
        <Card className="p-6 border-violet-200 dark:border-violet-800 animate-slide-up">
          <h3 className="font-semibold mb-4">Create New Product</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <select
              className="h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm"
              value={newProduct.type}
              onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as ProductType })}
            >
              <option value="DIGITAL">Digital Product</option>
              <option value="COURSE">Course</option>
              <option value="MEMBERSHIP">Membership</option>
              <option value="BOOKING">Booking</option>
              <option value="AI_TOOL">AI Tool</option>
            </select>
            <Input
              type="number"
              placeholder="Price (USD)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button>Create Product</Button>
            <Button variant="outline">AI Generate Details</Button>
          </div>
        </Card>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} hover className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl shrink-0">
                {product.type === 'COURSE' ? '🎓' : product.type === 'AI_TOOL' ? '🤖' : product.type === 'MEMBERSHIP' ? '👑' : product.type === 'BOOKING' ? '📅' : '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <Badge variant={TYPE_COLORS[product.type] as 'default'} className="text-xs shrink-0">
                    {TYPE_LABELS[product.type]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{formatPrice(product.price)}</span>
                  <span>{product.salesCount} sales</span>
                  <span>{formatPrice(product.price * product.salesCount)} revenue</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={product.published ? 'success' : 'secondary'}>
                  {product.published ? 'Live' : 'Draft'}
                </Badge>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
