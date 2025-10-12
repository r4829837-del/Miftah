# 🚀 Déploiement sur Netlify - Appamine

## 📋 Prérequis

- Compte Netlify (gratuit)
- Repository Git (GitHub, GitLab, ou Bitbucket)
- Node.js 18+ installé localement

## 🔧 Configuration locale

### 1. Installation des dépendances
```bash
npm install
```

### 2. Test du build local
```bash
npm run build
```

### 3. Test de la prévisualisation
```bash
npm run preview
```

## 🌐 Déploiement sur Netlify

### Option A : Déploiement automatique (Recommandé)

1. **Connectez votre repository Git à Netlify :**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "New site from Git"
   - Choisissez votre provider Git (GitHub, GitLab, etc.)
   - Sélectionnez votre repository `appamine`

2. **Configuration du build :**
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
   - **Node version :** `18`

3. **Variables d'environnement (si nécessaire) :**
   - Aucune variable d'environnement requise pour cette application

4. **Déploiement :**
   - Cliquez sur "Deploy site"
   - Netlify va automatiquement construire et déployer votre application

### Option B : Déploiement manuel

1. **Build local :**
   ```bash
   npm run build
   ```

2. **Upload du dossier `dist` :**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "Add new site" → "Deploy manually"
   - Glissez-déposez le dossier `dist` dans la zone de déploiement

## ⚙️ Configuration avancée

### Fichiers de configuration inclus :

- **`netlify.toml`** : Configuration principale de Netlify
- **`public/_redirects`** : Redirections pour SPA
- **`public/_headers`** : Headers de sécurité et cache

### Optimisations incluses :

- ✅ Compression des assets
- ✅ Cache optimisé
- ✅ Headers de sécurité
- ✅ Redirections SPA
- ✅ Chunking intelligent
- ✅ Minification Terser

## 🔍 Vérification du déploiement

Après le déploiement, vérifiez :

1. **Page d'accueil** : L'application se charge correctement
2. **Authentification** : Connexion avec `harounsolution@gmail.com` / `00000`
3. **Fonctionnalités** : Toutes les sections fonctionnent
4. **Rapports** : Génération de PDF fonctionne
5. **Responsive** : L'application s'adapte aux mobiles

## 🐛 Dépannage

### Erreur de build
- Vérifiez que toutes les dépendances sont installées
- Vérifiez la version de Node.js (18+)
- Consultez les logs de build sur Netlify

### Erreur 404 sur les routes
- Vérifiez que le fichier `_redirects` est présent
- Vérifiez la configuration SPA dans `netlify.toml`

### Problèmes de performance
- Vérifiez la configuration de cache dans `_headers`
- Consultez les métriques de performance sur Netlify

## 📊 Monitoring

Netlify fournit :
- **Analytics** : Visiteurs et pages vues
- **Performance** : Vitesse de chargement
- **Logs** : Erreurs et débogage
- **Forms** : Gestion des formulaires (si utilisés)

## 🔄 Mises à jour

Pour mettre à jour l'application :
1. Poussez vos changements sur Git
2. Netlify déploiera automatiquement
3. Vérifiez le déploiement sur le dashboard Netlify

## 📞 Support

- **Documentation Netlify** : [docs.netlify.com](https://docs.netlify.com)
- **Support Netlify** : Via le dashboard Netlify
- **Documentation Vite** : [vitejs.dev](https://vitejs.dev)