import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudioState } from '../types';

interface StudioStore extends StudioState {
  // Actions
  toggleStudioMode: () => void;
  setActiveView: (view: StudioState['activeView']) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setLastPrompt: (prompt: string) => void;
  addToHistory: (paletteId: string) => void;
  clearHistory: () => void;
  setPreferences: (preferences: Partial<StudioState['preferences']>) => void;
  reset: () => void;
}

const initialState: StudioState = {
  isStudioMode: false,
  activeView: 'generator',
  currentPalette: null,
  isGenerating: false,
  generationError: null,
  lastPrompt: '',
  generationHistory: [],
  history: [],
  preferences: {
    autoSave: true,
    showTips: true,
    defaultExportFormat: 'css',
    previewTemplate: 'mobile-app'
  },
  settings: {
    defaultStyle: 'modern',
    defaultMode: 'auto',
    autoSaveEnabled: true,
    showAccessibilityWarnings: true
  }
};

export const useStudioStore = create<StudioStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleStudioMode: () => {
        set((state) => ({
          isStudioMode: !state.isStudioMode,
          // Reset to generator view when entering studio mode
          activeView: !state.isStudioMode ? 'generator' : state.activeView
        }));
      },

      setActiveView: (view) => {
        set({ activeView: view });
      },

      setIsGenerating: (isGenerating) => {
        set({ isGenerating });
      },

      setLastPrompt: (prompt) => {
        set({ lastPrompt: prompt });
      },

      addToHistory: (paletteId) => {
        set((state) => ({
          history: [paletteId, ...state.history.filter(id => id !== paletteId)].slice(0, 20)
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setPreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }));
      },

      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'pigmenta-studio-store',
      partialize: (state) => ({
        isStudioMode: state.isStudioMode,
        history: state.history,
        preferences: state.preferences,
        lastPrompt: state.lastPrompt
      })
    }
  )
);