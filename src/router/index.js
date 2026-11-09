/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior (_to, _from, savedPosition) {
    // Une nouvelle fiche commence en haut ; Précédent peut restaurer la position.
    return savedPosition ?? { top: 0 }
  },
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    try {
      if (localStorage.getItem('vuetify:dynamic-reload')) {
        console.error('Dynamic import error, reloading page did not fix it', err)
      } else {
        // Enregistrer avant de recharger pour éviter une boucle si le stockage est refusé.
        localStorage.setItem('vuetify:dynamic-reload', 'true')
        location.assign(to.fullPath)
      }
    } catch {
      console.error('Impossible de recharger automatiquement cette page.', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  try {
    localStorage.removeItem('vuetify:dynamic-reload')
  } catch {
    // Le refus du stockage ne doit pas interrompre la navigation.
  }
}).catch(error => {
  console.error('Impossible d’initialiser la navigation.', error)
})

export default router
