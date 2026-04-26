'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:     'fr-btn',
        secondary:   'fr-btn-outline',
        outline:     'fr-btn-outline',
        ghost:       'fr-btn-ghost',
        destructive: 'rounded-[10px] bg-red-600/90 text-white hover:bg-red-600 shadow-lg shadow-red-900/25',
        success:     'rounded-[10px] bg-emerald-600/90 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-900/25',
        link:        'text-[var(--purple-glow)] underline-offset-4 hover:underline p-0 h-auto font-medium',
        purple:      'fr-btn',
      },
      size: {
        sm:      'h-8 px-3.5 text-xs rounded-lg',
        default: 'h-10 px-5 text-sm rounded-[10px]',
        lg:      'h-11 px-6 text-sm rounded-xl',
        xl:      'h-13 px-8 text-base rounded-xl',
        icon:    'h-9 w-9 rounded-lg p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
