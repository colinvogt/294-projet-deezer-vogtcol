// src/utils/imageUrl.js

/**
 * Retourne l'URL complète d'une image d'album
 */
export function getImageUrl (filename, fallback = 'default.png') {
  if (!filename) {
    filename = fallback
  }
  return `${import.meta.env.VITE_API_URL}/albums/image/${filename}`
}
