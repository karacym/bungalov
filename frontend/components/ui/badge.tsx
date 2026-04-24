import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'outline';

const variants: Record<Variant, string> = {
  default: 'bg-bgl-moss/10 text-bgl-moss border-bgl-moss/20',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  outline: 'bg-white text-bgl-muted border-bgl-mist',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        variants[variant],
        className,
      )}
    />
  );
}
