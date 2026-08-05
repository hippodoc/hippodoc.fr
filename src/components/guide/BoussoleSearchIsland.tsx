import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { caseopedia, reglesOr, questionsFAQ, bugsAdmin, pepitesCachees, zonesGrises, messagesTypes, calendrierAnnuel, profils } from '@/data/boussoleData';
import { GLOSSAIRE_DECLARATIONS } from '@/data/glossaireDeclarationsData';

/**
 * Portage de src/pages/guide-declarations/components/BoussoleSearch.tsx (SPA
 * source). Déviation volontaire : dans la source, `value`/`onChange` et la
 * navigation (`onNavigate`) étaient levés dans `GuideDeclarationsBody` (pour
 * vider la recherche + scroller + poser un ring highlight). Ici, la
 * recherche est un îlot autonome (`client:visible`) : l'état vit en local et
 * la navigation appelle directement `scrollIntoView` sur l'id ciblé, qui
 * existe forcément dans le HTML statique de la page (rendu server-side).
 * Reste identique : moteur de recherche (mêmes champs indexés), debounce
 * 150ms, mode compact au scroll.
 */
export function BoussoleSearchIsland() {
  const [value, setValue] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const results = useMemo(() => {
    if (!debounced || debounced.length < 2) return [];
    const q = debounced.toLowerCase();
    const items: { type: string; title: string; sectionId: string; itemId?: string }[] = [];

    for (const c of caseopedia) {
      if (`${c.code} ${c.nom} ${c.description} ${c.conseil || ''} ${c.erreurFrequente || ''}`.toLowerCase().includes(q)) {
        items.push({ type: 'Case', title: `${c.code} — ${c.nom}`, sectionId: 'cases', itemId: `case-${c.code}` });
      }
    }
    for (const r of reglesOr) {
      if (`${r.titre} ${r.description} ${r.exemple || ''}`.toLowerCase().includes(q)) {
        items.push({ type: 'Fiche', title: r.titre, sectionId: 'fiches', itemId: `regle-${r.id}` });
      }
    }
    for (const qr of questionsFAQ) {
      if (`${qr.question} ${qr.reponse}`.toLowerCase().includes(q)) {
        items.push({ type: 'Question', title: qr.question, sectionId: 'questions', itemId: `question-${qr.id}` });
      }
    }
    for (const b of bugsAdmin) {
      if (`${b.titre} ${b.symptomes.join(' ')} ${b.actionsPossibles?.join(' ') || ''}`.toLowerCase().includes(q)) {
        items.push({ type: 'Problème', title: b.titre, sectionId: 'problemes', itemId: `bug-${b.id}` });
      }
    }
    for (const p of pepitesCachees) {
      if (`${p.titre} ${p.description}`.toLowerCase().includes(q)) {
        items.push({ type: 'Fiche', title: p.titre, sectionId: 'fiches', itemId: `pepite-${p.id}` });
      }
    }
    for (const z of zonesGrises) {
      if (`${z.sujet} ${z.conclusion} ${z.positionA || ''} ${z.positionB || ''}`.toLowerCase().includes(q)) {
        items.push({ type: 'Fiche', title: z.sujet, sectionId: 'fiches', itemId: `zone-${z.id}` });
      }
    }
    for (const m of messagesTypes) {
      if (`${m.destinataire} ${m.objet} ${m.corps || ''}`.toLowerCase().includes(q)) {
        items.push({ type: 'Courrier', title: `${m.destinataire} — ${m.objet}`, sectionId: 'problemes', itemId: `msg-${m.id}` });
      }
    }
    for (const g of GLOSSAIRE_DECLARATIONS) {
      if (`${g.id} ${g.term} ${g.shortDef} ${g.longDef || ''}`.toLowerCase().includes(q)) {
        items.push({ type: 'Glossaire', title: g.term, sectionId: 'glossaire', itemId: `glossaire-term-${g.id}` });
      }
    }
    for (const mois of calendrierAnnuel) {
      for (const d of mois.demarches) {
        if (`${d.titre} ${d.description}`.toLowerCase().includes(q)) {
          items.push({ type: 'Calendrier', title: `${mois.mois} — ${d.titre}`, sectionId: 'calendrier' });
        }
      }
    }
    for (const p of profils) {
      if (`${p.label} ${p.conseilsCles.join(' ')}`.toLowerCase().includes(q)) {
        items.push({ type: 'Profil', title: p.label, sectionId: 'profils' });
      }
    }
    return items.slice(0, 10);
  }, [debounced]);

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
    <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50 transition-all duration-200" role="search">
      <div className={`max-w-5xl mx-auto px-4 transition-all duration-200 ${compact ? 'py-1.5' : 'py-3'}`}>
        <div className="relative">
          <Search aria-hidden="true" className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          <Input
            type="search"
            aria-label="Rechercher dans le guide des déclarations"
            placeholder={compact ? 'Rechercher…' : 'Rechercher une case, un terme, un sujet, un mot-clé…'}
            value={value}
            onChange={e => setValue(e.target.value)}
            className={`pl-10 pr-10 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 transition-all ${compact ? 'h-8 text-xs' : 'h-10'}`}
          />
          {value && (<button type="button" aria-label="Effacer la recherche" onClick={() => setValue('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"><X className="h-4 w-4" /></button>)}
          <div className="sr-only" aria-live="polite" role="status">
            {debounced && debounced.length >= 2
              ? results.length === 0
                ? 'Aucun résultat'
                : `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`
              : ''}
          </div>
          {results.length > 0 && (
            <div role="listbox" aria-label="Résultats de recherche" className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
              {results.map((r, i) => (
                <button key={`${r.sectionId}-${r.itemId ?? 'none'}-${r.type}-${i}`} role="option" aria-selected="false" onClick={() => navigate(r.sectionId, r.itemId)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-hippo-50 transition-colors border-b border-slate-100 last:border-0 dark:hover:bg-hippo-900/20 dark:border-slate-700">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-hippo-100 text-hippo-700 shrink-0 dark:bg-hippo-900/40 dark:text-hippo-300">{r.type}</span>
                  <span className="text-sm text-foreground truncate">{r.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
