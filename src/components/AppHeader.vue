<template>
  <v-app-bar flat>
    <v-container class="d-flex align-center">
      <v-avatar
        class="mr-4 pa-0 cursor-pointer"
        image="@/assets/logo.svg"
        size="64"
        @click="$router.push('/')"
      />

      <v-toolbar-title>deezer</v-toolbar-title>

      <v-btn
        v-for="link in menuItems"
        :key="link.title"
        :icon="link.icon"
        :to="link.path"
      />
    </v-container>
  </v-app-bar>
</template>

<script setup>
  let menuItems
  // eslint-disable-next-line prefer-const
  menuItems = [
    { title: 'Accueil', path: '/', icon: '@/assets/logo.svg' },
    { title: 'Favoris', path: '/favoris', icon: '@/assets/logo.png' },
    { title: 'À propos', path: '/a-propos', icon: '@/assets/logo.png' },
  ]
</script>
