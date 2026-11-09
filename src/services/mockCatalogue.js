import mock from '@/data/mock.json'

const filterFields = ['artist', 'genres', 'album', 'name']

// Une panne peut activer le secours, mais pas un clic annulé ni une vraie erreur 404.
export function shouldUseMock (error, signal) {
  if (signal?.aborted || error.code === 'ERR_CANCELED' || !error.isAxiosError) {
    return false
  }
  const status = error.response?.status
  return !error.response || status === 408 || status === 429 || status >= 500
}

export function createMockCache () {
  const cache = {}
  for (const [type, items] of Object.entries(mock)) {
    cache[type] = {}
    for (const item of items) {
      cache[type][item.id] = item
    }
  }
  return cache
}

export function getMockItem (type, id) {
  const item = mock[type].find(item => item.id === id)
  if (!item) {
    // Même statut qu'une fiche absente de l'API : la page sait déjà le traiter.
    throw Object.assign(new Error('Élément absent du catalogue de démonstration.'), { response: { status: 404 } })
  }
  return item
}

function matchesSearch (item, query) {
  if (!query) {
    return true
  }
  const values = Object.values(item).flat()
  return values.some(value => typeof value === 'string' && value.toLocaleLowerCase('fr').includes(query))
}

function matchesFilters (item, params) {
  for (const field of filterFields) {
    const filter = params[field]?.trim().toLocaleLowerCase('fr')
    if (!filter) {
      continue
    }
    // Un artiste peut avoir plusieurs genres. Un seul genre correspondant suffit.
    const values = [item[field]].flat()
    const matches = values.some(value => typeof value === 'string' && value.toLocaleLowerCase('fr') === filter)
    if (!matches) {
      return false
    }
  }
  return true
}

export function getMockPage (type, params = {}) {
  const { page = 1, limit = 24, q = '' } = params
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw Object.assign(new Error('Pagination invalide.'), { response: { status: 400 } })
  }

  const query = q.trim().toLocaleLowerCase('fr')
  const filtered = mock[type].filter(item => matchesSearch(item, query) && matchesFilters(item, params))

  // Filtrer avant de découper la page permet de garder un compteur exact.
  const start = (page - 1) * limit
  return {
    data: filtered.slice(start, start + limit),
    pagination: { page, limit, total: filtered.length, pages: Math.ceil(filtered.length / limit) },
  }
}
