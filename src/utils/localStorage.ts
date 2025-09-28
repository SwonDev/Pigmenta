import { AppSettings, ExportHistoryItem, ColorPalette } from '../types';
import { DEFAULT_SETTINGS } from '../types';

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'pigmenta_settings',
  EXPORT_HISTORY: 'pigmenta_export_history',
  COLOR_HISTORY: 'pigmenta_color_history',
  CURRENT_PALETTE: 'pigmenta_current_palette'
} as const;

// Generic storage utilities
const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage for key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage for key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
};

// Settings persistence
export const settingsStorage = {
  load: (): AppSettings => {
    return storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  save: (settings: AppSettings): void => {
    storage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  reset: (): void => {
    storage.remove(STORAGE_KEYS.SETTINGS);
  }
};

// Export history persistence
export const exportHistoryStorage = {
  load: (): ExportHistoryItem[] => {
    return storage.get(STORAGE_KEYS.EXPORT_HISTORY, []);
  },

  save: (history: ExportHistoryItem[]): void => {
    storage.set(STORAGE_KEYS.EXPORT_HISTORY, history);
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.EXPORT_HISTORY);
  }
};

// Color history persistence
export const colorHistoryStorage = {
  load: (): string[] => {
    return storage.get(STORAGE_KEYS.COLOR_HISTORY, []);
  },

  save: (colors: string[]): void => {
    // Limit to last 20 colors
    const limitedColors = colors.slice(0, 20);
    storage.set(STORAGE_KEYS.COLOR_HISTORY, limitedColors);
  },

  add: (color: string): string[] => {
    const currentHistory = colorHistoryStorage.load();
    
    // Remove if already exists to avoid duplicates
    const filteredHistory = currentHistory.filter(c => c !== color);
    
    // Add to beginning
    const newHistory = [color, ...filteredHistory].slice(0, 20);
    
    colorHistoryStorage.save(newHistory);
    return newHistory;
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.COLOR_HISTORY);
  }
};

// Current palette persistence
export const paletteStorage = {
  load: (): ColorPalette | null => {
    return storage.get(STORAGE_KEYS.CURRENT_PALETTE, null);
  },

  save: (palette: ColorPalette): void => {
    storage.set(STORAGE_KEYS.CURRENT_PALETTE, palette);
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.CURRENT_PALETTE);
  }
};

// Migration utilities for future versions
export const migrationUtils = {
  getCurrentVersion: (): string => {
    return storage.get('pigmenta_version', '1.0.0');
  },

  setVersion: (version: string): void => {
    storage.set('pigmenta_version', version);
  },

  migrateIfNeeded: (): void => {
    const currentVersion = migrationUtils.getCurrentVersion();
    
    // Future migrations can be added here
    if (currentVersion === '1.0.0') {
      // No migration needed for initial version
      return;
    }
    
    // Set current version
    migrationUtils.setVersion('1.0.0');
  }
};

// Initialize storage and run migrations
export const initializeStorage = (): void => {
  try {
    migrationUtils.migrateIfNeeded();
  } catch (error) {
    console.warn('Error during storage initialization:', error);
  }
};

// Storage health check
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__pigmenta_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Export all storage utilities
export default {
  settings: settingsStorage,
  exportHistory: exportHistoryStorage,
  colorHistory: colorHistoryStorage,
  palette: paletteStorage,
  migration: migrationUtils,
  initialize: initializeStorage,
  isAvailable: isStorageAvailable,
  clear: storage.clear
};