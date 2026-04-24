'use client';

import { DEFAULT_HOME_MAP, SITE_PAGES_STORAGE_KEY } from '@/lib/site-pages-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { useState } from 'react';
import type { SitePage } from './types';

type Props = {
  pages: SitePage[];
  onChange: (pages: SitePage[]) => void;
};

export function PagesModule({ pages, onChange }: Props) {
  const activePage = pages[0];
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  function setActivePage(patch: Partial<SitePage>) {
    if (!activePage) return;
    onChange(
      pages.map((page) => (page.id === activePage.id ? { ...page, ...patch } : page)),
    );
  }

  function setSelectedPage(pageId: string) {
    const selected = pages.find((page) => page.id === pageId);
    if (!selected) return;
    onChange([selected, ...pages.filter((page) => page.id !== pageId)]);
  }

  function setHomeImages(nextImages: string[]) {
    if (!activePage || activePage.id !== 'home') return;
    setActivePage({ heroImages: nextImages });
  }

  function addImageByUrl() {
    if (!activePage || activePage.id !== 'home') return;
    const url = newImageUrl.trim();
    if (!url) return;
    setHomeImages([...(activePage.heroImages ?? []), url]);
    setNewImageUrl('');
  }

  async function onFilesSelected(files: FileList | null) {
    if (!activePage || activePage.id !== 'home' || !files?.length) return;
    const readAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('Dosya okunamadi'));
        reader.readAsDataURL(file);
      });

    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const dataUrls = await Promise.all(selectedFiles.map((file) => readAsDataUrl(file)));
    setHomeImages([...(activePage.heroImages ?? []), ...dataUrls.filter(Boolean)]);
  }

  function savePages() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SITE_PAGES_STORAGE_KEY, JSON.stringify(pages));
    window.dispatchEvent(new Event('site-pages-updated'));
    setSaveMessage('Degisiklikler kaydedildi ve ana sayfa slider guncellendi.');
    window.setTimeout(() => setSaveMessage(''), 3000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Sayfalari Yonetimi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setSelectedPage(page.id)}
              className={cn(
                'rounded-xl border px-3 py-2 text-left transition',
                activePage?.id === page.id
                  ? 'border-bgl-moss bg-bgl-moss/10'
                  : 'border-bgl-mist hover:border-bgl-moss/40',
              )}
            >
              <p className="text-sm font-semibold text-bgl-dark">{page.name}</p>
              <p className="text-xs text-bgl-muted">/{page.slug}</p>
            </button>
          ))}
        </div>

        {activePage ? (
          <div className="space-y-3 rounded-xl border border-bgl-mist p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-bgl-dark">{activePage.name}</p>
              <Badge variant="outline">Yayin Sayfasi</Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                  Sayfa Basligi
                </p>
                <Input value={activePage.title} onChange={(e) => setActivePage({ title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Slug</p>
                <Input value={activePage.slug} readOnly />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">SEO Baslik</p>
                <Input
                  value={activePage.seoTitle}
                  onChange={(e) => setActivePage({ seoTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                  SEO Aciklama
                </p>
                <Input
                  value={activePage.seoDescription}
                  onChange={(e) => setActivePage({ seoDescription: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Hero Baslik</p>
                <Input
                  value={activePage.heroTitle}
                  onChange={(e) => setActivePage({ heroTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                  Hero Alt Baslik
                </p>
                <Input
                  value={activePage.heroSubtitle}
                  onChange={(e) => setActivePage({ heroSubtitle: e.target.value })}
                />
              </div>
            </div>

            {activePage.id === 'home' ? (
              <div className="space-y-3 rounded-xl border border-bgl-mist/80 bg-bgl-cream/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                  Hero Slider Gorselleri
                </p>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(activePage.heroImages ?? []).map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="overflow-hidden rounded-lg border border-bgl-mist bg-white"
                    >
                      <div className="relative aspect-[16/9] w-full">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2">
                        <p className="truncate text-xs text-bgl-muted">Gorsel {index + 1}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setHomeImages((activePage.heroImages ?? []).filter((_, i) => i !== index))
                          }
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... gorsel URL"
                  />
                  <Button type="button" variant="secondary" onClick={addImageByUrl}>
                    URL Ekle
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-bgl-muted">Bilgisayardan veya telefondan gorsel sec</p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void onFilesSelected(e.target.files)}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                    Slayt Degisim Suresi (sn)
                  </p>
                  <Input
                    type="number"
                    min={2}
                    max={15}
                    value={activePage.slideIntervalSec}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setActivePage({ slideIntervalSec: Number.isFinite(value) ? value : 4 });
                    }}
                  />
                </div>

                <div className="space-y-3 rounded-xl border border-bgl-mist bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">
                    Ana Sayfa Harita Alani
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-bgl-muted">Google Maps Embed URL</p>
                    <Input
                      value={activePage.mapEmbedUrl ?? DEFAULT_HOME_MAP.mapEmbedUrl}
                      onChange={(e) => setActivePage({ mapEmbedUrl: e.target.value })}
                      placeholder={DEFAULT_HOME_MAP.mapEmbedUrl}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-bgl-muted">Konum Basligi</p>
                      <Input
                        value={activePage.mapTitle ?? DEFAULT_HOME_MAP.mapTitle}
                        onChange={(e) => setActivePage({ mapTitle: e.target.value })}
                        placeholder={DEFAULT_HOME_MAP.mapTitle}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-bgl-muted">Adres</p>
                      <Input
                        value={activePage.mapAddress ?? DEFAULT_HOME_MAP.mapAddress}
                        onChange={(e) => setActivePage({ mapAddress: e.target.value })}
                        placeholder={DEFAULT_HOME_MAP.mapAddress}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-bgl-muted">Aciklama Notu</p>
                    <Textarea
                      value={activePage.mapNote ?? DEFAULT_HOME_MAP.mapNote}
                      onChange={(e) => setActivePage({ mapNote: e.target.value })}
                      className="min-h-20"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-bgl-muted">Harita Buton Metni</p>
                      <Input
                        value={activePage.mapButtonLabel ?? DEFAULT_HOME_MAP.mapButtonLabel}
                        onChange={(e) => setActivePage({ mapButtonLabel: e.target.value })}
                        placeholder={DEFAULT_HOME_MAP.mapButtonLabel}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-bgl-muted">Harita Buton Linki</p>
                      <Input
                        value={activePage.mapButtonUrl ?? DEFAULT_HOME_MAP.mapButtonUrl}
                        onChange={(e) => setActivePage({ mapButtonUrl: e.target.value })}
                        placeholder={DEFAULT_HOME_MAP.mapButtonUrl}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Sayfa Icerigi</p>
              <Textarea
                value={activePage.body}
                onChange={(e) => setActivePage({ body: e.target.value })}
                className="min-h-32"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Buton Metni</p>
                <Input
                  value={activePage.ctaLabel}
                  onChange={(e) => setActivePage({ ctaLabel: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Buton Linki</p>
                <Input value={activePage.ctaUrl} onChange={(e) => setActivePage({ ctaUrl: e.target.value })} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="sticky bottom-0 bg-white/95 py-2">
          <Button className="w-full" onClick={savePages}>
            Sayfa degisikliklerini kaydet
          </Button>
          {saveMessage ? <p className="mt-2 text-xs text-emerald-700">{saveMessage}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
