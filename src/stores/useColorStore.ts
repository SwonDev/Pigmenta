import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  ColorValue,
  ColorPalette,
  ColorAlgorithm,
  ColorFormat,
  NamingPattern,
  ExportFormat
} from '../types';
import { generatePalette, convertColor, parseColorInput } from '../utils/colorUtils';

interface ColorStore extends ColorStoreState {
  // Actions
  setBaseColor: (color: ColorValue | string) => void;
  setAlgorithm: (algorithm: ColorAlgorithm) => void;
  setContrastShift: (shift: number) => void;
  setNamingPattern: (pattern: NamingPattern) => void;
  setShadeCount: (count: number) => void;
  setColorFormat: (format: ColorFormat) => void;
  setActiveShade: (shade: number) => void;
  setControlsExpanded: (expanded: boolean) => void;
  setExportFormat: (format: ExportFormat) => void;
  setColorName: (name: string) => void;
  
  // Computed actions
  regeneratePalette: () => void;
  copyShadeToClipboard: (shade: number) => Promise<void>;
  exportPalette: () => string;
  resetToDefaults: () => void;
}

const defaultColor: ColorValue = {
  hex: '#3b82f6',
  rgb: { r: 59, g: 130, b: 246 },
  hsl: { h: 217, s: 91, l: 60 },
  oklch: { l: 0.6, c: 0.15, h: 250 }
};

interface ColorStoreState {
  baseColor: ColorValue;
  palette: ColorPalette;
  activeShade: number;
  algorithm: ColorAlgorithm;
  contrastShift: number;
  namingPattern: NamingPattern;
  shadeCount: number;
  colorFormat: ColorFormat;
  controlsExpanded: boolean;
  exportFormat: ExportFormat;
  colorName: string;
}

const initialState: ColorStoreState = {
  baseColor: defaultColor,
  palette: {
    name: 'blue',
    baseColor: defaultColor,
    shades: [],
    algorithm: 'tailwind'
  },
  activeShade: 500,
  algorithm: 'tailwind',
  contrastShift: 0,
  namingPattern: '50-950',
  shadeCount: 11,
  colorFormat: 'hsl',
  controlsExpanded: false,
  exportFormat: 'css',
  colorName: 'blue'
};

export const useColorStore = create<ColorStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setBaseColor: (color) => {
          console.log('🏪 Store setBaseColor llamado con:', color);
          
          const colorValue = typeof color === 'string' 
            ? parseColorInput(color) 
            : color;
          
          console.log('🏪 Color procesado en store:', colorValue);
          
          if (!colorValue) {
            console.warn('🏪 Store: Color inválido, no se aplicará');
            return;
          }
          
          set((state) => {
            console.log('🏪 Store: Generando nueva paleta con color:', colorValue);
            
            const newPalette = generatePalette(
              colorValue,
              state.algorithm,
              state.shadeCount,
              state.contrastShift,
              state.namingPattern,
              state.colorName
            );
            
            console.log('🏪 Store: Nueva paleta generada:', newPalette);
            
            return {
              baseColor: colorValue,
              palette: newPalette
            };
          });
        },
        
        setAlgorithm: (algorithm) => {
          set((state) => {
            const newPalette = generatePalette(
              state.baseColor,
              algorithm,
              state.shadeCount,
              state.contrastShift,
              state.namingPattern,
              state.colorName
            );
            
            return {
              algorithm,
              palette: newPalette
            };
          });
        },
        
        setContrastShift: (shift) => {
          set((state) => {
            const newPalette = generatePalette(
              state.baseColor,
              state.algorithm,
              state.shadeCount,
              shift,
              state.namingPattern,
              state.colorName
            );
            
            return {
              contrastShift: shift,
              palette: newPalette
            };
          });
        },
        
        setNamingPattern: (pattern) => {
          set((state) => {
            const newPalette = generatePalette(
              state.baseColor,
              state.algorithm,
              state.shadeCount,
              state.contrastShift,
              pattern,
              state.colorName
            );
            
            return {
              namingPattern: pattern,
              palette: newPalette
            };
          });
        },
        
        setShadeCount: (count) => {
          set((state) => {
            const newPalette = generatePalette(
              state.baseColor,
              state.algorithm,
              count,
              state.contrastShift,
              state.namingPattern,
              state.colorName
            );
            
            return {
              shadeCount: count,
              palette: newPalette
            };
          });
        },
        
        setColorFormat: (format) => {
          set({ colorFormat: format });
        },
        
        setActiveShade: (shade) => {
          set({ activeShade: shade });
        },
        
        setControlsExpanded: (expanded) => {
          set({ controlsExpanded: expanded });
        },
        
        setExportFormat: (format) => {
          set({ exportFormat: format });
        },
        
        setColorName: (name) => {
          set((state) => {
            const newPalette = generatePalette(
              state.baseColor,
              state.algorithm,
              state.shadeCount,
              state.contrastShift,
              state.namingPattern,
              name
            );
            
            return {
              colorName: name,
              palette: newPalette
            };
          });
        },
        
        regeneratePalette: () => {
          const state = get();
          const newPalette = generatePalette(
            state.baseColor,
            state.algorithm,
            state.shadeCount,
            state.contrastShift,
            state.namingPattern,
            state.colorName
          );
          
          set({ palette: newPalette });
        },
        
        copyShadeToClipboard: async (shadeValue) => {
          const state = get();
          const shade = state.palette.shades.find(s => s.value === shadeValue);
          
          if (!shade) return;
          
          const colorString = convertColor(shade.color, state.colorFormat);
          
          try {
            await navigator.clipboard.writeText(colorString);
          } catch (error) {
            console.error('Failed to copy to clipboard:', error);
          }
        },
        
        exportPalette: () => {
          const state = get();
          const { palette, exportFormat, colorFormat } = state;
          
          switch (exportFormat) {
            case 'css': {
              return palette.shades
                .map(shade => `  --color-${palette.name}-${shade.name}: ${convertColor(shade.color, colorFormat)};`)
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
              
            default:
              return '';
          }
        },
        
        resetToDefaults: () => {
          set(initialState);
        }
      }),
      {
        name: 'pigmenta-color-store',
        partialize: (state) => ({
          algorithm: state.algorithm,
          shadeCount: state.shadeCount,
          colorFormat: state.colorFormat,
          exportFormat: state.exportFormat,
          colorName: state.colorName
        })
      }
    ),
    {
      name: 'pigmenta-color-store'
    }
  )
);