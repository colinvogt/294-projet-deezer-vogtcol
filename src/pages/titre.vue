<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Titres
      <span class="text-subtitle-1">({{ filteredTracks.length }})</span>
    </h1>

    <!-- Barre de recherche -->
    <v-text-field
      v-model="search"
      class="mb-6"
      clearable
      hide-details
      label="Rechercher un titre, un artiste ou un album"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
    />

    <!-- État 1 : Loading -->
    <v-row v-if="albumStore.isLoading">
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
      v-else-if="albumStore.tracks.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les titres. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Recherche sans résultat -->
    <v-alert
      v-else-if="filteredTracks.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucun titre ne correspond à « {{ search }} ».
    </v-alert>

    <!-- État 4 : Data -->
    <v-row v-else>
      <v-col
        v-for="track in filteredTracks"
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
  import useAlbumStore from '@/stores/albumStore'
  import { getImageUrl } from '@/utils/imageUrl.js'

  const albumStore = useAlbumStore()

  // URL de l'API pour le message d'erreur
  const apiUrl = import.meta.env.VITE_API_URL

  // Texte tapé dans la barre de recherche
  const search = ref('')

  // Met en minuscules et enlève les accents : "ROSALÍA" -> "rosalia"
  function normalize (text) {
    return String(text ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '')
  }

  // Liste filtrée : se met à jour automatiquement quand on tape
  const filteredTracks = computed(() => {
    const query = normalize(search.value).trim()

    if (!query) {
      return albumStore.tracks
    }

    return albumStore.tracks.filter(track => {
      return normalize(track.title).includes(query)
        || normalize(track.artist).includes(query)
        || normalize(track.album).includes(query)
    })
  })

  // 209 secondes -> "3:29"
  function formatDuration (seconds) {
    const minutes = Math.floor(seconds / 60)
    const rest = String(seconds % 60).padStart(2, '0')
    return `${minutes}:${rest}`
  }
</script>
