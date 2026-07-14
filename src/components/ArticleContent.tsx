import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

/**
 * Renders article content pasted from ChatGPT (or written in Markdown).
 *
 * Robustness goals:
 *  - `remark-gfm`   → tables, task lists, strikethrough, autolinks.
 *  - `remark-breaks`→ every single newline becomes a line break, so plain text
 *                     and loosely-formatted diagrams keep their layout instead
 *                     of collapsing into one paragraph.
 *  - Custom `code`  → ASCII diagrams / charts render in a monospace block with
 *                     preserved whitespace and horizontal scroll (never overflow).
 */
export function ArticleContent({ content }: { content: string }) {
  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const text = String(children ?? '');
            if (inline) {
              return <code className="md-inline-code" {...props}>{children}</code>;
            }
            return (
              <pre className="md-pre">
                <code className={className} {...props}>{text.replace(/\n$/, '')}</code>
              </pre>
            );
          },
        }}
      >
        {content ?? ''}
      </ReactMarkdown>
    </div>
  );
}
