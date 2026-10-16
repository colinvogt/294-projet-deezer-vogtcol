<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Projet deezer (titre provisoire)
    </h1>

    <v-row>
      <ul>
        <li
          v-for="champ in albums"
          :key="champ.id"
        >
          {{ champ.title }}
        </li>
      </ul>
    </v-row>
  </v-container>
</template>

<script setup>
  // Import du store et de storeToRefs
  import { storeToRefs } from 'pinia'
  import { useAlbumStore } from '@/stores/albumStore'

  // Instancier le store
  const albumStore = useAlbumStore()

  // Destructurer le state en gardant la réactivité
  // storeToRefs convertit chaque propriété du state en ref
  const { albums } = storeToRefs(albumStore)
</script>
