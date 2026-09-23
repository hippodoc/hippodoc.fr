import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    authorRole: z.string().optional(),
    category: z.string(),
    categoryNumber: z.string().optional(),
    seriesId: z.enum(['fiche-pratique', 'fiche-fiscalite', 'divers']),
    episodeNumber: z.number().optional(),
    readTime: z.string(),
    /** Article mis « à la une » sur /blog (sinon : le plus récent, cf. blog-sort.ts). */
    featured: z.boolean().optional(),
    cover: z.string(),
    tags: z.array(z.string()),
    cta: z.string().optional(),
    /* Destination du bouton quand l'accroche promet autre chose qu'une
       inscription (« Simule ton Super-Net… ») : un bouton qui annonce le
       simulateur ne doit pas ouvrir un formulaire de compte (§ 9.bf). */
    ctaHref: z.enum(['/simulateur']).optional(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    relatedArticles: z.array(z.string()).optional(),
    slides: z.array(z.object({ src: z.string(), alt: z.string() })).optional(),
  }),
});

export const collections = { blog };
