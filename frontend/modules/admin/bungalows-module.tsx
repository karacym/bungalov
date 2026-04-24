'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Bungalow, BungalowFeatureKey, MediaAsset } from './types';
import { Plus, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';

const FEATURE_KEYS: Array<{ key: BungalowFeatureKey; label: string }> = [
  { key: 'jacuzzi', label: 'Jakuzi' },
  { key: 'fireplace', label: 'Somine' },
  { key: 'pool', label: 'Havuz' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'air_conditioning', label: 'Klima' },
  { key: 'view_type', label: 'Manzara Tipi' },
];

type Props = {
  bungalows: Bungalow[];
  onChange: (items: Bungalow[]) => void;
  onCreatePersist?: (payload: Omit<Bungalow, 'id'>) => Promise<Bungalow>;
  onUpdatePersist?: (id: string, payload: Omit<Bungalow, 'id'>) => Promise<Bungalow>;
  onDeletePersist?: (id: string) => Promise<void>;
  onUploadMediaPersist?: (file: File) => Promise<MediaAsset>;
};

type FormState = {
  title: string;
  description: string;
  pricePerNight: string;
  capacity: string;
  location: string;
  images: string[];
  features: Partial<Record<BungalowFeatureKey, boolean | string>>;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  pricePerNight: '',
  capacity: '2',
  location: '',
  images: [],
  features: {},
};

export function BungalowsModule({
  bungalows,
  onChange,
  onCreatePersist,
  onUpdatePersist,
  onDeletePersist,
  onUploadMediaPersist,
}: Props) {
  const [activeTab, setActiveTab] = useState<'general' | 'images' | 'features'>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selected = useMemo(
    () => bungalows.find((item) => item.id === editingId) ?? null,
    [bungalows, editingId],
  );

  function openEdit(item: Bungalow) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      pricePerNight: String(item.pricePerNight),
      capacity: String(item.capacity),
      location: item.location,
      images: item.images,
      features: item.features,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab('general');
  }

  async function save() {
    if (!form.title.trim()) return;
    const payload: Omit<Bungalow, 'id'> = {
      title: form.title.trim(),
      description: form.description.trim(),
      pricePerNight: Number(form.pricePerNight || 0),
      capacity: Number(form.capacity || 1),
      location: form.location.trim(),
      images: form.images,
      features: form.features,
    };
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        if (onUpdatePersist) {
          await onUpdatePersist(editingId, payload);
        } else {
          onChange(
            bungalows.map((item) =>
              item.id === editingId ? { ...payload, id: editingId } : item,
            ),
          );
        }
      } else if (onCreatePersist) {
        await onCreatePersist(payload);
      } else {
        onChange([{ ...payload, id: crypto.randomUUID() }, ...bungalows]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Islem basarisiz');
    } finally {
      setSaving(false);
    }
  }

  async function onDropFiles(files: FileList | null) {
    if (!files) return;
    if (onUploadMediaPersist) {
      setSaving(true);
      setError('');
      try {
        const uploadedUrls: string[] = [];
        for (const file of Array.from(files)) {
          const uploaded = await onUploadMediaPersist(file);
          uploadedUrls.push(uploaded.url);
        }
        setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gorsel yukleme basarisiz');
      } finally {
        setSaving(false);
      }
      return;
    }

    const next = Array.from(files).map((file) => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...next] }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="xl:sticky xl:top-24 xl:h-fit">
        <CardHeader>
          <CardTitle>{editingId ? 'Bungalov Duzenle' : 'Bungalov Ekle'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-bgl-mist p-1">
            {(['general', 'images', 'features'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-2 py-2 text-xs font-semibold capitalize ${
                  activeTab === tab ? 'bg-bgl-moss text-white' : 'text-bgl-muted'
                }`}
              >
                {tab === 'general' ? 'genel' : tab === 'images' ? 'resimler' : 'ozellikler'}
              </button>
            ))}
          </div>

          {activeTab === 'general' ? (
            <div className="space-y-2">
              <Input
                placeholder="Baslik"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Aciklama"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Fiyat / gece"
                  value={form.pricePerNight}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pricePerNight: e.target.value }))
                  }
                />
                <Input
                  placeholder="Kapasite"
                  value={form.capacity}
                  onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Konum"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
          ) : null}

          {activeTab === 'images' ? (
            <div className="space-y-2">
              <label
                className="block cursor-pointer rounded-xl border-2 border-dashed border-bgl-mist bg-bgl-cream/30 p-4 text-center"
                onDrop={(e) => {
                  e.preventDefault();
                  void onDropFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <UploadCloud className="mx-auto mb-1 h-5 w-5 text-bgl-muted" />
                <p className="text-xs text-bgl-muted">Resimleri surukle-birak yap veya dosya sec</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-2 text-xs"
                  onChange={(e) => void onDropFiles(e.target.files)}
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((image, idx) => (
                  <div key={`${image}-${idx}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="onizleme" className="h-16 w-full rounded-md object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/70 px-1 text-[10px] text-white"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, itemIdx) => itemIdx !== idx),
                        }))
                      }
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === 'features' ? (
            <div className="space-y-2">
              {FEATURE_KEYS.map((feature) => (
                <div key={feature.key} className="rounded-xl border border-bgl-mist p-2.5">
                  {feature.key === 'view_type' ? (
                    <Input
                      placeholder="Manzara tipi (dere, dag...)"
                      value={String(form.features[feature.key] ?? '')}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          features: { ...prev.features, [feature.key]: e.target.value },
                        }))
                      }
                    />
                  ) : (
                    <label className="flex items-center gap-2 text-sm font-semibold text-bgl-ink">
                      <input
                        type="checkbox"
                        checked={Boolean(form.features[feature.key])}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            features: { ...prev.features, [feature.key]: e.target.checked },
                          }))
                        }
                      />
                      {feature.label}
                    </label>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <div className="sticky bottom-0 flex gap-2 bg-white/95 pb-1 pt-2">
            <Button className="flex-1 gap-2" onClick={() => void save()} disabled={saving}>
              <Plus className="h-4 w-4" />
              {editingId ? 'Degisiklikleri kaydet' : 'Bungalov ekle'}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Temizle
            </Button>
          </div>
          {saving ? <p className="text-xs text-bgl-muted">Kaydediliyor...</p> : null}
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {bungalows.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-bgl-ink">{item.title}</p>
                  <p className="text-xs text-bgl-muted">{item.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                    Duzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={saving}
                    onClick={async () => {
                      if (onDeletePersist) {
                        setSaving(true);
                        setError('');
                        try {
                          await onDeletePersist(item.id);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Silme basarisiz');
                        } finally {
                          setSaving(false);
                        }
                        return;
                      }
                      onChange(bungalows.filter((b) => b.id !== item.id));
                    }}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Sil
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-bgl-muted sm:grid-cols-4">
                <div className="rounded-lg border border-bgl-mist p-2">
                  Fiyat: <b>{item.pricePerNight} TL</b>
                </div>
                <div className="rounded-lg border border-bgl-mist p-2">
                  Kapasite: <b>{item.capacity}</b>
                </div>
                <div className="rounded-lg border border-bgl-mist p-2">
                  Resim: <b>{item.images.length}</b>
                </div>
                <div className="rounded-lg border border-bgl-mist p-2">
                  Ozellik:{' '}
                  <b>
                    {
                      Object.keys(item.features).filter(
                        (key) => key !== 'view_type' && item.features[key as BungalowFeatureKey],
                      ).length
                    }
                  </b>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {FEATURE_KEYS.map((feature) => {
                  const value = item.features[feature.key];
                  if (!value) return null;
                  if (feature.key === 'view_type') {
                    return (
                      <Badge key={feature.key} variant="outline">
                        Manzara: {String(value)}
                      </Badge>
                    );
                  }
                  return <Badge key={feature.key}>{feature.label}</Badge>;
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
