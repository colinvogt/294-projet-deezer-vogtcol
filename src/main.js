/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Importations
import { createApp } from 'vue' // Importation de la fonction createApp de Vue
import { registerPlugins } from '@/plugins' // Importation des plugins Vuetify
import App from './App.vue' // Importation du composant principal de l'application

// Création de l'application Vue
const app = createApp(App)
// Ajout des plugins à l'application app
registerPlugins(app)
// Montage de l'application dans l'élément HTML avec l'ID "app" sur la page index.html
app.mount('#app')
