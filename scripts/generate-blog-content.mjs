/**
 * Génère src/content/blog/<slug>.md depuis le registre de la SPA source
 * (src/data/blogArticles.ts) — conversion MÉCANIQUE, aucune réécriture :
 *  - normalise <strong>/<em> HTML → **gras** / *italique* markdown
 *  - préserve chaque retour à la ligne (hard break markdown "\")
 *  - sections list/text conservées ligne à ligne, warning/tip → :::warning / :::tip
 *  - frontmatter complet (title, description, slug, pubDate, updatedDate, author,
 *    tags, readTime, cover, faq, relatedArticles, cta, slides)
 * Produit aussi src/generated/blog-meta.json (lastmod sitemap) et
 * src/lib/blog-series.ts (catégories du blog).
 *
 * Usage : node scripts/generate-blog-content.mjs <chemin blogArticles transpilé .mjs>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const dataModulePath = process.argv[2];
if (!dataModulePath) {
  console.error('Usage: node scripts/generate-blog-content.mjs <blogArticles.mjs>');
  process.exit(1);
}
const { blogArticles, blogSeries } = await import(pathToFileURL(resolve(dataModulePath)).href);

/** HTML inline → markdown ; le reste du texte est laissé strictement intact. */
function normalizeInline(s) {
  return s
    .replace(/<strong>(.*?)<\/strong>/gs, '**$1**')
    .replace(/<b>(.*?)<\/b>/gs, '**$1**')
    .replace(/<em>(.*?)<\/em>/gs, '*$1*')
    .replace(/<i>(.*?)<\/i>/gs, '*$1*')
    .replace(/<br\s*\/?>/g, '\n')
    // seul lien présent dans les corps d'articles : /landing → devenu /
    .replace(/\]\(\/landing\)/g, '](/)');
}

/** Un bloc de texte → markdown avec hard breaks pour chaque \n simple. */
function blockToMarkdown(s) {
  const normalized = normalizeInline(s);
  // découpe en paragraphes sur les lignes vides, hard-break le reste
  return normalized
    .split(/\n{2,}/)
    .map((para) =>
      para
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line, i, arr) => !(line === '' && (i === 0 || i === arr.length - 1)))
        .join('\\\n')
    )
    .filter((p) => p.trim() !== '')
    .join('\n\n');
}

/** content: string | string[] → markdown (les listes gardent leurs "•" d'origine). */
function contentToMarkdown(content) {
  if (Array.isArray(content)) {
    return blockToMarkdown(content.join('\n'));
  }
  return blockToMarkdown(content);
}

function yamlEscape(s) {
  return JSON.stringify(s);
}

function toYaml(value, indent = 0) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === 'object' && v !== null) {
          const inner = Object.entries(v)
            .map(([k, val], i) => `${'  '.repeat(indent + 1)}${i === 0 ? '- ' : '  '}${k}: ${yamlEscape(String(val))}`)
            .join('\n');
          return inner;
        }
        return `${pad}- ${yamlEscape(String(v))}`;
      })
      .join('\n');
  }
  return `${pad}${yamlEscape(String(value))}`;
}

const contentDir = resolve(root, 'src/content/blog');
const generatedDir = resolve(root, 'src/generated');
mkdirSync(contentDir, { recursive: true });
mkdirSync(generatedDir, { recursive: true });

const meta = {};
let count = 0;

for (const article of blogArticles) {
  const {
    slug, title, excerpt, category, categoryNumber, seriesId, episodeNumber,
    author, publishedAt, updatedAt, readTime, coverImage, content, faq,
    relatedArticles, slides,
  } = article;

  // readTime : normalise le seul cas numérique ("6" → "6 min")
  const readTimeStr = typeof readTime === 'number' ? `${readTime} min` : readTime;

  const fm = [];
  fm.push(`title: ${yamlEscape(title)}`);
  fm.push(`description: ${yamlEscape(excerpt ?? normalizeInline(content.intro).slice(0, 155))}`);
  fm.push(`pubDate: ${JSON.stringify(publishedAt)}`);
  if (updatedAt) fm.push(`updatedDate: ${JSON.stringify(updatedAt)}`);
  fm.push(`author: ${yamlEscape(author.name)}`);
  if (author.role) fm.push(`authorRole: ${yamlEscape(author.role)}`);
  fm.push(`category: ${yamlEscape(category)}`);
  if (categoryNumber) fm.push(`categoryNumber: ${yamlEscape(categoryNumber)}`);
  fm.push(`seriesId: ${yamlEscape(seriesId)}`);
  if (episodeNumber !== undefined) fm.push(`episodeNumber: ${episodeNumber}`);
  fm.push(`readTime: ${yamlEscape(readTimeStr)}`);
  fm.push(`cover: ${yamlEscape(coverImage)}`);
  fm.push(`tags:\n${toYaml([category], 1)}`);
  if (article.content.cta) fm.push(`cta: ${yamlEscape(normalizeInline(article.content.cta))}`);
  if (faq && faq.length) {
    fm.push('faq:');
    for (const item of faq) {
      fm.push(`  - question: ${yamlEscape(normalizeInline(item.question))}`);
      fm.push(`    answer: ${yamlEscape(normalizeInline(item.answer))}`);
    }
  }
  if (relatedArticles && relatedArticles.length) {
    fm.push('relatedArticles:');
    for (const r of relatedArticles) fm.push(`  - ${yamlEscape(r)}`);
  }
  if (slides && slides.length) {
    fm.push('slides:');
    for (const s of slides) {
      fm.push(`  - src: ${yamlEscape(s.src)}`);
      fm.push(`    alt: ${yamlEscape(s.alt)}`);
    }
  }

  const bodyParts = [];
  bodyParts.push(blockToMarkdown(content.intro));
  for (const section of content.sections) {
    if (section.title) {
      bodyParts.push(`## ${normalizeInline(section.title)}`);
    }
    const md = contentToMarkdown(section.content);
    if (section.type === 'warning') {
      bodyParts.push(`:::warning\n${md}\n:::`);
    } else if (section.type === 'tip') {
      bodyParts.push(`:::tip\n${md}\n:::`);
    } else {
      bodyParts.push(md);
    }
  }

  const doc = `---\n${fm.join('\n')}\n---\n\n${bodyParts.join('\n\n')}\n`;
  writeFileSync(resolve(contentDir, `${slug}.md`), doc, 'utf8');
  meta[slug] = { pubDate: publishedAt, updatedDate: updatedAt ?? publishedAt };
  count++;
}

writeFileSync(resolve(generatedDir, 'blog-meta.json'), JSON.stringify(meta, null, 2), 'utf8');

const seriesTs = `/** Généré depuis src/data/blogArticles.ts (SPA source) — ne pas éditer à la main. */
export interface BlogSeries {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  totalEpisodes: number | null;
}

export const blogSeries: BlogSeries[] = ${JSON.stringify(blogSeries, null, 2)};
`;
writeFileSync(resolve(root, 'src/lib/blog-series.ts'), seriesTs, 'utf8');

console.log(`OK: ${count} articles générés dans src/content/blog/, meta sitemap + séries écrits.`);
