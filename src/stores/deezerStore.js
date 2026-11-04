import { defineStore } from 'pinia'
import api from '@/plugins/axios.js'

const endpoints = { albums: 'albums', artistes: 'artists', tracks: 'tracks' }

/**
 * Store Pinia pour gérer les données Deezer (albums, artistes, titres).
 * Centralise les appels API, les favoris et partage les données entre les pages.
 */
const useDeezerStore = defineStore('deezer', {
  state: () => ({
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
    getItemById: state => (type, id) => state.itemsById[type][id],

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
    async fetchCataloguePage (type, params, signal) {
      const { data } = await api.get(`/${endpoints[type]}`, { params, signal, timeout: 10_000 })
      const { data: items, pagination } = data ?? {}
      if (!Array.isArray(items) || !pagination) {
        throw new Error('Réponse inattendue lors du chargement du catalogue.')
      }

      // Une carte déjà chargée peut aussi servir à la fiche détail ou aux favoris.
      for (const item of items) {
        this.itemsById[type][item.id] = item
      }
      return { items, pagination }
    },

    async fetchItem (type, id, signal) {
      const numericId = Number(id)
      if (!Number.isSafeInteger(numericId) || numericId <= 0) {
        throw new Error('Identifiant invalide.')
      }

      const cachedItem = this.getItemById(type, numericId)
      if (cachedItem) {
        return cachedItem
      }

      const { data } = await api.get(`/${endpoints[type]}/${numericId}`, { signal, timeout: 10_000 })
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
