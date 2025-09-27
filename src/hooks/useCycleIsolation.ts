import { useEffect, useState, useCallback } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { 
  validateCycleData, 
  sanitizeCycleData, 
  checkCycleIsolation,
  clearCycleData,
  protectCycleAccess,
  logCycleAccess
} from '../utils/cycleIsolation';

type DataType = 'students' | 'tests' | 'grades' | 'analysis' | 'reports' | 'settings';

/**
 * Hook pour garantir l'isolation totale des cycles
 */
export function useCycleIsolation() {
  const { currentCycle } = useCycle();
  const [isolationStatus, setIsolationStatus] = useState<{
    isValid: boolean;
    violations: string[];
    recommendations: string[];
  } | null>(null);

  // Vérifier l'intégrité de l'isolation
  const checkIsolation = useCallback(() => {
    const status = checkCycleIsolation();
    setIsolationStatus(status);
    return status;
  }, []);

  // Nettoyer complètement les données du cycle actuel
  const clearCurrentCycleData = useCallback(async () => {
    try {
      await clearCycleData(currentCycle);
      setIsolationStatus({
        isValid: true,
        violations: [],
        recommendations: [`✅ Données du cycle ${currentCycle} nettoyées`]
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      setIsolationStatus({
        isValid: false,
        violations: [`Erreur lors du nettoyage: ${error}`],
        recommendations: ['🔧 Nettoyage manuel recommandé']
      });
    }
  }, [currentCycle]);

  // Protéger l'accès aux données
  const protectDataAccess = useCallback(<T>(
    data: T,
    dataType: DataType,
    operation: string
  ): T | null => {
    logCycleAccess(operation, currentCycle, dataType);
    return protectCycleAccess(data, currentCycle, dataType);
  }, [currentCycle]);

  // Valider les données avant utilisation
  const validateData = useCallback(<T>(
    data: T,
    dataType: DataType
  ): T | null => {
    if (!validateCycleData(data, currentCycle, dataType)) {
      console.error(`❌ Données invalides pour le cycle ${currentCycle}`);
      return null;
    }
    return sanitizeCycleData(data, currentCycle);
  }, [currentCycle]);

  // Vérifier l'isolation au montage et lors du changement de cycle
  useEffect(() => {
    checkIsolation();
  }, [currentCycle, checkIsolation]);

  // Surveillance continue
  useEffect(() => {
    const interval = setInterval(checkIsolation, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, [checkIsolation]);

  return {
    currentCycle,
    isolationStatus,
    checkIsolation,
    clearCurrentCycleData,
    protectDataAccess,
    validateData,
    isIsolated: isolationStatus?.isValid ?? true
  };
}

/**
 * Hook pour les opérations sécurisées sur les données
 */
export function useSecureDataOperations() {
  const { protectDataAccess, validateData, currentCycle } = useCycleIsolation();

  // Opération sécurisée de lecture
  const secureRead = useCallback(<T>(
    data: T,
    dataType: DataType,
    operation: string = 'lecture'
  ): T | null => {
    return protectDataAccess(data, dataType, operation);
  }, [protectDataAccess]);

  // Opération sécurisée d'écriture
  const secureWrite = useCallback(<T>(
    data: T,
    dataType: DataType,
    operation: string = 'écriture'
  ): T | null => {
    const validated = validateData(data, dataType);
    if (validated) {
      return protectDataAccess(validated, dataType, operation);
    }
    return null;
  }, [validateData, protectDataAccess]);

  // Opération sécurisée de suppression
  const secureDelete = useCallback((
    dataType: DataType,
    operation: string = 'suppression'
  ): boolean => {
    logCycleAccess(operation, currentCycle, dataType);
    return true;
  }, [currentCycle]);

  return {
    secureRead,
    secureWrite,
    secureDelete,
    currentCycle
  };
}