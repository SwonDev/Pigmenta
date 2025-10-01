import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Trash2, 
  Copy, 
  Edit3, 
  GripVertical, 
  Eye, 
  EyeOff,
  Palette,
  Check,
  X
} from 'lucide-react';
import { CustomColor } from '@/types';
import { CustomColorUtils } from '@/utils/customColorUtils';
import { parseColorInput } from '@/utils/colorUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface ColorSlotProps {
  color: CustomColor;
  index: number;
  isSelected?: boolean;
  isEditing?: boolean;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onUpdate?: (updates: Partial<CustomColor>) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onSelect?: () => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  className?: string;
}

export const ColorSlot: React.FC<ColorSlotProps> = ({
  color,
  index,
  isSelected = false,
  isEditing = false,
  showControls = true,
  size = 'md',
  onUpdate,
  onRemove,
  onDuplicate,
  onSelect,
  onStartEdit,
  onEndEdit,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [editName, setEditName] = useState(color.name);
  const [editValue, setEditValue] = useState(color.value.hex);
  const [isVisible, setIsVisible] = useState(color.isVisible ?? true);

  // Configuración de drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: color.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Obtener el mejor color de texto para el contraste
  const textColor = color.value && color.value.rgb 
    ? CustomColorUtils.getBestTextColor(color.value).hex 
    : '#000000'; // Color por defecto si no hay valor válido
  
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      text: 'text-xs',
      controls: 'text-xs',
      spacing: 'gap-1'
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-sm',
      controls: 'text-sm',
      spacing: 'gap-2'
    },
    lg: {
      container: 'w-20 h-20',
      text: 'text-base',
      controls: 'text-base',
      spacing: 'gap-3'
    }
  };

  const config = sizeConfig[size];

  // Manejar actualización de nombre
  const handleNameSubmit = useCallback(() => {
    if (editName.trim() && editName !== color.name) {
      onUpdate?.({ name: editName.trim() });
    }
    onEndEdit?.();
  }, [editName, color.name, onUpdate, onEndEdit]);

  // Manejar actualización de valor
  const handleValueSubmit = useCallback(() => {
    if (editValue !== color.value.hex) {
      const newColorValue = parseColorInput(editValue);
      if (newColorValue && CustomColorUtils.validateColor(newColorValue)) {
        onUpdate?.({ value: newColorValue });
      } else {
        setEditValue(color.value.hex); // Revertir si no es válido
      }
    }
    onEndEdit?.();
  }, [editValue, color.value, onUpdate, onEndEdit]);

  // Manejar cancelación de edición
  const handleCancelEdit = useCallback(() => {
    setEditName(color.name);
    setEditValue(color.value.hex);
    onEndEdit?.();
  }, [color.name, color.value, onEndEdit]);

  // Toggle visibilidad
  const handleToggleVisibility = useCallback(() => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onUpdate?.({ isVisible: newVisibility });
  }, [isVisible, onUpdate]);

  return (
    <TooltipProvider>
      <motion.div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : 1 
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor principal del color */}
      <div
        className={`
          ${config.container}
          relative rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${isSelected ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-600'}
          ${isDragging ? 'shadow-lg z-50' : 'shadow-sm'}
          ${!isVisible ? 'opacity-50' : ''}
        `}
        style={{ backgroundColor: color.value.hex }}
        onClick={onSelect}
      >
        {/* Handle de drag */}
        {showControls && (
          <div
            {...attributes}
            {...listeners}
            className="absolute -top-1 -left-1 p-1 bg-slate-800 border border-slate-700 rounded-full shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-3 h-3 text-slate-400" />
          </div>
        )}

        {/* Indicador de posición */}
        <div 
          className={`
            absolute top-1 right-1 ${config.text} font-mono font-bold px-1 py-0.5 rounded
            bg-black/20 backdrop-blur-sm
          `}
          style={{ color: textColor }}
        >
          {index + 1}
        </div>

        {/* Indicador de visibilidad */}
        {!isVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <EyeOff className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Información del color */}
      <div className={`mt-2 ${config.spacing}`}>
        {/* Nombre del color */}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className={`${config.text} h-6 px-2 bg-slate-700 border-slate-600 text-white`}
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNameSubmit}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`${config.text} font-medium text-center truncate cursor-pointer text-white hover:text-blue-400 transition-colors`}
                onClick={onStartEdit}
              >
                {color.name}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar nombre: {color.name}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Valor del color */}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleValueSubmit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className={`${config.text} h-6 px-2 font-mono bg-slate-700 border-slate-600 text-white`}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleValueSubmit}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Check className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`${config.text} font-mono text-center text-slate-400 cursor-pointer hover:text-blue-400 transition-colors`}
                onClick={() => navigator.clipboard.writeText(color.value.hex)}
              >
                {color.value.hex}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar valor: {color.value.hex}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Controles flotantes */}
      <AnimatePresence>
        {showControls && (isHovered || isSelected) && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onStartEdit}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDuplicate}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicar</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleToggleVisibility}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVisible ? "Ocultar" : "Mostrar"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRemove}
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Información adicional en hover */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800 text-white text-xs rounded-md border border-slate-700 px-2 py-1 whitespace-nowrap z-50 shadow-md"
          >
            <div>Posición: {color.position + 1}</div>
            <div>Contraste: {CustomColorUtils.calculateContrast(color.value, { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 }, oklch: { l: 1, c: 0, h: 0 } }).toFixed(2)}</div>
            {color.metadata?.source && (
              <div>Origen: {color.metadata.source}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};