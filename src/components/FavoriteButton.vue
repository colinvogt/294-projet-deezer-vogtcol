<template>
  <!--
  Bouton cœur pour ajouter/retirer des favoris
    * @click.stop.prevent empêche la navigation si la carte est un lien (:to)
    * .stop arrête la propagation de l'événement (ne remonte pas à la carte)
    * .prevent empêche le comportement par défaut du router-link
    * L'icône change selon l'état (cœur plein ou vide), la couleur aussi
  -->
  <v-btn
    :class="{ 'favorite-active': deezerStore.isFavorite(type, item) }"
    :color="deezerStore.isFavorite(type, item) ? 'red' : ''"
    :icon="deezerStore.isFavorite(type, item) ? 'mdi-heart' : 'mdi-heart-outline'"
    variant="text"
    @click.stop.prevent="handleToggleFavorite()"
  />

  <!-- Message de confirmation (disparaît après 2 secondes) -->
  <v-snackbar
    v-model="showSnackbar"
    color="primary"
    :timeout="2000"
  >
    {{ snackbarMessage }}
  </v-snackbar>
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

  // Snackbar de confirmation
  const showSnackbar = ref(false)
  const snackbarMessage = ref('')

  // Toggle le favori et affiche le snackbar
  function handleToggleFavorite() {
    const wasFavorite = deezerStore.isFavorite(props.type, props.item)
    deezerStore.toggleFavorite(props.type, props.item)
    snackbarMessage.value = wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
    showSnackbar.value = true
  }
</script>

<style scoped>
/* Battement du cœur quand l'élément devient favori */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.5);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(2);
  }
}

.favorite-active {
  animation: heartbeat 0.6s ease-in-out;
}
</style>
