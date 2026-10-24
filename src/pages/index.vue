<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Projet deezer (titre provisoire)
    </h1>

    <!-- État 1 : Loading — squelettes de chargement -->
    <v-row v-if="AlbumStore.isLoading">
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

    <!-- État 2 : Error — alerte si aucun Pokémon chargé -->
    <v-alert
      v-else-if="AlbumStore.albums.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les Pokémon. Vérifiez que l'API tourne sur
      {{ apiUrl }}.
    </v-alert>

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
  // Import du store et de storeToRefs
  import { storeToRefs } from 'pinia'
  import AlbumCard from '/src/components/AlbumCard.vue'
  import useAlbumStore from '/src/stores/albumStore'

  // Instancier le store
  const albumStore = useAlbumStore()

  // Destructurer le state en gardant la réactivité
  // storeToRefs convertit chaque propriété du state en ref
  const apiUrl = import.meta.env.VITE_API_URL
</script>
