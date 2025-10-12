@echo off
chcp 65001 >nul
echo ========================================
echo    SYSTEME DE SAUVEGARDE APPAMINE
echo ========================================
echo.

if "%1"=="backup" (
    echo Creation d'une sauvegarde...
    powershell -ExecutionPolicy Bypass -File backup.ps1 -action backup
    goto :end
)

if "%1"=="restore" (
    if "%2"=="" (
        echo Erreur: Vous devez specifier une date pour la restauration
        echo Usage: sauvegarde.bat restore "07/08/2025 02:05"
        goto :end
    )
    echo Restauration de la sauvegarde du %2...
    powershell -ExecutionPolicy Bypass -File backup.ps1 -action restore -date "%2"
    goto :end
)

if "%1"=="list" (
    echo Liste des sauvegardes disponibles:
    powershell -ExecutionPolicy Bypass -File backup.ps1 -action list
    goto :end
)

echo Usage:
echo   sauvegarde.bat backup                    - Creer une sauvegarde
echo   sauvegarde.bat restore "07/08/2025 02:05" - Restaurer une sauvegarde
echo   sauvegarde.bat list                      - Lister les sauvegardes
echo.
echo Exemple: sauvegarde.bat restore "07/08/2025 02:08"

:end
pause 