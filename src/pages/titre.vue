<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Titres
      <span class="text-subtitle-1">({{ sortedTracks.length }})</span>
    </h1>

    <!-- Barre de recherche, filtre et tri -->
    <v-row class="mb-4">
      <v-col
        cols="12"
        md="4"
        sm="6"
      >
        <v-text-field
          v-model="searchQuery"
          clearable
          density="compact"
          hide-details
          label="Rechercher un titre, un artiste ou un album"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>

      <v-col
        cols="12"
        md="4"
        sm="6"
      >
        <v-select
          v-model="selectedArtist"
          clearable
          density="compact"
          hide-details
          :items="artistNames"
          label="Filtrer par artiste"
          prepend-inner-icon="mdi-filter"
          variant="outlined"
        />
      </v-col>

      <v-col
        class="d-flex align-center"
        cols="12"
        md="4"
      >
        <v-btn
          :prepend-icon="sortOrder === 'asc'
            ? 'mdi-sort-alphabetical-ascending'
            : 'mdi-sort-alphabetical-descending'"
          variant="outlined"
          @click="toggleSort"
        >
          Tri {{ sortOrder === 'asc' ? 'A → Z' : 'Z → A' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- État 1 : Loading -->
    <v-row v-if="deezerStore.isLoading">
      <v-col
        v-for="n in 8"
        :key="n"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-skeleton-loader
          height="350"
          type="image, article"
        />
      </v-col>
    </v-row>

    <!-- État 2 : Erreur -->
    <v-alert
      v-else-if="deezerStore.tracks.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les titres. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Aucun résultat -->
    <v-alert
      v-else-if="sortedTracks.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucun titre ne correspond à votre recherche.
    </v-alert>

    <!-- État 4 : Data -->
    <v-row v-else>
      <v-col
        v-for="track in sortedTracks"
        :key="track.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-card hover>
          <v-img
            :alt="track.title"
            cover
            height="200"
            :src="getImageUrl(track.image)"
          />
          <v-card-title>{{ track.title }}</v-card-title>
          <v-card-subtitle>{{ track.artist }}</v-card-subtitle>
          <v-card-text class="d-flex align-center">
            <span>{{ formatDuration(track.duration) }}</span>
            <v-chip
              v-if="track.explicit"
              class="ml-2"
              size="x-small"
            >
              Explicit
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import useDeezerStore from '@/stores/deezerStore.js'
  import { getImageUrl } from '@/utils/imageUrl.js'

  const deezerStore = useDeezerStore()

  // URL de l'API pour le message d'erreur
  const apiUrl = import.meta.env.VITE_API_URL

  // Variables réactives pour la recherche, le filtre et le tri
  const searchQuery = ref('')
  const selectedArtist = ref(null)
  const sortOrder = ref('asc')

  // Liste des artistes pour le v-select (sans doublons)
  const artistNames = computed(() => {
    const list = []
    for (const track of deezerStore.tracks) {
      if (!list.includes(track.artist)) {
        list.push(track.artist)
      }
    }
    return list.sort()
  })

  // Étape 1 : filtrer par artiste
  const filteredByArtist = computed(() => {
    if (!selectedArtist.value) return deezerStore.tracks
    return deezerStore.tracks.filter(track =>
      track.artist === selectedArtist.value,
    )
  })

  // Étape 2 : filtrer par recherche (titre, artiste ou album)
  const filteredBySearch = computed(() => {
    if (!searchQuery.value) return filteredByArtist.value
    const query = searchQuery.value.toLowerCase()
    return filteredByArtist.value.filter(track =>
      track.title.toLowerCase().includes(query)
      || track.artist.toLowerCase().includes(query)
      || track.album.toLowerCase().includes(query),
    )
  })

  // Étape 3 : trier par titre
  const sortedTracks = computed(() => {
    return [...filteredBySearch.value].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title, 'fr')
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  })

  function toggleSort () {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  // 209 secondes -> "3:29"
  function formatDuration (seconds) {
    const minutes = Math.floor(seconds / 60)
    const rest = String(seconds % 60).padStart(2, '0')
    return `${minutes}:${rest}`
  }
</script>
