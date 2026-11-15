#!/usr/bin/env node
/**
 * Le guide du remplaçant : fabrique le PDF depuis pages.mjs (MIGRATION.md, § 9.ha).
 *
 *   node outils/guide-remplacant/construire.mjs            → PDF + aperçus PNG + contrôles
 *   node outils/guide-remplacant/construire.mjs --decor    → refait aussi les deux décors (couverture, fin)
 *   node outils/guide-remplacant/construire.mjs --pages 5,7 → n'exporte que ces aperçus PNG
 *   node outils/guide-remplacant/construire.mjs --brouillon → un renvoi vers une page absente n'arrête pas
 *   node outils/guide-remplacant/construire.mjs --site   → et dépose le PDF, la couverture, les aperçus
 *                                                          et l'image de partage dans le site (si tout est OK)
 *
 * Sorties (dossier `sortie/`, hors du dépôt : voir .gitignore) :
 *   guide.html                 la source du PDF, à ouvrir dans Chromium pour inspecter une page
 *   guide-du-remplacant.pdf    le PDF, 1080 × 1350 px par page (810 × 1012,5 pt), liens et signets
 *   apercu/page-NN.png         chaque page à 1080 px de large, pour la regarder en grand
 *   planche.png                toutes les pages en vignettes
 *
 * Le script échoue (code 1) si une page déborde, si un renvoi « p. N » vise une page absente, ou
 * si un caractère n'est pas dans la police. Il signale « À REVOIR » : un mot seul en fin de
 * paragraphe, un mot court seul sur une ligne de titre, un vide de plus de 120 px en bas d'une
 * page ou d'une carte, un texte sous 22 px, une mention interdite.
 *
 * Pourquoi ces règles : skill hippodoc-da (gabarits, rendre.cjs) et hippodoc-exigence (forme.md).
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { typoHtml } from './typo.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
// Playwright : celui du poste (require global), comme scripts/verify-site.mjs n'en a pas besoin.
const { chromium } = createRequire(import.meta.url)('playwright');
// GUIDE_SORTIE : un autre dossier de sortie (pour construire sans toucher aux aperçus en cours de relecture).
const SORTIE = path.resolve(ICI, process.env.GUIDE_SORTIE || 'sortie');
const DECOR = path.relative(ICI, path.join(SORTIE, 'decor'));
const args = process.argv.slice(2);
const refaireDecor = args.includes('--decor');
const seulement = args.includes('--pages') ? args[args.indexOf('--pages') + 1].split(',').map(Number) : null;

const { PAGES, META } = await import(pathToFileURL(path.join(ICI, 'pages.mjs')).href + `?v=${Date.now()}`);

fs.mkdirSync(path.join(SORTIE, 'apercu'), { recursive: true });

const browser = await chromium.launch();
try {
  /* 1. Les deux décors (couverture, fin) : la scène exacte des gabarits de la DA, rendue en image
        opaque (les halos du soleil et les ombres des papiers sont des transparences, que l'iPhone
        rend mal dans un PDF). Le texte est écrit en vrai par-dessus, dans le PDF. */
  for (const nom of ['couverture', 'fin']) {
    const jpg = path.join(ICI, 'assets', `decor-${nom}.jpg`);
    if (fs.existsSync(jpg) && !refaireDecor) continue;
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(pathToFileURL(path.join(ICI, 'assets', 'da', `decor-${nom}.html`)).href);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: jpg, type: 'jpeg', quality: 84, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    await ctx.close();
    console.log(`décor refait : ${path.relative(ICI, jpg)}`);
  }

  /* 1 bis. Le ciel des ouvertures de partie, avec sa mascotte, rendu en image opaque : une pose
        détourée embarquée telle quelle pèse près de 900 Ko dans le PDF (image sans perte et son
        masque). Composée sur son ciel et compressée, elle en pèse une soixantaine. */
  fs.mkdirSync(path.join(SORTIE, 'decor'), { recursive: true });
  for (const pg of PAGES.filter((x) => x.ouvre?.masc)) {
    const o = pg.ouvre;
    const cote = o.cote === 'gauche' ? `left:${o.mx}px` : `right:${o.mx}px`;
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 400 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const fichier = path.join(SORTIE, 'decor', `ouvre-${pg.id}.html`);
    fs.writeFileSync(fichier, `<!doctype html><html><body style="margin:0"><div style="position:relative;width:1080px;height:400px;overflow:hidden;background:linear-gradient(#c9deff,#e4eeff 330px)">
<img src="${pathToFileURL(path.join(ICI, 'assets', 'mascotte', o.masc)).href}" style="position:absolute;${cote};top:${o.my}px;width:${o.mw}px"></div></body></html>`);
    await p.goto(pathToFileURL(fichier).href, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(SORTIE, 'decor', `ouvre-${pg.id}.jpg`), type: 'jpeg', quality: 84, clip: { x: 0, y: 0, width: 1080, height: 400 } });
    await ctx.close();
  }

  /* 2. Numéros de page et renvois. [[p:id]] → « p. N » cliquable ; [[n:id]] → N seul. */
  const numero = new Map(PAGES.map((pg, i) => [pg.id, i + 1]));
  const N = PAGES.length;
  const manquants = [];
  const renvois = (html) => html.replace(/\[\[(p|n|a):([\w-]+)\]\]/g, (_, mode, id) => {
    if (!numero.has(id)) { manquants.push(id); return '??'; }
    if (mode === 'n') return String(numero.get(id));
    if (mode === 'a') return `#${id}`;
    return `<a class="pg-ref" href="#${id}">p.&nbsp;${numero.get(id)}</a>`;
  });

  const corps = PAGES.map((pg, i) => {
    const n = i + 1;
    const pied = pg.sansPied ? '' : `<footer class="pied"><span>${META.titreCourt}</span><span class="pg"><a href="#sommaire">Sommaire</a>&nbsp;&nbsp;·&nbsp;&nbsp;${n}&nbsp;/&nbsp;${N}</span></footer>`;
    return renvois(pg.rendu({ n, N, pied, decor: DECOR }));
  }).join('\n');
  if (manquants.length) {
    const msg = `renvoi vers une page absente : ${[...new Set(manquants)].join(', ')}`;
    if (!args.includes('--brouillon')) throw new Error(msg);
    console.log('  (brouillon) ' + msg);
  }

  // Graisses figées (assets/police/instances.py) : une police variable sortirait en Type 3, bien plus lourde.
  const faces = [430, 600, 660, 720, 760, 800].map((w) => `@font-face { font-family: "Google Sans Flex"; src: url("${pathToFileURL(path.join(ICI, 'assets', 'police', `google-sans-flex-${w}.woff2`)).href}") format("woff2"); font-weight: ${w}; font-style: normal; }`).join('\n');
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<base href="${pathToFileURL(ICI).href}/">
<title>${META.titrePdf}</title>
<style>${faces}</style>
<link rel="stylesheet" href="${pathToFileURL(path.join(ICI, 'jetons.css')).href}">
<link rel="stylesheet" href="${pathToFileURL(path.join(ICI, 'guide.css')).href}">
</head><body>
${typoHtml(corps)}
</body></html>`;
  const fichierHtml = path.join(SORTIE, 'guide.html');
  fs.writeFileSync(fichierHtml, html);

  /* 3. Rendu, contrôles, PDF. */
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'fr-FR' });
  const page = await ctx.newPage();
  const erreursScript = [];
  page.on('pageerror', (e) => erreursScript.push(e.message));
  page.on('requestfailed', (r) => erreursScript.push(`ressource introuvable : ${r.url()}`));
  await page.goto(pathToFileURL(fichierHtml).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  /* Pas de mot seul sur la dernière ligne : dans chaque bloc de texte, les deux derniers mots
     sont liés par une espace insécable (si le dernier est court). */
  await page.evaluate(() => {
    const blocs = document.querySelectorAll('.page p, .page li, .page td, .page .v, .page .et, .page .fd, .page .ft, .page .t, .page .ct, .page .k');
    for (const el of blocs) {
      if (el.closest('.decor, .bulles, .pied, .pile, .gantt, .tranches')) continue;
      const marcheur = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const noeuds = [];
      for (let t = marcheur.nextNode(); t; t = marcheur.nextNode()) if (t.textContent.trim()) noeuds.push(t);
      if (!noeuds.length || el.textContent.trim().split(/\s+/).length < 4) continue;
      for (let i = noeuds.length - 1; i >= 0; i--) {
        const t = noeuds[i];
        const m = t.textContent.match(/^([\s\S]*?)[ ](\S{1,14}\s*)$/);
        if (m) { t.textContent = m[1] + '\u00a0' + m[2]; break; }
        if (/\s/.test(t.textContent.replace(/\s+$/, ''))) break;
      }
    }
  });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));

  const rapport = await page.evaluate(() => {
    const erreurs = [], notes = [];
    const pages = [...document.querySelectorAll('.page')];
    const idDe = (el) => el.closest('.page')?.id || '?';
    const numDe = (el) => pages.indexOf(el.closest('.page')) + 1;
    // Débordements : la feuille, son contenu, chaque carte.
    for (const pg of pages) {
      const n = pages.indexOf(pg) + 1;
      for (const el of pg.querySelectorAll('.feuille, .contenu, .c, .an, .ret')) {
        const d = el.scrollHeight - el.clientHeight;
        if (d > 1) erreurs.push(`p. ${n} (${pg.id}) : « ${el.className} » déborde de ${d} px`);
      }
      const ct = pg.querySelector('.contenu');
      if (ct) {
        const enfants = [...ct.children].filter((k) => k.getBoundingClientRect().height > 0);
        const der = enfants[enfants.length - 1];
        if (der) {
          const vide = ct.getBoundingClientRect().bottom - der.getBoundingClientRect().bottom;
          if (vide > 120) notes.push(`p. ${n} (${pg.id}) : vide de ${Math.round(vide)} px en bas de page`);
          if (vide < -1) erreurs.push(`p. ${n} (${pg.id}) : le contenu dépasse le pied de ${Math.round(-vide)} px`);
        }
      }
      // Rien ne sort de la page.
      const pr = pg.getBoundingClientRect();
      for (const el of pg.querySelectorAll('p, li, td, th, .t, .ct, .k, .v, b, span')) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > pr.right - 40 || r.left < pr.left + 40) && !el.closest('.decor, .couv .haut, .bulles, .pied, .masc')) {
          if (!el.closest('.c, .alerte, .ciel, .titre, .feuille')) notes.push(`p. ${n} : « ${el.textContent.trim().slice(0, 30)} » à moins de 40 px du bord`);
        }
      }
    }
    // Vides dans une carte.
    for (const carte of document.querySelectorAll('.c')) {
      const enfants = [...carte.children].filter((k) => k.getBoundingClientRect().height > 0);
      const der = enfants[enfants.length - 1];
      if (der && !der.classList.contains('ret')) {
        const bas = carte.getBoundingClientRect().bottom - der.getBoundingClientRect().bottom - 30;
        if (bas > 120) notes.push(`p. ${numDe(carte)} : vide de ${Math.round(bas)} px en bas de la carte « ${(carte.querySelector('.ct')?.textContent || carte.textContent).trim().slice(0, 34)}… »`);
      }
    }
    // Taille de texte.
    const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const petits = new Set();
    for (let t = marcheur.nextNode(); t; t = marcheur.nextNode()) {
      if (!t.textContent.trim()) continue;
      const el = t.parentElement;
      if (el.closest('.sr, [aria-hidden="true"], sup')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 22) petits.add(`p. ${numDe(el)} : « ${t.textContent.trim().slice(0, 30)} » en ${fs} px`);
    }
    notes.push(...petits);
    // Mot seul en fin de paragraphe.
    for (const el of document.querySelectorAll('p, li, .t, .ct, .fd, .et, .v, td, .ret, .note')) {
      if (el.closest('.sr, [aria-hidden="true"]') || el.querySelector('p, li')) continue;
      const plage = document.createRange(); plage.selectNodeContents(el);
      const rects = [...plage.getClientRects()].filter((b) => b.width > 1 && b.height > 1);
      const lignes = [];
      for (const b of rects) {
        const c = (b.top + b.bottom) / 2;
        const l = lignes.find((x) => Math.abs(x.c - c) < b.height * 0.5);
        if (l) { l.g = Math.min(l.g, b.left); l.d = Math.max(l.d, b.right); } else lignes.push({ c, g: b.left, d: b.right });
      }
      if (lignes.length < 2) continue;
      lignes.sort((a, b) => a.c - b.c);
      const der = lignes[lignes.length - 1];
      const larg = el.getBoundingClientRect().width;
      const mots = el.textContent.trim().split(/\s+/);
      // Les deux derniers mots déjà liés par une insécable : la dernière ligne n'a pas de mot seul.
      if (/\u00a0\S+\s*$/.test(el.textContent)) continue;
      if (larg > 0 && der.d - der.g < 0.16 * larg && mots.length > 2) notes.push(`p. ${numDe(el)} : mot seul en fin de ligne : « ${mots.slice(-1)[0]} » (${el.textContent.trim().slice(0, 40)}…)`);
    }
    // Mentions interdites, caractères hors police.
    const tout = document.body.innerText;
    if (/—/.test(tout)) erreurs.push('tiret cadratin « — » dans le texte');
    if (/Compte de démonstration/i.test(tout)) notes.push('mention « Compte de démonstration »');
    const hors = [...new Set(tout.match(/[→←↑↓✓✔✗≈≠≤≥…•►▶︎❌✅⚠️💡🦛]/gu) || [])];
    if (hors.length) erreurs.push(`caractères absents de la police : ${hors.join(' ')}`);
    // Ancres.
    const ids = new Set([...document.querySelectorAll('[id]')].map((e) => e.id));
    for (const a of document.querySelectorAll('a[href^="#"]')) if (!ids.has(a.getAttribute('href').slice(1))) erreurs.push(`lien vers #${a.getAttribute('href').slice(1)} absent (p. ${numDe(a)})`);
    const liens = [...document.querySelectorAll('a[href^="http"]')].map((a) => a.href);
    return { erreurs, notes, liens: [...new Set(liens)], pages: pages.length };
  });

  const policeOk = await page.evaluate(() => document.fonts.check('30px "Google Sans Flex"'));
  if (!policeOk) rapport.erreurs.push('police Google Sans Flex non chargée');

  const pdf = path.join(SORTIE, 'guide-du-remplacant.pdf');
  await page.pdf({ path: pdf, width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  /* 4. Aperçus PNG de chaque page, et la planche. */
  const els = await page.$$('.page');
  for (let i = 0; i < els.length; i++) {
    if (seulement && !seulement.includes(i + 1)) continue;
    await els[i].screenshot({ path: path.join(SORTIE, 'apercu', `page-${String(i + 1).padStart(2, '0')}.png`), animations: 'disabled' });
  }
  await ctx.close();

  const tous = [...erreursScript.map((e) => 'ERREUR ' + e), ...rapport.erreurs.map((e) => 'ERREUR ' + e)];

  /* 5. --site : le PDF et ses visuels, là où la page /guide les lit (src/lib/guide-remplacant.ts).
        Le nom du PDF ne change pas d'une version à l'autre de l'édition : les liens déjà
        envoyés restent bons (Cache-Control d'une heure, vercel.json). */
  if (args.includes('--site')) {
    if (tous.length) throw new Error('--site refusé : le PDF a des erreurs.');
    const RACINE = path.resolve(ICI, '..', '..');
    const { GUIDE_SITE } = await import(pathToFileURL(path.join(ICI, 'pages.mjs')).href + `?site=${Date.now()}`);
    fs.copyFileSync(pdf, path.join(RACINE, 'public', GUIDE_SITE.pdf));
    fs.copyFileSync(path.join(ICI, 'assets', 'partage.jpg'), path.join(RACINE, 'public', 'guide', 'partage.jpg'));
    for (const [id, nom, largeur] of GUIDE_SITE.images) {
      // Rendu à la largeur voulue (pas une réduction d'image) : le texte reste net.
      const c3 = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: largeur / 1080 });
      const p3 = await c3.newPage();
      await p3.goto(pathToFileURL(fichierHtml).href, { waitUntil: 'load' });
      await p3.evaluate(() => document.fonts.ready);
      const el = await p3.$(`#${id}`);
      if (!el) throw new Error(`page #${id} introuvable`);
      await el.screenshot({ path: path.join(RACINE, 'src', 'assets', 'guide', nom), animations: 'disabled' });
      await c3.close();
    }
    console.log(`  site : public/${GUIDE_SITE.pdf}, public/guide/partage.jpg, ${GUIDE_SITE.images.map((x) => 'src/assets/guide/' + x[1]).join(', ')}`);
  }
  console.log(`${tous.length ? 'KO' : 'OK'} ${path.relative(process.cwd(), pdf)} : ${rapport.pages} pages, ${(fs.statSync(pdf).size / 1024).toFixed(0)} Ko`);
  for (const e of tous) console.log('  ' + e);
  for (const x of rapport.notes) console.log('  À REVOIR ' + x);
  console.log(`  liens externes : ${rapport.liens.join(' ; ') || 'aucun'}`);
  process.exitCode = tous.length ? 1 : 0;
} finally {
  await browser.close();
}
