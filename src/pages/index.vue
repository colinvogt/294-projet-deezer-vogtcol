<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Projet deezer (titre provisoire)
    </h1>

    <v-row>
      <ul>
        <li
          v-for="champ in champions"
          :key="champ.id"
        >
          {{ champ.name }}
        </li>
      </ul>
    </v-row>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'

  const champions = ref([])

  onMounted(async () => {
    const response = await fetch('https://apis.divtec.me/api/lol/champions')
    const json = await response.json()
    champions.value = json.data
  })
</script>
