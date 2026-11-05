<template>
  <!--
  Bouton cœur pour ajouter/retirer des favoris
    * @click.stop.prevent empêche la navigation si la carte est un lien (:to)
    * .stop arrête la propagation de l'événement (ne remonte pas à la carte)
    * .prevent empêche le comportement par défaut du router-link
    * L'icône change selon l'état (cœur plein ou vide), la couleur aussi
  -->
  <v-btn
    :aria-label="`${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} : ${item.title ?? item.name}`"
    :aria-pressed="isFavorite"
    :class="{ 'favorite-active': isFavorite }"
    :color="isFavorite ? 'red' : ''"
    :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
    variant="text"
    @click.stop.prevent="deezerStore.toggleFavorite(type, item)"
  />
</template>

<script setup>
  import useDeezerStore from '@/stores/deezerStore.js'

  // Props : ce que la carte envoie au bouton
  const props = defineProps({
    // 'albums', 'artistes' ou 'tracks'
    type: {
      type: String,
      required: true,
    },
    // L'album, l'artiste ou le titre concerné
    item: {
      type: Object,
      required: true,
    },
  })

  const deezerStore = useDeezerStore()

  const isFavorite = computed(() => deezerStore.isFavorite(props.type, props.item))
</script>

<style scoped>
.favorite-active {
  animation: heartbeat 0.6s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .favorite-active {
    animation: none;
  }
}
</style>
