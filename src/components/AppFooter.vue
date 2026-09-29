<script setup>
</script>
<template>
  <v-footer>
    <div class="px-4 text-center w-100">
      <slot>{{ new Date().getFullYear() }} - Pokédex</slot>
    </div>
  </v-footer>
</template>
