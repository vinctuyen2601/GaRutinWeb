/**
 * SEO helpers.
 *
 * Product/post content from the CMS is HTML. Feeding it straight into a
 * <meta description> or og:description leaks raw markup into Google snippets
 * and into Facebook/Zalo share cards, so always run it through stripHtml first.
 */

const MAX_META_LENGTH = 155;

/** Turn CMS HTML into a single line of plain text. */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
