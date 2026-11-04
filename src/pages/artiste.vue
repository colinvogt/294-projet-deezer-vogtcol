<template>
  <catalogue-liste
    empty-message="Aucun artiste ne correspond à votre recherche."
    filter-field="genres"
    filter-label="Filtrer par genre"
    search-label="Rechercher un artiste"
    sort-field="name"
    title="Artistes"
    type="artistes"
  >
    <template #default="{ item }">
      <artiste-card :artiste="item" />
    </template>
  </catalogue-liste>
</template>
