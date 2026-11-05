<template>
  <v-row class="mb-4">
    <!-- Recherche -->
    <v-col
      cols="12"
      md="4"
      sm="6"
    >
      <v-text-field
        clearable
        density="compact"
        hide-details
        :label="searchLabel"
        :model-value="search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        @update:model-value="$emit('change-search', $event)"
      />
    </v-col>

    <!-- Filtre -->
    <v-col
      cols="12"
      md="4"
      sm="6"
    >
      <v-combobox
        clearable
        density="compact"
        hint="Choisissez une suggestion ou saisissez une valeur puis Entrée."
        :items="items"
        :label="filterLabel"
        :model-value="filter"
        persistent-hint
        prepend-inner-icon="mdi-filter"
        :return-object="false"
        variant="outlined"
        @update:model-value="$emit('change-filter', $event)"
      />
    </v-col>

    <!-- Bouton de tri : alterne entre A → Z et Z → A -->
    <v-col
      class="d-flex align-start"
      cols="12"
      md="4"
    >
      <v-btn
        height="40"
        :prepend-icon="sortOrder === 'asc'
          ? 'mdi-sort-alphabetical-ascending'
          : 'mdi-sort-alphabetical-descending'"
        variant="outlined"
        @click="$emit('toggle-sort')"
      >
        Tri {{ sortOrder === 'asc' ? 'A → Z' : 'Z → A' }} (affichés)
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
// Props : les données envoyées par la page (parent)
  defineProps({
    // Texte tapé dans la recherche
    search: {
      type: String,
      default: '',
    },
    // Texte affiché dans la barre de recherche
    searchLabel: {
      type: String,
      default: 'Rechercher',
    },
    // Valeur choisie dans le filtre (null = pas de filtre)
    filter: {
      type: String,
      default: null,
    },
    // Texte affiché dans le filtre
    filterLabel: {
      type: String,
      default: 'Filtrer',
    },
    // Choix proposés dans le filtre
    items: {
      type: Array,
      default: () => [],
    },
    // Ordre du tri : 'asc' ou 'desc'
    sortOrder: {
      type: String,
      default: 'asc',
    },
  })

  // Emits : les événements envoyés à la page (parent)
  defineEmits(['change-search', 'change-filter', 'toggle-sort'])
</script>
