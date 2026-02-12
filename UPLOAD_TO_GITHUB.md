# Comment uploader votre code sur GitHub

## Méthode Simple : Via l'interface web GitHub

1. **Allez sur votre repository** : https://github.com/tsimoussi/restaurantSearch

2. **Cliquez sur "uploading an existing file"** ou le bouton "Add file" → "Upload files"

3. **Glissez-déposez tous ces fichiers** :
   - server.js
   - package.json
   - package-lock.json
   - render.yaml
   - README.md
   - DEPLOYMENT.md
   - .gitignore
   - .env.example
   - googleApiKey.txt
   - Dossier `public/` (avec index.html et app.js)

4. **Écrivez un message de commit** : "Initial commit"

5. **Cliquez sur "Commit changes"**

✅ Votre code sera sur GitHub !

## Ensuite : Déployer sur Render.com

Une fois le code sur GitHub, suivez ces étapes :

1. Allez sur https://render.com
2. Créez un compte (gratuit)
3. Cliquez sur "New +" → "Web Service"
4. Connectez votre compte GitHub
5. Sélectionnez le repository "restaurantSearch"
6. Configurez :
   - Name: restaurant-sans-site-web
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
7. Ajoutez la variable d'environnement :
   - Key: GOOGLE_API_KEY
   - Value: AIzaSyC54plrI96bFqr69WrroU-HTTKx3kQS_6E
8. Cliquez "Create Web Service"

Votre application sera accessible à une URL permanente !
