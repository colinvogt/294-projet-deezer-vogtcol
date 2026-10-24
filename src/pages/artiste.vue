<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Artistes
      <span class="text-subtitle-1">({{ albumStore.artistes.length }})</span>
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
          height="120"
          type="article"
        />
      </v-col>
    </v-row>

    <!-- État 2 : Erreur -->
    <v-alert
      v-else-if="albumStore.artistes.length === 0"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les artistes. Vérifiez que l'API répond sur
      {{ apiUrl }}.
    </v-alert>

    <!-- État 3 : Data -->
    <v-row v-else>
      <v-col
        v-for="artiste in albumStore.artistes"
        :key="artiste.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-card hover>
          <v-card-title>{{ artiste.name }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import useAlbumStore from '@/stores/albumStore'

  const albumStore = useAlbumStore()

  // URL de l'API pour le message d'erreur
  const apiUrl = import.meta.env.VITE_API_URL
</script>
