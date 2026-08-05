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
    cover: z.string(),
    tags: z.array(z.string()),
    cta: z.string().optional(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    relatedArticles: z.array(z.string()).optional(),
    slides: z.array(z.object({ src: z.string(), alt: z.string() })).optional(),
  }),
});

export const collections = { blog };
