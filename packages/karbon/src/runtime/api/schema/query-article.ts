import { z } from 'zod'

export const TagSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
})
export type Tag = z.infer<typeof TagSchema>

export const RelevanceSchema = z.object({
  id: z.string(),
  title: z.string(),
})
export type Relevance = z.infer<typeof RelevanceSchema>

export const GroupSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.string(),
})
export type Group = z.infer<typeof GroupSchema>

export const MetafieldSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.string(),
  values: z.array(z.any()),
  group: GroupSchema,
})
export type Metafield = z.infer<typeof MetafieldSchema>

const LayoutSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const BaseDeskSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  layout: LayoutSchema.nullable(),
})

export const DeskSchema = BaseDeskSchema.extend({
  desk: BaseDeskSchema.nullable(),
})
export type Desk = z.infer<typeof DeskSchema>

export const AuthorSchema = z.object({
  id: z.string(),
  bio: z.string().nullable(),
  slug: z.string(),
  socials: z.string().nullable(),
  avatar: z.string(),
  email: z.string(),
  location: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
})
export type Author = z.infer<typeof AuthorSchema>

export const QueryArticleSchema = z.object({
  id: z.string(),
  blurb: z.string(),
  published_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  desk: DeskSchema,
  slug: z.string(),
  title: z.string(),
  featured: z.boolean(),
  cover: z.string(),
  seo: z.string(),
  html: z.string(),
  plaintext: z.string(),
  layout: z.null(),
  tags: z.array(TagSchema),
  authors: z.array(AuthorSchema),
  shadow_authors: z.null(),
  plan: z.string(),
  metafields: z.array(MetafieldSchema),
  relevances: z.array(RelevanceSchema),
  content_blocks: z.array(z.any()),
})
export type QueryArticle = z.infer<typeof QueryArticleSchema>
