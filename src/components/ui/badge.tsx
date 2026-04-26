import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('fr-badge', {
  variants: {
    variant: {
      default:     'fr-badge-purple',
      secondary:   'fr-badge-white',
      success:     'fr-badge-green',
      warning:     'fr-badge-amber',
      destructive: 'fr-badge-red',
      outline:     'bg-transparent border border-[var(--border-sm)] text-[var(--text-3)]',
      cyan:        'fr-badge-blue',
    },
  },
  defaultVariants: { variant: 'default' },
});

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
