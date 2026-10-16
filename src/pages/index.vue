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
  import { useAlbumStore } from '@/stores/albumStore'
  import { storeToRefs } from 'pinia'

  // Instancier le store
  const Store = useAlbumStore()

  onMounted(async () => {
    const response = await fetch('https://apis.divtec.me/api/deezer/albums')
    const json = await response.json()
    albums.value = json.data
  })
</script>
