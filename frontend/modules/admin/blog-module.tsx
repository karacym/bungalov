'use client';

import { BlogBodyEditor } from '@/components/blog/blog-body-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BlogPostRecord } from '@/modules/admin/types';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type LocaleTab = 'tr' | 'en' | 'ar';

type FormState = {
  id: string | null;
  slug: string;
  status: 'draft' | 'published';
  publishedAtLocal: string;
  titleTr: string;
  titleEn: string;
  titleAr: string;
  excerptTr: string;
  excerptEn: string;
  excerptAr: string;
  bodyTr: string;
  bodyEn: string;
  bodyAr: string;
  metaTitleTr: string;
  metaTitleEn: string;
  metaTitleAr: string;
  metaDescTr: string;
  metaDescEn: string;
  metaDescAr: string;
};

function toLocalDatetimeInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromRecord(row: BlogPostRecord): FormState {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    publishedAtLocal: toLocalDatetimeInput(row.publishedAt),
    titleTr: row.titleTr,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    excerptTr: row.excerptTr,
    excerptEn: row.excerptEn,
    excerptAr: row.excerptAr,
    bodyTr: row.bodyTr,
    bodyEn: row.bodyEn,
    bodyAr: row.bodyAr,
    metaTitleTr: row.metaTitleTr ?? '',
    metaTitleEn: row.metaTitleEn ?? '',
    metaTitleAr: row.metaTitleAr ?? '',
    metaDescTr: row.metaDescTr ?? '',
    metaDescEn: row.metaDescEn ?? '',
    metaDescAr: row.metaDescAr ?? '',
  };
}

function emptyForm(): FormState {
  return {
    id: null,
    slug: '',
    status: 'draft',
    publishedAtLocal: '',
    titleTr: '',
    titleEn: '',
    titleAr: '',
    excerptTr: '',
    excerptEn: '',
    excerptAr: '',
    bodyTr: '# ',
    bodyEn: '# ',
    bodyAr: '# ',
    metaTitleTr: '',
    metaTitleEn: '',
    metaTitleAr: '',
    metaDescTr: '',
    metaDescEn: '',
    metaDescAr: '',
  };
}

function trimMeta(s: string): string | undefined {
  const t = s.trim();
  return t ? t : undefined;
}

type Props = {
  posts: BlogPostRecord[];
  onCreate: (payload: Record<string, unknown>) => Promise<BlogPostRecord>;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<BlogPostRecord>;
  onDelete: (id: string) => Promise<void>;
};

export function BlogModule({ posts, onCreate, onUpdate, onDelete }: Props) {
  const t = useTranslations('admin.blog');
  const [tab, setTab] = useState<LocaleTab>('tr');
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const sorted = useMemo(
    () => [...posts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [posts],
  );

  function openNew() {
    setForm(emptyForm());
    setError('');
  }

  function openEdit(row: BlogPostRecord) {
    setForm(fromRecord(row));
    setError('');
  }

  function closeForm() {
    setForm(null);
    setError('');
  }

  function patchForm(patch: Partial<FormState>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function locSuffix(l: LocaleTab) {
    return l === 'tr' ? 'Tr' : l === 'en' ? 'En' : 'Ar';
  }

  function fieldKey(base: 'title' | 'excerpt' | 'body' | 'metaTitle' | 'metaDesc', l: LocaleTab): keyof FormState {
    return `${base}${locSuffix(l)}` as keyof FormState;
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const publishedIso =
        form.publishedAtLocal.trim() === '' ? undefined : new Date(form.publishedAtLocal).toISOString();
      const payload: Record<string, unknown> = {
        slug: form.slug.trim() || undefined,
        status: form.status,
        publishedAt: publishedIso,
        titleTr: form.titleTr.trim(),
        titleEn: form.titleEn.trim(),
        titleAr: form.titleAr.trim(),
        excerptTr: form.excerptTr,
        excerptEn: form.excerptEn,
        excerptAr: form.excerptAr,
        bodyTr: form.bodyTr,
        bodyEn: form.bodyEn,
        bodyAr: form.bodyAr,
        metaTitleTr: trimMeta(form.metaTitleTr),
        metaTitleEn: trimMeta(form.metaTitleEn),
        metaTitleAr: trimMeta(form.metaTitleAr),
        metaDescTr: trimMeta(form.metaDescTr),
        metaDescEn: trimMeta(form.metaDescEn),
        metaDescAr: trimMeta(form.metaDescAr),
      };
      if (!payload.titleTr || !payload.titleEn || !payload.titleAr) {
        throw new Error(t('validationTitles'));
      }
      if (!payload.bodyTr || !payload.bodyEn || !payload.bodyAr) {
        throw new Error(t('validationBodies'));
      }
      if (form.id) {
        const updated = await onUpdate(form.id, payload);
        setForm(fromRecord(updated));
      } else {
        const created = await onCreate(payload);
        setForm(fromRecord(created));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!form?.id) return;
    if (!window.confirm(t('confirmDelete'))) return;
    setDeletingId(form.id);
    setError('');
    try {
      await onDelete(form.id);
      closeForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('deleteError'));
    } finally {
      setDeletingId('');
    }
  }

  const titleKey = fieldKey('title', tab);
  const excerptKey = fieldKey('excerpt', tab);
  const bodyKey = fieldKey('body', tab);
  const metaTitleKey = fieldKey('metaTitle', tab);
  const metaDescKey = fieldKey('metaDesc', tab);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>{t('moduleTitle')}</CardTitle>
            <p className="mt-1 text-sm text-bgl-muted">{t('moduleIntro')}</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={openNew}>
            {t('newPost')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {sorted.length === 0 ? (
            <p className="text-sm text-bgl-muted">{t('noRows')}</p>
          ) : (
            <ul className="divide-y divide-bgl-mist rounded-xl border border-bgl-mist">
              {sorted.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <div>
                    <p className="font-medium text-bgl-ink">{row.titleTr}</p>
                    <p className="text-xs text-bgl-muted">
                      /{row.slug} · {row.status}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(row)}>
                    {t('edit')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {form ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle>{form.id ? t('editTitle') : t('createTitle')}</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              {t('close')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('slug')}</label>
                <Input value={form.slug} onChange={(e) => patchForm({ slug: e.target.value })} placeholder="ornek-yazi" />
              </div>
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('status')}</label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-bgl-mist bg-white px-3 text-sm"
                  value={form.status}
                  onChange={(e) => patchForm({ status: e.target.value as 'draft' | 'published' })}
                >
                  <option value="draft">{t('statusDraft')}</option>
                  <option value="published">{t('statusPublished')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-bgl-muted">{t('publishedAt')}</label>
                <Input
                  type="datetime-local"
                  value={form.publishedAtLocal}
                  onChange={(e) => patchForm({ publishedAtLocal: e.target.value })}
                />
                <p className="mt-1 text-xs text-bgl-muted">{t('publishedAtHint')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-bgl-mist pb-2">
              {(['tr', 'en', 'ar'] as const).map((loc) => (
                <Button
                  key={loc}
                  type="button"
                  size="sm"
                  variant={tab === loc ? 'default' : 'outline'}
                  onClick={() => setTab(loc)}
                >
                  {loc.toUpperCase()}
                </Button>
              ))}
            </div>

            <div className="grid gap-3">
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('fieldTitle')}</label>
                <Input
                  value={String(form[titleKey])}
                  onChange={(e) => patchForm({ [titleKey]: e.target.value } as Partial<FormState>)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('fieldExcerpt')}</label>
                <Textarea
                  rows={3}
                  value={String(form[excerptKey])}
                  onChange={(e) => patchForm({ [excerptKey]: e.target.value } as Partial<FormState>)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('fieldMetaTitle')}</label>
                <Input
                  value={String(form[metaTitleKey])}
                  onChange={(e) => patchForm({ [metaTitleKey]: e.target.value } as Partial<FormState>)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('fieldMetaDesc')}</label>
                <Textarea
                  rows={2}
                  value={String(form[metaDescKey])}
                  onChange={(e) => patchForm({ [metaDescKey]: e.target.value } as Partial<FormState>)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-bgl-muted">{t('fieldBody')}</label>
                <BlogBodyEditor
                  value={String(form[bodyKey])}
                  onChange={(v) => patchForm({ [bodyKey]: v } as Partial<FormState>)}
                  height={380}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void handleSave()} disabled={saving}>
                {saving ? t('saving') : t('save')}
              </Button>
              {form.id ? (
                <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={!!deletingId}>
                  {deletingId ? t('deleting') : t('delete')}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
