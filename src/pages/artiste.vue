<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Artistes
      <span class="text-subtitle-1">({{ deezerStore.artistes.length }})</span>
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
          label="Rechercher un artiste"
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
          v-model="selectedGenre"
          clearable
          density="compact"
          hide-details
          :items="genres"
          label="Filtrer par genre"
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
      v-else-if="deezerStore.artistes.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les artistes. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Aucun résultat -->
    <v-alert
      v-else-if="sortedArtistes.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucun artiste ne correspond à votre recherche.
    </v-alert>

    <!-- État 4 : Data -->
    <v-row v-else>
      <v-col
        v-for="artiste in sortedArtistes"
        :key="artiste.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-card hover>
          <v-img
            :alt="artiste.name"
            cover
            height="200"
            :src="getImageUrl(artiste.image)"
          />
          <v-card-title>{{ artiste.name }}</v-card-title>
          <v-card-subtitle>{{ artiste.genres.join(', ') }}</v-card-subtitle>
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
  const selectedGenre = ref(null)
  const sortOrder = ref('asc')

  // Liste des genres pour le v-select (sans doublons)
  // Chaque artiste a plusieurs genres : on parcourt les artistes, puis leurs genres
  const genres = computed(() => {
    const list = []
    for (const artiste of deezerStore.artistes) {
      for (const genre of artiste.genres) {
        if (!list.includes(genre)) {
          list.push(genre)
        }
      }
    }
    return list.sort()
  })

  // Étape 1 : filtrer par genre
  const filteredByGenre = computed(() => {
    if (!selectedGenre.value) return deezerStore.artistes
    return deezerStore.artistes.filter(artiste =>
      artiste.genres.includes(selectedGenre.value),
    )
  })

  // Étape 2 : filtrer par recherche
  const filteredBySearch = computed(() => {
    if (!searchQuery.value) return filteredByGenre.value
    const query = searchQuery.value.toLowerCase()
    return filteredByGenre.value.filter(artiste =>
      artiste.name.toLowerCase().includes(query),
    )
  })

  // Étape 3 : trier par nom
  const sortedArtistes = computed(() => {
    return [...filteredBySearch.value].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, 'fr')
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  })

  function toggleSort () {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
</script>
