# Recherche de Restaurants Sans Site Web

Outil de recherche de restaurants locaux qui n'ont pas de site web, utilisant l'API Google Places.

## Fonctionnalités

- 🔍 Recherche de restaurants par localisation
- 🌐 Filtre automatique des restaurants sans site web
- 📍 Rayon de recherche configurable (1-20 km)
- ⭐ Affichage des notes et avis
- 📞 Coordonnées téléphoniques
- 🗺️ Lien direct vers Google Maps
- 📸 Photos des restaurants

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. La clé API Google est déjà configurée dans `googleApiKey.txt`

## Utilisation

1. Démarrer le serveur :
```bash
npm start
```

2. Ouvrir le navigateur à l'adresse :
```
http://localhost:3000
```

3. Entrer une localisation (ville, adresse, etc.)
4. Choisir le rayon de recherche
5. Cliquer sur "Rechercher"

## Structure du Projet

```
rechercheRestaurntSansSiteWeb/
├── server.js              # Serveur Express et API
├── package.json           # Dépendances du projet
├── googleApiKey.txt       # Clé API Google
├── public/
│   ├── index.html        # Interface utilisateur
│   └── app.js            # Logique frontend
└── README.md             # Documentation
```

## Technologies Utilisées

- **Backend**: Node.js, Express
- **Frontend**: HTML, TailwindCSS, JavaScript
- **API**: Google Places API, Google Geocoding API
- **Icons**: Font Awesome

## API Endpoints

### POST /api/search-restaurants
Recherche des restaurants sans site web

**Body:**
```json
{
  "location": "Paris",
  "radius": 5000
}
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "restaurants": [...]
}
```

### GET /api/photo/:photoReference
Récupère une photo de restaurant depuis Google Places

## Notes

- L'API Google Places a des limites de quota
- Les résultats sont limités aux restaurants sans site web
- La recherche nécessite une connexion internet active
