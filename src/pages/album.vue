<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Album
      <span class="text-subtitle-1">({{ deezerStore.totalAlbum }})</span>
    </h1>

    <!-- Barre de recherche, filtre et tri -->
    <barre-recherche
      :filter="selectedArtist"
      filter-label="Filtrer par artiste"
      :items="artistNames"
      :search="searchQuery"
      search-label="Rechercher un album"
      :sort-order="sortOrder"
      @change-filter="selectedArtist = $event"
      @change-search="searchQuery = $event"
      @toggle-sort="toggleSort"
    />

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
      v-else-if="deezerStore.albums.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les albums. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Aucun résultat -->
    <v-alert
      v-else-if="sortedAlbums.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucun album ne correspond à votre recherche.
    </v-alert>

    <!-- État 4 : Data -->
    <v-row v-else>
      <v-col
        v-for="album in sortedAlbums"
        :key="album.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <album-card :album="album" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import AlbumCard from '@/components/AlbumCard.vue'
  import BarreRecherche from '@/components/BarreRecherche.vue'
  import useDeezerStore from '@/stores/deezerStore.js'

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
    for (const album of deezerStore.albums) {
      if (!list.includes(album.artist)) {
        list.push(album.artist)
      }
    }
    return list.sort()
  })

  // Étape 1 : filtrer par artiste
  const filteredByArtist = computed(() => {
    if (!selectedArtist.value) return deezerStore.albums
    return deezerStore.albums.filter(album =>
      album.artist === selectedArtist.value,
    )
  })

  // Étape 2 : filtrer par recherche
  const filteredBySearch = computed(() => {
    if (!searchQuery.value) return filteredByArtist.value
    const query = searchQuery.value.toLowerCase()
    return filteredByArtist.value.filter(album =>
      album.title.toLowerCase().includes(query)
      || album.artist.toLowerCase().includes(query),
    )
  })

  // Étape 3 : trier par titre
  const sortedAlbums = computed(() => {
    return [...filteredBySearch.value].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title, 'fr')
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  })

  function toggleSort () {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
</script>
