'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Payment, PaymentProviderSetting } from './types';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  payments: Payment[];
  providerSettings: PaymentProviderSetting[];
  onSaveProvider: (
    provider: PaymentProviderSetting['provider'],
    payload: {
      enabled: boolean;
      mode: string;
      publicKey: string | null;
      secretKey: string | null;
      webhookSecret: string | null;
    },
  ) => Promise<unknown>;
};

export function PaymentsModule({ payments, providerSettings, onSaveProvider }: Props) {
  const [status, setStatus] = useState<'all' | Payment['status']>('all');
  const [provider, setProvider] = useState<'all' | Payment['provider']>('all');
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState('test');
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const iyzico = useMemo(
    () => providerSettings.find((item) => item.provider === 'iyzico') ?? null,
    [providerSettings],
  );

  useEffect(() => {
    if (!iyzico) return;
    setEnabled(Boolean(iyzico.enabled));
    setMode(iyzico.mode || 'test');
    setPublicKey(iyzico.publicKey ?? '');
    setSecretKey(iyzico.secretKey ?? '');
    setWebhookSecret(iyzico.webhookSecret ?? '');
  }, [iyzico]);

  const filtered = useMemo(() => {
    return payments.filter((item) => {
      const matchStatus = status === 'all' ? true : item.status === status;
      const matchProvider = provider === 'all' ? true : item.provider === provider;
      const matchQuery = item.provider.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchProvider && matchQuery;
    });
  }, [payments, status, provider, query]);

  async function saveIyzicoSettings() {
    setSaving(true);
    setSaveMessage('');
    try {
      await onSaveProvider('iyzico', {
        enabled,
        mode,
        publicKey: publicKey.trim() || null,
        secretKey: secretKey.trim() || null,
        webhookSecret: webhookSecret.trim() || null,
      });
      setSaveMessage('Odeme ayarlari kaydedildi.');
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Odeme ayarlari kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Odeme Ayarlari (iyzico)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 rounded-xl border border-bgl-mist px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            Iyzico odeme sistemini aktif et
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-xs font-medium text-bgl-muted">
              Mod
              <select className="bgl-input mt-1.5" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="test">test (sandbox)</option>
                <option value="live">live (canli)</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-bgl-muted">
              Webhook Secret
              <Input
                className="mt-1.5"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Opsiyonel"
              />
            </label>
          </div>

          <label className="block text-xs font-medium text-bgl-muted">
            API Key (Public Key)
            <Input
              className="mt-1.5"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="sandbox-..."
            />
          </label>

          <label className="block text-xs font-medium text-bgl-muted">
            Secret Key
            <Input
              className="mt-1.5"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sandbox-..."
            />
          </label>

          <div className="flex items-center gap-3">
            <Button onClick={() => void saveIyzicoSettings()} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Odeme ayarlarini kaydet'}
            </Button>
            {saveMessage ? <p className="text-xs text-bgl-muted">{saveMessage}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Odeme Kayitlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="Saglayici ara"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="bgl-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'all' | Payment['status'])}
            >
              <option value="all">Tum durumlar</option>
              <option value="pending">beklemede</option>
              <option value="paid">odendi</option>
              <option value="failed">basarisiz</option>
              <option value="refunded">iade</option>
            </select>
            <select
              className="bgl-input"
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'all' | Payment['provider'])}
            >
              <option value="all">Tum saglayicilar</option>
              <option value="iyzico">iyzico</option>
              <option value="stripe">stripe</option>
              <option value="paytr">paytr</option>
              <option value="manual">manuel</option>
            </select>
          </div>

          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-xl border border-bgl-mist p-3 md:grid-cols-[120px_1fr_120px_140px]"
              >
                <p className="text-sm font-semibold text-bgl-ink">
                  {item.amount.toLocaleString('tr-TR')} TL
                </p>
                <p className="text-sm text-bgl-muted">{item.provider}</p>
                <Badge
                  variant={
                    item.status === 'paid'
                      ? 'success'
                      : item.status === 'failed'
                        ? 'danger'
                        : item.status === 'refunded'
                          ? 'outline'
                          : 'warning'
                  }
                >
                  {item.status === 'paid'
                    ? 'odendi'
                    : item.status === 'failed'
                      ? 'basarisiz'
                      : item.status === 'refunded'
                        ? 'iade'
                        : 'beklemede'}
                </Badge>
                <p className="text-xs text-bgl-muted">
                  {new Date(item.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
