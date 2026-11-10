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

    <v-alert v-else-if="detailError" type="error" variant="tonal">
      Impossible de charger cette fiche.
      <v-btn class="ml-2" variant="text" @click="loadDetail">
        Réessayer
      </v-btn>
    </v-alert>
    <v-alert v-else-if="!item" type="error" variant="tonal">
      {{ label }} introuvable.
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
            <p class="text-overline">{{ label }}</p>
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
          <v-btn class="ml-2" variant="text" @click="loadRelated">
            Réessayer
          </v-btn>
        </v-alert>
        <template v-else-if="relatedPage?.items.length">
          <p v-if="relatedPage.items.length < relatedPage.pagination.total" class="text-body-2 mb-2">
            {{ relatedPage.items.length }} sur {{ relatedPage.pagination.total }}
          </p>
          <v-list lines="one" rounded>
            <v-list-item
              v-for="related in relatedPage.items"
              :key="related.id"
              :prepend-avatar="getImageUrl(related.image) || undefined"
              :title="related.title ?? related.name"
              :to="`${paths[association.type]}/${related.id}`"
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

  const route = useRoute()
  const router = useRouter()
  const deezerStore = useDeezerStore()
  // La page recrée la fiche quand l'identifiant change.
  const id = /^[1-9]\d*$/.test(route.params.id) ? Number(route.params.id) : null
  const labels = { albums: 'Album', artistes: 'Artiste', tracks: 'Titre' }
  const paths = { albums: '/album', artistes: '/artiste', tracks: '/titre' }
  const label = labels[props.type]
  const item = computed(() => deezerStore.getItemById(props.type, id))
  const displayName = computed(() => item.value?.title ?? item.value?.name)

  const isLoading = ref(true)
  const detailError = ref(false)
  const isRelatedLoading = ref(false)
  const relatedError = ref(false)
  const relatedPage = ref(null)
  const controller = new AbortController()

  function formatExplicit (value) {
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  }

  function getFields (entry) {
    if (props.type === 'albums') {
      return [
        { label: 'Artiste', value: entry.artist },
        { label: 'Date de sortie', value: formatDate(entry.releaseDate) },
        { label: 'Type de parution', value: entry.recordType },
        { label: 'Contenu explicite', value: formatExplicit(entry.explicit) },
      ]
    }

    if (props.type === 'artistes') {
      return [
        { label: 'Genres', value: entry.genres?.join(', ') },
        { label: 'Nombre d’albums sur Deezer', value: entry.nbAlbum?.toLocaleString('fr-CH') },
        { label: 'Fans sur Deezer', value: entry.nbFan?.toLocaleString('fr-CH') },
      ]
    }

    return [
      { label: 'Artiste', value: entry.artist },
      { label: 'Album', value: entry.album },
      { label: 'Durée', value: formatDuration(entry.duration) },
      { label: 'Indice de popularité', value: entry.rank?.toLocaleString('fr-CH') },
      { label: 'Contenu explicite', value: formatExplicit(entry.explicit) },
    ]
  }

  const fields = computed(() => {
    if (!item.value) return []
    return getFields(item.value).filter(field => field.value != null && field.value !== '')
  })

  const association = computed(() => {
    const entry = item.value
    if (!entry) return

    if (props.type === 'albums' && entry.title && entry.artist) {
      return {
        type: 'tracks',
        heading: 'Titres de cet album dans le catalogue',
        emptyMessage: 'Aucun titre de cet album dans le catalogue.',
        params: { album: entry.title, artist: entry.artist },
      }
    }

    if (props.type === 'artistes' && entry.name) {
      return {
        type: 'albums',
        heading: 'Albums de cet artiste dans le catalogue',
        emptyMessage: 'Aucun album de cet artiste dans le catalogue.',
        params: { artist: entry.name },
      }
    }

    if (props.type === 'tracks' && entry.artist) {
      return {
        type: 'artistes',
        heading: 'Artiste dans le catalogue',
        emptyMessage: 'Cet artiste ne figure pas dans le catalogue.',
        params: { name: entry.artist },
      }
    }
  })

  function goBack () {
    if (router.options.history.state.back) {
      router.back()
    } else {
      router.push(paths[props.type])
    }
  }

  async function loadDetail () {
    isLoading.value = true
    detailError.value = false

    try {
      if (!Number.isSafeInteger(id)) return
      await deezerStore.fetchItem(props.type, id, controller.signal)
    } catch (error) {
      detailError.value = error.response?.status !== 404
      return
    } finally {
      isLoading.value = false
    }

    await loadRelated()
  }

  async function loadRelated () {
    if (!association.value || controller.signal.aborted) return
    const { type, params } = association.value
    isRelatedLoading.value = true
    relatedError.value = false

    try {
      relatedPage.value = await deezerStore.fetchCataloguePage(
        type, { ...params, page: 1, limit: 12 }, controller.signal,
      )
    } catch {
      relatedError.value = true
    } finally {
      isRelatedLoading.value = false
    }
  }

  onMounted(loadDetail)
  onBeforeUnmount(() => controller.abort())
</script>
