<template>
  <catalogue-liste
    empty-message="Aucun album ne correspond à votre recherche."
    filter-field="artist"
    filter-label="Filtrer par artiste"
    search-label="Rechercher un album ou un artiste"
    title="Albums"
    type="albums"
  >
    <template #default="{ item }">
      <album-card :album="item" />
    </template>
  </catalogue-liste>
</template>
