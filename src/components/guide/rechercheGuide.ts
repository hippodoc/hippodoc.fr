import { caseopedia, reglesOr, questionsFAQ, bugsAdmin, pepitesCachees, zonesGrises, messagesTypes, calendrierAnnuel, profils } from '@/data/boussoleData';
import { GLOSSAIRE_DECLARATIONS } from '@/data/glossaireDeclarationsData';

/**
 * Moteur de la recherche du guide des déclarations : les boucles de
 * `BoussoleSearchIsland.tsx`, déplacées ici telles quelles (mêmes champs indexés,
 * même ordre, dix résultats au plus).
 *
 * Pourquoi un module à part (MIGRATION.md § 9.er) : il importe toutes les données du
 * guide (100 Ko gzip). Importé par l'îlot, il retardait d'autant l'hydratation du
 * champ de recherche, qui n'en a besoin qu'à la première frappe. L'îlot le charge
 * maintenant par `import()`, juste après s'être hydraté.
 */
export interface ResultatRecherche { type: string; title: string; sectionId: string; itemId?: string }

export function chercher(requete: string): ResultatRecherche[] {
    const q = requete.toLowerCase();
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
}
