<template>
  <v-app>
    <app-header />
    <router-view />
    <app-footer />
  </v-app>
</template>

<script setup>

  // Import du store Pokémon
  import { useAlbumStore } from '@/stores/albumStore'

  // Initialisation du store au montage de l'application
  // onMounted est auto-importé grâce à unplugin-auto-import
  onMounted(async () => {
    const pokemonStore = useAlbumStore()
    // init() charge les Albums et les Artistes en parallèle
    await pokemonStore.init()
  })
</script>
