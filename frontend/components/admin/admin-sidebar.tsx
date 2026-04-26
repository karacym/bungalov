'use client';

import { adminMenuLabel } from '@/components/admin/admin-menu-label';
import { ADMIN_MENU } from '@/components/admin/menu-config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { AdminMenuKey } from '@/modules/admin/types';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  active: AdminMenuKey;
  collapsed: boolean;
  onSelect: (key: AdminMenuKey) => void;
  onToggleCollapsed: () => void;
};

export function AdminSidebar({
  active,
  collapsed,
  onSelect,
  onToggleCollapsed,
}: Props) {
  const t = useTranslations('admin');
  const tNav = useTranslations('nav');
  return (
    <aside
      className={cn(
        'hidden h-[calc(100vh-2rem)] shrink-0 rounded-2xl border border-bgl-mist/80 bg-white p-3 shadow-soft lg:flex lg:flex-col',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn('overflow-hidden', collapsed && 'w-0')}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bgl-moss">{t('panelBrand')}</p>
          <p className="text-sm font-semibold text-bgl-ink">{t('panelSubtitle')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleCollapsed}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="space-y-1.5 overflow-y-auto">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                active === item.key
                  ? 'bg-bgl-moss text-white shadow-sm'
                  : 'text-bgl-muted hover:bg-bgl-cream/60 hover:text-bgl-ink',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{adminMenuLabel(t, tNav, item.key)}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
