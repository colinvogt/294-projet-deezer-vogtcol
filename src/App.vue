<template>
  <v-app>
    <app-header />
    <router-view />
    <app-footer />
  </v-app>
</template>

<script setup>

  import useDeezerStore from '@/stores/deezerStore.js'

  const deezerStore = useDeezerStore()
  deezerStore.loadFavorites()
  onMounted(() => deezerStore.init())
</script>
