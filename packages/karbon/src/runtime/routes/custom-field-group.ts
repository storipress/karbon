import { defineSnapshotHandler, getGroup, listGroups } from '@storipress/karbon/internal'

// @ts-expect-error noreason
import { defineCachedEventHandler } from '#imports'

enum CustomFieldGroupType {
  ArticleContentBlock = 'articleContentBlock',
  ArticleMetafield = 'articleMetafield',
  DeskMetafield = 'deskMetafield',
  PublicationMetafield = 'publicationMetafield',
  TagMetafield = 'tagMetafield',
}

interface Group {
  data: GroupData[]
}
interface GroupData {
  type: CustomFieldGroupType
  id: string
  key: string
  name: string
}

export default defineCachedEventHandler(
  defineSnapshotHandler({
    fixedName: '_custom-field-group',
    handler: async () => {
      const allGroups: Group = await listGroups()
      const tagGroupsKey = allGroups.data
        .filter((group) => group.type === 'tagMetafield')
        .map((tagGroup) => tagGroup.key)

      const promise = tagGroupsKey.map((key: string) => getGroup(key))
      const result = await Promise.all(promise)

      const groupTagIds = new Map()
      for (const group of result) {
        groupTagIds.set(
          group.key,
          group.tags.map(({ id }: { id: string }) => id)
        )
      }

      return Object.fromEntries(groupTagIds)
    },
  })
)
