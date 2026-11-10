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

  const serverUrl = new URL(import.meta.env.VITE_API_URL).origin
  return `${serverUrl}${path}`
}
