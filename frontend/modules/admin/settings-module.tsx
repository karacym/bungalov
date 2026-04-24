'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toAbsoluteMediaUrl } from '@/lib/api';
import type { MediaAsset, SiteSettings } from './types';
import { useRef, useState } from 'react';

type Props = {
  settings: SiteSettings;
  onChange: (next: SiteSettings) => void;
  onSave: (payload: SiteSettings) => Promise<void>;
  uploadMedia: (file: File) => Promise<MediaAsset>;
};

export function SettingsModule({ settings, onChange, onSave, uploadMedia }: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await onSave(settings);
      setMessage({ type: 'ok', text: 'Ayarlar kaydedildi.' });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Kayit basarisiz',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleFile(kind: 'logo' | 'favicon', file: File | null) {
    if (!file) return;
    setUploading(kind);
    setMessage(null);
    try {
      const asset = await uploadMedia(file);
      if (kind === 'logo') {
        onChange({ ...settings, logoUrl: asset.url });
      } else {
        onChange({ ...settings, faviconUrl: asset.url });
      }
      setMessage({ type: 'ok', text: kind === 'logo' ? 'Logo yuklendi.' : 'Favicon yuklendi.' });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Yukleme basarisiz',
      });
    } finally {
      setUploading(null);
    }
  }

  const logoPreview = settings.logoUrl ? toAbsoluteMediaUrl(settings.logoUrl) : '';
  const faviconPreview = settings.faviconUrl ? toAbsoluteMediaUrl(settings.faviconUrl) : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Ayarlar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block text-xs font-medium text-bgl-muted">
          Site adi
          <Input
            className="mt-1.5"
            placeholder="Site adi"
            value={settings.siteName}
            onChange={(e) => onChange({ ...settings, siteName: e.target.value })}
          />
        </label>

        <div className="rounded-xl border border-bgl-mist bg-bgl-cream/40 p-3">
          <p className="text-xs font-semibold text-bgl-ink">Logo</p>
          <p className="mt-0.5 text-[11px] text-bgl-muted">PNG, SVG veya WebP yukleyin; istege bagli olarak URL de girebilirsiniz.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- harici / uploads URL; boyut sabit
              <img src={logoPreview} alt="" className="h-10 w-auto max-w-[160px] rounded-lg border border-bgl-mist bg-white object-contain p-1" />
            ) : (
              <span className="rounded-lg border border-dashed border-bgl-mist px-3 py-2 text-xs text-bgl-muted">Onizleme yok</span>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => void handleFile('logo', e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading !== null}
              onClick={() => logoInputRef.current?.click()}
            >
              {uploading === 'logo' ? 'Yukleniyor...' : 'Dosya sec'}
            </Button>
          </div>
          <Input
            className="mt-2"
            placeholder="Logo URL (alternatif)"
            value={settings.logoUrl}
            onChange={(e) => onChange({ ...settings, logoUrl: e.target.value })}
          />
        </div>

        <div className="rounded-xl border border-bgl-mist bg-bgl-cream/40 p-3">
          <p className="text-xs font-semibold text-bgl-ink">Favicon</p>
          <p className="mt-0.5 text-[11px] text-bgl-muted">ICO, PNG veya SVG (tercihen kare, en az 32 px).</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {faviconPreview ? (
              <img src={faviconPreview} alt="" className="h-8 w-8 rounded border border-bgl-mist bg-white object-contain p-0.5" />
            ) : (
              <span className="rounded-lg border border-dashed border-bgl-mist px-3 py-2 text-xs text-bgl-muted">Onizleme yok</span>
            )}
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.ico"
              className="hidden"
              onChange={(e) => void handleFile('favicon', e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading !== null}
              onClick={() => faviconInputRef.current?.click()}
            >
              {uploading === 'favicon' ? 'Yukleniyor...' : 'Dosya sec'}
            </Button>
          </div>
          <Input
            className="mt-2"
            placeholder="Favicon URL (alternatif)"
            value={settings.faviconUrl}
            onChange={(e) => onChange({ ...settings, faviconUrl: e.target.value })}
          />
        </div>

        <label className="block text-xs font-medium text-bgl-muted">
          WhatsApp
          <Input
            className="mt-1.5"
            placeholder="905551234567 veya tam wa.me linki"
            value={settings.whatsapp}
            onChange={(e) => onChange({ ...settings, whatsapp: e.target.value })}
          />
        </label>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="block text-xs font-medium text-bgl-muted">
            Instagram
            <Input
              className="mt-1.5"
              placeholder="Instagram"
              value={settings.instagram}
              onChange={(e) => onChange({ ...settings, instagram: e.target.value })}
            />
          </label>
          <label className="block text-xs font-medium text-bgl-muted">
            Facebook
            <Input
              className="mt-1.5"
              placeholder="Facebook"
              value={settings.facebook}
              onChange={(e) => onChange({ ...settings, facebook: e.target.value })}
            />
          </label>
        </div>

        <div className="rounded-xl border border-bgl-mist bg-bgl-cream/40 p-3">
          <p className="text-xs font-semibold text-bgl-ink">Footer ve iletisim (sitede gorunur)</p>
          <p className="mt-0.5 text-[11px] text-bgl-muted">
            Alt bilgi metni, telefon, e-posta ve bolge satiri ayarlardan cekilir; WhatsApp linki yukaridaki alandan.
          </p>
          <label className="mt-3 block text-xs font-medium text-bgl-muted">
            Footer aciklama metni
            <Textarea
              className="mt-1.5 min-h-[72px]"
              value={settings.footerTagline}
              onChange={(e) => onChange({ ...settings, footerTagline: e.target.value })}
            />
          </label>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <label className="block text-xs font-medium text-bgl-muted">
              Telefon (gorunen)
              <Input
                className="mt-1.5"
                placeholder="+90 ..."
                value={settings.contactPhone}
                onChange={(e) => onChange({ ...settings, contactPhone: e.target.value })}
              />
            </label>
            <label className="block text-xs font-medium text-bgl-muted">
              E-posta (gorunen)
              <Input
                className="mt-1.5"
                type="email"
                placeholder="info@..."
                value={settings.contactEmail}
                onChange={(e) => onChange({ ...settings, contactEmail: e.target.value })}
              />
            </label>
          </div>
          <label className="mt-2 block text-xs font-medium text-bgl-muted">
            Bolgeler / adres satiri
            <Input
              className="mt-1.5"
              placeholder="Sapanca · Bolu"
              value={settings.footerLocations}
              onChange={(e) => onChange({ ...settings, footerLocations: e.target.value })}
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-bgl-muted">
          Meta baslik
          <Input
            className="mt-1.5"
            placeholder="Tarayici sekmesi / SEO baslik"
            value={settings.metaTitle}
            onChange={(e) => onChange({ ...settings, metaTitle: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium text-bgl-muted">
          Meta aciklama
          <Textarea
            className="mt-1.5 min-h-[88px]"
            placeholder="Kisa site aciklamasi"
            value={settings.metaDescription}
            onChange={(e) => onChange({ ...settings, metaDescription: e.target.value })}
          />
        </label>

        {message ? (
          <p className={`text-xs font-medium ${message.type === 'ok' ? 'text-emerald-700' : 'text-rose-700'}`}>
            {message.text}
          </p>
        ) : null}

        <div className="sticky bottom-0 bg-white/95 py-2">
          <Button type="button" className="w-full" disabled={saving} onClick={() => void handleSave()}>
            {saving ? 'Kaydediliyor...' : 'Ayarlari kaydet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
