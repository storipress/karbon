<script lang="ts" setup>
const { data: articles } = useResourceList('article')
const { data: desks } = useResourceList('desk')
const { data: tags } = useResourceList('tag')
const { data: authors } = useResourceList('author')
const resources = { articles, desks, tags, authors }
const resourceKey = ['articles', 'desks', 'tags', 'authors'] as const
</script>

<template>
  <div>
    <div v-for="resource in resourceKey" :key="resource" class="border-2 m-2 p-1">
      <div class="font-bold capitalize">{{ resource }}:</div>
      <ul>
        <li v-for="item in resources[resource].value" :key="item.meta.id">
          <NuxtLink :href="item.url" class="underline text-teal-500">
            {{
              (item.meta as any).title || (item.meta as any).name || (item.meta as any).full_name
            }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
