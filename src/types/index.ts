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
  | 'complementary'
  | 'custom';
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
  isMobile: boolean; // Added missing property
  
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
];

// ============================================================================
// CUSTOM PALETTE SYSTEM TYPES
// ============================================================================

// Core Custom Palette Types
export interface CustomColor {
  id: string;
  value: ColorValue;
  position: number;
  name?: string;
  locked?: boolean;
  isVisible?: boolean;
  metadata?: {
    source?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface PaletteTag {
  id: string;
  name: string;
  color?: string;
}

export interface PaletteMetadata {
  source?: 'manual' | 'imported' | 'generated' | 'camera';
  version: string;
  exportCount?: number;
  lastExported?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

export interface CustomPalette {
  id: string;
  name: string;
  description?: string;
  colors: CustomColor[];
  tags?: PaletteTag[];
  createdAt: string;
  updatedAt: string;
  colorCount: number;
  isActive?: boolean;
  metadata?: PaletteMetadata;
}

// Builder State Types
export interface DragState {
  draggedColor: CustomColor | null;
  draggedIndex: number | null;
  dropZone: string | null;
  isDragging: boolean;
}

export interface FieldValidation {
  isValid: boolean;
  message?: string;
}

export interface ValidationState {
  nameValidation: FieldValidation;
  colorsValidation: FieldValidation;
  globalValidation: FieldValidation;
  isValid: boolean;
}

export interface SaveState {
  isSaving: boolean;
  lastSaved?: string;
  saveError?: string;
  autoSaveEnabled: boolean;
}

export interface PaletteBuilderState {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  colors: CustomColor[];
  isEditing: boolean;
  editingColorId: string | null;
  editingPaletteId: string | null;
  dragState: DragState | null;
  validation: {
    name: { isValid: boolean; message: string };
    colors: { isValid: boolean; message: string };
    overall: { isValid: boolean; message: string };
    isValid: boolean;
    warnings: ValidationWarning[];
    errors: ValidationError[];
  };
  saveState: {
    isSaving: boolean;
    lastSaved: string | null;
    hasUnsavedChanges: boolean;
  };
  config: PaletteBuilderConfig;
  actionHistory: PaletteAction[];
  currentActionIndex: number;
}

// Configuration Types
export interface PaletteBuilderConfig {
  minColors: number;
  maxColors: number;
  autoSave: boolean;
  autoSaveInterval: number;
  defaultColorFormat: ColorFormat;
  enableDragAndDrop: boolean;
  enableColorValidation: boolean;
}

export interface PaletteManagerConfig {
  itemsPerPage: number;
  defaultSortBy: SortOption;
  enableSearch: boolean;
  enableFilters: boolean;
  enableBulkActions: boolean;
}

// Sorting and Filtering Types
export type SortOption = 
  | 'name-asc' 
  | 'name-desc'
  | 'created-asc'
  | 'created-desc'
  | 'updated-asc'
  | 'updated-desc'
  | 'color-count-asc'
  | 'color-count-desc';

export interface FilterOptions {
  tags?: string[];
  colorCount?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  source?: PaletteMetadata['source'][];
}

// Action Types
export interface PaletteAction {
  type: PaletteActionType;
  payload: unknown;
  timestamp: string;
  userId?: string;
  paletteId?: string;
  data?: unknown;
}

export type PaletteActionType = 
  | 'CREATE_PALETTE'
  | 'UPDATE_PALETTE'
  | 'DELETE_PALETTE'
  | 'DUPLICATE_PALETTE'
  | 'LOAD_PALETTE'
  | 'ADD_COLOR'
  | 'REMOVE_COLOR'
  | 'UPDATE_COLOR'
  | 'REORDER_COLORS'
  | 'EXPORT_PALETTE';

// Input Types for CRUD Operations
export interface CreateCustomPaletteInput {
  name: string;
  colors: ColorValue[];
  description?: string;
  tags?: string[];
}

export interface UpdateCustomPaletteInput {
  name?: string;
  colors?: CustomColor[];
  description?: string;
  tags?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Storage Types
export interface StoredCustomPalettes {
  version: string;
  palettes: CustomPalette[];
  metadata: StorageMetadata;
  settings: PaletteSettings;
}

export interface StorageMetadata {
  lastModified: string;
  totalPalettes: number;
  storageSize: number;
  migrationVersion: string;
}

export interface PaletteSettings {
  builderConfig: PaletteBuilderConfig;
  managerConfig: PaletteManagerConfig;
  exportPreferences: ExportPreferences;
  uiPreferences: UIPreferences;
}

export interface ExportPreferences {
  defaultFormat: ExportFormat;
  includeMetadata: boolean;
  compressOutput: boolean;
}

export interface UIPreferences {
  showColorNames: boolean;
  showColorValues: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
}

export interface StorageInfo {
  totalSize: number;
  paletteCount: number;
  lastModified: string;
  version: string;
}

// Hook Return Types
export interface UsePaletteBuilderReturn {
  // Estado
  state: PaletteBuilderState;
  validation: PaletteBuilderState['validation'];
  isEditing: boolean;
  canSave: boolean;
  
  // Acciones de colores
  addColor: (colorValue: string) => void;
  addColorAtPosition: (colorValue: string, position: number) => void;
  removeColor: (colorId: string) => void;
  updateColor: (colorId: string, updates: Partial<CustomColor>) => void;
  reorderColors: (startIndex: number, endIndex: number) => void;
  duplicateColor: (colorId: string) => void;
  
  // Acciones de paleta
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  
  // Acciones de estado
  clear: () => void;
  clearBuilder: () => void;
  save: () => Promise<boolean>;
  savePalette: () => Promise<void>;
  loadPalette: (palette: CustomPalette) => void;
  importFromAutomaticPalette: () => void;
  generateRandomColors: (count: number) => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UsePaletteManagerReturn {
  // Estado
  palettes: CustomPalette[];
  filteredPalettes: CustomPalette[];
  isLoading?: boolean;
  error?: string | null;

  // Filtros y ordenamiento
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
  filters: FilterOptions;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  selectedPalettes: string[];
  availableTags: string[];
  stats: {
    total: number;
    filtered: number;
    selected: number;
    totalColors: number;
    averageColors: number;
  };

  // Acciones CRUD
  createPalette: (input: CreateCustomPaletteInput) => Promise<string>;
  updatePalette: (id: string, updates: Partial<CustomPalette>) => Promise<void>;
  deletePalette: (id: string) => Promise<void>;
  duplicatePalette: (id: string) => Promise<string>;

  // Gestión de selección
  selectPalette: (id: string) => void;
  clearSelection: () => void;
  togglePaletteSelection: (id: string) => void;

  // Filtros y búsqueda
  updateSearchTerm: (searchTerm: string) => void;
  updateTagFilters: (tags: string[]) => void;
  updateDateRange: (dateRange: { start: string; end: string } | undefined) => void;
  updateColorCountFilter: (colorCount: { min: number; max: number } | undefined) => void;
  clearFilters: () => void;
  updateSort: (sortBy: SortOption) => void;

  // Importación/Exportación
  exportPalettes: (paletteIds?: string[]) => Promise<void>;
  exportSelectedPalettes: (paletteIds?: string[]) => Promise<void>;
  importPalettes: (file: File) => Promise<number>;

  // Funciones de manejo para PaletteManager
  handleSelectPalette: (id: string) => void;
  handleDeleteSelectedPalettes: () => Promise<boolean>;
  handleFileImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExport: () => Promise<void>;
  handleEditPalette: (id: string) => void;
  handleDuplicatePalette: (id: string) => Promise<void>;
  handleDeletePalette: (id: string) => Promise<void>;

  // Utilidades
  refreshPalettes: () => Promise<void>;
}

export interface UseDragAndDropReturn {
  // Estado
  isDragging: boolean;
  draggedItem: CustomColor | null;
  dropZone: string | null;
  
  // Props para componentes
  getDragContextProps: () => Record<string, unknown>;
  getSortableContextProps: (strategy?: 'vertical' | 'horizontal') => {
    items: string[];
    strategy: import('@dnd-kit/sortable').SortingStrategy;
  };
  getDragOverlayProps: () => Record<string, unknown>;
  
  // Utilidades de estilo
  isItemDragging: (itemId: string) => boolean;
  isItemDraggedOver: (itemId: string) => boolean;
  getItemDragStyle: (itemId: string) => Record<string, unknown>;
  
  // Funciones de movimiento
  moveItem: (fromIndex: number, toIndex: number) => void;
  moveItemToStart: (itemId: string) => void;
  moveItemToEnd: (itemId: string) => void;
  moveItemLeft: (itemId: string) => void;
  moveItemRight: (itemId: string) => void;
  
  // Accesibilidad
  getAriaLabel: (itemId: string, position: number) => string;
  getAriaDescription: () => string;
  
  // Validación
  canDrop: (activeId: string, overId: string) => boolean;
  
  // Información de posición
  getItemPosition: (itemId: string) => number;
  getItemAtPosition: (position: number) => CustomColor | null;
  
  // Componentes de contexto
  DndContext: typeof import('@dnd-kit/core').DndContext;
  SortableContext: typeof import('@dnd-kit/sortable').SortableContext;
  DragOverlay: typeof import('@dnd-kit/core').DragOverlay;
}

export interface DragProps {
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
}

export interface DropProps {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

// Default Configurations
export const DEFAULT_PALETTE_BUILDER_CONFIG: PaletteBuilderConfig = {
  minColors: 2,
  maxColors: 50,
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  defaultColorFormat: 'rgb',
  enableDragAndDrop: true,
  enableColorValidation: true,
};

export const DEFAULT_PALETTE_MANAGER_CONFIG: PaletteManagerConfig = {
  itemsPerPage: 12,
  defaultSortBy: 'updated-desc',
  enableSearch: true,
  enableFilters: true,
  enableBulkActions: false,
};

export const CUSTOM_PALETTE_STORAGE_KEY = 'pigmenta_custom_palettes';
export const CUSTOM_PALETTE_VERSION = '1.0.0';

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  VIRTUAL_SCROLL_THRESHOLD: 50,
  SEARCH_DEBOUNCE_MS: 300,
  LAZY_LOAD_BATCH_SIZE: 20,
  ENABLE_COMPRESSION: true,
  COLOR_CONVERSION_CACHE_SIZE: 100,
  AUTO_SAVE_INTERVAL_MS: 30000,
};