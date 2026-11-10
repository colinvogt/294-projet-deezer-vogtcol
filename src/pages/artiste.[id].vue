<template>
  <fiche-catalogue :key="$route.params.id" type="artistes" />
</template>

<script setup>
  import FicheCatalogue from '@/components/FicheCatalogue.vue'
</script>
