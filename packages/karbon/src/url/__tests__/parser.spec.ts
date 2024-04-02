import { expect, it } from 'vitest'
import { parse, toRoute } from '../parser'

it('parse url work', () => {
  expect(parse('/posts/{slug}')).toMatchInlineSnapshot(`
    [
      {
        "type": "static",
        "value": "/posts/",
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
    ]
  `)

  expect(parse('/{desk.slug}/{slug}')).toMatchInlineSnapshot(`
    [
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
    ]
  `)

  expect(parse('/{year}/{sid}-{slug}')).toMatchInlineSnapshot(`
    [
      {
        "type": "static",
        "value": "/",
      },
      {
        "isIdentifiable": false,
        "isOptional": false,
        "paramName": ":_year",
        "path": [
          "year",
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
        "paramName": ":_sid",
        "path": [
          "sid",
        ],
        "type": "variable",
      },
      {
        "type": "static",
        "value": "-",
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
    ]
  `)

  expect(parse('/{#param}/{id}')).toMatchInlineSnapshot(`
    [
      {
        "type": "static",
        "value": "/",
      },
      {
        "paramName": ":param",
        "type": "staticParam",
      },
      {
        "type": "static",
        "value": "/",
      },
      {
        "isIdentifiable": true,
        "isOptional": false,
        "paramName": ":_id",
        "path": [
          "id",
        ],
        "type": "variable",
      },
    ]
  `)

  expect(parse('/{root_desk.slug}/{?sub_desk.slug}/{slug}')).toMatchInlineSnapshot(`
    [
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
    ]
  `)

  expect(parse('/{#multiple*}/{id}')).toMatchInlineSnapshot(`
    [
      {
        "type": "static",
        "value": "/",
      },
      {
        "paramName": ":multiple*",
        "type": "staticParam",
      },
      {
        "type": "static",
        "value": "/",
      },
      {
        "isIdentifiable": true,
        "isOptional": false,
        "paramName": ":_id",
        "path": [
          "id",
        ],
        "type": "variable",
      },
    ]
  `)
})

it('toRoute', () => {
  expect(
    toRoute([
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
    ]),
  ).toMatchInlineSnapshot('"/:_desk_slug/:_slug"')

  expect(
    toRoute([
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
    ]),
  ).toMatchInlineSnapshot('"/:_root_desk_slug/:_sub_desk_slug?/:_slug"')

  expect(
    toRoute([
      {
        type: 'static',
        value: '/',
      },
      {
        paramName: ':multiple*',
        type: 'staticParam',
      },
      {
        type: 'static',
        value: '/',
      },
      {
        isIdentifiable: true,
        isOptional: false,
        paramName: ':_id',
        path: ['id'],
        type: 'variable',
      },
    ]),
  ).toMatchInlineSnapshot('"/:multiple*/:_id"')
})
