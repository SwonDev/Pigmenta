import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List, 
  Download, 
  Upload,
  Trash2,
  Plus,
  Star,
  Calendar,
  Palette,
  Tag,
  MoreVertical,
  X
} from 'lucide-react';
import { usePaletteManager } from '@/hooks/usePaletteManager';
import { PaletteCard } from './PaletteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SortOption } from '@/types';

interface PaletteManagerProps {
  onCreateNew?: () => void;
  onEditPalette?: (paletteId: string) => void;
  className?: string;
}

export const PaletteManager: React.FC<PaletteManagerProps> = ({
  onCreateNew,
  onEditPalette,
  className = ''
}) => {
  const {
    palettes,
    filteredPalettes,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filters,
    updateTagFilters,
    clearFilters,
    stats,
    availableTags,
    selectedPalettes,
    handleSelectPalette,
    clearSelection,
    handleDeleteSelectedPalettes,
    exportSelectedPalettes,
    handleFileImport,
    handleExport,
    handleEditPalette,
    handleDuplicatePalette,
    handleDeletePalette
  } = usePaletteManager({ onEditPalette });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Referencia para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = useCallback(() => {
    onCreateNew?.();
  }, [onCreateNew]);

  // Función para activar el input de archivo
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Controles de búsqueda y filtros */}
        <div className="space-y-4">
          {/* Controles de búsqueda y filtros */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Búsqueda */}
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar paletas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>

            {/* Controles */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 lg:flex-shrink-0">
              {/* Filtros */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`bg-slate-700 border-slate-600 text-white hover:bg-slate-600 ${
                      showFilters ? 'bg-slate-600' : ''
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                  <p>Filtros</p>
                </TooltipContent>
              </Tooltip>

              {/* Ordenamiento */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="date-desc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="truncate">Fecha (más reciente)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="date-asc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="truncate">Fecha (más antigua)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created-desc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="truncate">Creación (reciente)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created-asc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="truncate">Creación (antigua)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name-asc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <span className="truncate">Nombre (A-Z)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="name-desc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <SortDesc className="w-4 h-4 mr-2" />
                      <span className="truncate">Nombre (Z-A)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="colors-desc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <Palette className="w-4 h-4 mr-2" />
                      <span className="truncate">Más colores</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="colors-asc" className="text-white hover:bg-slate-700">
                    <div className="flex items-center">
                      <Palette className="w-4 h-4 mr-2" />
                      <span className="truncate">Menos colores</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Vista */}
              <div className="flex items-center bg-slate-700 border border-slate-600 rounded-md shrink-0 w-[72px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 h-8 w-9 shrink-0 rounded-r-none border-r-0 ${
                    viewMode === 'grid' 
                      ? 'bg-slate-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 h-8 w-9 shrink-0 rounded-l-none border-l border-slate-600 ${
                    viewMode === 'list' 
                      ? 'bg-slate-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Acciones masivas */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {selectedPalettes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {selectedPalettes.length} seleccionadas
                </span>
                
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  <AnimatePresence>
                    {showBulkActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute right-0 top-full mt-1 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1 z-50 min-w-[150px] max-w-[200px]"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleExport}
                          className="w-full justify-start px-3 py-2 h-auto text-white hover:bg-slate-700"
                        >
                          <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Exportar</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          className="w-full justify-start px-3 py-2 h-auto text-white hover:bg-slate-700"
                        >
                          <X className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Deseleccionar</span>
                        </Button>
                        
                        <div className="border-t border-slate-700 my-1" />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`¿Eliminar ${selectedPalettes.length} paletas seleccionadas?`)) {
                              handleDeleteSelectedPalettes();
                            }
                          }}
                          className="w-full justify-start px-3 py-2 h-auto text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Eliminar</span>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Importar/Exportar */}
            <div className="flex items-center gap-1 justify-end">
              {/* Input oculto para importar archivos */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUploadClick}
                    className="cursor-pointer bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                  <p>Importar paletas</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700 text-white">
                  <p>Exportar todas</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/50 rounded-lg p-4 space-y-4 border border-slate-700"
            >
              {/* Filtro por tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Filtrar por etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        filters.tags.includes(tag)
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                          : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white'
                      }`}
                      onClick={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        updateTagFilters(newTags);
                      }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Acciones de filtros */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Limpiar filtros
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista/Grid de paletas */}
        <div className="space-y-4">
          {filteredPalettes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 text-slate-400"
            >
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2 text-white">
                {stats.total === 0 ? 'No tienes paletas guardadas' : 'No se encontraron paletas'}
              </p>
              <p className="text-sm mb-4">
                {stats.total === 0 
                  ? 'Crea tu primera paleta personalizada para comenzar'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {stats.total === 0 && (
                <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera paleta
                </Button>
              )}
            </motion.div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
              {filteredPalettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  isSelected={selectedPalettes.includes(palette.id)}
                  size={viewMode === 'list' ? 'sm' : 'md'}
                  onSelect={() => handleSelectPalette(palette.id)}
                  onEdit={() => handleEditPalette(palette.id)}
                  onDuplicate={() => handleDuplicatePalette(palette.id)}
                  onDelete={() => handleDeletePalette(palette.id)}
                  onExport={() => exportSelectedPalettes()}
                  className={
                    selectedPalettes.includes(palette.id)
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {stats.total > 0 && (
          <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-700">
            Mostrando {stats.filtered} de {stats.total} paletas
            {stats.selected > 0 && (
              <span> • {stats.selected} seleccionadas</span>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};