import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Plus, 
  ArrowLeft, 
  Settings,
  Layers,
  Edit3,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { CustomPaletteBuilder } from './CustomPaletteBuilder';
import { PaletteManager } from './PaletteManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type ViewMode = 'overview' | 'builder' | 'manager';

interface CustomPaletteSectionProps {
  className?: string;
}

export const CustomPaletteSection: React.FC<CustomPaletteSectionProps> = ({
  className = ''
}) => {
  const {
    isCustomPaletteMode,
    customPalettes,
    currentCustomPalette,
    toggleCustomPaletteMode,
    createCustomPalette,
    selectCustomPalette,
    loadPaletteForEditing,
    resetPaletteBuilder,
    loadCustomPalettes
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);

  // Cargar paletas al montar el componente
  useEffect(() => {
    loadCustomPalettes();
  }, [loadCustomPalettes]);

  // Manejar creación de nueva paleta
  const handleCreateNew = useCallback(() => {
    // Activar el modo de paletas personalizadas si no está activo
    if (!isCustomPaletteMode) {
      toggleCustomPaletteMode();
    }
    
    // Resetear el builder antes de cambiar al modo builder
    resetPaletteBuilder();
    
    setViewMode('builder');
    setEditingPaletteId(null);
  }, [isCustomPaletteMode, toggleCustomPaletteMode, resetPaletteBuilder]);

  // Manejar edición de paleta existente
  const handleEditPalette = useCallback((paletteId: string) => {
    loadPaletteForEditing(paletteId);
    setViewMode('builder');
    setEditingPaletteId(paletteId);
  }, [loadPaletteForEditing]);

  // Manejar regreso desde builder
  const handleBackFromBuilder = useCallback(() => {
    setViewMode('overview');
    setEditingPaletteId(null);
  }, []);

  // Manejar activación del modo paletas personalizadas
  const handleActivateCustomMode = useCallback(() => {
    if (!isCustomPaletteMode) {
      toggleCustomPaletteMode();
    }
    setViewMode('overview');
  }, [isCustomPaletteMode, toggleCustomPaletteMode]);



  // Vista de resumen cuando no está en modo paletas personalizadas
  if (!isCustomPaletteMode) {
    return (
      <TooltipProvider>
        <motion.div
          className={`space-y-4 ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header simplificado */}
          <div className="flex items-center justify-between">
            {customPalettes.length > 0 && (
              <Badge variant="secondary">
                {customPalettes.length} paletas guardadas
              </Badge>
            )}
          </div>

          {/* Estadísticas rápidas */}
          {customPalettes.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                className="rounded-lg p-3 bg-slate-800 border border-slate-700"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-lg font-semibold text-white">
                  {customPalettes.length}
                </div>
                <div className="text-xs text-slate-400">
                  Paletas guardadas
                </div>
              </motion.div>
              <motion.div 
                className="rounded-lg p-3 bg-slate-800 border border-slate-700"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-lg font-semibold text-white">
                  {customPalettes.reduce((total, palette) => total + palette.colors.length, 0)}
                </div>
                <div className="text-xs text-slate-400">
                  Colores totales
                </div>
              </motion.div>
            </div>
          )}

          {/* Paletas recientes */}
          {customPalettes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">
                Paletas recientes
              </h4>
              <div className="space-y-2">
                {customPalettes.slice(0, 3).map((palette) => (
                  <motion.div
                    key={palette.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 bg-slate-800 border border-slate-700 hover:bg-slate-700"
                    onClick={() => selectCustomPalette(palette.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex -space-x-1">
                      {palette.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-5 h-5 rounded-full border-2 border-slate-900"
                          style={{ backgroundColor: color.value?.hex || '#666666' }}
                        />
                      ))}
                      {palette.colors.length > 4 && (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center bg-slate-700">
                          <span className="text-xs text-slate-400">
                            +{palette.colors.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-white">
                        {palette.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {palette.colors.length} colores
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-2">
            <Button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 bg-slate-700 text-white shadow hover:bg-slate-600"
            >
              <Plus className="w-4 h-4" />
              Nueva Paleta
            </Button>
            
            {customPalettes.length > 0 && (
              <Button
                variant="outline"
                onClick={handleActivateCustomMode}
                className="w-full flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <Layers className="w-4 h-4" />
                Gestionar Paletas
              </Button>
            )}
          </div>


        </motion.div>
      </TooltipProvider>
    );
  }

  // Vista completa cuando está en modo paletas personalizadas
  return (
    <TooltipProvider>
      <motion.div
        className={`space-y-4 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewMode !== 'overview' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackFromBuilder}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Volver</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-white">
                  {viewMode === 'builder' 
                    ? (editingPaletteId ? 'Editar Paleta' : 'Nueva Paleta')
                    : 'Gestión de Paletas'
                  }
                </h3>
                <p className="text-sm text-slate-400">
                  {viewMode === 'builder' 
                    ? 'Arrastra para reordenar colores'
                    : `${customPalettes.length} paletas guardadas`
                  }
                </p>
              </div>
            </div>
          </div>

          {viewMode === 'overview' && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear nueva</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCustomPaletteMode}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Volver al modo normal</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Contenido dinámico */}
        <AnimatePresence mode="wait">
          {viewMode === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CustomPaletteBuilder
                onSave={handleBackFromBuilder}
                onCancel={handleBackFromBuilder}
              />
            </motion.div>
          )}

          {viewMode === 'overview' && (
            <motion.div
              key="manager"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PaletteManager
                onCreateNew={handleCreateNew}
                onEditPalette={handleEditPalette}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};