// Color Types
export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  oklch: { l: number; c: number; h: number };
}

export interface ColorShade {
  name: string;
  value: number;
  color: ColorValue;
  contrast?: number;
  isActive?: boolean;
}

export interface ColorPalette {
  name: string;
  baseColor: ColorValue;
  shades: ColorShade[];
  algorithm: ColorAlgorithm;
}

// Control Types
export type ColorAlgorithm = 
  | 'tailwind' 
  | 'radix' 
  | 'ant' 
  | 'lightness' 
  | 'saturation' 
  | 'hue' 
  | 'monochromatic' 
  | 'analogous' 
  | 'complementary';
export type ColorFormat = 'rgb' | 'hsl' | 'oklch';
export type NamingPattern = '50-950' | '100-900' | '50-900' | '1-20' | '10-200' | 'custom';
export type ExportFormat = 'css' | 'tailwind' | 'tailwind4' | 'scss' | 'hex' | 'react' | 'javascript' | 'typescript' | 'json' | 'tokens' | 'ase' | 'gpl' | 'sketch' | 'figma' | 'svg';

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  // Color State
  baseColor: ColorValue;
  palette: ColorPalette;
  activeShade: number;
  currentPalette: ColorPalette;
  
  // Control State
  algorithm: ColorAlgorithm;
  contrastShift: number;
  namingPattern: NamingPattern;
  shadeCount: number;
  colorFormat: ColorFormat;
  
  // UI State
  controlsExpanded: boolean;
  exportFormat: ExportFormat;
  colorName: string;
  isExportPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
  theme: ThemeMode;
  
  // App State
  settings: AppSettings;
  exportHistory: ExportHistoryItem[];
}

// Component Props
export interface ColorPickerProps {
  value: ColorValue;
  onChange: (color: ColorValue) => void;
  format: ColorFormat;
}

export interface PaletteGridProps {
  palette: ColorPalette;
  activeShade: number;
  onShadeSelect: (shade: number) => void;
}

export interface ExportPanelProps {
  palette: ColorPalette;
  format: ExportFormat;
  colorName: string;
  onFormatChange: (format: ExportFormat) => void;
  onNameChange: (name: string) => void;
}

// Local Storage para persistencia opcional
export interface StoredPreferences {
  lastUsedAlgorithm: ColorAlgorithm;
  defaultShadeCount: number;
  preferredFormat: ColorFormat;
  recentColors: ColorValue[];
}

export interface AppSettings {
  defaultAlgorithm: ColorAlgorithm;
  defaultShadeCount: number;
  autoContrast: boolean;
  colorHistory: string[];
  theme: ThemeMode;
  exportPreferences: {
    format: ExportFormat;
    namingPattern: string;
    prefix: string;
    suffix: string;
  };
}

export interface ExportHistoryItem {
  id: string;
  palette: ColorPalette;
  format: ExportFormat;
  exportedAt: string;
  timestamp: string;
}



export interface ExportConfig {
  format: ExportFormat;
  namingPattern: string;
  prefix: string;
  suffix: string;
}

// Configuración inicial por defecto
export const DEFAULT_SETTINGS: AppSettings = {
  defaultAlgorithm: 'tailwind',
  defaultShadeCount: 11,
  autoContrast: true,
  colorHistory: ['#1E96BE', '#177B9D', '#0F5E78'],
  theme: 'dark',
  exportPreferences: {
    format: 'css',
    namingPattern: '50-900',
    prefix: '',
    suffix: ''
  }
};

// Paleta de colores para el tema oscuro
export const DARK_THEME_COLORS = {
  background: {
    primary: '#102545',    // 900 - Fondo principal
    secondary: '#1B3C72',  // 800 - Fondo secundario
    tertiary: '#25649E'    // 700 - Fondo terciario
  },
  surface: {
    primary: '#3B86CB',    // 600 - Superficies principales
    secondary: '#5BA3E0',  // 500 - Superficies secundarias
    tertiary: '#7BB5E8'    // 400 - Superficies terciarias
  },
  text: {
    primary: '#CDDCF3',    // 100 - Texto principal
    secondary: '#B1C7E8',  // 200 - Texto secundario
    tertiary: '#94B3DD'    // 300 - Texto terciario
  },
  border: {
    primary: '#25649E',    // 700 - Bordes principales
    secondary: '#1B3C72',  // 800 - Bordes secundarios
    subtle: '#3B86CB'      // 600 - Bordes sutiles
  },
  accent: {
    primary: '#5BA3E0',    // 500 - Acentos principales
    hover: '#7BB5E8',      // 400 - Estados hover
    active: '#3B86CB'      // 600 - Estados activos
  }
};

// Paleta inicial de Pigmenta
export const INITIAL_PALETTE: ColorPalette = {
  name: 'blue',
  baseColor: {
    hex: '#1E96BE',
    rgb: { r: 30, g: 150, b: 190 },
    hsl: { h: 194, s: 73, l: 43 },
    oklch: { l: 0.43, c: 0.14, h: 194 }
  },
  algorithm: 'tailwind',
  shades: [
    { name: '50', value: 50, color: { hex: '#F0FAFE', rgb: {r: 240, g: 250, b: 254}, hsl: {h: 194, s: 71, l: 97}, oklch: {l: 0.97, c: 0.02, h: 194} }, contrast: 1 },
    { name: '100', value: 100, color: { hex: '#E0F7FE', rgb: {r: 224, g: 247, b: 254}, hsl: {h: 194, s: 88, l: 94}, oklch: {l: 0.94, c: 0.04, h: 194} }, contrast: 1 },
    { name: '200', value: 200, color: { hex: '#BAE9FD', rgb: {r: 186, g: 233, b: 253}, hsl: {h: 194, s: 91, l: 86}, oklch: {l: 0.86, c: 0.08, h: 194} }, contrast: 1 },
    { name: '300', value: 300, color: { hex: '#7DD3FC', rgb: {r: 125, g: 211, b: 252}, hsl: {h: 194, s: 95, l: 74}, oklch: {l: 0.74, c: 0.12, h: 194} }, contrast: 1 },
    { name: '400', value: 400, color: { hex: '#38BDF8', rgb: {r: 56, g: 189, b: 248}, hsl: {h: 194, s: 93, l: 60}, oklch: {l: 0.60, c: 0.16, h: 194} }, contrast: 1 },
    { name: '500', value: 500, color: { hex: '#1E96BE', rgb: {r: 30, g: 150, b: 190}, hsl: {h: 194, s: 73, l: 43}, oklch: {l: 0.43, c: 0.14, h: 194} }, contrast: 1 },
    { name: '600', value: 600, color: { hex: '#177B9D', rgb: {r: 23, g: 123, b: 157}, hsl: {h: 194, s: 74, l: 35}, oklch: {l: 0.35, c: 0.12, h: 194} }, contrast: 1 },
    { name: '700', value: 700, color: { hex: '#0F5E78', rgb: {r: 15, g: 94, b: 120}, hsl: {h: 194, s: 78, l: 26}, oklch: {l: 0.26, c: 0.09, h: 194} }, contrast: 1 },
    { name: '800', value: 800, color: { hex: '#074053', rgb: {r: 7, g: 64, b: 83}, hsl: {h: 194, s: 84, l: 18}, oklch: {l: 0.18, c: 0.06, h: 194} }, contrast: 1 },
    { name: '900', value: 900, color: { hex: '#02222E', rgb: {r: 2, g: 34, b: 46}, hsl: {h: 194, s: 92, l: 9}, oklch: {l: 0.09, c: 0.03, h: 194} }, contrast: 1 },
    { name: '950', value: 950, color: { hex: '#01131B', rgb: {r: 1, g: 19, b: 27}, hsl: {h: 194, s: 93, l: 5}, oklch: {l: 0.05, c: 0.02, h: 194} }, contrast: 1 }
  ]
};

// Colores predefinidos para el picker
export const PREDEFINED_COLORS = [
  '#1E96BE', '#177B9D', '#0F5E78', '#074053', '#02222E', '#01131B', // Pigmenta brand
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', // Colores populares
  '#EC4899', '#06B6D4', '#84CC16', '#F59E0B', '#10B981', '#6366F1'
];