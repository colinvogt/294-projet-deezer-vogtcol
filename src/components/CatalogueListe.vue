<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      {{ title }}
      <span aria-live="polite" class="text-subtitle-1">({{ items.length }} / {{ pagination.total }})</span>
    </h1>

    <barre-recherche
      :filter="selectedFilter"
      :filter-label="filterLabel"
      :items="filterOptions"
      :search="searchQuery"
      :search-label="searchLabel"
      :sort-order="sortOrder"
      @change-filter="selectedFilter = $event"
      @change-search="searchQuery = $event"
      @toggle-sort="toggleSort"
    />

    <v-row v-if="isLoading && items.length === 0" aria-label="Chargement du catalogue">
      <v-col
        v-for="n in 8"
        :key="n"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <v-skeleton-loader height="350" type="image, article" />
      </v-col>
    </v-row>

    <v-row v-else-if="items.length > 0">
      <v-col
        v-for="item in sortedItems"
        :key="item.id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        <slot :item="item" />
      </v-col>
    </v-row>

    <v-alert v-else-if="!error" class="mb-6" type="info" variant="tonal">
      {{ emptyMessage }}
    </v-alert>

    <v-alert v-if="error" class="mt-6" type="error" variant="tonal">
      Impossible de charger les résultats. Vérifiez votre connexion.
      <v-btn class="ml-2" variant="text" @click="loadNextPage">
        Réessayer
      </v-btn>
    </v-alert>

    <div v-if="hasMore && !error" class="text-center mt-6">
      <v-btn :loading="isLoading" variant="outlined" @click="loadNextPage">
        Charger la suite
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
  import BarreRecherche from '@/components/BarreRecherche.vue'
  import useDeezerStore from '@/stores/deezerStore.js'

  const props = defineProps({
    emptyMessage: { type: String, required: true },
    filterField: { type: String, required: true },
    filterLabel: { type: String, required: true },
    searchLabel: { type: String, required: true },
    sortField: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
  })

  const pageSize = 24
  const searchDelay = 300
  const deezerStore = useDeezerStore()
  const items = ref([])
  const pagination = ref({ page: 0, pages: 0, total: 0 })
  const filterOptions = ref([])
  const searchQuery = ref('')
  const selectedFilter = ref(null)
  const sortOrder = ref('asc')
  const isLoading = ref(true)
  const error = ref(false)

  let request
  let searchTimer

  const hasMore = computed(() => pagination.value.page < pagination.value.pages)

  const sortedItems = computed(() => {
    const sorted = [...items.value]
    sorted.sort((a, b) => {
      const nameA = a[props.sortField] ?? ''
      const nameB = b[props.sortField] ?? ''
      const comparison = nameA.localeCompare(nameB, 'fr')
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
    return sorted
  })

  function toggleSort () {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  async function loadPage (page) {
    const controller = new AbortController()
    request = controller
    isLoading.value = true
    error.value = false

    const params = {
      page,
      limit: pageSize,
      q: searchQuery.value?.trim() || undefined,
      [props.filterField]: selectedFilter.value ?? undefined,
    }

    try {
      const result = await deezerStore.fetchCataloguePage(props.type, params, controller.signal)
      if (controller.signal.aborted) return

      const uniqueItems = new Map(items.value.map(item => [item.id, item]))
      for (const item of result.items) {
        uniqueItems.set(item.id, item)
      }

      items.value = [...uniqueItems.values()]
      pagination.value = result.pagination

      // Les choix restent disponibles lorsque la recherche renvoie moins de résultats.
      const newOptions = result.items.flatMap(item => item[props.filterField] ?? [])
      const options = [...new Set([...filterOptions.value, ...newOptions.filter(Boolean)])]
      options.sort((a, b) => a.localeCompare(b, 'fr'))
      filterOptions.value = options
    } catch {
      if (!controller.signal.aborted) error.value = true
    } finally {
      if (!controller.signal.aborted) isLoading.value = false
    }
  }

  function loadNextPage () {
    if (!isLoading.value) loadPage(pagination.value.page + 1)
  }

  watch([searchQuery, selectedFilter], () => {
    clearTimeout(searchTimer)
    request?.abort()
    items.value = []
    pagination.value = { page: 0, pages: 0, total: 0 }
    isLoading.value = true
    error.value = false
    searchTimer = setTimeout(() => loadPage(1), searchDelay)
  }, { flush: 'sync' })

  onMounted(() => loadPage(1))
  onBeforeUnmount(() => {
    clearTimeout(searchTimer)
    request?.abort()
  })
</script>
