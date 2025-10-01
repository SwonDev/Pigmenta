import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  AppSettings,
  ColorValue,
  ColorPalette,
  ColorAlgorithm,
  NamingPattern,
  ColorFormat,
  ExportFormat,
  ExportHistoryItem,
  ExportConfig,
  ThemeMode,
  CustomPalette,
  CustomColor,
  PaletteBuilderState,
  CreateCustomPaletteInput,
  UpdateCustomPaletteInput,
  ValidationResult,
  PaletteAction
} from '../types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_PALETTE,
  DEFAULT_PALETTE_BUILDER_CONFIG
} from '../types';
import { 
  settingsStorage, 
  exportHistoryStorage, 
  colorHistoryStorage, 
  paletteStorage,
  initializeStorage 
} from '../utils/localStorage';
import { generatePalette, parseColorInput } from '../utils/colorUtils';
import { CustomPaletteStorage } from '../utils/customPaletteStorage';
import { PaletteConverter } from '../utils/paletteConverter';
import { PaletteValidator } from '../utils/paletteValidator';
import { CustomColorUtils, generateId } from '../utils/customColorUtils';

interface AppStore extends AppState {
  
  // Custom shade mode state
  customShadeMode: boolean;
  customShadeCount: number;
  
  // Computed properties
  isDark: boolean;
  shouldAnimatePalette: boolean;
  
  // Import palette state
  importedColors: string[];
  
  // Custom Palettes State
  customPalettes: CustomPalette[];
  currentCustomPalette: CustomPalette | null;
  paletteBuilderState: PaletteBuilderState;
  isCustomPaletteMode: boolean;
  
  // Actions para modo personalizado
  setCustomShadeMode: (enabled: boolean) => void;
  setCustomShadeCount: (count: number) => void;
  
  // Actions para paleta
  updatePalette: (palette: ColorPalette) => void;
  updateBaseColor: (color: ColorValue, shouldAnimate?: boolean) => void;
  updateAlgorithm: (algorithm: ColorAlgorithm) => void;
  updateContrastShift: (shift: number) => void;
  updateShadeCount: (count: number) => void;
  
  // Actions para importar colores
  addColor: (color: string) => void;
  clearColors: () => void;
  importPalette: (colors: string[]) => void;
  
  // Actions para configuración
  updateSettings: (settings: Partial<AppSettings>) => void;
  setActiveShade: (shade: number) => void;
  setExportFormat: (format: ExportFormat) => void;
  exportPalette: () => string;
  addToColorHistory: (color: string) => void;
  updateExportPreferences: (preferences: Partial<ExportConfig>) => void;
  
  // Actions para tema
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Actions para exportación
  toggleExportPanel: () => void;
  toggleSettingsPanel: () => void;
  addToExportHistory: (exportItem: Omit<ExportHistoryItem, 'id' | 'timestamp'>) => void;
  
  // Actions para reset
  resetToDefaults: () => void;
  
  // Alias functions for ControlsPanel compatibility
  setAlgorithm: (algorithm: ColorAlgorithm) => void;
  setContrastShift: (shift: number) => void;
  setShadeCount: (count: number) => void;
  setNamingPattern: (pattern: NamingPattern) => void;
  setControlsExpanded: (expanded: boolean) => void;
  toggleControls: () => void;
  
  // Custom Palette Actions
  
  // Mode Management
  setCustomPaletteMode: (enabled: boolean) => void;
  toggleCustomPaletteMode: () => void;
  
  // CRUD Operations
  createCustomPalette: (input: CreateCustomPaletteInput) => Promise<CustomPalette>;
  updateCustomPalette: (id: string, input: UpdateCustomPaletteInput) => Promise<void>;
  deleteCustomPalette: (id: string) => Promise<void>;
  duplicateCustomPalette: (id: string) => Promise<CustomPalette>;
  loadCustomPalettes: () => Promise<void>;
  clearCustomPalettes: () => Promise<void>;
  
  // Palette Selection
  selectCustomPalette: (id: string) => Promise<void>;
  clearCustomPaletteSelection: () => void;
  
  // Color Management
  addColorToCustomPalette: (paletteId: string, color: CustomColor) => Promise<void>;
  updateColorInCustomPalette: (paletteId: string, colorId: string, updates: Partial<CustomColor>) => Promise<void>;
  removeColorFromCustomPalette: (paletteId: string, colorId: string) => Promise<void>;
  reorderColorsInCustomPalette: (paletteId: string, colorIds: string[]) => Promise<void>;
  
  // Custom Palette Builder Actions
  updateBuilderState: (updates: Partial<PaletteBuilderState>) => void;
  resetBuilderState: () => void;
  updatePaletteBuilderState: (updates: Partial<PaletteBuilderState>) => void;
  resetPaletteBuilder: () => void;
  addColorToPaletteBuilder: (color: ColorValue, position?: number) => void;
  removeColorFromPaletteBuilder: (colorId: string) => void;
  updateColorInPaletteBuilder: (colorId: string, updates: Partial<CustomColor>) => void;
  reorderColorsInPaletteBuilder: (fromIndex: number, toIndex: number) => void;
  saveCustomPalette: (name: string, description?: string) => Promise<string>;
  loadPaletteForEditing: (paletteId: string) => void;
  
  // Conversion Operations
  convertStandardToCustom: (standardPalette?: ColorPalette) => CustomPalette;
  convertCustomToStandard: (customPalette: CustomPalette) => ColorPalette;
  mergeWithStandardPalette: (customPalette: CustomPalette) => ColorPalette;
  
  // Validation
  validateCustomPalette: (palette: Partial<CustomPalette>) => ValidationResult;
  validateCustomColor: (color: Partial<CustomColor>) => ValidationResult;
  
  // Import/Export
  exportCustomPalettes: () => Promise<string>;
  importCustomPalettes: (jsonData: string) => Promise<CustomPalette[]>;
  
  // Utility Actions
  generateColorName: (color: CustomColor) => string;
  findSimilarColors: (color: CustomColor, threshold?: number) => CustomColor[];
  optimizeCustomPalette: (paletteId: string) => Promise<void>;
  
  // History and Undo/Redo
  addPaletteAction: (action: PaletteAction) => void;
  undoLastAction: () => Promise<void>;
  redoLastAction: () => Promise<void>;
  clearActionHistory: () => void;
}

// Initialize storage on app start
initializeStorage();

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state - load from localStorage
      baseColor: INITIAL_PALETTE.baseColor,
      palette: INITIAL_PALETTE,
      activeShade: 500,
      shouldAnimatePalette: true,
      currentPalette: paletteStorage.load() || INITIAL_PALETTE,
      algorithm: 'tailwind' as ColorAlgorithm,
      contrastShift: 0,
      namingPattern: '50-950' as NamingPattern,
      shadeCount: 11,
      colorFormat: 'rgb' as ColorFormat,
      controlsExpanded: true,
      exportFormat: 'css' as ExportFormat,
      colorName: 'blue',
      theme: 'dark',
      settings: settingsStorage.load(),
      exportHistory: exportHistoryStorage.load(),
      isExportPanelOpen: false,
      isSettingsPanelOpen: false,
      isMobile: false, // Added missing property

      
      // Custom shade mode state
      customShadeMode: false,
      customShadeCount: 25,
      
      // Import palette state
      importedColors: [],
      
      // Custom Palettes State
      customPalettes: [],
      currentCustomPalette: null,
      isCustomPaletteMode: false,
      paletteBuilderState: {
        id: null,
        name: '',
        description: '',
        tags: [],
        colors: [],
        isEditing: false,
        editingColorId: null,
        editingPaletteId: null,
        dragState: null,
        validation: {
          name: { isValid: true, message: '' },
          colors: { isValid: true, message: '' },
          overall: { isValid: true, message: '' },
          isValid: true,
          warnings: [],
          errors: []
        },
        saveState: {
          isSaving: false,
          lastSaved: null,
          hasUnsavedChanges: false
        },
        config: DEFAULT_PALETTE_BUILDER_CONFIG,
        actionHistory: [],
        currentActionIndex: -1
      },
      
      // Computed properties
      get isDark() {
        return get().theme === 'dark';
      },

      // Actions para modo personalizado
      setCustomShadeMode: (enabled: boolean) => {
        const state = get();
        set({ customShadeMode: enabled });
        if (enabled) {
          // When enabling custom mode, use the custom count
          state.updateShadeCount(state.customShadeCount);
        } else {
          // When disabling custom mode, revert to the slider value
          state.updateShadeCount(state.shadeCount);
        }
      },

      setCustomShadeCount: (count: number) => {
        const state = get();
        set({ customShadeCount: count });
        if (state.customShadeMode) {
          // Only update the palette if custom mode is active
          state.updateShadeCount(count);
        }
      },

      // Actions
      updatePalette: (palette: ColorPalette) => {
        const currentState = get();
        // Only update if palette is actually different
        if (JSON.stringify(currentState.currentPalette) !== JSON.stringify(palette)) {
          set({ currentPalette: palette });
          paletteStorage.save(palette);
        }
      },

      updateBaseColor: (color: ColorValue, shouldAnimate: boolean = true) => {
        console.log('🎯 updateBaseColor llamado con:', { color, shouldAnimate });
        const state = get();
        const newPalette = generatePalette(
          color,
          state.algorithm,
          state.shadeCount,
          state.contrastShift,
          state.namingPattern,
          state.colorName
        );
        console.log('🎨 Nueva paleta generada:', newPalette);
        set({ currentPalette: newPalette, baseColor: color, shouldAnimatePalette: shouldAnimate });
        paletteStorage.save(newPalette);
        console.log('✅ Store actualizado con nueva paleta');
      },

      updateAlgorithm: (algorithm: ColorAlgorithm) => {
        const state = get();
        const newPalette = generatePalette(
          state.baseColor,
          algorithm,
          state.shadeCount,
          state.contrastShift,
          state.namingPattern,
          state.colorName
        );
        set({ currentPalette: newPalette, algorithm });
        paletteStorage.save(newPalette);
      },

      updateContrastShift: (shift: number) => {
        const state = get();
        // Generate new palette with contrast shift
        const newPalette = generatePalette(
          state.baseColor,
          state.algorithm,
          state.shadeCount,
          shift,
          state.namingPattern,
          state.colorName
        );
        set({ currentPalette: newPalette, contrastShift: shift });
        paletteStorage.save(newPalette);
      },

      updateShadeCount: (count: number) => {
        const state = get();
        const newPalette = generatePalette(
          state.baseColor,
          state.algorithm,
          count,
          state.contrastShift,
          state.namingPattern,
          state.colorName
        );
        set({ currentPalette: newPalette, shadeCount: count });
        paletteStorage.save(newPalette);
      },

      // Actions para importar colores
      addColor: (color: string) => {
        const state = get();
        const newColors = [...state.importedColors, color];
        set({ importedColors: newColors });
      },

      clearColors: () => {
        set({ importedColors: [] });
      },

      importPalette: (colors: string[]) => {
        if (colors.length === 0) return;
        
        // Use the first color as base color
        const baseColorString = colors[0];
        const state = get();
        
        // Validate and convert the base color string to ColorValue
        const baseColorValue = parseColorInput(baseColorString);
        if (!baseColorValue) {
          console.error('Invalid base color for import:', baseColorString);
          return;
        }
        
        // Generate a new palette with the base color
        const newPalette = generatePalette(
          baseColorValue,
          state.algorithm,
          state.shadeCount,
          state.contrastShift,
          state.namingPattern,
          'imported'
        );
        
        set({ 
          currentPalette: newPalette, 
          baseColor: baseColorValue,
          importedColors: colors 
        });
        paletteStorage.save(newPalette);
      },

      updateSettings: (settings: Partial<AppSettings>) => {
        const newSettings = { ...get().settings, ...settings };
        set({ settings: newSettings });
        settingsStorage.save(newSettings);
      },

      setActiveShade: (shade: number) => {
        set({ activeShade: shade });
      },

      setExportFormat: (format: ExportFormat) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          exportPreferences: {
            ...currentSettings.exportPreferences,
            format
          }
        };
        set({ settings: newSettings });
        settingsStorage.save(newSettings);
      },

      exportPalette: () => {
        const { currentPalette, settings } = get();
        if (!currentPalette || !currentPalette.shades.length) return '';
        
        const format = settings.exportPreferences.format;
        const palette = currentPalette;
        
        // Helper functions for color conversion
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 0, g: 0, b: 0 };
        };
        
        const hexToHsl = (hex: string) => {
          const rgb = hexToRgb(hex);
          const r = rgb.r / 255;
          const g = rgb.g / 255;
          const b = rgb.b / 255;
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0, s = 0;
          const l = (max + min) / 2;
          
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          
          return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
          };
        };
        
        switch (format) {
          case 'css': {
            return palette.shades
              .map(shade => `  --color-${palette.name}-${shade.name}: ${shade.color.hex};`)
              .join('\n');
          }
              
          case 'tailwind': {
            const tailwindColors = palette.shades.reduce((acc, shade) => {
              acc[shade.name] = shade.color.hex;
              return acc;
            }, {} as Record<string, string>);
            
            return `'${palette.name}': ${JSON.stringify(tailwindColors, null, 2)}`;
          }
            
          case 'tailwind4': {
            return palette.shades
              .map(shade => `@theme {\n  --color-${palette.name}-${shade.name}: ${shade.color.hex};\n}`)
              .join('\n\n');
          }
              
          case 'tokens': {
            const tokens = {
              [palette.name]: palette.shades.reduce((acc, shade) => {
                acc[shade.name] = {
                  value: shade.color.hex,
                  type: 'color'
                };
                return acc;
              }, {} as Record<string, { value: string; type: string }>)
            };
            
            return JSON.stringify(tokens, null, 2);
          }
            
          case 'svg': {
            const swatches = palette.shades
              .map((shade, index) => 
                `<rect x="${index * 50}" y="0" width="50" height="50" fill="${shade.color.hex}" />`
              )
              .join('\n  ');
              
            return `<svg width="${palette.shades.length * 50}" height="50" xmlns="http://www.w3.org/2000/svg">\n  ${swatches}\n</svg>`;
          }
          
          case 'hex': {
            return palette.shades
              .map(shade => `${shade.name}: ${shade.color.hex}`)
              .join('\n');
          }
          
          case 'react': {
            const colorObject = palette.shades.reduce((acc, shade) => {
              acc[shade.name] = shade.color.hex;
              return acc;
            }, {} as Record<string, string>);
            
            return `export const ${palette.name}Colors = ${JSON.stringify(colorObject, null, 2)};\n\nexport default ${palette.name}Colors;`;
          }
          
          case 'scss': {
            return palette.shades
              .map(shade => `$${palette.name}-${shade.name}: ${shade.color.hex};`)
              .join('\n');
          }
          
          case 'json': {
            const jsonData = {
              name: palette.name,
              algorithm: palette.algorithm,
              baseColor: palette.baseColor,
              colors: palette.shades.reduce((acc, shade) => {
                const rgb = hexToRgb(shade.color.hex);
                const hsl = hexToHsl(shade.color.hex);
                acc[shade.name] = {
                  hex: shade.color.hex,
                  rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                  hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                  values: { r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l }
                };
                return acc;
              }, {} as Record<string, { hex: string; rgb: string; hsl: string; values: { r: number; g: number; b: number; h: number; s: number; l: number } }>)
            };
            
            return JSON.stringify(jsonData, null, 2);
          }
          
          case 'javascript': {
            const jsObject = palette.shades.reduce((acc, shade) => {
              acc[shade.name] = shade.color.hex;
              return acc;
            }, {} as Record<string, string>);
            
            return `const ${palette.name}Colors = ${JSON.stringify(jsObject, null, 2)};\n\nmodule.exports = ${palette.name}Colors;`;
          }
          
          case 'typescript': {
            const tsInterface = palette.shades.map(shade => `  ${shade.name}: string;`).join('\n');
            const tsObject = palette.shades.reduce((acc, shade) => {
              acc[shade.name] = shade.color.hex;
              return acc;
            }, {} as Record<string, string>);
            
            return `interface ${palette.name}Colors {\n${tsInterface}\n}\n\nexport const ${palette.name.toLowerCase()}Colors: ${palette.name}Colors = ${JSON.stringify(tsObject, null, 2)};\n\nexport default ${palette.name.toLowerCase()}Colors;`;
          }
          
          case 'ase': {
            return `# Adobe Swatch Exchange (ASE) Format\n# Palette: ${palette.name}\n# Generated by Pigmenta\n\n${palette.shades.map(shade => `${shade.name}\t${shade.color.hex}\tRGB`).join('\n')}`;
          }
          
          case 'gpl': {
            const gplHeader = `GIMP Palette\nName: ${palette.name}\nColumns: ${Math.min(palette.shades.length, 4)}\n#`;
            const gplColors = palette.shades.map(shade => {
              const rgb = hexToRgb(shade.color.hex);
              return `${rgb.r.toString().padStart(3)} ${rgb.g.toString().padStart(3)} ${rgb.b.toString().padStart(3)} ${shade.name}`;
            }).join('\n');
            
            return `${gplHeader}\n${gplColors}`;
          }
          
          case 'sketch': {
            const sketchPalette = {
              compatibleVersion: "2.0",
              pluginVersion: "2.22",
              colors: palette.shades.map(shade => {
                const rgb = hexToRgb(shade.color.hex);
                return {
                  name: `${palette.name} ${shade.name}`,
                  red: rgb.r / 255,
                  green: rgb.g / 255,
                  blue: rgb.b / 255,
                  alpha: 1
                };
              })
            };
            
            return JSON.stringify(sketchPalette, null, 2);
          }
          
          case 'figma': {
            const figmaTokens = {
              [palette.name]: {
                ...palette.shades.reduce((acc, shade) => {
                  acc[shade.name] = {
                    value: shade.color.hex,
                    type: "color",
                    description: `${palette.name} color shade ${shade.name}`
                  };
                  return acc;
                }, {} as Record<string, { value: string; type: string; description: string }>)
              }
            };
            
            return JSON.stringify(figmaTokens, null, 2);
          }
            
          default:
            return '';
        }
      },

      addToColorHistory: (color: string) => {
        const newHistory = colorHistoryStorage.add(color);
        set((state) => ({
          settings: {
            ...state.settings,
            colorHistory: newHistory
          }
        }));
      },

      toggleExportPanel: () => {
        set((state) => ({ isExportPanelOpen: !state.isExportPanelOpen }));
      },

      toggleSettingsPanel: () => {
        set((state) => ({ isSettingsPanelOpen: !state.isSettingsPanelOpen }));
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light';
          const newSettings: AppSettings = { ...state.settings, theme: newTheme };
          settingsStorage.save(newSettings);
          return { theme: newTheme, settings: newSettings };
        });
      },

      setTheme: (theme: ThemeMode) => {
        set((state) => {
          const newSettings: AppSettings = { ...state.settings, theme };
          settingsStorage.save(newSettings);
          return { theme, settings: newSettings };
        });
      },

      updateExportPreferences: (preferences: Partial<ExportConfig>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            exportPreferences: {
              ...state.settings.exportPreferences,
              ...preferences
            }
          }
        }));
      },

      addToExportHistory: (exportItem: Omit<ExportHistoryItem, 'id' | 'timestamp'>) => {
        const item: ExportHistoryItem = {
          ...exportItem,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        set((state) => {
          const newItems = [item, ...state.exportHistory].slice(0, 50);
          exportHistoryStorage.save(newItems);
          return {
            exportHistory: newItems
          };
        });
      },

      resetToDefaults: () => {
        // Clear localStorage
        paletteStorage.clear();
        settingsStorage.reset();
        exportHistoryStorage.clear();
        colorHistoryStorage.clear();
        
        set({
          currentPalette: INITIAL_PALETTE,
          settings: DEFAULT_SETTINGS,
          exportHistory: [],
          isExportPanelOpen: false,
          isSettingsPanelOpen: false,
          theme: 'dark'
        });
      },

      // Alias functions for ControlsPanel compatibility
      setAlgorithm: (algorithm: ColorAlgorithm) => {
        set({ algorithm });
        get().updateAlgorithm(algorithm);
      },

      setContrastShift: (shift: number) => {
        set({ contrastShift: shift });
        get().updateContrastShift(shift);
      },

      setShadeCount: (count: number) => {
        const state = get();
        set({ shadeCount: count });
        // Only update the palette if custom mode is not active
        if (!state.customShadeMode) {
          state.updateShadeCount(count);
        }
      },

      setNamingPattern: (pattern: NamingPattern) => {
        const state = get();
        const newPalette = generatePalette(
          state.currentPalette.baseColor,
          state.currentPalette.algorithm,
          state.currentPalette.shades?.length || 9,
          state.contrastShift,
          pattern,
          state.currentPalette.name
        );
        set({ namingPattern: pattern, currentPalette: newPalette });
        paletteStorage.save(newPalette);
      },

      setControlsExpanded: (expanded: boolean) => {
        set({ controlsExpanded: expanded });
      },

      toggleControls: () => {
        set((state) => ({ controlsExpanded: !state.controlsExpanded }));
      },

      // Custom Palette Actions Implementation
      
      // Mode Management
      setCustomPaletteMode: (enabled: boolean) => {
        set({ isCustomPaletteMode: enabled });
        if (enabled) {
          get().loadCustomPalettes();
        }
      },

      toggleCustomPaletteMode: () => {
        const state = get();
        console.log('🔥 toggleCustomPaletteMode ejecutado');
        console.log('🔥 isCustomPaletteMode antes:', state.isCustomPaletteMode);
        state.setCustomPaletteMode(!state.isCustomPaletteMode);
        console.log('🔥 isCustomPaletteMode después:', !state.isCustomPaletteMode);
      },

      // CRUD Operations
      createCustomPalette: async (input: CreateCustomPaletteInput): Promise<CustomPalette> => {
        const newPalette: CustomPalette = {
          id: generateId(),
          name: input.name,
          description: input.description || '',
          colors: (input.colors || []).map((color, index) => ({
            id: generateId(),
            value: color,
            position: index,
            name: CustomColorUtils.generateColorName(color),
            locked: false
          })),
          tags: (input.tags || []).map(tag => 
            typeof tag === 'string' 
              ? { id: generateId(), name: tag, color: '#6366F1' }
              : tag
          ),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          colorCount: input.colors?.length || 0,
          isActive: false,
          metadata: {
            source: 'manual',
            version: '1.0',
            exportCount: 0
          }
        };

        await CustomPaletteStorage.savePalette(newPalette);
        
        set((state) => ({
          customPalettes: [...state.customPalettes, newPalette]
        }));

        return newPalette;
      },

      updateCustomPalette: async (id: string, input: UpdateCustomPaletteInput): Promise<void> => {
        const state = get();
        const paletteIndex = state.customPalettes.findIndex(p => p.id === id);
        
        if (paletteIndex === -1) {
          throw new Error('Paleta no encontrada');
        }

        const updatedPalette: CustomPalette = {
          ...state.customPalettes[paletteIndex],
          ...input,
          tags: input.tags ? (input.tags || []).map(tag => 
            typeof tag === 'string' 
              ? { id: generateId(), name: tag, color: '#6366F1' }
              : tag
          ) : state.customPalettes[paletteIndex].tags,
          updatedAt: new Date().toISOString(),
          colorCount: input.colors?.length || state.customPalettes[paletteIndex].colorCount
        };

        await CustomPaletteStorage.savePalette(updatedPalette);

        const newPalettes = [...state.customPalettes];
        newPalettes[paletteIndex] = updatedPalette;

        set({
          customPalettes: newPalettes,
          currentCustomPalette: state.currentCustomPalette?.id === id ? updatedPalette : state.currentCustomPalette
        });
      },

      deleteCustomPalette: async (id: string): Promise<void> => {
        await CustomPaletteStorage.deletePalette(id);
        
        set((state) => ({
          customPalettes: state.customPalettes.filter(p => p.id !== id),
          currentCustomPalette: state.currentCustomPalette?.id === id ? null : state.currentCustomPalette
        }));
      },

      duplicateCustomPalette: async (id: string): Promise<CustomPalette> => {
        const state = get();
        const originalPalette = state.customPalettes.find(p => p.id === id);
        
        if (!originalPalette) {
          throw new Error('Paleta no encontrada');
        }

        const duplicatedPalette: CustomPalette = {
          ...originalPalette,
          id: generateId(),
          name: `${originalPalette.name} (Copia)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          colors: originalPalette.colors.map(color => ({
            ...color,
            id: generateId()
          }))
        };

        await CustomPaletteStorage.savePalette(duplicatedPalette);
        
        set((state) => ({
          customPalettes: [...state.customPalettes, duplicatedPalette]
        }));

        return duplicatedPalette;
      },

      loadCustomPalettes: async (): Promise<void> => {
        const palettes = await CustomPaletteStorage.loadPalettes();
        set({ customPalettes: palettes });
      },

      clearCustomPalettes: async (): Promise<void> => {
        await CustomPaletteStorage.clearPalettes();
        set({ 
          customPalettes: [],
          currentCustomPalette: null
        });
      },

      // Palette Selection
      selectCustomPalette: async (id: string): Promise<void> => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === id);
        
        if (!palette) {
          throw new Error('Paleta no encontrada');
        }

        // Convert custom palette to standard palette for display
        const standardPalette = PaletteConverter.toStandardPalette(palette);
        
        set({
          currentCustomPalette: palette,
          currentPalette: standardPalette,
          isCustomPaletteMode: true
        });
      },

      clearCustomPaletteSelection: () => {
        set({
          currentCustomPalette: null,
          isCustomPaletteMode: false
        });
      },

      // Color Management
      addColorToCustomPalette: async (paletteId: string, color: CustomColor): Promise<void> => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === paletteId);
        
        if (!palette) {
          throw new Error('Paleta no encontrada');
        }

        const updatedColors = [...palette.colors, color];
        await state.updateCustomPalette(paletteId, { colors: updatedColors });
      },

      updateColorInCustomPalette: async (paletteId: string, colorId: string, updates: Partial<CustomColor>): Promise<void> => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === paletteId);
        
        if (!palette) {
          throw new Error('Paleta no encontrada');
        }

        const updatedColors = palette.colors.map(color =>
          color.id === colorId ? { ...color, ...updates } : color
        );

        await state.updateCustomPalette(paletteId, { colors: updatedColors });
      },

      removeColorFromCustomPalette: async (paletteId: string, colorId: string): Promise<void> => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === paletteId);
        
        if (!palette) {
          throw new Error('Paleta no encontrada');
        }

        const updatedColors = palette.colors.filter(color => color.id !== colorId);
        await state.updateCustomPalette(paletteId, { colors: updatedColors });
      },

      reorderColorsInCustomPalette: async (paletteId: string, colorIds: string[]): Promise<void> => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === paletteId);
        
        if (!palette) {
          throw new Error('Paleta no encontrada');
        }

        // colorIds debería ser un array con fromIndex y toIndex
        if (colorIds.length !== 2) {
          throw new Error('Se requieren exactamente 2 índices para reordenar');
        }
        const [fromIndexStr, toIndexStr] = colorIds;
        const fromIndex = parseInt(fromIndexStr, 10);
        const toIndex = parseInt(toIndexStr, 10);
        const reorderedColors = CustomColorUtils.reorderColors(palette.colors, fromIndex, toIndex);
        await state.updateCustomPalette(paletteId, { colors: reorderedColors });
      },

      // Builder State Management
      updateBuilderState: (updates: Partial<PaletteBuilderState>) => {
        set((state) => ({
          paletteBuilderState: {
            ...state.paletteBuilderState,
            ...updates
          }
        }));
      },

      updatePaletteBuilderState: (updates: Partial<PaletteBuilderState>) => {
        set((state) => ({
          paletteBuilderState: {
            ...state.paletteBuilderState,
            ...updates
          }
        }));
      },

      resetPaletteBuilder: () => {
        set({
          paletteBuilderState: {
            id: null,
            name: '',
            description: '',
            tags: [],
            colors: [],
            isEditing: false,
            editingColorId: null,
            editingPaletteId: null,
            dragState: null,
            validation: {
              name: { isValid: true, message: '' },
              colors: { isValid: true, message: '' },
              overall: { isValid: true, message: '' },
              isValid: true,
              warnings: [],
              errors: []
            },
            saveState: {
              isSaving: false,
              lastSaved: null,
              hasUnsavedChanges: false
            },
            config: DEFAULT_PALETTE_BUILDER_CONFIG,
            actionHistory: [],
            currentActionIndex: -1
          }
        });
      },

      addColorToPaletteBuilder: (color: ColorValue, position?: number) => {
        const state = get();
        const newColor: CustomColor = {
          id: generateId(),
          value: color,
          position: position ?? state.paletteBuilderState.colors.length,
          name: CustomColorUtils.generateColorName(color),
          locked: false
        };
        
        const updatedColors = [...state.paletteBuilderState.colors];
        if (position !== undefined) {
          updatedColors.splice(position, 0, newColor);
        } else {
          updatedColors.push(newColor);
        }
        
        state.updatePaletteBuilderState({ colors: updatedColors });
      },

      removeColorFromPaletteBuilder: (colorId: string) => {
        const state = get();
        const updatedColors = state.paletteBuilderState.colors.filter(c => c.id !== colorId);
        state.updatePaletteBuilderState({ colors: updatedColors });
      },

      updateColorInPaletteBuilder: (colorId: string, updates: Partial<CustomColor>) => {
        const state = get();
        const updatedColors = state.paletteBuilderState.colors.map(color =>
          color.id === colorId ? { ...color, ...updates } : color
        );
        state.updatePaletteBuilderState({ colors: updatedColors });
      },

      reorderColorsInPaletteBuilder: (fromIndex: number, toIndex: number) => {
        const state = get();
        const reorderedColors = CustomColorUtils.reorderColors(
          state.paletteBuilderState.colors,
          fromIndex,
          toIndex
        );
        state.updatePaletteBuilderState({ colors: reorderedColors });
      },

      saveCustomPalette: async (name: string, description?: string): Promise<string> => {
        const state = get();
        const { colors, tags } = state.paletteBuilderState;
        
        const newPalette = await state.createCustomPalette({
           name,
           description,
           colors: colors.map(c => c.value),
           tags: tags
         });
        
        state.resetPaletteBuilder();
        return newPalette.id;
      },

      resetBuilderState: () => {
        set({
          paletteBuilderState: {
            id: null,
            name: '',
            description: '',
            tags: [],
            colors: [],
            isEditing: false,
            editingColorId: null,
            editingPaletteId: null,
            dragState: null,
            validation: {
              name: { isValid: true, message: '' },
              colors: { isValid: true, message: '' },
              overall: { isValid: true, message: '' },
              isValid: true,
              warnings: [],
              errors: []
            },
            saveState: {
              isSaving: false,
              lastSaved: null,
              hasUnsavedChanges: false
            },
            config: DEFAULT_PALETTE_BUILDER_CONFIG,
            actionHistory: [],
            currentActionIndex: -1
          }
        });
      },

      loadPaletteForEditing: (paletteId: string) => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === paletteId);
        
        if (palette) {
          set((state) => ({
            paletteBuilderState: {
              ...state.paletteBuilderState,
              name: palette.name,
              description: palette.description || '',
              tags: (palette.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name),
              colors: palette.colors,
              isEditing: true,
              editingPaletteId: paletteId,
              saveState: {
                ...state.paletteBuilderState.saveState,
                hasUnsavedChanges: false
              }
            }
          }));
        }
      },

      // Conversion Operations
      convertStandardToCustom: (standardPalette?: ColorPalette): CustomPalette => {
        const state = get();
        const palette = standardPalette || state.currentPalette;
        return PaletteConverter.toCustomPalette(palette);
      },

      convertCustomToStandard: (customPalette: CustomPalette): ColorPalette => {
        return PaletteConverter.toStandardPalette(customPalette);
      },

      mergeWithStandardPalette: (customPalette: CustomPalette): ColorPalette => {
        const state = get();
        return PaletteConverter.mergeWithStandard(customPalette, state.currentPalette);
      },

      // Validation
      validateCustomPalette: (palette: CustomPalette): ValidationResult => {
        return PaletteValidator.validatePalette(palette);
      },

      validateCustomColor: (color: CustomColor): ValidationResult => {
        return PaletteValidator.validateColors([color]);
      },

      // Import/Export
      exportCustomPalettes: async (): Promise<string> => {
        return await CustomPaletteStorage.exportPalettes();
      },

      importCustomPalettes: async (jsonData: string): Promise<CustomPalette[]> => {
        const importedPalettes = await CustomPaletteStorage.importPalettes(jsonData);
        await get().loadCustomPalettes();
        return importedPalettes;
      },

      // Utility Actions
      generateColorName: (color: CustomColor): string => {
        return CustomColorUtils.generateColorName(color.value);
      },

      findSimilarColors: (color: CustomColor, threshold: number = 20): CustomColor[] => {
        const state = get();
        const allColors = state.customPalettes.flatMap(palette => palette.colors);
        // Implementar lógica de búsqueda de colores similares
        return allColors.filter(c => {
          if (c.id === color.id) return false;
          const distance = Math.sqrt(
            Math.pow(c.value.rgb.r - color.value.rgb.r, 2) +
            Math.pow(c.value.rgb.g - color.value.rgb.g, 2) +
            Math.pow(c.value.rgb.b - color.value.rgb.b, 2)
          );
          return distance < threshold;
        });
      },

      optimizeCustomPalette: async (paletteId: string): Promise<void> => {
        const state = get();
        const palette = state.customPalettes.find(p => p.id === paletteId);
        
        if (!palette) {
          throw new Error('Paleta no encontrada');
        }

        const optimizedPalette = PaletteConverter.optimizePalette(palette);
        await state.updateCustomPalette(paletteId, { colors: optimizedPalette.colors });
      },

      // History and Undo/Redo
      addPaletteAction: (action: PaletteAction) => {
        set((state) => {
          const newHistory = [
            ...state.paletteBuilderState.actionHistory.slice(0, state.paletteBuilderState.currentActionIndex + 1),
            action
          ].slice(-50); // Keep only last 50 actions

          return {
            paletteBuilderState: {
              ...state.paletteBuilderState,
              actionHistory: newHistory,
              currentActionIndex: newHistory.length - 1
            }
          };
        });
      },

      undoLastAction: async (): Promise<void> => {
        const state = get();
        const { actionHistory, currentActionIndex } = state.paletteBuilderState;
        
        if (currentActionIndex <= 0) return;

        const previousAction = actionHistory[currentActionIndex - 1];
        
        // Apply the previous action state
        if (previousAction.type === 'UPDATE_PALETTE') {
          await state.updateCustomPalette(previousAction.paletteId, previousAction.data);
        }

        set((state) => ({
          paletteBuilderState: {
            ...state.paletteBuilderState,
            currentActionIndex: state.paletteBuilderState.currentActionIndex - 1
          }
        }));
      },

      redoLastAction: async (): Promise<void> => {
        const state = get();
        const { actionHistory, currentActionIndex } = state.paletteBuilderState;
        
        if (currentActionIndex >= actionHistory.length - 1) return;

        const nextAction = actionHistory[currentActionIndex + 1];
        
        // Apply the next action state
        if (nextAction.type === 'UPDATE_PALETTE') {
          await state.updateCustomPalette(nextAction.paletteId, nextAction.data);
        }

        set((state) => ({
          paletteBuilderState: {
            ...state.paletteBuilderState,
            currentActionIndex: state.paletteBuilderState.currentActionIndex + 1
          }
        }));
      },

      clearActionHistory: () => {
        set((state) => ({
          paletteBuilderState: {
            ...state.paletteBuilderState,
            actionHistory: [],
            currentActionIndex: -1
          }
        }));
      },

    }),
    {
      name: 'pigmenta-storage',
      partialize: (state) => ({
        currentPalette: state.currentPalette,
        settings: state.settings,
        exportHistory: state.exportHistory,
        customPalettes: state.customPalettes,
        currentCustomPalette: state.currentCustomPalette,
        isCustomPaletteMode: state.isCustomPaletteMode,
        paletteBuilderState: state.paletteBuilderState
      })
    }
  )
);

// Dark theme color palette based on the provided blue tones
export const DARK_THEME_COLORS = {
  50: '#CDDCF3',
  100: '#B8CCE8',
  200: '#94B3E6',
  300: '#779EDF',
  400: '#5A89D8',
  500: '#3B6BCB',
  600: '#2554A9',
  700: '#183C72',
  800: '#102545',
  900: '#0A1A35'
};