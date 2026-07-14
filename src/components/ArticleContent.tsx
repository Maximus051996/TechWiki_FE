/**
 * Renders article content authored by the rich-text editor (TipTap), which
 * produces clean, well-structured HTML. The `.article-content` styles handle
 * headings, lists, code blocks / ASCII diagrams (monospace, contained,
 * horizontally scrollable), blockquotes, tables and images.
 *
 * The content is authored only by trusted admins through the editor.
 */
export function ArticleContent({ content }: { content: string }) {
  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: content ?? '' }}
    />
  );
}
