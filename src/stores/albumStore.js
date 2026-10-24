import { defineStore } from 'pinia'
import api from '@/plugins/axios.js'

/**
 * Store Pinia pour gérer les données des Albums.
 * Centralise les appels API et partage les données entre les pages.
 */
const useAlbumStore = defineStore('album', {
  state: () => ({
    albums: [],
    artistes: [],
    isLoading: false,
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
  },

  actions: {
    async init () {
      this.isLoading = true

      try {
        await Promise.all([
          this.fetchAlbums({ withLoader: false }),
          this.fetchArtiste({ withLoader: false }),
        ])
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchAlbums ({ withLoader = true } = {}) {
      if (withLoader) this.isLoading = true

      try {
        const response = await api.get('/albums')
        // L'API renvoie { data: [...] } : les albums sont dans response.data.data
        this.albums = response.data.data
      } catch (error) {
        console.error('Erreur lors du chargement des albums:', error.message)
        this.albums = []
      } finally {
        if (withLoader) this.isLoading = false
      }
    },

    async fetchArtiste ({ withLoader = true } = {}) {
      if (withLoader) this.isLoading = true

      try {
        const response = await api.get('/artists')
        this.artistes = response.data.data ?? response.data
      } catch (error) {
        console.error('Erreur lors du chargement des artistes:', error.message)
        this.artistes = []
      } finally {
        if (withLoader) this.isLoading = false
      }
    },
  },
})

export default useAlbumStore
