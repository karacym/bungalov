'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

export function BlogBodyEditor({ value, onChange, height = 320 }: Props) {
  return (
    <div className="rounded-xl border border-bgl-mist overflow-hidden" data-color-mode="light">
      <MDEditor value={value} onChange={(v) => onChange(typeof v === 'string' ? v : '')} height={height} preview="edit" />
    </div>
  );
}
