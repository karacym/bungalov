import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const mdClass =
  'blog-md max-w-none space-y-4 text-sm leading-relaxed text-bgl-ink md:text-base ' +
  '[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold ' +
  '[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:text-bgl-muted [&_li]:text-bgl-muted ' +
  '[&_a]:font-medium [&_a]:text-bgl-moss [&_a]:underline [&_strong]:text-bgl-ink ' +
  '[&_code]:rounded [&_code]:bg-bgl-mist/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] ' +
  '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-bgl-mist [&_pre]:bg-bgl-cream/80 [&_pre]:p-4 ' +
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-bgl-sand [&_blockquote]:pl-4 [&_blockquote]:italic';

type Props = {
  markdown: string;
};

export function MarkdownBody({ markdown }: Props) {
  return (
    <div className={mdClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
