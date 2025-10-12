import { exportDatabase, importDatabase } from '../lib/storage';

export interface DatabaseMetadata {
  exportedAt: string;
  version: string;
  application: string;
  totalRecords: {
    students: number;
    users: number;
    tests: number;
    testResults: number;
  };
  checksum?: string;
}

export interface DatabaseBackup {
  data: any;
  metadata: DatabaseMetadata;
  filename: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private autoBackupInterval: NodeJS.Timeout | null = null;
  private lastBackupTime: Date | null = null;

  private constructor() {
    this.initializeAutoBackup();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Export database with enhanced metadata and validation
   */
  public async exportDatabaseWithMetadata(): Promise<DatabaseBackup> {
    try {
      const data = await exportDatabase();
      
      // Create metadata
      const metadata: DatabaseMetadata = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        application: 'Arabic School Management',
        totalRecords: {
          students: data.students?.length || 0,
          users: data.users?.length || 0,
          tests: data.tests?.length || 0,
          testResults: data.testResults?.length || 0
        },
        checksum: this.generateChecksum(data)
      };

      // Create filename with timestamp
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
      
      const filename = `school_database_backup_${timestamp}.json`;

      return {
        data,
        metadata,
        filename
      };
    } catch (error) {
      console.error('Error exporting database:', error);
      throw new Error('فشل في تصدير قاعدة البيانات');
    }
  }

  /**
   * Import database with validation and error handling
   */
  public async importDatabaseWithValidation(backup: DatabaseBackup): Promise<boolean> {
    try {
      // Validate backup structure
      if (!this.validateBackupStructure(backup)) {
        throw new Error('ملف قاعدة البيانات غير صالح');
      }

      // Validate checksum if available
      if (backup.metadata.checksum) {
        const currentChecksum = this.generateChecksum(backup.data);
        if (currentChecksum !== backup.metadata.checksum) {
          throw new Error('ملف قاعدة البيانات تالف أو تم تعديله');
        }
      }

      // Create backup before import
      await this.createPreImportBackup();

      // Import the data
      await importDatabase(backup.data);

      // Update last backup time
      this.lastBackupTime = new Date();

      return true;
    } catch (error) {
      console.error('Error importing database:', error);
      throw error;
    }
  }

  /**
   * Download database backup to local file
   */
  public async downloadBackup(): Promise<void> {
    try {
      const backup = await this.exportDatabaseWithMetadata();
      
      const exportData = {
        ...backup.data,
        metadata: backup.metadata
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup time
      this.lastBackupTime = new Date();
      
      // Store backup info in localStorage
      this.storeBackupInfo(backup);
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }

  /**
   * Download database backup using the browser's Save File dialog (if supported)
   * Falls back to regular download if the File System Access API is unavailable
   */
  public async downloadBackupToPicker(): Promise<void> {
    try {
      const backup = await this.exportDatabaseWithMetadata();

      const exportData = {
        ...backup.data,
        metadata: backup.metadata
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const anyWindow = window as any;
      const supportsPicker = typeof anyWindow?.showSaveFilePicker === 'function';

      if (supportsPicker) {
        const handle = await anyWindow.showSaveFilePicker({
          suggestedName: backup.filename,
          types: [
            {
              description: 'JSON Database Backup',
              accept: { 'application/json': ['.json'] }
            }
          ]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // Fallback to regular download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Update last backup time and store info
      this.lastBackupTime = new Date();
      this.storeBackupInfo(backup);
    } catch (error) {
      console.error('Error downloading backup with picker:', error);
      throw error;
    }
  }

  /**
   * Upload and import database backup from file
   */
  public async uploadAndImportBackup(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;
          const parsedData = JSON.parse(fileContent);
          
          // Extract data and metadata
          const { metadata, ...data } = parsedData;
          
          const backup: DatabaseBackup = {
            data,
            metadata: metadata || {
              exportedAt: new Date().toISOString(),
              version: '1.0',
              application: 'Arabic School Management',
              totalRecords: {
                students: data.students?.length || 0,
                users: data.users?.length || 0,
                tests: data.tests?.length || 0,
                testResults: data.testResults?.length || 0
              }
            },
            filename: file.name
          };

          const success = await this.importDatabaseWithValidation(backup);
          resolve(success);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('فشل في قراءة الملف'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<{
    students: number;
    users: number;
    tests: number;
    testResults: number;
    totalSize: string;
    lastBackup?: string;
  }> {
    try {
      const data = await exportDatabase();
      
      return {
        students: data.students?.length || 0,
        users: data.users?.length || 0,
        tests: data.tests?.length || 0,
        testResults: data.testResults?.length || 0,
        totalSize: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
        lastBackup: this.lastBackupTime?.toISOString()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Initialize automatic backup system
   */
  private initializeAutoBackup(): void {
    // Check if auto-backup is enabled
    const autoBackupEnabled = localStorage.getItem('autoBackupEnabled') === 'true';
    
    if (autoBackupEnabled) {
      // Set up incremental auto-backup every 30 minutes
      this.autoBackupInterval = setInterval(() => {
        this.createIncrementalBackup();
      }, 30 * 60 * 1000); // 30 minutes
    }

    // Create initial backup on first load
    this.createInitialBackup();
  }

  /**
   * Create automatic backup
   */
  private async createAutoBackup(): Promise<void> {
    try {
      const backup = await this.exportDatabaseWithMetadata();
      
      // Store in localStorage (limited space, so we keep only the latest)
      const autoBackupKey = 'autoBackup_' + new Date().toISOString().split('T')[0];
      localStorage.setItem(autoBackupKey, JSON.stringify(backup));
      
      // Clean up old auto-backups (keep only last 7 days)
      this.cleanupOldAutoBackups();
      
      console.log('Auto-backup created successfully');
    } catch (error) {
      console.error('Error creating auto-backup:', error);
    }
  }

  /**
   * Create incremental backup (store only changed top-level stores since last backup)
   */
  private async createIncrementalBackup(): Promise<void> {
    try {
      const current = await this.exportDatabaseWithMetadata();
      const last = localStorage.getItem('lastFullBackup');
      const lastData = last ? (JSON.parse(last).data || {}) : {};

      const diff: any = {};
      const keys = new Set<string>([
        ...Object.keys(lastData || {}),
        ...Object.keys(current.data || {})
      ]);

      keys.forEach((key) => {
        const prevVal = (lastData as any)[key];
        const currVal = (current.data as any)[key];
        if (JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
          (diff as any)[key] = currVal;
        }
      });

      const delta = {
        deltaOf: current.metadata.exportedAt,
        keys: Object.keys(diff),
        data: diff,
      };

      const deltaKey = 'autoBackupDelta_' + new Date().toISOString();
      localStorage.setItem(deltaKey, JSON.stringify(delta));

      // Track last backup time
      this.lastBackupTime = new Date();
    } catch (error) {
      console.error('Error creating incremental backup:', error);
    }
  }

  /**
   * Create initial backup
   */
  private async createInitialBackup(): Promise<void> {
    try {
      const backup = await this.exportDatabaseWithMetadata();
      localStorage.setItem('initialBackup', JSON.stringify(backup));
      // Also store as the last full backup baseline for incrementals
      localStorage.setItem('lastFullBackup', JSON.stringify(backup));
    } catch (error) {
      console.error('Error creating initial backup:', error);
    }
  }

  /**
   * Create backup before import
   */
  private async createPreImportBackup(): Promise<void> {
    try {
      const backup = await this.exportDatabaseWithMetadata();
      localStorage.setItem('preImportBackup', JSON.stringify(backup));
    } catch (error) {
      console.error('Error creating pre-import backup:', error);
    }
  }

  /**
   * Clean up old auto-backups
   */
  private cleanupOldAutoBackups(): void {
    const keys = Object.keys(localStorage);
    const autoBackupKeys = keys.filter(key => key.startsWith('autoBackup_'));
    
    // Keep only the last 7 days
    if (autoBackupKeys.length > 7) {
      autoBackupKeys
        .sort()
        .slice(0, autoBackupKeys.length - 7)
        .forEach(key => localStorage.removeItem(key));
    }

    // Clean up old incremental deltas (keep last 50)
    const deltaKeys = keys.filter(key => key.startsWith('autoBackupDelta_'));
    if (deltaKeys.length > 50) {
      deltaKeys
        .sort()
        .slice(0, deltaKeys.length - 50)
        .forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * Generate checksum for data validation
   */
  private generateChecksum(data: any): string {
    const dataString = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  /**
   * Validate backup structure
   */
  private validateBackupStructure(backup: DatabaseBackup): boolean {
    return !!(
      backup.data &&
      backup.data.students &&
      backup.data.users &&
      backup.data.settings &&
      backup.data.tests &&
      backup.data.testResults &&
      backup.metadata &&
      backup.metadata.exportedAt &&
      backup.metadata.version &&
      backup.metadata.application
    );
  }

  /**
   * Store backup information
   */
  private storeBackupInfo(backup: DatabaseBackup): void {
    const backupInfo = {
      filename: backup.filename,
      exportedAt: backup.metadata.exportedAt,
      totalRecords: backup.metadata.totalRecords,
      size: JSON.stringify(backup.data).length
    };
    
    localStorage.setItem('lastBackupInfo', JSON.stringify(backupInfo));
  }

  /**
   * Enable/disable auto-backup
   */
  public setAutoBackup(enabled: boolean): void {
    localStorage.setItem('autoBackupEnabled', enabled.toString());
    
    if (enabled && !this.autoBackupInterval) {
      this.autoBackupInterval = setInterval(() => {
        this.createIncrementalBackup();
      }, 30 * 60 * 1000);
    } else if (!enabled && this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  /**
   * Get auto-backup status
   */
  public isAutoBackupEnabled(): boolean {
    return localStorage.getItem('autoBackupEnabled') === 'true';
  }

  /**
   * Get last backup information
   */
  public getLastBackupInfo(): any {
    const info = localStorage.getItem('lastBackupInfo');
    return info ? JSON.parse(info) : null;
  }

  /**
   * Restore from auto-backup
   */
  public async restoreFromAutoBackup(date: string): Promise<boolean> {
    try {
      const autoBackupKey = 'autoBackup_' + date;
      const backupData = localStorage.getItem(autoBackupKey);
      
      if (!backupData) {
        throw new Error('لا يوجد نسخة احتياطية لهذا التاريخ');
      }
      
      const backup: DatabaseBackup = JSON.parse(backupData);
      return await this.importDatabaseWithValidation(backup);
    } catch (error) {
      console.error('Error restoring from auto-backup:', error);
      throw error;
    }
  }

  /**
   * Get available auto-backups
   */
  public getAvailableAutoBackups(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith('autoBackup_'))
      .map(key => key.replace('autoBackup_', ''))
      .sort()
      .reverse();
  }

  /**
   * Get available incremental backups (delta keys)
   */
  public getAvailableIncrementalBackups(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith('autoBackupDelta_'))
      .sort()
      .reverse();
  }

  /**
   * Get last incremental backup ISO time, if any
   */
  public getLastIncrementalBackupTime(): string | null {
    const deltas = this.getAvailableIncrementalBackups();
    if (deltas.length === 0) return null;
    const latestKey = deltas[0];
    const raw = localStorage.getItem(latestKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.deltaOf || new Date().toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Cleanup service
   */
  public cleanup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance(); 