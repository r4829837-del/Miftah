# 📊 Guide d'Analytics et de Comptabilisation des Accès

## Vue d'ensemble

Votre application Appamine dispose maintenant d'un système complet de comptabilisation des accès qui vous permet de :

- **Tracker les utilisateurs de votre application** : Connexions, sessions, temps passé, pages visitées
- **Comptabiliser les visiteurs de votre site NetScolaire** : Visites, pages vues, sources de trafic
- **Visualiser toutes les statistiques** dans un tableau de bord unifié

## 🚀 Fonctionnalités Implémentées

### 1. **Tracking de l'Application Appamine**

#### ✅ Ce qui est tracké automatiquement :
- **Connexions utilisateurs** : Chaque fois qu'un utilisateur se connecte
- **Déconnexions** : Quand un utilisateur se déconnecte
- **Durée des sessions** : Temps passé dans l'application
- **Pages visitées** : Navigation dans l'application
- **Actions utilisateur** : Clics sur les boutons importants
- **Type d'établissement** : Lycée ou CEM
- **Cycle scolaire** : Moyen ou Secondaire

#### 📈 Statistiques disponibles :
- Nombre total d'utilisateurs
- Nombre total de sessions
- Temps moyen par session
- Temps total passé dans l'application
- Distribution par type d'établissement
- Top utilisateurs les plus actifs
- Statistiques quotidiennes détaillées

### 2. **Tracking du Site NetScolaire**

#### ✅ Ce qui est tracké :
- **Visites uniques** : Nombre de visiteurs uniques
- **Pages vues** : Nombre total de pages consultées
- **Temps sur le site** : Durée moyenne des visites
- **Taux de rebond** : Pourcentage de visites courtes
- **Sources de trafic** : D'où viennent vos visiteurs
- **Types d'appareils** : Desktop, mobile, tablette
- **Géolocalisation** : Pays d'origine des visiteurs
- **Pages les plus visitées** : Contenu le plus populaire

## 🛠️ Comment Utiliser

### **Accéder aux Statistiques**

1. **Connectez-vous à votre application Appamine**
2. **Cliquez sur "الإحصائيات" dans la sidebar**
3. **Choisissez l'onglet souhaité** :
   - **"التطبيق"** : Statistiques de l'application
   - **"نت سكولير"** : Statistiques du site web

### **Fonctionnalités du Tableau de Bord**

#### **Onglet Application :**
- 📊 **Vue d'ensemble** : Cartes avec les métriques principales
- 📈 **Graphiques** : Évolution dans le temps
- 👥 **Utilisateurs** : Top utilisateurs et distribution
- 📅 **Période** : Filtrage par 7, 30 ou 90 jours
- 💾 **Export** : Téléchargement des données

#### **Onglet Site Web :**
- 🌐 **Visites** : Nombre total et visiteurs uniques
- ⏱️ **Engagement** : Temps passé et taux de rebond
- 📱 **Appareils** : Répartition desktop/mobile
- 🌍 **Géographie** : Pays d'origine
- 📄 **Contenu** : Pages les plus populaires

## 🔧 Configuration du Tracking NetScolaire

### **Étape 1 : Intégrer le Script de Tracking**

Ajoutez ce code à la fin de chaque page HTML de votre site NetScolaire :

```html
<script src="https://votre-appamine.netlify.app/netscolaire-tracking.js"></script>
```

### **Étape 2 : Vérifier le Fonctionnement**

1. Ouvrez la console de votre navigateur (F12)
2. Visitez votre site NetScolaire
3. Vous devriez voir : `📊 NetScolaire Tracking initialisé`

### **Étape 3 : Tester le Tracking**

1. Naviguez sur votre site
2. Cliquez sur différents éléments
3. Attendez quelques secondes
4. Vérifiez les statistiques dans l'application Appamine

## 📊 Types de Données Collectées

### **Données de l'Application :**
```json
{
  "userId": "lyce-zerrouki",
  "userEmail": "lyce.zerrouki@gmail.com",
  "loginTime": "2024-01-15T10:30:00Z",
  "logoutTime": "2024-01-15T11:45:00Z",
  "duration": 75,
  "pagesVisited": ["/", "/students", "/analysis"],
  "actionsPerformed": ["login", "logout", "export_data"],
  "schoolType": "lyce",
  "cycle": "ثانوي"
}
```

### **Données du Site Web :**
```json
{
  "visitorId": "visitor_1234567890_abc123",
  "sessionId": "session_1234567890_def456",
  "siteId": "netscolaire",
  "timestamp": "2024-01-15T10:30:00Z",
  "url": "https://votre-site.com/page",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "timeSpent": 180,
  "scrollPercent": 75
}
```

## 🔒 Confidentialité et Sécurité

### **Données Anonymisées :**
- Les visiteurs du site web sont identifiés par des IDs anonymes
- Aucune information personnelle n'est collectée
- Les données sont stockées localement dans le navigateur

### **Données Utilisateurs :**
- Seuls les utilisateurs autorisés sont trackés
- Les données sont isolées par utilisateur
- Aucune donnée sensible n'est exposée

## 📈 Interprétation des Métriques

### **Métriques d'Engagement :**
- **Temps moyen par session** : Plus c'est élevé, plus l'engagement est fort
- **Taux de rebond** : Plus c'est bas, mieux c'est (idéalement < 50%)
- **Pages par session** : Plus c'est élevé, plus l'utilisateur explore

### **Métriques de Croissance :**
- **Utilisateurs uniques** : Croissance de votre base utilisateurs
- **Sessions totales** : Fréquence d'utilisation
- **Nouvelles visites** : Attraction de nouveaux utilisateurs

## 🚨 Dépannage

### **Problème : Pas de données dans l'application**
- Vérifiez que vous êtes connecté
- Actualisez la page
- Vérifiez la console pour les erreurs

### **Problème : Pas de données du site NetScolaire**
- Vérifiez que le script est bien intégré
- Vérifiez la console du navigateur
- Testez sur différents navigateurs

### **Problème : Données incorrectes**
- Videz le cache du navigateur
- Vérifiez la configuration du tracking
- Contactez le support technique

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez ce guide** en premier
2. **Consultez la console** du navigateur pour les erreurs
3. **Testez sur différents navigateurs**
4. **Contactez l'équipe technique** avec les détails de l'erreur

## 🎯 Prochaines Améliorations

- **Notifications en temps réel** des nouvelles visites
- **Alertes** pour les pics d'activité
- **Rapports automatiques** par email
- **Intégration** avec Google Analytics
- **API** pour accès externe aux données

---

**🎉 Félicitations !** Votre système de comptabilisation des accès est maintenant opérationnel. Vous pouvez suivre en temps réel l'utilisation de votre application et de votre site web.