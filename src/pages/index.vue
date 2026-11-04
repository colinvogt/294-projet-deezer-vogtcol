<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Vogtunes
    </h1>

    <section aria-labelledby="coups-de-coeur">
      <h2 id="coups-de-coeur" class="text-h4 mb-6">
        Coups de cœur
      </h2>

      <v-progress-linear
        v-if="isLoading"
        aria-label="Chargement des coups de cœur"
        class="mb-6"
        indeterminate
      />

      <v-alert
        v-if="hasError"
        class="mb-6"
        type="warning"
        variant="tonal"
      >
        Impossible de charger tous les coups de cœur.
        <v-btn class="ml-2" variant="text" @click="loadSelection">
          Réessayer
        </v-btn>
      </v-alert>

      <section v-for="section in featuredSections" :key="section.type" class="mb-8">
        <h3 class="text-h5 mb-4">
          {{ section.title }}
        </h3>

        <v-row>
          <v-col
            v-for="item in section.items"
            :key="item.id"
            cols="12"
            md="4"
            sm="6"
          >
            <component :is="section.card" v-bind="{ [section.cardProp]: item }" />
          </v-col>
        </v-row>
      </section>
    </section>
  </v-container>
</template>

<script setup>
  import AlbumCard from '@/components/AlbumCard.vue'
  import ArtisteCard from '@/components/ArtisteCard.vue'
  import TitreCard from '@/components/TitreCard.vue'
  import useDeezerStore from '@/stores/deezerStore.js'

  // La sélection de l'accueil est définie par les ID du catalogue.
  const selection = [
    {
      type: 'albums',
      title: 'Albums',
      ids: [330, 329, 403],
      card: AlbumCard,
      cardProp: 'album',
    },
    {
      type: 'artistes',
      title: 'Artistes',
      ids: [206, 169, 203],
      card: ArtisteCard,
      cardProp: 'artiste',
    },
    {
      type: 'tracks',
      title: 'Titres',
      ids: [548, 1316, 683],
      card: TitreCard,
      cardProp: 'track',
    },
  ]

  const deezerStore = useDeezerStore()
  const isLoading = ref(true)
  const hasError = ref(false)

  const featuredSections = computed(() => selection.map(section => ({
    ...section,
    items: section.ids.map(id => deezerStore.getItemById(section.type, id)).filter(Boolean),
  })).filter(section => section.items.length > 0))

  async function loadSelection () {
    isLoading.value = true
    hasError.value = false
    const requests = selection.flatMap(section =>
      section.ids.map(id => deezerStore.fetchItem(section.type, id)),
    )
    const results = await Promise.allSettled(requests)
    hasError.value = results.some(result => result.status === 'rejected')
    isLoading.value = false
  }

  onMounted(loadSelection)
</script>
