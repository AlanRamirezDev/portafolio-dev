import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const proyectosCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/proyectos" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    githubUrl: z.string().url().optional(),
    docsUrl: z.string().url().optional(),
    status: z.enum(['Completado', 'En desarrollo', 'Completed', 'In development']),
  }),
});

export const collections = {
  'proyectos': proyectosCollection,
};