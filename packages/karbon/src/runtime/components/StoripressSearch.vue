<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { useSearchClient } from '#imports'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    queryBy?: string
    matchWithoutInput?: boolean
  }>(),
  {
    queryBy: 'title',
    matchWithoutInput: false,
  }
)
const emit = defineEmits(['update:modelValue'])
const { searchClient, indexName } = useSearchClient({ queryBy: props.queryBy })
const searchInput = useVModel(props, 'modelValue', emit)
</script>

<template>
  <div>
    <ClientOnly>
      <AisInstantSearch :search-client="searchClient" :index-name="indexName">
        <AisSearchBox v-model="searchInput">
          <AisHits v-slot="{ items }">
            <slot :items="matchWithoutInput || searchInput ? items : []" />
          </AisHits>
        </AisSearchBox>
      </AisInstantSearch>
    </ClientOnly>
  </div>
</template>
