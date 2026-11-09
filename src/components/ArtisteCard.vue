<template>
  <v-card
    class="h-100"
    hover
    :to="`/artiste/${artiste.id}`"
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

    <!-- Ces statistiques sont facultatives dans l'API. Zéro reste une valeur valide. -->
    <v-card-text class="d-flex flex-wrap align-center ga-3">
      <span v-if="Number.isFinite(artiste.nbAlbum)" class="d-inline-flex align-center">
        <v-icon
          class="mr-1"
          icon="mdi-album"
          size="small"
        />
        {{ artiste.nbAlbum }} album{{ artiste.nbAlbum > 1 ? 's' : '' }}
      </span>

      <span v-if="Number.isFinite(artiste.nbFan)" class="d-inline-flex align-center">
        <v-icon
          class="mr-1"
          icon="mdi-account-multiple"
          size="small"
        />
        {{ artiste.nbFan.toLocaleString('fr-CH') }} fan{{ artiste.nbFan > 1 ? 's' : '' }}
      </span>
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
