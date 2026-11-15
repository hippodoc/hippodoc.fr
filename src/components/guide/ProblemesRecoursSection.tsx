import React from 'react';
import { bugsAdmin, messagesTypes, getProfilShortLabel } from '@/data/boussoleData';
import { CertitudeBadge } from './CertitudeBadge';
import { formatInline } from './FormattedText';
import { Bug, AlertCircle, CheckCircle2, RefreshCw, Search, ArrowRight, Mail } from 'lucide-react';
import { Croix } from './Croix';

/**
 * Portage statique de ProblemesRecoursSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Onglets "Bugs connus / Modèles de courrier" (JS, useState) → deux
 *    sous-sections empilées, toujours visibles.
 *  - Tri par pertinence profil : supprimé (îlot wizard autonome).
 *  - Accordéon (framer-motion) → `<details>/<summary>` natif.
 *  - `CopyButton` (API Clipboard, JS) → retiré ; le texte du courrier
 *    reste affiché en clair et sélectionnable/copiable manuellement.
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : des plis `.qa` ; états dans les jetons
 * de la DA (actif en alerte, résolu en vert, intermittent en ambre). La flèche
 * des actions est un dessin (la police n'a pas de flèche), le caractère reste
 * dans le texte, masqué à l'œil. Styles dans src/styles/guide.css.
 */

const statutConfig = {
  actif: { icon: AlertCircle, label: 'Actif', className: 'stop' },
  resolu: { icon: CheckCircle2, label: 'Résolu', className: 'ok' },
  intermittent: { icon: RefreshCw, label: 'Intermittent', className: 'wait' },
};

export function ProblemesRecoursSection() {
  // Orphan messages = not linked to any bug
  const linkedMessageIds = new Set(bugsAdmin.flatMap(b => b.messageIds || []));
  const orphanMessages = messagesTypes.filter(m => !linkedMessageIds.has(m.id));

  return (
    <section id="problemes" className="gd-sec">
      <div className="wrap">
        <div className="gd-sec-tete">
          <h2 className="gd-h2">
            <Bug className="gd-ic" /> Problèmes connus & recours
          </h2>
          <p className="gd-sous">Bugs signalés sur le terrain + modèles de courrier prêts à envoyer</p>
          {/* Introduction visible — cf. Caseopedia, même raison (MIGRATION.md § 9.am). */}
          <div className="gd-intro">
            <p>
              Certaines anomalies ne viennent pas de toi. Forfait structure affiché à zéro en
              première année d'installation, accès au compte URSSAF ou CARMF bloqué après une
              bascule de régime, indemnités journalières de la CPAM pré-remplies avec un montant
              qui ne correspond à rien, case réservée aux gérants de société qui se remplit
              toute seule pour une entreprise individuelle.
            </p>
            <p>
              Chaque cas décrit les symptômes, ce qu'on en sait de la cause, et la marche à
              suivre. Les modèles de courrier qui suivent sont prêts à copier : demande de
              retrait de majorations de retard, réclamation sur le forfait structure, demande de
              confirmation écrite avant de déclarer, signalement d'un blocage d'accès.
            </p>
          </div>
        </div>

        <h3 className="gd-sur">
          Bugs connus ({bugsAdmin.length})
        </h3>
        <div className="gd-grille g2 gd-bugs">
          {bugsAdmin.map(b => {
            const s = statutConfig[b.statut];
            const Icon = s.icon;
            const linkedMsgs = (b.messageIds || []).map(id => messagesTypes.find(m => m.id === id)).filter(Boolean);

            return (
              <details key={b.id} id={`bug-${b.id}`} className="qa gd-pli gd-bug">
                <summary>
                  <div className="gd-bug-tete">
                    <h4 className="gd-pli-nom">{b.titre}</h4>
                    <div className="gd-bug-etat">
                      <span className={`gd-puce ${s.className}`}>
                        <Icon className="gd-ic" /> {s.label}
                      </span>
                      <Croix />
                    </div>
                  </div>
                  <div>
                    <p className="gd-champ"><Search className="gd-ic" /> Symptômes</p>
                    <ul className="gd-tirets">{b.symptomes.map((sym, i) => (<li key={i}><span className="gd-tiret">—</span><span>{formatInline(sym)}</span></li>))}</ul>
                  </div>
                </summary>

                <div className="gd-pli-in">
                  <div>
                    <p className="gd-champ"><ArrowRight className="gd-ic" /> Actions possibles</p>
                    <ul className="gd-tirets">{b.actionsPossibles.map((a, i) => (<li key={i}><span className="gd-tiret ok"><span className="gd-sr">→</span><svg className="gd-fl" viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1.5 6h12.5M9.5 1.5 14 6l-4.5 4.5" /></svg></span><span>{formatInline(a)}</span></li>))}</ul>
                  </div>

                  {linkedMsgs.length > 0 && (
                    <div className="gd-courriers">
                      <p className="gd-champ">
                        <Mail className="gd-ic" /> Modèle de courrier à envoyer
                      </p>
                      {linkedMsgs.map(m => m && (
                        <div key={m.id} id={`msg-${m.id}`} className="gd-encart gd-courrier">
                          <p className="gd-courrier-nom">{m.destinataire} — {m.objet}</p>
                          <pre className="gd-lettre-corps court">{m.corps}</pre>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="gd-etiquettes">
                    <CertitudeBadge level={b.certitude} />
                    <span className="gd-profils">{b.profilsConcernes.map(id => getProfilShortLabel(id)).join(' · ')}</span>
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <h3 className="gd-sur">
          Modèles de courrier ({orphanMessages.length})
        </h3>
        <div className="gd-plis">
          {orphanMessages.map(m => (
            <details key={m.id} id={`msg-${m.id}`} className="qa gd-pli gd-modele">
              <summary>
                <div className="gd-modele-tete">
                  <Mail className="gd-ic" />
                  <div>
                    <p className="gd-pli-nom">{m.destinataire} — {m.objet}</p>
                    <p className="gd-petit">{m.contexte}</p>
                  </div>
                </div>
                <Croix />
              </summary>
              <div className="gd-pli-in">
                <pre className="gd-lettre-corps">
                  {m.corps}
                </pre>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
