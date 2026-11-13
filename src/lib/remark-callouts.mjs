import { visit } from 'unist-util-visit';

/**
 * Transforme les directives :::warning / :::tip / :::essentiel en blocs
 * <div class="callout callout-<type>" role="note"> stylés (équivalents des encadrés
 * warning/tip de la SPA source et du résumé « L'essentiel » des guides).
 *
 * Un <div>, et non plus un <aside> (MIGRATION.md § 9.fj) : les modes lecture des
 * navigateurs et les extracteurs de texte (dont ceux des moteurs de réponse) jettent
 * les <aside> comme du contenu annexe, soit 18 % des mots des articles. `role="note"`
 * garde aux lecteurs d'écran le sens d'un encadré.
 */
export function remarkCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      const type = node.name;
      if (!['warning', 'tip', 'essentiel'].includes(type)) return;
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        class: `callout callout-${type}`,
        role: 'note',
      };
    });
  };
}
