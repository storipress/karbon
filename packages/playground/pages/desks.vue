<script lang="ts" setup>
const { desks } = useDesks()
</script>

<template>
  <ol>
    <li v-for="desk of desks" :key="desk.id" class="border-2 p-1 m-2">
      <NuxtLink :to="desk.url">Desk name: {{ desk.name }}</NuxtLink>
      <ul>
        Sub desks:
        <li v-for="subDesk of desk.desks" :key="subDesk.id">
          <NuxtLink :to="subDesk.url">
            {{ subDesk }}
          </NuxtLink>
        </li>
      </ul>
    </li>
  </ol>
</template>
