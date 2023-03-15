import type { MaybeComputedRef } from '@vueuse/core'
import { resolveRef } from '@vueuse/core'
import invariant from 'tiny-invariant'
import { watchSyncEffect } from 'vue'

export function watchInvariant(maybeRefCondition: MaybeComputedRef<boolean>, message: string) {
  if (process.dev) {
    const condition = resolveRef(maybeRefCondition)

    watchSyncEffect(() => {
      invariant(condition.value, message)
    })
  }
}
