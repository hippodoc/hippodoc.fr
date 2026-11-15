import type { ReactNode } from "react";

/**
 * Place gardée (MIGRATION.md § 9.gm). Un texte qui change après l'affichage des résultats (un
 * montant « … € » qui arrive) garde la place de sa forme la plus longue :
 * le gabarit, rendu sans être vu ni lu (`visibility: hidden`, `aria-hidden`), occupe la même case
 * de grille que le texte (`.sim-place`, simulateur.css). La case a la taille du plus grand des deux,
 * avant comme après l'arrivée de la valeur : rien ne bouge autour d'elle. Sans elle, la phrase
 * gagnait ou perdait une ligne et tout ce qui la suit sautait (un décalage de mise en page compté
 * dans le CLS, puisqu'il arrive plus de 500 ms après le clic).
 *
 * Le gabarit dit la même phrase avec le montant le plus large possible (`montantLePlusLarge`) : une
 * valeur réelle n'est jamais plus large, la phrase n'a jamais plus de lignes que lui. Le texte, en
 * tête de sa case, se lit comme avant ; une ligne vide peut rester sous une valeur plus courte.
 */
export function PlaceGardee({ gabarit, children }: { gabarit: ReactNode; children: ReactNode }) {
  return (
    <span className="sim-place">
      <span className="sim-place-gabarit" aria-hidden="true">{gabarit}</span>
      <span className="sim-place-texte">{children}</span>
    </span>
  );
}

/**
 * Le nombre le plus large qui s'écrive avec autant de chiffres que `max` : un 4 en tête, puis des 0.
 * Dans Google Sans Flex, le 0 est le chiffre le plus large (0,65 em contre 0,37 pour le 1), et le 4
 * le plus large des chiffres de tête possibles. 30 000 € donne donc 40 000 €.
 */
export function montantLePlusLarge(max: number): number {
  const chiffres = String(Math.max(1, Math.round(Math.abs(max)))).length;
  return 4 * 10 ** (chiffres - 1);
}
