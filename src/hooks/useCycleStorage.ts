import { useCallback } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { 
  getCycleLocalStorage, 
  setCycleLocalStorage, 
  removeCycleLocalStorage,
  getCycleLocalStorageKey 
} from '../lib/storage';

/**
 * Hook personnalisé pour gérer le stockage localStorage par cycle
 * Assure une indépendance totale entre les cycles collège et secondaire
 */
export const useCycleStorage = () => {
  const { currentCycle } = useCycle();

  const getStorage = useCallback((key: string) => {
    return getCycleLocalStorage(key, currentCycle);
  }, [currentCycle]);

  const setStorage = useCallback((key: string, value: any) => {
    setCycleLocalStorage(key, value, currentCycle);
  }, [currentCycle]);

  const removeStorage = useCallback((key: string) => {
    removeCycleLocalStorage(key, currentCycle);
  }, [currentCycle]);

  const getStorageKey = useCallback((key: string) => {
    return getCycleLocalStorageKey(key, currentCycle);
  }, [currentCycle]);

  return {
    getStorage,
    setStorage,
    removeStorage,
    getStorageKey,
    currentCycle
  };
};

/**
 * Hook pour gérer les données spécifiques à un cycle
 * @param key - Clé de stockage
 * @param defaultValue - Valeur par défaut
 */
export const useCycleData = <T>(key: string, defaultValue: T) => {
  const { getStorage, setStorage } = useCycleStorage();

  const getData = useCallback((): T => {
    const data = getStorage(key);
    return data !== null ? data : defaultValue;
  }, [getStorage, key, defaultValue]);

  const setData = useCallback((value: T) => {
    setStorage(key, value);
  }, [setStorage, key]);

  const clearData = useCallback(() => {
    setStorage(key, defaultValue);
  }, [setStorage, key, defaultValue]);

  return {
    data: getData(),
    setData,
    clearData,
    getData
  };
};