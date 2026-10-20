import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { codeToHtml } from 'shiki';
export const headingId = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
export async function renderMarkdown(source: string, base: string) {
  const marked = new Marked();
  marked.use(markedKatex({ throwOnError: false }));
  const escape = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  marked.use({
    async: true,
    async walkTokens(token) {
      if (token.type === 'code') {
        const lang = token.lang?.split(' ')[0] || 'text';
        (token as any).rendered =
          lang === 'mermaid'
            ? `<pre class="mermaid">${escape(token.text)}</pre>`
            : await codeToHtml(token.text, { lang, theme: 'github-light' }).catch(
                () => `<pre><code>${escape(token.text)}</code></pre>`,
              );
      }
    },
    renderer: {
      code(token) {
        return (token as any).rendered || `<pre><code>${escape(token.text)}</code></pre>`;
      },
      heading({ text, depth }) {
        return `<h${depth} id="${headingId(text)}">${text}</h${depth}>`;
      },
      link({ href, text }) {
        const dest = href.startsWith('topic:')
          ? `${base}topics/${href.slice(6)}/`
          : href.endsWith('.md')
            ? `${base}topics/${href.split('/').pop()!.slice(0, -3)}/`
            : href;
        return `<a href="${escape(dest)}">${text}</a>`;
      },
    },
  });
  return await marked.parse(source);
}
