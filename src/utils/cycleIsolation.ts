/**
 * Système de protection contre l'entrelacement des données entre cycles
 * Garantit une séparation totale entre collège et secondaire
 */

import { getCurrentCycle } from './cycleUtils';

// Types pour la validation
type CycleType = 'متوسط' | 'ثانوي';
type DataType = 'students' | 'tests' | 'grades' | 'analysis' | 'reports' | 'settings';

/**
 * Valide que les données appartiennent au bon cycle
 */
export function validateCycleData(data: any, expectedCycle: CycleType, dataType: DataType): boolean {
  if (!data) return false;
  
  // Vérifier que le cycle dans les données correspond au cycle attendu
  if (data.cycle && data.cycle !== expectedCycle) {
    console.error(`❌ VIOLATION D'INDÉPENDANCE: Données ${dataType} du cycle ${data.cycle} dans le contexte ${expectedCycle}`);
    return false;
  }
  
  // Vérifier que les données ne contiennent pas de références croisées
  if (data.students && Array.isArray(data.students)) {
    for (const student of data.students) {
      if (student.cycle && student.cycle !== expectedCycle) {
        console.error(`❌ VIOLATION D'INDÉPENDANCE: Étudiant du cycle ${student.cycle} dans le contexte ${expectedCycle}`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Nettoie les données pour s'assurer qu'elles appartiennent au bon cycle
 */
export function sanitizeCycleData(data: any, targetCycle: CycleType): any {
  if (!data) return data;
  
  // Forcer le cycle dans les données
  const sanitized = { ...data };
  sanitized.cycle = targetCycle;
  
  // Nettoyer les étudiants
  if (sanitized.students && Array.isArray(sanitized.students)) {
    sanitized.students = sanitized.students.map((student: any) => ({
      ...student,
      cycle: targetCycle
    }));
  }
  
  return sanitized;
}

/**
 * Génère une clé unique pour chaque cycle et type de données
 */
export function generateCycleKey(dataType: DataType, cycle: CycleType, additionalId?: string): string {
  const baseKey = `${dataType}_${cycle}`;
  return additionalId ? `${baseKey}_${additionalId}` : baseKey;
}

/**
 * Vérifie l'intégrité de l'isolation des cycles
 */
export function checkCycleIsolation(): {
  isValid: boolean;
  violations: string[];
  recommendations: string[];
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Vérifier les clés localStorage
    const localStorageKeys = Object.keys(localStorage);
    const cycleKeys = localStorageKeys.filter(key => 
      key.includes('متوسط') || key.includes('ثانوي')
    );
    
    // Vérifier qu'il n'y a pas de mélange dans les clés
    const متوسطKeys = cycleKeys.filter(key => key.includes('متوسط'));
    const ثانويKeys = cycleKeys.filter(key => key.includes('ثانوي'));
    
    // Vérifier l'intégrité des données
    for (const key of cycleKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.cycle) {
          const keyCycle = key.includes('متوسط') ? 'متوسط' : 'ثانوي';
          if (data.cycle !== keyCycle) {
            violations.push(`Clé ${key} contient des données du cycle ${data.cycle} mais devrait être ${keyCycle}`);
          }
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    
    // Recommandations
    if (violations.length === 0) {
      recommendations.push('✅ Isolation des cycles maintenue correctement');
    } else {
      recommendations.push('🔧 Nettoyage recommandé pour maintenir l\'isolation');
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    };
    
  } catch (error) {
    return {
      isValid: false,
      violations: [`Erreur lors de la vérification: ${error}`],
      recommendations: ['🔧 Vérification manuelle recommandée']
    };
  }
}

/**
 * Nettoie complètement les données d'un cycle spécifique
 */
export async function clearCycleData(cycle: CycleType): Promise<void> {
  try {
    // Nettoyer localStorage
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes(cycle)
    );
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    
    // Nettoyer IndexedDB
    const dbNames = [
      `schoolManagement_${cycle}`,
      `schoolManagement_students_${cycle}`,
      `schoolManagement_tests_${cycle}`,
      `schoolManagement_grades_${cycle}`,
      `schoolManagement_analysis_${cycle}`,
      `schoolManagement_reports_${cycle}`,
      `schoolManagement_settings_${cycle}`
    ];
    
    for (const dbName of dbNames) {
      try {
        const db = await indexedDB.deleteDatabase(dbName);
        console.log(`🗑️ Base de données ${dbName} supprimée`);
      } catch (e) {
        console.warn(`⚠️ Impossible de supprimer ${dbName}:`, e);
      }
    }
    
    console.log(`✅ Données du cycle ${cycle} complètement nettoyées`);
    
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage du cycle ${cycle}:`, error);
    throw error;
  }
}

/**
 * Protège contre l'accès aux données du mauvais cycle
 */
export function protectCycleAccess<T>(
  data: T, 
  currentCycle: CycleType, 
  dataType: DataType
): T | null {
  if (!validateCycleData(data, currentCycle, dataType)) {
    console.error(`🚫 ACCÈS BLOQUÉ: Tentative d'accès aux données ${dataType} du mauvais cycle`);
    return null;
  }
  
  return sanitizeCycleData(data, currentCycle);
}

/**
 * Logs de surveillance pour détecter les violations
 */
export function logCycleAccess(operation: string, cycle: CycleType, dataType: DataType): void {
  console.log(`📊 ${operation} - Cycle: ${cycle} - Type: ${dataType} - Timestamp: ${new Date().toISOString()}`);
}

/**
 * Surveillance continue de l'intégrité des cycles
 */
export function startCycleMonitoring(): void {
  setInterval(() => {
    const check = checkCycleIsolation();
    if (!check.isValid) {
      console.warn('⚠️ VIOLATIONS DÉTECTÉES:', check.violations);
      console.info('💡 RECOMMANDATIONS:', check.recommendations);
    }
  }, 30000); // Vérification toutes les 30 secondes
}