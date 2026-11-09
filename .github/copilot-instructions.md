# Vogtunes — Instructions du projet

Application pédagogique Vue 3 / Vuetify 3 de Colin Vogt, module 294.
Lire le README à la racine pour l’installation, l’architecture et les limites réelles.

## Périmètre

- Respecter la limite fixée aux séquences 1 à 5 du tutoriel DEVJS.
- L’application consulte des albums, artistes et titres via l’API DIVTEC et gère des favoris locaux.
- Les fiches détaillées, les coups de cœur et le menu mobile sont déjà présents.
- Ne pas ajouter d’authentification, de création/suppression sur l’API, de PWA ou de fonctionnalités des séquences suivantes sans demande explicite.

## Code et configuration

- JavaScript et composants Vue avec `<script setup>` ; conserver une structure compréhensible pour un débutant.
- Les pages de `src/pages/` génèrent les routes. Les fichiers à point pour les détails artistes/titres sont intentionnels.
- `deezerStore.js` centralise les appels Axios, le cache et les identifiants favoris.
- Un secours demandé par Colin utilise `src/data/mock.json`, `src/services/mockCatalogue.js` et les images de `public/mock/` quand l’API est indisponible. Conserver les vrais identifiants et les favoris absents de cette sélection ; ne pas mélanger les résultats des deux sources. Le bandeau permet de recharger pour retenter l’API.
- `app.js` gère la notification affichée dans `App.vue`, qui survit au retrait d’une carte.
- Respecter la limite API de 100 éléments par requête. Les listes utilisent actuellement 24 éléments par page.
- `.env.example` est le modèle public ; ne pas commiter `.env` ni des secrets.
- Le site utilisé est publié sur Vercel. Le fichier `.github/workflows/deploy.yml` vérifie seulement ESLint et le build avec Node.js 22 ; il ne déploie pas sur GitHub Pages.

## Vérification et historique

- Utiliser Node.js 22 ou plus récent compatible et installer avec `npm ci`.
- `npx eslint . --no-fix` vérifie sans modifier ; `npm run lint` applique aussi les corrections automatiques.
- Avant un commit de code, vérifier le style, compiler avec `npm run build` et tester les parcours concernés.
- Vérifier les états chargement, erreur et vide, le clic cœur sans navigation, la persistance et le retrait depuis les favoris.
- Préserver les modifications personnelles existantes. Ne commiter que les fichiers concernés.
- Utiliser uniquement les préfixes `feat:`, `fix:` et `docs:`.
- Expliquer les modifications et leur raison à l’utilisateur. Documenter honnêtement l’assistance IA.
