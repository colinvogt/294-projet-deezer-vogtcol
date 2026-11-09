// src/utils/imageUrl.js

/**
 * Retourne l'URL complète d'une image d'album.
 * L'API renvoie un chemin comme "/images/deezer/albums/1.webp",
 * on lui ajoute le domaine du serveur (https://apis.divtec.me).
 */
export function getImageUrl (path) {
  if (!path) {
    return ''
  }

  // Les images de secours sont servies par notre site, sans dépendre de l'API.
  if (path.startsWith('/mock/')) {
    return `${import.meta.env.BASE_URL}${path.slice(1)}`
  }

  const serverUrl = new URL(import.meta.env.VITE_API_URL).origin
  return `${serverUrl}${path}`
}
