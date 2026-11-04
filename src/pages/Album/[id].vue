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
      v-if="isLoading"
      type="image, article"
    />

    <v-alert
      v-else-if="!album"
      type="error"
      variant="tonal"
    >
      {{ errorMessage || 'Album non trouvé.' }}
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
  const isLoading = ref(false)
  const errorMessage = ref('')

  watch(() => route.params.id, async (routeId, _, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })

    errorMessage.value = ''
    const id = Number(routeId)
    isLoading.value = /^[1-9]\d*$/.test(routeId) && Number.isSafeInteger(id)
    if (!isLoading.value) return

    try {
      await deezerStore.fetchItem('albums', id)
    } catch (error) {
      if (active && error.response?.status !== 404) {
        errorMessage.value = 'Impossible de charger l’album. Vérifiez votre connexion.'
      }
    } finally {
      if (active) isLoading.value = false
    }
  }, { immediate: true })
</script>
