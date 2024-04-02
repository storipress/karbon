import { expect, it } from 'vitest'
import { convertToOption } from '../to-options'

it('convertToOption basic', () => {
  const opt = convertToOption('article', [
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: false,
      isOptional: false,
      paramName: ':_desk_slug',
      path: ['desk', 'slug'],
      type: 'variable',
    },
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: true,
      isOptional: false,
      paramName: ':_slug',
      path: ['slug'],
      type: 'variable',
    },
  ])
  expect(opt).toMatchInlineSnapshot(`
    {
      "_context": {
        "id": {
          "isIdentifiable": true,
          "isOptional": false,
          "paramName": ":_slug",
          "path": [
            "slug",
          ],
          "type": "variable",
        },
        "parts": [
          {
            "type": "static",
            "value": "/",
          },
          {
            "isIdentifiable": false,
            "isOptional": false,
            "paramName": ":_desk_slug",
            "path": [
              "desk",
              "slug",
            ],
            "type": "variable",
          },
          {
            "type": "static",
            "value": "/",
          },
          {
            "isIdentifiable": true,
            "isOptional": false,
            "paramName": ":_slug",
            "path": [
              "slug",
            ],
            "type": "variable",
          },
        ],
        "resource": "article",
        "staticParams": {},
      },
      "enable": true,
      "getIdentity": [Function],
      "isValid": [Function],
      "route": "/:_desk_slug/:_slug",
      "toURL": [Function],
    }
  `)

  expect(opt.getIdentity({ _desk_slug: 'foo', _slug: 'slug' }, opt._context)).toEqual({
    type: 'article',
    slug: 'slug',
  })

  expect(opt.toURL({ desk: { slug: 'desk' }, slug: 'article-slug' }, opt._context)).toBe('/desk/article-slug')
})

it('convertToOption with optional and optional param exist', () => {
  const opt = convertToOption('article', [
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: false,
      isOptional: false,
      paramName: ':_root_desk_slug',
      path: ['root_desk', 'slug'],
      type: 'variable',
    },
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: false,
      isOptional: true,
      paramName: ':_sub_desk_slug?',
      path: ['sub_desk', 'slug'],
      type: 'variable',
    },
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: true,
      isOptional: false,
      paramName: ':_slug',
      path: ['slug'],
      type: 'variable',
    },
  ])
  expect(opt).toMatchInlineSnapshot(`
    {
      "_context": {
        "id": {
          "isIdentifiable": true,
          "isOptional": false,
          "paramName": ":_slug",
          "path": [
            "slug",
          ],
          "type": "variable",
        },
        "parts": [
          {
            "type": "static",
            "value": "/",
          },
          {
            "isIdentifiable": false,
            "isOptional": false,
            "paramName": ":_root_desk_slug",
            "path": [
              "root_desk",
              "slug",
            ],
            "type": "variable",
          },
          {
            "type": "static",
            "value": "/",
          },
          {
            "isIdentifiable": false,
            "isOptional": true,
            "paramName": ":_sub_desk_slug?",
            "path": [
              "sub_desk",
              "slug",
            ],
            "type": "variable",
          },
          {
            "type": "static",
            "value": "/",
          },
          {
            "isIdentifiable": true,
            "isOptional": false,
            "paramName": ":_slug",
            "path": [
              "slug",
            ],
            "type": "variable",
          },
        ],
        "resource": "article",
        "staticParams": {},
      },
      "enable": true,
      "getIdentity": [Function],
      "isValid": [Function],
      "route": "/:_root_desk_slug/:_sub_desk_slug?/:_slug",
      "toURL": [Function],
    }
  `)

  const params = { _root_desk_slug: 'parent-desk', _sub_desk_slug: 'sub-desk', _slug: 'article-slug' }
  const meta = { desk: { slug: 'sub-desk', desk: { slug: 'parent-desk' } }, slug: 'article-slug' }

  expect(opt.getIdentity(params, opt._context)).toEqual({
    type: 'article',
    slug: 'article-slug',
  })

  expect(opt.toURL(meta, opt._context)).toBe('/parent-desk/sub-desk/article-slug')
})

it('convertToOption with optional and optional param non-exist', () => {
  const opt = convertToOption('article', [
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: false,
      isOptional: false,
      paramName: ':_root_desk_slug',
      path: ['root_desk', 'slug'],
      type: 'variable',
    },
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: false,
      isOptional: true,
      paramName: ':_sub_desk_slug?',
      path: ['sub_desk', 'slug'],
      type: 'variable',
    },
    {
      type: 'static',
      value: '/',
    },
    {
      isIdentifiable: true,
      isOptional: false,
      paramName: ':_slug',
      path: ['slug'],
      type: 'variable',
    },
  ])

  const params = { _root_desk_slug: 'root-desk', _slug: 'article-slug' }
  const meta = { desk: { slug: 'root-desk' }, slug: 'article-slug' }

  expect(opt.getIdentity(params, opt._context)).toEqual({
    type: 'article',
    slug: 'article-slug',
  })

  expect(opt.toURL(meta, opt._context)).toBe('/root-desk/article-slug')
})
