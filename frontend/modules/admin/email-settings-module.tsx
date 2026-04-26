'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { EmailSettingsState } from './types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  settings: EmailSettingsState;
  onChange: (next: EmailSettingsState) => void;
  onSave: (payload: EmailSettingsState & { password?: string }) => Promise<void>;
  onSendTest: (to: string) => Promise<void>;
};

export function EmailSettingsModule({ settings, onChange, onSave, onSendTest }: Props) {
  const t = useTranslations('admin.emailSettings');
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [testTo, setTestTo] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await onSave({ ...settings, password: password.trim() || undefined });
      setPassword('');
      setMessage({ type: 'ok', text: t('saved') });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : t('saveError'),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setMessage(null);
    try {
      await onSendTest(testTo.trim());
      setMessage({ type: 'ok', text: t('testSent') });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : t('testError'),
      });
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <p className="text-xs text-bgl-muted">{t('intro')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
            />
            {t('enabled')}
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-xs font-medium text-bgl-muted">
              {t('host')}
              <Input
                className="mt-1.5"
                value={settings.host}
                onChange={(e) => onChange({ ...settings, host: e.target.value })}
                placeholder="smtp.example.com"
              />
            </label>
            <label className="block text-xs font-medium text-bgl-muted">
              {t('port')}
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                max={65535}
                value={settings.port}
                onChange={(e) => onChange({ ...settings, port: Number(e.target.value) || 587 })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.secure}
              onChange={(e) => onChange({ ...settings, secure: e.target.checked })}
            />
            {t('secureHint')}
          </label>

          <label className="block text-xs font-medium text-bgl-muted">
            {t('authUser')}
            <Input
              className="mt-1.5"
              value={settings.authUser}
              onChange={(e) => onChange({ ...settings, authUser: e.target.value })}
              autoComplete="off"
            />
          </label>

          <label className="block text-xs font-medium text-bgl-muted">
            {t('password')}
            {settings.hasPassword ? (
              <span className="ml-1 font-normal text-emerald-700">({t('passwordStored')})</span>
            ) : null}
            <Input
              className="mt-1.5"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={settings.hasPassword ? t('passwordPlaceholder') : t('passwordNew')}
              autoComplete="new-password"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-xs font-medium text-bgl-muted">
              {t('fromName')}
              <Input
                className="mt-1.5"
                value={settings.fromName}
                onChange={(e) => onChange({ ...settings, fromName: e.target.value })}
              />
            </label>
            <label className="block text-xs font-medium text-bgl-muted">
              {t('fromEmail')}
              <Input
                className="mt-1.5"
                type="email"
                value={settings.fromEmail}
                onChange={(e) => onChange({ ...settings, fromEmail: e.target.value })}
              />
            </label>
          </div>

          <div className="rounded-xl border border-bgl-mist bg-bgl-cream/40 p-3 space-y-2">
            <p className="text-xs font-semibold text-bgl-ink">{t('notifyTitle')}</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.notifyAdminOnNewReservation}
                onChange={(e) =>
                  onChange({ ...settings, notifyAdminOnNewReservation: e.target.checked })
                }
              />
              {t('notifyReservation')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.notifyAdminOnContact}
                onChange={(e) => onChange({ ...settings, notifyAdminOnContact: e.target.checked })}
              />
              {t('notifyContact')}
            </label>
            <label className="block text-xs font-medium text-bgl-muted">
              {t('adminNotifyEmail')}
              <Input
                className="mt-1.5"
                type="email"
                value={settings.adminNotifyEmail ?? ''}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    adminNotifyEmail: e.target.value.trim() || null,
                  })
                }
                placeholder={t('adminNotifyPlaceholder')}
              />
            </label>
          </div>

          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('testTitle')}</CardTitle>
          <p className="text-xs text-bgl-muted">{t('testHint')}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <label className="block min-w-[200px] flex-1 text-xs font-medium text-bgl-muted">
            {t('testTo')}
            <Input
              className="mt-1.5"
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="ornek@mail.com"
            />
          </label>
          <Button type="button" variant="outline" onClick={() => void handleTest()}>
            {t('testSend')}
          </Button>
        </CardContent>
      </Card>

      {message ? (
        <p
          className={`text-sm ${message.type === 'ok' ? 'text-emerald-700' : 'text-rose-700'}`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
