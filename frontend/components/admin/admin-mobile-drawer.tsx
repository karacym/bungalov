'use client';

import { adminMenuLabel } from '@/components/admin/admin-menu-label';
import { ADMIN_MENU } from '@/components/admin/menu-config';
import { Button } from '@/components/ui/button';
import type { AdminMenuKey } from '@/modules/admin/types';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  open: boolean;
  active: AdminMenuKey;
  onSelect: (key: AdminMenuKey) => void;
  onClose: () => void;
};

export function AdminMobileDrawer({ open, active, onSelect, onClose }: Props) {
  const t = useTranslations('admin');
  const tNav = useTranslations('nav');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label={t('drawerClose')}
      />
      <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col border-r border-bgl-mist bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bgl-moss">{t('mobileBrand')}</p>
            <p className="text-sm font-semibold text-bgl-ink">{t('mobileNavTitle')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-2 overflow-y-auto pr-1">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                  active === item.key
                    ? 'bg-bgl-moss text-white'
                    : 'text-bgl-muted hover:bg-bgl-cream/70 hover:text-bgl-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
                {adminMenuLabel(t, tNav, item.key)}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
