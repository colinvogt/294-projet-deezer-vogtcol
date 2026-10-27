<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Album
      <span class="text-subtitle-1">({{ albumStore.totalAlbum }})</span>
    </h1>
    <!-- Barre de recherche -->
    <v-text-field
      v-model="search"
      class="mb-6"
      clearable
      hide-details
      label="Rechercher un album"
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
      v-else-if="albumStore.albums.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les titres. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Recherche sans résultat -->
    <v-alert
      v-else-if="filteredAlbum.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucun titre ne correspond à « {{ search }} ».
    </v-alert>

    <!-- État 4 : Data -->
    <v-row v-else>
      <v-col
        v-for="album in filteredAlbum"
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
  const filteredAlbum = computed(() => {
    const query = normalize(search.value).trim()

    if (!query) {
      return albumStore.albums
    }

    // Recherche par Titre/Artiste/Ablum
    return albumStore.albums.filter(album => {
      return normalize(album.title).includes(query)
        || normalize(album.artist).includes(query)
        || normalize(album.album).includes(query)
    })
  })
</script>
