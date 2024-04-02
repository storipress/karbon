import { expect, it } from 'vitest'
import { createResourceRoute } from '..'

it('createResourceRoute', () => {
  const route = createResourceRoute({
    resource: 'article',
    url: '/posts/{desk.slug}/{slug}',
  })
  const params = { _desk_slug: 'desk-slug', _slug: 'article-slug' }
  const meta = { desk: { slug: 'desk-slug' }, slug: 'article-slug' }

  expect(route.getIdentity(params, route._context)).toEqual({
    slug: 'article-slug',
    type: 'article',
  })

  expect(route.isValid(params, meta, route._context)).toBe(true)
  expect(route.isValid({ ...params, _desk_slug: 'foo' }, meta, route._context)).toBe(false)
  expect(route.toURL(meta, route._context)).toBe('/posts/desk-slug/article-slug')
  expect(createResourceRoute({ resource: 'tag', url: '/collection/{slug}', groupKey: 'group' })).toHaveProperty(
    'groupKey',
    'group',
  )
})

it('createResourceRoute with optional', () => {
  const route = createResourceRoute({
    resource: 'article',
    url: '/posts/{root_desk.slug}/{?sub_desk.slug}/{slug}',
  })
  const paramsWithSubdesk = { _root_desk_slug: 'parent-slug', _sub_desk_slug: 'sub-slug', _slug: 'article-slug' }
  const metaWithSubdesk = { desk: { slug: 'sub-slug', desk: { slug: 'parent-slug' } }, slug: 'article-slug' }

  expect(route.getIdentity(paramsWithSubdesk, route._context)).toEqual({
    slug: 'article-slug',
    type: 'article',
  })

  expect(route.isValid(paramsWithSubdesk, metaWithSubdesk, route._context)).toBe(true)
  expect(route.isValid({ ...paramsWithSubdesk, _root_desk_slug: 'foo' }, metaWithSubdesk, route._context)).toBe(false)
  expect(route.toURL(metaWithSubdesk, route._context)).toBe('/posts/parent-slug/sub-slug/article-slug')

  const paramsWithoutSubdesk = { _root_desk_slug: 'root-slug', _slug: 'article-slug' }
  const metaWithoutSubdesk = { desk: { slug: 'root-slug' }, slug: 'article-slug' }

  expect(route.getIdentity(paramsWithoutSubdesk, route._context)).toEqual({
    slug: 'article-slug',
    type: 'article',
  })

  expect(route.isValid(paramsWithoutSubdesk, metaWithoutSubdesk, route._context)).toBe(true)
  expect(route.isValid({ ...paramsWithoutSubdesk, _root_desk_slug: 'foo' }, metaWithoutSubdesk, route._context)).toBe(
    false,
  )
  expect(route.isValid({ ...paramsWithoutSubdesk, _sub_desk_slug: 'foo' }, metaWithoutSubdesk, route._context)).toBe(
    false,
  )
  expect(route.toURL(metaWithoutSubdesk, route._context)).toBe('/posts/root-slug/article-slug')
})

it('with static param', () => {
  const route = createResourceRoute({
    resource: 'article',
    url: '/{#foo}/{id}',
    _staticParams: { foo: 'foo' },
  })
  const params = { _desk_slug: 'desk-slug', _id: 'article-id' }
  const meta = { desk: { slug: 'desk-slug' }, id: 'article-id' }

  expect(route.getIdentity(params, route._context)).toEqual({
    id: 'article-id',
    type: 'article',
  })

  expect(route.isValid(params, meta, route._context)).toBe(true)
  expect(route.toURL(meta, route._context)).toBe('/foo/article-id')
})
