<template>
  <v-card
    class="h-100"
    hover
    :to="`/Album/${album.id}`"
  >
    <v-img
      :alt="album.title"
      cover
      height="200"
      :src="getImageUrl(album.image)"
    />
    <v-card-title>{{ album.title }}</v-card-title>
    <v-card-subtitle>{{ album.artist }}</v-card-subtitle>

    <v-card-text class="d-flex align-center">
      <span>{{ formatDate(album.releaseDate) }}</span>
      <v-chip
        class="ml-2 text-capitalize"
        size="x-small"
      >
        {{ album.recordType }}
      </v-chip>
      <v-chip
        v-if="album.explicit"
        class="ml-2"
        size="x-small"
      >
        Explicit
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { getImageUrl } from '@/utils/imageUrl.js'

  defineProps({
    album: {
      type: Object,
      required: true,
    },
  })
  // "2025-03-28" -> "28.03.2025"
  function formatDate (date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString('fr-CH')
  }
</script>
