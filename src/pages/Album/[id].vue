<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.back()"
    >
      Retour
    </v-btn>

    <v-skeleton-loader
      v-if="deezerStore.isLoading"
      type="image, article"
    />

    <v-alert
      v-else-if="!album"
      type="error"
      variant="tonal"
    >
      Album non trouvé.
    </v-alert>

    <v-card
      v-else
      class="mx-auto"
      max-width="800"
    >
      <v-img
        :alt="album.title"
        cover
        height="300"
        :src="getImageUrl(album.image)"
      />

      <v-card-title class="text-h4">
        {{ album.title }}
      </v-card-title>

      <v-card-subtitle>
        {{ album.artist }} · {{ album.releaseDate }}
      </v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script setup>
  import useDeezerStore from '@/stores/deezerStore.js'
  import { getImageUrl } from '@/utils/imageUrl'

  const route = useRoute()
  const deezerStore = useDeezerStore()

  const album = computed(() => deezerStore.getAlbumById(route.params.id))
</script>
