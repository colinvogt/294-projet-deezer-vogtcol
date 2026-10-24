<template>
  <v-card
    hover
    :to="`/pokemon/${album.id}`"
  >
    <v-img
      :alt="album.title"
      cover
      height="200"
      :src="getImageUrl(album.image)"
    />
    <v-card-title>{{ album.title }}</v-card-title>
    <v-card-subtitle>Artiste {{ album.artiste }}</v-card-subtitle>
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
</script>
