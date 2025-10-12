# 🚀 Guide Rapide - Sauvegarde Appamine

## ✅ Votre projet est maintenant protégé !

### 📋 Commandes Principales

**Créer une sauvegarde :**
```bash
.\sauvegarde.bat backup
```

**Restaurer une sauvegarde :**
```bash
.\sauvegarde.bat restore "07/08/2025 02:08"
```

**Voir toutes les sauvegardes :**
```bash
.\sauvegarde.bat list
```

### 🎯 Exemple Concret

Si vous voulez restaurer votre projet à l'état du **07/08/2025 à 02:08**, tapez simplement :

```bash
.\sauvegarde.bat restore "07/08/2025 02:08"
```

Le système va :
1. ✅ Demander confirmation
2. ✅ Sauvegarder l'état actuel (au cas où)
3. ✅ Restaurer exactement l'état du 07/08/2025 à 02:08
4. ✅ Confirmer la restauration

### 📁 Où sont stockées les sauvegardes ?

Dans le dossier `backups/` à la racine de votre projet :
```
appamine/
├── backups/
│   └── appamine_backup_2025-08-07_02-08-19/
│       ├── src/ (tous vos fichiers)
│       ├── package.json
│       └── backup_info.json
```

### ⚡ Utilisation Avancée

**Avec PowerShell directement :**
```powershell
.\backup.ps1 -action backup
.\backup.ps1 -action restore -date "07/08/2025 02:08"
.\backup.ps1 -action list
```

### 🛡️ Sécurité

- ✅ Confirmation avant restauration
- ✅ Sauvegarde automatique de l'état actuel
- ✅ Exclusion des fichiers inutiles (node_modules, .git, etc.)
- ✅ Métadonnées détaillées pour chaque sauvegarde

### 📞 En cas de problème

1. **Vérifiez les sauvegardes disponibles :** `.\sauvegarde.bat list`
2. **Utilisez le format de date exact :** "dd/MM/yyyy HH:mm"
3. **Consultez le README complet :** `README_BACKUP.md`

---

**🎉 Votre projet est maintenant protégé contre les mauvaises manipulations !** 