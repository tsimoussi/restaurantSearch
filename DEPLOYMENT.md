# Guide de Déploiement

## Option 1 : Render.com (Gratuit - Recommandé)

### Étapes :

1. **Créer un compte sur Render.com**
   - Allez sur https://render.com
   - Inscrivez-vous gratuitement

2. **Créer un dépôt GitHub**
   - Allez sur https://github.com
   - Créez un nouveau repository (public ou privé)
   - Poussez votre code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/restaurant-sans-site-web.git
   git push -u origin main
   ```

3. **Déployer sur Render**
   - Connectez-vous à Render.com
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository GitHub
   - Configurez :
     - **Name** : restaurant-sans-site-web
     - **Environment** : Node
     - **Build Command** : `npm install`
     - **Start Command** : `npm start`
   - Ajoutez la variable d'environnement :
     - **Key** : `GOOGLE_API_KEY`
     - **Value** : `AIzaSyC54plrI96bFqr69WrroU-HTTKx3kQS_6E`
   - Cliquez sur "Create Web Service"

4. **Votre application sera accessible à** :
   ```
   https://restaurant-sans-site-web-XXXX.onrender.com
   ```

⚠️ **Note** : Le plan gratuit de Render met l'application en veille après 15 minutes d'inactivité. Le premier chargement peut prendre 30-60 secondes.

---

## Option 2 : Railway.app (Gratuit avec limites)

### Étapes :

1. **Créer un compte sur Railway.app**
   - Allez sur https://railway.app
   - Inscrivez-vous avec GitHub

2. **Créer un nouveau projet**
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository

3. **Configurer les variables d'environnement**
   - Dans les settings du projet
   - Ajoutez `GOOGLE_API_KEY` avec votre clé

4. **Déploiement automatique**
   - Railway détecte automatiquement Node.js
   - Votre app sera déployée automatiquement

---

## Option 3 : Vercel (Gratuit)

### Étapes :

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Déployer**
   ```bash
   vercel
   ```

3. **Configurer la variable d'environnement**
   - Dans le dashboard Vercel
   - Settings → Environment Variables
   - Ajoutez `GOOGLE_API_KEY`

---

## Option 4 : Hébergement sur votre propre serveur

### Si vous avez un VPS (OVH, DigitalOcean, etc.) :

1. **Installer Node.js sur le serveur**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Installer PM2 (gestionnaire de processus)**
   ```bash
   sudo npm install -g pm2
   ```

3. **Transférer votre code sur le serveur**
   ```bash
   scp -r . user@votre-serveur:/var/www/restaurant-app
   ```

4. **Démarrer l'application avec PM2**
   ```bash
   cd /var/www/restaurant-app
   npm install
   pm2 start server.js --name restaurant-app
   pm2 save
   pm2 startup
   ```

5. **Configurer Nginx comme reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Recommandation

Pour un usage simple et gratuit : **Render.com**
- ✅ Gratuit
- ✅ Simple à configurer
- ✅ HTTPS automatique
- ✅ Déploiement automatique depuis GitHub
- ⚠️ Se met en veille après 15 min d'inactivité (plan gratuit)

Pour un usage professionnel : **VPS avec PM2**
- ✅ Toujours actif
- ✅ Contrôle total
- ✅ Pas de limitations
- ❌ Nécessite des connaissances en administration serveur
- 💰 Coût : ~5-10€/mois
