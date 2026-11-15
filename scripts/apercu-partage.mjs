#!/usr/bin/env node
/**
 * Planche des images de partage des pages (MIGRATION.md § 9.ha), sans construire le site :
 *
 *   node scripts/apercu-partage.mjs [sortie.png]
 *
 * Rend chaque entrée de `PARTAGE_PAGES` (src/lib/partage-pages.ts) avec le générateur des articles
 * (src/lib/image-partage.mjs), en vignettes de 600 × 315 px (la taille d'un aperçu Facebook), deux par
 * rangée, et l'écrit (par défaut dans le dossier temporaire). À regarder avant de pousser un
 * changement de titre, de pose ou de fond : un titre qui passe à quatre lignes, une pose qui
 * cache le texte ou un mot seul sur une ligne se voient là.
 */
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import jitiFactory from 'jiti';

const jiti = jitiFactory(import.meta.url, { alias: { '@': path.resolve('src') } });
const { imagePartage } = jiti(path.resolve('src/lib/image-partage.mjs'));
const { PARTAGE_PAGES } = jiti(path.resolve('src/lib/partage-pages.ts'));

const sortie = process.argv[2] ?? path.join(os.tmpdir(), 'apercu-partage.png');
const W = 600, H = 315, E = 10;
const pages = Object.entries(PARTAGE_PAGES);
const vignettes = [];
for (const [chemin, p] of pages) vignettes.push(await sharp(await imagePartage(p)).resize(W, H).toBuffer());
await sharp({ create: { width: 2 * W + E, height: Math.ceil(pages.length / 2) * (H + E), channels: 3, background: '#ffffff' } })
  .composite(vignettes.map((input, i) => ({ input, left: (i % 2) * (W + E), top: Math.floor(i / 2) * (H + E) })))
  .png()
  .toFile(sortie);
console.log(`${pages.length} images de partage : ${sortie}`);
console.log(pages.map(([c], i) => `${i + 1}. ${c}`).join('\n'));
