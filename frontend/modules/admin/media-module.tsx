'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MediaAsset } from './types';
import { useState } from 'react';

type Props = {
  items: MediaAsset[];
  onUploadPersist?: (file: File) => Promise<MediaAsset>;
  onDeletePersist?: (id: string) => Promise<void>;
};

export function MediaModule({ items, onUploadPersist, onDeletePersist }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function append(files: FileList | null) {
    if (!files) return;
    if (!onUploadPersist) return;

    setSaving(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        await onUploadPersist(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yukleme basarisiz');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medya Yoneticisi (WebP hazir)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label
          className="block cursor-pointer rounded-xl border-2 border-dashed border-bgl-mist bg-bgl-cream/30 p-5 text-center text-sm text-bgl-muted"
          onDrop={(e) => {
            e.preventDefault();
            void append(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          Dosyalari surukle-birak yap veya yuklemek icin tikla
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-2 block w-full text-xs"
            onChange={(e) => void append(e.target.files)}
          />
        </label>
        {saving ? <p className="text-xs text-bgl-muted">Dosyalar yukleniyor...</p> : null}
        {error ? <p className="text-xs text-rose-700">{error}</p> : null}

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {items.map((asset) => (
            <div key={asset.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt="medya ogesi" className="h-28 w-full rounded-xl object-cover" />
              <Button
                size="sm"
                variant="destructive"
                className="absolute right-1 top-1 h-7 px-2 text-[10px]"
                disabled={saving}
                onClick={async () => {
                  if (!onDeletePersist) return;
                  setSaving(true);
                  setError('');
                  try {
                    await onDeletePersist(asset.id);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Silme basarisiz');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Sil
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
