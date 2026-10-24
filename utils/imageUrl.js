// src/utils/imageUrl.js

/**
 * Retourne l'URL complète d'une image dans le dossier /images/
 */
export function getImageUrl (filename, fallback = 'default.png') {
  if (!filename) {
    filename = fallback
  }
  return `${import.meta.env.BASE_URL}images/${filename}`
}
