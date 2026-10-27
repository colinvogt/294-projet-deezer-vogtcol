<template>
  <v-app-bar flat>
    <v-container class="d-flex align-center">
      <v-avatar
        class="mr-4 pa-0 cursor-pointer"
        image="@/assets/logo.png"
        size="64"
        @click="$router.push('/')"
      />

      <v-toolbar-title>deezer</v-toolbar-title>

      <v-btn
        v-for="link in menuItems"
        :key="link.title"
        :prepend-icon="link.icon"
        :title="link.title"
        :to="link.path"
      >
        {{ link.title }}
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup>
  const menuItems = [
    { title: 'Accueil', path: '/', icon: 'mdi-home' },
    { title: 'Albums', path: '/album', icon: 'mdi-album' },
    { title: 'Artistes', path: '/artiste', icon: 'mdi-account-music' },
    { title: 'Titres', path: '/titre', icon: 'mdi-music-note' },
    { title: 'Favoris', path: '/favoris', icon: 'mdi-heart' },
  ]
</script>
