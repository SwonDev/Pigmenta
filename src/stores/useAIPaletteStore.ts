import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIPaletteState, SemanticPalette, GeneratePaletteRequest } from '../types';
import { AIColorEngine, PREDEFINED_STUDIO_PALETTES } from '../utils/aiColorEngine';

interface AIPaletteStore extends AIPaletteState {
  // Actions
  generatePalette: (request: GeneratePaletteRequest) => Promise<void>;
  setCurrentPalette: (palette: SemanticPalette | null) => void;
  savePalette: (palette: SemanticPalette) => void;
  deletePalette: (paletteId: string) => void;
  updatePaletteColor: (colorGroup: string, variation: string, newColor: string) => void;
  duplicatePalette: (paletteId: string) => void;
  loadPredefinedPalettes: () => void;
  loadPredefinedPalette: (palette: SemanticPalette) => void;
  clearError: () => void;
  setFavorite: (paletteId: string, isFavorite: boolean) => void;
  toggleFavorite: (paletteId: string) => void;
  incrementViews: (paletteId: string) => void;
  searchPalettes: (query: string) => SemanticPalette[];
  reset: () => void;
}

const initialState: AIPaletteState = {
  currentPalette: null,
  savedPalettes: [],
  isGenerating: false,
  error: null,
  lastGenerated: null,
  favorites: [],
  views: {},
  previousPrompts: []
};

export const useAIPaletteStore = create<AIPaletteStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      generatePalette: async (request: GeneratePaletteRequest) => {
        set({ isGenerating: true, error: null });

        try {
          const state = get();

          // Check if prompt was used recently (last 5 minutes)
          const recentMatch = state.previousPrompts.find(
            p => p.prompt.toLowerCase() === request.prompt.toLowerCase() &&
            Date.now() - p.timestamp < 300000
          );

          // If it's a repeated prompt, force variation
          const enhancedRequest: GeneratePaletteRequest = {
            ...request,
            forceVariation: request.forceVariation || !!recentMatch
          };

          // Simular delay de IA
          await new Promise(resolve => setTimeout(resolve, 1500));

          const palette = AIColorEngine.generatePalette(enhancedRequest);

          // Store prompt in history
          const updatedPrompts = [
            { prompt: request.prompt, timestamp: Date.now() },
            ...state.previousPrompts.slice(0, 9) // Keep last 10
          ];

          set({
            currentPalette: palette,
            lastGenerated: palette,
            isGenerating: false,
            previousPrompts: updatedPrompts
          });

          // Auto-save palette
          get().savePalette(palette);
        } catch (error) {
          set({
            isGenerating: false,
            error: error instanceof Error ? error.message : 'Error generating palette'
          });
        }
      },

      setCurrentPalette: (palette) => {
        set({ currentPalette: palette });
        if (palette) {
          get().incrementViews(palette.id);
        }
      },

      savePalette: (palette) => {
        set((state) => {
          const existingIndex = state.savedPalettes.findIndex(p => p.id === palette.id);
          const updatedPalettes = existingIndex >= 0
            ? state.savedPalettes.map((p, i) => i === existingIndex ? palette : p)
            : [...state.savedPalettes, palette];
          
          return { savedPalettes: updatedPalettes };
        });
      },

      deletePalette: (paletteId) => {
        set((state) => ({
          savedPalettes: state.savedPalettes.filter(p => p.id !== paletteId),
          favorites: state.favorites.filter(id => id !== paletteId),
          currentPalette: state.currentPalette?.id === paletteId ? null : state.currentPalette
        }));
      },

      updatePaletteColor: (colorGroup, variation, newColor) => {
        set((state) => {
          if (!state.currentPalette) return state;

          const updatedPalette = {
            ...state.currentPalette,
            colors: {
              ...state.currentPalette.colors,
              [colorGroup]: {
                ...state.currentPalette.colors[colorGroup as keyof typeof state.currentPalette.colors],
                [variation === 'base' ? 'base' : 'variations']: 
                  variation === 'base' 
                    ? newColor 
                    : {
                        ...state.currentPalette.colors[colorGroup as keyof typeof state.currentPalette.colors].variations,
                        [variation]: newColor
                      }
              }
            }
          };

          return { currentPalette: updatedPalette };
        });
      },

      duplicatePalette: (paletteId) => {
        const state = get();
        const originalPalette = state.savedPalettes.find(p => p.id === paletteId);
        
        if (originalPalette) {
          const duplicatedPalette: SemanticPalette = {
            ...originalPalette,
            id: `${originalPalette.id}_copy_${Date.now()}`,
            name: `${originalPalette.name} (Copy)`,
            metadata: {
              ...originalPalette.metadata,
              createdAt: new Date().toISOString()
            }
          };
          
          state.savePalette(duplicatedPalette);
        }
      },

      loadPredefinedPalettes: () => {
        set((state) => {
          const existingIds = new Set(state.savedPalettes.map(p => p.id));
          const newPalettes = PREDEFINED_STUDIO_PALETTES.filter(p => !existingIds.has(p.id));
          
          return {
            savedPalettes: [...state.savedPalettes, ...newPalettes]
          };
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setFavorite: (paletteId, isFavorite) => {
        set((state) => ({
          favorites: isFavorite
            ? [...state.favorites, paletteId]
            : state.favorites.filter(id => id !== paletteId)
        }));
      },

      incrementViews: (paletteId) => {
        set((state) => ({
          views: {
            ...state.views,
            [paletteId]: (state.views[paletteId] || 0) + 1
          }
        }));
      },

      searchPalettes: (query: string) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        
        return (state.savedPalettes || []).filter(palette =>
          palette.name.toLowerCase().includes(lowerQuery) ||
          (palette.description || '').toLowerCase().includes(lowerQuery) ||
          (palette.metadata?.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },

      loadPredefinedPalette: (palette: SemanticPalette) => {
        set({ currentPalette: palette });
      },

      toggleFavorite: (paletteId: string) => {
        const state = get();
        const favorites = state.favorites || [];
        const isFavorite = favorites.includes(paletteId);
        
        set({
          favorites: isFavorite 
            ? favorites.filter(id => id !== paletteId)
            : [...favorites, paletteId]
        });
      },

      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'pigmenta-ai-palette-store',
      partialize: (state) => ({
        savedPalettes: state.savedPalettes,
        favorites: state.favorites,
        views: state.views,
        previousPrompts: state.previousPrompts
      })
    }
  )
);