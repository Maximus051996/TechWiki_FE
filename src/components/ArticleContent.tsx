import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders article content as Markdown so text pasted from ChatGPT (headings,
 * code fences, ASCII diagrams, lists, tables, blockquotes) formats correctly.
 *
 * Backwards compatible: if the content is actually HTML (older articles), it
 * still renders because react-markdown passes raw HTML-ish text through as
 * paragraphs; but new Markdown content now gets proper structure.
 */
export function ArticleContent({ content }: { content: string }) {
  return (
    <div className="article-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content ?? ''}</ReactMarkdown>
    </div>
  );
}
