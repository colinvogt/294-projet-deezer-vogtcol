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

    <!-- Actions de la carte : le bouton cœur est poussé à droite par v-spacer -->
    <v-card-actions>
      <v-spacer />
      <favorite-button
        :item="album"
        type="albums"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import FavoriteButton from '@/components/FavoriteButton.vue'
  import { formatDate } from '@/utils/formatCatalogue.js'
  import { getImageUrl } from '@/utils/imageUrl.js'

  defineProps({
    album: {
      type: Object,
      required: true,
    },
  })
</script>
