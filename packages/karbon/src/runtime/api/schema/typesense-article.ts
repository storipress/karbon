import { z } from 'zod'

export const MetaSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})
export type Desk = z.infer<typeof MetaSchema>

export const AuthorSchema = z.object({
  avatar: z.string(),
  bio: z.string().optional(),
  full_name: z.string(),
  id: z.number(),
  location: z.string().optional(),
  slug: z.string(),
  socials: z.string().optional(),
})
export type Author = z.infer<typeof AuthorSchema>

export const ArticleSchema = z.object({
  authors: z.array(AuthorSchema),
  blurb: z.string().optional(),
  cover: z.string().optional(),
  desk: MetaSchema,
  featured: z.boolean(),
  id: z.string(),
  order: z.number(),
  pathnames: z.array(z.string()).optional(),
  plan: z.string(),
  published_at: z.number(),
  seo: z.string().optional(),
  slug: z.string(),
  tags: z.array(MetaSchema).optional(),
  title: z.string(),
  updated_at: z.number(),
})
export type Article = z.infer<typeof ArticleSchema>
