<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="goBack"
    >
      Retour
    </v-btn>

    <v-skeleton-loader v-if="isLoading" type="image, article" />

    <v-alert v-else-if="!item" type="error" variant="tonal">
      {{ itemError ? 'Impossible de charger cette fiche.' : configuration.notFound }}
      <v-btn v-if="itemError" class="ml-2" variant="text" @click="retryCount++">
        Réessayer
      </v-btn>
    </v-alert>

    <template v-else>
      <v-card class="mx-auto mb-6" max-width="960">
        <v-row no-gutters>
          <v-col class="pa-4" cols="12" sm="5">
            <v-img
              :alt="displayName"
              aspect-ratio="1"
              class="rounded"
              cover
              :src="getImageUrl(item.image)"
            />
          </v-col>

          <v-col class="pa-4" cols="12" sm="7">
            <p class="text-overline">{{ configuration.label }}</p>
            <h1 class="text-h4 mb-4">{{ displayName }}</h1>

            <dl>
              <div v-for="field in fields" :key="field.label" class="mb-3">
                <dt class="text-caption">{{ field.label }}</dt>
                <dd>{{ field.value }}</dd>
              </div>
            </dl>

            <favorite-button :item="item" :type="type" />
          </v-col>
        </v-row>
      </v-card>

      <section v-if="association" class="mx-auto" style="max-width: 960px">
        <h2 class="text-h5 mb-3">{{ association.heading }}</h2>

        <v-progress-linear
          v-if="isRelatedLoading"
          aria-label="Chargement des éléments associés"
          indeterminate
        />
        <v-alert v-else-if="relatedError" type="warning" variant="tonal">
          Impossible de charger les éléments associés.
          <v-btn class="ml-2" variant="text" @click="retryCount++">
            Réessayer
          </v-btn>
        </v-alert>
        <template v-else-if="relatedItems.length > 0">
          <p v-if="relatedItems.length < relatedTotal" class="text-body-2 mb-2">
            {{ relatedItems.length }} sur {{ relatedTotal }}
          </p>
          <v-list lines="one" rounded>
            <v-list-item
              v-for="related in relatedItems"
              :key="related.id"
              :prepend-avatar="getImageUrl(related.image) || undefined"
              :title="related.title ?? related.name"
              :to="`${catalogue[association.type].detailPath}/${related.id}`"
            />
          </v-list>
        </template>
        <p v-else class="text-body-2">{{ association.emptyMessage }}</p>
      </section>
    </template>
  </v-container>
</template>

<script setup>
  import FavoriteButton from '@/components/FavoriteButton.vue'
  import useDeezerStore from '@/stores/deezerStore.js'
  import { formatDate, formatDuration } from '@/utils/formatCatalogue.js'
  import { getImageUrl } from '@/utils/imageUrl.js'

  const props = defineProps({
    type: { type: String, required: true },
  })

  const catalogue = {
    albums: {
      label: 'Album',
      listPath: '/album',
      detailPath: '/Album',
      notFound: 'Album introuvable.',
      fields: album => [
        { label: 'Artiste', value: album.artist },
        { label: 'Date de sortie', value: formatDate(album.releaseDate) },
        { label: 'Type de parution', value: album.recordType },
        { label: 'Contenu explicite', value: formatExplicit(album.explicit) },
      ],
      association: album => album.title && album.artist && {
        type: 'tracks',
        heading: 'Titres de cet album dans le catalogue',
        emptyMessage: 'Aucun titre de cet album dans le catalogue.',
        params: { album: album.title, artist: album.artist },
      },
    },
    artistes: {
      label: 'Artiste',
      listPath: '/artiste',
      detailPath: '/artiste',
      notFound: 'Artiste introuvable.',
      fields: artiste => [
        { label: 'Genres', value: artiste.genres?.join(', ') },
        { label: 'Nombre d’albums sur Deezer', value: artiste.nbAlbum?.toLocaleString('fr-CH') },
        { label: 'Fans sur Deezer', value: artiste.nbFan?.toLocaleString('fr-CH') },
      ],
      association: artiste => artiste.name && {
        type: 'albums',
        heading: 'Albums de cet artiste dans le catalogue',
        emptyMessage: 'Aucun album de cet artiste dans le catalogue.',
        params: { artist: artiste.name },
      },
    },
    tracks: {
      label: 'Titre',
      listPath: '/titre',
      detailPath: '/titre',
      notFound: 'Titre introuvable.',
      fields: track => [
        { label: 'Artiste', value: track.artist },
        { label: 'Album', value: track.album },
        { label: 'Durée', value: formatDuration(track.duration) },
        { label: 'Indice de popularité', value: track.rank?.toLocaleString('fr-CH') },
        { label: 'Contenu explicite', value: formatExplicit(track.explicit) },
      ],
      association: track => track.artist && {
        type: 'artistes',
        heading: 'Artiste dans le catalogue',
        emptyMessage: 'Cet artiste ne figure pas dans le catalogue.',
        params: { name: track.artist },
      },
    },
  }

  const route = useRoute()
  const router = useRouter()
  const deezerStore = useDeezerStore()
  const configuration = computed(() => catalogue[props.type])
  const itemId = computed(() => {
    const param = route.params.id
    const id = Number(param)
    return typeof param === 'string' && /^[1-9]\d*$/.test(param) && Number.isSafeInteger(id) ? id : null
  })
  const item = computed(() => itemId.value && deezerStore.getItemById(props.type, itemId.value))
  const displayName = computed(() => item.value?.title ?? item.value?.name)
  const fields = computed(() => item.value
    ? configuration.value.fields(item.value).filter(field => field.value != null && field.value !== '')
    : [])
  const association = computed(() => item.value && configuration.value.association(item.value))

  const isLoading = ref(false)
  const itemError = ref(false)
  const isRelatedLoading = ref(false)
  const relatedError = ref(false)
  const relatedItems = ref([])
  const relatedTotal = ref(0)
  const retryCount = ref(0)

  function formatExplicit (explicit) {
    if (typeof explicit === 'boolean') {
      return explicit ? 'Oui' : 'Non'
    }
  }

  function goBack () {
    if (router.options.history.state.back) {
      router.back()
    } else {
      router.push(configuration.value.listPath)
    }
  }

  watch([() => props.type, itemId, retryCount], async ([type, id], _, onCleanup) => {
    const controller = new AbortController()
    const { signal } = controller
    onCleanup(() => controller.abort())

    isLoading.value = id !== null
    itemError.value = false
    isRelatedLoading.value = false
    relatedError.value = false
    relatedItems.value = []
    relatedTotal.value = 0

    if (id === null) {
      return
    }

    try {
      await deezerStore.fetchItem(type, id, signal)
    } catch (error) {
      if (!signal.aborted) {
        itemError.value = error.response?.status !== 404
      }
    } finally {
      if (!signal.aborted) {
        isLoading.value = false
      }
    }

    if (signal.aborted || !association.value) {
      return
    }

    isRelatedLoading.value = true
    try {
      const { type, params } = association.value
      const result = await deezerStore.fetchCataloguePage(type, { ...params, page: 1, limit: 12 }, signal)
      if (!signal.aborted) {
        relatedItems.value = result.items
        relatedTotal.value = result.pagination.total
      }
    } catch {
      if (!signal.aborted) {
        relatedError.value = true
      }
    } finally {
      if (!signal.aborted) {
        isRelatedLoading.value = false
      }
    }
  }, { immediate: true })
</script>
