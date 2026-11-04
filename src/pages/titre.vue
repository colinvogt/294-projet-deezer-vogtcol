<template>
  <catalogue-liste
    empty-message="Aucun titre ne correspond à votre recherche."
    filter-field="artist"
    filter-label="Filtrer par artiste"
    search-label="Rechercher un titre, un artiste ou un album"
    sort-field="title"
    title="Titres"
    type="tracks"
  >
    <template #default="{ item }">
      <titre-card :track="item" />
    </template>
  </catalogue-liste>
</template>
