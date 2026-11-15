/**
 * Réponse d'une question du guide des déclarations, telle que le schéma FAQPage la porte.
 *
 * Le schéma doit dire ce que l'écran dit (`verify-site.mjs`, contrôle « 4 septies »). La
 * source (`reponse`, dans `src/data/boussoleData.ts`) et l'écran disent la même chose,
 * sauf en deux endroits, où `FormattedText.tsx` réécrit le texte. Cette fonction y fait
 * la même réécriture, en passant par le même code, et ne touche à rien d'autre :
 *  - un renvoi interne (« QT-014 ») devient ce que le lien affiche (« Question · Le choix
 *    du régime fiscal »), lu dans le rendu d'`InlineRef` ;
 *  - une énumération que l'écran met en liste (« X : A, B, C. ») perd ses virgules et son
 *    point, une puce par élément, d'après `enumerationsRendues`.
 * Le balisage de l'auteur (`**gras**`, accents graves, ⚠️, 💡, puces) reste tel quel :
 * le contrôle le retire avant de comparer.
 *
 * N'est appelée que dans le frontmatter des pages (au build), jamais par un îlot.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InlineRef } from '@/components/guide/CrossLinks';
import { enumerationsRendues } from '@/components/guide/FormattedText';

/* Un renvoi n'est rendu en lien que hors du balisage de l'auteur et hors d'une citation
   « … » : dedans, `formatInline` laisse l'identifiant tel quel. On saute donc ces passages. */
const RENVOI =
  /(\*\*[^*]+?\*\*|\*(?!\s)[^*\n]+?(?<!\s)\*|`[^`]+?`|«\s.*?\s»)|(?<![\p{L}\p{N}_])(?:RO|PC|ZG|QT|CASE)-\d{3}(?![\p{L}\p{N}_])/gu;

const ENTITES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'" };

/** Le texte que le lien d'un renvoi affiche ; l'identifiant lui-même s'il ne mène nulle part. */
function nomDuRenvoi(token: string): string {
  const html = renderToStaticMarkup(createElement(InlineRef, { token }));
  if (!html.startsWith('<a')) return token;
  return html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#x27);/g, (e) => ENTITES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

export function reponsePourSchema(reponse: string): string {
  let texte = reponse;
  let depuis = 0;
  for (const { para, before, items } of enumerationsRendues(reponse)) {
    const ou = texte.indexOf(para, depuis);
    if (ou < 0) continue; // paragraphe retouché par le rendu (gras rééquilibré) : laissé tel quel
    const liste = `${before.trimEnd()}\n${items.map((item) => `• ${item}`).join('\n')}`;
    texte = texte.slice(0, ou) + liste + texte.slice(ou + para.length);
    depuis = ou + liste.length;
  }
  return texte.replace(RENVOI, (tout, passage) => (passage ? tout : nomDuRenvoi(tout)));
}
