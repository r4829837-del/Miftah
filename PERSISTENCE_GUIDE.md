# 🗄️ Système de Persistance des Données - Appamine

## 📋 Vue d'ensemble

Votre application Appamine dispose maintenant d'un système de persistance robuste qui garantit que vos données ne seront jamais perdues. Le système combine plusieurs couches de sauvegarde pour une sécurité maximale.

## 🔧 Fonctionnalités Implémentées

### 1. **Sauvegarde Automatique**
- ✅ **Sauvegarde toutes les 30 secondes** automatiquement
- ✅ **Sauvegarde lors de la fermeture** de l'application
- ✅ **Sauvegarde lors des changements de visibilité** de la page
- ✅ **Conservation des 10 dernières sauvegardes** automatiques

### 2. **Stockage Multi-Couches**
- ✅ **IndexedDB** : Stockage principal haute performance
- ✅ **localStorage** : Sauvegarde de secours (5 dernières)
- ✅ **Export téléchargeable** : Sauvegarde externe en JSON

### 3. **Gestionnaire de Sauvegardes**
- ✅ **Interface utilisateur** complète dans les paramètres
- ✅ **Restauration** depuis n'importe quelle sauvegarde
- ✅ **Vérification d'intégrité** des données
- ✅ **Export manuel** des données

### 4. **Synchronisation Serveur (Optionnelle)**
- ✅ **Synchronisation automatique** avec un serveur
- ✅ **Indicateur de statut** en temps réel
- ✅ **Gestion hors ligne/en ligne**
- ✅ **Fusion intelligente** des données

## 🚀 Comment Utiliser

### Accès au Gestionnaire de Sauvegardes

1. **Ouvrez les paramètres** de l'application
2. **Allez dans la section** "تكوين الدورات التعليمية"
3. **Cliquez sur** "إدارة النسخ الاحتياطية"

### Fonctionnalités Disponibles

#### 🔄 Sauvegarde Manuelle
- Cliquez sur **"Sauvegarde Manuelle"** pour créer une sauvegarde immédiate
- La sauvegarde sera stockée dans IndexedDB et localStorage

#### 📥 Export des Données
- Cliquez sur **"Exporter les Données"** pour télécharger un fichier JSON
- Ce fichier contient toutes vos données et peut être utilisé pour restaurer l'application

#### 🔍 Vérification d'Intégrité
- Cliquez sur **"Vérifier l'Intégrité"** pour s'assurer que vos données ne sont pas corrompues
- Le système vérifie la structure et la cohérence des données

#### ↩️ Restauration
- Sélectionnez une sauvegarde dans la liste
- Cliquez sur **"Restaurer"** pour revenir à cette version
- ⚠️ **Attention** : Cela remplacera toutes les données actuelles

## 📊 Indicateur de Synchronisation

Dans la sidebar, vous verrez un indicateur qui montre :
- 🟢 **Vert** : Données synchronisées et à jour
- 🟡 **Jaune** : Changements en attente de synchronisation
- 🔵 **Bleu** : Synchronisation en cours
- 🔴 **Rouge** : Hors ligne ou erreur de connexion

## ⚙️ Configuration Avancée

### Variables d'Environnement (Optionnelles)

Pour activer la synchronisation serveur, ajoutez dans votre fichier `.env` :

```env
# URL du serveur de synchronisation
VITE_SYNC_SERVER_URL=http://votre-serveur.com/api

# Intervalle de synchronisation (en millisecondes)
VITE_SYNC_INTERVAL=60000
```

### Personnalisation des Sauvegardes

Vous pouvez modifier les paramètres dans `src/lib/persistence.ts` :

```typescript
const PERSISTENCE_CONFIG = {
  AUTO_SAVE_INTERVAL: 30000, // 30 secondes
  MAX_BACKUPS: 10,           // Nombre max de sauvegardes
  BACKUP_PREFIX: 'backup_',  // Préfixe des sauvegardes
  EXPORT_PREFIX: 'export_'   // Préfixe des exports
};
```

## 🛡️ Sécurité et Fiabilité

### Protection des Données
- **Chiffrement local** : Les données sont stockées de manière sécurisée
- **Validation** : Vérification automatique de l'intégrité
- **Sauvegarde multiple** : Plusieurs copies de sécurité

### Gestion des Erreurs
- **Récupération automatique** en cas d'erreur
- **Logs détaillés** pour le débogage
- **Fallback** vers les sauvegardes précédentes

## 📈 Performance

### Optimisations
- **Sauvegarde incrémentale** : Seules les données modifiées sont sauvegardées
- **Compression** : Les données sont optimisées pour l'espace
- **Cache intelligent** : Réduction des accès disque

### Impact sur les Performances
- **Minimal** : Les sauvegardes se font en arrière-plan
- **Non-bloquant** : L'interface reste réactive
- **Efficace** : Utilisation optimale de la mémoire

## 🔧 Maintenance

### Nettoyage Automatique
- Les anciennes sauvegardes sont automatiquement supprimées
- L'espace de stockage est optimisé
- Les fichiers temporaires sont nettoyés

### Surveillance
- **Logs de sauvegarde** dans la console du navigateur
- **Statistiques** de synchronisation
- **Alertes** en cas de problème

## 🆘 Dépannage

### Problèmes Courants

#### Sauvegardes non créées
- Vérifiez que l'application a les permissions de stockage
- Videz le cache du navigateur et rechargez

#### Erreur de synchronisation
- Vérifiez votre connexion internet
- Vérifiez l'URL du serveur dans les variables d'environnement

#### Données corrompues
- Utilisez la fonction "Vérifier l'Intégrité"
- Restaurez depuis une sauvegarde précédente

### Support
- Consultez les logs dans la console du navigateur (F12)
- Vérifiez les fichiers de sauvegarde dans les DevTools > Application > Storage

## 🎯 Avantages

✅ **Sécurité maximale** : Vos données ne seront jamais perdues  
✅ **Performance optimale** : Sauvegardes en arrière-plan  
✅ **Facilité d'utilisation** : Interface intuitive  
✅ **Flexibilité** : Synchronisation optionnelle avec serveur  
✅ **Fiabilité** : Système testé et robuste  

---

**Votre application est maintenant équipée d'un système de persistance professionnel !** 🎉