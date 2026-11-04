import { defineStore } from 'pinia'
import api from '@/plugins/axios.js'

const endpoints = { albums: 'albums', artistes: 'artists', tracks: 'tracks' }

/**
 * Store Pinia pour gérer les données Deezer (albums, artistes, titres).
 * Centralise les appels API, les favoris et partage les données entre les pages.
 */
const useDeezerStore = defineStore('deezer', {
  state: () => ({
    albums: [],
    artistes: [],
    tracks: [],
    isLoading: false,
    itemsById: { albums: {}, artistes: {}, tracks: {} },
    // Favoris : on ne garde que les IDs, rangés par type
    // (un album, un artiste et un titre peuvent avoir le même ID)
    favorites: {
      albums: [],
      artistes: [],
      tracks: [],
    },
  }),

  getters: {
    totalAlbum: state => state.albums.length,

    getItemById: state => (type, id) => {
      return state[type].find(item => String(item.id) === String(id)) ?? state.itemsById[type][id]
    },

    getAlbumById () {
      return albumId => {
        return this.getItemById('albums', albumId)
      }
    },

    getArtistById () {
      return artistId => {
        return this.getItemById('artistes', artistId)
      }
    },

    // Nombre total de favoris (albums + artistes + titres)
    totalFavorites: state => {
      return state.favorites.albums.length
        + state.favorites.artistes.length
        + state.favorites.tracks.length
    },

    // Vérifie si un élément est favori
    // type = 'albums', 'artistes' ou 'tracks'
    isFavorite: state => {
      return (type, item) => {
        return state.favorites[type].some(id => String(id) === String(item.id))
      }
    },

    // Retourne les objets complets (pas juste les IDs)
    getFavoriteAlbums () {
      const favoriteAlbums = this.favorites.albums.map(favoriteId => {
        return this.getItemById('albums', favoriteId)
      })
      return favoriteAlbums.filter(album => album !== undefined)
    },

    getFavoriteArtistes () {
      const favoriteArtistes = this.favorites.artistes.map(favoriteId => {
        return this.getItemById('artistes', favoriteId)
      })
      return favoriteArtistes.filter(artiste => artiste !== undefined)
    },

    getFavoriteTracks () {
      const favoriteTracks = this.favorites.tracks.map(favoriteId => {
        return this.getItemById('tracks', favoriteId)
      })
      return favoriteTracks.filter(track => track !== undefined)
    },
  },

  actions: {
    async init () {
      this.isLoading = true

      try {
        await Promise.all([
          this.fetchAlbums({ withLoader: false }),
          this.fetchArtiste({ withLoader: false }),
          this.fetchTracks({ withLoader: false }),
        ])
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchAlbums ({ withLoader = true } = {}) {
      if (withLoader) {
        this.isLoading = true
      }

      try {
        const response = await api.get('/albums?limit=100')
        // L'API renvoie { data: [...] } : les albums sont dans response.data.data
        this.albums = response.data.data
      } catch (error) {
        console.error('Erreur lors du chargement des albums:', error.message)
        this.albums = []
      } finally {
        if (withLoader) {
          this.isLoading = false
        }
      }
    },

    async fetchArtiste ({ withLoader = true } = {}) {
      if (withLoader) {
        this.isLoading = true
      }

      try {
        const response = await api.get('/artists?limit=100')
        this.artistes = response.data.data ?? response.data
      } catch (error) {
        console.error('Erreur lors du chargement des artistes:', error.message)
        this.artistes = []
      } finally {
        if (withLoader) {
          this.isLoading = false
        }
      }
    },

    async fetchTracks ({ withLoader = true } = {}) {
      if (withLoader) {
        this.isLoading = true
      }

      try {
        const response = await api.get('/tracks?limit=100')
        this.tracks = response.data.data ?? response.data
      } catch (error) {
        console.error('Erreur lors du chargement des titres:', error.message)
        this.tracks = []
      } finally {
        if (withLoader) {
          this.isLoading = false
        }
      }
    },

    async fetchItem (type, id) {
      const numericId = Number(id)
      if (!Number.isSafeInteger(numericId) || numericId <= 0) {
        throw new Error('Identifiant invalide.')
      }

      const cachedItem = this.getItemById(type, numericId)
      if (cachedItem) {
        return cachedItem
      }

      const { data } = await api.get(`/${endpoints[type]}/${numericId}`, { timeout: 10_000 })
      if (data?.id !== numericId) {
        throw new Error('Réponse inattendue lors du chargement de cet élément.')
      }

      this.itemsById[type][numericId] = data
      return data
    },

    async fetchFavorites () {
      const requests = Object.keys(endpoints).flatMap(type =>
        this.favorites[type].map(id => this.fetchItem(type, id)),
      )
      await Promise.allSettled(requests)
    },

    // Charge les favoris depuis le localStorage
    loadFavorites () {
      try {
        const savedFavorites = localStorage.getItem('deezer_favorites')
        if (savedFavorites) {
          const data = JSON.parse(savedFavorites)
          this.favorites = {
            albums: Array.isArray(data.albums) ? data.albums : [],
            artistes: Array.isArray(data.artistes) ? data.artistes : [],
            tracks: Array.isArray(data.tracks) ? data.tracks : [],
          }
          console.log('Favoris chargés :', this.totalFavorites, 'éléments')
        } else {
          this.favorites = { albums: [], artistes: [], tracks: [] }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris :', error)
        this.favorites = { albums: [], artistes: [], tracks: [] }
      }
    },

    // Sauvegarde les favoris dans le localStorage
    saveFavorites () {
      try {
        localStorage.setItem('deezer_favorites', JSON.stringify(this.favorites))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris :', error)
      }
    },

    // Ajoute ou retire un favori
    // type = 'albums', 'artistes' ou 'tracks'
    toggleFavorite (type, item) {
      const favoriteIndex = this.favorites[type].findIndex(id => String(id) === String(item.id))

      if (favoriteIndex === -1) {
        // Pas encore favori → on l'ajoute
        this.favorites[type].push(item.id)
        this.itemsById[type][item.id] = item
      } else {
        // Déjà favori → on le retire
        this.favorites[type].splice(favoriteIndex, 1)
      }

      // Sauvegarder après chaque changement
      this.saveFavorites()
    },
  },
})

export default useDeezerStore
