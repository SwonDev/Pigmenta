import { useCallback, useMemo, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { 
  CustomPalette, 
  SortOption, 
  FilterOptions, 
  UsePaletteManagerReturn,
  CreateCustomPaletteInput,
  UpdateCustomPaletteInput
} from '@/types';

interface UsePaletteManagerOptions {
  onEditPalette?: (paletteId: string) => void;
}

// Función helper para descargar archivos automáticamente
const downloadFile = (content: string, filename: string, contentType: string = 'application/json') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Función helper para generar nombre de archivo con fecha
const generateFilename = (prefix: string, extension: string = 'json'): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${prefix}-${year}${month}${day}-${hours}${minutes}.${extension}`;
};

// Función helper para validar archivo JSON
const validateJsonFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      resolve(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target?.result as string);
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
};

/**
 * Hook personalizado para gestionar las paletas guardadas
 * Proporciona funcionalidades de filtrado, ordenamiento y gestión
 */
export const usePaletteManager = (options?: UsePaletteManagerOptions): UsePaletteManagerReturn => {
  const {
    customPalettes,
    createCustomPalette,
    updateCustomPalette,
    deleteCustomPalette,
    duplicateCustomPalette,
    exportCustomPalettes,
    importCustomPalettes,
    loadCustomPalettes,
    selectCustomPalette: setCurrentCustomPalette
  } = useAppStore();

  // Estado local para filtros y ordenamiento
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    dateRange: undefined,
    colorCount: undefined
  });
  const [selectedPalettes, setSelectedPalettes] = useState<string[]>([]);

  // Obtener todas las tags únicas
  const availableTags = useMemo((): string[] => {
    const tagSet = new Set<string>();
    customPalettes.forEach(palette => {
      palette.tags?.forEach(tag => {
        if (typeof tag === 'string') {
          tagSet.add(tag);
        } else {
          tagSet.add(tag.name);
        }
      });
    });
    return Array.from(tagSet);
  }, [customPalettes]);

  // Filtrar paletas
  const filteredPalettes = useMemo((): CustomPalette[] => {
    let filtered = [...customPalettes];

    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(palette => 
        palette.name.toLowerCase().includes(searchLower) ||
        palette.description?.toLowerCase().includes(searchLower) ||
        palette.tags?.some(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          return tagName.toLowerCase().includes(searchLower);
        })
      );
    }

    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(palette =>
        filters.tags!.every(filterTag => 
          palette.tags?.some(paletteTag => {
            const tagName = typeof paletteTag === 'string' ? paletteTag : paletteTag.name;
            return tagName === filterTag;
          })
        )
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(palette => {
        const date = new Date(palette.metadata?.updatedAt || palette.updatedAt);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return date >= startDate && date <= endDate;
      });
    }

    // Filtro por cantidad de colores
    if (filters.colorCount) {
      const { min, max } = filters.colorCount;
      filtered = filtered.filter(palette =>
        palette.colors.length >= min && palette.colors.length <= max
      );
    }

    return filtered;
    }, [customPalettes, filters, searchTerm]);

  // Ordenar paletas
  const sortedPalettes = useMemo((): CustomPalette[] => {
    const sorted = [...filteredPalettes];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name-asc':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'name-desc':
          comparison = b.name.localeCompare(a.name);
          break;
        case 'created-asc':
          comparison = new Date(a.metadata?.createdAt || a.createdAt).getTime() - new Date(b.metadata?.createdAt || b.createdAt).getTime();
          break;
        case 'created-desc':
          comparison = new Date(b.metadata?.createdAt || b.createdAt).getTime() - new Date(a.metadata?.createdAt || a.createdAt).getTime();
          break;
        case 'updated-asc':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'updated-desc':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'color-count-asc':
          comparison = a.colors.length - b.colors.length;
          break;
        case 'color-count-desc':
          comparison = b.colors.length - a.colors.length;
          break;
        default:
          comparison = 0;
      }

      return comparison;
    });

    return sorted;
  }, [filteredPalettes, sortBy]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: customPalettes.length,
    filtered: filteredPalettes.length,
    selected: selectedPalettes.length,
    totalColors: customPalettes.reduce((sum, palette) => sum + palette.colors.length, 0),
    averageColors: customPalettes.length > 0 
      ? Math.round(customPalettes.reduce((sum, palette) => sum + palette.colors.length, 0) / customPalettes.length)
      : 0
  }), [customPalettes, filteredPalettes, selectedPalettes]);

  // Actualizar filtro de búsqueda
  const updateSearchTerm = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  // Actualizar filtros de tags
  const updateTagFilters = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  }, []);

  // Actualizar filtro de rango de fechas
  const updateDateRange = useCallback((dateRange: { start: string; end: string } | undefined) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);

  // Actualizar filtro de cantidad de colores
  const updateColorCountFilter = useCallback((colorCount: { min: number; max: number } | undefined) => {
    setFilters(prev => ({ ...prev, colorCount }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      tags: [],
      dateRange: undefined,
      colorCount: undefined
    });
  }, []);

  // Actualizar ordenamiento
  const updateSort = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  // Seleccionar paleta
  const selectPalette = useCallback((paletteId: string) => {
    setCurrentCustomPalette(paletteId);
  }, [setCurrentCustomPalette]);

  // Wrapper para createPalette que coincida con la interfaz
  const createPalette = useCallback(async (input: CreateCustomPaletteInput): Promise<string> => {
    const palette = await createCustomPalette(input);
    return palette.id;
  }, [createCustomPalette]);

  // Wrapper para updatePalette que coincida con la interfaz
  const updatePalette = useCallback(async (id: string, updates: Partial<CustomPalette>): Promise<void> => {
    const updateInput: UpdateCustomPaletteInput = {
      name: updates.name,
      colors: updates.colors,
      description: updates.description,
      tags: updates.tags?.map(tag => typeof tag === 'string' ? tag : tag.name)
    };
    await updateCustomPalette(id, updateInput);
  }, [updateCustomPalette]);

  // Eliminar paleta
  const deletePalette = useCallback(async (paletteId: string): Promise<void> => {
    try {
      await deleteCustomPalette(paletteId);
      // Remover de selección si estaba seleccionada
      setSelectedPalettes(prev => prev.filter(id => id !== paletteId));
    } catch (error) {
      console.error('Error al eliminar paleta:', error);
      throw error;
    }
  }, [deleteCustomPalette]);

  // Duplicar paleta
  const duplicatePalette = useCallback(async (paletteId: string): Promise<string> => {
    try {
      const newPalette = await duplicateCustomPalette(paletteId);
      return newPalette.id;
    } catch (error) {
      console.error('Error al duplicar paleta:', error);
      throw error;
    }
  }, [duplicateCustomPalette]);

  // Gestión de selección múltiple
  const togglePaletteSelection = useCallback((paletteId: string) => {
    setSelectedPalettes(prev => 
      prev.includes(paletteId)
        ? prev.filter(id => id !== paletteId)
        : [...prev, paletteId]
    );
  }, []);



  const clearSelection = useCallback(() => {
    setSelectedPalettes([]);
  }, []);

  // Eliminar paletas seleccionadas
  const deleteSelectedPalettes = useCallback(async () => {
    try {
      await Promise.all(selectedPalettes.map(id => deleteCustomPalette(id)));
      setSelectedPalettes([]);
      return true;
    } catch (error) {
      console.error('Error al eliminar paletas seleccionadas:', error);
      return false;
    }
  }, [selectedPalettes, deleteCustomPalette]);

  // Exportar paletas seleccionadas
  const exportSelectedPalettes = useCallback(async (): Promise<void> => {
    try {
      await exportCustomPalettes();
    } catch (error) {
      console.error('Error al exportar paletas:', error);
      throw error;
    }
  }, [exportCustomPalettes]);

  // Importar paletas
  const importPalettes = useCallback(async (file: File): Promise<number> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await importCustomPalettes(data);
      return Array.isArray(result) ? result.length : 0;
    } catch (error) {
      console.error('Error al importar paletas:', error);
      return 0;
    }
  }, [importCustomPalettes]);





  // Funciones de manejo para PaletteManager mejoradas
  const handleSelectPalette = useCallback((paletteId: string) => {
    togglePaletteSelection(paletteId);
  }, [togglePaletteSelection]);

  const handleDeleteSelectedPalettes = useCallback(async () => {
    return await deleteSelectedPalettes();
  }, [deleteSelectedPalettes]);

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('🔄 Iniciando importación de paletas...');
      
      // Validar que sea un archivo JSON
      const isValidJson = await validateJsonFile(file);
      if (!isValidJson) {
        console.error('❌ Error: El archivo debe ser un JSON válido');
        event.target.value = '';
        return;
      }

      console.log('✅ Archivo JSON válido, procesando...');
      
      // Importar paletas
      const importedCount = await importPalettes(file);
      
      if (importedCount > 0) {
        console.log(`🎨 ¡Éxito! Se importaron ${importedCount} paleta(s) correctamente`);
      } else {
        console.log('⚠️ No se encontraron paletas válidas para importar');
      }
      
    } catch (error) {
      console.error('❌ Error durante la importación:', error);
      console.error('Por favor, verifica que el archivo tenga el formato correcto');
    } finally {
      // Reset input
      event.target.value = '';
    }
  }, [importPalettes]);

  const handleExport = useCallback(async () => {
    try {
      console.log('🔄 Iniciando exportación de paletas...');
      
      // Obtener datos de exportación
      const exportData = await exportCustomPalettes();
      
      if (!exportData) {
        console.error('❌ No hay datos para exportar');
        return;
      }

      // Generar nombre de archivo con fecha
      const filename = generateFilename('paletas-pigmenta');
      
      // Convertir a JSON string con formato legible
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      // Descargar archivo automáticamente
      downloadFile(jsonContent, filename);
      
      console.log(`🎨 ¡Éxito! Paletas exportadas como "${filename}"`);
      console.log(`📁 El archivo se ha descargado automáticamente`);
      
    } catch (error) {
      console.error('❌ Error durante la exportación:', error);
      console.error('No se pudo completar la exportación de paletas');
    }
  }, [exportCustomPalettes]);

  const handleEditPalette = useCallback((paletteId: string) => {
    options?.onEditPalette?.(paletteId);
  }, [options?.onEditPalette]);

  const handleDuplicatePalette = useCallback(async (paletteId: string) => {
    await duplicatePalette(paletteId);
  }, [duplicatePalette]);

  const handleDeletePalette = useCallback(async (paletteId: string) => {
    await deletePalette(paletteId);
  }, [deletePalette]);

  return {
    // Estado
    palettes: customPalettes,
    filteredPalettes: sortedPalettes,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    sortBy,
    setSortBy: updateSort,
    filters,
    selectedPalettes,
    availableTags,
    stats,
    
    // Acciones CRUD
    createPalette,
    updatePalette,
    deletePalette,
    duplicatePalette,
    
    // Gestión de selección
    selectPalette,
    clearSelection,
    togglePaletteSelection,
    
    // Filtros y búsqueda
    updateSearchTerm,
    updateTagFilters,
    updateDateRange,
    updateColorCountFilter,
    clearFilters,
    updateSort,
    
    // Importación/Exportación
    exportPalettes: exportSelectedPalettes,
    exportSelectedPalettes,
    importPalettes,
    
    // Funciones de manejo para PaletteManager
    handleSelectPalette,
    handleDeleteSelectedPalettes,
    handleFileImport,
    handleExport,
    handleEditPalette,
    handleDuplicatePalette,
    handleDeletePalette,
    
    // Utilidades
    refreshPalettes: loadCustomPalettes
  };
};