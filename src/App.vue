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


</script>
