<template>
  <v-app>
    <app-header />
    <router-view />
    <app-footer />
    <!-- Reste affiché même si la carte retirée des favoris disparaît. -->
    <v-snackbar
      :key="appStore.notification.id"
      v-model="appStore.notification.visible"
      :color="appStore.notification.color"
      :timeout="2000"
    >
      {{ appStore.notification.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup>

  import { useAppStore } from '@/stores/app.js'
  import useDeezerStore from '@/stores/deezerStore.js'

  const appStore = useAppStore()
  const deezerStore = useDeezerStore()
  deezerStore.loadFavorites()
</script>
