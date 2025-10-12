# Système de Sauvegarde Appamine

Ce système permet de sauvegarder et restaurer facilement votre projet Appamine avec un système de gestion par date et heure.

## 🚀 Utilisation Rapide

### Créer une sauvegarde
```powershell
.\backup.ps1 -action backup
```

### Restaurer une sauvegarde
```powershell
.\backup.ps1 -action restore -date "07/08/2025 02:05"
```

### Lister toutes les sauvegardes
```powershell
.\backup.ps1 -action list
```

## 📋 Fonctionnalités

### ✅ Sauvegarde Intelligente
- Sauvegarde automatique avec timestamp
- Exclusion des dossiers inutiles (`node_modules`, `.git`, etc.)
- Métadonnées de sauvegarde avec nombre de fichiers
- Format de date lisible

### 🔄 Restauration Sécurisée
- Confirmation avant restauration
- Sauvegarde automatique de l'état actuel avant restauration
- Recherche par date/heure exacte
- Protection contre les erreurs

### 📊 Gestion des Sauvegardes
- Liste détaillée de toutes les sauvegardes
- Informations sur chaque sauvegarde (date, nombre de fichiers)
- Tri par date de création

## 📁 Structure des Sauvegardes

```
appamine/
├── backups/
│   ├── appamine_backup_2025-08-07_02-05-00/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── backup_info.json
│   │   └── ...
│   └── appamine_backup_2025-08-07_15-30-00/
│       └── ...
```

## 🔧 Configuration

Le script exclut automatiquement :
- `node_modules/` (dépendances)
- `.git/` (historique Git)
- `backups/` (dossier de sauvegarde)
- `*.log` (fichiers de logs)
- `dist/` et `build/` (fichiers de build)
- `.env.local` et `.env.production` (variables d'environnement)

## ⚠️ Points Importants

1. **Sécurité** : Le script demande confirmation avant toute restauration
2. **Sauvegarde automatique** : L'état actuel est sauvegardé avant restauration
3. **Format de date** : Utilisez le format "dd/MM/yyyy HH:mm" pour la restauration
4. **Espace disque** : Les sauvegardes peuvent prendre de l'espace, surveillez le dossier `backups/`

## 🛠️ Exemples d'Utilisation

### Sauvegarde immédiate
```powershell
.\backup.ps1 -action backup
```

### Restauration d'une sauvegarde spécifique
```powershell
.\backup.ps1 -action restore -date "07/08/2025 02:05"
```

### Voir toutes les sauvegardes disponibles
```powershell
.\backup.ps1 -action list
```

## 🔍 Dépannage

### Problème : "Aucune sauvegarde trouvée"
- Vérifiez le format de date (dd/MM/yyyy HH:mm)
- Utilisez `.\backup.ps1 -action list` pour voir les dates disponibles

### Problème : "Plusieurs sauvegardes trouvées"
- Le script affiche toutes les sauvegardes correspondantes
- Choisissez la plus récente ou utilisez une date plus précise

### Problème : Erreur de permissions
- Exécutez PowerShell en tant qu'administrateur
- Vérifiez les permissions sur le dossier du projet

## 📝 Notes

- Les sauvegardes sont stockées dans le dossier `backups/` à la racine du projet
- Chaque sauvegarde contient un fichier `backup_info.json` avec les métadonnées
- Le script crée automatiquement une sauvegarde de l'état actuel avant restauration
- Utilisez Git en parallèle pour un contrôle de version plus avancé 