/**
 * Mini-parseur markdown → HTML porté de src/components/blog/BlogContent.tsx
 * (SPA source) : **gras**, *italique*, retours à la ligne. Utilisé pour les
 * réponses FAQ stockées en frontmatter.
 */
export function miniMarkdownToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

/** Supprime le balisage markdown pour les usages texte brut (JSON-LD). */
export function stripMiniMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}
