import { defineStore } from 'pinia'
import api from '@/plugins/axios.js'

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

    // String() des deux côtés : route.params.id est toujours une string
    getAlbumById: state => {
      return albumId => {
        return state.albums.find(album => String(album.id) === String(albumId))
      }
    },

    getArtistById: state => {
      return artistId => {
        return state.artistes.find(artiste => String(artiste.id) === String(artistId))
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
        return state.favorites[type].includes(item.id)
      }
    },

    // Retourne les objets complets (pas juste les IDs)
    getFavoriteAlbums: state => {
      const favoriteAlbums = state.favorites.albums.map(favoriteId => {
        return state.albums.find(album => album.id === favoriteId)
      })
      return favoriteAlbums.filter(album => album !== undefined)
    },

    getFavoriteArtistes: state => {
      const favoriteArtistes = state.favorites.artistes.map(favoriteId => {
        return state.artistes.find(artiste => artiste.id === favoriteId)
      })
      return favoriteArtistes.filter(artiste => artiste !== undefined)
    },

    getFavoriteTracks: state => {
      const favoriteTracks = state.favorites.tracks.map(favoriteId => {
        return state.tracks.find(track => track.id === favoriteId)
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
        // Les favoris sont chargés APRÈS les données de l'API
        // pour pouvoir supprimer ceux qui n'existent plus
        this.loadFavorites()
        this.cleanupFavorites()
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

    // Charge les favoris depuis le localStorage
    loadFavorites () {
      try {
        const savedFavorites = localStorage.getItem('deezer_favorites')
        if (savedFavorites) {
          const data = JSON.parse(savedFavorites)
          this.favorites = {
            albums: data.albums || [],
            artistes: data.artistes || [],
            tracks: data.tracks || [],
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
      const favoriteIndex = this.favorites[type].indexOf(item.id)

      if (favoriteIndex === -1) {
        // Pas encore favori → on l'ajoute
        this.favorites[type].push(item.id)
      } else {
        // Déjà favori → on le retire
        this.favorites[type].splice(favoriteIndex, 1)
      }

      // Sauvegarder après chaque changement
      this.saveFavorites()
    },

    // Supprime les favoris qui n'existent plus dans l'API
    cleanupFavorites () {
      let removedCount = 0

      for (const type of ['albums', 'artistes', 'tracks']) {
        // Si la liste n'a pas pu être chargée (API en panne), on ne touche à rien
        if (this[type].length === 0) {
          continue
        }

        const initialCount = this.favorites[type].length

        this.favorites[type] = this.favorites[type].filter(favoriteId => {
          return this[type].some(item => item.id === favoriteId)
        })

        removedCount += initialCount - this.favorites[type].length
      }

      if (removedCount > 0) {
        console.log('Nettoyage :', removedCount, 'favoris obsolètes supprimés')
        this.saveFavorites()
      }
    },
  },
})

export default useDeezerStore
