import { z } from 'zod'

export const DeskSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})
export type Desk = z.infer<typeof DeskSchema>

export const AuthorSchema = z.object({
  avatar: z.string(),
  bio: z.string(),
  full_name: z.string(),
  id: z.number(),
  location: z.string(),
  slug: z.string(),
  socials: z.string(),
})
export type Author = z.infer<typeof AuthorSchema>

export const ArticleSchema = z.object({
  authors: z.array(AuthorSchema),
  blurb: z.string(),
  cover: z.string(),
  desk: DeskSchema,
  featured: z.boolean(),
  id: z.string(),
  order: z.number(),
  pathnames: z.array(z.string()),
  plan: z.string(),
  published_at: z.number(),
  seo: z.string(),
  slug: z.string(),
  tags: z.array(DeskSchema),
  title: z.string(),
  updated_at: z.number(),
})
export type Article = z.infer<typeof ArticleSchema>
