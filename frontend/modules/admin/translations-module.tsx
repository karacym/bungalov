'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { TranslationRow } from './types';

type Props = {
  rows: TranslationRow[];
  onChange: (rows: TranslationRow[]) => void;
};

export function TranslationsModule({ rows, onChange }: Props) {
  function updateRow(key: string, patch: Partial<TranslationRow>) {
    onChange(rows.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ceviriler (TR / EN / AR)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((item) => (
          <div key={item.key} className="rounded-xl border border-bgl-mist p-3">
            <p className="mb-2 text-xs font-mono font-semibold text-bgl-moss">{item.key}</p>
            <div className="grid gap-2 md:grid-cols-3">
              <Input value={item.tr} onChange={(e) => updateRow(item.key, { tr: e.target.value })} />
              <Input value={item.en} onChange={(e) => updateRow(item.key, { en: e.target.value })} />
              <Input value={item.ar} onChange={(e) => updateRow(item.key, { ar: e.target.value })} />
            </div>
          </div>
        ))}
        <div className="sticky bottom-0 bg-white/95 py-2">
          <Button className="w-full">Cevirileri kaydet</Button>
        </div>
      </CardContent>
    </Card>
  );
}
