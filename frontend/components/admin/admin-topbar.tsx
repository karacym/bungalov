'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, RefreshCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onRefresh: () => void;
};

export function AdminTopbar({
  title,
  subtitle,
  onOpenMobileMenu,
  onRefresh,
}: Props) {
  const t = useTranslations('admin');
  return (
    <header className="sticky top-0 z-20 rounded-2xl border border-bgl-mist/80 bg-white/95 p-4 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileMenu}
            aria-label={t('openMenu')}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-bgl-ink md:text-xl">{title}</h1>
            {subtitle ? <p className="text-xs text-bgl-muted">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('searchPlaceholder')}
            className="hidden w-[280px] md:block"
            aria-label={t('searchPlaceholder')}
          />
          <Button variant="outline" onClick={onRefresh} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            {t('refresh')}
          </Button>
        </div>
      </div>
    </header>
  );
}
