<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Album
      <span class="text-subtitle-1">({{ albumStore.totalAlbum }})</span>
    </h1>

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

    <!-- État 3 : Data -->
    <v-row v-else>
      <v-col
        v-for="album in albumStore.albums"
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
</script>
