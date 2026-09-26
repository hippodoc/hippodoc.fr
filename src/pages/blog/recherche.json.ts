/**
 * /blog/recherche.json — index de la recherche du blog (§ 9.db).
 *
 * Généré au build, chargé par le navigateur seulement au premier focus du champ
 * de recherche de /blog : la page elle-même ne s'alourdit pas. Les textes sont
 * normalisés ici une fois pour toutes (mêmes règles que côté client, cf.
 * `src/lib/blog-search.ts`). Ordre : du plus récent au plus ancien, qui départage
 * les égalités de score.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { blogSeries } from '@/lib/blog-series';
import { byNewest } from '@/lib/blog-sort';
import { normaliser, type EntreeRecherche } from '@/lib/blog-search';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(byNewest);
  const index: EntreeRecherche[] = posts.map((p) => {
    const serie = blogSeries.find((s) => s.id === p.data.seriesId)?.name ?? '';
    const questions = (p.data.faq ?? []).map((f) => f.question).join(' ');
    // Intertitres et bloc « L'essentiel » : le sujet réel de l'article, sans
    // embarquer tout le corps (l'index reste de l'ordre de 70 Ko, ~20 Ko compressé).
    const corps = p.body ?? '';
    const intertitres = corps.split('\n').filter((l) => /^#{2,4} /.test(l)).join(' ');
    const essentiel = corps.match(/:::essentiel([\s\S]*?)\n:::/)?.[1] ?? '';
    return {
      s: p.id,
      t: p.data.title,
      se: serie,
      r: p.data.readTime,
      nt: normaliser(p.data.title),
      h: normaliser([p.data.description, serie, p.data.category, p.data.tags.join(' '), questions, intertitres, essentiel].join(' ')),
    };
  });
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
