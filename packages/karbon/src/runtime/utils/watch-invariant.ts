import type { MaybeRefOrGetter } from '@vueuse/core'
import { toRef } from '@vueuse/core'
import { watchSyncEffect } from 'vue'
import { verboseInvariant } from './verbose-invariant'

export function watchInvariant(maybeRefCondition: MaybeRefOrGetter<boolean>, message: string) {
  if (process.dev) {
    const condition = toRef(maybeRefCondition)

    watchSyncEffect(() => {
      verboseInvariant(condition.value, message)
    })
  }
}
