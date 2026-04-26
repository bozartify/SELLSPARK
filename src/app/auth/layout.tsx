import { NavButtons } from '@/components/site/nav-buttons';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute top-4 left-4 z-50">
        <NavButtons />
      </div>
      {children}
    </div>
  );
}
