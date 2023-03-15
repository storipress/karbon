import { _useResource } from './resources'
import { useResourceResolver } from '#imports'

export interface Desk {
  id: string
  name: string
  slug: string
  sid: string
  desk: Desk | null
}

export interface DeskWithURL extends Desk {
  url: string
  desk: DeskWithURL | null
}

export function useDesks() {
  const { _resolveFromMetaSync } = useResourceResolver()
  const { data, ...rest } = _useResource<DeskWithURL>('desk', (desk) => {
    let subdesk = desk.desk
    if (subdesk) {
      subdesk = {
        ...subdesk,
        url: _resolveFromMetaSync('desk', subdesk)!.url,
      }
    }
    desk.desk = subdesk
    return desk
  })

  return {
    ...rest,
    desks: data,
  }
}
