import type {
  CustomPalette,
  StoredCustomPalettes,
  StorageMetadata,
  PaletteSettings,
  StorageInfo,
} from '../types';

import {
  CUSTOM_PALETTE_STORAGE_KEY,
  CUSTOM_PALETTE_VERSION,
  DEFAULT_PALETTE_BUILDER_CONFIG,
  DEFAULT_PALETTE_MANAGER_CONFIG,
} from '../types';

/**
 * Sistema de persistencia para paletas personalizadas en localStorage
 */
export class CustomPaletteStorage {
  private static readonly STORAGE_KEY = CUSTOM_PALETTE_STORAGE_KEY;
  private static readonly VERSION = CUSTOM_PALETTE_VERSION;
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Guarda todas las paletas en localStorage
   */
  static async save(palettes: CustomPalette[]): Promise<void> {
    try {
      const data: StoredCustomPalettes = {
        version: this.VERSION,
        palettes,
        metadata: this.createMetadata(palettes),
        settings: this.getDefaultSettings(),
      };

      const serialized = JSON.stringify(data);
      
      // Verificar tamaño
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        throw new Error('Las paletas exceden el límite de almacenamiento');
      }

      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error guardando paletas:', error);
      throw new Error('No se pudieron guardar las paletas');
    }
  }

  /**
   * Carga todas las paletas desde localStorage
   */
  static async load(): Promise<CustomPalette[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (!stored) {
        return [];
      }

      const data: StoredCustomPalettes = JSON.parse(stored);
      
      // Verificar versión y migrar si es necesario
      if (data.version !== this.VERSION) {
        const migrated = await this.migrate(data);
        await this.save(migrated);
        return migrated;
      }

      return data.palettes || [];
    } catch (error) {
      console.error('Error cargando paletas:', error);
      return [];
    }
  }

  /**
   * Guarda una paleta individual
   */
  static async savePalette(palette: CustomPalette): Promise<void> {
    const palettes = await this.load();
    const existingIndex = palettes.findIndex(p => p.id === palette.id);
    
    if (existingIndex >= 0) {
      palettes[existingIndex] = palette;
    } else {
      palettes.push(palette);
    }
    
    await this.save(palettes);
  }

  /**
   * Elimina una paleta por ID
   */
  static async deletePalette(id: string): Promise<void> {
    const palettes = await this.load();
    const filtered = palettes.filter(p => p.id !== id);
    await this.save(filtered);
  }

  /**
   * Busca una paleta por ID
   */
  static async findPalette(id: string): Promise<CustomPalette | null> {
    const palettes = await this.load();
    return palettes.find(p => p.id === id) || null;
  }

  /**
   * Exporta todas las paletas como JSON
   */
  static async exportPalettes(): Promise<string> {
    const palettes = await this.load();
    const exportData = {
      version: this.VERSION,
      exportedAt: new Date().toISOString(),
      palettes,
      metadata: {
        totalPalettes: palettes.length,
        exportSource: 'Pigmenta',
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importa paletas desde JSON
   */
  static async importPalettes(jsonData: string): Promise<CustomPalette[]> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.palettes || !Array.isArray(importData.palettes)) {
        throw new Error('Formato de importación inválido');
      }

      // Validar estructura de paletas
      const validPalettes = importData.palettes.filter(this.isValidPalette);
      
      if (validPalettes.length === 0) {
        throw new Error('No se encontraron paletas válidas para importar');
      }

      // Generar nuevos IDs para evitar conflictos
      const palettesWithNewIds = validPalettes.map(palette => ({
        ...palette,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Agregar a las paletas existentes
      const existingPalettes = await this.load();
      const allPalettes = [...existingPalettes, ...palettesWithNewIds];
      
      await this.save(allPalettes);
      
      return palettesWithNewIds;
    } catch (error) {
      console.error('Error importando paletas:', error);
      throw new Error('No se pudieron importar las paletas');
    }
  }

  /**
   * Obtiene información del almacenamiento
   */
  static getStorageInfo(): StorageInfo {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const size = stored ? new Blob([stored]).size : 0;
      
      if (!stored) {
        return {
          totalSize: 0,
          paletteCount: 0,
          lastModified: '',
          version: this.VERSION,
        };
      }

      const data: StoredCustomPalettes = JSON.parse(stored);
      
      return {
        totalSize: size,
        paletteCount: data.palettes?.length || 0,
        lastModified: data.metadata?.lastModified || '',
        version: data.version || 'unknown',
      };
    } catch (error) {
      console.error('Error obteniendo información de almacenamiento:', error);
      return {
        totalSize: 0,
        paletteCount: 0,
        lastModified: '',
        version: 'error',
      };
    }
  }

  /**
   * Limpia todas las paletas del almacenamiento
   */
  static async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error limpiando almacenamiento:', error);
      throw new Error('No se pudo limpiar el almacenamiento');
    }
  }

  /**
   * Alias para load() - carga todas las paletas
   */
  static async loadPalettes(): Promise<CustomPalette[]> {
    return this.load();
  }

  /**
   * Alias para clear() - limpia todas las paletas
   */
  static async clearPalettes(): Promise<void> {
    return this.clear();
  }

  /**
   * Migra datos de versiones anteriores
   */
  private static async migrate(oldData: { palettes?: CustomPalette[] }): Promise<CustomPalette[]> {
    console.log('Migrando paletas de versión anterior...');
    
    // Por ahora, simplemente retornamos las paletas existentes
    // En el futuro, aquí se implementarían las migraciones específicas
    return oldData.palettes || [];
  }

  /**
   * Crea metadatos para el almacenamiento
   */
  private static createMetadata(palettes: CustomPalette[]): StorageMetadata {
    return {
      lastModified: new Date().toISOString(),
      totalPalettes: palettes.length,
      storageSize: 0, // Se calculará al serializar
      migrationVersion: this.VERSION,
    };
  }

  /**
   * Obtiene la configuración por defecto
   */
  private static getDefaultSettings(): PaletteSettings {
    return {
      builderConfig: DEFAULT_PALETTE_BUILDER_CONFIG,
      managerConfig: DEFAULT_PALETTE_MANAGER_CONFIG,
      exportPreferences: {
        defaultFormat: 'css',
        includeMetadata: true,
        compressOutput: false,
      },
      uiPreferences: {
        showColorNames: true,
        showColorValues: true,
        animationsEnabled: true,
        compactMode: false,
      },
    };
  }

  /**
   * Valida si un objeto es una paleta válida
   */
  private static isValidPalette(palette: unknown): palette is CustomPalette {
    if (!palette || typeof palette !== 'object') return false;
    
    const p = palette as Record<string, unknown>;
    
    return (
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      Array.isArray(p.colors) &&
      typeof p.createdAt === 'string' &&
      typeof p.updatedAt === 'string' &&
      typeof p.colorCount === 'number'
    );
  }

  /**
   * Genera un ID único
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Comprime datos para almacenamiento (implementación futura)
   */
  private static compress(data: string): string {
    // Por ahora retornamos los datos sin comprimir
    // En el futuro se puede implementar compresión LZ
    return data;
  }

  /**
   * Descomprime datos del almacenamiento (implementación futura)
   */
  private static decompress(data: string): string {
    // Por ahora retornamos los datos tal como están
    return data;
  }

  /**
   * Verifica el espacio disponible en localStorage
   */
  static checkAvailableSpace(): number {
    try {
      const testKey = '__test_storage__';
      const testData = 'x'.repeat(1024); // 1KB
      let size = 0;
      
      while (size < this.MAX_STORAGE_SIZE) {
        try {
          localStorage.setItem(testKey + size, testData);
          size += 1024;
        } catch {
          break;
        }
      }
      
      // Limpiar datos de prueba
      for (let i = 0; i < size; i += 1024) {
        localStorage.removeItem(testKey + i);
      }
      
      return size;
    } catch {
      return 0;
    }
  }

  /**
   * Optimiza el almacenamiento eliminando datos innecesarios
   */
  static async optimize(): Promise<void> {
    const palettes = await this.load();
    
    // Eliminar metadatos innecesarios y optimizar estructura
    const optimizedPalettes = palettes.map(palette => ({
      ...palette,
      metadata: palette.metadata ? {
        source: palette.metadata.source,
        version: palette.metadata.version,
      } : undefined,
    }));
    
    await this.save(optimizedPalettes);
  }
}