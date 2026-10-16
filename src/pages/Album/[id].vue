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

    <v-alert
      v-if="!album"
      type="error"
      variant="tonal"
    >
      Pokémon non trouvé.
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
        {{ album.titles }}
      </v-card-title>

      <v-card-subtitle>
        Niveau {{ album.artiste }}
      </v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script setup>
  // Import du store Pokémon
  import { useAlbumStore } from '@/stores/albumStore'
  import { getImageUrl } from '@/utils/imageUrl'

  // Récupérer l'ID depuis les paramètres de la route
  const route = useRoute()

  // Instancier le store
  const albumStore = useAlbumStore()

  // Utiliser le getter du store pour trouver le Pokémon
  // computed se met à jour automatiquement si l'ID change
  const album = computed(() => {
    return albumStore.getAlbumById(route.params.id)
  })
</script>
