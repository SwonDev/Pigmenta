import { useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { CustomColor, ValidationResult, UsePaletteBuilderReturn, CustomPalette } from '@/types';
import { CustomColorUtils } from '@/utils/customColorUtils';

// Función auxiliar para convertir HSL a hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Hook personalizado para gestionar el constructor de paletas personalizadas
 * Proporciona toda la lógica necesaria para crear y editar paletas
 */
export const usePaletteBuilder = (): UsePaletteBuilderReturn => {
  const {
    paletteBuilderState,
    updatePaletteBuilderState,
    resetPaletteBuilder,
    addColorToPaletteBuilder,
    removeColorFromPaletteBuilder,
    updateColorInPaletteBuilder,
    reorderColorsInPaletteBuilder,
    saveCustomPalette,
    updateCustomPalette,
    validateCustomPalette,
    currentCustomPalette
  } = useAppStore();

  // Validación en tiempo real
  const validation = useMemo((): ValidationResult => {
    if (!paletteBuilderState.name.trim() || paletteBuilderState.colors.length === 0) {
      return {
        isValid: false,
        errors: [],
        warnings: []
      };
    }

    const palette: CustomPalette = {
      id: paletteBuilderState.id || '',
      name: paletteBuilderState.name,
      description: paletteBuilderState.description,
      colors: paletteBuilderState.colors,
      tags: paletteBuilderState.tags.map(tag => ({ id: CustomColorUtils.generateColorId(), name: tag, color: '#000000' })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      colorCount: paletteBuilderState.colors.length,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'User'
      }
    };
    
    return validateCustomPalette(palette);
  }, [paletteBuilderState, validateCustomPalette]);

  // Estado de guardado
  const canSave = useMemo(() => {
    return validation.isValid && 
           paletteBuilderState.name.trim().length > 0 && 
           paletteBuilderState.colors.length > 0;
  }, [validation.isValid, paletteBuilderState.name, paletteBuilderState.colors.length]);

  // Agregar color desde picker
  const addColor = useCallback((colorValue: string) => {
    const newColor = CustomColorUtils.createCustomColor(colorValue, paletteBuilderState.colors.length);
    addColorToPaletteBuilder(newColor.value);
  }, [addColorToPaletteBuilder, paletteBuilderState.colors.length]);

  // Agregar color en posición específica
  const addColorAtPosition = useCallback((colorValue: string, position: number) => {
    const newColor = CustomColorUtils.createCustomColor(colorValue, position);
    const newColors = [...paletteBuilderState.colors];
    newColors.splice(position, 0, newColor);
    
    updatePaletteBuilderState({
      colors: CustomColorUtils.updatePositions(newColors)
    });
  }, [paletteBuilderState.colors, updatePaletteBuilderState]);

  // Remover color
  const removeColor = useCallback((colorId: string) => {
    removeColorFromPaletteBuilder(colorId);
  }, [removeColorFromPaletteBuilder]);

  // Actualizar color
  const updateColor = useCallback((colorId: string, updates: Partial<CustomColor>) => {
    updateColorInPaletteBuilder(colorId, updates);
  }, [updateColorInPaletteBuilder]);

  // Reordenar colores
  const reorderColors = useCallback((startIndex: number, endIndex: number) => {
      reorderColorsInPaletteBuilder(startIndex, endIndex);
    }, [reorderColorsInPaletteBuilder]);

  // Duplicar color
  const duplicateColor = useCallback((colorId: string) => {
    const color = CustomColorUtils.findColorById(paletteBuilderState.colors, colorId);
    if (color) {
      const duplicatedColor = CustomColorUtils.duplicateColor(color, paletteBuilderState.colors.length);
      addColorToPaletteBuilder(duplicatedColor.value);
    }
  }, [paletteBuilderState.colors, addColorToPaletteBuilder]);

  // Actualizar nombre
  const updateName = useCallback((name: string) => {
    updatePaletteBuilderState({ name });
  }, [updatePaletteBuilderState]);

  // Actualizar descripción
  const updateDescription = useCallback((description: string) => {
    updatePaletteBuilderState({ description });
  }, [updatePaletteBuilderState]);

  // Agregar tag
  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !paletteBuilderState.tags.includes(tag.trim())) {
      updatePaletteBuilderState({
        tags: [...paletteBuilderState.tags, tag.trim()]
      });
    }
  }, [paletteBuilderState.tags, updatePaletteBuilderState]);

  // Remover tag
  const removeTag = useCallback((tag: string) => {
    updatePaletteBuilderState({
      tags: paletteBuilderState.tags.filter(t => t !== tag)
    });
  }, [paletteBuilderState.tags, updatePaletteBuilderState]);

  // Limpiar constructor
  const clear = useCallback(() => {
    resetPaletteBuilder();
  }, [resetPaletteBuilder]);

  // Guardar paleta
  const save = useCallback(async () => {
    if (!canSave) return false;

    try {
      updatePaletteBuilderState({ saveState: { isSaving: true, lastSaved: null, hasUnsavedChanges: true } });

      const paletteToSave = {
        id: paletteBuilderState.id || CustomColorUtils.generateColorId(),
        name: paletteBuilderState.name,
        description: paletteBuilderState.description,
        colors: paletteBuilderState.colors,
        tags: paletteBuilderState.tags,
        metadata: {
          createdAt: paletteBuilderState.id ? currentCustomPalette?.metadata.createdAt || new Date() : new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          author: 'User'
        }
      };

      if (paletteBuilderState.id && currentCustomPalette) {
        // Actualizar paleta existente
        await updateCustomPalette(paletteBuilderState.id, paletteToSave);
      } else {
        // Crear nueva paleta
        await saveCustomPalette(paletteToSave.name, paletteToSave.description);
      }

      updatePaletteBuilderState({ 
        saveState: { isSaving: false, lastSaved: new Date().toISOString(), hasUnsavedChanges: false },
        id: paletteToSave.id
      });

      return true;
    } catch {
      updatePaletteBuilderState({ 
        saveState: { 
          isSaving: false, 
          lastSaved: null,
          hasUnsavedChanges: true
        }
      });
      return false;
    }
  }, [
    canSave,
    paletteBuilderState, 
    currentCustomPalette, 
    saveCustomPalette, 
    updateCustomPalette, 
    updatePaletteBuilderState
  ]);

  // Cargar paleta para edición
  const loadForEdit = useCallback((paletteId: string) => {
    const palette = useAppStore.getState().customPalettes.find(p => p.id === paletteId);
    if (palette) {
      updatePaletteBuilderState({
        id: palette.id,
        name: palette.name,
        description: palette.description || '',
        colors: palette.colors,
        tags: Array.isArray(palette.tags) ? palette.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
        saveState: { isSaving: false, lastSaved: null, hasUnsavedChanges: false }
      });
    }
  }, [updatePaletteBuilderState]);

  // Importar desde paleta automática
  const importFromAutomaticPalette = useCallback(() => {
    const { palette } = useAppStore.getState();
    if (palette && palette.shades.length > 0) {
        const colors = palette.shades.map((shade, index) => 
          CustomColorUtils.createCustomColor(shade.color.hex, index)
        );
      
      updatePaletteBuilderState({
        colors: CustomColorUtils.updatePositions(colors),
        name: `Paleta ${palette.name || 'Importada'}`
      });
    }
  }, [updatePaletteBuilderState]);

  // Generar colores aleatorios
  const generateRandomColors = useCallback((count: number = 5) => {
    const colors: CustomColor[] = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
      const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
      // Convertir HSL a hex primero
      const hexColor = hslToHex(hue, saturation, lightness);
      const color = CustomColorUtils.createCustomColor(hexColor, paletteBuilderState.colors.length);
      colors.push(color);
    }
    
    updatePaletteBuilderState({
      colors: CustomColorUtils.updatePositions(colors)
    });
  }, [updatePaletteBuilderState, paletteBuilderState.colors.length]);

  // Efecto para auto-guardar (opcional)
  useEffect(() => {
    if (paletteBuilderState.config.autoSave && canSave && paletteBuilderState.id) {
      const timeoutId = setTimeout(() => {
        save();
      }, 2000); // Auto-guardar después de 2 segundos de inactividad

      return () => clearTimeout(timeoutId);
    }
  }, [paletteBuilderState.config.autoSave, paletteBuilderState.id, canSave, save]);

  return {
    // Estado
    state: paletteBuilderState,
    validation: paletteBuilderState.validation,
    isEditing: !!paletteBuilderState.id,
    canSave,
    
    // Acciones de colores
    addColor,
    addColorAtPosition,
    removeColor,
    updateColor,
    reorderColors,
    duplicateColor,
    
    // Acciones de metadatos
    updateName,
    updateDescription,
    addTag,
    removeTag,
    
    // Acciones generales
    clearBuilder: clear,
    clear,
    save,
    savePalette: async () => { await save(); },
    loadPalette: (palette: CustomPalette) => loadForEdit(palette.id),
    importFromAutomaticPalette,
    generateRandomColors,
    
    // Historial
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false
  };
};