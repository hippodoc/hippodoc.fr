import React from 'react';
import { bugsAdmin, messagesTypes, getProfilShortLabel } from '@/data/boussoleData';
import { CertitudeBadge } from './CertitudeBadge';
import { formatInline } from './FormattedText';
import { Bug, AlertCircle, CheckCircle2, RefreshCw, Search, ArrowRight, Mail, ChevronDown } from 'lucide-react';

/**
 * Portage statique de ProblemesRecoursSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Onglets "Bugs connus / Modèles de courrier" (JS, useState) → deux
 *    sous-sections empilées, toujours visibles.
 *  - Tri par pertinence profil : supprimé (îlot wizard autonome).
 *  - Accordéon (framer-motion) → `<details>/<summary>` natif.
 *  - `CopyButton` (API Clipboard, JS) → retiré ; le texte du courrier
 *    reste affiché en clair et sélectionnable/copiable manuellement.
 */

const statutConfig = {
  actif: { icon: AlertCircle, label: 'Actif', className: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
  resolu: { icon: CheckCircle2, label: 'Résolu', className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  intermittent: { icon: RefreshCw, label: 'Intermittent', className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
};

export function ProblemesRecoursSection() {
  // Orphan messages = not linked to any bug
  const linkedMessageIds = new Set(bugsAdmin.flatMap(b => b.messageIds || []));
  const orphanMessages = messagesTypes.filter(m => !linkedMessageIds.has(m.id));

  return (
    <section id="problemes" className="py-12 md:py-16 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bug className="h-7 w-7 text-hippo-500" /> Problèmes connus & recours
          </h2>
          <p className="text-muted-foreground mt-1">Bugs signalés sur le terrain + modèles de courrier prêts à envoyer</p>
          {/* Introduction visible — cf. Caseopedia, même raison (MIGRATION.md § 9.am). */}
          <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
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

        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Bugs connus ({bugsAdmin.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {bugsAdmin.map(b => {
            const s = statutConfig[b.statut];
            const Icon = s.icon;
            const linkedMsgs = (b.messageIds || []).map(id => messagesTypes.find(m => m.id === id)).filter(Boolean);

            return (
              <details key={b.id} id={`bug-${b.id}`} className="group rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 shadow-sm overflow-hidden dark:bg-slate-800/60 dark:border-slate-700/60 scroll-mt-24">
                <summary className="w-full p-5 text-left cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-foreground text-sm">{b.titre}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.className}`}>
                        <Icon className="h-3 w-3" /> {s.label}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Search className="h-3 w-3" /> Symptômes</p>
                    <ul className="space-y-0.5">{b.symptomes.map((sym, i) => (<li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-muted-foreground mt-0.5">—</span><span>{formatInline(sym)}</span></li>))}</ul>
                  </div>
                </summary>

                <div className="px-5 pb-5 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Actions possibles</p>
                    <ul className="space-y-0.5">{b.actionsPossibles.map((a, i) => (<li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">→</span><span>{formatInline(a)}</span></li>))}</ul>
                  </div>

                  {linkedMsgs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Modèle de courrier à envoyer
                      </p>
                      {linkedMsgs.map(m => m && (
                        <div key={m.id} id={`msg-${m.id}`} className="rounded-lg bg-cyan-50/50 border border-cyan-100 p-3 dark:bg-cyan-950/20 dark:border-cyan-900/40 scroll-mt-24">
                          <p className="text-xs font-semibold text-foreground mb-2">{m.destinataire} — {m.objet}</p>
                          <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto select-text">{m.corps}</pre>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <CertitudeBadge level={b.certitude} />
                    <span className="text-[10px] text-muted-foreground truncate">{b.profilsConcernes.map(id => getProfilShortLabel(id)).join(' · ')}</span>
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Modèles de courrier ({orphanMessages.length})
        </h3>
        <div className="space-y-3">
          {orphanMessages.map(m => (
            <details key={m.id} id={`msg-${m.id}`} className="group rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 shadow-sm overflow-hidden dark:bg-slate-800/60 dark:border-slate-700/60 scroll-mt-24">
              <summary className="w-full px-4 py-4 text-left flex items-center justify-between gap-3 cursor-pointer list-none">
                <div className="flex items-center gap-3 flex-1">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{m.destinataire} — {m.objet}</p>
                    <p className="text-xs text-muted-foreground">{m.contexte}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed p-4 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-700 select-text">
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
