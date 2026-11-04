<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Mes favoris
      <span class="text-subtitle-1">({{ deezerStore.totalFavorites }})</span>
    </h1>

    <v-progress-linear
      v-if="isLoading"
      aria-label="Chargement des favoris"
      class="mb-6"
      indeterminate
    />

    <v-alert
      v-if="!isLoading && unavailableCount > 0"
      class="mb-6"
      type="warning"
      variant="tonal"
    >
      Certains favoris sont indisponibles.
      <v-btn
        class="ml-2"
        variant="text"
        @click="loadFavoriteItems"
      >
        Réessayer
      </v-btn>
    </v-alert>

    <!-- Message si aucun favori -->
    <v-alert
      v-if="deezerStore.totalFavorites === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Vous n'avez pas encore de favoris.
      Cliquez sur le cœur d'un album, d'un artiste ou d'un titre pour l'ajouter !
    </v-alert>

    <template v-else>
      <!-- Albums favoris -->
      <template v-if="deezerStore.getFavoriteAlbums.length > 0">
        <h2 class="text-h5 mb-4">
          Albums ({{ deezerStore.getFavoriteAlbums.length }})
        </h2>
        <v-row class="mb-8">
          <v-col
            v-for="album in deezerStore.getFavoriteAlbums"
            :key="album.id"
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <album-card :album="album" />
          </v-col>
        </v-row>
      </template>

      <!-- Artistes favoris -->
      <template v-if="deezerStore.getFavoriteArtistes.length > 0">
        <h2 class="text-h5 mb-4">
          Artistes ({{ deezerStore.getFavoriteArtistes.length }})
        </h2>
        <v-row class="mb-8">
          <v-col
            v-for="artiste in deezerStore.getFavoriteArtistes"
            :key="artiste.id"
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <artiste-card :artiste="artiste" />
          </v-col>
        </v-row>
      </template>

      <!-- Titres favoris -->
      <template v-if="deezerStore.getFavoriteTracks.length > 0">
        <h2 class="text-h5 mb-4">
          Titres ({{ deezerStore.getFavoriteTracks.length }})
        </h2>
        <v-row class="mb-8">
          <v-col
            v-for="track in deezerStore.getFavoriteTracks"
            :key="track.id"
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <titre-card :track="track" />
          </v-col>
        </v-row>
      </template>
    </template>
  </v-container>
</template>

<script setup>
  import AlbumCard from '@/components/AlbumCard.vue'
  import ArtisteCard from '@/components/ArtisteCard.vue'
  import TitreCard from '@/components/TitreCard.vue'
  import useDeezerStore from '@/stores/deezerStore.js'

  const deezerStore = useDeezerStore()
  const isLoading = ref(false)
  const unavailableCount = computed(() => deezerStore.totalFavorites
    - deezerStore.getFavoriteAlbums.length
    - deezerStore.getFavoriteArtistes.length
    - deezerStore.getFavoriteTracks.length)

  async function loadFavoriteItems () {
    isLoading.value = true
    try {
      await deezerStore.fetchFavorites()
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadFavoriteItems)
</script>
