import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  Eye,
  Calendar,
  Palette,
  Tag,
  Star,
  StarOff
} from 'lucide-react';
import { CustomPalette } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { CustomColorUtils } from '@/utils/customColorUtils';

interface PaletteCardProps {
  palette: CustomPalette;
  isSelected?: boolean;
  isFavorite?: boolean;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onSelect?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({
  palette,
  isSelected = false,
  isFavorite = false,
  showActions = true,
  size = 'md',
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onToggleFavorite,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: 'p-2 sm:p-3',
      colorHeight: 'h-6 sm:h-8',
      title: 'text-xs sm:text-sm',
      subtitle: 'text-xs',
      spacing: 'gap-1 sm:gap-2'
    },
    md: {
      container: 'p-3 sm:p-4',
      colorHeight: 'h-8 sm:h-12',
      title: 'text-sm sm:text-base',
      subtitle: 'text-xs sm:text-sm',
      spacing: 'gap-2 sm:gap-3'
    },
    lg: {
      container: 'p-4 sm:p-6',
      colorHeight: 'h-12 sm:h-16',
      title: 'text-base sm:text-lg',
      subtitle: 'text-sm sm:text-base',
      spacing: 'gap-3 sm:gap-4'
    }
  };

  const config = sizeConfig[size];

  // Formatear fecha
  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }, []);

  // Obtener colores visibles (todos los colores son visibles por defecto)
  const visibleColors = palette.colors;

  // Calcular estadísticas
  const stats = {
    totalColors: palette.colors.length,
    visibleColors: visibleColors.length,
    averageContrast: visibleColors.length > 0 
      ? visibleColors.reduce((sum, color) => 
          sum + CustomColorUtils.calculateContrast(color.value, { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 }, oklch: { l: 1, c: 0, h: 0 } }), 0
        ) / visibleColors.length
      : 0
  };

  return (
    <TooltipProvider>
      <motion.div
      className={`
        relative bg-slate-800 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-800' : 'border-slate-700'}
        ${isHovered ? 'shadow-lg' : 'shadow-sm'}
        ${config.container}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Header con título y acciones */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className={`${config.title} font-semibold text-white truncate`}>
            {palette.name}
          </h3>
          {palette.description && (
            <p className={`${config.subtitle} text-slate-400 mt-1 line-clamp-2 break-words`}>
              {palette.description}
            </p>
          )}
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="flex items-center gap-1 ml-1 flex-shrink-0">
            {/* Favorito */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isFavorite ? (
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Menú de acciones */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1 z-50 min-w-[120px] sm:min-w-[150px] max-w-[180px]"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit?.();
                      }}
                      className="w-full justify-start px-2 sm:px-3 py-1 sm:py-2 h-auto text-xs sm:text-sm"
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Editar</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDuplicate?.();
                      }}
                      className="w-full justify-start px-2 sm:px-3 py-1 sm:py-2 h-auto text-xs sm:text-sm"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Duplicar</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onExport?.();
                      }}
                      className="w-full justify-start px-2 sm:px-3 py-1 sm:py-2 h-auto text-xs sm:text-sm"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Exportar</span>
                    </Button>
                    
                    <div className="border-t border-slate-700 my-1" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete?.();
                      }}
                      className="w-full justify-start px-2 sm:px-3 py-1 sm:py-2 h-auto text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Eliminar</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Preview de colores */}
      <div className={`${config.spacing} mb-2 sm:mb-3`}>
        <div className={`flex rounded-lg overflow-hidden ${config.colorHeight}`}>
          {visibleColors.slice(0, 8).map((color, index) => (
            <Tooltip key={color.id}>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 transition-all duration-200 hover:scale-105 hover:z-10 relative min-w-0"
                  style={{ backgroundColor: color.value.hex }}
                >
                  {/* Indicador de más colores */}
                  {index === 7 && palette.colors.length > 8 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                      <span className="text-xs sm:text-sm">+{palette.colors.length - 8}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{color.name || 'Color'}: {color.value.hex}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Tags */}
      {palette.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3 overflow-hidden">
          {palette.tags.slice(0, 2).map((tag) => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            const tagKey = typeof tag === 'string' ? tag : tag.id;
            return (
              <Badge key={tagKey} variant="secondary" className="text-xs truncate max-w-[80px] sm:max-w-[100px]">
                {tagName}
              </Badge>
            );
          })}
          {palette.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{palette.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Palette className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">{stats.totalColors}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número de colores</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 min-w-0">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs truncate">{formatDate(new Date(palette.metadata?.updatedAt || palette.updatedAt))}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fecha de actualización</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Indicador de selección */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
          />
        )}
      </div>

      {/* Overlay de hover con estadísticas */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center text-white p-2 sm:p-4"
          >
            <div className="text-center space-y-1 sm:space-y-2 max-w-full">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Vista previa</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <div className="font-medium text-sm sm:text-base">{stats.totalColors}</div>
                  <div className="text-xs opacity-75 truncate">Colores totales</div>
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">{stats.visibleColors}</div>
                  <div className="text-xs opacity-75 truncate">Visibles</div>
                </div>
                <div className="col-span-2">
                  <div className="font-medium text-sm sm:text-base">{stats.averageContrast.toFixed(1)}</div>
                  <div className="text-xs opacity-75 truncate">Contraste promedio</div>
                </div>
              </div>
              
              <div className="text-xs opacity-75 mt-2 sm:mt-3 truncate">
                Haz clic para seleccionar
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};