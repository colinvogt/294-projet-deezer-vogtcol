<template>
  <v-container v-if="deezerStore.isMock" class="pb-0">
    <v-alert type="warning" variant="tonal">
      <p class="font-weight-bold mb-1">Mode démonstration</p>
      <p>
        L'API est indisponible. Une petite sélection locale est affichée.
        La recherche porte sur cette sélection. Vos favoris sont conservés,
        mais certains éléments peuvent ne pas être disponibles ici.
      </p>
      <v-btn class="mt-3" prepend-icon="mdi-refresh" variant="outlined" @click="retryApi">
        Réessayer l'API
      </v-btn>
    </v-alert>
  </v-container>
</template>

<script setup>
  import useDeezerStore from '@/stores/deezerStore.js'

  const deezerStore = useDeezerStore()

  function retryApi () {
    // Repartir d'une page neuve permet de retenter l'API avec un cache cohérent.
    window.location.reload()
  }
</script>
