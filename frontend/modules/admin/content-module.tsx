'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Section = { id: string; title: string; description: string };

type Props = {
  sections: Section[];
  onChange: (sections: Section[]) => void;
};

export function ContentModule({ sections, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Icerik Yonetimi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((item) => (
          <div key={item.id} className="rounded-xl border border-bgl-mist p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bgl-muted">
              {item.id}
            </p>
            <Input
              value={item.title}
              onChange={(e) =>
                onChange(
                  sections.map((section) =>
                    section.id === item.id ? { ...section, title: e.target.value } : section,
                  ),
                )
              }
            />
            <Textarea
              className="mt-2"
              value={item.description}
              onChange={(e) =>
                onChange(
                  sections.map((section) =>
                    section.id === item.id
                      ? { ...section, description: e.target.value }
                      : section,
                  ),
                )
              }
            />
          </div>
        ))}
        <div className="sticky bottom-0 bg-white/95 py-2">
          <Button className="w-full">Icerik degisikliklerini kaydet</Button>
        </div>
      </CardContent>
    </Card>
  );
}
