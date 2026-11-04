<template>
  <v-card
    class="h-100"
    hover
    :to="`/titre/${track.id}`"
  >
    <v-img
      :alt="track.title"
      cover
      height="200"
      :src="getImageUrl(track.image)"
    />
    <v-card-title>{{ track.title }}</v-card-title>
    <v-card-subtitle>{{ track.artist }}</v-card-subtitle>

    <!-- Album du titre -->
    <v-card-text class="pb-0 d-flex align-center">
      <v-icon
        class="mr-1"
        icon="mdi-album"
        size="small"
      />
      <span class="text-truncate">{{ track.album }}</span>
    </v-card-text>

    <!-- Durée et mention explicit -->
    <v-card-text class="d-flex align-center">
      <v-icon
        class="mr-1"
        icon="mdi-clock-outline"
        size="small"
      />
      <span>{{ formatDuration(track.duration) }}</span>
      <v-chip
        v-if="track.explicit"
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
        :item="track"
        type="tracks"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import FavoriteButton from '@/components/FavoriteButton.vue'
  import { formatDuration } from '@/utils/formatCatalogue.js'
  import { getImageUrl } from '@/utils/imageUrl.js'

  defineProps({
    track: {
      type: Object,
      required: true,
    },
  })
</script>
