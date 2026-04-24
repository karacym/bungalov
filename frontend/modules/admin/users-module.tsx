'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type UserRow = { id: string; name: string; email: string; role: 'admin' | 'editor' };

type Props = {
  users: UserRow[];
  onChange: (users: UserRow[]) => void;
};

export function UsersModule({ users, onChange }: Props) {
  const [draft, setDraft] = useState({ name: '', email: '', role: 'editor' as 'admin' | 'editor' });

  function addUser() {
    if (!draft.name.trim() || !draft.email.trim()) return;
    onChange([{ id: crypto.randomUUID(), ...draft }, ...users]);
    setDraft({ name: '', email: '', role: 'editor' });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Kullanici Olustur / Duzenle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Ad soyad"
            value={draft.name}
            onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            placeholder="E-posta"
            value={draft.email}
            onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
          />
          <select
            className="bgl-input"
            value={draft.role}
            onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value as 'admin' | 'editor' }))}
          >
            <option value="admin">admin</option>
            <option value="editor">editor</option>
          </select>
          <Button className="w-full" onClick={addUser}>
            Kullaniciyi kaydet
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yonetim Ekibi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-bgl-mist p-3">
              <div>
                <p className="text-sm font-semibold text-bgl-ink">{item.name}</p>
                <p className="text-xs text-bgl-muted">{item.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-bgl-mist px-2 py-1 text-xs font-semibold text-bgl-muted">
                  {item.role}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onChange(users.filter((u) => u.id !== item.id))}
                >
                  Kaldir
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
