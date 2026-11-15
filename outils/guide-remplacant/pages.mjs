/**
 * Le guide du remplaçant : le contenu, page par page.
 *
 * Une page = un objet : { id, rendu({ n, N, pied }) }, fabriqué par une des fonctions ci-dessous
 * (couverture, sable, fin). Les renvois s'écrivent&nbsp;[[p:id]] (« p. 12 », cliquable) ou [[n:id]].
 * Les montants viennent du moteur du simulateur du site (voir verification.md) ; les règles, des
 * sources citées en dernière page. Un texte change ici, et seulement ici.
 */

export const META = {
  titrePdf: 'Le guide du remplaçant 2026-2027 · Hippodoc',
  titreCourt: 'Le guide du remplaçant · Hippodoc',
  utm: 'utm_source=guide-pdf&utm_medium=pdf&utm_campaign=guide-remplacant',
};
/** Ce que l'option --site de construire.mjs dépose dans le site : [id de la page, fichier, largeur]. */
export const GUIDE_SITE = {
  pdf: 'guide/guide-du-remplacant-2026-2027.pdf',
  images: [
    ['couverture', 'couverture.png', 900],
    ['essentiel', 'apercu-7-regles.png', 640],
    ['journee', 'apercu-journee-600.png', 640],
    ['calendrier', 'apercu-calendrier.png', 640],
  ],
};
const U = (chemin) => `https://hippodoc.fr${chemin}${chemin.includes('?') ? '&' : '?'}${META.utm}`;

/* ───────── Signes dessinés (la police n'a ni flèche ni coche) ───────── */
const FL = '<svg class="fl" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 6h12.5M9.5 1.5 14 6l-4.5 4.5"/></svg>';
const ICO = {
  piege: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 6.5v7"/><path d="M12 17.6v.1"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 10.5v7"/><path d="M12 6.4v.1"/></svg>',
  astuce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};
const alerte = (type, html, bleu = false) => `<div class="alerte"><span class="ico${bleu ? ' bleu' : ''}">${ICO[type]}</span><p>${html}</p></div>`;

/* ───────── Gabarits de page ───────── */
const bulles = (liste) => `<span class="bulles" aria-hidden="true">${liste.map(([x, y, d]) => `<i style="left:${x}px;top:${y}px;--d:${d}px"></i>`).join('')}</span>`;

/**
 * Page sur le sable (ou l'eau profonde avec profond: true).
 * ouvre : { partie, titre, sous, masc, mw, mx, my } pour la première page d'une partie (ciel en haut, mascotte).
 */
function sable({ id, h = 3, rep, titre, chapo = '', corps, profond = false, ouvre = null, bulles: b = null }) {
  return {
    id,
    ouvre,
    rendu: ({ pied, decor }) => {
      const cls = ['page', profond ? 'profond' : '', ouvre ? 'ouvre' : '', ouvre?.cote === 'gauche' ? 'a-gauche' : ''].filter(Boolean).join(' ');
      const ciel = ouvre ? `${ouvre.masc ? `<img class="decor-ouvre" src="${decor}/ouvre-${id}.jpg" alt="">` : ''}
<div class="ciel"><span class="partie">${ouvre.partie}</span><h2 class="pt-titre">${ouvre.titre}</h2><p class="pt-sous">${ouvre.sous}</p></div>` : '';
      const repere = rep ? `<p class="rep">${rep}</p>` : '';
      return `<section class="${cls}" id="${id}">${ciel}${b ? bulles(b) : ''}
<div class="feuille"><div class="contenu">
<header class="tete">${repere}<h${h} class="t">${titre}</h${h}>${chapo ? `<p class="chapo">${chapo}</p>` : ''}</header>
${corps}
</div>${pied}</div></section>`;
    },
  };
}

function couverture() {
  return {
    id: 'couverture',
    rendu: () => `<section class="page couv" id="couverture">
<img class="decor" src="assets/decor-couverture.jpg" alt="">
<div class="haut"><span class="plaque"><span class="logo-word">Hippo<span>doc</span></span></span><span class="ed">Édition 2026-2027</span></div>
<div class="titre">
<p class="sur">Pour les internes et les jeunes remplaçants</p>
<h1>Le guide du<br><span class="eau">remplaçant</span></h1>
<p class="promesse">Licence, contrat, URSSAF, CARMF, impôts : tout pour démarrer tes remplas, et savoir <b>ce qu'il te reste vraiment</b>.</p>
</div>
</section>`,
  };
}

function fin() {
  return {
    id: 'fin',
    rendu: () => `<section class="page fin" id="fin">
<img class="decor" src="assets/decor-fin.jpg" alt="">
<div class="titre">
<p class="sur">Et pour ne plus y penser</p>
<h2 class="t fin-t">Tu factures.<br><span class="eau">Hippodoc calcule le reste.</span></h2>
<p class="promesse">Après chaque journée de remplacement : URSSAF, CARMF, impôts, et ton Super-Net.</p>
<a class="btn btn-brand" href="${U('/essai')}">Essayer 30 jours gratuitement</a>
<p class="fin-pied">Ce guide t’a servi ? Envoie-le à un co-interne : <a class="lien" href="https://hippodoc.fr/guide?utm_source=guide-pdf&amp;utm_medium=partage&amp;utm_campaign=guide-remplacant">hippodoc.fr/guide</a></p>
</div>
</section>`,
  };
}


/* ───────── Petits composants ───────── */
const kv = (k, v) => `<div class="ln kv"><span class="k">${k}</span><span class="v">${v}</span></div>`;
/** Barre empilée : [classe, valeur, libellé]. Les largeurs suivent les montants. */
const pile = (parts) => `<div class="pile">${parts.map(([c, v, l = '']) => `<i class="${c}" style="flex:${v} 1 0">${l}</i>`).join('')}</div>`;
const P = { partie1: 'Partie 1 · Avant ton premier rempla', partie2: 'Partie 2 · Pendant tes remplas', partie3: 'Partie 3 · Sous la surface', partie4: 'Partie 4 · Garder la tête hors de l’eau' };
const rep = (n, texte) => `<span class="pt">${n}</span>${texte}`;

/* ═════════════════════════════ LES PAGES ═════════════════════════════ */

export const PAGES = [
  couverture(),

  /* ─────────────── Ouverture ─────────────── */
  sable({
    id: 'bienvenue', h: 2, rep: 'Bienvenue',
    titre: 'Ce qu’on aurait aimé lire <span class="eau">avant notre premier rempla</span>',
    chapo: 'Licence en poche, premiers remplas en vue : tout arrive en même temps. L’Ordre, l’URSSAF, la CARMF, les impôts, et la question que personne ne pose clairement : <b>combien il te reste vraiment ?</b>',
    corps: `<div class="c">
<p class="ct">Par où commencer ?</p>
<div style="--kc:330px">
${kv('Tu n’as jamais remplacé', 'Lis la partie 1 dans l’ordre.&nbsp;[[p:cadre]]')}
${kv('Tu remplaces déjà', 'Vérifie ton régime social&nbsp;[[p:regime]] et crée ton acompte d’impôt&nbsp;[[p:septembre]].')}
${kv('Ta thèse arrive', 'L’inscription à l’Ordre&nbsp;[[p:licence]], puis l’année 2 en PAMC&nbsp;[[p:annee2]].')}
${kv('Tu passes 19 000 € de rétros', 'Le RSPM, le régime simplifié, a des règles de sortie : anticipe&nbsp;[[p:combien]].')}
</div></div>
<div class="c sky plein">
<p class="ct">Le fil rouge : ton Super-Net</p>
<p>Ce qui te reste vraiment après charges, cotisations et impôt. Exemples calculés par le moteur du <a class="lien" href="${U('/simulateur')}">simulateur d’Hippodoc</a>.</p>
<p class="note" style="margin-top:auto;padding-top:16px">Écrit par Ryan, médecin et fondateur d’Hippodoc. Vérifié sur les textes officiels au 15 novembre 2026 : sources&nbsp;[[p:sources]].</p>
</div>`,
  }),

  sable({
    id: 'sommaire', h: 2, rep: 'Sommaire',
    titre: 'Dans l’ordre où <span class="eau">tu en auras besoin</span>',
    chapo: 'Touche un titre pour y aller. Les renvois en bleu, comme&nbsp;[[p:essentiel]], sont cliquables. Un sigle t’échappe ? Les mots du remplaçant,&nbsp;[[p:glossaire]].',
    corps: `<div class="c plein som"><div class="som-cols">
<p class="som-p">Pour commencer</p>
<a class="som-l" href="#essentiel"><span>L’essentiel en 7 règles</span><b>[[n:essentiel]]</b></a>
<a class="som-l" href="#frise"><span>Tes trois premières années</span><b>[[n:frise]]</b></a>
<p class="som-p">1 · Avant ton premier rempla</p>
<a class="som-l" href="#cadre"><span>Libéral, salarié, ou les deux</span><b>[[n:cadre]]</b></a>
<a class="som-l" href="#demarches"><span>Les démarches, dans l’ordre</span><b>[[n:demarches]]</b></a>
<a class="som-l" href="#licence"><span>Licence et autorisation</span><b>[[n:licence]]</b></a>
<a class="som-l" href="#questions"><span>Avant de dire oui</span><b>[[n:questions]]</b></a>
<a class="som-l" href="#contrat"><span>Le contrat</span><b>[[n:contrat]]</b></a>
<p class="som-p">2 · Pendant tes remplas</p>
<a class="som-l" href="#jourj"><span>Le jour J</span><b>[[n:jourj]]</b></a>
<a class="som-l" href="#retro"><span>La rétrocession</span><b>[[n:retro]]</b></a>
<a class="som-l" href="#facture"><span>Ta facture de rétrocession</span><b>[[n:facture]]</b></a>
<a class="som-l" href="#reserve"><span>La règle des 35 %</span><b>[[n:reserve]]</b></a>
<p class="som-p">3 · Sous la surface</p>
<a class="som-l" href="#journee"><span>Ta journée à 600 €, vraiment</span><b>[[n:journee]]</b></a>
<a class="som-l" href="#regime"><span>RSPM ou PAMC</span><b>[[n:regime]]</b></a>
<a class="som-l" href="#combien"><span>RSPM ou PAMC : combien ?</span><b>[[n:combien]]</b></a>
<a class="som-l" href="#annee2"><span>Pourquoi l’année 2 pique</span><b>[[n:annee2]]</b></a>
<a class="som-l" href="#carmf"><span>La CARMF en clair</span><b>[[n:carmf]]</b></a>
<a class="som-l" href="#carmf-demander"><span>CARMF : les réductions</span><b>[[n:carmf-demander]]</b></a>
<a class="som-l" href="#micro"><span>Micro-BNC ou réel</span><b>[[n:micro]]</b></a>
<a class="som-l" href="#impot"><span>Ton impôt, en une formule</span><b>[[n:impot]]</b></a>
<a class="som-l" href="#septembre"><span>Le piège de septembre</span><b>[[n:septembre]]</b></a>
<a class="som-l" href="#declaration"><span>Ta déclaration, case par case</span><b>[[n:declaration]]</b></a>
<a class="som-l" href="#oublis"><span>Trois choses qu’on oublie</span><b>[[n:oublis]]</b></a>
<a class="som-l" href="#profils"><span>Combien il te reste vraiment</span><b>[[n:profils]]</b></a>
<p class="som-p">4 · Garder la tête hors de l’eau</p>
<a class="som-l" href="#arret"><span>Si tu t’arrêtes, qui paie ?</span><b>[[n:arret]]</b></a>
<a class="som-l" href="#prevoyance"><span>Ta prévoyance, avant de signer</span><b>[[n:prevoyance]]</b></a>
<a class="som-l" href="#calendrier"><span>Ton année en un coup d’œil</span><b>[[n:calendrier]]</b></a>
<a class="som-l" href="#routine"><span>Ta routine, rempla après rempla</span><b>[[n:routine]]</b></a>
<p class="som-p">Pour finir</p>
<a class="som-l" href="#glossaire"><span>Les mots du remplaçant</span><b>[[n:glossaire]]</b></a>
<a class="som-l" href="#ressources"><span>Pour aller plus loin</span><b>[[n:ressources]]</b></a>
<a class="som-l" href="#hippodoc"><span>Hippodoc, 30 jours d’essai</span><b>[[n:hippodoc]]</b></a>
<a class="som-l" href="#sources"><span>Sources</span><b>[[n:sources]]</b></a>
</div></div>`,
  }),

  sable({
    id: 'essentiel', h: 2, rep: 'Si tu ne lis qu’une page',
    titre: 'L’essentiel <span class="eau">en 7 règles</span>',
    corps: `<div class="c plein"><ol class="etapes regles">
<li><div class="eh"><b>Une licence ne suffit pas pour remplacer.</b>[[p:licence]]</div><p class="et">Interne, il faut aussi une autorisation de l’Ordre et un contrat écrit, même pour un jour.</p></li>
<li><div class="eh"><b>Ce que tu encaisses n’est pas ce que tu gagnes.</b>[[p:profils]]</div><p class="et">Sur 100 € de rétrocession, il t’en reste de 58 à 72 € dans nos trois profils : ton Super-Net.</p></li>
<li><div class="eh"><b>35 % de chaque virement, de côté.</b>[[p:reserve]]</div><p class="et">Sur un compte à part : ta réserve pour les cotisations et l’impôt.</p></li>
<li><div class="eh"><b>RSPM ou PAMC : choisis avant le 1er rempla.</b>[[p:regime]]</div><p class="et">Le RSPM, le régime simplifié, est souvent moins cher, mais il a des seuils.</p></li>
<li><div class="eh"><b>En PAMC, l’année 2 pique.</b>[[p:annee2]]</div><p class="et">D’abord des forfaits, des montants fixes ; le rattrapage arrive en 2e année.</p></li>
<li><div class="eh"><b>Aucun impôt prélevé la 1re année, sauf si tu agis.</b>[[p:septembre]]</div><p class="et">Crée ton acompte dès ta 1re rétro, sinon tout tombe en septembre de l’année suivante.</p></li>
<li><div class="eh"><b>Une prévoyance se prend tôt.</b>[[p:prevoyance]]</div><p class="et">La CPAM ne paie tes arrêts qu’après un an de libéral&nbsp;[[p:arret]].</p></li>
</ol></div>`,
  }),

  sable({
    id: 'frise', h: 2, rep: 'La carte',
    titre: 'Tes trois premières années, <span class="eau">en une frise</span>',
    chapo: 'Ce qui arrive, et quand. Ici en PAMC, le régime classique. Au RSPM, tu paies chaque mois ou chaque trimestre, sans rattrapage&nbsp;[[p:regime]].',
    corps: `<div class="c plein"><div class="frise">
<div class="fi"><p class="fq">Avant ton 1er rempla</p><p class="ft">Les démarches</p><p class="fd">Licence, assurance RCP, CPAM (l’Assurance maladie), URSSAF, CARMF, compte dédié. Trois à quatre semaines&nbsp;[[p:demarches]].</p></div>
<div class="fi"><p class="fq">Année 1</p><p class="ft">Des forfaits, et pas d’impôt prélevé</p><p class="fd">L’URSSAF et la CARMF prélèvent des forfaits, des montants fixes, faute de connaître ton revenu. Rien n’est prélevé pour l’impôt sur tes remplas, sauf si tu crées un acompte. <b>Tu mets 35 % de côté.</b></p></div>
<div class="fi fort"><p class="fq">Année 2</p><p class="ft">Le rattrapage</p><p class="fd">Au printemps, tu déclares tes revenus de l’année 1. Ensuite, l’URSSAF et la CARMF font le rattrapage, et l’impôt de l’année 1 est prélevé à partir de septembre&nbsp;[[p:annee2]].</p></div>
<div class="fi"><p class="fq">Année 3</p><p class="ft">Le rythme de croisière</p><p class="fd">La retraite complémentaire de la CARMF démarre (11,8 % de ton revenu, si tu as commencé avant 40 ans). Tes prélèvements suivent ton vrai revenu, avec un à deux ans de décalage&nbsp;[[p:carmf]].</p></div>
</div></div>`,
  }),

  /* ─────────────── Partie 1 ─────────────── */
  sable({
    id: 'cadre', rep: '',
    ouvre: { partie: 'Partie 1', titre: 'Avant ton premier rempla', sous: 'Ton cadre, les démarches, la licence, le contrat.', masc: 'hippo-checklist.webp', mw: 250, mx: 90, my: 26 },
    titre: 'Libéral, salarié, <span class="eau">ou les deux</span>',
    chapo: 'Remplacer en cabinet, c’est exercer en libéral : avec une licence si tu es interne, inscrit à l’Ordre si tu es thésé.',
    corps: `<div class="c"><p class="ct">Le rempla en cabinet : du libéral</p><p>Tu soignes à la place du médecin installé, qui te reverse une part des honoraires : ta <b>rétrocession</b>. À toi de payer tes cotisations sociales (URSSAF), ta retraite (CARMF) et ton impôt.</p></div>
<div class="rang">
<div class="c"><p class="ct">Salarié</p><p>Hôpital, centre de santé : un contrat, une fiche de paie, des cotisations prélevées pour toi.</p></div>
<div class="c"><p class="ct">Les deux</p><p>Salaire d’interne et remplas : c’est permis et fréquent. Pour l’impôt, tout s’additionne&nbsp;[[p:impot]].</p></div>
</div>
${alerte('piege', '<span class="lab">L’intérim en établissement, pas tout de suite.</span> Depuis le 1er décembre 2025, une agence ne peut te placer en hôpital ou en clinique qu’après 2 ans à temps plein depuis ton inscription à l’Ordre. Le rempla en cabinet n’est pas concerné.')}`,
  }),

  sable({
    id: 'demarches', rep: rep(1, 'Avant ton premier rempla'),
    titre: 'Les démarches, <span class="eau">dans l’ordre</span>',
    chapo: 'Six étapes, presque toutes en ligne : trois à quatre semaines en&nbsp;tout.',
    corps: `<div class="c plein"><ol class="etapes">
<li><div class="eh"><b>Ta licence de remplacement</b><span class="etiq">Semestres validés</span></div><p class="et">Interne : au conseil de l’Ordre de ta fac. Thésé : ton inscription à l’Ordre&nbsp;[[p:licence]].</p></li>
<li><div class="eh"><b>Ta responsabilité civile (RCP)</b><span class="etiq">Avant le 1er rempla</span></div><p class="et">Obligatoire. Celle du remplacé ne te couvre pas : fais confirmer la tienne par écrit.</p></li>
<li><div class="eh"><b>La CPAM</b><span class="etiq">Avant le 1er rempla</span></div><p class="et">Inscris-toi en ligne auprès de la caisse de ton lieu de résidence. Ensuite, signale-lui chaque rempla.</p></li>
<li><div class="eh"><b>L’URSSAF : RSPM ou PAMC</b><span class="etiq">Avant le 1er rempla</span></div><p class="et"><b>RSPM</b> : sur urssaf.fr, service simplifié des médecins. <b>PAMC</b> : sur formalites.entreprises.gouv.fr, sous 8 jours après ton début. Lequel ?&nbsp;[[p:regime]]</p></li>
<li><div class="eh"><b>La CARMF, ta caisse de retraite</b><span class="etiq">Le 1er mois</span></div><p class="et">En PAMC, sur son site. Au RSPM, l’affiliation est automatique.</p></li>
<li><div class="eh"><b>Ton compte et ton espace impôts</b><span class="etiq">Dès le début</span></div><p class="et">Un compte pour tes remplas&nbsp;[[p:reserve]] et, sur impots.gouv.fr, ton <b>espace professionnel</b>&nbsp;[[p:oublis]].</p></li>
</ol></div>`,
  }),

  sable({
    id: 'licence', rep: rep(1, 'Avant ton premier rempla'),
    titre: 'Licence et <span class="eau">autorisation</span>',
    corps: `<div class="c"><span class="etiq">Interne ou docteur junior</span>
<p style="margin-top:16px"><b>La licence</b> prouve que tu peux remplacer : en médecine générale, 3 semestres validés, dont un chez un médecin généraliste ; en spécialité, selon ton DES (ton diplôme de spécialité). Le conseil de l’Ordre de ta fac la délivre pour un an.</p>
<p><b>L’autorisation</b> vaut pour tel médecin, telles dates. Le remplacé la demande à son conseil de l’Ordre, pour 3 mois au plus, renouvelables. Dans ta spécialité, hors de ton temps de service, jamais pendant un repos de sécurité.</p>
<p class="note">Docteur junior en médecine générale (4e année, dès le 2 novembre 2026) : licence et autorisation, comme un interne.</p>
</div>
<div class="c plein"><span class="etiq ink">Tu es thésé</span>
<p style="margin-top:16px"><b>L’inscription à l’Ordre</b> se demande dès 4 mois avant ton diplôme. Une fois inscrit, plus d’autorisation au cas par cas.</p>
<p><b>En attendant la décision</b> (3 mois au plus), tu remplaces sous licence, avec autorisation, si ta demande date d’un mois au plus après ton diplôme.</p>
</div>
${alerte('piege', '<span class="lab">Ta licence expire chaque année</span>, à la date écrite dessus. Renouvelle-la avant, avec ton nouveau certificat de scolarité.')}`,
  }),

  sable({
    id: 'questions', rep: rep(1, 'Avant ton premier rempla'),
    titre: 'Avant de dire oui, <span class="eau">les 10 questions</span>',
    chapo: 'Les annonces de l’Ordre, ton syndicat d’internes, tes maîtres de stage : les remplas arrivent vite. Avant d’accepter, pose ces questions.',
    corps: `<div class="c plein"><ul class="ck">
<li><span><b>Quelle rétrocession ?</b> Et pour les gardes ?</span></li>
<li><span><b>Combien de patients par jour,</b> sur quels horaires ?</span></li>
<li><span><b>Des visites, des gardes ?</b> Combien ?</span></li>
<li><span><b>Quel logiciel ?</b> Puis-je m’y former avant ?</span></li>
<li><span><b>Qui gère l’agenda :</b> un secrétariat, le web ?</span></li>
<li><span><b>Quand serai-je payé,</b> et comment ?</span></li>
<li><span><b>Logement, trajets, repas :</b> qui paie ?</span></li>
<li><span><b>Qui appeler en cas de doute ?</b></span></li>
<li><span><b>Qui rédige le contrat,</b> et qui l’envoie à l’Ordre ?</span></li>
<li><span><b>Une clause de non-réinstallation ?</b>&nbsp;[[p:contrat]]</span></li>
</ul></div>`,
  }),

  sable({
    id: 'contrat', rep: rep(1, 'Avant ton premier rempla'),
    titre: 'Le contrat : <span class="eau">5 points à verrouiller</span>',
    chapo: 'Écrit, quelle que soit la durée du rempla, et communiqué au conseil de l’Ordre avant qu’il commence.',
    corps: `<div class="c plein">
${kv('Qui, où, quand', 'Ton identité et celle du remplacé, ton numéro de licence ou RPPS, les dates, les horaires, les gardes, les visites, les frais.')}
${kv('La rétrocession', 'En pourcentage des honoraires. Écris le sort des gardes et des actes techniques.')}
${kv('Le paiement', 'Le délai et le mode de versement, noir sur blanc : c’est ce qui t’évite les relances.')}
${kv('S’installer à côté', 'La clause de non-réinstallation te l’interdit. Depuis le 30 juillet 2026, elle n’existe que si le contrat la prévoit : négocie sa durée et sa zone.')}
${kv('Le remplacé', 'Il arrête toute activité médicale pendant ton rempla, sauf dérogation de l’Ordre (règle de juillet 2026).')}
</div>
${alerte('piege', '<span class="lab">Le piège du vieux modèle.</span> Des contrats reprennent encore l’ancienne règle : 3 mois de rempla, 2 ans sans t’installer à proximité. Signée, elle te lie, sauf accord du remplacé ou de l’Ordre.')}`,
  }),

  /* ─────────────── Partie 2 ─────────────── */
  sable({
    id: 'jourj', rep: '',
    ouvre: { partie: 'Partie 2', titre: 'Pendant tes remplas', sous: 'Le jour J, ta rétrocession, ta facture, ta réserve.', masc: 'hippo-f-epaule.webp', mw: 190, mx: 116, my: 22 },
    titre: 'Le jour J, <span class="eau">côté pratique</span>',
    corps: `<div class="c"><p class="ct">La veille</p><ul class="pts">
<li>Clés, codes, parking, horaires, visites prévues.</li>
<li>Les numéros utiles : le remplacé, la pharmacie de garde, le labo.</li>
<li>Une demi-heure sur le logiciel : agenda, ordonnances, arrêts, télétransmission. Fais-le régler pour qu’il lise ta carte CPS.</li>
</ul></div>
<div class="c plein"><p class="ct">Sur place</p><ul class="pts">
<li><b>Ta carte CPS (carte de professionnel de santé), jamais la sienne</b>, pour signer tes feuilles de soins électroniques.</li>
<li><b>Ses ordonnances et ses certificats</b>, sur lesquels tu barres son nom pour écrire le tien, avec la mention « remplaçant ».</li>
<li><b>Tout dans le dossier</b> : ta protection, et la continuité des soins.</li>
<li><b>À la fin</b>, transmets au remplacé les patients à revoir et les résultats attendus.</li>
</ul>
<p class="ret"><span class="lab">Un doute ? </span>On ne t’attend pas parfait, on t’attend rigoureux.</p></div>`,
  }),

  sable({
    id: 'retro', rep: rep(2, 'Pendant tes remplas'),
    titre: 'La rétrocession, <span class="eau">simplement</span>',
    chapo: 'Pendant ton rempla, le cabinet encaisse les honoraires. Le remplacé te reverse ensuite ta part : ta rétrocession.',
    corps: `<div class="c"><div class="flux">
<div class="fx"><span class="fx-n">25</span><span class="fx-l">consultations<br>à 30 €</span></div>${FL}
<div class="fx"><span class="fx-n">750 €</span><span class="fx-l">d’honoraires<br>encaissés</span></div>${FL}
<div class="fx fort"><span class="fx-n">600 €</span><span class="fx-l">ta rétrocession<br>à 80 %</span></div>
</div></div>
<div class="c plein">
${kv('Combien ?', 'Aucun taux légal : l’Ordre demande que le taux tienne compte des charges du cabinet. En médecine générale, souvent 70 à 80 %, moins avec un plateau technique coûteux.')}
${kv('Les gardes', 'Le forfait d’astreinte revient à celui qui fait la garde. Pour les actes, écris le taux dans le contrat.')}
${kv('Pour l’impôt', 'Tu es imposé l’année où l’argent arrive sur ton compte. Une rétro de décembre virée en janvier compte pour l’année suivante.')}
<p class="ret"><span class="lab">Chaque soir de rempla, </span>note ce qui a été encaissé, et comment : c’est la base de ta rétrocession.</p>
</div>`,
  }),

  sable({
    id: 'facture', rep: rep(2, 'Pendant tes remplas'),
    titre: 'Ta facture de rétrocession, <span class="eau">annotée</span>',
    chapo: 'Le Code général des impôts (CGI) ne l’exige pas pour des soins. Mais elle fixe ce que le remplacé te doit, et prouve tes recettes.',
    corps: `<div class="c plein facture"><div class="fa-doc">
<div class="fa-tete"><div><b>Dr [Ton nom]</b><br>Médecin remplaçant<br>RPPS [ton numéro]</div><div class="fa-num"><span class="nota">1</span>Facture n° 2026-014<br>du 30 novembre 2026</div></div>
<p class="fa-pour">Pour : Dr [Nom du remplacé], [adresse du cabinet]</p>
<div class="fa-l"><span><span class="nota">2</span>Remplacement du 17 au 28 novembre 2026, 10 jours</span></div>
<div class="fa-l"><span><span class="nota">3</span>Honoraires encaissés pendant le remplacement</span><b>7 500 €</b></div>
<div class="fa-l"><span>Rétrocession prévue au contrat</span><b>80 %</b></div>
<div class="fa-l fa-tot"><span>Montant à me verser</span><b>6 000 €</b></div>
<p class="fa-pied"><span class="nota">4</span>TVA non applicable, article 261-4-1° du CGI. Virement sous 15 jours.</p>
</div>
<div class="fa-notes">
<p><span class="nota">1</span><span>Un numéro qui se suit, et la date : tu retrouves tout.</span></p>
<p><span class="nota">2</span><span>La période et le nombre de jours.</span></p>
<p><span class="nota">3</span><span>Le calcul : honoraires, taux, montant.</span></p>
<p><span class="nota">4</span><span>L’exonération de TVA, et le délai de paiement.</span></p>
</div>
<p class="ret"><span class="lab">Garde une copie </span>de chaque facture et la date du virement reçu : ce sont tes preuves de recettes.</p></div>`,
  }),

  sable({
    id: 'reserve', rep: rep(2, 'Pendant tes remplas'),
    titre: 'La règle <span class="eau">des 35 %</span>',
    corps: `<div class="c"><div class="stat"><span class="big">35 %</span><p>de chaque virement, dès qu’il arrive, sur un compte à part. Il paie l’URSSAF, la CARMF et ton impôt. Le surplus devient ton épargne.</p></div></div>
<div class="c"><p class="ct">À ajuster selon ton cas</p>
${kv('Interne au RSPM', '25 % dans la tranche d’impôt à 11 %, 35 % à 30 %&nbsp;[[p:impot]].')}
${kv('Thésé en PAMC', 'Environ 35 %.')}
${kv('PAMC, moins de 20 000 € par an', '40 % : les forfaits des débuts pèsent lourd&nbsp;[[p:annee2]].')}
</div>
<div class="c plein"><p class="ct">Dans cet ordre</p><ol class="etapes petit">
<li><div class="eh"><b>Cotisations et impôt payés depuis ce compte,</b></div><p class="et">pas depuis ton compte courant.</p></li>
<li><div class="eh"><b>Une réserve de 3 mois de dépenses,</b></div><p class="et">pour un mois sans rempla, ou un arrêt.</p></li>
<li><div class="eh"><b>Ensuite seulement : épargne et projets.</b></div></li>
</ol></div>`,
  }),

  /* ─────────────── Partie 3 ─────────────── */
  sable({
    id: 'journee', profond: true, rep: '',
    ouvre: { partie: 'Partie 3', titre: 'Sous la surface', sous: 'Tes cotisations, tes impôts, et ce qu’il te reste.' },
    bulles: [[968, 96, 34], [1018, 176, 18], [24, 1120, 22], [1030, 640, 16]],
    titre: 'Ta journée à 600 €, <span class="eau">vraiment</span>',
    chapo: 'Sous chaque rétrocession : tes cotisations, ton impôt et tes frais. Ce qui reste, c’est ton <b>Super-Net</b>.',
    corps: `<div class="c plein">
${pile([['co', 152, '−152 €'], ['im', 50, ''], ['fr', 30, ''], ['s', 368, '368 €']])}
<div class="calc" style="margin-top:18px">
<div class="l"><span>Ta rétrocession du jour</span><b>600 €</b></div>
<div class="l"><span><i class="sw" style="background:var(--w3)"></i>Cotisations URSSAF et CARMF</span><b>−152 €</b></div>
<div class="l"><span><i class="sw" style="background:var(--charge-impots)"></i>Impôt sur le revenu</span><b>−50 €</b></div>
<div class="l"><span><i class="sw" style="background:var(--w1)"></i>Frais (trajets, repas, assurance)</span><b>−30 €</b></div>
<div class="l tot"><span><i class="sw" style="background:var(--sun)"></i>Ton Super-Net</span><b><span class="sn">368 €</span></b></div>
</div>
<p class="ret"><span class="lab">Sur 600 €, 232 € partent : </span>il t’en reste 368, soit 61 %. Profil : 100 jours à 600 € dans l’année, 3 000 € de frais, PAMC, micro-BNC&nbsp;[[p:micro]], célibataire, dès la 3e année.</p>
</div>`,
  }),

  sable({
    id: 'regime', rep: rep(3, 'Sous la surface · tes cotisations'),
    titre: 'Ton régime social : <span class="eau">RSPM ou PAMC</span>',
    chapo: 'Deux façons de payer tes cotisations. Pour l’impôt, c’est un autre choix&nbsp;[[p:micro]].',
    corps: `<div class="c plein"><table class="cmp">
<colgroup><col style="width:160px"><col style="width:410px"><col></colgroup>
<thead><tr><th></th><th>RSPM<small>le régime simplifié</small></th><th>PAMC<small>le régime classique</small></th></tr></thead>
<tbody>
<tr><th>Pour qui</th><td>Les remplaçants sans autre activité indépendante, jusqu’à 19 000 € de rétros par an. Un salaire à côté est permis.</td><td>Tout médecin libéral conventionné.</td></tr>
<tr><th>Tu paies</th><td>13,5 % de tes rétrocessions (21,2 % au-delà de 19 000 €), plus l’invalidité-décès de la CARMF.</td><td>URSSAF et CARMF sur ton revenu (rétros moins frais) : des forfaits, puis un rattrapage&nbsp;[[p:annee2]].</td></tr>
<tr><th>Tes démarches</th><td>Une déclaration par trimestre, ou par mois sur demande. La CARMF est incluse.</td><td>Une fois par an, avec ta déclaration de revenus.</td></tr>
<tr><th>Tes droits</th><td>Moins de points de retraite, pas d’ASV (une retraite en plus&nbsp;[[p:carmf]]), pas de formation financée.</td><td>Complets.</td></tr>
</tbody></table>
<p class="ret"><span class="lab">En clair : </span>peu de remplas, rien d’autre en indépendant ? Le RSPM est le plus simple, et en général le moins cher. Mais il ouvre moins de&nbsp;droits&nbsp;à&nbsp;la&nbsp;retraite.</p>
</div>`,
  }),

  sable({
    id: 'combien', rep: rep(3, 'Sous la surface · tes cotisations'),
    titre: 'RSPM ou PAMC : <span class="eau">combien ?</span>',
    chapo: 'Tes cotisations de l’année, pour 15 000 € de rétros en secteur 1.',
    corps: `<div class="c"><div class="barres">
<div class="br"><span class="bl">RSPM<small>invalidité-décès à 25 %</small></span><span class="bb"><i style="width:${(2180 / 5830 * 100).toFixed(1)}%"></i></span><b>2 180 €</b></div>
<div class="br"><span class="bl">RSPM<small>invalidité-décès à 100 %</small></span><span class="bb"><i style="width:${(2660 / 5830 * 100).toFixed(1)}%"></i></span><b>2 660 €</b></div>
<div class="br"><span class="bl">PAMC<small>tes 2 premières années</small></span><span class="bb"><i class="f" style="width:${(4650 / 5830 * 100).toFixed(1)}%"></i></span><b>4 650 €</b></div>
<div class="br"><span class="bl">PAMC<small>dès la 3e année</small></span><span class="bb"><i class="f" style="width:100%"></i></span><b>5 830 €</b></div>
</div>
<p class="note" style="margin-top:12px">Au RSPM, l’invalidité-décès à 100 % (631 €) paie 4 fois plus d’indemnités en arrêt qu’à 25 % (158 €)&nbsp;[[p:arret]].</p></div>
<div class="c plein"><p class="ct">Au-delà de 19 000 € : la règle entière</p>
${kv('Pour entrer', '19 000 € de rétrocessions par an, au plus.')}
${kv('Si tu dépasses', 'Tu y restes cette année-là, à 21,2 % au-delà.')}
${kv('Tu en sors', 'Au 1er janvier qui suit une année au-dessus de 38 000 €, ou ta 2e année de suite au-dessus de 19 000 €.')}
<p class="ret"><span class="lab">À surveiller : </span>un projet de décret voudrait ouvrir le RSPM jusqu’à 80 000 €. Rien n’est publié au 15 novembre 2026.</p>
</div>`,
  }),

  sable({
    id: 'annee2', profond: true, rep: rep(3, 'Sous la surface · piège 1 sur 2'),
    bulles: [[968, 96, 34], [1018, 176, 18], [24, 1120, 22]],
    titre: 'Pourquoi l’année 2 <span class="eau">pique</span>',
    chapo: 'En PAMC, l’URSSAF et la CARMF ne connaissent pas ton revenu la 1re année : elles prélèvent des <b>forfaits</b>, des montants fixes, puis font le rattrapage.',
    corps: `<div class="c"><p class="ct">Jeune remplaçant, 40 000 € de rétros la 1re année</p>
<div class="calc">
<div class="l"><span>Prélevé pendant ta 1re année<span class="s">Les forfaits de l’URSSAF et de la CARMF</span></span><b>4 510 €</b></div>
<div class="l"><span>Vraiment dû pour ta 1re année<span class="s">Calculé sur tes 40 000 €</span></span><b>7 680 €</b></div>
<div class="l tot"><span>Le rattrapage, réclamé en année 2</span><b>3 170 €</b></div>
</div></div>
<div class="c plein"><p class="ct">Ce qui tombe pendant ta 2e année</p><ul class="pts">
<li><b>Le rattrapage de ta 1re année</b>, une fois tes revenus déclarés.</li>
<li><b>Tes cotisations de 2e année</b>, sur ton revenu de la 1re.</li>
<li><b>Ton impôt de la 1re année, 1 470 €</b>, dès septembre, sans acompte créé&nbsp;[[p:septembre]].</li>
</ul>
<p class="ret"><span class="lab">La parade : </span>35 % de chaque rétro de côté, même si les prélèvements semblent légers. Et l’URSSAF peut calculer sur tes revenus estimés.</p>
</div>`,
  }),

  sable({
    id: 'carmf', rep: rep(3, 'Sous la surface · tes cotisations'),
    titre: 'La CARMF <span class="eau">en clair</span>',
    chapo: 'Ta caisse de retraite. En PAMC, quatre cotisations (2026, secteur 1). Au RSPM, tout passe par l’URSSAF, sans ASV.',
    corps: `<div class="rang">
<div class="c tuile"><p class="ct">Retraite de base</p><p class="mid">8,73 %</p><p class="note">jusqu’au PASS (48 060 €), plus 1,87 % sur tout ton revenu.</p></div>
<div class="c tuile"><p class="ct">Complémentaire</p><p class="mid">11,8 %</p><p class="note">de ton revenu. Rien les 2 premières années, si tu démarres avant 40 ans.</p></div>
<div class="c tuile"><p class="ct">ASV</p><p class="mid">1 917 €</p><p class="note">+ 1,33 % : une retraite en plus. L’Assurance maladie paie les deux tiers de la cotisation.</p></div>
<div class="c tuile"><p class="ct">Invalidité-décès</p><p class="mid">626 €</p><p class="note">sous 48 060 € de revenu. Elle ouvre tes indemnités&nbsp;[[p:arret]].</p></div>
</div>
<div class="c plein"><p class="ct">Comment elle te prélève, en PAMC</p>
${kv('Janvier', 'L’appel, sur ton revenu d’il y a deux ans (au début, des forfaits&nbsp;[[p:annee2]]). Un acompte avant le 28 février, ou un prélèvement chaque mois.')}
${kv('Mai à août', 'Le solde, à payer avant le 31 août, avec ta retraite de base recalculée.')}
</div>`,
  }),

  sable({
    id: 'carmf-demander', rep: rep(3, 'Sous la surface · tes cotisations'),
    titre: 'CARMF : ce que tu peux <span class="eau">demander</span>',
    chapo: 'Personne ne te les proposera : demande-les, avec ton avis d’impôt, dans les délais.',
    corps: `<div class="c plein">
${kv('ASV, au début', 'Dispense si ton revenu libéral d’il y a deux ans était sous 15 000 €, souvent le cas au début. Demande-la tout de suite.')}
${kv('ASV, ensuite', 'Une cotisation proportionnelle à ton revenu, s’il était sous 63 900 € il y a deux ans. Avant le 28 février.')}
${kv('Complémentaire', 'Réduite de 25 à 100 % si tes revenus imposables de l’an passé, salaires compris, sont sous 32 500 €. Dans les 3 mois après l’appel de janvier.')}
${kv('Dispense totale', 'Que des remplas, sans CFE (impôt local&nbsp;[[p:oublis]]), sous 15 000 € par an : plus d’affiliation.')}
${kv('Revenu en baisse', 'Un calcul sur tes revenus estimés de l’année, plutôt que sur ceux d’il y a deux ans.')}
</div>
${alerte('piege', '<span class="lab">Ce que tu perds.</span> Une cotisation dispensée ne donne aucun point de retraite. Sans affiliation : ni invalidité-décès, ni indemnités&nbsp;CARMF.')}`,
  }),

  sable({
    id: 'micro', rep: rep(3, 'Sous la surface · tes impôts'),
    titre: 'Micro-BNC <span class="eau">ou réel ?</span>',
    chapo: 'Tes rétrocessions sont des BNC, des bénéfices non commerciaux. Deux façons de les déclarer à l’impôt.',
    corps: `<div class="rang">
<div class="c"><span class="etiq">Micro-BNC · par défaut</span><p style="margin-top:16px">Ton impôt se calcule sur <b>66 % de tes recettes</b> (tes rétros) : 34 % d’abattement pour tes frais et cotisations.</p><p>Tu déclares tes recettes brutes, sur une seule case.</p><p class="note">Jusqu’à 83 600 € de recettes par an, de 2026 à 2028.</p></div>
<div class="c"><span class="etiq ink">Réel · formulaire 2035</span><p style="margin-top:16px">Tu déduis <b>tes vrais frais et tes cotisations</b>.</p><p>Un formulaire 2035 chaque printemps, et une comptabilité toute l’année.</p><p class="note">Intéressant si frais et cotisations dépassent 34 % de tes recettes.</p></div>
</div>
<div class="c plein"><p class="ct">L’exemple</p>
<div class="calc">
<div class="l"><span>Rétrocessions encaissées</span><b>30 000 €</b></div>
<div class="l"><span>Abattement de 34 %</span><b>−10 200 €</b></div>
<div class="l tot"><span>Ce qui est imposé</span><b>19 800 €</b></div>
</div>
<p class="note" style="margin-top:16px">Peu de frais ? Le micro-BNC gagne, comme dans nos profils. En PAMC, le réel change aussi tes cotisations : fais le calcul complet.</p>
</div>`,
  }),

  sable({
    id: 'impot', rep: rep(3, 'Sous la surface · tes impôts'),
    titre: 'Ton impôt, <span class="eau">en une formule</span>',
    chapo: 'Tes remplas s’ajoutent à tes autres revenus : ils sont taxés au taux de ta <b>tranche marginale</b>, ta tranche la plus haute, et au suivant si tu changes de tranche.',
    corps: `<div class="c ink"><p class="ct">La formule de poche</p><p class="note">Ton impôt en plus, à peu près :</p><p class="formule">recettes × 66 % × ta tranche</p>
<div class="tranches"><span>0 %</span><span>11 %</span><span>30 %</span><span>41 %</span><span>45 %</span></div>
<p class="note">Dans la tranche à 11 %, compte plutôt 16 % : la décote, une réduction pour les petits impôts, fond quand ton revenu monte.</p></div>
<div class="rang r3">
<div class="c tuile"><p class="ct">Interne à 11 %</p><p class="mid">1 060 €</p><p class="note">d’impôt en plus pour 10 000 € de remplas.</p></div>
<div class="c tuile"><p class="ct">Interne à 30 %</p><p class="mid">1 980 €</p><p class="note">d’impôt en plus pour 10 000 € de remplas.</p></div>
<div class="c tuile"><p class="ct">Thésé à 60 000 €</p><p class="mid">4 980 €</p><p class="note">d’impôt sans autre revenu : 8 % de ses rétros, le début est peu taxé.</p></div>
</div>
<div class="c sky plein"><p><b>Ta tranche ?</b> Elle est écrite sur ton dernier avis d’impôt. Les exemples : barème 2026, célibataire, micro-BNC ; salaire imposable de 22 000 € ou de 36 000 € pour l’interne.</p></div>`,
  }),

  sable({
    id: 'septembre', profond: true, rep: rep(3, 'Sous la surface · piège 2 sur 2'),
    bulles: [[968, 96, 34], [1018, 176, 18], [24, 1120, 22]],
    titre: 'Le piège <span class="eau">de septembre</span>',
    chapo: 'Le prélèvement à la source ne connaît pas encore tes remplas. Sans action de ta part, rien n’est prélevé sur eux ta 1re année.',
    corps: `<div class="c"><div class="frise">
<div class="fi"><p class="fq">Année 1</p><p class="ft">Rien de prélevé</p><p class="fd">Tu remplaces, tu encaisses. Aucun acompte sur tes remplas.</p></div>
<div class="fi"><p class="fq">Printemps de l’année 2</p><p class="ft">Ta déclaration</p><p class="fd">Tu déclares tes revenus de l’année 1.</p></div>
<div class="fi fort"><p class="fq">De septembre à décembre</p><p class="ft">Le double prélèvement</p><p class="fd">Le solde de l’année 1 est prélevé, en 4 fois au-delà de 300 €. Les acomptes sur tes remplas démarrent en même temps. Interne : le taux sur ton salaire monte aussi.</p></div>
</div></div>
<div class="c plein"><p class="ct">La parade, en 3 minutes</p>
<p>Dès ta 1re rétro, dans ton espace particulier sur impots.gouv.fr : « Prélèvement à la source », « Gérer vos acomptes », « Créer un acompte ». Indique ton bénéfice estimé (en micro-BNC, 66 % de tes rétros) : l’acompte part chaque mois.</p>
<p class="ret"><span class="lab">Chaque janvier, </span>vérifie que ton acompte est toujours là, et ajuste-le à tes remplas prévus.</p>
</div>`,
  }),

  sable({
    id: 'declaration', rep: rep(3, 'Sous la surface · tes impôts'),
    titre: 'Ta déclaration, <span class="eau">case par case</span>',
    chapo: 'Au printemps, en ligne, pour tes revenus de l’année d’avant. Tes rétrocessions ne sont pas préremplies : à toi de les reporter.',
    corps: `<div class="c"><span class="etiq">Ton impôt · micro-BNC</span>
<div class="case"><span class="case-n">5HQ</span><span>Sur la 2042-C-PRO : tes <b>recettes brutes</b> de l’année, RSPM ou PAMC. L’abattement de 34 % se calcule tout seul.</span></div></div>
<div class="c plein"><span class="etiq ink">Tes cotisations · le volet social, en PAMC</span>
<div class="case"><span class="case-n">DSCS</span><span>Toutes tes recettes brutes.</span></div>
<div class="case"><span class="case-n">DSAV</span><span>Tes rétrocessions brutes, souvent le même montant qu’en DSCS. <b>Pas préremplie</b> : à toi de l’écrire.</span></div>
<div class="case"><span class="case-n">DSAW</span><span>Zéro, pour un remplaçant : c’est la consigne de la notice.</span></div>
<div class="case"><span class="case-n">DSDE</span><span>Au réel seulement : le revenu brut social de ta 2035 (déposée en mai), sans retirer l’abattement de 26 %.</span></div>
<p class="ret"><span class="lab">Pas de volet social à l’écran ? </span>Coche la case PAMC. Toutes les cases, avec des exemples remplis : <a class="lien" href="${U('/guide-declarations')}">le guide des déclarations</a>.</p>
</div>`,
  }),

  sable({
    id: 'oublis', rep: rep(3, 'Sous la surface · tes impôts'),
    titre: 'Trois choses <span class="eau">qu’on oublie</span>',
    corps: `<div class="c"><p class="ct">La CFE, un impôt local</p>
${kv('L’année où tu démarres', 'Rien à payer, mais une déclaration avant le 31 décembre : le formulaire 1447-C-SD.')}
${kv('Ensuite', 'Chaque 15 décembre, là où tu as le plus remplacé.')}
${kv('Rien à payer', 'Si tes recettes ne dépassent pas 5 000 € (celles d’il y a deux ans, ou ta 1re année sur 12 mois).')}
<p class="note" style="margin-top:12px">L’avis n’arrive qu’en ligne, dans ton espace professionnel. Interne : due si tu remplaces habituellement.</p></div>
<div class="c"><p class="ct">La facture électronique</p><p>Depuis le 1er septembre 2026, tu dois pouvoir en recevoir, pour tes achats pros. Tes rétrocessions en sont exclues.</p></div>
<div class="c plein"><p class="ct">La TVA</p><p>Aucune sur tes rétrocessions : les soins en sont exonérés. Écris-le sur ta facture&nbsp;[[p:facture]].</p></div>`,
  }),

  sable({
    id: 'profils', rep: rep(3, 'Sous la surface · ce qu’il te reste'),
    titre: 'Combien il te reste <span class="eau">vraiment</span>',
    chapo: 'Trois profils, les mêmes que dans le simulateur. Ce qui reste, en jaune, c’est le Super-Net.',
    corps: `<div class="leg" style="margin:-8px 0 18px"><span><i style="background:var(--w3)"></i>Cotisations</span><span><i style="background:var(--charge-impots)"></i>Impôt</span><span><i style="background:var(--w1)"></i>Frais</span><span><i style="background:var(--sun)"></i>Super-Net</span></div>
<div class="c pr"><div class="pr-h"><span><b>Interne qui remplace</b><span class="note">12 500 € de rétros, 28 000 € de salaire · RSPM</span></span><span class="sn">7 490 €</span></div>
${pile([['co', 1850], ['im', 1860], ['fr', 1300], ['s', 7490, '60 %']])}
<p class="note">Cotisations 1 850 € · impôt en plus 1 860 € · frais 1 300 €</p></div>
<div class="c pr"><div class="pr-h"><span><b>Jeune remplaçant, 1re année</b><span class="note">40 000 € de rétros · PAMC</span></span><span class="sn">28 850 €</span></div>
${pile([['co', 7680], ['im', 1470], ['fr', 2000], ['s', 28850, '72 %']])}
<p class="note">Cotisations 7 680 € · impôt 1 470 € · frais 2 000 €. Dès la 3e année, à revenu égal : 25 500 €, car la complémentaire CARMF s’ajoute.</p></div>
<div class="c pr"><div class="pr-h"><span><b>Remplaçant régulier</b><span class="note">70 000 € de rétros · PAMC</span></span><span class="sn">40 740 €</span></div>
${pile([['co', 17300], ['im', 6960], ['fr', 5000], ['s', 40740, '58 %']])}
<p class="note">Cotisations 17 300 € · impôt 6 960 € · frais 5 000 €</p></div>
<p class="note plein" style="margin-top:12px">Micro-BNC, secteur 1, célibataire, arrondis à 10 €. Ton cas : <a class="lien" href="${U('/simulateur')}">le simulateur</a>.</p>`,
  }),

  /* ─────────────── Partie 4 ─────────────── */
  sable({
    id: 'arret', rep: '',
    ouvre: { partie: 'Partie 4', titre: 'Garder la tête hors de l’eau', sous: 'Ta protection, ton calendrier, ta routine.', masc: 'hippo-bras-croises.webp', mw: 196, mx: 120, my: 26 },
    titre: 'Si tu t’arrêtes, <span class="eau">qui paie ?</span>',
    chapo: 'En libéral, un arrêt coûte cher au début. Les montants de 2026.',
    corps: `<div class="c plein"><div class="gantt">
<div class="gb"><i style="flex:9;background:var(--sky-soft);color:var(--ink-2)">J1 à J3</i><i style="flex:48;background:var(--w2);color:var(--ink)">J4 à J90 · CPAM</i><i style="flex:43;background:var(--w4);color:var(--paper)">Dès J91 · CARMF</i></div>
</div>
<div style="margin-top:14px">
${kv('Jours 1 à 3', 'Personne : c’est le délai de carence.')}
${kv('Jours 4 à 90', 'La CPAM, après 12 mois d’affiliation en libéral : jusqu’à 197,51 € par jour.')}
${kv('Dès le 91e jour', 'La CARMF : 65,84 € à 197,51 € par jour selon tes revenus, si tu es à jour. Au RSPM : 65,84 €, ou 16,46 € à 25 %&nbsp;[[p:combien]].')}
</div>
<p class="ret"><span class="lab">Le chômage ? </span>Arrêter tes remplas n’ouvre en pratique aucune allocation.</p>
</div>
${alerte('piege', '<span class="lab">Ta 1re année de libéral,</span> la CPAM ne paie rien sur tes remplas. Internat quitté il y a moins de 12 mois ? Demande-lui si tes droits de salarié jouent encore.')}`,
  }),

  sable({
    id: 'prevoyance', rep: rep(4, 'Garder la tête hors de l’eau'),
    titre: 'Ta prévoyance, <span class="eau">avant de signer</span>',
    chapo: 'Une assurance privée qui te verse un revenu si tu ne peux plus travailler. Elle comble le trou des premiers mois.',
    corps: `<div class="c plein"><ol class="etapes">
<li><div class="eh"><b>Le questionnaire de santé</b></div><p class="et">Réponds exactement aux questions posées. Un oubli de bonne foi peut réduire tes indemnités ; un mensonge annule le contrat.</p></li>
<li><div class="eh"><b>Forfaitaire ou indemnitaire</b></div><p class="et">L’indemnitaire paie ta perte prouvée, moins CPAM et CARMF : peu si tu gagnes peu. Le forfaitaire paie souvent ce qui est prévu.</p></li>
<li><div class="eh"><b>La franchise</b></div><p class="et">Les premiers jours d’arrêt non payés, souvent 15, 30 ou 90 : à choisir selon ton épargne.</p></li>
<li><div class="eh"><b>Dos, psy, grossesse</b></div><p class="et">Souvent couverts seulement après une hospitalisation : demande-les sans condition.</p></li>
</ol>
<p class="ret"><span class="lab">Signe tôt : </span>jeune, tu paies moins cher et le questionnaire est plus simple.</p>
</div>
<div class="c ink"><p class="ct">Le kit Prévoyance</p><p>Les 12 questions à poser et un tableur pour comparer tes devis : sous la fiche Prévoyance de <b>@hippodoc.fr</b>, sur Instagram.</p></div>`,
  }),

  sable({
    id: 'calendrier', rep: rep(4, 'Garder la tête hors de l’eau'),
    titre: 'Ton année <span class="eau">en un coup d’œil</span>',
    corps: `<div class="c plein cal">
${kv('Janvier', 'Vérifie ou crée ton acompte d’impôt. PAMC : l’appel de la CARMF arrive.')}
${kv('Février', 'PAMC : acompte CARMF avant le 28, si tu n’es pas mensualisé.')}
${kv('Avril à juin', 'Ta déclaration de revenus en ligne, avec le volet social en PAMC. Au réel, ta 2035 en mai.')}
${kv('Après ta déclaration', 'PAMC : l’URSSAF recalcule l’année passée, avec un nouvel échéancier.')}
${kv('Mai à août', 'PAMC : le solde de la CARMF est appelé, à payer avant le 31 août.')}
${kv('Septembre', 'Le solde de ton impôt de l’année passée, jusqu’en décembre s’il dépasse 300 €.')}
${kv('Avant sa date', 'Interne : renouvelle ta licence, avant la date écrite dessus.')}
${kv('15 décembre', 'La CFE, à partir de ta 2e année.')}
${kv('31 décembre', 'L’année où tu démarres : ta déclaration de CFE (1447-C-SD).')}
${kv('Chaque trimestre', 'RSPM : ta déclaration et ton paiement à l’URSSAF (ou chaque mois, sur demande).')}
</div>`,
  }),

  sable({
    id: 'routine', rep: rep(4, 'Garder la tête hors de l’eau'),
    titre: 'Ta routine, <span class="eau">rempla après rempla</span>',
    corps: `<div class="c plein"><div class="frise">
<div class="fi"><p class="fq">Chaque soir de rempla</p><p class="fd">Note ce qui a été encaissé, et comment. C’est ta trace, et la base de ta rétrocession.</p></div>
<div class="fi"><p class="fq">À la fin du rempla</p><p class="fd">Envoie ta facture&nbsp;[[p:facture]], et retiens la date de paiement prévue.</p></div>
<div class="fi"><p class="fq">À chaque virement</p><p class="fd">Vérifie le montant, puis mets 35 % sur le compte à part&nbsp;[[p:reserve]].</p></div>
<div class="fi"><p class="fq">À chaque dépense pro</p><p class="fd">Garde le justificatif et note tes kilomètres : c’est ce qui te dira si le réel devient intéressant.</p></div>
<div class="fi"><p class="fq">Une fois par mois</p><p class="fd">Pointe les rétros reçues et relance celles qui manquent.</p></div>
<div class="fi"><p class="fq">Chaque janvier</p><p class="fd">Fais le point : ton acompte d’impôt&nbsp;[[p:septembre]], les réductions à demander à la CARMF&nbsp;[[p:carmf-demander]], ta RCP renouvelée.</p></div>
</div>
<p class="ret"><span class="lab">Hippodoc en fait la moitié : </span>la facture générée et envoyée en un clic, le suivi « facturé » ou « encaissé », tes kilomètres calculés.</p></div>`,
  }),

  sable({
    id: 'glossaire', h: 2, rep: 'Pour s’y retrouver',
    titre: 'Les mots <span class="eau">du remplaçant</span>',
    corps: `<div class="c plein glo">
<p><b>ASV</b> Allocation supplémentaire vieillesse : une retraite en plus.</p>
<p><b>BNC</b> Bénéfices non commerciaux : tes revenus de libéral.</p>
<p><b>CARMF</b> Ta caisse de retraite de médecin libéral.</p>
<p><b>CFE</b> Cotisation foncière des entreprises : un impôt local.</p>
<p><b>CPAM</b> Ta caisse d’Assurance maladie.</p>
<p><b>CPS</b> Ta carte de professionnel de santé.</p>
<p><b>Forfaits</b> Les cotisations des débuts, calculées sur un revenu fixe.</p>
<p><b>Invalidité-décès</b> La cotisation CARMF qui t’indemnise dès le 91e jour d’arrêt.</p>
<p><b>Micro-BNC</b> Le régime d’impôt simple : impôt sur 66 % de tes recettes.</p>
<p><b>PAMC</b> Le régime social classique des libéraux.</p>
<p><b>RCP</b> Responsabilité civile professionnelle, obligatoire.</p>
<p><b>Secteur 1</b> Tarifs de la Sécurité sociale, sans dépassement d’honoraires.</p>
<p><b>Rattrapage</b> Le recalcul de tes cotisations sur ton vrai revenu.</p>
<p><b>RPPS</b> Ton numéro au Répertoire des professionnels de santé.</p>
<p><b>RSPM</b> Régime simplifié des professions médicales.</p>
<p><b>Super-Net</b> Ce qui te reste vraiment après charges, cotisations et impôt.</p>
<p><b>Tranche marginale</b> Le taux de ta tranche d’impôt la plus haute.</p>
<p><b>URSSAF</b> Elle collecte tes cotisations sociales.</p>
</div>`,
  }),

  sable({
    id: 'ressources', h: 2, rep: 'Ressources',
    titre: 'Pour aller plus loin, <span class="eau">en accès libre</span>',
    chapo: 'Sur hippodoc.fr, sans compte. Et chaque dimanche sur Instagram, une fiche et son kit.',
    corps: `<div class="c">
<div class="ln kv"><a class="k lien-k" href="${U('/simulateur')}">Le simulateur</a><span class="v">Ton Super-Net avec tes chiffres : RSPM ou PAMC, micro ou réel.</span></div>
<div class="ln kv"><a class="k lien-k" href="${U('/guide-declarations')}">Le guide des déclarations</a><span class="v">2035, 2042-C-PRO, volet social : quoi remplir, et où.</span></div>
<div class="ln kv"><a class="k lien-k" href="${U('/guide-declarations/calculette')}">La calculette</a><span class="v">Les montants du volet social de ta déclaration, calculés.</span></div>
<div class="ln kv"><a class="k lien-k" href="${U('/blog')}">Le blog</a><span class="v">Plus de 50 articles, rangés par thème, du premier rempla à l’installation.</span></div>
</div>
<div class="c ink plein"><p class="ct">Les fiches du dimanche, et leurs kits</p>
<p>Chaque dimanche sur <b>@hippodoc.fr</b>, une fiche sur un sujet de remplaçant. Commente le mot indiqué : tu reçois son kit en message privé (mode d’emploi, souvent un tableur, des messages à copier).</p>
<p class="note">Déjà parues, par exemple : la prévoyance, le congé maternité, la comptabilité, le seuil du micro-BNC la 1re année.</p>
</div>`,
  }),

  sable({
    id: 'hippodoc', h: 2, rep: 'Hippodoc',
    titre: 'Tout ce guide, <span class="eau">calculé pour toi</span>',
    chapo: 'Hippodoc, le logiciel de gestion des médecins remplaçants, en médecine générale comme en spécialité : tu notes tes journées, il fait les&nbsp;calculs.',
    corps: `<div class="rang">
<div class="c"><p class="ct">Ton Super-Net à jour</p><p class="note">Après chaque journée : URSSAF, CARMF, impôts, et ce qu’il te reste.</p></div>
<div class="c"><p class="ct">Tes factures de rétro</p><p class="note">Détaillées jour par jour, envoyées en un clic au remplacé.</p></div>
<div class="c"><p class="ct">Facturé ou encaissé ?</p><p class="note">Tu vois tout de suite quelle rétro n’est pas arrivée.</p></div>
<div class="c"><p class="ct">Ta déclaration préparée</p><p class="note">RSPM ou PAMC, micro ou réel : les montants à reporter, case&nbsp;par&nbsp;case.</p></div>
</div>
<div class="c plein offre"><p class="ct">30 jours d’essai gratuit</p>
<p>Ta carte bancaire est demandée à l’inscription, mais rien n’est débité pendant l’essai.</p>
<p><b>Interne ou docteur junior ?</b> 10 € par mois jusqu’à la fin de ton internat, sur justificatif.</p>
<p style="margin-top:auto"><a class="btn btn-brand" href="${U('/essai')}">Essayer 30 jours gratuitement</a></p>
</div>`,
  }),

  sable({
    id: 'sources', h: 2, rep: 'Sources',
    titre: 'D’où viennent <span class="eau">ces chiffres</span>',
    corps: `<div class="c plein src">
${kv('Ordre', 'Code de la santé publique : L4131-2, D4131-2 et D4131-3-2 (licence, autorisation, inscription), R4127-65, R4127-86 et R4127-91 (contrat, non-réinstallation : décret n° 2026-691 du 27 juillet 2026), L1142-2 et L1142-25 (RCP). Docteurs juniors : instruction DGOS du 21 mai 2026. Intérim : décret n° 2025-1147.')}
${kv('URSSAF', 'Code de la sécurité sociale : L642-4-2, D642-4-1 à D642-4-3 (RSPM), L131-6-2 (revenus estimés). urssaf.fr, service simplifié des médecins. Notice PAMC 2026.')}
${kv('CARMF', 'Cotisations 2026 en début et en cours d’activité, réductions 2026, dépliants « Début d’exercice libéral » et « Remplaçants » (février 2026), carmf.fr.')}
${kv('Assurance maladie', 'Indemnités journalières des libéraux, inscription des remplaçants, ameli.fr.')}
${kv('Impôts', 'Code général des impôts : 102 ter (micro-BNC), 261-4-1° (TVA), 289 (factures), 1647 D (CFE). BOFiP, brochure de l’impôt 2026, prélèvement à la source, impots.gouv.fr.')}
${kv('Les montants', 'Moteur du simulateur d’Hippodoc : barème 2026, modèle de l’URSSAF, taux 2026 de la CARMF. Arrondis à 10 € (à l’euro pour la journée).')}
<p class="ret"><span class="lab">Information générale, à jour au 15 novembre 2026. </span>Les taux changent chaque année et chaque situation est unique : pour ton cas, vois avec ton conseil de l’Ordre, l’URSSAF, la CARMF ou un expert-comptable.</p>
</div>`,
  }),

  fin(),
];
