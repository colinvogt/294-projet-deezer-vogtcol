<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Album
      <span class="text-subtitle-1">({{ albumStore.totalAlbum }})</span>
    </h1>

    <!--
    Barre de recherche, filtre et tri
      * v-row avec 3 colonnes pour les contrôles
    -->
    <v-row class="mb-4">
      <!-- Recherche par titre ou artiste -->
      <v-col
        cols="12"
        md="4"
        sm="6"
      >
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          hide-details
          label="Rechercher un album"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>

      <!-- Filtre par artiste -->
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

      <!-- Bouton de tri : alterne entre A → Z et Z → A -->
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
      v-else-if="albumStore.albums.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les albums. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Aucun résultat pour la recherche ou le filtre -->
    <v-alert
      v-else-if="sortedAlbums.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucun album ne correspond à votre recherche.
    </v-alert>

    <!-- État 4 : Data (on itère sur le dernier computed de la chaîne) -->
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
  import useAlbumStore from '@/stores/albumStore'

  const albumStore = useAlbumStore()

  // URL de l'API pour le message d'erreur
  const apiUrl = import.meta.env.VITE_API_URL

  // Variables réactives pour la recherche, le filtre et le tri
  const search = ref('')
  const selectedArtist = ref(null)
  const sortOrder = ref('asc')

  // Met en minuscules et enlève les accents : "ROSALÍA" -> "rosalia"
  function normalize (text) {
    return String(text ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '')
  }

  /**
 * Liste des artistes pour le v-select.
 * Set supprime les doublons (un artiste a plusieurs albums).
 */
  const artistNames = computed(() => {
    const names = new Set(albumStore.albums.map(album => album.artist))
    return [...names].sort((a, b) => a.localeCompare(b, 'fr'))
  })

  /**
 * COMPUTED CHAÎNÉS :
 * albums → filteredByArtist → filteredBySearch → sortedAlbums
 */

  // Étape 1 : filtrer par artiste
  const filteredByArtist = computed(() => {
    if (!selectedArtist.value) {
      return albumStore.albums
    }
    return albumStore.albums.filter(album => album.artist === selectedArtist.value)
  })

  // Étape 2 : filtrer par recherche (sur le résultat de l'étape 1)
  const filteredBySearch = computed(() => {
    const query = normalize(search.value).trim()

    if (!query) {
      return filteredByArtist.value
    }

    return filteredByArtist.value.filter(album => {
      return normalize(album.title).includes(query)
        || normalize(album.artist).includes(query)
    })
  })

  // Étape 3 : trier par titre (copie du tableau pour ne pas modifier l'original)
  const sortedAlbums = computed(() => {
    return [...filteredBySearch.value].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title, 'fr')
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  })

  // Inverse l'ordre de tri
  function toggleSort () {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
</script>
