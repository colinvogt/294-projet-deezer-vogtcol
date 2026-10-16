import { defineStore } from 'pinia'

/**
 * Store Pinia pour gérer les données des Albums.
 * Centralise les appels API et partage les données entre les pages.
 */
export const useAlbumStore = defineStore('album', {
  /**
   * State — les données brutes du store.
   * Retourne une fonction qui retourne un objet (comme data() dans Options API).
   */
  state: () => ({
    // Liste de tous les Albums chargés depuis l'API
    albums: [],
    // Liste des artistes de l'album
    artistes: [],
    // Indicateur de chargement — true pendant les appels API
    isLoading: false,
    // Message d'erreur en cas de problème
    error: null,
  }),

  /**
   * Getters — propriétés calculées basées sur le state.
   * Équivalent de computed() dans un composant.
   */
  getters: {
    /**
     * Nombre total d'album dans le store.
     * @param {Object} state - Le state du store
     * @returns {number}
     */
    totalAlbum: state => {
      return state.albums.length
    },

    /**
     * Trouve un Album par son identifiant.
     * Retourne une fonction (getter avec paramètre).
     * @param {Object} state - Le state du store
     * @returns {function(string): Object|undefined}
     */
    getAlbumById: state => {
      return albumId => {
        return state.albums.find(album => album.id === albumId)
      }
    },
  },

  /**
   * Actions — méthodes qui modifient le state.
   * Peuvent être asynchrones (appels API).
   * On accède au state avec `this`.
   */
  actions: {
    /**
     * Charge tous les albums depuis l'API.
     * Note : ne gère pas isLoading — c'est init() qui s'en charge.
     */
    async fetchAlbums () {
      const response = await fetch('https://apis.divtec.me/api/deezer/albums')

      // Vérifier que la réponse est OK (status 200-299)
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`)
      }

      this.albums = await response.json()
      console.log('Pokémon chargés :', this.albums.length)
    },

    /**
     * Charge tous les Artistes des albums depuis l'API.
     * Note : ne gère pas isLoading — c'est init() qui s'en charge.
     */
    async fetchArtiste () {
      const response = await fetch('https://apis.divtec.me/api/deezer/artists')

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`)
      }

      this.artistes = await response.json()
      console.log('Artistes chargés :', this.artistes.length)
    },

    /**
     * Initialise le store : charge les Albume et leurs artistes en parallèle.
     * À appeler une seule fois au démarrage de l'application (dans App.vue).
     */
    async init () {
      console.log('Initialisation du store Pokémon...')

      this.isLoading = true
      this.error = null

      try {
        // Promise.all exécute les deux requêtes en parallèle
        // Plus rapide que de les faire l'une après l'autre
        await Promise.all([
          this.fetchAlbums(),
          this.fetchArtiste(),
        ])

        console.log('Store Album initialisé')
      } catch (error) {
        this.error = 'Erreur lors du chargement des données'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
