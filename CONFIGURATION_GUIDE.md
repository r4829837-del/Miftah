# Guide de Configuration - Appamine

## Variables d'environnement

Pour configurer correctement l'application, vous devez créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=votre_url_supabase_ici
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase_ici
```

### Comment obtenir ces valeurs :

1. Connectez-vous à votre dashboard Supabase
2. Sélectionnez votre projet
3. Allez dans Settings > API
4. Copiez l'URL du projet et la clé publique anonyme

## Optimisations appliquées

### Performance du Build
- ✅ Configuration du code splitting dans `vite.config.ts`
- ✅ Séparation des chunks par type de dépendance
- ✅ Limite des avertissements de taille augmentée à 1MB

### Corrections appliquées
- ✅ **Rapport des activités** : Correction de la page blanche lors de la génération PDF
- ✅ **Vite Configuration** : Optimisation du bundling pour réduire la taille des chunks

## Vérifications effectuées

- ✅ Compilation TypeScript : Aucune erreur
- ✅ Build production : Succès avec optimisations
- ✅ Composants React : Tous fonctionnels
- ✅ Structure des fichiers : Conforme
- ✅ Imports et dépendances : Corrects

## Recommandations futures

1. **Tests automatisés** : Ajouter des tests unitaires et d'intégration
2. **PWA** : Considérer l'ajout de fonctionnalités Progressive Web App
3. **Monitoring** : Implémenter un système de suivi des erreurs
4. **SEO** : Optimiser les métadonnées si nécessaire