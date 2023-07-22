<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { useLazySearchClient, useSearchClient } from '#imports'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    queryBy?: string
    matchWithoutInput?: boolean
    lazy?: boolean
  }>(),
  {
    queryBy: 'title',
    matchWithoutInput: false,
    lazy: false,
  },
)
const emit = defineEmits(['update:modelValue'])
const getSearchClient = props.lazy ? useLazySearchClient : useSearchClient
const { searchClient, indexName } = getSearchClient({ queryBy: props.queryBy })
const searchInput = useVModel(props, 'modelValue', emit)
</script>

<template>
  <div>
    <ClientOnly>
      <AisInstantSearch v-if="searchClient" :search-client="searchClient" :index-name="indexName">
        <AisSearchBox v-model="searchInput">
          <AisHits v-slot="{ items }">
            <slot :items="matchWithoutInput || searchInput ? items : []" />
          </AisHits>
        </AisSearchBox>
      </AisInstantSearch>
    </ClientOnly>
  </div>
</template>
