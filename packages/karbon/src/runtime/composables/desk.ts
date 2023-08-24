import sortBy from 'lodash.sortby'
import { _useResource } from './resources'
import { useResourceResolver } from '#imports'

export interface Desk {
  id: string
  name: string
  slug: string
  sid: string
  desks: DeskWithURL[] | null
  order: number
}

export interface DeskWithURL extends Desk {
  url: string
  desk: DeskWithURL | null
}

export function useDesks() {
  const { _resolveFromMetaSync } = useResourceResolver()
  const { data, ...rest } = _useResource<DeskWithURL>('desk', (desk) => {
    let subdesk = desk.desks
    if (subdesk?.length) {
      const result = subdesk.map(
        (desk) =>
          ({
            ...desk,
            url: _resolveFromMetaSync('desk', desk)?.url,
          }) as DeskWithURL,
      )
      subdesk = sortBy(result, ({ order }) => order)
    }
    desk.desks = subdesk
    return desk
  })

  return {
    ...rest,
    desks: computed(() => sortBy(data.value, ({ order }) => order)),
  }
}
