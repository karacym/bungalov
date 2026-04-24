'use client';

import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-bgl-moss text-white hover:bg-bgl-mossDark focus-visible:outline-bgl-moss',
  outline:
    'border border-bgl-mist bg-white text-bgl-ink hover:border-bgl-sand hover:bg-bgl-cream',
  ghost: 'bg-transparent text-bgl-muted hover:bg-bgl-cream/60 hover:text-bgl-ink',
  secondary: 'bg-bgl-cream text-bgl-ink hover:bg-bgl-mist',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
