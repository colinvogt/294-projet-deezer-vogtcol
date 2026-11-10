<template>
  <fiche-catalogue :key="$route.params.id" type="tracks" />
</template>

<script setup>
  import FicheCatalogue from '@/components/FicheCatalogue.vue'
</script>
