import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ResultatRecherche } from './rechercheGuide';

/**
 * Portage de src/pages/guide-declarations/components/BoussoleSearch.tsx (SPA
 * source). Déviation volontaire : dans la source, `value`/`onChange` et la
 * navigation (`onNavigate`) étaient levés dans `GuideDeclarationsBody` (pour
 * vider la recherche + scroller + poser un anneau de repérage). Ici, la
 * recherche est un îlot autonome (`client:visible`) : l'état vit en local et
 * la navigation appelle directement `scrollIntoView` sur l'id ciblé, qui
 * existe forcément dans le HTML statique de la page (rendu server-side).
 * Reste identique : moteur de recherche (mêmes champs indexés), debounce
 * 150ms, mode compact au scroll.
 *
 * Le moteur vit dans `rechercheGuide.ts`, chargé par `import()` après
 * l'hydratation (MIGRATION.md § 9.er) : l'îlot n'attend plus les données du guide
 * (100 Ko gzip) pour répondre. Tant que le module n'est pas là, une frappe ne donne
 * ni résultat ni « Aucun résultat » ; la liste sort dès son arrivée.
 *
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : seules les classes changent. La barre
 * reste collante à 70 px du haut, sous la pastille de l'en-tête, sur toute la
 * hauteur de <main> ; elle devient une pastille blanche qui flotte, comme
 * l'en-tête, et se resserre après 320 px de défilement (`compact`). Styles dans
 * src/styles/guide.css (`gd-rech`). Les trois classes posées sur la cible d'un
 * résultat (`ring-2`…) sont inchangées : guide.css en fait un contour d'encre.
 */
export function BoussoleSearchIsland() {
  const [value, setValue] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  // Le moteur et ses données (100 Ko gzip) arrivent après l'hydratation, pas avant :
  // le champ répond tout de suite, les résultats suivent dès que le module est là
  // (src/components/guide/rechercheGuide.ts, MIGRATION.md § 9.er).
  const [chercher, setChercher] = useState<null | ((q: string) => ResultatRecherche[])>(null);
  useEffect(() => {
    let monte = true;
    import('./rechercheGuide')
      .then((m) => { if (monte) setChercher(() => m.chercher); })
      .catch(() => { /* réseau : la recherche reste vide, la page se lit sans elle */ });
    return () => { monte = false; };
  }, []);

  const results = useMemo(() => {
    if (!chercher || !debounced || debounced.length < 2) return [];
    return chercher(debounced);
  }, [debounced, chercher]);

  // Compact mode after scroll for less visual weight
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (sectionId: string, itemId?: string) => {
    setValue('');
    setTimeout(() => {
      const target = itemId ? document.getElementById(itemId) : document.getElementById(sectionId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (itemId) {
        target?.classList.add('ring-2', 'ring-hippo-400', 'ring-offset-2');
        setTimeout(() => target?.classList.remove('ring-2', 'ring-hippo-400', 'ring-offset-2'), 2000);
      }
    }, 100);
  };

  return (
    <div className="gd-rech da-bloc" role="search">
      <div className={`wrap gd-rech-in ${compact ? 'compact' : ''}`}>
        <div className="gd-rech-champ">
          <Search aria-hidden="true" className="gd-ic gd-rech-loupe" />
          <Input
            type="search"
            aria-label="Rechercher dans le guide des déclarations"
            placeholder={compact ? 'Rechercher…' : 'Rechercher une case, un terme, un sujet, un mot-clé…'}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="gd-rech-saisie"
          />
          {value && (<button type="button" aria-label="Effacer la recherche" onClick={() => setValue('')} className="gd-rech-effacer"><X className="gd-ic" /></button>)}
          <div className="gd-sr" aria-live="polite" role="status">
            {chercher && debounced && debounced.length >= 2
              ? results.length === 0
                ? 'Aucun résultat'
                : `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`
              : ''}
          </div>
          {results.length > 0 && (
            <div role="listbox" aria-label="Résultats de recherche" className="gd-rech-liste">
              {results.map((r, i) => (
                <button key={`${r.sectionId}-${r.itemId ?? 'none'}-${r.type}-${i}`} role="option" aria-selected="false" onClick={() => navigate(r.sectionId, r.itemId)}
                  className="gd-rech-res">
                  <span className="gd-puce plan">{r.type}</span>
                  <span className="gd-rech-res-nom">{r.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
