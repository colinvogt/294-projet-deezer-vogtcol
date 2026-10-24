import { defineStore } from 'pinia'
import api from '@/plugins/axios.js'

/**
 * Store Pinia pour gérer les données des Albums.
 * Centralise les appels API et partage les données entre les pages.
 */
const useAlbumStore = defineStore('album', {
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
     * Initialise le store : charge les Albume et leurs artistes en parallèle.
     * À appeler une seule fois au démarrage de l'application (dans App.vue).
     */
    async init () {
      console.log('Initialisation du store Pokémon...')
      this.isLoading = true

      try {
        // Promise.all exécute les deux requêtes en parallèle
        // Plus rapide que de les faire l'une après l'autre
        await Promise.all([
          this.fetchAlbums({ withLoarder: false }),
          this.fetchArtiste({ withLoarder: false }),
        ])

        console.log('Store Album initialisé')
      } catch (error) {
        console.error('Erreur lors du chargement des données', error.message)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Charge tous les albums depuis l'API.
     * Note : ne gère pas isLoading — c'est init() qui s'en charge.
     */
    async fetchAlbums ({ withLoader = true } = {}) {
      if (withLoader) {
        this.isLoading = true
      }

      try {
        const response = await api.get('/albums')

        this.albums = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des types:', error.message)
        this.types = []
      } finally {
        if (withLoader) {
          this.isLoading = false
        }
      }
    },

    /**
     * Charge tous les Artistes des albums depuis l'API.
     * Note : ne gère pas isLoading — c'est init() qui s'en charge.
     */
    async fetchArtiste ({ withLoader = true } = {}) {
      if (withLoader) {
        this.isLoading = true
      }

      try {
        const response = await api.get('/artistes')

        this.pokemons = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des Pokémon:', error.message)
        this.pokemons = []
      } finally {
        if (withLoader) {
          this.isLoading = false
        }
      }
    },
  },
})
export default useAlbumStore
