<template>
  <v-app-bar flat>
    <v-container
      class="d-flex align-center"
      :class="{ 'justify-space-between px-2': isCompact }"
    >
      <v-avatar
        class="pa-0 cursor-pointer flex-shrink-0"
        :class="isCompact ? 'mr-2' : 'mr-4'"
        image="@/assets/logo.png"
        :size="isCompact ? 36 : 64"
        @click="$router.push('/')"
      />

      <v-toolbar-title v-if="!isCompact">Vogtunes</v-toolbar-title>

      <nav aria-label="Navigation principale" class="d-flex align-center">
        <v-btn
          v-for="link in menuItems"
          :key="link.title"
          :aria-label="link.title"
          :icon="isCompact ? link.icon : false"
          :prepend-icon="isCompact ? undefined : link.icon"
          :size="isCompact ? 44 : undefined"
          :text="isCompact ? undefined : link.title"
          :title="link.title"
          :to="link.path"
        />
      </nav>
    </v-container>
  </v-app-bar>
</template>

<script setup>
  import { useDisplay } from 'vuetify'

  const { smAndDown: isCompact } = useDisplay()

  const menuItems = [
    { title: 'Accueil', path: '/', icon: 'mdi-home' },
    { title: 'Albums', path: '/album', icon: 'mdi-album' },
    { title: 'Artistes', path: '/artiste', icon: 'mdi-account-music' },
    { title: 'Titres', path: '/titre', icon: 'mdi-music-note' },
    { title: 'Favoris', path: '/favoris', icon: 'mdi-heart' },
  ]
</script>
