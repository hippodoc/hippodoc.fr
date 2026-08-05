import { visit } from 'unist-util-visit';

/**
 * Transforme les directives :::warning / :::tip / :::essentiel en blocs
 * <aside class="callout callout-<type>"> stylés (équivalents des encadrés
 * warning/tip de la SPA source et du résumé « L'essentiel » des guides).
 */
export function remarkCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      const type = node.name;
      if (!['warning', 'tip', 'essentiel'].includes(type)) return;
      node.data = node.data || {};
      node.data.hName = 'aside';
      node.data.hProperties = {
        class: `callout callout-${type}`,
      };
    });
  };
}
