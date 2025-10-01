import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Save, 
  Trash2, 
  Shuffle, 
  Import, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Palette,
  Tag,
  Type
} from 'lucide-react';
import { usePaletteBuilder } from '@/hooks/usePaletteBuilder';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { ColorSlot } from './ColorSlot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ColorPicker } from '@/components/ColorPicker';
import { useAppStore } from '@/stores/useAppStore';
import { DESIGN_TOKENS, DARK_THEME_COLORS } from '@/constants/designTokens';

interface CustomPaletteBuilderProps {
  className?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const CustomPaletteBuilder: React.FC<CustomPaletteBuilderProps> = ({
  className = '',
  onSave,
  onCancel
}) => {
  const {
    state,
    validation,
    canSave,
    isEditing,
    addColor,
    addColorAtPosition,
    removeColor,
    updateColor,
    reorderColors,
    duplicateColor,
    updateName,
    updateDescription,
    addTag,
    removeTag,
    clear,
    save,
    importFromAutomaticPalette,
    generateRandomColors
  } = usePaletteBuilder();

  const {
    getDragContextProps,
    getSortableContextProps,
    getDragOverlayProps,
    DndContext,
    SortableContext,
    DragOverlay,
    draggedItem
  } = useDragAndDrop(
    state.colors,
    reorderColors
  );

  // Estado local
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  // Hook del tema
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  // Manejar adición de color
  const handleAddColor = useCallback((color: string, position?: number) => {
    if (position !== undefined) {
      addColorAtPosition(color, position);
    } else {
      addColor(color);
    }
    setShowColorPicker(false);
    setColorPickerPosition(null);
  }, [addColor, addColorAtPosition]);

  // Manejar confirmación del color seleccionado
  const handleConfirmColor = useCallback(() => {
    handleAddColor(selectedColor, colorPickerPosition || undefined);
  }, [selectedColor, colorPickerPosition, handleAddColor]);

  // Manejar actualización de color
  const handleUpdateColor = useCallback((colorId: string, updates: any) => {
    updateColor(colorId, updates);
  }, [updateColor]);

  // Manejar eliminación de color
  const handleRemoveColor = useCallback((colorId: string) => {
    removeColor(colorId);
    if (selectedColorId === colorId) {
      setSelectedColorId(null);
    }
    if (editingColorId === colorId) {
      setEditingColorId(null);
    }
  }, [removeColor, selectedColorId, editingColorId]);

  // Manejar duplicación de color
  const handleDuplicateColor = useCallback((colorId: string) => {
    duplicateColor(colorId);
  }, [duplicateColor]);

  // Manejar adición de tag
  const handleAddTag = useCallback(() => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  }, [newTag, addTag]);

  // Manejar guardado
  const handleSave = useCallback(async () => {
    const success = await save();
    if (success) {
      // Mostrar notificación de éxito
      console.log('Paleta guardada exitosamente');
      onSave?.();
    }
  }, [save, onSave]);

  // Mostrar color picker en posición específica
  const showColorPickerAt = useCallback((position: number) => {
    setColorPickerPosition(position);
    setShowColorPicker(true);
  }, []);

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
      {/* Herramientas de acción */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={importFromAutomaticPalette}
                className="border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <Import className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Importar desde paleta automática</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateRandomColors(5)}
                className="border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generar colores aleatorios</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-slate-600 hover:border-slate-500 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpiar todo</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Información de la paleta */}
      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary }}>
            <Type className="w-4 h-4 inline mr-1" />
            Nombre de la paleta
          </label>
          <Input
            value={state.name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="Ej: Paleta de verano, Colores corporativos..."
            className={`bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 ${
              validation.errors.some(e => e.field === 'name') ? 'border-red-500' : ''
            }`}
          />
          {validation.errors.some(e => e.field === 'name') && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {validation.errors.find(e => e.field === 'name')?.message}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary }}>
            Descripción (opcional)
          </label>
          <Textarea
            value={state.description}
            onChange={(e) => updateDescription(e.target.value)}
            placeholder="Describe el uso o inspiración de esta paleta..."
            rows={2}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary }}>
            <Tag className="w-4 h-4 inline mr-1" />
            Etiquetas
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {state.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer bg-slate-700 text-slate-300 hover:bg-red-900/50 hover:text-red-300 transition-colors border-slate-600"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Agregar etiqueta..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
            />
            <Button
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Área de colores con drag & drop */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-md font-medium" style={{ color: DESIGN_TOKENS.colors.text.primary }}>
            Colores ({state.colors.length})
          </h3>
          <Button
            onClick={() => setShowColorPicker(true)}
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Agregar Color
          </Button>
        </div>

        {/* Grid de colores */}
        <DndContext {...getDragContextProps()}>
          <SortableContext {...getSortableContextProps()}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {state.colors.map((color, index) => (
                <ColorSlot
                  key={color.id}
                  color={color}
                  index={index}
                  isSelected={selectedColorId === color.id}
                  isEditing={editingColorId === color.id}
                  onUpdate={(updates) => handleUpdateColor(color.id, updates)}
                  onRemove={() => handleRemoveColor(color.id)}
                  onDuplicate={() => handleDuplicateColor(color.id)}
                  onSelect={() => setSelectedColorId(color.id)}
                  onStartEdit={() => setEditingColorId(color.id)}
                  onEndEdit={() => setEditingColorId(null)}
                />
              ))}
              
              {/* Slot para agregar nuevo color */}
              <motion.div
                className="w-full aspect-square min-h-[60px] border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowColorPicker(true)}
              >
                <Plus className="w-6 h-6 text-slate-400" />
              </motion.div>
            </div>
          </SortableContext>

          {/* Overlay para drag */}
          <DragOverlay {...getDragOverlayProps()}>
            {draggedItem && (
              <ColorSlot
                color={draggedItem}
                index={0}
                showControls={false}
                className="opacity-90 transform rotate-3"
              />
            )}
          </DragOverlay>
        </DndContext>

        {/* Mensaje cuando no hay colores */}
        {state.colors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 sm:py-12"
          >
            <Palette className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50 text-slate-400" />
            <p className="text-base sm:text-lg font-medium mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary }}>
              Tu paleta está vacía
            </p>
            <p className="text-sm mb-4 text-slate-400 px-4">
              Agrega colores para comenzar a crear tu paleta personalizada
            </p>
            <Button 
              onClick={() => setShowColorPicker(true)} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer color
            </Button>
          </motion.div>
        )}
      </div>

      {/* Validación y errores */}
      {validation.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="font-medium text-red-300">
              Errores encontrados:
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
            {validation.errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Advertencias */}
      {validation.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="font-medium text-yellow-300">
              Advertencias:
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-300">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning.message}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Acciones de guardado */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-400">
          {validation.isValid ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-center sm:text-left">
                <span className="hidden sm:inline">Paleta válida y lista para guardar</span>
                <span className="sm:hidden">Lista para guardar</span>
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-center sm:text-left">
                <span className="hidden sm:inline">Corrige los errores para poder guardar</span>
                <span className="sm:hidden">Corrige errores</span>
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1 border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              Cancelar
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={clear}
            disabled={state.colors.length === 0}
            className="w-full sm:w-auto order-3 sm:order-2 border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-50"
          >
            Limpiar
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!canSave || state.saveState.isSaving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white"
          >
            {state.saveState.isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Actualizar' : 'Guardar'} Paleta
          </Button>
        </div>
      </div>

      {/* Modal de selección de color */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowColorPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">
                Seleccionar Color
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">
                    Color
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-12 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                  />
                  <div className="mt-2 text-xs font-mono text-center p-2 rounded bg-slate-700 text-slate-300 border border-slate-600">
                    {selectedColor}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="w-full sm:w-auto order-2 sm:order-1 px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmColor}
                  className="w-full sm:w-auto order-1 sm:order-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};