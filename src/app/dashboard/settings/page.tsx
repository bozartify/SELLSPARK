'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 0, features: ['1 store', '3 products', '5% fee'] },
  { id: 'pro', name: 'Pro', price: 29, features: ['Unlimited products', 'AI marketplace', '2% fee'] },
  { id: 'business', name: 'Business', price: 79, features: ['Multi-store', 'White-label', '0% fee'] },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPlan] = useState('starter');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><h2 className="font-semibold">Profile</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {name[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <Button variant="outline" size="sm">Upload Photo</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Subscription Plan</h2>
            <Badge variant="default">Current: {PLANS.find(p => p.id === currentPlan)?.name}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-xl border transition-all ${
                  currentPlan === plan.id
                    ? 'border-violet-500 ring-2 ring-violet-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h3 className="font-semibold">{plan.name}</h3>
                <div className="text-2xl font-bold mt-1 mb-3">
                  {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                </div>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <span className="text-emerald-500">&#10003;</span> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={currentPlan === plan.id ? 'ghost' : 'outline'}
                  size="sm"
                  className="w-full"
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader><h2 className="font-semibold">Security</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <div className="text-sm font-medium">Quantum-Resistant Encryption</div>
                <div className="text-xs text-gray-500">Your data is protected with CRYSTALS-Kyber post-quantum cryptography</div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Change Password</label>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
            </div>
          </div>
          <Button variant="outline">Update Password</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader><h2 className="font-semibold text-red-600">Danger Zone</h2></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Delete Account</div>
            <div className="text-xs text-gray-500">Permanently delete your account and all data</div>
          </div>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
