<template>
  <v-card
    class="h-100"
    hover
  >
    <v-img
      :alt="artiste.name"
      cover
      height="200"
      :src="getImageUrl(artiste.image)"
    />
    <v-card-title>{{ artiste.name }}</v-card-title>

    <!-- Genres : une pastille par genre -->
    <v-card-text class="pb-0">
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="genre in artiste.genres"
          :key="genre"
          size="x-small"
        >
          {{ genre }}
        </v-chip>
      </div>
    </v-card-text>

    <!-- Nombre d'albums et de fans -->
    <v-card-text class="d-flex align-center">
      <v-icon
        class="mr-1"
        icon="mdi-album"
        size="small"
      />
      <span>{{ artiste.nbAlbum }} album{{ artiste.nbAlbum > 1 ? 's' : '' }}</span>

      <v-icon
        class="ml-4 mr-1"
        icon="mdi-account-multiple"
        size="small"
      />
      <span>{{ artiste.nbFan.toLocaleString('fr-CH') }} fan{{ artiste.nbFan > 1 ? 's' : '' }}</span>
    </v-card-text>

    <!-- Actions de la carte : le bouton cœur est poussé à droite par v-spacer -->
    <v-card-actions>
      <v-spacer />
      <favorite-button
        :item="artiste"
        type="artistes"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import FavoriteButton from '@/components/FavoriteButton.vue'
  import { getImageUrl } from '@/utils/imageUrl.js'

  defineProps({
    artiste: {
      type: Object,
      required: true,
    },
  })
</script>
