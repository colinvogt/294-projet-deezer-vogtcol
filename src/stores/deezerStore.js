import { defineStore } from 'pinia'
import api from '@/plugins/axios.js'
import { createMockCache, getMockItem, getMockPage, shouldUseMock } from '@/services/mockCatalogue.js'
import { useAppStore } from '@/stores/app.js'

const endpoints = { albums: 'albums', artistes: 'artists', tracks: 'tracks' }
const favoritesKey = 'deezer_favorites'

function emptyFavorites () {
  return { albums: [], artistes: [], tracks: [] }
}

function favoriteItems (state, type) {
  return state.favorites[type]
    .map(id => state.itemsById[type][id])
    .filter(item => item !== undefined)
}

function normalizeIds (ids) {
  if (!Array.isArray(ids)) {
    return []
  }
  // Les anciennes sauvegardes peuvent mélanger 1 et "1" pour le même favori.
  const validIds = ids
    .filter(id => (typeof id === 'number' || typeof id === 'string') && /^[1-9]\d*$/.test(String(id)))
    .map(Number)
    .filter(id => Number.isSafeInteger(id))
  return [...new Set(validIds)]
}

/**
 * Store Pinia pour gérer les données Deezer (albums, artistes, titres).
 * Centralise les appels API, les favoris et partage les données entre les pages.
 */
const useDeezerStore = defineStore('deezer', {
  state: () => ({
    itemsById: { albums: {}, artistes: {}, tracks: {} },
    isMock: false,
    // Favoris : on ne garde que les IDs, rangés par type
    // (un album, un artiste et un titre peuvent avoir le même ID)
    favorites: emptyFavorites(),
  }),

  getters: {
    getItemById: state => (type, id) => state.itemsById[type][id],

    unavailableFavorites: state => Object.keys(endpoints).flatMap(type =>
      state.favorites[type]
        .filter(id => !state.itemsById[type][id])
        .map(id => ({ type, id })),
    ),

    // Nombre total de favoris (albums + artistes + titres)
    totalFavorites: state => {
      return state.favorites.albums.length
        + state.favorites.artistes.length
        + state.favorites.tracks.length
    },

    // Vérifie si un élément est favori
    // type = 'albums', 'artistes' ou 'tracks'
    isFavorite: state => (type, item) => state.favorites[type].includes(Number(item.id)),

    // Retourne les objets complets (pas juste les IDs)
    getFavoriteAlbums: state => favoriteItems(state, 'albums'),
    getFavoriteArtistes: state => favoriteItems(state, 'artistes'),
    getFavoriteTracks: state => favoriteItems(state, 'tracks'),
  },

  actions: {
    activateMock () {
      if (this.isMock) {
        return
      }
      // Remplacer le cache évite de mélanger le catalogue distant et la sélection locale.
      // Les identifiants favoris restent conservés, même s'ils ne figurent pas dans le mock.
      this.itemsById = createMockCache()
      this.isMock = true
    },

    async requestApi (path, options) {
      if (this.isMock) {
        return
      }
      try {
        const response = await api.get(path, { ...options, timeout: 10_000 })
        return response.data
      } catch (error) {
        if (!shouldUseMock(error, options.signal)) {
          throw error
        }
        this.activateMock()
      }
    },

    async fetchCataloguePage (type, params, signal) {
      const apiData = await this.requestApi(`/${endpoints[type]}`, { params, signal })
      // Vérifier la source après l'attente : une autre requête a pu activer le mock.
      const data = this.isMock ? getMockPage(type, params) : apiData
      const { data: items, pagination } = data ?? {}
      // Vérifier toute la réponse avant de modifier le cache partagé.
      const validItems = Array.isArray(items)
        && items.every(item => Number.isSafeInteger(item?.id) && item.id > 0)
      const validPagination = pagination
        && Number.isSafeInteger(pagination.page) && pagination.page >= 1
        && Number.isSafeInteger(pagination.limit) && pagination.limit >= 1 && pagination.limit <= 100
        && Number.isSafeInteger(pagination.total) && pagination.total >= 0
        && Number.isSafeInteger(pagination.pages) && pagination.pages >= 0
      if (!validItems || !validPagination) {
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

      const apiData = await this.requestApi(`/${endpoints[type]}/${numericId}`, { signal })
      const data = this.isMock ? getMockItem(type, numericId) : apiData
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
        const savedFavorites = localStorage.getItem(favoritesKey)
        const data = JSON.parse(savedFavorites || '{}')
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Format des favoris invalide.')
        }
        this.favorites = {
          albums: normalizeIds(data.albums),
          artistes: normalizeIds(data.artistes),
          tracks: normalizeIds(data.tracks),
        }
      } catch {
        this.favorites = emptyFavorites()
        useAppStore().notify('Impossible de lire les favoris enregistrés dans ce navigateur.', 'warning')
      }
    },

    // Sauvegarde les favoris dans le localStorage
    saveFavorites (message) {
      try {
        localStorage.setItem(favoritesKey, JSON.stringify(this.favorites))
        useAppStore().notify(message)
      } catch {
        useAppStore().notify('Favoris modifiés pour cette session, mais la sauvegarde dans le navigateur a échoué.', 'warning')
      }
    },

    // Ajoute ou retire un favori
    // type = 'albums', 'artistes' ou 'tracks'
    toggleFavorite (type, item) {
      const id = Number(item.id)
      if (this.isFavorite(type, item)) {
        this.removeFavorite(type, id)
        return
      }
      this.favorites[type].push(id)
      this.itemsById[type][id] = item
      this.saveFavorites('Ajouté aux favoris')
    },

    // Permet aussi de retirer un favori qui ne peut plus être chargé depuis l'API.
    removeFavorite (type, id) {
      this.favorites[type] = this.favorites[type].filter(favoriteId => favoriteId !== Number(id))
      this.saveFavorites('Retiré des favoris')
    },
  },
})

export default useDeezerStore
