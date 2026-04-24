import { cn } from '@/lib/cn';
import type { HTMLAttributes, TableHTMLAttributes } from 'react';

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full text-sm', className)} {...props} />;
}

export function TableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-bgl-muted',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-3 py-3 text-bgl-ink', className)} {...props} />;
}
