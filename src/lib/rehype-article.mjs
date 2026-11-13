// Balisage du corps des articles du blog, posé AU RENDU (MIGRATION.md § 9.fj).
// Le Markdown n'est pas touché, aucun mot ni aucune espace n'est ajouté ou retiré : le plugin
// enveloppe (émojis, marques de liste, lignes, numéros de titre), reclasse (un paragraphe de lignes
// marquées devient une liste) et étiquette (classes et attributs). La feuille du gabarit
// (src/styles/blog-article.css) dessine à partir de ce balisage.
//
// Branché dans astro.config.mjs comme plugin rehype, avec les options de src/lib/article-options.mjs
// et l'empreinte de ses fichiers (sans elle, Astro resservirait le HTML d'avant une retouche du plugin).
// Astro calcule les ancres des titres APRÈS les plugins rehype de l'utilisateur : ce plugin lance donc
// lui-même, en premier, le calcul d'Astro (rehypeHeadingIds). Les ancres sont posées avant toute
// retouche, et le second passage d'Astro les garde telles quelles.
//
// Ce que le plugin pose (comptes au 13 novembre 2026, 48 articles) :
//   émojis      span.em[data-em-role, data-em-pos, data-em-etat, data-em-n, data-em-picto] (1 074) ;
//   listes      ul.fl / ol.fl (fausses listes faites de lignes), li[data-m, data-m2, data-etat, data-touche],
//               .fl-m et .fl-m2 (la marque tapée), .fl-unie, .fl-legende, .fl-total, p.fl-intitule, .colle ;
//   lignes      p.lignes > span.lg (paragraphe découpé par des <br>, qui restent), .lg-titre ;
//   titres      span.t-txt, .t-num[data-no, data-no-forme], .t-no, .t-pt, .t-sous, .t-encadre, .t-sources,
//               .t-date, .t-hippo, data-n (rang), data-np (rang dans le plan) ;
//   encadrés    .callout-titre, .callout-seul, .callout-sans-titre, .callout-hippo ;
//   tableaux    div.tbl[data-cols, data-large, data-num…], th[scope=col], td[data-th, data-court], .tbl-num,
//               tr.tbl-total, tr.tbl-fort ;
//   chiffres    ul.kv > li.kv-ligne > .kv-l, .kv-s, .kv-v ;  sources  .sources ;  nombres  span.nb.
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import { PICTO_PAR_EMOJI } from './article-emojis.mjs';

// ───────── Émojis : même définition que le recensement de l'audit du blog (MIGRATION.md § 9.fj) ─────────
export const EMO_SRC = '(?:\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic}|[\\u{1F3FB}-\\u{1F3FF}])*|[\\u{1F1E6}-\\u{1F1FF}]{2}|[0-9#*]\\uFE0F?\\u20E3)';
const EMO = () => new RegExp(EMO_SRC, 'gu');
const RE_EMO_TETE = new RegExp('^' + EMO_SRC, 'u');
const RE_TOUCHE = /^([0-9#*])️?⃣$/u;
const sansVariante = (e) => e.replace(/️/g, '');
const ETATS = { '✅': 'oui', '☑': 'oui', '✔': 'oui', '❌': 'non', '⛔': 'non', '🚫': 'non', '🛑': 'non', '⚠': 'attention', '❗': 'attention' };
const MAINS = new Set(['👉', '👇', '➡']);
const NOTES = new Set(['💡', '📌', '📍', '🧠', '💬']);
/** Rôle d'un émoji, d'après son dessin seul. */
export function roleEmoji(e) {
  const k = sansVariante(e);
  const t = e.match(RE_TOUCHE);
  if (t) return { role: 'touche', n: t[1] };
  if (k === '🔟') return { role: 'touche', n: '10' };
  if (ETATS[k]) return { role: 'etat', etat: ETATS[k] };
  if (MAINS.has(k)) return { role: 'main' };
  if (NOTES.has(k)) return { role: 'note' };
  if (k === '🦛') return { role: 'mascotte' };
  return { role: 'decor' };
}
export const pictoEmoji = (e) => PICTO_PAR_EMOJI[sansVariante(e)] ?? null;

// ───────── Marques de fausse liste ─────────
const PUCES = '•·▪◦●';
const FLECHES = '→➝⇒➜';
const TIRETS = '–—';
const RE_SIGNE = new RegExp('^(?:[' + PUCES + TIRETS + FLECHES + '✓]|-(?=\\s))\\s*', 'u');
const RE_NUMERO = /^(?:\d{1,2}[.)]\s|0\d\s[—–-]\s)/u;
const RE_MARQUE = new RegExp('^((?:' + EMO_SRC + ')|[' + PUCES + TIRETS + FLECHES + '✓-]|\\d{1,2}[.)]|0\\d\\s[—–-])', 'u');
const RE_MARQUE2_EMOJI = new RegExp('^(\\s*)(' + EMO_SRC + ')', 'u');
const RE_MARQUE2_FLECHE = new RegExp('^(\\s*)([' + FLECHES + '])', 'u');
const genreSigne = (s) => (PUCES.includes(s) ? 'puce' : FLECHES.includes(s) ? 'fleche' : s === '✓' ? 'coche' : 'tiret');
// Ligne de total prise dans une liste : « • → Total cotisations : 13 474 € », « • → Super net = … ».
const RE_TOTAL = /^(?:[=→➝]\s*)?(?:total|sous-total)\b/iu;
// Ligne « libellé : nombre » (règle R12 du recensement).
const RE_LIBELLE_NOMBRE = /^(?:\P{L}*)?[^:=→]{2,45}\s?(?::|=|→)\s?(?:≈|~|env\.?|environ)?\s?[+−-]?\d[\d   .,]*\s?(?:€|%|k€)(?:\s?\/\s?\p{L}+)?(?:\s?\([^)]{0,40}\))?\.?(?:\s\p{Extended_Pictographic}️?)?$/u;

// ───────── Petits outils hast ─────────
const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const txt = (value) => ({ type: 'text', value });
const estEl = (n, tag) => !!n && n.type === 'element' && (!tag || n.tagName === tag);
const estBlanc = (n) => n.type === 'text' && !n.value.trim();
const classesDe = (n) => { const c = n.properties?.className ?? n.properties?.class; return Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(/\s+/).filter(Boolean) : []; };
const aClasse = (n, c) => estEl(n) && classesDe(n).includes(c);
function ajouterClasse(n, ...noms) {
  const c = classesDe(n);
  for (const x of noms) if (x && !c.includes(x)) c.push(x);
  n.properties = { ...(n.properties || {}) };
  delete n.properties.class;
  n.properties.className = c;
}
const texteDe = (n) => (n.type === 'text' ? n.value : (n.children || []).map(texteDe).join(''));
const texteDes = (noeuds) => noeuds.map(texteDe).join('');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const BLOCS = new Set(['p', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'aside', 'blockquote', 'div', 'section', 'details', 'summary', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'hr', 'dl', 'dt', 'dd', 'figure', 'figcaption']);
const estBloc = (n) => estEl(n) && BLOCS.has(n.tagName);
const estTitre = (n) => estEl(n) && /^h[23]$/.test(n.tagName);
const elementsDe = (parent) => parent.children.filter((c) => estEl(c));
/** Les nœuds de texte d'une suite de nœuds, dans l'ordre, avec leur parent. */
function textes(noeuds, parent, out = []) {
  for (const n of noeuds) {
    if (n.type === 'text') out.push({ noeud: n, parent });
    else if (n.children) textes(n.children, n, out);
  }
  return out;
}
/** Remplace, dans un nœud de texte, la tranche [debut, fin) par un élément qui l'enveloppe. */
function envelopper(t, debut, fin, fabrique) {
  const v = t.noeud.value;
  const i = t.parent.children.indexOf(t.noeud);
  const dedans = txt(v.slice(debut, fin));
  const e = fabrique(dedans);
  const apres = v.slice(fin) ? txt(v.slice(fin)) : null;
  t.parent.children.splice(i, 1, ...(debut ? [txt(v.slice(0, debut))] : []), e, ...(apres ? [apres] : []));
  return { element: e, apres: apres ? { noeud: apres, parent: t.parent } : null };
}

export const OPTIONS_PAR_DEFAUT = { sections: false, sourcesPli: false, essentielEnTete: false, decorMuet: false };

/**
 * Plugin rehype. Options (toutes à faux par défaut, voir src/lib/article-options.mjs) :
 *   sections, sourcesPli, essentielEnTete, decorMuet.
 * `filtre(chemin)` : limite le plugin à certains fichiers (par défaut src/content/blog/).
 */
export function rehypeArticle(options = {}) {
  const opt = { ...OPTIONS_PAR_DEFAUT, ...options };
  const filtre = opt.filtre ?? ((chemin) => !chemin || /[\\/]content[\\/]blog[\\/]/.test(chemin));
  const ancresAstro = rehypeHeadingIds();

  return function transformer(tree, file) {
    const chemin = String(file?.path ?? file?.history?.[0] ?? '');
    if (!filtre(chemin)) return;
    // 1. Les ancres, à l'identique d'Astro, AVANT toute retouche.
    ancresAstro(tree, file);
    const stats = {};
    const compte = (k, n = 1) => { stats[k] = (stats[k] || 0) + n; };
    const journal = {};
    const noter = (k, v) => { (journal[k] ||= []).push(v); };

    // ═════════ 2. Blocs : paragraphes découpés, fausses listes, lignes ═════════
    /** Découpe une suite de nœuds en lignes, aux <br>. Les blancs collés aux <br> sont retirés (ils sont remis en sortie). */
    function lignesDe(enfants) {
      const segs = [[]];
      for (const c of enfants) { if (estEl(c, 'br')) segs.push([]); else segs[segs.length - 1].push(c); }
      return segs.map((noeuds) => {
        noeuds = noeuds.slice();
        while (noeuds.length && estBlanc(noeuds[0])) noeuds.shift();
        while (noeuds.length && estBlanc(noeuds[noeuds.length - 1])) noeuds.pop();
        if (noeuds[0]?.type === 'text') noeuds[0] = txt(noeuds[0].value.replace(/^\s+/, ''));
        const dernier = noeuds[noeuds.length - 1];
        if (dernier?.type === 'text') noeuds[noeuds.length - 1] = txt(dernier.value.replace(/\s+$/, ''));
        const t = norm(texteDes(noeuds));
        const e = t.match(RE_EMO_TETE);
        const apresE = e ? t.slice(e[0].length).trimStart() : t;
        const sg = apresE.match(RE_SIGNE);
        const nu = apresE.match(RE_NUMERO);
        const pleins = noeuds.filter((c) => c.type !== 'text' || c.value.replace(EMO(), '').trim());
        const l = {
          noeuds, t, vide: !t,
          emoji: e ? e[0] : null,
          signe: !e && sg ? sg[0].trim() : null,
          numero: !e && !sg && nu ? nu[0].trim() : null,
          apresMarque: e ? apresE : sg ? apresE.slice(sg[0].length) : nu ? apresE.slice(nu[0].length) : t,
          gras: pleins.length > 0 && pleins.every((c) => estEl(c, 'strong')),
          finDeuxPoints: /[:：]$/.test(t),
        };
        l.marque = l.emoji || l.signe || (l.numero ? 'n°' : null);
        l.intitule = l.gras || l.finDeuxPoints;
        return l;
      });
    }
    /** Un <p class="lignes"> : chaque ligne dans <span class="lg">, les <br> gardés. */
    function blocLignes(tag, proprietes, lignes, { dernierBloc = true } = {}) {
      const enfants = [];
      const pleines = lignes.filter((l) => !l.vide);
      lignes.forEach((l, k) => {
        if (k) enfants.push(el('br'), txt('\n'));
        if (l.vide) return;
        const span = el('span', { className: ['lg'] }, l.noeuds);
        // Intitulé : la première ligne, finissant par « : » ou en gras d'un bout à l'autre, suivie d'autres lignes.
        // Garde-fous (relevés sur les 48 articles) : une ligne « libellé : nombre » n'est pas un intitulé ; deux lignes
        // en gras qui se suivent sont deux lignes parallèles ; une phrase en gras finissant par un point est une
        // phrase d'emphase, sauf si elle est numérotée (« 2. Lisse sur 12 mois. »).
        const kv = RE_LIBELLE_NOMBRE.test(l.t);
        const titreDeLignes = !kv && (l.finDeuxPoints || (l.gras && !pleines[1]?.gras && (/^\d{1,2}[.)]\s/.test(l.t) || !/[.!…]$/.test(l.t))));
        if (l === pleines[0] && pleines.length > 1 && titreDeLignes) { ajouterClasse(span, 'lg-titre'); compte('lignes : intitulés (lg-titre)'); noter('lg-titre', l.t.slice(0, 50) + ' ‖ ' + pleines[1].t.slice(0, 40)); }
        else if (l !== pleines[0] && l !== pleines[pleines.length - 1] && l.intitule) noter('ligne du milieu en gras ou à deux-points (non marquée)', l.t.slice(0, 70));
        enfants.push(span);
      });
      const bloc = el(tag, proprietes, enfants);
      ajouterClasse(bloc, 'lignes');
      compte('lignes : blocs (.lignes)'); compte('lignes : lignes (.lg)', pleines.length);
      return bloc;
    }
    /** R12 : au moins deux lignes « libellé : nombre » qui se suivent. */
    function blocDeChiffres(lignes) {
      let suite = 0, mieux = 0, n = 0;
      for (const l of lignes) { const ok = RE_LIBELLE_NOMBRE.test(l.t); suite = ok ? suite + 1 : 0; mieux = Math.max(mieux, suite); if (ok) n++; }
      if (mieux < 2) return false;
      compte('chiffres : blocs (.kv)'); compte('chiffres : lignes (.kv-ligne)', n);
      return true;
    }
    /** Un élément de fausse liste : la marque dans <span class="fl-m">, la seconde dans <span class="fl-m2">. */
    function elementDeListe(l) {
      const li = el('li', {}, l.noeuds);
      const ts = textes(li.children, li).filter((t) => t.noeud.value.trim());
      const t0 = ts[0];
      const m = t0?.noeud.value.match(RE_MARQUE);
      if (!m) return li;
      const { apres } = envelopper(t0, 0, m[1].length, (dedans) => el('span', { className: ['fl-m'] }, [dedans]));
      li.properties.dataM = l.emoji ? 'emoji' : l.numero ? 'num' : genreSigne(l.signe);
      if (l.numero) li.properties.dataNo = m[1].replace(/[^\d]/g, '');
      let etat = l.emoji ? roleEmoji(l.emoji).etat : null;
      // Seconde marque : un émoji après la première marque (« • 🚗 », « →✅ », « ✅ ⏰ »), ou une flèche après une puce (« • → Total »).
      const suite = apres && apres.noeud.value.trim() ? apres : ts[1] ?? null;
      if (suite) {
        const m2 = suite.noeud.value.match(RE_MARQUE2_EMOJI) || (l.signe && PUCES.includes(l.signe) ? suite.noeud.value.match(RE_MARQUE2_FLECHE) : null);
        if (m2) {
          envelopper(suite, m2[1].length, m2[0].length, (dedans) => el('span', { className: ['fl-m2'] }, [dedans]));
          li.properties.dataM2 = RE_EMO_TETE.test(m2[2]) ? 'emoji' : 'fleche';
          compte('listes : lignes à deux marques (.fl-m2)'); noter('fl-m2', l.t.slice(0, 60));
          if (!etat && RE_EMO_TETE.test(m2[2])) etat = roleEmoji(m2[2]).etat ?? null;
        }
      }
      if (etat) li.properties.dataEtat = etat;
      // Touche 1️⃣ en marque : son chiffre sur l'élément, pour que la feuille l'écrive dans la marge (l'émoji, lui,
      // est masqué comme les autres : le dessin ne peut pas venir d'un élément masqué).
      const touche = l.emoji ? roleEmoji(l.emoji).n : null;
      if (touche) { li.properties.dataTouche = touche; compte('listes : marques en touche (data-touche)'); }
      const reste = norm(texteDe(li)).replace(new RegExp('^(?:(?:' + EMO_SRC + ')|[' + PUCES + TIRETS + FLECHES + '✓-]|\\s)+', 'u'), '');
      if (RE_TOTAL.test(reste)) { ajouterClasse(li, 'fl-total'); compte('listes : lignes de total (.fl-total)'); noter('fl-total', l.t.slice(0, 80)); }
      return li;
    }
    function fausseListe(lignes, ctx, separateurs = null) {
      const aeree = !!separateurs;
      const emojis = lignes.every((l) => l.emoji);
      const fam = emojis && lignes.every((l) => roleEmoji(l.emoji).role === 'etat') ? 'etat' : emojis ? 'emoji' : lignes.every((l) => l.signe) ? 'puce' : lignes.every((l) => l.numero) ? 'num' : 'mixte';
      const items = lignes.map(elementDeListe);
      const liste = el(fam === 'num' ? 'ol' : 'ul', { className: ['fl'], dataFl: fam, dataFlN: String(lignes.length) }, items.flatMap((li, k) => (k ? [...(separateurs ? separateurs[k - 1] : [txt('\n')]), li] : [li])));
      if (new Set(lignes.map((l) => l.marque)).size === 1) { ajouterClasse(liste, 'fl-unie'); compte('listes : groupes à marque unique (.fl-unie)'); }
      // « Pour et contre » : deux lignes, « ✅ + … » puis « ⚠️ - … » (choix-mode-exercice).
      if (lignes.length === 2 && lignes[0].emoji && lignes[1].emoji && roleEmoji(lignes[0].emoji).etat === 'oui' && ['attention', 'non'].includes(roleEmoji(lignes[1].emoji).etat) && /^\+/.test(lignes[0].apresMarque) && /^[-–−]/.test(lignes[1].apresMarque)) {
        ajouterClasse(liste, 'fl-pc'); items[0].properties.dataPc = 'pour'; items[1].properties.dataPc = 'contre';
        compte('listes : paires « pour et contre » (.fl-pc)');
      }
      if (aeree) { ajouterClasse(liste, 'fl-aeree'); compte('listes : suites de paragraphes (.fl-aeree)'); compte('listes : paragraphes devenus éléments (.fl-aeree > li)', lignes.length); }
      else { compte('listes : groupes issus de lignes'); compte('listes : lignes devenues éléments', lignes.length); }
      compte('listes : groupes (.fl)'); compte('listes : éléments (.fl > li)', lignes.length);
      compte('listes : groupes data-fl=' + fam); compte('listes : éléments data-fl=' + fam, lignes.length);
      if (ctx.encadre) compte('listes : groupes dans un encadré');
      if (blocDeChiffres(lignes)) { ajouterClasse(liste, 'kv'); items.forEach((li, k) => { if (RE_LIBELLE_NOMBRE.test(lignes[k].t)) ajouterClasse(li, 'kv-ligne'); }); }
      return liste;
    }
    /** Paragraphe découpé par des <br> : listes (R2), intitulés, lignes (R4). Rend les blocs qui le remplacent. */
    function paragrapheDecoupe(p, ctx) {
      const lignes = lignesDe(p.children);
      compte('paragraphes découpés par des <br>'); compte('lignes de ces paragraphes', lignes.filter((l) => !l.vide).length);
      // Garde-fous du recensement : une ligne numérotée tout en gras est un intitulé ; une ligne à émoji, en gras ou
      // finissant par « : », suivie d'une ligne à signe (« • »), est un intitulé.
      const intituleAvantPuces = (i) => lignes[i + 1] && lignes[i + 1].signe && lignes[i].intitule && !lignes[i].signe;
      const suites = []; let cur = [];
      lignes.forEach((l, i) => {
        const ok = l.marque && !(l.numero && l.gras) && !(l.emoji && intituleAvantPuces(i));
        if (ok) cur.push(i); else { if (cur.length >= 2) suites.push(cur); cur = []; }
      });
      if (cur.length >= 2) suites.push(cur);
      if (!suites.length) {
        // R12 : un bloc de chiffres sans marque devient une liste <ul class="kv">, une ligne par élément.
        const pleines = lignes.filter((l) => !l.vide);
        if (blocDeChiffres(pleines)) {
          const items = pleines.map((l) => { const li = el('li', {}, l.noeuds); if (RE_LIBELLE_NOMBRE.test(l.t)) ajouterClasse(li, 'kv-ligne'); return li; });
          compte('chiffres : paragraphes devenus <ul class="kv">');
          return [el('ul', { className: ['kv'], dataKvN: String(pleines.length) }, items.flatMap((li, k) => (k ? [txt('\n'), li] : [li])))];
        }
        return [blocLignes('p', p.properties, lignes)];
      }
      const morceaux = [];
      const texteLibre = (de, a, avantListe) => {
        let ls = lignes.slice(de, a);
        while (ls.length && ls[0].vide) ls.shift();
        while (ls.length && ls[ls.length - 1].vide) ls.pop();
        if (!ls.length) return;
        let intitule = null;
        if (avantListe && ls[ls.length - 1].intitule) intitule = ls.pop();
        if (ls.length === 1) morceaux.push(el('p', {}, ls[0].noeuds));
        else if (ls.length > 1) morceaux.push(blocLignes('p', {}, ls));
        if (intitule) { morceaux.push(el('p', { className: ['fl-intitule'] }, intitule.noeuds)); compte('listes : intitulés (.fl-intitule)'); noter('fl-intitule', intitule.t.slice(0, 70)); }
      };
      let i = 0;
      for (const s of suites) {
        texteLibre(i, s[0], true);
        morceaux.push(fausseListe(s.map((k) => lignes[k]), ctx));
        i = s[s.length - 1] + 1;
      }
      texteLibre(i, lignes.length, false);
      // Les morceaux d'un même paragraphe restent collés : tous sauf le dernier portent « colle ».
      morceaux.slice(0, -1).forEach((m) => ajouterClasse(m, 'colle'));
      if (morceaux.length > 1) compte('paragraphes éclatés en plusieurs blocs (.colle)');
      return morceaux.flatMap((m, k) => (k ? [txt('\n'), m] : [m]));
    }
    /** Suites de paragraphes d'une ligne qui forment une liste (R8, « fausses listes aérées »). */
    function suitesAerees(parent, ctx) {
      const genre = (p) => {
        if (!estEl(p, 'p') || classesDe(p).length || p.children.some((c) => estEl(c, 'br'))) return null;
        const e = norm(texteDe(p)).match(RE_EMO_TETE);
        if (!e) return null;
        const r = roleEmoji(e[0]);
        // Une coche ou une croix ouvre un élément de liste ; un pictogramme de décor aussi. Une note (💡 📌), une main
        // (👉) ou une alerte (⚠️) en tête d'un paragraphe isolé est une remarque, pas un élément : jamais dans une liste.
        return r.role === 'etat' ? (r.etat === 'attention' ? null : 'etat') : r.role === 'decor' ? 'decor' : null;
      };
      const out = []; let run = [];
      const vider = () => {
        if (run.length >= 2) {
          // Les blancs qui séparaient les paragraphes sont gardés tels quels entre les éléments : dans un encadré il
          // n'y en a pas, et en ajouter un collerait ou décollerait deux mots dans le texte lu par script.
          const ps = run.filter((n) => estEl(n, 'p'));
          const seps = []; run.forEach((n) => { if (estEl(n, 'p')) seps.push([]); else seps[seps.length - 1].push(n); });
          const lignes = ps.map((p) => lignesDe(p.children)[0]);
          noter('fl-aeree', lignes.map((l) => l.t.slice(0, 46)).join(' / '));
          out.push(fausseListe(lignes, ctx, seps.slice(0, -1)));
        } else out.push(...run);
        run = [];
      };
      let genreCourant = null; let attente = [];
      for (const n of parent.children) {
        if (estBlanc(n)) { if (run.length) attente.push(n); else out.push(n); continue; }
        const g = genre(n);
        if (g && (g === genreCourant || !run.length)) { run.push(...attente, n); attente = []; genreCourant = g; continue; }
        vider(); out.push(...attente); attente = []; genreCourant = null;
        if (g) { run.push(n); genreCourant = g; } else out.push(n);
      }
      vider(); out.push(...attente);
      parent.children = out;
    }
    function traiterBlocs(parent, ctx) {
      const out = [];
      for (const n of parent.children) {
        if (!estEl(n)) { out.push(n); continue; }
        if (n.tagName === 'p') {
          if (n.children.some((c) => estEl(c, 'br'))) out.push(...paragrapheDecoupe(n, ctx)); else { compte('paragraphes d’une seule ligne'); out.push(n); }
        } else if (n.tagName === 'ul' || n.tagName === 'ol') {
          for (const li of n.children.filter((c) => estEl(c, 'li'))) {
            if (li.children.some(estBloc)) traiterBlocs(li, ctx);
            else if (li.children.some((c) => estEl(c, 'br'))) { const b = blocLignes('li', li.properties, lignesDe(li.children)); li.properties = b.properties; li.children = b.children; }
          }
          out.push(n);
        } else if (aClasse(n, 'callout') || n.tagName === 'blockquote') {
          // Encadré (div.callout, src/lib/remark-callouts.mjs) ou citation.
          traiterBlocs(n, aClasse(n, 'callout') ? { ...ctx, encadre: classesDe(n).find((c) => c.startsWith('callout-')) || 'callout' } : ctx);
          out.push(n);
        } else out.push(n);
      }
      parent.children = out;
      suitesAerees(parent, ctx);
    }
    traiterBlocs(tree, { encadre: null });

    // ═════════ 3. Titres ═════════
    const fabriqueEm = (e, pos) => {
      const r = roleEmoji(e);
      const p = { className: ['em'], dataEmRole: r.role, dataEmPos: pos };
      if (r.etat) p.dataEmEtat = r.etat;
      if (r.n) p.dataEmN = r.n;
      const pic = pictoEmoji(e);
      if (pic) p.dataEmPicto = pic;
      if (opt.decorMuet && r.role === 'decor') p.ariaHidden = 'true';
      compte('émojis enveloppés (.em)'); compte('émojis : pos=' + pos); compte('émojis : role=' + r.role);
      if (r.etat) compte('émojis : etat=' + r.etat);
      compte(pic ? 'émojis : avec data-em-picto' : 'émojis : sans data-em-picto');
      return el('span', p, [txt(e)]);
    };
    const titres = [];
    {
      let n2 = 0, np = 0, n3 = 0;
      const blocs = elementsDe(tree);
      blocs.forEach((h, i) => {
        if (!estTitre(h)) return;
        compte('titres (h2 et h3)');
        const brut = norm(texteDe(h));
        const sansEmoji = norm(brut.replace(EMO(), ''));
        const infos = { slug: String(h.properties?.id ?? ''), depth: Number(h.tagName[1]), numero: null, encadre: false, sources: false, hippo: false, n: null, np: null };
        // R7 et sections au nom d'Hippodoc : d'après le TEXTE du titre.
        if (/^sources\b/i.test(sansEmoji)) { infos.sources = true; ajouterClasse(h, 't-sources'); compte('titres : t-sources'); }
        if (/hippodoc/i.test(sansEmoji)) { infos.hippo = true; ajouterClasse(h, 't-hippo'); compte('titres : t-hippo'); }
        // R5 : un titre, un encadré, puis un autre titre ou la fin.
        const suivant = blocs[i + 1], apres = blocs[i + 2];
        if (aClasse(suivant, 'callout') && (!apres || estTitre(apres))) {
          infos.encadre = true; ajouterClasse(h, 't-encadre'); ajouterClasse(suivant, 'callout-seul'); compte('titres : t-encadre');
        }
        // Rangs : data-n (h2 hors sources), data-np (h2 du plan : hors sources et hors titres d'encadré).
        if (h.tagName === 'h2') {
          n3 = 0;
          if (!infos.sources) { infos.n = String(++n2); if (!infos.encadre) infos.np = String(++np); }
        } else { infos.n = n2 + '.' + ++n3; }
        if (infos.n) h.properties.dataN = infos.n;
        if (infos.np) h.properties.dataNp = infos.np;
        // Émojis de tête et de fin, texte, numéro écrit. Un titre est fait d'un seul texte (aucun gras, aucun lien dans
        // les 583 titres) ; sinon il est laissé tel quel et ses émojis sont enveloppés par la passe générale.
        if (h.children.length === 1 && h.children[0].type === 'text') {
          let reste = h.children[0].value; const tete = [], queue = [];
          let m; const reTete = new RegExp('^(\\s*)(' + EMO_SRC + ')', 'u');
          const formes = [];
          while ((m = reste.match(reTete))) {
            if (m[1]) tete.push(txt(m[1]));
            const em = fabriqueEm(m[2], 'titre-debut');
            if (em.properties.dataEmRole === 'touche') { ajouterClasse(em, 't-no'); infos.numero = em.properties.dataEmN; formes.push('touche'); }
            tete.push(em); reste = reste.slice(m[0].length);
          }
          if (tete.length) { const b = reste.match(/^\s*/)[0]; if (b) { tete.push(txt(b)); reste = reste.slice(b.length); } }
          const mq = reste.match(new RegExp('(\\s*)((?:' + EMO_SRC + '\\s*)+)([\\s.!?]*)$', 'u'));
          if (mq && mq.index > 0) {
            if (mq[1]) queue.push(txt(mq[1]));
            let dernier = 0; const s = mq[2]; let r; const re = EMO();
            while ((r = re.exec(s))) { if (r.index > dernier) queue.push(txt(s.slice(dernier, r.index))); queue.push(fabriqueEm(r[0], 'titre-fin')); dernier = r.index + r[0].length; }
            if (dernier < s.length) queue.push(txt(s.slice(dernier)));
            if (mq[3]) queue.push(txt(mq[3]));
            reste = reste.slice(0, mq.index);
          }
          // R11 : le numéro ÉCRIT (jamais recalculé). « 1. », « 4.1 », « Étape 1 ».
          const corps = [];
          const mn = reste.match(/^(\d{1,2}\.\d{1,2}|\d{1,2}[.)])(?=\s)/) || reste.match(/^([ÉE]tape\s+\d{1,2})(?=\s|$)/u);
          if (mn) {
            const etape = /^[ÉE]/u.test(mn[1]);
            const pt = mn[1].match(/^(\d{1,2})([.)])$/);
            corps.push(el('span', { className: ['t-no'] }, pt ? [txt(pt[1]), el('span', { className: ['t-pt'] }, [txt(pt[2])])] : [txt(mn[1])]));
            reste = reste.slice(mn[1].length);
            formes.push(etape ? 'etape' : /\d\.\d/.test(mn[1]) ? 'decimal' : 'chiffre');
            if (!infos.numero) infos.numero = etape ? mn[1].replace(/\D/g, '') : mn[1].replace(/[.)]$/, '');
          }
          if (reste) corps.push(txt(reste));
          if (formes.length) { ajouterClasse(h, 't-num'); h.properties.dataNo = infos.numero; h.properties.dataNoForme = formes.join(' '); compte('titres : t-num'); formes.forEach((f) => compte('titres : numéro en forme « ' + f + ' »')); }
          const tTxt = el('span', { className: ['t-txt'] }, corps);
          // Titre numéroté par une touche seule (« 1️⃣ Tu crées la facture ») : le chiffre sur le texte du titre, que la
          // feuille écrit devant lui. Avec « Étape 1 » en plus, c'est « Étape 1 » qui numérote : rien à écrire.
          if (formes.length === 1 && formes[0] === 'touche') { tTxt.properties.dataTouche = infos.numero; compte('titres : numéro en touche (data-touche)'); }
          // Titre des sources : la date de vérification, entre parenthèses, dans son propre <span>.
          if (infos.sources) {
            const dernierTexte = corps[corps.length - 1];
            const md = dernierTexte?.type === 'text' && dernierTexte.value.match(/\s*(\([^()]*\))\s*$/);
            if (md) { const v = dernierTexte.value; const d = v.lastIndexOf(md[1]); corps.splice(corps.length - 1, 1, txt(v.slice(0, d)), el('span', { className: ['t-date'] }, [txt(md[1])]), ...(v.slice(d + md[1].length) ? [txt(v.slice(d + md[1].length))] : [])); compte('titres : date des sources (.t-date)'); }
          }
          h.children = [...tete, tTxt, ...queue];
          compte('titres : texte enveloppé (.t-txt)');
        } else { noter('titres composés (laissés tels quels)', brut); }
        titres.push(infos);
      });
    }

    // Rang 2 (classe t-sous) : un sous-titre numéroté du plan. Il n'a ni filet ni repère « 04 / 10 », il est plus
    // petit, et le sommaire le met en retrait, hors du compte des parties. Deux cas, le texte ne change pas :
    //   - un numéro décimal dont le parent existe (4.1 après « 4. »), ou qui n'ouvre pas son groupe (4.2 à 4.8 ;
    //     4.1 ouvre le groupe 4 quand aucun titre « 4. » n'existe : frais-pros-medecin-liberal-2026) ;
    //   - une suite « 1. », « 2. »… qui suit un titre non numéroté dont la section n'a qu'un bloc (CARMF :
    //     « Combien ça coûte (2026) ? », une phrase, puis « 1. Retraite de base »…).
    // Calculé après les encadrés : un titre d'encadré n'est pas dans le plan (data-np).
    const marquerSousParties = () => {
      const blocs = elementsDe(tree);
      const plan = blocs.map((b, i) => [b, i]).filter(([b]) => estEl(b, 'h2') && b.properties.dataNp);
      let suite = null;
      plan.forEach(([h, i], k) => {
        const forme = String(h.properties.dataNoForme || '');
        const no = String(h.properties.dataNo || '');
        const [hp, ip] = plan[k - 1] || [];
        const noP = hp ? String(hp.properties.dataNo || '') : '';
        let sous = false;
        if (/decimal/.test(forme)) {
          const [g, d] = no.split('.');
          sous = noP === g || d !== '1' || (noP.split('.')[0] === g && /\./.test(noP));
          suite = null;
        } else if (/chiffre|touche/.test(forme)) {
          if (suite !== null && Number(no) === suite + 1) { sous = true; suite = Number(no); }
          else if (hp && !noP && no === '1' && i - ip - 1 <= 1) { sous = true; suite = 1; }
          else suite = null;
        } else suite = null;
        if (sous) {
          ajouterClasse(h, 't-sous'); compte('titres : rang 2 (t-sous)');
          const t = titres.find((x) => x.slug === String(h.properties.id ?? ''));
          if (t) t.sous = true;
        }
      });
    };
    // Légende : une liste dont chaque ligne est « émoji : libellé court » (calendrier fiscal : « 💸 : Tu paies »).
    // Ses émojis disent quelque chose : la feuille les dessine (quatre pictogrammes), au lieu d'une puce.
    const marquerLegendes = (n) => {
      for (const c of n.children || []) {
        if (!estEl(c)) continue;
        if ((c.tagName === 'ul' || c.tagName === 'ol') && aClasse(c, 'fl')) {
          const lis = c.children.filter((x) => estEl(x, 'li'));
          if (lis.length >= 2 && lis.every((li) => /^:\s*\S.{0,28}$/u.test(norm(texteDe(li).replace(EMO(), ''))))) { ajouterClasse(c, 'fl-legende'); compte('listes : légendes (.fl-legende)'); }
        }
        marquerLegendes(c);
      }
    };

    // ═════════ 4. Encadrés ═════════
    {
      const visiter = (parent) => {
        const blocs = elementsDe(parent);
        blocs.forEach((a, i) => {
          if (!aClasse(a, 'callout')) { if (estEl(a, 'blockquote') || estEl(a, 'li')) visiter(a); return; }
          compte('encadrés (.callout)');
          const dedans = elementsDe(a);
          const p0 = dedans[0];
          // R6 : le premier paragraphe est fait d'un seul passage en gras, et autre chose le suit.
          let titreDedans = false;
          if (estEl(p0, 'p') && dedans.length > 1) {
            const pleins = p0.children.filter((c) => !estBlanc(c));
            if (pleins.length === 1 && estEl(pleins[0], 'strong')) { ajouterClasse(p0, 'callout-titre'); titreDedans = true; compte('encadrés : titre dedans (.callout-titre)'); }
          }
          const titreDessus = estTitre(blocs[i - 1]);
          if (titreDessus) compte('encadrés : précédés d’un titre de section');
          if (!titreDedans && !titreDessus) { ajouterClasse(a, 'callout-sans-titre'); compte('encadrés : .callout-sans-titre'); }
          if (aClasse(a, 'callout-seul')) compte('encadrés : .callout-seul');
          if (aClasse(a, 'callout-tip') && (/hippodoc/i.test(texteDe(a)) || (aClasse(a, 'callout-seul') && aClasse(blocs[i - 1], 't-hippo')))) { ajouterClasse(a, 'callout-hippo'); compte('encadrés : .callout-hippo'); if (/hippodoc/i.test(texteDe(a))) compte('encadrés : conseils qui citent Hippodoc'); }
        });
      };
      visiter(tree);
    }

    // ═════════ 5. Tableaux ═════════
    {
      const estNombre = (s) => /^[\s≈~<>+−-]*\d[\d   .,]*\s?(?:€|%|k€|ans?|jours?|mois|km|h|pts?|×)?(?:\s*[\/à-]\s*\d[\d   .,]*\s?(?:€|%|k€)?)?(?:\s?\/\s?\p{L}+)?$/u.test(s.trim());
      const vide = (s) => !s.trim() || /^[—–-]$/.test(s.trim());
      const envelopperTableaux = (parent) => {
        parent.children = parent.children.map((t) => {
          if (!estEl(t)) return t;
          if (t.tagName !== 'table') { if (['blockquote', 'li', 'ul', 'ol'].includes(t.tagName) || aClasse(t, 'callout')) envelopperTableaux(t); return t; }
          const rangs = []; const voir = (n) => { for (const c of n.children || []) { if (estEl(c, 'tr')) rangs.push(c); else if (estEl(c)) voir(c); } }; voir(t);
          const cellules = rangs.map((tr) => tr.children.filter((c) => estEl(c, 'td') || estEl(c, 'th')));
          const textesC = cellules.map((r) => r.map((c) => norm(texteDe(c))));
          const cols = cellules[0]?.length ?? 0;
          const maxes = Array.from({ length: cols }, (_, c) => Math.max(...textesC.map((r) => [...(r[c] || '')].length)));
          const somme = maxes.reduce((x, y) => x + y, 0);
          const corps = textesC.slice(1);
          const props = { className: ['tbl'], dataCols: String(cols), dataLignes: String(rangs.length), dataSomme: String(somme) };
          compte('tableaux (.tbl)');
          // R10 : somme, colonne par colonne, de la cellule la plus longue, au-dessus de 44 caractères.
          if (somme > 44) { props.dataLarge = ''; compte('tableaux : data-large'); }
          // Sur un tableau large, chaque cellule du corps porte le titre de sa colonne (data-th).
          // La feuille l'affiche devant la valeur sur téléphone (une fiche par ligne) ; le texte de la page ne change pas.
          if (somme > 44 && cellules.length > 1) {
            const entetes = textesC[0];
            // Colonne courte : dans toutes les lignes, son titre et sa valeur tiennent sur une demi-ligne de téléphone
            // (20 caractères). Ses cellules (data-court) vont deux par ligne dans la fiche ; décidé par colonne, pour que
            // toutes les fiches d'un tableau aient la même forme.
            const courte = entetes.map((t, k) => k > 0 && !!t && textesC.slice(1).every((r) => [...t].length + [...(r[k] || '')].length <= 20));
            cellules.slice(1).forEach((r) => r.forEach((c, k) => { if (entetes[k]) { c.properties = c.properties || {}; c.properties.dataTh = entetes[k]; compte('tableaux : cellules titrées (data-th)');
              if (courte[k]) { c.properties.dataCourt = ''; compte('tableaux : cellules courtes'); } } }));
          }
          // Les titres de colonne se déclarent comme tels (scope="col").
          if (cellules[0]) cellules[0].forEach((c) => { if (estEl(c, 'th')) { c.properties = c.properties || {}; c.properties.scope = 'col'; } });
          // Colonnes de chiffres : toutes les cellules du corps sont des nombres (ou vides), et une au moins est un nombre.
          // La classe est « tbl-num » et non « num » : le gabarit a déjà une classe .num (mots noués, `inline-block`).
          let colonnesNum = 0;
          for (let c = 0; c < cols; c++) {
            const col = corps.map((r) => r[c] || '');
            if (col.length && col.every((x) => estNombre(x) || vide(x)) && col.some(estNombre)) { colonnesNum++; cellules.forEach((r) => r[c] && ajouterClasse(r[c], 'tbl-num')); }
          }
          if (colonnesNum) { compte('tableaux : avec colonne de chiffres (.tbl-num)'); compte('tableaux : colonnes de chiffres', colonnesNum); props.dataNum = String(colonnesNum); }
          rangs.forEach((tr, k) => { if (k && /^(?:total|sous-total)\b/i.test(textesC[k][0] || '')) { ajouterClasse(tr, 'tbl-total'); compte('tableaux : lignes de total (.tbl-total)'); } });
          // Ligne mise en avant par l'auteur : toutes ses cellules non vides sont en gras d'un bout à l'autre (« Rappel », « Total »).
          rangs.forEach((tr, k) => {
            if (!k) return;
            const pleines = cellules[k].filter((c) => norm(texteDe(c)));
            if (pleines.length > 1 && pleines.every((c) => { const e = c.children.filter((x) => !estBlanc(x)); return e.length === 1 && estEl(e[0], 'strong'); })) { ajouterClasse(tr, 'tbl-fort'); compte('tableaux : lignes en gras (.tbl-fort)'); }
          });
          return el('div', props, [t]);
        });
      };
      envelopperTableaux(tree);
    }

    // ═════════ 6. Sources : les blocs qui suivent le titre des sources ═════════
    {
      let dans = false;
      for (const n of elementsDe(tree)) {
        if (estEl(n, 'h2')) { dans = aClasse(n, 't-sources'); if (dans) compte('sources : sections'); continue; }
        if (dans) { ajouterClasse(n, 'sources'); compte('sources : blocs (.sources)'); }
      }
    }

    // ═════════ 7. Émojis : tous ceux qui restent, d'après leur place dans la ligne ═════════
    {
      const dejaEm = (parent) => aClasse(parent, 'em');
      /** Une ligne : une suite de nœuds en ligne. `genre` : titre, fl (élément de fausse liste) ou ligne. */
      const ligne = (noeuds, parent, genre) => {
        const ts = textes(noeuds, parent);
        const plein = ts.map((t) => t.noeud.value).join('');
        let debut = 0;
        for (const t of ts) {
          const d0 = debut; debut += t.noeud.value.length;
          if (dejaEm(t.parent)) continue;
          const v = t.noeud.value; const re = EMO(); let r; const morceaux = []; let dernier = 0;
          while ((r = re.exec(v))) {
            const avant = plein.slice(0, d0 + r.index), apres = plein.slice(d0 + r.index + r[0].length);
            const enTete = !avant.replace(EMO(), '').trim();
            const enFin = /^[\s.!?]*$/.test(apres.replace(EMO(), ''));
            let pos;
            if (genre === 'titre') pos = enTete ? 'titre-debut' : enFin ? 'titre-fin' : 'titre-milieu';
            else if (aClasse(t.parent, 'fl-m')) pos = 'puce';
            else if (aClasse(t.parent, 'fl-m2')) pos = 'puce-2';
            else pos = enTete && genre !== 'fl' ? 'ligne-debut' : enFin ? 'ligne-fin' : 'phrase';
            if (r.index > dernier) morceaux.push(txt(v.slice(dernier, r.index)));
            morceaux.push(fabriqueEm(r[0], pos));
            dernier = r.index + r[0].length;
          }
          if (!morceaux.length) continue;
          if (dernier < v.length) morceaux.push(txt(v.slice(dernier)));
          t.parent.children.splice(t.parent.children.indexOf(t.noeud), 1, ...morceaux);
        }
      };
      const parcourir = (parent, genreParent) => {
        // Un bloc qui ne contient que du texte en ligne est une ligne ; sinon chaque suite de nœuds en ligne en est une.
        if (aClasse(parent, 'lignes')) { for (const c of parent.children) if (aClasse(c, 'lg')) ligne(c.children, c, 'ligne'); return; }
        let suite = [];
        const vider = () => { if (suite.some((n) => !estBlanc(n))) ligne(suite, parent, genreParent); suite = []; };
        for (const c of [...parent.children]) {
          if (estBloc(c)) {
            vider();
            const g = /^h[1-6]$/.test(c.tagName) ? 'titre' : c.tagName === 'li' && aClasse(parent, 'fl') ? 'fl' : 'ligne';
            parcourir(c, g);
          } else suite.push(c);
        }
        vider();
      };
      parcourir(tree, 'ligne');
    }

    // ═════════ 7 bis. Chiffres (R12) : libellé et valeur de chaque ligne « libellé : nombre » ═════════
    {
      const horsTexte = (n) => estBlanc(n) || aClasse(n, 'fl-m') || aClasse(n, 'fl-m2') || aClasse(n, 'em');
      const decouper = (conteneur) => {
        const e = conteneur.children;
        let a = 0, b = e.length;
        while (a < b && horsTexte(e[a])) a++;
        while (b > a && (horsTexte(e[b - 1]) || (e[b - 1].type === 'text' && /^[\s.]*$/.test(e[b - 1].value)))) b--;
        if (b - a === 1 && estEl(e[a]) && !classesDe(e[a]).length) return decouper(e[a]);
        // Le séparateur : le premier « : », « = » ou « → » d'un texte de ce niveau, après le premier mot.
        for (let i = a; i < b; i++) {
          const c = e[i];
          if (c.type !== 'text') continue;
          const depart = i === a ? c.value.search(/[\p{L}\d]/u) : 0;
          if (depart < 0) continue;
          const k = c.value.slice(depart).search(/[:=→]/u);
          if (k < 0) continue;
          const pos = depart + k;
          const avant = c.value.slice(0, pos), apres = c.value.slice(pos + 1);
          const blancTete = i === a ? avant.match(/^\s*/)[0] : '';
          const av = avant.slice(blancTete.length).trimEnd(), blancAvant = avant.slice(blancTete.length + av.length);
          const blancApres = apres.match(/^\s*/)[0], ap = apres.slice(blancApres.length);
          // La valeur s'arrête avant les blancs et le point de fin du dernier texte.
          let fin = e.slice(i + 1, b); let queue = null;
          const libelle = [...e.slice(a, i), ...(av ? [txt(av)] : [])];
          let valeur = [...(ap ? [txt(ap)] : []), ...fin];
          const dernier = valeur[valeur.length - 1];
          if (dernier?.type === 'text') { const m = dernier.value.match(/\s+$/); if (m) { queue = txt(m[0]); valeur[valeur.length - 1] = txt(dernier.value.slice(0, -m[0].length)); } }
          valeur = valeur.filter((n) => n.type !== 'text' || n.value);
          if (!libelle.some((n) => !estBlanc(n)) || !valeur.some((n) => !estBlanc(n))) return false;
          // Le séparateur dans son propre <span class="kv-s"> (la feuille l'écrit en encre discrète) ; ses blancs autour.
          conteneur.children = [...e.slice(0, a), ...(blancTete ? [txt(blancTete)] : []), el('span', { className: ['kv-l'] }, libelle), ...(blancAvant ? [txt(blancAvant)] : []), el('span', { className: ['kv-s'] }, [txt(c.value[pos])]), ...(blancApres ? [txt(blancApres)] : []), el('span', { className: ['kv-v'] }, valeur), ...(queue ? [queue] : []), ...e.slice(b)];
          return true;
        }
        return false;
      };
      const voir = (n) => { for (const c of n.children || []) { if (aClasse(c, 'kv-ligne')) { if (decouper(c)) compte('chiffres : lignes découpées (.kv-l, .kv-v)'); else noter('kv non découpée', norm(texteDe(c)).slice(0, 70)); } else if (estEl(c)) voir(c); } };
      voir(tree);
    }

    // ═════════ 8. Options (src/lib/article-options.mjs ; chacune crée un écart voulu avec le rendu brut) ═════════
    if (opt.essentielEnTete) {
      // L'encadré « L'essentiel » en premier bloc du corps (il vient après l'introduction dans 11 articles).
      const blocs = elementsDe(tree);
      const premierTitre = blocs.findIndex(estTitre);
      const e = blocs.find((b, i) => (premierTitre < 0 || i < premierTitre) && aClasse(b, 'callout-essentiel') && /^l[’']essentiel/i.test(norm(texteDe(elementsDe(b)[0] ?? b))));
      if (e && blocs[0] !== e) {
        const i = tree.children.indexOf(e);
        const blancApres = tree.children[i + 1]?.type === 'text' && estBlanc(tree.children[i + 1]) ? 1 : 0;
        tree.children.splice(i, 1 + blancApres);
        tree.children.splice(tree.children.indexOf(blocs[0]), 0, e, txt('\n'));
        ajouterClasse(e, 'essentiel-deplace');
        compte('option essentielEnTete : encadrés déplacés');
      }
    }
    // Aucun blanc n'est ajouté par ces enveloppes, ni à leur début ni à leur fin : le corps est rendu collé à ce qui
    // l'entoure dans la page (« …de lectureL'essentiel… »), et un blanc de plus décollerait deux mots du texte lu par script.
    if (opt.sourcesPli) {
      // La section des sources dans un pli natif : <details class="sources-pli"><summary><h2>…</h2></summary>…</details>.
      const i = tree.children.findIndex((n) => estEl(n, 'h2') && aClasse(n, 't-sources'));
      if (i >= 0) {
        let j = i + 1;
        while (j < tree.children.length && !estEl(tree.children[j], 'h2')) j++;
        const contenu = tree.children.slice(i + 1, j);
        const blancs = [];
        while (contenu.length && estBlanc(contenu[contenu.length - 1])) blancs.unshift(contenu.pop());
        const pli = el('details', { className: ['sources-pli'] }, [el('summary', {}, [tree.children[i]]), ...contenu]);
        tree.children.splice(i, j - i, pli, ...blancs);
        compte('option sourcesPli : sections mises en pli');
      }
    }
    if (opt.sections) {
      // Chaque h2 et son contenu dans <section class="sec" data-sec="…"> ; l'introduction dans <div class="sec-intro">.
      const out = []; let cur = null;
      const fermer = () => {
        if (!cur) return;
        const blancs = [];
        while (cur.children.length && estBlanc(cur.children[cur.children.length - 1])) blancs.unshift(cur.children.pop());
        out.push(cur, ...blancs); cur = null;
      };
      for (const n of tree.children) {
        const h = estEl(n, 'h2') ? n : aClasse(n, 'sources-pli') ? elementsDe(elementsDe(n)[0] ?? n)[0] : null;
        if (h && estEl(h, 'h2')) {
          fermer();
          const genre = aClasse(h, 't-sources') ? 'sources' : aClasse(h, 't-encadre') ? 'encadre' : aClasse(h, 't-hippo') ? 'hippo' : 'normal';
          cur = el('section', { className: ['sec'], dataSec: genre }, [n]);
          if (aClasse(h, 't-hippo')) ajouterClasse(cur, 'sec-hippo');
          compte('option sections : sections'); compte('option sections : data-sec=' + genre);
          continue;
        }
        if (!cur) { if (estBlanc(n)) { out.push(n); continue; } cur = el('div', { className: ['sec-intro'] }, []); compte('option sections : introductions (.sec-intro)'); }
        cur.children.push(n);
      }
      fermer();
      tree.children = out;
    }

    // ═════════ 8 bis. Rang des titres du plan, légendes (fonctions plus haut) ═════════
    marquerSousParties();
    marquerLegendes(tree);

    // ═════════ 8 ter. Nombres et ponctuation hautes : jamais coupés en fin de ligne ═════════
    // Un nombre, ses milliers, son unité (€, %, k€, M€) et le signe qui suit, un mot et son « ? ! : ; » »,
    // un guillemet ouvrant et son mot : enveloppés dans <span class="nb"> (white-space: nowrap dans la feuille).
    // Aucun caractère ne change. Les morceaux sans espace ne sont pas enveloppés (rien à protéger), ni ceux de
    // plus de 28 caractères (ils déborderaient à 360 px).
    {
      const ESP = '[ \\u00A0\\u202F]';
      const RE_NB = new RegExp(
        '(?:« )?(?:[≈~]' + ESP + '?)?(?:\\d{1,3}(?:' + ESP + '\\d{3})+(?:,\\d+)?|\\d+(?:[.,]\\d+)?)(?:' + ESP + '?(?:k€|M€|€|%)(?:' + ESP + '?\\/' + ESP + '?(?:an|mois|jour|h)\\b)?)?(?:' + ESP + '[?!:;»](?=[\\s"\')\\].,]|$))*'
        + '|(?:« )?[^\\s«]+(?:' + ESP + '[?!:;»](?=[\\s"\')\\].,]|$))+'
        + '|« [^\\s«]+', 'gu');
      const dansExclu = (pile) => pile.some((n) => estEl(n) && (['code', 'pre', 'script', 'style'].includes(n.tagName) || aClasse(n, 'em') || aClasse(n, 'fl-m') || aClasse(n, 'fl-m2') || aClasse(n, 'nb')));
      const parcourir = (noeud, pile) => {
        if (!noeud.children) return;
        const pile2 = [...pile, noeud];
        if (dansExclu(pile2)) return;
        const sortie = [];
        for (const c of noeud.children) {
          if (c.type !== 'text') { parcourir(c, pile2); sortie.push(c); continue; }
          const v = c.value; let dernier = 0, m; RE_NB.lastIndex = 0; let touche = false;
          while ((m = RE_NB.exec(v))) {
            const g = m[0];
            if (!/\s/u.test(g) || g.length > 28) continue;
            if (m.index > dernier) sortie.push(txt(v.slice(dernier, m.index)));
            sortie.push(el('span', { className: ['nb'] }, [txt(g)]));
            dernier = m.index + g.length; touche = true; compte('nb : groupes noués');
          }
          if (!touche) { sortie.push(c); continue; }
          if (dernier < v.length) sortie.push(txt(v.slice(dernier)));
        }
        noeud.children = sortie;
      };
      parcourir(tree, []);
    }

    // ═════════ 9. Ce que le gabarit peut lire : render(post).remarkPluginFrontmatter.balisage ═════════
    file.data ??= {};
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.balisage = { titres, stats };
    file.data.balisage = { titres, stats, journal };
  };
}
