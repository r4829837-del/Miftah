# Script de sauvegarde et restauration pour le projet Appamine
# Usage: 
#   Sauvegarde: .\backup.ps1 -action backup
#   Restauration: .\backup.ps1 -action restore -date "07/08/2025 02:05"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "restore", "list")]
    [string]$action,
    
    [Parameter(Mandatory=$false)]
    [string]$date
)

# Configuration
$projectRoot = $PSScriptRoot
$backupDir = Join-Path $projectRoot "backups"
$excludePatterns = @(
    "node_modules",
    ".git",
    "backups",
    "*.log",
    "dist",
    "build",
    ".env.local",
    ".env.production"
)

# Créer le dossier de sauvegarde s'il n'existe pas
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

function Create-Backup {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupName = "appamine_backup_$timestamp"
    $backupPath = Join-Path $backupDir $backupName
    
    Write-Host "Création de la sauvegarde: $backupName" -ForegroundColor Green
    
    # Créer le dossier de sauvegarde
    New-Item -ItemType Directory -Path $backupPath | Out-Null
    
    # Copier tous les fichiers en excluant les patterns spécifiés
    Get-ChildItem -Path $projectRoot -Recurse | Where-Object {
        $shouldExclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($_.FullName -like "*$pattern*") {
                $shouldExclude = $true
                break
            }
        }
        return !$shouldExclude
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($projectRoot.Length + 1)
        $targetPath = Join-Path $backupPath $relativePath
        
        if ($_.PSIsContainer) {
            if (!(Test-Path $targetPath)) {
                New-Item -ItemType Directory -Path $targetPath | Out-Null
            }
        } else {
            $targetDir = Split-Path $targetPath -Parent
            if (!(Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir | Out-Null
            }
            Copy-Item $_.FullName -Destination $targetPath
        }
    }
    
    # Créer un fichier de métadonnées
    $metadata = @{
        "timestamp" = $timestamp
        "date" = Get-Date -Format "dd/MM/yyyy HH:mm"
        "description" = "Sauvegarde automatique du projet Appamine"
        "files_count" = (Get-ChildItem -Path $backupPath -Recurse -File).Count
    }
    $metadata | ConvertTo-Json | Out-File -FilePath (Join-Path $backupPath "backup_info.json") -Encoding UTF8 -Force
    
    Write-Host "Sauvegarde terminée: $backupPath" -ForegroundColor Green
    Write-Host "Date et heure: $(Get-Date -Format 'dd/MM/yyyy à HH:mm')" -ForegroundColor Yellow
    Write-Host "Pour restaurer cette sauvegarde, utilisez:" -ForegroundColor Cyan
    Write-Host ".\backup.ps1 -action restore -date `"$(Get-Date -Format 'dd/MM/yyyy HH:mm')`"" -ForegroundColor Cyan
}

function Restore-Backup {
    if (!$date) {
        Write-Host "Erreur: Vous devez spécifier une date pour la restauration" -ForegroundColor Red
        Write-Host "Usage: .\backup.ps1 -action restore -date `"07/08/2025 02:05`"" -ForegroundColor Yellow
        return
    }
    
    # Convertir la date en format de recherche
    $searchDate = $date -replace " ", "_" -replace ":", "-"
    $searchPattern = "*$searchDate*"
    
    $backupFolders = Get-ChildItem -Path $backupDir -Directory | Where-Object { $_.Name -like $searchPattern }
    
    if ($backupFolders.Count -eq 0) {
        Write-Host "Aucune sauvegarde trouvée pour la date: $date" -ForegroundColor Red
        Write-Host "Sauvegardes disponibles:" -ForegroundColor Yellow
        List-Backups
        return
    }
    
    if ($backupFolders.Count -gt 1) {
        Write-Host "Plusieurs sauvegardes trouvées pour cette date:" -ForegroundColor Yellow
        $backupFolders | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Cyan }
        return
    }
    
    $backupPath = $backupFolders[0].FullName
    
    Write-Host "Restauration de la sauvegarde: $($backupFolders[0].Name)" -ForegroundColor Green
    Write-Host "Cette opération va remplacer tous les fichiers actuels!" -ForegroundColor Red
    
    $confirmation = Read-Host "Êtes-vous sûr de vouloir continuer? (oui/non)"
    if ($confirmation -ne "oui") {
        Write-Host "Restauration annulée" -ForegroundColor Yellow
        return
    }
    
    # Créer une sauvegarde de l'état actuel avant restauration
    $currentBackup = "pre_restore_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    $currentBackupPath = Join-Path $backupDir $currentBackup
    Copy-Item -Path $projectRoot -Destination $currentBackupPath -Recurse -Exclude $excludePatterns
    
    # Supprimer les fichiers actuels (sauf backups et node_modules)
    Get-ChildItem -Path $projectRoot -Recurse | Where-Object {
        $_.FullName -ne $backupDir -and 
        $_.FullName -notlike "*node_modules*" -and
        $_.FullName -notlike "*backups*"
    } | Remove-Item -Recurse -Force
    
    # Restaurer les fichiers de la sauvegarde
    Get-ChildItem -Path $backupPath -Recurse | ForEach-Object {
        if (!$_.PSIsContainer) {
            $relativePath = $_.FullName.Substring($backupPath.Length + 1)
            $targetPath = Join-Path $projectRoot $relativePath
            $targetDir = Split-Path $targetPath -Parent
            
            if (!(Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir | Out-Null
            }
            Copy-Item $_.FullName -Destination $targetPath
        }
    }
    
    Write-Host "Restauration terminée avec succès!" -ForegroundColor Green
    Write-Host "Une sauvegarde de l'état précédent a été créée: $currentBackup" -ForegroundColor Yellow
}

function List-Backups {
    $backups = Get-ChildItem -Path $backupDir -Directory | Sort-Object CreationTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "Aucune sauvegarde trouvée" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Sauvegardes disponibles:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($backup in $backups) {
        $infoFile = Join-Path $backup.FullName "backup_info.json"
        if (Test-Path $infoFile) {
            $info = Get-Content $infoFile | ConvertFrom-Json
            Write-Host "[SAUVEGARDE] $($backup.Name)" -ForegroundColor Cyan
            Write-Host "   Date: $($info.date)" -ForegroundColor White
            Write-Host "   Fichiers: $($info.files_count)" -ForegroundColor Gray
        } else {
            Write-Host "[SAUVEGARDE] $($backup.Name)" -ForegroundColor Cyan
            Write-Host "   Date: $($backup.CreationTime.ToString('dd/MM/yyyy HH:mm'))" -ForegroundColor White
        }
        Write-Host ""
    }
}

# Exécution principale
switch ($action) {
    "backup" {
        Create-Backup
    }
    "restore" {
        Restore-Backup
    }
    "list" {
        List-Backups
    }
} 