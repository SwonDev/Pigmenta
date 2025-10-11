import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TemplateState, TemplateType, TemplateTheme, SemanticPalette } from '../types';

interface TemplateStore extends TemplateState {
  // Actions
  setCurrentTemplate: (template: TemplateType) => void;
  setAppliedPalette: (palette: SemanticPalette | null) => void;
  togglePreviewMode: () => void;
  setZoomLevel: (zoom: number) => void;
  toggleGrid: () => void;
  setTemplates: (templates: TemplateTheme[]) => void;
  reset: () => void;
}

const initialState: TemplateState = {
  currentTemplate: 'mobile-app',
  appliedPalette: null,
  isPreviewMode: false,
  zoomLevel: 1,
  showGrid: false,
  templates: []
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentTemplate: (template) => {
        set({ currentTemplate: template });
      },

      setAppliedPalette: (palette) => {
        set({ appliedPalette: palette });
      },

      togglePreviewMode: () => {
        set((state) => ({
          isPreviewMode: !state.isPreviewMode
        }));
      },

      setZoomLevel: (zoom) => {
        const clampedZoom = Math.max(0.5, Math.min(2, zoom));
        set({ zoomLevel: clampedZoom });
      },

      toggleGrid: () => {
        set((state) => ({
          showGrid: !state.showGrid
        }));
      },

      setTemplates: (templates) => {
        set({ templates });
      },

      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'pigmenta-template-store',
      partialize: (state) => ({
        currentTemplate: state.currentTemplate,
        appliedPalette: state.appliedPalette,
        zoomLevel: state.zoomLevel,
        showGrid: state.showGrid,
        templates: state.templates
      })
    }
  )
);