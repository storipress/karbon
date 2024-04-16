import { HttpResponse, graphql } from 'msw'
import { afterAll, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import isViewable from '../default-is-viewable.mjs'

const server = setupServer(
  graphql.query('SubscriberProfile', () => {
    return HttpResponse.json({
      data: {
        subscriberProfile: {
          id: '1',
          subscribed: true,
        },
      },
    })
  }),
)

server.listen()

afterAll(() => {
  server.close()
})

it('can check subscribe status', async () => {
  await expect(
    isViewable({ meta: {} as any, auth: { token: 'token' }, getArticle: (() => {}) as any }),
  ).resolves.toEqual({
    pass: true,
  })
})
