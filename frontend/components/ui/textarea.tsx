import { cn } from '@/lib/cn';
import type { TextareaHTMLAttributes } from 'react';

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[90px] w-full rounded-xl border border-bgl-mist bg-white px-3 py-2.5 text-sm text-bgl-ink outline-none transition placeholder:text-bgl-muted/70 focus:border-bgl-moss focus:ring-2 focus:ring-bgl-moss/20',
        className,
      )}
      {...props}
    />
  );
}
